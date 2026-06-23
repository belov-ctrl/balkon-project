'use client';

import React from 'react';
import FloatingWidgets from './FloatingWidgets';

export default function BlogClientWrapper() {
  // На странице статьи клик по калькулятору будет возвращать человека на главную страницу прямо к блоку расчета
  return <FloatingWidgets onOpenCalc={() => window.location.href = '/#calculator'} />;
}