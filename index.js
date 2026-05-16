import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

// App Inventor code2 invia SEMPRE text/plain
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Endpoint per inviare messaggi WhatsApp
app.post("/invia", async (req, res) => {
  try {
    // Se arriva text/plain, convertiamolo in oggetto
    let body = {};

    if (typeof req.body === "string") {
      req.body.split("&").forEach(pair => {
        const [key, value] = pair.split("=");
        body[key] = decodeURIComponent(value);
      });
    } else {
      body = req.body;
    }

    const { phoneId, token, numero, testo } = body;

    // Costruzione JSON WhatsApp
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
    res.json({
      successo: false,
      risposta: errore.response?.data || errore.message
    });
  }
});

app.listen(3000, () => console.log("Server avviato"));







