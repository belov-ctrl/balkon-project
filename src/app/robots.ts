import { MetadataRoute } from 'next';

// Тот же список 64 районов, чтобы автоматически заблокировать их от индексации
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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/', // Главную страницу разрешаем индексировать!
      
      // Автоматически генерируем запрет (Disallow) для каждого из 64 районов
      disallow: districtsSlugs.map(slug => `/${slug}`), 
    },
    // Указываем путь к карте сайта (понадобится Яндексу в будущем)
    sitemap: 'http://localhost:3000/sitemap.xml', 
  };
}