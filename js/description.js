function generateDescription() {
  const gauge = getSelectedValue("gauge");
  const width = getSelectedValue("width");
  const depth = getSelectedValue("depth");
  const height = getSelectedValue("height");
  const lock = getSelectedValue("lock") || "No Lock";
  const color = getSelectedValue("color");
  const lockDescription = lock !== "none" ? lock : "";
  const colorDisplay = document.querySelector(`input[name='color']:checked`)?.title || color;
  
  const fullHeights = getFullDrawerHeights();
  const halfHeights = getHalfDrawerHeights().flatMap(h => [h, h]); // Each selector = 2 drawers

  const allHeights = [...fullHeights, ...halfHeights];
  const drawerMap = {};
  allHeights.forEach(h => {
    drawerMap[h] = (drawerMap[h] || 0) + 1;
  });

let drawerDescription = "";
if (allHeights.length > 0) {
  drawerDescription = Object.entries(drawerMap)
    .map(([height, qty]) => `(${qty}) ${height}" Drawers`)
    .join(', ');
}

const selectedColorInput = document.querySelector('input[name="color"]:checked');
let colorTitle = "";
if (selectedColorInput) {
  const colorLabel = document.querySelector(`label[for="${selectedColorInput.id}"]`);
  colorTitle = colorLabel?.title || "";
}

const standardShelfQty = parseInt(getSelectedValue("standardShelfQty") || "0");
const slideoutShelfQty = parseInt(getSelectedValue("slideoutShelfQty") || "0");
const totalShelves = standardShelfQty + slideoutShelfQty;

let shelfText = "No Shelves";
if (totalShelves > 0) {
  const parts = [];
  if (standardShelfQty > 0) parts.push(`${standardShelfQty} Standard Divider Kits`);
  if (slideoutShelfQty > 0) parts.push(`${slideoutShelfQty} Slide-Out Divider Kits`);
  shelfText = `${parts.join(", ")} `;
}

let description = `${gauge} Gauge Heavy Duty Modular Cabinet, ${width}" w x ${depth}" d x ${height}" h, Standard Steel Top, 3" Legs`;

if (lockDescription) description += `, ${lockDescription}`;
description += `, Cabinet Color ${colorTitle || colorDisplay}`;

if (drawerDescription) description += `, ${drawerDescription}`;
if (shelfText !== "No Shelves") description += `, ${shelfText}`;


  
  const descBox = document.getElementById("descriptionText");
  if (descBox) descBox.value = description;

  return description;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Copy to clipboard handler
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("copyDescriptionBtn")?.addEventListener("click", () => {
    const text = document.getElementById("descriptionText").value;
    navigator.clipboard.writeText(text).then(() => {
      alert("Description copied to clipboard!");
    });
  });
});
