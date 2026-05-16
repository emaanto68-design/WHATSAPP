

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

    // Se arriva text/plain, convertiamolo in oggetto
    if (typeof req.body === "string") {
      req.body.split("&").forEach(pair => {
        const [key, value] = pair.split("=");
        body[key] = decodeURIComponent(value);
      });
    } else {
      body = req.body;
    }

    // LOG per capire cosa arriva davvero
    console.log("BODY RICEVUTO:", body);
    console.log("PHONEID RAW:", body.phoneId);

    const phoneId = (body.phoneId || "").trim();
    const token = (body.token || "").trim();
    const numero = (body.numero || "").trim();
    const testo = (body.testo || "").trim();

    console.log("PHONEID PULITO:", phoneId);

    // Controlli minimi
    if (!phoneId || !token || !numero || !testo) {
      return res.json({
        successo: false,
        risposta: "Parametri mancanti: phoneId, token, numero, testo"
      });
    }

    // Payload WhatsApp
    const payload = {
      messaging_product: "whatsapp",
      to: numero,
      type: "text",
      text: { body: testo }
    };

    // Invio a WhatsApp Cloud API
    const risposta = await axios.post(
      `https://graph.facebook.com/v20.0/${phoneId}/messages`,
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
