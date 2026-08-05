/**
 * Utility function to automatically optimize image URLs (Cloudinary, Unsplash, etc.)
 * Serves lightweight WebP/AVIF formats at responsive widths to load in ~50-200ms.
 */
export function getOptimizedImageUrl(url, width = 600, quality = 80) {
  if (!url || typeof url !== 'string') return '/logo2.png';

  // Cloudinary Optimization
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // If Cloudinary transformation is already present
    if (url.match(/\/upload\/[^\/]*f_auto[^\/]*\//)) {
      return url;
    }
    // Insert fast WebP/AVIF auto format + quality + limit width transformation
    return url.replace(
      /\/upload\//,
      `/upload/f_auto,q_auto:good,c_limit,w_${width}/`
    );
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
