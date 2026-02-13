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

        const term = searchInput.value.toLowerCase().trim();
        const resultsDiv = document.getElementById("searchResults");
        resultsDiv.innerHTML = "";

        if (term.length < 2) return;

        let resultsCount = 0;

        Object.keys(data).forEach(location => {
          if (!Array.isArray(data[location])) return;

          data[location].forEach(box => {

            const name = (box.name || box.title || "").toLowerCase();
            const desc = (box.description || "").toLowerCase();
            const items = Array.isArray(box.items) ? box.items.join(" ").toLowerCase() : "";

            const searchableText = name + " " + desc + " " + items;

            if (searchableText.includes(term)) {

              resultsCount++;

              resultsDiv.innerHTML += `
                <div class="result-card">
                  <a href="${location}_${box.id || box.ref}.html">
                    <strong>${box.name || box.title}</strong><br>
                    ${box.description || ""}
                    <br><small>📍 ${location}</small>
                  </a>
                </div>
              `;
            }

          });
        });

        if (resultsCount === 0) {
          resultsDiv.innerHTML = "<p>No results found.</p>";
        }

      });

    });
}

