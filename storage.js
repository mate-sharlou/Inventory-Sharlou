function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    zone: params.get("zone"),
    ref: params.get("box")
  };
}

function loadStorage() {
  const { zone, ref } = getParams();

  document.getElementById("backLink").href = zone + ".html";

  const data = JSON.parse(localStorage.getItem("inventory")) || {};
  const boxes = data[zone] || [];
  const box = boxes.find(b => b.ref === ref);

  if (!box) {
    document.getElementById("inventoryContainer").innerHTML = "<p>Storage not found.</p>";
    return;
  }

  document.getElementById("storageTitle").innerText =
    box.ref + " - " + box.title;

  document.getElementById("inventoryContainer").innerHTML =
    "<p>Inventory coming next 🙂</p>";
}

window.onload = loadStorage;
