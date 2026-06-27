import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, quizAnswers } = body;

    // Сюда мы подставили системный ID телефона и твой личный ID для "Ваше имя"
    const ID_FIELDS_PHONE = '21303';   // Глобальный системный ID поля "Телефон" в amoCRM
    const ID_FIELDS_NAME = '1063775';  // Найденный ID твоего поля "Ваше имя"

    // Формируем подробный текст для ленты примечаний карточки
    let noteText = 'Заявка с сайта Next.js\n\n';
    if (Array.isArray(quizAnswers)) {
      noteText += quizAnswers.join('\n');
    } else {
      noteText += quizAnswers || 'Клиент не заполнил шаги квиза';
    }

    // Краткая выжимка ответов для бронебойного названия на Канбан-доске
    let answersSummary = '';
    if (Array.isArray(quizAnswers)) {
      answersSummary = quizAnswers
        .map(item => item.includes(': ') ? item.split(': ')[1] : item)
        .join(' ➔ ');
    } else {
      answersSummary = quizAnswers || 'Прямая заявка';
    }

    const clientName = name && name !== 'Имя не указано' ? `${name} | ` : '';
    const ultimateTitle = `📞 ${phone || 'Номер не указан'} | ${clientName}${answersSummary}`;

    const amoFormData = new URLSearchParams();
    amoFormData.append('form_id', '1726026');
    amoFormData.append('hash', '103318850eff6ebf324c41192541b1c6');
    amoFormData.append('locale', 'ru');
    
    // Оставляем информативное название сделки для общей доски Канбана
    amoFormData.append('fields[name_1]', ultimateTitle);
    amoFormData.append('fields[note_1]', noteText);

    // Точечно распределяем имя и телефон по графам контакта через массив кастомных полей [cf]
    amoFormData.append(`fields[cf][${ID_FIELDS_NAME}]`, name || 'Имя не указано');
    amoFormData.append(`fields[cf][${ID_FIELDS_PHONE}]`, phone || 'Не указано');

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