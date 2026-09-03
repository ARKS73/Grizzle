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

/**
 * Replenish stock when an order is cancelled, or re-deduct if status is reinstated from Cancelled.
 * 
 * @param {Object} order - Mongoose Order document or plain Object with items
 * @param {string} previousStatus - Status before update (e.g. 'Pending', 'Processing')
 * @param {string} newStatus - New status being set (e.g. 'Cancelled')
 */
export async function handleOrderStatusStockAdjustment(order, previousStatus, newStatus) {
  if (!order || previousStatus === newStatus) return;

  const items = order.items || order.orderItems || [];
  if (!Array.isArray(items) || items.length === 0) return;

  // Scenario 1: Order is being CANCELLED (was not Cancelled before, now is Cancelled) -> Replenish stock
  const isCancelling = previousStatus !== 'Cancelled' && newStatus === 'Cancelled';

  // Scenario 2: Order is being UN-CANCELLED (was Cancelled, now reinstated) -> Deduct stock again
  const isUncancelling = previousStatus === 'Cancelled' && newStatus !== 'Cancelled';

  if (!isCancelling && !isUncancelling) return;

  const multiplier = isCancelling ? 1 : -1;

  try {
    const Product = (await import('@/models/Product')).default;

    for (const item of items) {
      const prodId = item.product ? String(item.product) : null;
      if (!prodId || prodId.length !== 24) continue;

      const targetProd = await Product.findById(prodId);
      if (!targetProd) continue;

      const qty = parseInt(item.quantity || 1, 10);

      // 1. Adjust overall stock
      const currentStock = typeof targetProd.stock === 'number' ? targetProd.stock : 20;
      targetProd.stock = Math.max(0, currentStock + (qty * multiplier));

      // 2. Adjust variantStock (Color + Size)
      if (item.color && item.size) {
        const cName = String(item.color).trim();
        const sName = String(item.size).trim();
        const varKey = `${cName}_${sName}`;
        const currentVarStock = targetProd.variantStock || {};
        const currentVarQty = currentVarStock[varKey] !== undefined ? parseInt(currentVarStock[varKey], 10) : currentStock;

        targetProd.variantStock = {
          ...currentVarStock,
          [varKey]: Math.max(0, currentVarQty + (qty * multiplier)),
        };
        targetProd.markModified('variantStock');
      }

      // 3. Adjust sizeStock (Size)
      if (item.size) {
        const sName = String(item.size).trim().toUpperCase();
        const currentSizeStock = targetProd.sizeStock || {};
        const currentSizeQty = currentSizeStock[sName] !== undefined ? parseInt(currentSizeStock[sName], 10) : currentStock;

        targetProd.sizeStock = {
          ...currentSizeStock,
          [sName]: Math.max(0, currentSizeQty + (qty * multiplier)),
        };
        targetProd.markModified('sizeStock');
      }

      await targetProd.save();
    }

    const { clearStoreCache } = await import('@/lib/storeCache');
    clearStoreCache();
  } catch (err) {
    console.error('Error adjusting stock on order cancellation:', err);
  }
}
