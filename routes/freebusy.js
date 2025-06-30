const express = require('express');
const router = express.Router();
const BookingHelper = require('../BookingHelper'); // Importa la classe BookingHelper
const GoogleCalendar = require('../GoogleCalendar'); // Assicurati che GoogleCalendar sia definito correttamente
const { convertDate } = require('../utils/dateUtils');

const googleCalendar = new GoogleCalendar();
const { 
    roomsNames, 
    roomImagesByName,
    roomsImages,
    htmlResponsePostfix,
    topNavigationBarCSS,
    topNavBarJS,
    topNavigationBar
} = require('../utils/constants'); // Importa le costanti dal file utils/constants.js

// Aggiungi qui tutte le altre funzioni che sono utilizzate nella rotta, come translateText, convertDate, etc.
const { translateText } = require('../utils/translate'); // Supponendo che tu abbia creato una funzione translateText in un file separato
const { findNextAvailablePeriods } = require('../utils/dateUtils'); // Supponendo che tu abbia questa funzione già definita


// --- AGGIUNGI QUESTO PRIMA DELLA DEFINIZIONE DELLA ROTTA ---

const calendarsPerRoom = {
    "Calypso": [
        "1uo0g04eif8o44c4mcn8dlufim485l0l@import.calendar.google.com",
    ],
    "Hermes": [
        "htbraiua1erp01qpo1g46nsn8bsibcuq@import.calendar.google.com",
        "si9t6943hokkgrp3u4jgdrr6lmvcujcn@import.calendar.google.com"
    ],
    "Elettra": [
        "ipdt2erdd6eoriaukuae2vv0c22fsba8@import.calendar.google.com"
    ],
    "Villa Panorama": [
        "hm24qf24l1v16fqg8iv9sgbnt1s7ctm5@import.calendar.google.com"
    ],
    "Demetra": [
        "ceph5hop46teenje89bt5g2pbr70td9g@import.calendar.google.com"
    ],
    "Iris Oasis": [
        "tqscm1ioj0n52vdda1bjsvsms019tkq3@import.calendar.google.com"
    ]
};

async function checkRoomAvailability(oAuth2Client, roomName, timeMin, timeMax, googleCalendar) {
    const calendars = calendarsPerRoom[roomName];

    const requestBody = {
        timeMin: new Date(timeMin).toISOString(),
        timeMax: new Date(timeMax).toISOString(),
        items: calendars.map(id => ({ id })),
    };

    const freeBusyResponse = await googleCalendar.checkFreeBusy(oAuth2Client, requestBody);

    // La stanza è disponibile solo se TUTTI i calendari non hanno eventi occupati
    const allCalendarsFree = calendars.every(calendarId => freeBusyResponse[calendarId].busy.length === 0);

    return allCalendarsFree;
}



// Rotta per controllare la disponibilità delle camere
router.post('/freebusy', async (req, res) => {

    var wordpressBaseUrl = 'https://villapanoramasuite.it/booking-engine-reservation-form'; // URL del sito WordPress

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

        // Qui usiamo la nuova logica per verificare ogni stanza
        let availableRooms = [];

        for (const roomName in calendarsPerRoom) {
            const isAvailable = await checkRoomAvailability(oAuth2Client, roomName, timeMin, timeMax, googleCalendar);
            if (isAvailable) {
                availableRooms.push({
                    name: roomName,
                    image: roomsImages[roomName],
                });
            }
        }

        // Se ci sono stanze disponibili calcoliamo i prezzi:
        if (availableRooms.length > 0) {
            const roomCosts = await Promise.all(availableRooms.map(async room => {
                const bookings = await BookingHelper.readCSV(`rooms_prices/${room.name}.csv`);
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
                                    <img src="/assets/images/${roomImagesByName[room.name]}" alt="${room.name}" class="card-img-top">
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

module.exports = router;
