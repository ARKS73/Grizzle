/**
 * Helper utilities for managing size and color-wise variant stock across the Grizzle app.
 */

/**
 * Get available stock for a specific product, size, and color variant.
 * 
 * @param {Object} product - Product object
 * @param {string} size - Size (e.g. 'S', 'M', 'L', 'XL', 'XXL')
 * @param {string} colorName - Color name (e.g. 'Black', 'White')
 * @returns {number} Available stock quantity
 */
export function getProductVariantStock(product, size, colorName) {
  if (!product) return 0;

  const cName = (colorName && String(colorName).trim()) || (product.colors && product.colors[0]?.name) || '';
  const sName = (size && String(size).trim()) || '';

  // 1. Check variantStock for exact color_size key (e.g. "Black_M")
  if (cName && sName && product.variantStock) {
    const key = `${cName}_${sName}`;
    if (product.variantStock[key] !== undefined && product.variantStock[key] !== null) {
      return Math.max(0, Number(product.variantStock[key]));
    }
  }

  // 2. Check sizeStock with color_size key or fallback size-only key
  if (product.sizeStock) {
    if (cName && sName && product.sizeStock[`${cName}_${sName}`] !== undefined) {
      return Math.max(0, Number(product.sizeStock[`${cName}_${sName}`]));
    }
    if (sName && product.sizeStock[sName] !== undefined && typeof product.sizeStock[sName] === 'number') {
      return Math.max(0, Number(product.sizeStock[sName]));
    }
  }

  // 3. Fallback to overall product stock
  return Math.max(0, Number(product.stock || 0));
}

/**
 * Calculate total stock across all color and size variant combinations.
 * 
 * @param {Object} variantStock - Object with "Color_Size" -> quantity mapping
 * @param {Object} sizeStock - Object with size -> quantity mapping
 * @param {Array} sizes - List of sizes
 * @param {Array} colors - List of color objects
 * @returns {number} Total calculated stock
 */
export function calculateTotalVariantStock(variantStock = {}, sizeStock = {}, sizes = [], colors = []) {
  if (colors && colors.length > 0 && sizes && sizes.length > 0) {
    let total = 0;
    colors.forEach((col) => {
      sizes.forEach((sz) => {
        const key = `${col.name}_${sz}`;
        if (variantStock && variantStock[key] !== undefined) {
          total += parseInt(variantStock[key], 10) || 0;
        } else if (sizeStock && sizeStock[sz] !== undefined) {
          total += parseInt(sizeStock[sz], 10) || 0;
        }
      });
    });
    return total;
  }

  if (sizeStock && Object.keys(sizeStock).length > 0) {
    return Object.values(sizeStock).reduce((sum, q) => sum + (parseInt(q, 10) || 0), 0);
  }

  return 0;
}
