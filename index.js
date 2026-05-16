import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// 🔥 AGGIUNGI QUESTE 3 RIGHE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: "*/*" }));

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

    if (!phoneId || !token || !numero) {
      return res.json({
        successo: false,
        errore: "Parametri mancanti: phoneId, token o numero"
      });
    }

    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;

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

    const risposta = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const dati = await risposta.json();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server attivo su porta " + PORT);
});






