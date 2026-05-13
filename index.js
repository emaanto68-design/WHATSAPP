const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// Inserisci qui il tuo token WhatsApp Cloud API
const WHATSAPP_TOKEN = "INSERISCI_IL_TUO_TOKEN";
const PHONE_NUMBER_ID = "INSERISCI_PHONE_NUMBER_ID"; // es: 123456789000000

// Endpoint per inviare messaggi
app.post("/invia-messaggio", async (req, res) => {
    const { numero, testo, urlImmagine, urlAudio } = req.body;

    if (!numero) {
        return res.status(400).json({ successo: false, errore: "Numero mancante" });
    }

    const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

    try {
        // Messaggio testuale
        if (testo) {
            await axios.post(
                url,
                {
                    messaging_product: "whatsapp",
                    to: numero,
                    type: "text",
                    text: { body: testo }
                },
                {
                    headers: {
                        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // Immagine
        if (urlImmagine) {
            await axios.post(
                url,
                {
                    messaging_product: "whatsapp",
                    to: numero,
                    type: "image",
                    image: { link: urlImmagine, caption: testo || "" }
                },
                {
                    headers: {
                        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // Audio
        if (urlAudio) {
            await axios.post(
                url,
                {
                    messaging_product: "whatsapp",
                    to: numero,
                    type: "audio",
                    audio: { link: urlAudio }
                },
                {
                    headers: {
                        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        return res.json({ successo: true, messaggio: "Inviato!" });

    } catch (error) {
        return res.status(500).json({
            successo: false,
            errore: error.response?.data || error.message
        });
    }
});

// Porta per Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server WhatsApp Cloud API attivo su Render");
});



