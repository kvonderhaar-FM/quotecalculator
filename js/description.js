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
  if (standardShelfQty > 0) parts.push(`${standardShelfQty} Standard Shelves`);
  if (slideoutShelfQty > 0) parts.push(`${slideoutShelfQty} Slide-out Shelves`);
  shelfText = `${parts.join(", ")} `;
}

const parsedGauge = parseInt(gauge);
let OAH = 0;

if (parsedGauge === 12) {
  OAH = parseInt(height) + 6;
} else if (parsedGauge === 14) {
  OAH = parseInt(height) + 3;
}

let description = `${parsedGauge} Gauge ${width}" w x ${depth}" d x ${height}" h (OAH: ${OAH}") Cabinet`;

// Append optional fields only if valid
if (drawerDescription && drawerDescription !== "None") {
  description += `, ${drawerDescription.trim()}`;
}

if (shelfText && shelfText !== "No Shelves") {
  description += `, ${shelfText.trim()}`;
}

if (lockDescription && lockDescription !== "None") {
  description += `, ${lockDescription.trim()}`;
}

const normalizedColor = (colorTitle || colorDisplay || "").toLowerCase();
const isDefaultGray = normalizedColor.includes("dusty gray") || normalizedColor.includes("gray");

if (!isDefaultGray && (colorTitle || colorDisplay)) {
  description += `, Cabinet Color ${colorTitle || colorDisplay}`;
}


// Output to UI
const descBox = document.getElementById("descriptionText");
if (descBox) descBox.value = description;

return description;

}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Clipboard copy handlers
document.addEventListener("DOMContentLoaded", () => {
  // Copy full description
  const descriptionBtn = document.getElementById("copyDescriptionBtn");
  if (descriptionBtn) {
    descriptionBtn.addEventListener("click", () => {
      const text = document.getElementById("descriptionText")?.value || "";
      navigator.clipboard.writeText(text).then(() => {
        alert("Description copied to clipboard!");
      }).catch(err => {
        console.error("❌ Failed to copy description:", err);
      });
    });
  }

  // Copy dimensions + OAH
  const dimensionsBtn = document.getElementById("copyDimensionsBtn");
  if (dimensionsBtn) {
    dimensionsBtn.addEventListener("click", () => {
      const gauge = parseInt(getSelectedValue("gauge"));
      const width = getSelectedValue("width");
      const depth = getSelectedValue("depth");
      const height = parseInt(getSelectedValue("height"));

      let OAH = 0;
      if (gauge === 12) OAH = height + 6;
      else if (gauge === 14) OAH = height + 3;

      const dimensionText = `${gauge} Gauge ${width}" w x ${depth}" d x ${height}" h (OAH: ${OAH}")`;

      navigator.clipboard.writeText(dimensionText).then(() => {
        alert("Dimensions copied to clipboard!");
      }).catch(err => {
        console.error("❌ Failed to copy dimensions:", err);
      });
    });
  }
});
