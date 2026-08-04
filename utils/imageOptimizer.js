/**
 * Utility function to automatically optimize image URLs (Cloudinary, Unsplash, etc.)
 * Serves lightweight WebP/AVIF formats at responsive widths to load in 100-300ms.
 */
export function getOptimizedImageUrl(url, width = 600, quality = 75) {
  if (!url || typeof url !== 'string') return '/logo2.png';

  // Cloudinary Optimization
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (!url.includes('/f_auto')) {
      return url.replace('/upload/', `/upload/f_auto,q_auto:good,w_${width}/`);
    }
  }

  // Unsplash Optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }

  return url;
}
