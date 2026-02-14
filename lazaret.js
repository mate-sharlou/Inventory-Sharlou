const ZONE = "lazaret";

// stockage local
function getLocalBoxes() {
  const data = localStorage.getItem("inventory");
  return data ? JSON.parse(data) : {};
}

function saveLocalBoxes(data) {
  localStorage.setItem("inventory", JSON.stringify(data));
}

// afficher les boxes
function renderLazaretBoxes() {
  const container = document.getElementById("container");
  container.innerHTML = "";

  const localData = getLocalBoxes();
  const boxes = localData[ZONE] || [];

 boxes.forEach(box => {
  const div = document.createElement("div");
  div.className = "box-card";

  div.innerHTML = `
  <a href="storage.html?zone=${ZONE}&box=${box.ref}" class="box-link-full">
    <h3>${box.ref}</h3>
    <p class="box-title">${box.title || "No title"}</p>
    <small>${box.description || ""}</small>
  </a>

  <div class="edit-btn" onclick="editBox('${box.ref}')">✏️</div>
  <div class="delete-btn" onclick="deleteBox('${box.ref}')">🗑</div>
`;



  container.appendChild(div);
});

}

// création box
function addStorage() {
  const ref = prompt("Storage reference (ex: LZ01)");
  if (!ref) return;

  const title = prompt("Title");
  if (!title) return;

  const description = prompt("Description");
  if (!description) return;

  const data = getLocalBoxes();
  if (!data[ZONE]) data[ZONE] = [];

  data[ZONE].push({ ref, title, description });
  saveLocalBoxes(data);


  renderLazaretBoxes();
}

function editBox(ref){
  const data = getLocalBoxes();
  const boxes = data[ZONE];
  const box = boxes.find(b => b.ref === ref);
  if(!box) return;

  const newRef = prompt("Storage reference", box.ref);
  if(!newRef) return;

  const newTitle = prompt("Storage title", box.title || "");
  const newDesc = prompt("Storage description", box.description || "");

  box.ref = newRef.trim();
  box.title = newTitle.trim();
  box.description = newDesc.trim();

  saveLocalBoxes(data);
  renderLazaretBoxes();
}


// création page box automatique (vide pour l’instant)

// recherche locale
document.getElementById("searchZone").addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  const cards = document.querySelectorAll(".box-card");
  let found = false;

  cards.forEach(card => {
    const match = card.innerText.toLowerCase().includes(term);
    card.style.display = match ? "block" : "none";
    if (match) found = true;
  });

  // message no result
  let msg = document.getElementById("noResultMsg");

  if (!found && term.length > 0) {
    if (!msg) {
      msg = document.createElement("p");
      msg.id = "noResultMsg";
      msg.innerText = "No results found.";
      document.getElementById("container").appendChild(msg);
    }
  } else {
    if (msg) msg.remove();
  }
});


window.onload = renderLazaretBoxes;

function deleteBox(ref) {
  const confirmDelete = confirm("Delete this storage?");
  if (!confirmDelete) return;

  const data = getLocalBoxes();
  const boxes = data[ZONE] || [];

  data[ZONE] = boxes.filter(box => box.ref !== ref);

  saveLocalBoxes(data);
  renderLazaretBoxes();
}
