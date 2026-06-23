'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // 1. Импортируем быстрый роутер Next.js
import FloatingWidgets from './FloatingWidgets';

export default function BlogClientWrapper() {
  const router = useRouter(); // 2. Инициализируем роутер

  // ИСПРАВЛЕНО: Заменили window.location.href на router.push. 
  // Теперь переход на главную к калькулятору будет мгновенным, плавным и не нагрузит процессор сервера.
  return <FloatingWidgets onOpenCalc={() => router.push('/#calculator')} />;
}