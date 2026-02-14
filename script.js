// récupère le nom de la page (forepeak, lazaret…)
function getCurrentLocation() {
  const path = window.location.pathname;
  const page = path.split("/").pop();
  return page.replace(".html", "").toLowerCase().trim();
}

function displayBoxes() {
  const location = getCurrentLocation();

  // Si on est sur index.html → ne rien faire
  if (location === "index") return;

  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('container');
      const boxes = data[location];

      if (!boxes || boxes.length === 0) {
        container.innerHTML = "<p>Aucune boîte dans cette zone pour le moment.</p>";
        return;
      }

      boxes.forEach(box => {
        const boxDiv = document.createElement('div');
        boxDiv.className = 'box-card';

        boxDiv.innerHTML = `
          <a href="${location}_${box.id}.html" class="box-link">
            <h3>${box.name}</h3>
            <p>${box.description}</p>
          </a>
        `;

        container.appendChild(boxDiv);
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById('container').innerHTML = "<p>Erreur chargement data.json</p>";
    });
}

window.onload = displayBoxes;

// =============================
// RECHERCHE GLOBALE (HOME)
// =============================

// on vérifie juste si la barre existe
const searchInput = document.getElementById("search");

if (searchInput) {

  fetch("data.json")
    .then(res => res.json())
    .then(jsonData => {

      const localData = JSON.parse(localStorage.getItem("inventory")) || {};
      const data = { ...jsonData, ...localData };

      searchInput.addEventListener("input", () => {

        const table = document.getElementById("searchResultsTable");
        const term = searchInput.value.toLowerCase().trim();
        const resultsBody = document.getElementById("searchResults");
        resultsBody.innerHTML = "";


        if (term.length < 2) {
  table.style.display = "none";
  resultsBody.innerHTML = "";
  return;
}

table.style.display = "table";


        let resultsCount = 0;

        Object.keys(data).forEach(location => {
          if (!Array.isArray(data[location])) return;

          data[location].forEach(box => {

            const name = (box.name || box.title || "").toLowerCase();
            const desc = (box.description || "").toLowerCase();
            let items = "";

            if (Array.isArray(box.items)) {

                // ancien format (tableau de strings)
                if (typeof box.items[0] === "string") {
                  items = box.items.join(" ").toLowerCase();
                }

                // nouveau format (objets avec name)
                if (typeof box.items[0] === "object") {
                  items = box.items.map(i => i.name || "").join(" ").toLowerCase();
                }
              }

            const searchableText = name + " " + desc + " " + items;

            if (searchableText.includes(term)) {

              resultsCount++;

             // parcourir les items de la box
              if (Array.isArray(box.items)) {

                box.items.forEach(item => {

                  const itemName = typeof item === "string" ? item : item.name;
                  const qty = typeof item === "object" ? item.qty : "";

                  if (!itemName || !itemName.toLowerCase().includes(term)) return;

                  resultsCount++;

                  resultsBody.innerHTML += `
                    <tr class="search-row"
                      onclick="window.location='storage.html?zone=${location}&box=${box.id || box.ref}'">
                      
                      <td>${itemName}</td>
                      <td>${location}</td>
                      <td>${box.name || box.title || box.ref}</td>
                      <td>${qty || ""}</td>

                    </tr>
                  `;
                });

}

            }

          });
        });

        if (resultsCount === 0) {
         resultsBody.innerHTML = `
          <tr>
            <td colspan="4">No results found</td>
          </tr>`;

        }

      });

    });
}

// =============================
// RECHERCHE DANS UNE ZONE
// =============================

const searchZone = document.getElementById("searchZone");

if (searchZone) {

  fetch("data.json")
    .then(res => res.json())
    .then(jsonData => {

      const localData = JSON.parse(localStorage.getItem("inventory")) || {};
      const data = { ...jsonData, ...localData };

      const location = getCurrentLocation();

      searchZone.addEventListener("input", () => {

        const term = searchZone.value.toLowerCase().trim();
        const container = document.getElementById("container");
        container.innerHTML = "";

        const boxes = data[location];
        if (!boxes) return;

        boxes.forEach(box => {

          const name = (box.name || box.title || "").toLowerCase();
          const desc = (box.description || "").toLowerCase();

          let items = "";
          if (Array.isArray(box.items)) {
            if (typeof box.items[0] === "string") {
              items = box.items.join(" ").toLowerCase();
            }
            if (typeof box.items[0] === "object") {
              items = box.items.map(i => i.name || "").join(" ").toLowerCase();
            }
          }

          const searchableText = name + " " + desc + " " + items;

          if (searchableText.includes(term)) {

            const boxDiv = document.createElement('div');
            boxDiv.className = 'box-card';

            boxDiv.innerHTML = `
              <a href="storage.html?zone=${location}&box=${box.id || box.ref}" class="box-link-full">
                <h3>${box.name || box.title}</h3>
                <p>${box.description || ""}</p>
              </a>
            `;

            container.appendChild(boxDiv);
          }

        });

      });

    });

}
