window.generateSKU = function ({
  width,         // in inches
  height,        // in inches (assumed always 72 = 6 ft)
  depth,         // in inches
  shelfQty,      // number
  drawerHeights  // array of heights (length = drawer count)
}) {
  // Convert to required format
  const widthFt = Math.round(width / 12);     // e.g., 36 → 3
  const heightFt = Math.round(height / 12);   // e.g., 72 → 6
  const drawerQty = drawerHeights.length;

  // Build base SKU
  let sku = `${widthFt}${heightFt}-${depth}${shelfQty}`;

  // Add drawer part if drawers exist
  if (drawerQty > 0) {
    sku += `-${drawerQty}DB`;
  }

  return sku;
};
