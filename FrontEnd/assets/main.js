const portfolio = document.querySelector("#portfolio .gallery");
const filterButtons = document.querySelector("#filter-buttons");
const token = localStorage.getItem("token");
const categories = new Set();
const loginButton = document.getElementById("login-button");
const portfolioContent = document.getElementById("portfolio-content");
const loginForm = document.getElementById("login-form");

async function get_data(type) {
  try {
    const response = await fetch("http://localhost:5678/api/" + type);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error(`Erreur HTTP: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error("Une erreur s'est produite:", error);
    return null;
  }
}

async function updateWorks() {
  try {
    // Supprimer les anciens éléments
    while (portfolio.firstChild) {
      portfolio.removeChild(portfolio.firstChild);
    }
    while (filterButtons.firstChild) {
      filterButtons.removeChild(filterButtons.firstChild);
    }

    const works = await get_data("works");
    const categoriesData = await get_data("categories");

    if (works && categoriesData) {
      works.forEach((work) => {
        const figure = document.createElement("figure");
        figure.classList.add("project");
        figure.dataset.category = work.category.name;

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
      allButton.classList.add("active");
      allButton.addEventListener("click", () => filterProjects(null));
      filterButtons.appendChild(allButton);

      // Ajout des catégories depuis la requête
      categoriesData.forEach((category) => {
        const button = document.createElement("button");
        button.innerText = category.name;
        button.addEventListener("click", () => filterProjects(category.name));
        filterButtons.appendChild(button);
      });
    }
  } catch (error) {
    console.error("Une erreur s'est produite:", error);
  }
}

function filterProjects(category) {
  document.querySelectorAll(".project").forEach((project) => {
    project.style.display =
      project.dataset.category === category || !category ? "block" : "none";
  });

  // Mettre à jour l'état actif des boutons
  document.querySelectorAll("#filter-buttons button").forEach((button) => {
    button.classList.remove("active");
  });

  if (category) {
    const activeButton = Array.from(
      document.querySelectorAll("#filter-buttons button")
    ).find((button) => button.innerText === category);
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

function showModalWithImages() {
  const modal = document.getElementById("modal");
  const imageGallery = document.querySelector(".image-gallery");

  // Vider la galerie
  while (imageGallery.firstChild) {
    imageGallery.removeChild(imageGallery.firstChild);
  }

  // Ajouter les images
  const projects = document.querySelectorAll(".project");
  projects.forEach((project) => {
    const img = document.createElement("img");
    img.src = project.querySelector("img").src;
    

    const trashIcon = document.createElement("i");
    trashIcon.className = "fas fa-trash-can";

    trashIcon.addEventListener("click", function() {
      console.log('delete project' + project.dataset.userId );
    });

    const container = document.createElement("div");
    container.className = "container-div";
    container.appendChild(img);
    container.appendChild(trashIcon);

    imageGallery.appendChild(container);
  });
  
  // Afficher le modal
  modal.style.display = "flex";
}

function updateStatus(status) {
  if (status === "connect") {
    document.getElementById("login-button").textContent = "logout";
    document.getElementById("editModeBanner").classList.remove("hidden");
    document.getElementById("login").style.display = "none";
    portfolioContent.style.removeProperty("display");
  } else if (status === "disconnect") {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    document.getElementById("editModeBanner").classList.add("hidden");
    loginButton.textContent = "login";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Écouteur pour fermer le modal
  document.addEventListener("click", function (event) {
    if (event.target.id === "modal") {
      document.getElementById("modal").style.display = "none";
    }
  });

  document.querySelector(".close").addEventListener("click", function () {
    document.getElementById("modal").style.display = "none";
  });

  // Écouteur pour le bouton "Ajouter une photo"
  document.getElementById("add-photo").addEventListener("click", function () {
    console.log("add");
  });

  // Initialisation du modal
  document
    .getElementById("edit-mode")
    .addEventListener("click", showModalWithImages);

  if (token) {
    updateStatus("connect");
  }

  // Initialisation des projets
  updateWorks();

  loginButton.addEventListener("click", () => {
    const loginSection = document.getElementById("login");
    if (loginSection.style.display === "none") {
      loginSection.style.display = "block";
      portfolioContent.style.display = "none";
    } else {
      loginSection.style.display = "none";
      portfolioContent.style.removeProperty("display");
    }
  });

  // Gérer la connexion
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        updateStatus("connect");
      } else {
        alert("Identifiants incorrects.");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      alert(
        "Une erreur est survenue lors de la connexion. Veuillez réessayer."
      );
    }
  });

  // Gérer la déconnexion
  loginButton.addEventListener("click", () => {
    if (loginButton.textContent === "logout") {
      updateStatus("disconnect");
    }
  });
});
