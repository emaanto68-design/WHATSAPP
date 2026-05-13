const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const WHATSAPP_TOKEN = "INSERISCI_TOKEN";
const PHONE_NUMBER_ID = "INSERISCI_PHONE_ID";

app.post("/test", async (req, res) => {
    try {
        await axios.post(
            `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: "INSERISCI_NUMERO_TEST",
                type: "text",
                text: { body: "Test da Render OK!" }
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({ successo: true });
    } catch (e) {
        res.json({ successo: false, errore: e.response?.data || e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server attivo su Render"));




