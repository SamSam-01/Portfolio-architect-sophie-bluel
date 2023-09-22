document.addEventListener("DOMContentLoaded", () => {
  const portfolio = document.querySelector("#portfolio .gallery");
  const filterButtons = document.querySelector("#filter-buttons");
  console.log(localStorage.getItem("token"));

  const token = localStorage.getItem("token");
  if (token) {
      document.getElementById("login-button").textContent = "logout";
  }

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
  const loginButton = document.getElementById("login-button");
  const sectionsToHide = [document.getElementById("introduction"), document.getElementById("portfolio"), document.getElementById("contact")];

  loginButton.addEventListener("click", () => {
      const loginSection = document.getElementById("login");
      if (loginSection.style.display === "none") {
          loginSection.style.display = "block";
          sectionsToHide.forEach(section => section.style.display = "none");
      } else {
          loginSection.style.display = "none";
          sectionsToHide.forEach(section => section.style.removeProperty("display"));
      }
  });
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = e.target.email.value;
      const password = e.target.password.value;

      try {
          const response = await fetch("http://localhost:5678/api/users/login", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  email,
                  password
              })
          });

          const data = await response.json();

          if (data.token) {
              localStorage.setItem("token", data.token);
              localStorage.setItem("userId", data.userId);

              console.log(localStorage.getItem("token"));

              document.getElementById("login").style.display = "none";
              sectionsToHide.forEach(section => section.style.removeProperty("display"));
              loginButton.textContent = "logout";
          } else {
              alert("Identifiants incorrects.");
          }
      } catch (error) {
          console.error("Erreur de connexion:", error);
          alert("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
      }
  });
  // Gérer la déconnexion
  loginButton.addEventListener("click", () => {
    if (loginButton.textContent === "logout") {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        loginButton.textContent = "login";
    }
  });
});
