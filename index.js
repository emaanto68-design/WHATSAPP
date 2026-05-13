const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Configurazione ottimizzata per evitare errori di Chrome sul cloud
const client = new Client({
    authStrategy: new LocalAuth(),
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

// Generazione del codice QR nei log del server
client.on('qr', (qr) => {
    console.log('SCANSIONA QUESTO CODICE CON WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

// Messaggio di conferma connessione avvenuta
client.on('ready', () => {
    console.log('WhatsApp è pronto a ricevere comandi da App Inventor!');
});

// Punto di ascolto per i comandi inviati da MIT App Inventor
app.post('/invia-messaggio', async (req, res) => {
    const { numero, testo, urlImmagine, urlAudio } = req.body;

    if (!numero) {
        return res.status(400).json({ successo: false, errore: 'Numero mancante' });
    }

    const chatId = `${numero}@c.us`;

    try {
        // Caso 1: Invio Nota Vocale da link internet
        if (urlAudio) {
            const mediaAudio = await MessageMedia.fromUrl(urlAudio);
            await client.sendMessage(chatId, mediaAudio, { sendAudioAsVoice: true });
            console.log(`Nota vocale inviata a ${numero}`);
        } 
        // Caso 2: Invio Immagine da link internet
        else if (urlImmagine) {
            const mediaImmagine = await MessageMedia.fromUrl(urlImmagine);
            await client.sendMessage(chatId, mediaImmagine, { caption: testo || '' });
            console.log(`Immagine inviata a ${numero}`);
        } 
        // Caso 3: Invio Solo Testo
        else if (testo) {
            await client.sendMessage(chatId, testo);
            console.log(`Testo inviato a ${numero}`);
        }

        return res.status(200).json({ successo: true, messaggio: 'Inviato!' });

    } catch (error) {
        console.error('Errore invio:', error);
        return res.status(500).json({ successo: false, errore: error.message });
    }
});

// Avvio del server web sulla porta corretta per Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server online sulla porta ${PORT}`);
});

client.initialize();

