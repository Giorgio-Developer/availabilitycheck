require('dotenv').config(); // Carica le variabili d'ambiente dal file .env

const express = require('express');
const session = require('express-session');


const path = require('path');
const fs = require('fs');
const csvParser = require('csv-parser');
const { parse } = require('json2csv');

const GoogleCalendar = require('./GoogleCalendar');
const BookingHelper = require('./BookingHelper'); // Importa la classe BookingHelper

const {
    roomsNames,
    roomsImages,
    translations_it,
    translations_en,
    translations_fr,
    translations_de,
    htmlResponsePostfix,
    topNavigationBarCSS,
    topNavBarJS,
    topNavigationBar
} = require('./constants'); // Importa le costanti

const app = express();
const port = 3000;

// Configurazione di express-session
app.use(session({
    secret: 'qRMhw87Vkk0RuT6fLAeYm4glbCjiPf8j', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Assicurati che secure sia false se non stai utilizzando HTTPS
}));

// Configura EJS come motore di visualizzazione
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Imposta la cartella views

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/assets', express.static(path.join(__dirname, 'assets'))); // Servire i file statici dalla cartella assets

const googleCalendar = new GoogleCalendar();

// Array associativo per mappare gli ID dei calendari ai nomi delle stanze
const translations = {
    "it": translations_it,
    "en": translations_en,
    "fr": translations_fr,
    "de": translations_de
};

// Funzione per tradurre il testo in base alla lingua
function translateText(text, lang = "en") {

    if (translations[lang] && translations[lang][text]) {
        return translations[lang][text];
    }
    return text;
}


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

    let wordpressBaseUrl = 'https://villapanoramasuite.it/booking-engine-reservation-form'; // Sostituisci con l'URL effettivo della tua pagina WordPress

    const id_villa_panorama = "hm24qf24l1v16fqg8iv9sgbnt1s7ctm5@import.calendar.google.com";
    const id_calypso = "1uo0g04eif8o44c4mcn8dlufim485l0l@import.calendar.google.com";

    try {
        const oAuth2Client = await googleCalendar.authorize();
        // let { calendarIds, timeMin, timeMax, adults, children, pets, lang } = req.body;
        let { calendarIds, timeMin, timeMax, adults, children, pets, lang } = req.body;

        // Prendi l'header 'Accept-Language' e scegli la prima lingua
        let lang_headers = req.headers['accept-language'];

        if(lang == undefined || lang == "" ) {
            lang = lang_headers;
        }

        if (lang) {
            lang = lang.split(',')[0].split('-')[0]; // Restituisce solo il codice della lingua principale, es. 'en' da 'en-US,en;q=0.9'
        } else {
            lang = 'it'; // Imposta un valore di default se l'header non è disponibile
        }

        // Se lang è una delle lingue supportate, usa quella, altrimenti usa 'en' 
        if(lang != "" && lang != "it") {
            if(lang == "en" || lang == "fr" || lang == "de") {
                wordpressBaseUrl = wordpressBaseUrl + '-' + lang+"/";
            } else {
                wordpressBaseUrl = wordpressBaseUrl + "en/";
            }
        } else {
            wordpressBaseUrl = wordpressBaseUrl + "/";
        }

        const currentDate = new Date();
        const requestTimeMin = new Date(timeMin);
        const twelveMonthsAhead = new Date();
        twelveMonthsAhead.setFullYear(currentDate.getFullYear() + 1);

        // Se la data richiesta è oltre 12 mesi nel futuro
        if (requestTimeMin > twelveMonthsAhead) {
            const htmlResponseFutureUnavailable = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>`+translateText("Disponibilità Villa Panorama", lang)+`</title>
                    <!-- Bootstrap CSS -->
                    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="assets/css/style.css">
                    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
                    `+topNavigationBarCSS+topNavBarJS+`
                </head>
                <body class="body_bg">
                    `+topNavigationBar+`
                    <div class="header" style="padding-top: 50px;">
                        <h4 style="
                            margin-top: 20px; 
                            padding: 10px 20px; 
                            background-color: #007BFF; 
                            color: white; 
                            border-radius: 5px; 
                            background-color: #11223355; 
                            border: 1px solid lightgray;">
                            `+translateText("Per chiedere disponibilità per periodi più remoti di 12 mesi da oggi, inviare una richiesta di preventivo a booking@villapanoramasuite.it", lang)+`
                        </h4>
                    </div>
                    <div class="row" style="padding-top: 50px; text-align: center;">
                        <div class="form-group col-md-3">
                            &nbsp;
                        </div>
                    </div>
                </body>
                </html>
            `;
            res.send(htmlResponseFutureUnavailable);
            return;
        }


        var htmlResponsePrefix = `
        <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>`+translateText("Disponibilità Villa Panorama", lang)+`</title>
                <!-- Bootstrap CSS -->
                <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="assets/css/style.css">
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
                `+topNavigationBarCSS+topNavBarJS+`
            </head>
            <body class="body_bg">`
            +topNavigationBar+
            `<div class="header" style="padding-top: 50px;">
                    <button onclick="window.history.back()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                        </svg>
                    </button>
                    <p>
                        <h4 style="
                            margin-top: 20px; 
                            padding: 10px 20px; 
                            background-color: #007BFF; 
                            color: white; 
                            border-radius: 5px; 
                            background-color: #11223355; 
                            border: 1px solid lightgray;
                            ">`+translateText("Camere disponibili nel periodo selezionato", lang)+`
                        </h4>
                    </p>
                </div>
                <div class="row" style="padding-top: 50px; text-align: center;">
                    <div class="form-group col-md-3">
                        &nbsp;
                    </div>
        `;
    
        var htmlResponsePrefixNoAvail = `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>`+translateText("Disponibilità Villa Panorama", lang)+`</title>
                    <!-- Bootstrap CSS -->
                    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="assets/css/style.css">
                    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
                    `
                        +topNavigationBarCSS+topNavBarJS+
                    `

                </head>
                <body class="body_bg">
                `
                    +topNavigationBar+
                `
                    <div class="header" style="padding-top: 50px;">`+
                            `<h4  style="
                                margin-top: 20px; 
                                padding: 10px 20px; 
                                background-color: #007BFF; 
                                color: white; 
                                border-radius: 5px; 
                                background-color: #11223355; 
                                border: 1px solid lightgray;
                                ">`+translateText("Ecco le stanze disponibili con periodi più vicini alle date richieste", lang)+`
                            </h4>`+
                        `</p>
                    </div>
                    <div class="row" style="padding-top: 50px; text-align: center;">
                        <div class="form-group col-md-3">
                            &nbsp;
                        </div>
        `;

        var htmlResponsePrefixNoAlternative = `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>`+translateText("Disponibilità Villa Panorama", lang)+`</title>
                    <!-- Bootstrap CSS -->
                    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="assets/css/style.css">
                    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
                    `
                        +topNavigationBarCSS+topNavBarJS+
                    `

                </head>
                <body class="body_bg">
                `
                    +topNavigationBar+
                `
                    <div class="header" style="padding-top: 50px;">`+
                            `<h4  style="
                                margin-top: 20px; 
                                padding: 10px 20px; 
                                background-color: #007BFF; 
                                color: white; 
                                border-radius: 5px; 
                                background-color: #11223355; 
                                border: 1px solid lightgray;
                                ">`+translateText("Al momento non ci sono stanze disponibili nel periodo richiesto. Contattaci all'indirizzo: booking@villapanoramasuite.it", lang)+`
                            </h4>`+
                        `</p>
                    </div>
                    <div class="row" style="padding-top: 50px; text-align: center;">
                        <div class="form-group col-md-3">
                            &nbsp;
                        </div>
        `;

        // Assicurati che calendarIds sia un array
        if (!Array.isArray(calendarIds)) {
            calendarIds = [calendarIds];
        }

        if(adults > 2) 
            calendarIds = [id_villa_panorama, id_calypso];

        const requestBody = {
            timeMin: new Date(timeMin).toISOString(),
            timeMax: new Date(timeMax).toISOString(),
            items: calendarIds.map(id => ({ id })),
            adults: parseInt(adults, 10),
            children: parseInt(children, 10),
            pets: pets,
        };

        const freeBusyResponse = await googleCalendar.checkFreeBusy(oAuth2Client, requestBody);

        // Calendari disponibili
        const availableCalendars = Object.keys(freeBusyResponse).filter(calendarId => {
            const busyTimes = freeBusyResponse[calendarId].busy;
            return busyTimes.length === 0;
        }).map(calendarId => ({
            name: roomsNames[calendarId],
            image: roomsImages[calendarId],
            calendarId: calendarId,
        }));

        if (availableCalendars.length > 0) {
            const roomCosts = await Promise.all(availableCalendars.map(async room => {
                const bookings = await BookingHelper.readCSV(`rooms_prices/${room.name}.csv`);

                // Calcola il costo totale per il periodo selezionato
                const totalCost = BookingHelper.calculateTotalCostV2(bookings, timeMin, timeMax, adults, children, pets);
                return {
                    ...room,
                    totalCost
                };
            }));

            pets = formatPets(pets);

            const htmlResponseRoomsList = `
            <div class="form-group col-md-12">
                ${roomCosts.length > 0 ? `
                    <ul class="row list-unstyled" style="margin: 20px;">
                        ${roomCosts.map(room => `
                            <li class="col-md-4 d-flex mb-4">
                                <div class="room card w-100">
                                    <img src="/assets/images/${room.image}" alt="${room.name}" class="card-img-top">
                                    <div class="card-body">
                                        <h5 class="room-name card-title">${room.name}</h5>
                                        <p class="room-cost card-text">
                                            ${room.totalCost === "Error in cost calculation"
                                                ? translateText("Per il preventivo contattare booking@villapanoramasuite.it", lang)
                                                : translateText("Costo totale per il periodo selezionato:", lang) + ` ${room.totalCost} €`
                                            }
                                        </p>
                                        ${room.totalCost !== "Error in cost calculation" ? `
                                        <a href="${wordpressBaseUrl}?room=${encodeURIComponent(room.name)}&checkin=${encodeURIComponent(timeMin)}&checkout=${encodeURIComponent(timeMax)}&adults=${adults}&children=${children}&pets=${pets}&price=${room.totalCost}&lang=${lang}" class="btn btn-primary">
                                            ` + translateText("Richiesta prenotazione", lang) + `
                                        </a>
                                        ` : ``}
                                    </div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                ` : `
                    <p>`+translateText("Nessuno dei calendari è disponibile nel periodo selezionato.", lang)+`</p>
                `}
            </div>
        `;

            const htmlResponse = htmlResponsePrefix + htmlResponseRoomsList + htmlResponsePostfix;
            res.send(htmlResponse);
        } else {
            // Trova prossime disponibilità utilizzando la risposta di checkFreeBusy
            let alternativeAvailability = [];
            for (const calendarId of calendarIds) {
                const busyPeriods = freeBusyResponse[calendarId].busy;
                const periods = await findNextAvailablePeriods(busyPeriods, timeMin, timeMax, adults, children, pets, roomsNames[calendarId]);
                if (periods.length > 0) {
                    alternativeAvailability.push({
                        calendarId: calendarId,
                        name: roomsNames[calendarId],
                        image: roomsImages[calendarId],
                        availablePeriods: periods
                    });
                }
            }

            // Costruisci risposta HTML per periodi alternativi
            const htmlAlternativeResponse = `
                <div class="pl-5 pr-5">
                    <div class="form-group col-md-12">
                        <ul class="row list-unstyled justify-content-center" style="padding-left: 0px;">
                            ${alternativeAvailability.map((room, index) => `
                                <li class="${alternativeAvailability.length < 3 ? 'col-md-6' : 'col-md-4'} d-flex mb-4 justify-content-center">
                                    <div class="room card w-100">
                                        <img src="/assets/images/${room.image}" alt="${room.name}" class="card-img-top">
                                        <div class="card-body">
                                            <h5 class="room-name card-title">${room.name}</h5>
                                            <ul class="list-unstyled" style="font-weight: 300; font-size: smaller;">
                                                ${room.availablePeriods.map(period => {
                                                    // Qui utilizziamo convertDate per formattare le date
                                                    const formattedStartDate = convertDate(period.start);
                                                    const formattedEndDate = convertDate(period.end);
                                                    pets = formatPets(pets);

                                                    // Previene l'errore se il costo totale non può essere calcolato
                                                    if(period.totalCost == "Error in cost calculation") {
                                                        return `
                                                        <li class="d-flex justify-content-between align-items-center py-2" style="display: block !important;">
                                                            <div>
                                                                ${period.start} - ${period.end}
                                                            </div> 
                                                            <div style="font-size: larger;">
                                                                <br>
                                                                <b>Richiedere il preventivo tramite email all'indirizzo booking@villapanoramasuite.it</b>
                                                            </div>  
                                                        </li>
                                                    `;
                                                    }

                                                    return `
                                                        <li class="d-flex justify-content-between align-items-center py-2" style="display: block !important;">
                                                            <div>
                                                                ${period.start} - ${period.end}
                                                            </div> 
                                                            <div style="font-size: larger;">
                                                                <b>€ ${period.totalCost}</b>
                                                            </div>  
                                                            <div style="padding: 10px;">
                                                                <a href="${wordpressBaseUrl}?room=${encodeURIComponent(room.name)}&checkin=${encodeURIComponent(formattedStartDate)}&checkout=${encodeURIComponent(formattedEndDate)}&adults=${adults}&children=${children}&pets=${pets}&price=${period.totalCost}&lang=${lang}" class="btn btn-sm btn-primary" style="font-size: smaller;">`+translateText("Seleziona", lang)+`</a>
                                                            </div>
                                                        </li>
                                                    `;
                                                }).join('')}
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;

            var htmlResponse = "";
            if (alternativeAvailability.length === 0) 
                htmlResponse = htmlResponsePrefixNoAlternative + htmlResponsePostfix;
            else
                htmlResponse = htmlResponsePrefixNoAvail + htmlAlternativeResponse + htmlResponsePostfix;

            res.send(htmlResponse);
        }
    } catch (error) {
        console.error('Error checking freeBusy:', error);
        res.status(500).send('Error checking freeBusy');
    }
});

async function findNextAvailablePeriods(busyPeriods, timeMin, timeMax, adults, children, pets, roomName) {
    const availablePeriods = [];

    if (busyPeriods.length === 0) {
        // Se non ci sono periodi occupati, tutto il range è disponibile
        availablePeriods.push({ start: timeMin, end: timeMax });
        return availablePeriods;
    }

    // Aggiungi disponibilità prima del primo periodo occupato
    if (new Date(busyPeriods[0].start).getTime() > new Date(timeMin).getTime()) {
        availablePeriods.push({ start: timeMin, end: busyPeriods[0].start });
    }

    // Calcola i gap tra i periodi occupati
    for (let i = 0; i < busyPeriods.length - 1; i++) {
        if (new Date(busyPeriods[i].end).getTime() < new Date(busyPeriods[i + 1].start).getTime()) {
            availablePeriods.push({ start: busyPeriods[i].end, end: busyPeriods[i + 1].start });
        }
    }

    // Aggiungi disponibilità dopo l'ultimo periodo occupato
    if (new Date(busyPeriods[busyPeriods.length - 1].end).getTime() < new Date(timeMax).getTime()) {
        availablePeriods.push({ start: busyPeriods[busyPeriods.length - 1].end, end: timeMax });
    }

    // Calcolo del costo totale per ciascun periodo disponibile
    return Promise.all(availablePeriods.map(async period => {
        const bookings = await BookingHelper.readCSV(`rooms_prices/${roomName}.csv`);
        const totalCost = BookingHelper.calculateTotalCostV2(bookings, period.start, period.end, adults, children, pets);
        return {
            start: formatDate(period.start),
            end: formatDate(period.end),
            totalCost
        };
    }));
}

function formatDate(dateIsoString) {
    const date = new Date(dateIsoString);
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // JavaScript conta i mesi da 0
    let year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function convertDate(inputDate) {
    // Assumiamo che inputDate sia una stringa nel formato "dd-mm-yyyy"
    const parts = inputDate.split('-'); // Dividiamo la stringa in parti basate sul separatore '-'
    if (parts.length !== 3) {
        throw new Error('Formato data non valido. Assicurati che sia "dd-mm-yyyy".');
    }

    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    // Restituiamo una nuova stringa nel formato "yyyy-mm-dd"
    return `${year}-${month}-${day}`;
}

function formatPets(pets) {

    // return pets;

    return (
        pets === 'si' || 
        pets === 'Si' || 
        pets === 'Sì' || 
        pets === 'sì' ||
        pets === 'yes' ||
        pets === 'Yes'
    ) ? 'Si' : 'No';
}

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



//*********************** */
// ***   ADMIN AREA   *** */
//*********************** */

// Middleware per l'autenticazione dell'amministratore
function authenticateAdmin(req, res, next) {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        req.session.isAdminAuthenticated = true; // Imposta la sessione
        next();
    } else {
        res.status(401).send('Autenticazione fallita. Credenziali errate.');
    }
}

// Rotta per la pagina di login dell'amministratore
// Middleware per verificare se l'amministratore è autenticato
function checkAdminAuth(req, res, next) {
    if (req.session.isAdminAuthenticated) {
        next(); // Se l'utente è autenticato, passa alla prossima funzione
    } else {
        res.status(401).send('Accesso non autorizzato. Effettua il login.');
    }
}

// Rotta per la pagina di login dell'amministratore
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

// Rotta per gestire il login dell'amministratore
app.post('/admin/login', authenticateAdmin, (req, res) => {
    res.redirect('/admin/dashboard');
});

// Rotta protetta per la dashboard dell'amministratore
app.get('/admin/dashboard', checkAdminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// CSV Manipulation
// Funzione per leggere i dati dal file CSV
function readCSV(roomName) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, `rooms_prices/${roomName}.csv`);
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

// Funzione per scrivere i dati nel file CSV
function writeCSV(roomName, data) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, `rooms_prices/${roomName}.csv`);
        const csv = parse(data, { fields: ['data inizio', 'data fine', 'costo'] });
        fs.writeFile(filePath, csv, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Rotta per visualizzare i dati del CSV della stanza selezionata
app.get('/admin/edit/:roomName', checkAdminAuth, async (req, res) => {
    const roomName = req.params.roomName;

     // Funzione per convertire la data da DD/MM/YYYY a YYYY-MM-DD
     function convertDateToISO(date) {
        const parts = date.split('/');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
        }
        return date; // Se la data non è in formato corretto, ritorna la data originale
    }

    try {
        const csvData = await readCSV(roomName);

        // Converti le date in formato ISO prima di passare i dati al template
        csvData.forEach(row => {
            row['data inizio'] = convertDateToISO(row['data inizio']);
            row['data fine'] = convertDateToISO(row['data fine']);
        });

        res.render('edit-room', { roomName, csvData });
    } catch (error) {

        console.log(error);

        res.status(500).send('Errore durante la lettura del file CSV');
    }
});

// Rotta per gestire l'aggiornamento del CSV
app.post('/admin/edit/:roomName', checkAdminAuth, async (req, res) => {
    const roomName = req.params.roomName;
    let csvData = req.body.csvData;

    // Funzione per convertire la data da YYYY-MM-DD a DD/MM/YYYY
    function convertDateToDDMMYYYY(date) {
        const parts = date.split('-'); // Divide la data nel formato YYYY-MM-DD
        if (parts.length === 3) {
            const year = parts[0];
            const month = parts[1];
            const day = parts[2];
            return `${day}/${month}/${year}`; // Ritorna il formato DD/MM/YYYY
        }
        return date; // Se la data non è in formato corretto, ritorna la data originale
    }

    // Funzione per convertire una data da DD/MM/YYYY a un oggetto Date
    function convertToDateObject(date) {
        const parts = date.split('/'); // Divide la data nel formato DD/MM/YYYY
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JavaScript usa i mesi da 0 a 11
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }

    // Funzione per verificare che non ci siano sovrapposizioni o buchi temporali
    function validateDates(data) {
        const sortedData = data.slice().sort((a, b) => convertToDateObject(a['data inizio']) - convertToDateObject(b['data inizio']));

        for (let i = 0; i < sortedData.length - 1; i++) {
            const currentEnd = convertToDateObject(sortedData[i]['data fine']);
            const nextStart = convertToDateObject(sortedData[i + 1]['data inizio']);

            // Verifica che non ci siano buchi temporali (la data di fine del periodo attuale deve essere esattamente un giorno prima dell'inizio del prossimo)
            const expectedNextStart = new Date(currentEnd);
            expectedNextStart.setDate(expectedNextStart.getDate() + 1);

            if (nextStart > expectedNextStart) {
                return `Errore: Ci sono buchi temporali tra ${sortedData[i]['data fine']} e ${sortedData[i + 1]['data inizio']}`;
            }

            // Verifica che non ci siano sovrapposizioni
            if (nextStart <= currentEnd) {
                return `Errore: Ci sono sovrapposizioni tra ${sortedData[i]['data fine']} e ${sortedData[i + 1]['data inizio']}`;
            }
        }

        return null; // Nessun errore
    }

    // Prima di salvare, convertiamo le date nel formato DD/MM/YYYY e verifichiamo le sovrapposizioni e i buchi temporali
    csvData = csvData.map(row => ({
        'data inizio': convertDateToDDMMYYYY(row['data inizio']),
        'data fine': convertDateToDDMMYYYY(row['data fine']),
        costo: row.costo
    }));

    // Esegui la validazione delle date
    const validationError = validateDates(csvData);
    if (validationError) {
        return res.status(500).render('error', { message: validationError, backUrl: `/admin/edit/${roomName}` });
    }

    try {
        // Scriviamo i dati aggiornati nel file CSV
        await writeCSV(roomName, csvData);
        res.redirect(`/admin/edit/${roomName}`);
    } catch (error) {
        res.status(500).send('Errore durante la scrittura nel file CSV');
    }
});




// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
