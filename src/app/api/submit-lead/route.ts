import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, quizAnswers } = body;

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

    const amoFormData = new URLSearchParams();
    amoFormData.append('form_id', '1726026');
    amoFormData.append('hash', '103318850eff6ebf324c41192541b1c6');
    amoFormData.append('locale', 'ru'); // Добавили локаль из оригинального скрипта
    amoFormData.append('fields[name_1]', name || 'Имя не указано');
    amoFormData.append('fields[phone_1]', phone || 'Не указано');
    amoFormData.append('fields[note_1]', noteText);

    const amoResponse = await fetch('https://forms.amocrm.ru/queue/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: amoFormData.toString(),
    });

    const amoTextResponse = await amoResponse.text();
    
    // ЭТОТ ЛОГ ВЫВЕДЕТ НАСТОЯЩИЙ ВЕРДИКТ AMOCRM ПРЯМО В КОНСОЛЬ PM2!
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