const portfolio = document.querySelector("#portfolio .gallery");
const filterButtons = document.querySelector("#filter-buttons");
const token = localStorage.getItem("token");
const categories = new Set();
const loginButton = document.getElementById("login-button");
const portfolioContent = document.getElementById("portfolio-content");
const loginForm = document.getElementById("login-form");
var works = null;
var categoriesData = null;

const get_token = () => {
  return localStorage.getItem("token");
}

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
    while (portfolio.firstChild) {
      portfolio.removeChild(portfolio.firstChild);
    }
    while (filterButtons.firstChild) {
      filterButtons.removeChild(filterButtons.firstChild);
    }

    works = await get_data("works");
    categoriesData = await get_data("categories");

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

      const allButton = document.createElement("button");
      allButton.innerText = "Tous";
      allButton.classList.add("active");
      allButton.addEventListener("click", () => filterProjects(null));
      filterButtons.appendChild(allButton);

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

  while (imageGallery.firstChild) {
    imageGallery.removeChild(imageGallery.firstChild);
  }

  // Show every project
  works.forEach((work) => {
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const trashIcon = document.createElement("i");
    trashIcon.className = "fas fa-trash-can";

    trashIcon.addEventListener("click", function() {
      console.log('delete project' + work.id );
      console.log(get_token);
      fetch("http://localhost:5678/api/works/" + work.id, { 
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + get_token()
        }
      }).then(response => {
        if (response.ok) {
            container.remove();
        } else {
            console.error("Erreur lors de la suppression du projet");
        }
      }).catch(error => {
          console.error("Erreur de fetch :", error);
      });
      updateWorks();
    });

    const container = document.createElement("div");
    container.className = "container-div";
    container.appendChild(img);
    container.appendChild(trashIcon);

    imageGallery.appendChild(container);
  });

  document.getElementById("add-photo").addEventListener("click", function() {
      document.querySelector(".gallery-content").style.display = "none";
      document.querySelector(".add-content").style.display = "flex";
  });

  document.getElementById("back-to-gallery").addEventListener("click", function() {
      document.querySelector(".add-content").style.display = "none";
      document.querySelector(".gallery-content").style.display = "block";
  });

  document.getElementById("image-upload").addEventListener("change", function(event) {
      const file = event.target.files[0];
      if (file.size > 4000000) {
          alert("La taille de l'image est trop grande!");
          return;
      }
      const imageSection = document.querySelector(".add-image-section");
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.width = 100;
      imageSection.insertBefore(img, imageSection.firstChild);
  });

  const dropdown = document.getElementById("category-dropdown");
  while (dropdown.firstChild) {
    dropdown.removeChild(dropdown.firstChild);
  }
  categoriesData.forEach(category => {
      let option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      dropdown.appendChild(option);
  });

  // Add project
  document.getElementById("submit-photo").addEventListener("click", function() {
      const formData = new FormData();
      formData.append("image", document.getElementById("image-upload").files[0]);
      formData.append("title", document.getElementById("project-title").value);
      formData.append("category", dropdown.value);

      fetch("http://localhost:5678/api/works", {
          method: "POST",
          headers: {
              "Authorization": "Bearer " + get_token()
          },
          body: formData
      }).then(response => {
          if (response.ok) {
              alert("Projet ajouté avec succès!");
              formData.delete("image");
              formData.delete("title");
              formData.delete("category");
              document.querySelector(".add-content").style.display = "none";
              document.querySelector(".gallery-content").style.display = "none";
              modal.style.display = "none"
              updateWorks();
          } else {
              console.error("Erreur lors de l'ajout du projet");
          }
      }).catch(error => {
          console.error("Erreur de fetch:", error);
      });
  });

  modal.style.display = "flex";
}

function updateStatus(status) {
  if (status === "connect") {
    document.getElementById("login-button").textContent = "logout";
    document.getElementById("editModeBanner").classList.remove("hidden");
    document.getElementById("edit-mode").classList.remove("hidden");
    document.getElementById("login").style.display = "none";
    portfolioContent.style.removeProperty("display");
  } else if (status === "disconnect") {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    document.getElementById("editModeBanner").classList.add("hidden");
    document.getElementById("edit-mode").classList.add("hidden");
    loginButton.textContent = "login";
  }
}

function closemodal() {
  document.querySelector(".gallery-content").style.display = "block";
  document.getElementById("modal").style.display = "none";
  document.querySelector(".add-content").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", function (event) {
    if (event.target.id === "modal") {
      closemodal();
    }
  });

  document.querySelector(".close").addEventListener("click", function () {
    closemodal();
  });

  document
    .getElementById("edit-mode")
    .addEventListener("click", showModalWithImages);

  if (get_token()) {
    updateStatus("connect");
  }

  updateWorks();

  const navbarButtons = document.querySelectorAll("nav ul li a, #home-btn, nav ul li img");
  navbarButtons.forEach(button => {
    button.addEventListener("click", () => {
      const loginSection = document.getElementById("login");
      if (loginSection.style.display === "block") {
        loginSection.style.display = "none";
        portfolioContent.style.removeProperty("display");
        loginButton.style.fontWeight = "normal";
      }
    });
  });

  document.getElementById("home-btn").addEventListener("click", function() {
    history.pushState(null, null, window.location.pathname);
  });


  loginButton.addEventListener("click", () => {
    const loginSection = document.getElementById("login");
    if (loginSection.style.display === "none") {
      loginButton.style.fontWeight = "bold";
      loginSection.style.display = "block";
      portfolioContent.style.display = "none";
    }
    else {
      loginButton.style.fontWeight = "normal";
      loginSection.style.display = "none";
      portfolioContent.style.removeProperty("display");
    }
  });

  // Connexion
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

  loginButton.addEventListener("click", () => {
    if (loginButton.textContent === "logout") {
      updateStatus("disconnect");
    }
  });
});
