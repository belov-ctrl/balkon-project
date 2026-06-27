import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, quizAnswers } = body;

    // 1. Формируем подробный текст для примечания (оставляем твою рабочую логику)
    let noteText = 'Заявка с сайта Next.js\n\n';
    if (Array.isArray(quizAnswers)) {
      noteText += quizAnswers.join('\n');
    } else if (typeof quizAnswers === 'object' && quizAnswers !== null) {
      noteText += Object.entries(quizAnswers)
        .map(([question, answer]) => `${question}: ${answer}`)
        .join('\n');
    } else {
      noteText += quizAnswers || 'Клиент не заполнил шаги квиза';
    }

    // 2. Делаем краткую выжимку для названия сделки (чтобы суть была видна на Канбане)
    let answersSummary = '';
    if (Array.isArray(quizAnswers)) {
      // Для квиза: убираем названия вопросов "Тип балкона: ", оставляя только чистые ответы "Лоджия ➔ 320х150 см"
      answersSummary = quizAnswers
        .map(item => item.includes(': ') ? item.split(': ')[1] : item)
        .join(' ➔ ');
    } else {
      // Для обычных форм (шапка, форма у карты): берем текст как есть
      answersSummary = quizAnswers || 'Прямая заявка';
    }

    // Проверяем, указал ли клиент имя
    const clientName = name && name !== 'Имя не указано' ? `${name} | ` : '';

    // 🔥 ЖЕЛЕЗОБЕТОННЫЙ МЕТОД: Формируем супер-информативное название сделки.
    // Теперь телефон никогда не потеряется, так как название сделки amoCRM принимает всегда!
    const ultimateTitle = `📞 ${phone || 'Номер не указан'} | ${clientName}${answersSummary}`;

    const amoFormData = new URLSearchParams();
    amoFormData.append('form_id', '1726026');
    amoFormData.append('hash', '103318850eff6ebf324c41192541b1c6');
    amoFormData.append('locale', 'ru');
    
    // Передаем сгенерированное название сделки с телефоном внутри
    amoFormData.append('fields[name_1]', ultimateTitle);
    amoFormData.append('fields[note_1]', noteText);

    // На всякий случай дублируем телефон в стандартный ключ
    amoFormData.append('fields[phone_1]', phone || 'Не указано');

    const amoResponse = await fetch('https://forms.amocrm.ru/queue/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: amoFormData.toString(),
    });

    const amoTextResponse = await amoResponse.text();
    
    // Логгер оставляем — он покажет в консоли PM2, что именно думает amoCRM
    console.log('📢 ОТВЕТ ОТ СЕРВЕРА AMOCRM:', amoTextResponse);

    if (!amoResponse.ok) {
      console.error('⚠️ Критическая ошибка статуса amoCRM:', amoTextResponse);
      return NextResponse.json({ success: false, error: amoTextResponse }, { status: 500 });
    }

    return NextResponse.json({ success: true, amoResult: amoTextResponse });
  } catch (error) {
    console.error('Критическая ошибка отправки лида:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}