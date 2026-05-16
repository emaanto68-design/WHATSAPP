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
      `https://graph.facebook.com/v20.0/${1032116076661106}/messages`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${EAAaoCMVIF8cBRd1ewuOnYprSSBbVXs1DMeJOsYwjiPiGAI2nJ55b16PcqVooInDZApFK01AehKgl0QBM5jeILOWdFeRhKm6MBskqvC0SYTZCwkUdvF0fR5CmZAMgOYUqKAE0hTHmdKKZCICptDBPZCD7RVSfAPZAvpM0T02tFcVehJpRQQ9ko9ZBM0v2RvLhecTDgx52zBzpcYatmqrEeSqykBxYaV8hdhaYXbND5NaksOWh6NGD7KdSo5OOulXxdedeRn8fi5qRnNhi3zg53DlmY6oLbD99ZBBbXgZDZD}`
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







