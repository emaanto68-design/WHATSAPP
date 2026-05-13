const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // Permette allo script di leggere i dati JSON inviati dall'app Android

// Inizializza WhatsApp memorizzando la sessione localmente
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // Esegue il browser in background senza aprirlo visivamente
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Genera il codice QR nel terminale per l'accoppiamento iniziale
client.on('qr', (qr) => {
    console.log('SCANSIONA QUESTO CODICE CON WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

// Messaggio di conferma quando WhatsApp è connesso e pronto
client.on('ready', () => {
    console.log('WhatsApp è pronto a ricevere comandi da App Inventor!');
});

// CREAZIONE DEL PUNTO DI ASCOLTO (API ENDPOINT)
// Questo indirizzo riceverà le richieste internet dall'app Android
app.post('/invia-messaggio', async (req, res) => {
    const { numero, testo, urlImmagine, urlAudio } = req.body;

    // Controllo di sicurezza: se manca il numero, interrompe l'operazione
    if (!numero) {
        return res.status(400).json({ successo: false, errore: 'Numero mancante' });
    }

    // Formatta il numero nel formato richiesto da WhatsApp (es. 393331234567@c.us)
    const chatId = `${numero}@c.us`;

    try {
        // CASO 1: INVIO DI UN AUDIO DA UN LINK INTERNET (COME NOTA VOCALE)
        if (urlAudio) {
            const mediaAudio = await MessageMedia.fromUrl(urlAudio);
            await client.sendMessage(chatId, mediaAudio, { sendAudioAsVoice: true });
            console.log(`Nota vocale inviata con successo a ${numero}`);
        } 
        
        // CASO 2: INVIO DI UN'IMMAGINE DA UN LINK INTERNET (CON O SENZA DIDASCALIA)
        else if (urlImmagine) {
            const mediaImmagine = await MessageMedia.fromUrl(urlImmagine);
            await client.sendMessage(chatId, mediaImmagine, { caption: testo || '' });
            console.log(`Immagine inviata con successo a ${numero}`);
        } 
        
        // CASO 3: INVIO DI SOLO TESTO
        else if (testo) {
            await client.sendMessage(chatId, testo);
            console.log(`Messaggio di testo inviato con successo a ${numero}`);
        }

        // Risponde all'app Android confermando il successo
        return res.status(200).json({ successo: true, messaggio: 'Inviato con successo!' });

    } catch (error) {
        console.error('Errore durante l\'invio:', error);
        return res.status(500).json({ successo: false, errore: error.message });
    }
});

// Avvia il server web sulla porta 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});

// Avvia il client WhatsApp
client.initialize();
