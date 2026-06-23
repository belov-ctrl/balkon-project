import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Получаем данные, которые клиент ввел на сайте
    const { name, phone, source } = await request.json();

    // =========================================================================
    // ЭТАП 1: ХРАНЕНИЕ БЭКАПА В СОБСТВЕННОЙ АДМИНКЕ (STRAPI v5)
    // =========================================================================
    try {
      // По правилам Strapi v5 данные отправляются в объекте { data: { ... } }
      await fetch('http://localhost:1337/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            name: name || 'Имя не указано',
            phone: phone,
            source: source || 'Форма на сайте'
          }
        })
      });
      console.log('🎉 Лид успешно зафиксирован внутри админки Strapi!');
    } catch (strapiError) {
      console.error('🚨 Ошибка сохранения бэкапа в Strapi:', strapiError);
    }

    // =========================================================================
    // ЭТАП 2: ОТПРАВКА В AMOCRM (РАБОТАЕТ, КОГДА ЕСТЬ КЛЮЧИ)
    // =========================================================================
    const subdomain = process.env.AMOCRM_SUBDOMAIN;
    const token = process.env.AMOCRM_ACCESS_TOKEN;
    const statusId = process.env.AMOCRM_STATUS_ID;

    // Если токен еще не настроен (наш случай до завтра) — просто выходим с успехом
    if (!subdomain || !token || token === 'тут_будет_длинный_токен' || token.startsWith('тут_будет')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Заявка сохранена в админку Strapi! (amoCRM ожидает настройки токена).' 
      });
    }

    // Если ключи на месте — отправляем в amoCRM строго в нужный этап воронки
    const amoUrl = `https://${subdomain}.amocrm.ru/api/v4/leads/complex`;
    const body = [
      {
        name: `Заявка: ${source ? source.substring(0, 40) + '...' : 'Сайт балконов'}`,
        status_id: parseInt(statusId || '0'),
        _embedded: {
          contacts: [
            {
              first_name: name || 'Клиент с сайта',
              custom_fields_values: [
                {
                  field_code: 'PHONE',
                  values: [
                    {
                      value: phone,
                      enum_code: 'MOB'
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    ];

    const amoResponse = await fetch(amoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!amoResponse.ok) {
      const errorData = await amoResponse.text();
      console.error('Ошибка ответа amoCRM API:', errorData);
      return NextResponse.json({ success: true, warning: 'Сохранено в базу, но CRM временно недоступна' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Критическая системная ошибка обработчика лидов:', error);
    return NextResponse.json({ success: false, error: 'Внутренняя ошибка сервера Next.js' }, { status: 500 });
  }
}