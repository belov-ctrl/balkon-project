import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactsMap from '@/components/ContactsMap';
import BlogClientWrapper from '@/components/BlogClientWrapper';

// Функция получения всех статей из Strapi
async function getAllArticles() {
  try {
    const res = await fetch('https://balkonreshenie.ru/api/articles?populate[0]=cover&sort[0]=publishedAt:desc', {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Ошибка загрузки каталога статей из Strapi:', error);
    return [];
  }
}

export const metadata = {
  title: 'Блог и полезные советы об остеклении балконов в Омске',
  description: 'Профессиональные статьи, обзоры материалов, инструкции по утеплению и идеи дизайна лоджий от компании Балконные Решения.',
};

export default async function BlogPage() {
  const articles = await getAllArticles();

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <Header />

      {/* ЧИСТЫЙ И БЕЗОПАСНЫЙ СЕО-CSS ДЛЯ ЭФФЕКТА ХОВЕРА КАРТОЧЕК */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 30px; margin-bottom: 60px; }
        .blog-article-card { 
          background-color: #fff; 
          border-radius: 24px; 
          border: 1px solid #e2e8f0; 
          overflow: hidden; 
          display: flex; 
          flex-direction: column; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.01);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .blog-article-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08);
        }
        @media (max-width: 768px) {
          .blog-catalog-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
        }
      `}} />

      <main style={{ padding: '60px 20px', maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Навигационная цепочка */}
        <div style={{ marginBottom: '32px', fontSize: '14px', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>Главная</Link>
          <span>/</span>
          <span style={{ color: '#1e293b' }}>Блог и советы</span>
        </div>

        {/* Заголовок раздела */}
        <div style={{ textAlign: 'left', marginBottom: '48px' }}>
          <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
            База знаний компании
          </span>
          <h1 style={{ fontSize: '38px', fontWeight: '800', color: '#1e3a8a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
            Полезные статьи и советы экспертов
          </h1>
          <p style={{ fontSize: '16px', color: '#475569', maxWidth: '700px', lineHeight: '1.6' }}>
            Регулярно публикуем честные обзоры профилей, разбираем ошибки при утеплении, делимся тонкостями выбора материалов и секретами создания теплого уюта на омских лоджиях.
          </p>
        </div>

        {/* Сетка статей */}
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📝</span>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px' }}>Раздел наполняется статьями</h3>
            <p style={{ fontSize: '15px', color: '#64748b' }}>Наши инженеры уже готовят новые полезные материалы. Скоро они появятся здесь!</p>
          </div>
        ) : (
          <div className="blog-catalog-grid">
            {articles.map((item: any, idx: number) => {
              const article = item.attributes || item;
              const { title, description, slug, cover, publishedAt } = article;

              // Обработка обложки
              let imgUrl = 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=600';
              const coverAttributes = cover?.data?.attributes || cover?.data || cover;
              if (coverAttributes?.url) {
                const rawUrl = coverAttributes.url;
                imgUrl = rawUrl.startsWith('http') ? rawUrl : `https://balkonreshenie.ru${rawUrl}`;
              }

              // Форматирование даты
              const dateObj = new Date(publishedAt || Date.now());
              const formattedDate = new Intl.DateTimeFormat('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
              }).format(dateObj);

              return (
                <article key={item.id || idx} className="blog-article-card">
                  {/* Изображение карточки */}
                  <div style={{ height: '220px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={imgUrl} 
                      alt={title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <span style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Полезное
                    </span>
                  </div>

                  {/* Контент карточки */}
                  <div style={{ padding: '30px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', fontWeight: '500' }}>
                        📅 {formattedDate}
                      </div>
                      <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#1e3a8a', margin: '0 0 12px 0', lineHeight: '1.4', letterSpacing: '-0.01em' }}>
                        {title}
                      </h3>
                      <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                        {description}
                      </p>
                    </div>

                    <Link 
                      href={`/blog/${slug}`} 
                      style={{ 
                        color: '#2563eb', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        textDecoration: 'none', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '16px',
                        width: '100%'
                      }}
                    >
                      Читать статью ➔
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </main>

      <ContactsMap />
      <Footer />
      
      <BlogClientWrapper />
    </div>
  );
}