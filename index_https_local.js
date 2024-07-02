const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https'); // Aggiungi questo modulo
const GoogleCalendar = require('./GoogleCalendar');
const app = express();
const port = 443; // Puoi cambiare la porta se necessario

// Percorsi ai certificati SSL
const sslOptions = {
    key: fs.readFileSync('./privatekey.pem'),
    cert: fs.readFileSync('./cert.pem')
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/assets', express.static(path.join(__dirname, 'assets'))); // Servire i file statici dalla cartella assets

const googleCalendar = new GoogleCalendar();

// Array associativo per mappare gli ID dei calendari ai nomi delle stanze
const roomsNames = {
    "hm24qf24l1v16fqg8iv9sgbnt1s7ctm5@import.calendar.google.com": "Villa Panorama",
    "ipdt2erdd6eoriaukuae2vv0c22fsba8@import.calendar.google.com": "Elettra",
    "1uo0g04eif8o44c4mcn8dlufim485l0l@import.calendar.google.com": "Calypso",
    "htbraiua1erp01qpo1g46nsn8bsibcuq@import.calendar.google.com": "Hermes",
    "ceph5hop46teenje89bt5g2pbr70td9g@import.calendar.google.com": "Demetra",
    "tqscm1ioj0n52vdda1bjsvsms019tkq3@import.calendar.google.com": "Iris Oasis",
};

const roomsImages = {
    "hm24qf24l1v16fqg8iv9sgbnt1s7ctm5@import.calendar.google.com": "Villa_Panorama_Suite.jpg",
    "ipdt2erdd6eoriaukuae2vv0c22fsba8@import.calendar.google.com": "Elettra.jpg",
    "1uo0g04eif8o44c4mcn8dlufim485l0l@import.calendar.google.com": "Calypso.jpeg",
    "htbraiua1erp01qpo1g46nsn8bsibcuq@import.calendar.google.com": "Hermes.jpg",
    "ceph5hop46teenje89bt5g2pbr70td9g@import.calendar.google.com": "Demetra.jpg",
    "tqscm1ioj0n52vdda1bjsvsms019tkq3@import.calendar.google.com": "IrisOasis.jpg",

};

// Servire la pagina HTML
app.get('/', async (req, res) => {
    try {
        const oAuth2Client = await googleCalendar.authorize();
        const token = oAuth2Client.credentials;
        if (token && token.access_token) {
            res.sendFile(path.join(__dirname, 'disponibilita.html'));
        } else {
            res.sendFile(path.join(__dirname, 'index.html'));
        }
    } catch (error) {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Verifica se il token esiste
app.get('/check-token', async (req, res) => {
    try {
        if (fs.existsSync(path.join(__dirname, 'token.json'))) {
            res.json({ hasToken: true });
        } else {
            res.json({ hasToken: false });
        }
    } catch (error) {
        console.error('Error checking token:', error);
        res.status(500).json({ error: 'Error checking token' });
    }
});

// Endpoint per generare l'URL di autorizzazione
app.get('/auth-url', async (req, res) => {
    try {
        await googleCalendar.loadCredentials();
        const authUrl = googleCalendar.generateAuthUrl();
        res.send({ url: authUrl });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).send('Error generating auth URL');
    }
});

// Endpoint per gestire la pagina di callback OAuth2
app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    try {
        const oAuth2Client = await googleCalendar.authorize();
        await googleCalendar.getAccessToken(oAuth2Client, code);
        res.sendFile(path.join(__dirname, 'oauth2callback.html'));
    } catch (error) {
        console.error('Error during OAuth2 callback:', error);
        res.status(500).send('Error during OAuth2 callback');
    }
});

// Endpoint per gestire il form di callback e filtrare gli eventi
app.post('/events', async (req, res) => {
    try {
        const { calendarIds, timeMin, timeMax } = req.body;
        const oAuth2Client = await googleCalendar.authorize();
        const events = [];
        for (const calendarId of calendarIds) {
            const calendarEvents = await googleCalendar.listEvents(oAuth2Client, calendarId, timeMin, timeMax);
            events.push(...calendarEvents);
        }
        res.send(events);
    } catch (error) {
        console.error('Error listing events:', error);
        res.status(500).send('Error listing events');
    }
});


app.post('/freebusy', async (req, res) => {

    try {
        let { calendarIds, timeMin, timeMax } = req.body;

        // Assicurati che calendarIds sia un array
        if (!Array.isArray(calendarIds)) {
            calendarIds = [calendarIds];
        }

        const oAuth2Client = await googleCalendar.authorize();

        const requestBody = {
            timeMin: new Date(timeMin).toISOString(),
            timeMax: new Date(timeMax).toISOString(),
            items: calendarIds.map(id => ({ id })),
        };

        // console.log('Request body:', requestBody);

        const freeBusyResponse = await googleCalendar.checkFreeBusy(oAuth2Client, requestBody);

        // Analizza la risposta per verificare la disponibilità
        const availableCalendars = Object.keys(freeBusyResponse).filter(calendarId => {
            const busyTimes = freeBusyResponse[calendarId].busy;
            return busyTimes.length === 0;
        }).map(calendarId => ({
            name: roomsNames[calendarId],
            image: roomsImages[calendarId]
        })); // Mappa gli ID dei calendari ai nomi delle stanze e alle immagini

        // Costruisci la pagina HTML con i risultati
        const htmlResponse = `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Disponibilità Villa Panorama</title>
                    <!-- Bootstrap CSS -->
                    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="assets/css/style.css">
                </head>
                <body class="container mt-5 body_bg">
                    <div class="header"  style="padding-top: 50px;">
                        <button onclick="window.history.back()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                            </svg>
                        </button>
                        <p>Camere disponibili nel periodo selezionato</p>
                    </div>
                    <div class="row" style="padding-top: 50px; text-align: center;">
                        <div class="form-group col-md-3">
                            &nbsp;
                        </div>
                        <div class="form-group col-md-6">
                            ${availableCalendars.length > 0 ? `
                                <ul>
                                    ${availableCalendars.map(room => `
                                        <div class="room">
                                            <img src="/assets/images/${room.image}" alt="${room.name}">
                                            <div class="room-name">${room.name}</div>
                                        </div>
                                        
                                    `).join('')}
                                </ul>
                            ` : `
                            <p>Nessuno dei calendari è disponibile nel periodo selezionato.</p>
                        `}
                        </div>
                        <div class="form-group col-md-3">
                            &nbsp;
                        </div>
                    </div>

                    <!-- Bootstrap JS and dependencies -->
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.slim.min.js"></script>
                    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>

                </body>
            </html>
        `;

        res.send(htmlResponse);

        // res.send(freeBusyResponse);
    } catch (error) {
        console.error('Error checking freeBusy:', error);
        res.status(500).send('Error checking freeBusy');
    }
});


app.get('/calendars', async (req, res) => {
    try {
        const oAuth2Client = await googleCalendar.authorize();
        const calendars = await googleCalendar.listCalendars(oAuth2Client);
        res.send(calendars);
    } catch (error) {
        console.error('Error fetching calendars:', error);
        res.status(500).send('Error fetching calendars');
    }
});


// Avvia il server HTTPS
https.createServer(sslOptions, app).listen(port, () => {
    console.log('Server in ascolto su https://localhost:'+port);
});