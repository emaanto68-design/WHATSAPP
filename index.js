import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

// App Inventor invia SEMPRE text/plain
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.post("/invia", async (req, res) => {
  try {
    let body = {};

    // Convertiamo text/plain in oggetto
    if (typeof req.body === "string") {
      req.body.split("&").forEach(pair => {
        const [key, value] = pair.split("=");
        body[key] = decodeURIComponent(value);
      });
    } else {
      body = req.body;
    }

    console.log("BODY RICEVUTO:", body);

    const phoneId = (body.phoneId || "").trim();
    const token = (body.token || "").trim();
    const numero = (body.numero || "").trim();
    const testo = (body.testo || "").trim();
    const template = (body.template || "").trim();
    const lingua = (body.lingua || "en_US").trim();

    if (!phoneId || !token || !numero) {
      return res.json({
        successo: false,
        risposta: "Parametri mancanti: phoneId, token, numero"
      });
    }

    let payload = {};

    // 🔵 TEMPLATE MESSAGE
    if (template) {
      payload = {
        messaging_product: "whatsapp",
        to: numero,
        type: "template",
        template: {
          name: template,
          language: { code: lingua }
        }
      };
    }

    // 🟢 NORMAL TEXT MESSAGE
    else if (testo) {
      payload = {
        messaging_product: "whatsapp",
        to: numero,
        type: "text",
        text: { body: testo }
      };
    }

    // ❌ Nessun contenuto
    else {
      return res.json({
        successo: false,
        risposta: "Devi inviare testo= oppure template="
      });
    }

    console.log("PAYLOAD INVIATO:", payload);

    const risposta = await axios.post(
      `https://graph.facebook.com/v25.0/${phoneId}/messages`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json({ successo: true, risposta: risposta.data });

  } catch (errore) {
    console.log("ERRORE WHATSAPP:", errore.response?.data || errore.message);

    res.json({
      successo: false,
      risposta: errore.response?.data || errore.message
    });
  }
});

app.listen(3000, () => console.log("Server avviato su porta 3000"));

