const params = new URLSearchParams(window.location.search);
const ZONE = params.get("zone");
const REF = params.get("box");

let currentItemFilter = "";

const data = JSON.parse(localStorage.getItem("inventory")) || {};
const storage = (data[ZONE] || []).find(b => b.ref === REF);

if (!storage.items) storage.items = [];
if (!storage.photos) storage.photos = [];

document.getElementById("storageTitle").innerText = REF;
const zoneName = ZONE.charAt(0).toUpperCase() + ZONE.slice(1);
const backLink = document.getElementById("backLink");
backLink.href = ZONE + ".html";
backLink.innerText = "← " + zoneName;



function save() {
  localStorage.setItem("inventory", JSON.stringify(data));
}

/* ---------------- ITEMS ---------------- */

function renderItems() {
  const body = document.getElementById("inventoryBody");
  body.innerHTML="";

  storage.items.forEach((item,i)=>{

if(!item.name.toLowerCase().includes(currentItemFilter)) return;

    const photoCell = item.photo
      ? `<img src="${item.photo}" class="item-thumb" onclick="openItemPhoto(${i})">`
      : `<button type="button" onclick="addItemPhoto(${i})">Add</button>`;


    body.innerHTML += `
      <tr>
        <td>${item.name}</td>

        <td>
        <input type="number" min="0" value="${item.qty}"
        onchange="updateQty(${i}, this.value)">
        </td>

        <td>${photoCell}</td>

        <td>${item.date}</td>

        <td onclick="deleteItem(${i})">🗑</td>
      </tr>`;
  });
}




function addItem(){
  let name = prompt("Item name");
  if(!name) return;

  name = name.trim().toLowerCase();

  const now = new Date();
  const day = String(now.getDate()).padStart(2,'0');
  const month = String(now.getMonth()+1).padStart(2,'0');
  const year = now.getFullYear();
  const dateStr = `${day}/${month}/${year}`;

  storage.items.push({
    name,
    qty: 1,
    date: dateStr,
    photo: null
  });

  save();
  renderItems();
}



function deleteItem(i){
  storage.items.splice(i,1);
  save();
  renderItems();
}

function addItemPhoto(index){
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = e => {
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = event => {
      storage.items[index].photo = event.target.result;
      save();
      renderItems();
    };

    reader.readAsDataURL(file);
  };

  input.click();
}





/* ================= PHOTOS ================= */

function renderPhotos(){
  const gallery = document.getElementById("photoGallery");
  gallery.innerHTML = "";

  storage.photos.forEach((photo, i) => {
    gallery.innerHTML += `
      <div class="photo-card">

        <div class="photo-wrapper">
          <img src="${photo.src}" class="photo-thumb" onclick="openViewer(${i})">
          <div class="delete-photo-thumb" onclick="deletePhotoThumb(${i})">🗑</div>
        </div>

        <small>${photo.date}</small>
      </div>
    `;
  });
}

function deletePhotoThumb(index){
  if(!confirm("Delete photo?")) return;

  storage.photos.splice(index,1);
  save();
  renderPhotos();
}


function addPhoto(){
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event){
      const img = new Image();

      img.onload = function(){
        const canvas = document.createElement("canvas");
        const maxSize = 800;
        let width = img.width;
        let height = img.height;

        if(width > height && width > maxSize){
          height *= maxSize / width;
          width = maxSize;
        } else if(height > maxSize){
          width *= maxSize / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0,width,height);

        const compressed = canvas.toDataURL("image/jpeg",0.7);

        const now = new Date();
        const day = String(now.getDate()).padStart(2,'0');
        const month = String(now.getMonth()+1).padStart(2,'0');
        const year = now.getFullYear();
        const dateStr = `Added on ${day}/${month}/${year}`;

        storage.photos.push({
          src: compressed,
          date: dateStr
        });

        save();
        renderPhotos();
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  input.click();
}

/* ===== PHOTO VIEWER ===== */

let currentPhoto = 0;
const photoViewer = document.getElementById("photoViewer");

let viewerMode = "gallery"; // gallery | item
let currentItemIndex = null;

function openViewer(index){
  viewerMode = "gallery";
  currentPhoto = index;
  photoViewer.classList.remove("hidden");
  showPhoto();
}

function showPhoto(){
    document.getElementById("nextPhoto").style.display = "block";
    document.getElementById("prevPhoto").style.display = "block";
    
    document.getElementById("viewerImg").src = storage.photos[currentPhoto].src;
    document.getElementById("viewerDate").innerText = storage.photos[currentPhoto].date;
}

document.getElementById("closeViewer").onclick = () =>
  photoViewer.classList.add("hidden");

document.getElementById("nextPhoto").onclick = () => {
  currentPhoto = (currentPhoto + 1) % storage.photos.length;
  showPhoto();
};

document.getElementById("prevPhoto").onclick = () => {
  currentPhoto = (currentPhoto - 1 + storage.photos.length) % storage.photos.length;
  showPhoto();
};

document.getElementById("deletePhoto").onclick = () => {

  if(!confirm("Delete photo?")) return;

  if(viewerMode === "gallery"){
    storage.photos.splice(currentPhoto,1);
    renderPhotos();
  }

  if(viewerMode === "item"){
    storage.items[currentItemIndex].photo = null;
    renderItems();
  }

  save();
  photoViewer.classList.add("hidden");
};


document.addEventListener("keydown", e => {

  if(photoViewer.classList.contains("hidden")) return;

  // ❌ pas de navigation clavier pour les photos d'item
  if(viewerMode === "item") return;

  if(e.key === "ArrowRight") document.getElementById("nextPhoto").onclick();
  if(e.key === "ArrowLeft") document.getElementById("prevPhoto").onclick();
});


function updateQty(index, value){
  storage.items[index].qty = value;
  save();
}

function openItemPhoto(index){
  const photo = storage.items[index].photo;
  if(!photo) return;

  viewerMode = "item";
  currentItemIndex = index;

  photoViewer.classList.remove("hidden");
  document.getElementById("viewerImg").src = photo;
  document.getElementById("viewerDate").innerText = "";

  // cacher flèches (pas de navigation)
  document.getElementById("nextPhoto").style.display = "none";
  document.getElementById("prevPhoto").style.display = "none";
}


/* ===== SEARCH ITEMS ===== */

window.addEventListener("DOMContentLoaded", () => {
  const searchInputItem = document.getElementById("searchItem");
  if(!searchInputItem) return;

  searchInputItem.addEventListener("input", () => {
    currentItemFilter = searchInputItem.value.toLowerCase().trim();
    renderItems();
  });
});


/* ===== INIT PAGE ===== */

renderItems();
renderPhotos();




