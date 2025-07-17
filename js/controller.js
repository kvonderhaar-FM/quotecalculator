let currentHeight = 72;
let FULL_WIDTH_PRICES = {};
let HALF_WIDTH_PRICES = {};
let LOCK_PRICES = {};

document.addEventListener("DOMContentLoaded", () => {
  // Now drawerPrices will be defined
  FULL_WIDTH_PRICES = window.drawerPricesByHeight?.[window.currentHeight]?.full || {};
  HALF_WIDTH_PRICES = window.drawerPricesByHeight?.[window.currentHeight]?.half || {};
  LOCK_PRICES = window.lockPrices || {};

  attachPriceListeners();
  updateTotalPrice();

  const copyBtn = document.getElementById("copyDescriptionBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const description = document.getElementById("descriptionText")?.value.trim();
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
function createQuantityBubbles(containerId, quantityOptions) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = ""; // Clear old ones

  quantityOptions.forEach((qty) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    const span = document.createElement("span");

    input.type = "radio";
    input.name = "drawerQuantity"; // ✅ Must be exactly this
    input.value = qty;

    span.textContent = qty;

    label.appendChild(input);
    label.appendChild(span);
    container.appendChild(label);
  });
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
  const height = window.currentHeight;
  const depth = parseInt(getSelectedValue("depth"));
  const width = parseInt(getSelectedValue("width"));
  const gauge = getSelectedValue("gauge");  // "12" or "14"

  if (!height || !depth || !width) return 0;

  if (gauge === "14") {
    // Use special pricing if gauge is 14
    return getGaugePrice(height, depth, width);
  }

  // Default to 12-gauge pricing
  const prices = window.basePricesByHeight;
  return prices?.[height]?.[depth]?.[width] || 0;
}

function calculateDrawerCost() {
  const height = window.currentHeight;
  const depth = parseInt(getSelectedValue("depth"));
  const width = parseInt(getSelectedValue("width"));
  const drawerType = getSelectedValue("drawerType");

  const quantity = drawerType === "full" 
    ? parseInt(getSelectedValue("fullDrawerQty") || "0") 
    : drawerType === "half" 
      ? parseInt(getSelectedValue("halfDrawerQty") || "0") 
      : 0;

  const drawerHeights = drawerType === "full" ? getFullDrawerHeights?.() : getHalfDrawerHeights?.();
  const typeKey = drawerType?.toLowerCase();

  if (!quantity || !drawerHeights || !typeKey) return 0;

  const drawerData = window.drawerPricesByHeight?.[height]?.[typeKey]?.[quantity];
  if (!drawerData) return 0;

  let price = drawerData?.[depth]?.[width] || 0;

  // Optional surcharge for tall drawers
  const surcharge = drawerHeights.reduce((sum, h) => sum + (h > 3 ? 50 : 0), 0);
  price += surcharge;

  return price;
}

function calculateLockCost() {
  const lock = getSelectedValue("lock");
  const lockPriceMap = {
    none: 0,
    Keyless: "Keyless Lock - Lockey 2200",
    Regulator: "E-Lock - CompX Regulator",
    Audit: "E-Lock w/Audit Tracking - SecuRam L22 (Prologic series)",
    LowProfile: "E-Lock Low Profile - CompX OEM series",
    Prox: "E-Lock Keypad & Prox - CompX 150 series",
    NetworkOnly: "E-Lock Network + WiFi Lock Only! - CompX 300 series",
    NetworkSupport: "E-Lock Network+WiFi w/Pro SW & Tech Sup - CompX 300",
    Basic: "E-Lock Basic - SecuRam (SafeLogic Basic)",
    Fingerprint: "E-Lock FingerPrint - SecuRam (ScanLogic Basic)",
    SmartHub: "E-Lock w/ BT/FP, w/ Hub (BT) - SecuRam (ScanLogic Smart)",
    Smart: "E-Lock w/ BT/FP No Hub (BT) - SecuRam (ScanLogic Smart)"
  };
  const lockKey = lockPriceMap[lock] || lock;
  return window.lockPrices?.[lockKey] || 0;
}
function calculateDoorCost() {
  const door = getSelectedValue("door");
  const height = window.currentHeight;
  const depth = parseInt(getSelectedValue("depth"));
  const width = parseInt(getSelectedValue("width"));

  const doorPriceMap = {
    Solid: "Solid",
    Clearview: "Clearview",
    Diamond: "Diamond Vent",
    Hex: "Hex Vent",
    Bins: "Bins on Doors",
    Peg: "Peg Board"
  };
  const doorKey = doorPriceMap[door] || door;
  const doorData = window.doorPricesByHeight?.[height]?.[doorKey];

  if (!doorData) return 0;

  return doorData?.[depth]?.[width] || 0;
}


function calculateShelfCost() {
  const standardQty = parseInt(getSelectedValue("standardShelfQty") || "0");
  const slideQty = parseInt(getSelectedValue("slideoutShelfQty") || "0");
  const depth = parseInt(getSelectedValue("depth"));
  const width = parseInt(getSelectedValue("width"));

  const shelfPrices = window.shelfPricesByHeight?.[currentHeight];

  const standardPrice = shelfPrices?.Standard?.[depth]?.[width] || 0;
  const slidePrice = shelfPrices?.["Slide-Out"]?.[depth]?.[width] || 0;

  return (standardQty * standardPrice) + (slideQty * slidePrice);
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
  // Step 7: Add -L if 14 gauge
  if (gauge === "14") {
    sku += `-L`;
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
  const doorCost = calculateDoorCost();

  const total = basePrice + drawerCost + lockCost + shelfCost + colorUpcharge + doorCost;

  const display = document.getElementById("finalPrice");
  if (display) {
    display.textContent = `$${total.toFixed(2)}`;
  }

  console.log("💵 Price Breakdown", {
    basePrice, drawerCost, lockCost, shelfCost, colorUpcharge, doorCost, total
  });

  generateSKU();
  generateDescription();
}

console.log("basePricesByHeight in controller.js:", window.basePricesByHeight);

document.querySelectorAll('input[name="drawerType"]').forEach(radio => {
  radio.addEventListener("change", (e) => {
    const selected = e.target.value;

    if (selected === "full") {
      document.getElementById("full-drawer-qty").style.display = "block";
      document.getElementById("half-drawer-qty").style.display = "none";
      createQuantityBubbles("full-qty-options", [3, 4, 5, 6]);  // or [1–10] if you prefer
    } else if (selected === "half") {
      document.getElementById("half-drawer-qty").style.display = "block";
      document.getElementById("full-drawer-qty").style.display = "none";
      createQuantityBubbles("half-qty-options", [3, 4, 5, 6]);
    } else {
      document.getElementById("full-drawer-qty").style.display = "none";
      document.getElementById("half-drawer-qty").style.display = "none";
    }

    updateTotalPrice(); // reflect default if switching drawer types
  });
});

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
document.addEventListener("change", (e) => {
  if (e.target.name === "height") {
    window.currentHeight = parseInt(e.target.value);  // ✅ Now updates global reference
    FULL_WIDTH_PRICES = window.drawerPricesByHeight?.[window.currentHeight]?.full || {};
    HALF_WIDTH_PRICES = window.drawerPricesByHeight?.[window.currentHeight]?.half || {};
    updateTotalPrice();
  }
});


  document.addEventListener('change', (e) => {
    if (e.target.matches("input[type='radio'], select")) {
      updateTotalPrice();
    }
  });
}
document.addEventListener("change", (e) => {
  if (e.target.name === "drawerQuantity") {
    console.log("Drawer quantity changed:", e.target.value);
    updateTotalPrice(); // Or updateTotalPriceDebug
  }
});

