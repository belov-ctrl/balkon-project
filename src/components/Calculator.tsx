'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CalculatorProps {
  isModal?: boolean;
  onClose?: () => void;
}

export default function Calculator({ isModal = false, onClose }: CalculatorProps) {
  const router = useRouter(); 
  const [calcStep, setCalcStep] = useState(1);
  const [calcType, setCalcType] = useState('Лоджия');
  const [calcWidth, setCalcWidth] = useState(320);
  const [calcHeight, setCalcHeight] = useState(150);
  const [calcGlazing, setCalcGlazing] = useState('Раздвижное алюминиевое');
  const [calcWelding, setCalcWelding] = useState('Не нужны');
  const [calcFinish, setCalcFinish] = useState('Без обшивки');
  const [calcInsulation, setCalcInsulation] = useState('Без утепления');
  const [calcAdditional, setCalcAdditional] = useState('Ничего');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDiscount = (calcStep - 1) * 300 > 1500 ? 1500 : (calcStep - 1) * 300;
  const progressPercent = Math.round((calcStep / 7) * 100);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.startsWith('7') || input.startsWith('8')) {
      input = input.substring(1);
    }
    input = input.substring(0, 10);

    let formatted = '';
    if (input.length > 0) formatted = '+7 (' + input.substring(0, 3);
    if (input.length > 3) formatted += ') ' + input.substring(3, 6);
    if (input.length > 6) formatted += '-' + input.substring(6, 8);
    if (input.length > 8) formatted += '-' + input.substring(8, 10);
    
    e.target.value = input ? formatted : '';
  };

  const renderCalcInterface = () => (
    <div className="calc-container" style={{ position: 'relative' }}>
      
      {isModal && onClose && (
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '14px', right: '20px', background: 'none', border: 'none', fontSize: '32px', color: '#64748b', cursor: 'pointer', zIndex: 100, outline: 'none' }}
        >
          ×
        </button>
      )}

      <div className="calc-top-bar" style={{ backgroundColor: '#f8fafc', padding: '20px 50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <div style={{ flexGrow: 1, minWidth: '200px' }}>
          <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#2563eb', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', display: 'block', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Шаг {calcStep} из 7</span>
        </div>
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 18px', borderRadius: '10px', marginRight: isModal ? '25px' : '0' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>🎁 Ваша скидка: <span style={{ color: '#10b981', fontWeight: '800', fontSize: '16px' }}>{currentDiscount} ₽</span></span>
        </div>
      </div>

      <div className="calc-body">
        {calcStep === 1 && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a', marginBottom: '24px', textAlign: 'left' }}>1. Укажите тип балкона и примерные габариты:</h3>
            <div className="calc-grid-4">
              {[
                { type: 'Лоджия', icon: '🏢' },
                { type: 'Г-образный', icon: '📐' },
                { type: 'П-образный', icon: '📦' },
                { type: 'Эркерный', icon: '💎' }
              ].map((item) => (
                <div key={item.type} onClick={() => setCalcType(item.type)} className={`calc-card ${calcType === item.type ? 'active' : ''}`}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
                  <div>{item.type}</div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px', margin: '0 auto', backgroundColor: '#f8fafc', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                  <label htmlFor="calc-width-range" style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Длина (ширина конструкции):</label>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#2563eb', backgroundColor: '#fff', padding: '4px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>{calcWidth} см</span>
                </div>
                <input id="calc-width-range" type="range" min="100" max="700" step="10" value={calcWidth} onChange={(e) => setCalcWidth(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }} aria-label="Ширина остекления балкона" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                  <label htmlFor="calc-height-range" style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Высота рамы остекления:</label>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#2563eb', backgroundColor: '#fff', padding: '4px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>{calcHeight} см</span>
                </div>
                <input id="calc-height-range" type="range" min="100" max="250" step="5" value={calcHeight} onChange={(e) => setCalcHeight(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }} aria-label="Высота оконной рамы" />
              </div>
            </div>
          </div>
        )}

        {calcStep === 2 && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a', marginBottom: '24px', textAlign: 'left' }}>2. Какой профиль и тип открывания планируете?</h3>
            <div className="calc-grid-2">
              {['Раздвижное алюминиевое (холодное)', 'Раздвижное пластиковое (Slidors)', 'Пластиковые распашные окна (теплое)', 'Французское витражное (от пола до потолка)'].map((opt) => (
                <div key={opt} onClick={() => setCalcGlazing(opt)} className={`calc-option-row ${calcGlazing === opt ? 'active' : ''}`}>
                  <span style={{ color: calcGlazing === opt ? '#2563eb' : '#cbd5e1', fontSize: '18px' }}>{calcGlazing === opt ? '◈' : '◇'}</span> {opt}
                </div>
              ))}
            </div>
          </div>
        )}

        {calcStep === 3 && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a', marginBottom: '24px', textAlign: 'left' }}>3. Нужны ли сложные наружные или сварочные работы?</h3>
            <div className="calc-grid-2">
              {['Не нужны, парапет крепкий', 'Внешняя обшивка парапета сайдингом', 'Вынос остекления вперед (расширение)', 'Монтаж прочной крыши / навеса'].map((opt) => (
                <div key={opt} onClick={() => setCalcWelding(opt)} className={`calc-option-row ${calcWelding === opt ? 'active' : ''}`}>
                  <span style={{ color: calcWelding === opt ? '#2563eb' : '#cbd5e1', fontSize: '18px' }}>{calcWelding === opt ? '◈' : '◇'}</span> {opt}
                </div>
              ))}
            </div>
          </div>
        )}

        {calcStep === 4 && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a', marginBottom: '24px', textAlign: 'left' }}>4. Какой material чистовой отделки стен вам нравится?</h3>
            <div className="calc-grid-2">
              {['Без обшивки (просто остекление)', 'Белые или цветные ПВХ-панели', 'Натуральная деревянная евровагонкой', 'Влагостойкий гипсокартон под покраску'].map((opt) => (
                <div key={opt} onClick={() => setCalcFinish(opt)} className={`calc-option-row ${calcFinish === opt ? 'active' : ''}`}>
                  <span style={{ color: calcFinish === opt ? '#2563eb' : '#cbd5e1', fontSize: '18px' }}>{calcFinish === opt ? '◈' : '◇'}</span> {opt}
                </div>
              ))}
            </div>
          </div>
        )}

        {calcStep === 5 && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a', marginBottom: '24px', textAlign: 'left' }}>5. Потребуется ли утепление стен, пола и потолка?</h3>
            <div className="calc-grid-2">
              {['Без утепления', 'Комфорт: Пенопласт 30 мм', 'Максимум: Пеноплекс повышенной плотности 50 мм', 'Сибирь: Пеноплекс + теплоотражающий Пенофол'].map((opt) => (
                <div key={opt} onClick={() => setCalcInsulation(opt)} className={`calc-option-row ${calcInsulation === opt ? 'active' : ''}`}>
                  <span style={{ color: calcInsulation === opt ? '#2563eb' : '#cbd5e1', fontSize: '18px' }}>{calcInsulation === opt ? '◈' : '◇'}</span> {opt}
                </div>
              ))}
            </div>
          </div>
        )}

        {calcStep === 6 && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a', marginBottom: '24px', textAlign: 'left' }}>6. Добавим ли полезную мебель или опции комфорта?</h3>
            <div className="calc-grid-2">
              {['Ничего дополнительно не нужно', 'Удобная невысокая тумба в цвет стен', 'Вместительный шкаф до самого потолка', 'Безопасный инфракрасный теплый пол с датчиком'].map((opt) => (
                <div key={opt} onClick={() => setCalcAdditional(opt)} className={`calc-option-row ${calcAdditional === opt ? 'active' : ''}`}>
                  <span style={{ color: calcAdditional === opt ? '#2563eb' : '#cbd5e1', fontSize: '18px' }}>{calcAdditional === opt ? '◈' : '◇'}</span> {opt}
                </div>
              ))}
            </div>
          </div>
        )}

        {calcStep === 7 && (
          <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: '50px', display: 'block', marginBottom: '14px' }}>🎁</span>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', marginBottom: '12px' }}>Расчет конфигурации завершен!</h3>
            <p style={{ fontSize: '15px', color: '#475569', marginBottom: '28px', lineHeight: '1.6' }}>
              Мы успешно закрепили за вашим номером телефона промокод на скидку <strong style={{ color: '#2563eb' }}>1 500 ₽</strong>. Куда вам удобнее выслать итоговую смету расходов?
            </p>
            
            <form 
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} 
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);

                const form = e.target as HTMLFormElement;
                const phoneInput = form.querySelector('input[type="tel"]') as HTMLInputElement;
                const selectedMessenger = (form.querySelector('input[name="messenger"]:checked') as HTMLInputElement)?.value || 'WhatsApp';

                // Формируем красивый массив ответов для нашей апишки и amoCRM
                const quizAnswers = [
                  `Тип балкона: ${calcType}`,
                  `Размеры: ${calcWidth}х${calcHeight} см`,
                  `Остекление: ${calcGlazing}`,
                  `Внешние/Сварочные работы: ${calcWelding}`,
                  `Отделка стен: ${calcFinish}`,
                  `Утепление: ${calcInsulation}`,
                  `Мебель/Доп. опции: ${calcAdditional}`,
                  `Удобный способ связи: ${selectedMessenger}`
                ];

                try {
                  const res = await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: `Заявка с квиза (${calcType})`,
                      phone: phoneInput.value,
                      quizAnswers: quizAnswers // Отправляем как массив, который переварит бэкенд
                    })
                  });

                  if (res.ok) {
                    setCalcStep(1);
                    form.reset();
                    if (isModal && onClose) onClose(); 
                    router.push('/thanks'); 
                  } else {
                    alert('Ошибка при отправке в CRM.');
                  }
                } catch {
                  alert('Ошибка подключения к серверу.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                  <input type="radio" name="messenger" value="WhatsApp" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#10b981' }} /> WhatsApp
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                  <input type="radio" name="messenger" value="Telegram" style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} /> Telegram
                </label>
              </div>

              <input 
                type="tel" 
                placeholder="+7 (999) 000-00-00" 
                aria-label="Номер мобильного телефона для получения сметы квиза"
                onChange={handlePhoneChange}
                minLength={18}
                maxLength={18}
                required 
                style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '600', outline: 'none', textAlign: 'center', width: '100%', backgroundColor: '#fff', color: '#0f172a' }} 
              />

              <div style={{ display: 'flex', alignItems: 'start', gap: '10px', textAlign: 'left' }}>
                <input type="checkbox" id="calc_consent" required defaultChecked style={{ width: '16px', height: '16px', marginTop: '3px', flexShrink: 0 }} />
                <label htmlFor="calc_consent" style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                  Я даю согласие на обработку персональных данных и соглашаюсь с политикой конфиденциальности.
                </label>
              </div>

              <button type="submit" disabled={isSubmitting} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '16px 0', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                {isSubmitting ? 'Отправка...' : 'Получить точный расчет и скидку'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px 40px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {calcStep > 1 && calcStep < 7 ? (
          <button onClick={() => setCalcStep(calcStep - 1)} style={{ backgroundColor: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', outline: 'none' }}>← Назад</button>
        ) : <div />}
        
        {calcStep < 7 && (
          <button onClick={() => setCalcStep(calcStep + 1)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)' }}>
            Дальше →
          </button>
        )}
      </div>

    </div>
  );

  const sharedStyles = `
    .calc-container { background-color: #fff; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.05); overflow: hidden; }
    .calc-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 35px; }
    .calc-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .calc-card { padding: 22px 14px; border-radius: 16px; border: 1px solid #e2e8f0; background-color: #fff; cursor: pointer; font-weight: 600; font-size: 15px; text-align: center; transition: all 0.2s ease-in-out; }
    .calc-card:hover { border-color: #2563eb; background-color: #f8fafc; transform: translateY(-2px); }
    .calc-card.active { border-color: #2563eb; background-color: #eff6ff; color: #1e3a8a; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.08); }
    .calc-option-row { padding: 20px 24px; border-radius: 14px; border: 1px solid #e2e8f0; background-color: #fff; cursor: pointer; font-weight: 600; font-size: 15px; color: #334155; text-align: left; transition: all 0.15s ease; display: flex; align-items: center; gap: 12px; }
    .calc-option-row:hover { border-color: #2563eb; background-color: #f8fafc; }
    .calc-option-row.active { border-color: #2563eb; background-color: #eff6ff; color: #1e3a8a; }
    .calc-body { padding: 45px 50px; }
    
    @media (max-width: 768px) {
      .calc-body { padding: 30px 20px !important; }
      .calc-grid-4 { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
      .calc-grid-2 { grid-template-columns: 1fr !important; gap: 10px !important; }
      .calc-top-bar { padding: 16px 20px !important; }
      .calc-title { font-size: 24px !important; }
      .calc-card { padding: 16px 10px !important; font-size: 14px !important; }
    }
  `;

  if (isModal) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '840px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflowY: 'auto', maxHeight: '92vh' }}>
          <style dangerouslySetInnerHTML={{ __html: sharedStyles }} />
          {renderCalcInterface()}
        </div>
      </div>
    );
  }

  return (
    <section style={{ backgroundColor: '#f8fafc', padding: '90px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
      <style dangerouslySetInnerHTML={{ __html: sharedStyles }} />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.03em' }}>Умный 3D-конфигуратор лоджий</span>
          <h2 className="calc-title" style={{ fontSize: '34px', fontWeight: '700', color: '#1e3a8a', letterSpacing: '-0.02em' }}>Online-расчет стоимости остекления</h2>
          <p style={{ fontSize: '15px', color: '#64748b', marginTop: '8px' }}>Пройдите тест из 6 шагов, зафиксируйте за номером скидку 1 500 ₽ и получите смету</p>
        </div>

        {renderCalcInterface()}
      </div>
    </section>
  );
}