const program = [
  {
    id: "2026-02-02",
    label: "2 Février – Chandeleur",
    title: "Chandeleur gourmande",
    description: "Atelier crêpes, décoration et dégustation en équipe.",
    icon: "🥞",
    duration: "2h",
  },
  {
    id: "2026-02-04",
    label: "Mercredi – Écriture d’une lettre",
    title: "Lettre pour le futur",
    description: "Écrire une lettre à relire à l’âge adulte, avec une capsule souvenir.",
    icon: "✉️",
    duration: "1h30",
  },
  {
    id: "2026-02-06-open",
    label: "Vendredi 16h30 – Ouverture",
    title: "Ouverture des vacances",
    description: "Accueil, jeux de découverte et briefing convivial.",
    icon: "🎉",
    duration: "30min",
  },
  {
    id: "2026-02-06-magic",
    label: "Vendredi 17h – Magie",
    title: "Magie & illusion",
    description: "Spectacle participatif avec tours de magie et atelier d’initiation.",
    icon: "🎩✨",
    duration: "1h",
  },
  {
    id: "2026-02-07",
    label: "Samedi – Vélo",
    title: "Balade à vélo",
    description: "Parcours sécurisé, défis et mini-course en équipe.",
    icon: "🚲",
    duration: "2h",
  },
  {
    id: "2026-02-08",
    label: "Dimanche – Home cinéma",
    title: "Home cinéma : Les Inséparables",
    description: "Projection cozy avec popcorn et discussion créative.",
    icon: "🎬",
    duration: "2h",
  },
  {
    id: "2026-02-09",
    label: "Lundi – Peinture et dessin",
    title: "Atelier peinture & dessin",
    description: "Techniques de couleur, création d’affiches et galerie éphémère.",
    icon: "🎨",
    duration: "2h",
  },
  {
    id: "2026-02-10",
    label: "Mardi – Cirque",
    title: "Cirque en piste",
    description: "Initiation aux arts du cirque : jonglage, équilibre et mini-show.",
    icon: "🎪",
    duration: "2h",
  },
  {
    id: "2026-02-11",
    label: "Mercredi – Instrument",
    title: "Jouer d’un instrument",
    description: "Découverte musicale, rythmes et mini jam-session.",
    icon: "🎶",
    duration: "1h30",
  },
  {
    id: "2026-02-12",
    label: "Jeudi – Peinture + Frisbee",
    title: "Peinture + Frisbee",
    description: "Création artistique puis défis sportifs en extérieur.",
    icon: "🥏",
    duration: "2h",
  },
  {
    id: "2026-02-14-show",
    label: "Samedi – Spectacle",
    title: "Spectacle final",
    description: "Grand show des participants avec lumières et costumes.",
    icon: "🎭",
    duration: "2h",
  },
  {
    id: "2026-02-14-ink",
    label: "Dessin à l’encre",
    title: "Dessin à l’encre",
    description: "Exploration de l’encre de Chine et création d’une carte souvenir.",
    icon: "🖋️",
    duration: "1h",
  },
];

const programGrid = document.getElementById("programGrid");
const datesGrid = document.getElementById("datesGrid");
const form = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");
const heroTitle = document.getElementById("heroTitle");
const enableNotifications = document.getElementById("enableNotifications");
const bookingLinkInput = document.getElementById("bookingLink");
const copyBookingLink = document.getElementById("copyBookingLink");

const scrollTo = (targetId) => {
  const el = document.getElementById(targetId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

document.getElementById("scrollToBooking").addEventListener("click", () => scrollTo("reservation"));
document.getElementById("scrollToProgram").addEventListener("click", () => scrollTo("programme"));
document.getElementById("scrollToMain").addEventListener("click", () => scrollTo("programme"));

const buildTitleAnimation = () => {
  const text = heroTitle.textContent;
  heroTitle.textContent = "";
  [...text].forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.style.animationDelay = `${index * 0.05}s`;
    heroTitle.appendChild(span);
  });
};

const buildProgramCards = () => {
  program.forEach((item) => {
    const card = document.createElement("article");
    card.className = "program-card";
    card.setAttribute("role", "listitem");

    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `${item.icon} ${item.label}`;
    button.setAttribute("aria-expanded", "false");

    const meta = document.createElement("div");
    meta.className = "program-card__meta";
    meta.innerHTML = `<span>${item.title}</span><span>${item.duration}</span>`;

    const detail = document.createElement("div");
    detail.className = "program-card__detail";
    detail.innerHTML = `<strong>${item.title}</strong><p>${item.description}</p>`;

    button.addEventListener("click", () => {
      const isActive = card.classList.toggle("active");
      button.setAttribute("aria-expanded", String(isActive));
    });

    card.appendChild(button);
    card.appendChild(meta);
    card.appendChild(detail);
    programGrid.appendChild(card);
  });
};

const buildDateOptions = () => {
  program.forEach((item) => {
    const option = document.createElement("label");
    option.className = "date-option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "dates";
    input.value = item.label;

    const span = document.createElement("span");
    span.textContent = `${item.icon} ${item.label}`;

    option.appendChild(input);
    option.appendChild(span);
    datesGrid.appendChild(option);
  });
};

const showMessage = (message, isError = false) => {
  formMessage.textContent = message;
  formMessage.style.color = isError ? "#dc2626" : "#16a34a";
  formMessage.classList.add("show");
  setTimeout(() => formMessage.classList.remove("show"), 3500);
};

let pushSubscription = null;

const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    return null;
  }
  return navigator.serviceWorker.register("/sw.js");
};

const subscribeToPush = async () => {
  if (!("Notification" in window)) {
    showMessage("Notifications indisponibles sur ce navigateur.", true);
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    showMessage("Permission de notification refusée.", true);
    return;
  }

  const registration = await registerServiceWorker();
  if (!registration) {
    showMessage("Service worker indisponible.", true);
    return;
  }

  const response = await fetch("/api/vapidPublicKey");
  const { publicKey } = await response.json();
  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    pushSubscription = existingSubscription;
    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(existingSubscription),
    });
    showMessage("Notifications déjà activées ✅");
    return;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  pushSubscription = subscription;
  await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  showMessage("Notifications activées ✅");
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

enableNotifications.addEventListener("click", () => {
  subscribeToPush().catch(() => showMessage("Impossible d'activer les notifications.", true));
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const selectedDates = formData.getAll("dates");

  if (selectedDates.length === 0) {
    showMessage("Sélectionnez au moins une date.", true);
    return;
  }

  const payload = {
    childLastName: formData.get("childLastName"),
    childFirstName: formData.get("childFirstName"),
    age: formData.get("age"),
    guardianName: formData.get("guardianName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    dates: selectedDates,
  };

  try {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Erreur de réservation");
    }

    showMessage("✅ Réservation envoyée avec succès");
    form.reset();
  } catch (error) {
    showMessage("Une erreur est survenue. Réessayez.", true);
  }
});

buildTitleAnimation();
buildProgramCards();
buildDateOptions();
registerServiceWorker();

const createBookingLink = () => {
  const baseUrl =
    window.location.origin && window.location.origin !== "null"
      ? `${window.location.origin}${window.location.pathname.replace(/index\\.html$/, "")}`
      : window.location.href.split("#")[0];
  const link = `${baseUrl}#reservation`;
  if (bookingLinkInput) {
    bookingLinkInput.value = link;
  }
};

copyBookingLink?.addEventListener("click", async () => {
  if (!bookingLinkInput?.value) {
    return;
  }
  try {
    await navigator.clipboard.writeText(bookingLinkInput.value);
    showMessage("Lien copié ✅");
  } catch (error) {
    showMessage("Impossible de copier le lien.", true);
  }
});

createBookingLink();
