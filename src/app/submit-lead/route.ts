import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, quizAnswers } = body;

    // 🔥 ШАГ 1: Жесткая очистка телефона от скобок, дефисов и пробелов.
    // Из "+7 (927) 771-00-52" делаем чистые цифры "79277710052" для обхода валидатора amoCRM
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    // Формируем подробный текст для ленты примечаний (комментариев) карточки
    let noteText = 'Заявка с сайта Next.js\n\n';
    if (Array.isArray(quizAnswers)) {
      noteText += quizAnswers.join('\n');
    } else {
      noteText += quizAnswers || 'Клиент не заполнил шаги квиза';
    }

    // Краткая выжимка ответов для красивого заголовка сделки
    let answersSummary = '';
    if (Array.isArray(quizAnswers)) {
      answersSummary = quizAnswers
        .map(item => item.includes(': ') ? item.split(': ')[1] : item)
        .join(' ➔ ');
    } else {
      answersSummary = quizAnswers || 'Прямая заявка';
    }

    // Формируем заголовок для Канбан-доски, а детальный лог дублируем в начало примечания
    const ultimateTitle = `📞 +${cleanPhone} | ${name || 'Аноним'} | ${answersSummary}`;
    const fullNote = `${ultimateTitle}\n\n${noteText}`;

    const amoFormData = new URLSearchParams();
    amoFormData.append('form_id', '1726026');
    amoFormData.append('hash', '103318850eff6ebf324c41192541b1c6');
    amoFormData.append('locale', 'ru');
    
    // Передаем заголовок сделки и развернутое примечание
    amoFormData.append('fields[name_1]', ultimateTitle);
    amoFormData.append('fields[note_1]', fullNote);

    // 🔥 ШАГ 2: Передаем имя и очищенный телефон в стандартные кубики веб-формы
    amoFormData.append('fields[name]', name || 'Имя не указано'); 
    amoFormData.append('fields[phone_1]', cleanPhone ? `+${cleanPhone}` : 'Не указано');

    const amoResponse = await fetch('https://forms.amocrm.ru/queue/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: amoFormData.toString(),
    });

    const amoTextResponse = await amoResponse.text();
    console.log('📢 ОТВЕТ ОТ СЕРВЕРА AMOCRM:', amoTextResponse);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Критическая ошибка отправки лида:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}