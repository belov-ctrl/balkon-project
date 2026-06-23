import { MetadataRoute } from 'next';

// Твой будущий домен (поменяешь на реальный, когда выложим в интернет)
const BASE_URL = 'http://localhost:3000'; 

const districtsSlugs = [
  'bolshaya-ostrovka', '11-j-mikrorajon', 'amurskij', 'pribrezhnyj', 'kosmos', 
  '3-j-mikrorajon', 'amurskij-2', 'pervokirpichnyj', 'gorodok-neftyanikov', 'port-artur', 
  'solnechnyj', 'ryabinovka', 'linejnyj', 'zelyonaya-dolina', 'nikolaevka', 'novaya-stanica',
  'kujbyshevskij', 'topolinyj', '5-j-mikrorajon', 'levoberezhye', 'privokzalnyj', 
  'komsomolskij-gorodok', '4-j-mikrorajon', 'parkovyj-mikrorajon', 'zaozyornyj', 'zahlamino', 
  'moskovka', 'volzhskij', 'karyer', 'yasnaya-polyana', 'severnyj', 'aleksandrovskaya-usadba',
  'gorodok-vodnikov', '12-j-mikrorajon', 'polyot', '6-j-mikrorajon', 'kirovsk', 
  'leninsk', 'chkalovskij', '2-j-mikrorajon', 'staryj-kirovsk', 'bolshie-polya', 
  'yubilejnyj', 'bulatovo', 'zagorodnyj', 'mikrorajon-vhodnoj', 'cheryomushki', 'beregovoj',
  'rybachij', 'omskij-kristall', 'biofabrika', 'aviagorodok', 'kordnyj', 
  '1-j-mikrorajon', 'chukreevka', 'vostochnyj', 'cheredovyj', 'stepnoj', 
  'dalnij', 'armejskij', 'ostashkovo', 'svetlyj', 'cheryomuhovskoe', 'krutaya-gorka'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const mainRoutes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    }
  ];

  const districtRoutes = districtsSlugs.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...mainRoutes, ...districtRoutes];
}