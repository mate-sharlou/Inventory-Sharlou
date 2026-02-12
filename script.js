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
// RECHERCHE GLOBALE (HOME PAGE)
// =============================
const path = window.location.pathname;
const isHome = path.endsWith("/") || path.endsWith("index.html");

if (isHome) {
  const searchInput = document.getElementById("search");

  fetch("data.json")
    .then(res => res.json())
    .then(data => {

      searchInput.addEventListener("input", () => {
        const term = searchInput.value.toLowerCase().trim();
        const resultsDiv = document.getElementById("searchResults");
        resultsDiv.innerHTML = "";

        if (term.length < 2) return;

        Object.keys(data).forEach(location => {
          data[location].forEach(box => {

            // texte searchable
            const itemsText = box.items.join(" ").toLowerCase();
            const boxText = (box.name + " " + box.description).toLowerCase();

            if (itemsText.includes(term) || boxText.includes(term)) {
              resultsDiv.innerHTML += `
                <div class="result-card">
                  <a href="${location}_${box.id}.html">
                    <strong>${box.name}</strong><br>
                    ${box.description}<br>
                    <small>📍 ${location}</small>
                  </a>
                </div>
              `;
            }

          });
        });

      });
    });
}
