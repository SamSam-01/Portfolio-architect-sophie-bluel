document.addEventListener("DOMContentLoaded", () => {
  const portfolio = document.querySelector("#portfolio .gallery");
  const filterButtons = document.querySelector("#filter-buttons");

  // Générer les boutons de filtre
  const categories = new Set(); // Utilisation d'un Set pour des valeurs uniques

  fetch("http://localhost:5678/api/works")
    .then((response) => response.json())
    .then((works) => {
      works.forEach((work) => {
        categories.add(work.category.name); // Ajouter la catégorie à notre Set

        const figure = document.createElement("figure");
        figure.classList.add("project"); // Ajout d'une classe pour faciliter le filtrage
        figure.dataset.category = work.category.name; // Ajout d'un attribut de catégorie

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement("figcaption");
        figcaption.innerText = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        portfolio.appendChild(figure);
      });

      // Bouton "Tous"
      const allButton = document.createElement("button");
      allButton.innerText = "Tous";
      allButton.classList.add("active"); // Classe active par défaut
      allButton.addEventListener("click", () => filterProjects(null));
      filterButtons.appendChild(allButton);
      // Créer des boutons de filtre basés sur les catégories
      categories.forEach(category => {
        const button = document.createElement("button");
        button.innerText = category;
        button.addEventListener("click", () => filterProjects(category));
        filterButtons.appendChild(button);
      });
    })
    .catch((error) => {
      console.error("Une erreur s'est produite:", error);
    });

    function filterProjects(category) {
      document.querySelectorAll(".project").forEach(project => {
        project.style.display = (project.dataset.category === category || !category) ? "block" : "none";
      });
    
      // Mettre à jour l'état actif des boutons
      document.querySelectorAll("#filter-buttons button").forEach(button => {
        button.classList.remove("active");
      });
    
      if (category) {
        const activeButton = Array.from(document.querySelectorAll("#filter-buttons button")).find(button => button.innerText === category);
        if (activeButton) {
          activeButton.classList.add("active");
        }
      } else {
        const allButton = document.querySelector("#filter-buttons button");
        if (allButton) {
          allButton.classList.add("active");
        }
      }
    }    
});
