import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // name - имя, phone - телефон, quizAnswers - массив или строка с ответами квиза
    const { name, phone, quizAnswers } = body;

    // Красиво форматируем ответы квиза для передачи в поле "Примечание"
    let noteText = 'Заявка с калькулятора Next.js\n\n';
    if (Array.isArray(quizAnswers)) {
      noteText += quizAnswers.join('\n');
    } else if (typeof quizAnswers === 'object') {
      noteText += Object.entries(quizAnswers)
        .map(([question, answer]) => `${question}: ${answer}`)
        .join('\n');
    } else {
      noteText += quizAnswers || 'Клиент не заполнил шаги квиза';
    }

    // Собираем данные в формате x-www-form-urlencoded, который требует amoCRM
    const amoFormData = new URLSearchParams();
    amoFormData.append('form_id', '1726026');
    amoFormData.append('hash', '103318850eff6ebf324c41192541b1c6');
    amoFormData.append('fields[name_1]', name || 'Имя не указано');
    amoFormData.append('fields[phone_1]', phone || 'Не указано');
    amoFormData.append('fields[note_1]', noteText); // Передаем квиз в примечание

    // Отправляем скрытый запрос напрямую в очередь amoCRM
    const amoResponse = await fetch('https://forms.amocrm.ru/queue/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: amoFormData.toString(),
    });

    if (!amoResponse.ok) {
      console.error('Ошибка ответа от amoCRM:', await amoResponse.text());
    }

    return NextResponse.json({ success: true, message: 'Lead successfully sent to amoCRM' });
  } catch (error) {
    console.error('Критическая ошибка отправки лида:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}