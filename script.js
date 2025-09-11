// --- Donnees ---
const etat = {
  filtre: "toutes",
  taches: [],
};

// Charger depuis le stockage local si possible
try {
  const sauvegarde = localStorage.getItem("taches");
  if (sauvegarde) {
    etat.taches = JSON.parse(sauvegarde);
  }
} catch (e) {}

const form = document.getElementById("form-nouvelle-tache");
const champ = document.getElementById("champ-tache");
const liste = document.getElementById("liste-taches");
const msgVide = document.getElementById("message-vide");
const onglets = document.querySelectorAll(".onglet");
const btnToutEffacer = document.getElementById("tout-effacer");

// Utilitaires
const uid = () => Math.random().toString(36).slice(2, 9);

function sauvegarder() {
  try {
    localStorage.setItem("taches", JSON.stringify(etat.taches));
  } catch (e) {}
}

function rendre() {
  // Filtrer
  let aAfficher = etat.taches;
  if (etat.filtre === "en-attente") {
    aAfficher = etat.taches.filter((t) => !t.terminee);
  } else if (etat.filtre === "terminees") {
    aAfficher = etat.taches.filter((t) => t.terminee);
  }

  // Vider la liste
  liste.innerHTML = "";

  if (aAfficher.length === 0) {
    msgVide.style.display = "block";
  } else {
    msgVide.style.display = "none";
  }

  // Construction du DOM
  aAfficher.forEach((t) => {
    const li = document.createElement("li");
    li.className = "tache" + (t.terminee ? " terminee" : "");
    li.dataset.id = t.id;

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "tache__checkbox";
    cb.checked = t.terminee;
    cb.title = "Marquer comme terminée";
    cb.addEventListener("change", () => basculer(t.id));

    const p = document.createElement("p");
    p.className = "tache__texte";
    p.textContent = t.texte;

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = t.terminee ? "Terminée" : "En attente";

    // Menu
    const menu = document.createElement("div");
    menu.className = "menu";

    const bouton = document.createElement("button");
    bouton.className = "menu__bouton";
    bouton.setAttribute("aria-haspopup", "true");
    bouton.setAttribute("aria-expanded", "false");
    bouton.title = "Options";
    bouton.innerHTML = "&#8942;";
    bouton.addEventListener("click", (e) => {
      e.stopPropagation();
      fermerTousLesMenus();
      menu.classList.toggle("ouvert");
      bouton.setAttribute("aria-expanded", menu.classList.contains("ouvert"));
    });

    const listeMenu = document.createElement("div");
    listeMenu.className = "menu__liste";

    const btnEdit = document.createElement("button");
    btnEdit.className = "menu__item";
    btnEdit.textContent = "Modifier";
    btnEdit.addEventListener("click", () => {
      menu.classList.remove("ouvert");
      modifier(t.id);
    });

    const btnSuppr = document.createElement("button");
    btnSuppr.className = "menu__item";
    btnSuppr.textContent = "Supprimer";
    btnSuppr.addEventListener("click", () => {
      menu.classList.remove("ouvert");
      supprimer(t.id);
    });

    listeMenu.append(btnEdit, btnSuppr);
    menu.append(bouton, listeMenu);

    li.append(cb, p, badge, menu);
    liste.appendChild(li);
  });
}

function fermerTousLesMenus() {
  document
    .querySelectorAll(".menu.ouvert")
    .forEach((m) => m.classList.remove("ouvert"));
  document
    .querySelectorAll('.menu__bouton[aria-expanded="true"]')
    .forEach((b) => b.setAttribute("aria-expanded", "false"));
}

document.addEventListener("click", () => fermerTousLesMenus());
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fermerTousLesMenus();
});

// --- Actions ---
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const texte = champ.value.trim();
  if (!texte) return;
  etat.taches.unshift({ id: uid(), texte, terminee: false });
  champ.value = "";
  sauvegarder();
  rendre();
});

btnToutEffacer.addEventListener("click", () => {
  if (etat.taches.length === 0) return;
  const ok = confirm("Voulez-vous vraiment supprimer toutes les tâches ?");
  if (ok) {
    etat.taches = [];
    sauvegarder();
    rendre();
  }
});

onglets.forEach((b) =>
  b.addEventListener("click", () => {
    onglets.forEach((x) => x.classList.remove("actif"));
    b.classList.add("actif");
    etat.filtre = b.dataset.filtre;
    rendre();
  })
);

function basculer(id) {
  const t = etat.taches.find((x) => x.id === id);
  if (!t) return;
  t.terminee = !t.terminee;
  sauvegarder();
  rendre();
}

function modifier(id) {
  const t = etat.taches.find((x) => x.id === id);
  if (!t) return;
  const nv = prompt("Modifier la tâche :", t.texte);
  // annule
  if (nv === null) return;
  const propre = nv.trim();
  if (propre) {
    t.texte = propre;
    sauvegarder();
    rendre();
  }
}

function supprimer(id) {
  etat.taches = etat.taches.filter((x) => x.id !== id);
  sauvegarder();
  rendre();
}

rendre();
