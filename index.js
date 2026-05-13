const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Configurazione Cloud definitiva: disabilita l'avvio di Chrome locale
// e scarica i componenti direttamente dal server web di WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'githubusercontent.com'
    },
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('SCANSIONA QUESTO CODICE CON WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp è pronto a ricevere comandi da App Inventor!');
});

app.post('/invia-messaggio', async (req, res) => {
    const { numero, testo, urlImmagine, urlAudio } = req.body;
    if (!numero) return res.status(400).json({ successo: false, errore: 'Numero mancante' });

    const chatId = `${numero}@c.us`;

    try {
        if (urlAudio) {
            const mediaAudio = await MessageMedia.fromUrl(urlAudio);
            await client.sendMessage(chatId, mediaAudio, { sendAudioAsVoice: true });
        } else if (urlImmagine) {
            const mediaImmagine = await MessageMedia.fromUrl(urlImmagine);
            await client.sendMessage(chatId, mediaImmagine, { caption: testo || '' });
        } else if (testo) {
            await client.sendMessage(chatId, testo);
        }
        return res.status(200).json({ successo: true, messaggio: 'Inviato!' });
    } catch (error) {
        return res.status(500).json({ successo: false, errore: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server online sulla porta ${PORT}`);
});

client.initialize();


