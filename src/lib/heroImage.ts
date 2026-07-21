// ============================================================================
// getDeterministicImage — детерминированный выбор hero-картинки по слагу.
// Хэш вычисляется на сервере (SSR), поэтому hydration mismatch исключён.
// ============================================================================

export type HeroImageType = 'exteriors' | 'interiors' | 'production' | 'cottage';

const IMAGE_COUNTS: Record<HeroImageType, number> = {
  interiors:  28,
  exteriors:  17,
  production:  4,
  cottage:     1,
};

/**
 * Возвращает путь вида /images/hero/exteriors/exterior-3.jpg
 * на основе детерминированного хэша слага.
 */
export function getDeterministicImage(slug: string, type: HeroImageType): string {
  const maxCount = IMAGE_COUNTS[type];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % maxCount;
  // interiors → interior-N.jpg; exteriors → exterior-N.jpg; production/cottage stay as-is
  const filePrefix = type.endsWith('s') ? type.slice(0, -1) : type;
  return `/images/hero/${type}/${filePrefix}-${index + 1}.jpg`;
}
