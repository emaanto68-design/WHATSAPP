import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Endpoint principale
app.post("/invia", async (req, res) => {
  try {
    const {
      phoneId,
      token,
      numero,
      testo,
      urlImmagine,
      urlAudio
    } = req.body;

    // Controllo parametri obbligatori
    if (!phoneId || !token || !numero) {
      return res.json({
        successo: false,
        errore: "Parametri mancanti: phoneId, token o numero"
      });
    }

    // URL WhatsApp Cloud API
    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;

    // Costruzione payload dinamico
    let payload = {
      messaging_product: "whatsapp",
      to: numero
    };

    if (testo) {
      payload.type = "text";
      payload.text = { body: testo };
    }

    if (urlImmagine) {
      payload.type = "image";
      payload.image = { link: urlImmagine };
    }

    if (urlAudio) {
      payload.type = "audio";
      payload.audio = { link: urlAudio };
    }

    // Invio a WhatsApp Cloud API
    const risposta = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const dati = await risposta.json();

    // Risposta al client
    res.json({
      successo: !dati.error,
      risposta: dati
    });

  } catch (errore) {
    res.json({
      successo: false,
      errore: errore.message
    });
  }
});

// Avvio server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server attivo su porta " + PORT);
});





