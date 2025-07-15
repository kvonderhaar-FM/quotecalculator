// controller.js
console.log("controller.js loaded");

const FULL_WIDTH_PRICES = window.drawerPrices.full;
const HALF_WIDTH_PRICES = window.drawerPrices.half;
const LOCK_PRICES = window.lockPrices;

function getTotalShelfCount() {
  const standard = parseInt(getSelectedValue("standardShelfQty") || "0");
  const slide = parseInt(getSelectedValue("slideoutShelfQty") || "0");

  const standardQty = isNaN(standard) ? 0 : standard;
  const slideQty = isNaN(slide) ? 0 : slide;
  const standardShelfQty = parseInt(getSelectedValue("standardShelfQty") || "0");
const slideoutShelfQty = parseInt(getSelectedValue("slideoutShelfQty") || "0");
const totalShelves = standardShelfQty + slideoutShelfQty;

let shelfText = totalShelves > 0
  ? `, ${totalShelves} Shelf Divider Kits`
  : ", No Shelves";

  return standardQty + slideQty;
}

function getTotalDrawerCount() {
  const fullQty = parseInt(getSelectedValue("fullDrawerQty") || "0");
  const halfQty = parseInt(getSelectedValue("halfDrawerQty") || "0");

  const fullCount = isNaN(fullQty) ? 0 : fullQty;
  const halfCount = isNaN(halfQty) ? 0 : (halfQty / 2) * 2;  // 6 half drawers = 3 selectors = 6 drawers

  return fullCount + halfCount;
}

function getSelectedValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : null;
}

function getFullDrawerHeights() {
  return Array.from(document.querySelectorAll('#full-drawer-height-selectors select')).map(select => parseInt(select.value));
}

function getHalfDrawerHeights() {
  return Array.from(document.querySelectorAll('#half-drawer-height-selectors select')).map(select => parseInt(select.value));
}
function calculateBaseCabinetPrice() {
  const depth = parseInt(getSelectedValue("depth"));
  const width = parseInt(getSelectedValue("width"));
  const prices = window.basePrices;

  console.log("Selected depth:", depth);
  console.log("Selected width:", width);
  console.log("Available basePrices:", prices);
  console.log("Lookup result:", prices?.[depth]?.[width]);

  if (!depth || !width || !prices[depth] || !prices[depth][width]) return 0;

  return prices[depth][width];
}

function calculateDrawerCost() {
  const drawerType = getSelectedValue('drawerType');
  if (drawerType === 'none') return 0;

  if (drawerType === 'full') {
    const heights = getFullDrawerHeights();
    return heights.reduce((sum, h) => sum + (FULL_WIDTH_PRICES[h] || 0), 0);
  }

  if (drawerType === 'half') {
    const heights = getHalfDrawerHeights();
    return heights.reduce((sum, h) => sum + (HALF_WIDTH_PRICES[h] || 0), 0);
  }

  return 0;
}

function calculateLockCost() {
  const lock = getSelectedValue('lock');
  return lock ? LOCK_PRICES[lock] || 0 : 0;
}

function calculateShelfCost() {
  const standard = parseInt(getSelectedValue("standardShelfQty") || "0");
  const slide = parseInt(getSelectedValue("slideoutShelfQty") || "0");

  const standardQty = isNaN(standard) ? 0 : standard;
  const slideQty = isNaN(slide) ? 0 : slide;

  return (standardQty * 121) + (slideQty * 198);
}


function calculateColorSurcharge() {
  const color = getSelectedValue('color');
  return color === "DustyGray" ? 0 : 346;
}

function generateSKU() {
  
  const width = parseInt(getSelectedValue("width"));
  const height = parseInt(getSelectedValue("height"));
  const depth = parseInt(getSelectedValue("depth"));
  const gauge = getSelectedValue("gauge");
  const drawerQty = getTotalDrawerCount();

  if (!width || !height || !depth) return "";

  const widthFeet = width / 12;
  const heightFeet = height / 12;

  // Start SKU with width and height
  let sku = `${widthFeet}${heightFeet}`;

  // Step 2: Add door code if needed
  const doorType = getSelectedValue("door");
  console.log("Selected door type:", doorType);
  const doorCodeMap = {
    "Clearview": "LD",
    "Diamond": "V",
    "Hex": "H"
  };

  if (doorCodeMap[doorType]) {
    sku += `-${doorCodeMap[doorType]}`;
  }

  // Step 3: Add depth
  sku += `-${depth}`;

  // Step 4: Add shelf quantity
  const standardShelfQty = parseInt(getSelectedValue("standardShelfQty") || "0");
  const slideoutShelfQty = parseInt(getSelectedValue("slideoutShelfQty") || "0");
  const totalShelves = standardShelfQty + slideoutShelfQty;
  if (totalShelves > 0) {
    sku += `${totalShelves}`;
  }

  // Step 5: Add drawer count if any
  if (drawerQty > 0) {
    sku += `-${drawerQty}DB`;
  }

  // Step 6: Add color RAL if not DustyGray
  const selectedColorInput = document.querySelector('input[name="color"]:checked');
  if (selectedColorInput?.value !== "DustyGray") {
    const label = document.querySelector(`label[for="${selectedColorInput.id}"]`);
    const match = label?.title?.match(/\(RAL\s*(\d+)\)/);
    if (match) {
      sku += `-${match[1]}`; // RAL number
    }
  }

  // Step 7: Add -L if 14 gauge
  if (gauge === "14") {
    sku += `-L`;
  }

  // Display result
  const display = document.getElementById("skuDisplay");
  if (display) {
    display.textContent = sku;
  }

  return sku;
}
function generateDescription() {
    const width = parseInt(getSelectedValue("width")) / 12;
    const height = parseInt(getSelectedValue("height")) / 12;
    const depth = parseInt(getSelectedValue("depth"));
    const door = getSelectedValue("door");
    const totalShelves = getTotalShelfCount();
    const totalDrawers = getTotalDrawerCount();
    const color = getSelectedValue("color");

    let desc = `${height}' H x ${width}' W x ${depth}" D`;
    if (door && door !== "Solid") desc += ` ${door} Door`;
    if (totalShelves > 0) desc += `, ${totalShelves} Shelf Divider Kits`;
    if (totalDrawers > 0) desc += `, ${totalDrawers} Drawers`;
    if (color && color !== "DustyGray") desc += `, ${color} Finish`;

    const display = document.getElementById("descriptionText");
    if (display) display.value = desc;
    return desc;
}

function updateTotalPrice() {
  const basePrice = calculateBaseCabinetPrice();
  const drawerCost = calculateDrawerCost();
  const lockCost = calculateLockCost();
  const shelfCost = calculateShelfCost();
  const colorUpcharge = calculateColorSurcharge();

  const total = basePrice + drawerCost + lockCost + shelfCost + colorUpcharge;

  const display = document.getElementById('finalPrice');
  if (display) {
    display.textContent = `$${total.toFixed(2)}`;
  }

  // Debug log
  console.log(`Breakdown → Base: ${basePrice}, Drawers: ${drawerCost}, Locks: ${lockCost}, Shelves: ${shelfCost}, Color: ${colorUpcharge}`);
  generateSKU();
  generateDescription();
}

console.log("basePrices in controller.js:", window.basePrices);

function attachPriceListeners() {
  document.addEventListener('change', (e) => {
    if (
      e.target.matches('input[name="drawerType"]') ||
      e.target.matches('input[name="fullDrawerQty"]') ||
      e.target.matches('input[name="halfDrawerQty"]') ||
      e.target.matches('input[name="color"]') ||
      e.target.matches('input[name="shelfType"]') ||
      e.target.matches('#shelfQty') ||
      e.target.matches('input[name="lock"]') ||
      e.target.matches('input[name="gauge"]') || 
      e.target.matches('input[name="door"]') || 
      e.target.matches('input[name="standardShelfQty"]') ||
      e.target.matches('input[name="slideoutShelfQty"]') ||
      e.target.matches('#full-drawer-height-selectors select') ||
      e.target.matches('#half-drawer-height-selectors select')
    ) {
      updateTotalPrice();           // triggers generateSKU + description
      generateSKU();                // optional redundancy, but safe
      generateDescription();
    }
  });

  // Catch-all backup
  document.addEventListener('change', (e) => {
    if (e.target.matches("input[type='radio'], select")) {
      updateTotalPrice();
    }
  });
}



document.addEventListener('DOMContentLoaded', () => {
  attachPriceListeners();
  updateTotalPrice();
});

document.addEventListener('DOMContentLoaded', () => {
  attachPriceListeners();
  updateTotalPrice();
});
//temporary console logs to troubleshoot
function calculateDrawerCost() {
  const drawerType = getSelectedValue('drawerType');
  console.log("Selected drawer type:", drawerType);
  if (drawerType === 'none') return 0;

  if (drawerType === 'full') {
    const heights = getFullDrawerHeights();
    console.log("Full drawer heights:", heights);
    const cost = heights.reduce((sum, h) => {
      const price = window.drawerPrices.full?.[h]?.[24]?.[36]; // use fixed depth/width for test
      console.log(`Height ${h} => $${price}`);
      return sum + (price || 0);
    }, 0);
    return cost;
  }

  if (drawerType === 'half') {
    const heights = getHalfDrawerHeights();
    console.log("Half drawer heights:", heights);
    const cost = heights.reduce((sum, h) => {
      const price = window.drawerPrices.half?.[h]?.[24]?.[36];
      console.log(`Height ${h} => $${price}`);
      return sum + (price || 0);
    }, 0);
    return cost;
  }

  return 0;
}
function calculateColorSurcharge() {
  const color = getSelectedValue('color');
  console.log("Selected color value:", color);
  return color === "DustyGray" ? 0 : 346;
}

//log trial over
document.addEventListener("DOMContentLoaded", () => {
  const copyBtn = document.getElementById("copyDescriptionBtn");

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const description = document.getElementById("descriptionDisplay")?.textContent.trim();
      if (!description) return;

      navigator.clipboard.writeText(description)
        .then(() => {
          copyBtn.textContent = "Copied!";
          setTimeout(() => copyBtn.textContent = "Copy Description", 2000);
        })
        .catch(err => {
          console.error("Clipboard copy failed:", err);
          alert("Failed to copy description.");
        });
    });
  }
});
