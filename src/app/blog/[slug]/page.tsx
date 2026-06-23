import React from 'react';
import { notFound } from 'next/navigation';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import Link from 'next/link';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactsMap from '@/components/ContactsMap';
import BlogClientWrapper from '@/components/BlogClientWrapper';

// Функция получения конкретной статьи из Strapi по её СЕО-ссылке (slug)
async function getArticle(slug: string) {
  try {
    const res = await fetch(`http://localhost:1337/api/articles?filters[slug][$eq]=${slug}&populate=*`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Ошибка загрузки статьи из Strapi:', error);
    return null;
  }
}

// Автоматическая генерация СЕО Мета-тегов для поисковиков (с поддержкой Next.js 15 Promise)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articleData = await getArticle(slug);
  if (!articleData) return { title: 'Статья не найдена | Балконные Решения Омск' };

  const article = articleData.attributes || articleData;
  return {
    title: `${article.title || 'Статья'} | Балконные Решения Омск`,
    description: article.description || '',
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  // В Next.js 15 params является Promise. Обязательно делаем await params!
  const { slug } = await params;
  const articleData = await getArticle(slug);

  // Если статья не найдена в базе или не опубликована — вызываем 404
  if (!articleData) {
    notFound();
  }

  // Поддержка структуры Strapi v5 (данные лежат в корне, а не в attributes)
  const article = articleData.attributes || articleData;
  const { title, description, content, cover, publishedAt } = article;

  // Форматируем картинку с поддержкой Strapi v5
  let coverUrl = 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=1920';
  const coverAttributes = cover?.data?.attributes || cover?.data || cover;
  if (coverAttributes?.url) {
    const url = coverAttributes.url;
    coverUrl = url.startsWith('http') ? url : `http://localhost:1337${url}`;
  }

  // Форматируем дату в красивый русский формат
  const dateObj = new Date(publishedAt || Date.now());
  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(dateObj);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <Header />

      <main style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Хлебные крошки (SEO навигация) - ТЕПЕРЬ ССЫЛКА ЖЕЛЕЗНО ВЕДЕТ НА КАТАЛОГ /blog */}
        <div style={{ marginBottom: '24px', fontSize: '14px', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>Главная</Link>
          <span>/</span>
          <Link href="/blog" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>Блог и советы</Link>
          <span>/</span>
          <span style={{ color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
            {title}
          </span>
        </div>

        {/* Тело статьи */}
        <article style={{ backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -15px rgba(15,23,42,0.05)' }}>
          
          {/* Обложка и заголовок */}
          <div style={{ height: '400px', width: '100%', position: 'relative' }}>
            <img src={coverUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.3) 60%, transparent 100%)' }}></div>
            <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', color: '#fff' }}>
              <div style={{ display: 'inline-block', backgroundColor: '#2563eb', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Полезно знать
              </div>
              {/* Облегченный заголовок (жирность 600 вместо 800, увеличен отступ строк) */}
              <h1 style={{ fontSize: '36px', fontWeight: '600', margin: '0 0 16px 0', lineHeight: '1.3', letterSpacing: '-0.01em' }}>{title}</h1>
              <div style={{ fontSize: '14px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}>
                <span>📅 {formattedDate}</span>
                <span>•</span>
                <span>⏱ Время чтения: ~4 мин</span>
              </div>
            </div>
          </div>

          {/* Текст статьи */}
          <div className="article-body" style={{ padding: '50px 60px', color: '#334155', fontSize: '17px', lineHeight: '1.8', textAlign: 'left' }}>
            <style dangerouslySetInnerHTML={{ __html: `
              .article-body h2 { font-size: 26px; font-weight: 700; color: #1e3a8a; margin: 40px 0 20px 0; line-height: 1.3; }
              .article-body h3 { font-size: 20px; font-weight: 700; color: #1e3a8a; margin: 30px 0 16px 0; }
              .article-body p { margin-bottom: 22px; }
              .article-body ul, .article-body ol { margin-bottom: 26px; padding-left: 24px; }
              .article-body li { margin-bottom: 10px; }
              .article-body img { max-width: 100%; height: auto; border-radius: 16px; margin: 30px 0; border: 1px solid #e2e8f0; }
              .article-body strong { color: #0f172a; font-weight: 700; }
              .article-body blockquote { border-left: 5px solid #2563eb; padding-left: 24px; font-style: italic; color: #475569; margin: 40px 0; background: #f8fafc; padding: 24px; border-radius: 0 16px 16px 0; font-size: 19px; }
              @media(max-width: 768px) {
                .article-body { padding: 30px 20px !important; font-size: 16px !important; }
                .article-body h2 { font-size: 22px !important; }
              }
            `}} />

            <p style={{ fontSize: '20px', color: '#1e293b', fontWeight: '500', marginBottom: '35px', lineHeight: '1.6', borderBottom: '2px solid #f1f5f9', paddingBottom: '25px' }}>
              {description}
            </p>

            {content ? (
              <BlocksRenderer content={content} />
            ) : (
              <p>Текст статьи готовится к публикации...</p>
            )}
          </div>
        </article>
      </main>

      <ContactsMap />
      <Footer />
      
      <BlogClientWrapper />
    </div>
  );
}