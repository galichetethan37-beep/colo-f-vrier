import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import webpush from "web-push";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const vapidPath = path.join(dataDir, "vapid.json");
const subscriptionsPath = path.join(dataDir, "subscriptions.json");
const reservationsPath = path.join(dataDir, "reservations.json");

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const loadJSON = (filePath, fallback) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (error) {
    console.error("Erreur de lecture", error);
  }
  return fallback;
};

const saveJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

ensureDataDir();

const vapidKeys = (() => {
  if (fs.existsSync(vapidPath)) {
    return loadJSON(vapidPath, {});
  }
  const keys = webpush.generateVAPIDKeys();
  saveJSON(vapidPath, keys);
  return keys;
})();

webpush.setVapidDetails("mailto:contact@colo-fevrier.fr", vapidKeys.publicKey, vapidKeys.privateKey);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/vapidPublicKey", (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

app.post("/api/subscribe", (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Subscription invalide" });
  }

  const subscriptions = loadJSON(subscriptionsPath, []);
  const exists = subscriptions.some((item) => item.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
    saveJSON(subscriptionsPath, subscriptions);
  }

  return res.status(201).json({ status: "ok" });
});

app.post("/api/reservations", async (req, res) => {
  const { childLastName, childFirstName, age, guardianName, email, phone, dates } = req.body;

  if (!childLastName || !childFirstName || !age || !guardianName || !email || !phone || !dates?.length) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const reservations = loadJSON(reservationsPath, []);
  const reservation = {
    id: Date.now(),
    childLastName,
    childFirstName,
    age,
    guardianName,
    email,
    phone,
    dates,
    createdAt: new Date().toISOString(),
  };
  reservations.push(reservation);
  saveJSON(reservationsPath, reservations);

  const subscriptions = loadJSON(subscriptionsPath, []);
  const payload = JSON.stringify({
    title: "Nouvelle réservation – Colo Vacances Février",
    body: `${childFirstName} ${childLastName} · ${dates.join(", ")}`,
    url: "/",
  });

  const invalidSubscriptions = [];

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, payload);
      } catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          invalidSubscriptions.push(subscription.endpoint);
        } else {
          console.error("Erreur push", error);
        }
      }
    })
  );

  if (invalidSubscriptions.length) {
    const filtered = subscriptions.filter((sub) => !invalidSubscriptions.includes(sub.endpoint));
    saveJSON(subscriptionsPath, filtered);
  }

  return res.status(201).json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur prêt sur http://localhost:${PORT}`);
});
