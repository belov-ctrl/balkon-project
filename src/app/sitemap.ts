import { MetadataRoute } from 'next';
import { DISTRICT_FALLBACKS } from '@/data/districtFallbacks';
import { SERVICE_SLUGS } from '@/app/services/[slug]/page';

const BASE_URL = 'https://balkonreshenie.ru';

async function getBlogSlugs() {
  try {
    const res = await fetch(`${BASE_URL}/api/articles?fields[0]=slug`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.map((item: { attributes?: { slug?: string }; slug?: string }) => item.attributes?.slug || item.slug) || [];
  } catch (error) {
    console.error('Ошибка сбора слагов блога для карты сайта:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const mainRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = SERVICE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const districtRoutes: MetadataRoute.Sitemap = Object.keys(DISTRICT_FALLBACKS).map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const blogSlugs = await getBlogSlugs();
  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug: string) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...mainRoutes, ...serviceRoutes, ...districtRoutes, ...blogRoutes];
}
