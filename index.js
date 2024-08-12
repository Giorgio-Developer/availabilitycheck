const express = require('express');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const GoogleCalendar = require('./GoogleCalendar');
const BookingHelper = require('./BookingHelper'); // Importa la classe BookingHelper
const app = express();
const port = 3000;

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


const translations_it = {
    "Disponibilità Villa Panorama": "Disponibilità Villa Panorama",
    "Costo totale per il periodo selezionato:": "Costo totale per il periodo selezionato:",
    "Camere disponibili nel periodo selezionato": "Camere disponibili nel periodo selezionato",
    "Nessuno dei calendari è disponibile nel periodo selezionato.": "Nessuno dei calendari è disponibile nel periodo selezionato.",
    "Periodi alternativi disponibili" : "Periodi alternativi disponibili:",
    "Richiesta prenotazione": "Richiesta prenotazione",
    "Nessuna Suite disponibile per l'intero periodo selezionato": "Nessuna Suite disponibile per l'intero periodo selezionato",
    "Seleziona": "Seleziona"
};

const translations_en = {
    "Disponibilità Villa Panorama": "Villa Panorama Availability",
    "Costo totale per il periodo selezionato:": "Total cost for the selected period",
    "Camere disponibili nel periodo selezionato": "Rooms available in the selected period",
    "Nessuno dei calendari è disponibile nel periodo selezionato.": "None of the calendars are available in the selected period.",
    "Periodi alternativi disponibili" : "Alternative periods available:",
    "Richiesta prenotazione": "Booking request",
    "Nessuna Suite disponibile per l'intero periodo selezionato": "No Suite available for the entire selected period",
    "Seleziona": "Choose"
};
  
const translations_fr = {
    "Disponibilità Villa Panorama": "Disponibilité Villa Panorama",
    "Costo totale per il periodo selezionato:": "Coût total pour la période sélectionnée",
    "Camere disponibili nel periodo selezionato": "Chambres disponibles dans la période sélectionnée",
    "Nessuno dei calendari è disponibile nel periodo selezionato.": "Aucun des calendriers n'est disponible dans la période sélectionnée.",
    "Periodi alternativi disponibili" : "Périodes alternatives disponibles:",
    "Richiesta prenotazione": "Demande de réservation",
    "Nessuna Suite disponibile per l'intero periodo selezionato": "Aucune suite disponible pour toute la période sélectionnée",
    "Seleziona": "Choisir"
};

const translations_de = {
    "Disponibilità Villa Panorama": "Villa Panorama Verfügbarkeit",
    "Costo totale per il periodo selezionato:": "Gesamtkosten für den ausgewählten Zeitraum",
    "Camere disponibili nel periodo selezionato": "Zimmer verfügbar im ausgewählten Zeitraum",
    "Nessuno dei calendari è disponibile nel periodo selezionato.": "Keiner der Kalender ist im ausgewählten Zeitraum verfügbar.",
    "Periodi alternativi disponibili" : "Alternative Zeiträume verfügbar:",
    "Richiesta prenotazione": "Buchungsanfrage",
    "Nessuna Suite disponibile per l'intero periodo selezionato": "Keine Suite für den gesamten ausgewählten Zeitraum verfügbar",
    "Seleziona": "Wählen"
};

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



const htmlResponsePostfix = `
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
        let { calendarIds, timeMin, timeMax, adults, children, pets } = req.body;


        // Prendi l'header 'Accept-Language' e scegli la prima lingua
        let lang = req.headers['accept-language'];
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

        let topNavigationBarCSS = `
            <style id="wp-emoji-styles-inline-css" type="text/css">

                img.wp-smiley, img.emoji {
                    display: inline !important;
                    border: none !important;
                    box-shadow: none !important;
                    height: 1em !important;
                    width: 1em !important;
                    margin: 0 0.07em !important;
                    vertical-align: -0.1em !important;
                    background: none !important;
                    padding: 0 !important;
                }
            </style>
            <style id="joinchat-button-style-inline-css" type="text/css">
            .wp-block-joinchat-button{border:none!important;text-align:center}.wp-block-joinchat-button figure{display:table;margin:0 auto;padding:0}.wp-block-joinchat-button figcaption{font:normal normal 400 .6em/2em var(--wp--preset--font-family--system-font,sans-serif);margin:0;padding:0}.wp-block-joinchat-button .joinchat-button__qr{background-color:#fff;border:6px solid #25d366;border-radius:30px;box-sizing:content-box;display:block;height:200px;margin:auto;overflow:hidden;padding:10px;width:200px}.wp-block-joinchat-button .joinchat-button__qr canvas,.wp-block-joinchat-button .joinchat-button__qr img{display:block;margin:auto}.wp-block-joinchat-button .joinchat-button__link{align-items:center;background-color:#25d366;border:6px solid #25d366;border-radius:30px;display:inline-flex;flex-flow:row nowrap;justify-content:center;line-height:1.25em;margin:0 auto;text-decoration:none}.wp-block-joinchat-button .joinchat-button__link:before{background:transparent var(--joinchat-ico) no-repeat center;background-size:100%;content:"";display:block;height:1.5em;margin:-.75em .75em -.75em 0;width:1.5em}.wp-block-joinchat-button figure+.joinchat-button__link{margin-top:10px}@media (orientation:landscape)and (min-height:481px),(orientation:portrait)and (min-width:481px){.wp-block-joinchat-button.joinchat-button--qr-only figure+.joinchat-button__link{display:none}}@media (max-width:480px),(orientation:landscape)and (max-height:480px){.wp-block-joinchat-button figure{display:none}}

            </style>
            <style id="classic-theme-styles-inline-css" type="text/css">
            /*! This file is auto-generated */
            .wp-block-button__link{color:#fff;background-color:#32373c;border-radius:9999px;box-shadow:none;text-decoration:none;padding:calc(.667em + 2px) calc(1.333em + 2px);font-size:1.125em}.wp-block-file__button{background:#32373c;color:#fff;text-decoration:none}
            </style>
            <style id="global-styles-inline-css" type="text/css">
            :root{--wp--preset--aspect-ratio--square: 1;--wp--preset--aspect-ratio--4-3: 4/3;--wp--preset--aspect-ratio--3-4: 3/4;--wp--preset--aspect-ratio--3-2: 3/2;--wp--preset--aspect-ratio--2-3: 2/3;--wp--preset--aspect-ratio--16-9: 16/9;--wp--preset--aspect-ratio--9-16: 9/16;--wp--preset--color--black: #000000;--wp--preset--color--cyan-bluish-gray: #abb8c3;--wp--preset--color--white: #FFF;--wp--preset--color--pale-pink: #f78da7;--wp--preset--color--vivid-red: #cf2e2e;--wp--preset--color--luminous-vivid-orange: #ff6900;--wp--preset--color--luminous-vivid-amber: #fcb900;--wp--preset--color--light-green-cyan: #7bdcb5;--wp--preset--color--vivid-green-cyan: #00d084;--wp--preset--color--pale-cyan-blue: #8ed1fc;--wp--preset--color--vivid-cyan-blue: #0693e3;--wp--preset--color--vivid-purple: #9b51e0;--wp--preset--color--accent: #4089ae;--wp--preset--color--dark-gray: #111;--wp--preset--color--light-gray: #767676;--wp--preset--gradient--vivid-cyan-blue-to-vivid-purple: linear-gradient(135deg,rgba(6,147,227,1) 0%,rgb(155,81,224) 100%);--wp--preset--gradient--light-green-cyan-to-vivid-green-cyan: linear-gradient(135deg,rgb(122,220,180) 0%,rgb(0,208,130) 100%);--wp--preset--gradient--luminous-vivid-amber-to-luminous-vivid-orange: linear-gradient(135deg,rgba(252,185,0,1) 0%,rgba(255,105,0,1) 100%);--wp--preset--gradient--luminous-vivid-orange-to-vivid-red: linear-gradient(135deg,rgba(255,105,0,1) 0%,rgb(207,46,46) 100%);--wp--preset--gradient--very-light-gray-to-cyan-bluish-gray: linear-gradient(135deg,rgb(238,238,238) 0%,rgb(169,184,195) 100%);--wp--preset--gradient--cool-to-warm-spectrum: linear-gradient(135deg,rgb(74,234,220) 0%,rgb(151,120,209) 20%,rgb(207,42,186) 40%,rgb(238,44,130) 60%,rgb(251,105,98) 80%,rgb(254,248,76) 100%);--wp--preset--gradient--blush-light-purple: linear-gradient(135deg,rgb(255,206,236) 0%,rgb(152,150,240) 100%);--wp--preset--gradient--blush-bordeaux: linear-gradient(135deg,rgb(254,205,165) 0%,rgb(254,45,45) 50%,rgb(107,0,62) 100%);--wp--preset--gradient--luminous-dusk: linear-gradient(135deg,rgb(255,203,112) 0%,rgb(199,81,192) 50%,rgb(65,88,208) 100%);--wp--preset--gradient--pale-ocean: linear-gradient(135deg,rgb(255,245,203) 0%,rgb(182,227,212) 50%,rgb(51,167,181) 100%);--wp--preset--gradient--electric-grass: linear-gradient(135deg,rgb(202,248,128) 0%,rgb(113,206,126) 100%);--wp--preset--gradient--midnight: linear-gradient(135deg,rgb(2,3,129) 0%,rgb(40,116,252) 100%);--wp--preset--font-size--small: 13px;--wp--preset--font-size--medium: 20px;--wp--preset--font-size--large: 36px;--wp--preset--font-size--x-large: 42px;--wp--preset--spacing--20: 0.44rem;--wp--preset--spacing--30: 0.67rem;--wp--preset--spacing--40: 1rem;--wp--preset--spacing--50: 1.5rem;--wp--preset--spacing--60: 2.25rem;--wp--preset--spacing--70: 3.38rem;--wp--preset--spacing--80: 5.06rem;--wp--preset--shadow--natural: 6px 6px 9px rgba(0, 0, 0, 0.2);--wp--preset--shadow--deep: 12px 12px 50px rgba(0, 0, 0, 0.4);--wp--preset--shadow--sharp: 6px 6px 0px rgba(0, 0, 0, 0.2);--wp--preset--shadow--outlined: 6px 6px 0px -3px rgba(255, 255, 255, 1), 6px 6px rgba(0, 0, 0, 1);--wp--preset--shadow--crisp: 6px 6px 0px rgba(0, 0, 0, 1);}:where(.is-layout-flex){gap: 0.5em;}:where(.is-layout-grid){gap: 0.5em;}body .is-layout-flex{display: flex;}.is-layout-flex{flex-wrap: wrap;align-items: center;}.is-layout-flex > :is(*, div){margin: 0;}body .is-layout-grid{display: grid;}.is-layout-grid > :is(*, div){margin: 0;}:where(.wp-block-columns.is-layout-flex){gap: 2em;}:where(.wp-block-columns.is-layout-grid){gap: 2em;}:where(.wp-block-post-template.is-layout-flex){gap: 1.25em;}:where(.wp-block-post-template.is-layout-grid){gap: 1.25em;}.has-black-color{color: var(--wp--preset--color--black) !important;}.has-cyan-bluish-gray-color{color: var(--wp--preset--color--cyan-bluish-gray) !important;}.has-white-color{color: var(--wp--preset--color--white) !important;}.has-pale-pink-color{color: var(--wp--preset--color--pale-pink) !important;}.has-vivid-red-color{color: var(--wp--preset--color--vivid-red) !important;}.has-luminous-vivid-orange-color{color: var(--wp--preset--color--luminous-vivid-orange) !important;}.has-luminous-vivid-amber-color{color: var(--wp--preset--color--luminous-vivid-amber) !important;}.has-light-green-cyan-color{color: var(--wp--preset--color--light-green-cyan) !important;}.has-vivid-green-cyan-color{color: var(--wp--preset--color--vivid-green-cyan) !important;}.has-pale-cyan-blue-color{color: var(--wp--preset--color--pale-cyan-blue) !important;}.has-vivid-cyan-blue-color{color: var(--wp--preset--color--vivid-cyan-blue) !important;}.has-vivid-purple-color{color: var(--wp--preset--color--vivid-purple) !important;}.has-black-background-color{background-color: var(--wp--preset--color--black) !important;}.has-cyan-bluish-gray-background-color{background-color: var(--wp--preset--color--cyan-bluish-gray) !important;}.has-white-background-color{background-color: var(--wp--preset--color--white) !important;}.has-pale-pink-background-color{background-color: var(--wp--preset--color--pale-pink) !important;}.has-vivid-red-background-color{background-color: var(--wp--preset--color--vivid-red) !important;}.has-luminous-vivid-orange-background-color{background-color: var(--wp--preset--color--luminous-vivid-orange) !important;}.has-luminous-vivid-amber-background-color{background-color: var(--wp--preset--color--luminous-vivid-amber) !important;}.has-light-green-cyan-background-color{background-color: var(--wp--preset--color--light-green-cyan) !important;}.has-vivid-green-cyan-background-color{background-color: var(--wp--preset--color--vivid-green-cyan) !important;}.has-pale-cyan-blue-background-color{background-color: var(--wp--preset--color--pale-cyan-blue) !important;}.has-vivid-cyan-blue-background-color{background-color: var(--wp--preset--color--vivid-cyan-blue) !important;}.has-vivid-purple-background-color{background-color: var(--wp--preset--color--vivid-purple) !important;}.has-black-border-color{border-color: var(--wp--preset--color--black) !important;}.has-cyan-bluish-gray-border-color{border-color: var(--wp--preset--color--cyan-bluish-gray) !important;}.has-white-border-color{border-color: var(--wp--preset--color--white) !important;}.has-pale-pink-border-color{border-color: var(--wp--preset--color--pale-pink) !important;}.has-vivid-red-border-color{border-color: var(--wp--preset--color--vivid-red) !important;}.has-luminous-vivid-orange-border-color{border-color: var(--wp--preset--color--luminous-vivid-orange) !important;}.has-luminous-vivid-amber-border-color{border-color: var(--wp--preset--color--luminous-vivid-amber) !important;}.has-light-green-cyan-border-color{border-color: var(--wp--preset--color--light-green-cyan) !important;}.has-vivid-green-cyan-border-color{border-color: var(--wp--preset--color--vivid-green-cyan) !important;}.has-pale-cyan-blue-border-color{border-color: var(--wp--preset--color--pale-cyan-blue) !important;}.has-vivid-cyan-blue-border-color{border-color: var(--wp--preset--color--vivid-cyan-blue) !important;}.has-vivid-purple-border-color{border-color: var(--wp--preset--color--vivid-purple) !important;}.has-vivid-cyan-blue-to-vivid-purple-gradient-background{background: var(--wp--preset--gradient--vivid-cyan-blue-to-vivid-purple) !important;}.has-light-green-cyan-to-vivid-green-cyan-gradient-background{background: var(--wp--preset--gradient--light-green-cyan-to-vivid-green-cyan) !important;}.has-luminous-vivid-amber-to-luminous-vivid-orange-gradient-background{background: var(--wp--preset--gradient--luminous-vivid-amber-to-luminous-vivid-orange) !important;}.has-luminous-vivid-orange-to-vivid-red-gradient-background{background: var(--wp--preset--gradient--luminous-vivid-orange-to-vivid-red) !important;}.has-very-light-gray-to-cyan-bluish-gray-gradient-background{background: var(--wp--preset--gradient--very-light-gray-to-cyan-bluish-gray) !important;}.has-cool-to-warm-spectrum-gradient-background{background: var(--wp--preset--gradient--cool-to-warm-spectrum) !important;}.has-blush-light-purple-gradient-background{background: var(--wp--preset--gradient--blush-light-purple) !important;}.has-blush-bordeaux-gradient-background{background: var(--wp--preset--gradient--blush-bordeaux) !important;}.has-luminous-dusk-gradient-background{background: var(--wp--preset--gradient--luminous-dusk) !important;}.has-pale-ocean-gradient-background{background: var(--wp--preset--gradient--pale-ocean) !important;}.has-electric-grass-gradient-background{background: var(--wp--preset--gradient--electric-grass) !important;}.has-midnight-gradient-background{background: var(--wp--preset--gradient--midnight) !important;}.has-small-font-size{font-size: var(--wp--preset--font-size--small) !important;}.has-medium-font-size{font-size: var(--wp--preset--font-size--medium) !important;}.has-large-font-size{font-size: var(--wp--preset--font-size--large) !important;}.has-x-large-font-size{font-size: var(--wp--preset--font-size--x-large) !important;}
            :where(.wp-block-post-template.is-layout-flex){gap: 1.25em;}:where(.wp-block-post-template.is-layout-grid){gap: 1.25em;}
            :where(.wp-block-columns.is-layout-flex){gap: 2em;}:where(.wp-block-columns.is-layout-grid){gap: 2em;}
            :root :where(.wp-block-pullquote){font-size: 1.5em;line-height: 1.6;}
            </style>
            <link rel="stylesheet" id="contact-form-7-css" href="https://villapanoramasuite.it/wp-content/plugins/contact-form-7/includes/css/styles.css?ver=5.9.6" type="text/css" media="all">
            <link rel="stylesheet" id="venomaps-css" href="https://villapanoramasuite.it/wp-content/plugins/venomaps/include/css/venomaps-bundle.min.css?ver=1.2.4" type="text/css" media="all">
            <link rel="stylesheet" id="ex-google-fonts-css" href="//fonts.googleapis.com/css?family=Source+Sans+Pro&amp;ver=1.0.0" type="text/css" media="all">
            <link rel="stylesheet" id="wpcf7-redirect-script-frontend-css" href="https://villapanoramasuite.it/wp-content/plugins/wpcf7-redirect/build/css/wpcf7-redirect-frontend.min.css?ver=1.1" type="text/css" media="all">
            <link rel="stylesheet" id="extendify-utility-styles-css" href="https://villapanoramasuite.it/wp-content/plugins/extendify/public/build/utility-minimum.css?ver=6.6.1" type="text/css" media="all">
            <link rel="stylesheet" id="elementor-icons-css" href="https://villapanoramasuite.it/wp-content/plugins/elementor/assets/lib/eicons/css/elementor-icons.min.css?ver=5.30.0" type="text/css" media="all">
            <link rel="stylesheet" id="elementor-frontend-css" href="https://villapanoramasuite.it/wp-content/plugins/elementor/assets/css/frontend.min.css?ver=3.22.3" type="text/css" media="all">
            <link rel="stylesheet" id="swiper-css" href="https://villapanoramasuite.it/wp-content/plugins/elementor/assets/lib/swiper/v8/css/swiper.min.css?ver=8.4.5" type="text/css" media="all">
            <link rel="stylesheet" id="elementor-post-231-css" href="https://villapanoramasuite.it/wp-content/uploads/elementor/css/post-231.css?ver=1722410044" type="text/css" media="all">
            <link rel="stylesheet" id="elementor-global-css" href="https://villapanoramasuite.it/wp-content/uploads/elementor/css/global.css?ver=1722410044" type="text/css" media="all">
            <link rel="stylesheet" id="elementor-post-496-css" href="https://villapanoramasuite.it/wp-content/uploads/elementor/css/post-496.css?ver=1722411998" type="text/css" media="all">
            <link rel="stylesheet" id="the7-font-css" href="https://villapanoramasuite.it/wp-content/themes/dt-the7/fonts/icomoon-the7-font/icomoon-the7-font.min.css?ver=11.4.1" type="text/css" media="all">
            <link rel="stylesheet" id="the7-fontello-css" href="https://villapanoramasuite.it/wp-content/themes/dt-the7/fonts/fontello/css/fontello.min.css?ver=11.4.1" type="text/css" media="all">
            <link rel="stylesheet" id="joinchat-css" href="https://villapanoramasuite.it/wp-content/plugins/creame-whatsapp-me/public/css/joinchat.min.css?ver=5.1.6" type="text/css" media="all">
            <link rel="stylesheet" id="dt-web-fonts-css" href="https://fonts.googleapis.com/css?family=Roboto:400,500,600,700%7CPlayfair+Display:400,600,700%7CPoppins:400,600,700" type="text/css" media="all">
            <link rel="stylesheet" id="dt-main-css" href="https://villapanoramasuite.it/wp-content/themes/dt-the7/css/main.min.css?ver=11.4.1" type="text/css" media="all">
            <link rel="stylesheet" id="the7-custom-scrollbar-css" href="https://villapanoramasuite.it/wp-content/themes/dt-the7/lib/custom-scrollbar/custom-scrollbar.min.css?ver=11.4.1" type="text/css" media="all">
            <link rel="stylesheet" id="the7-css-vars-css" href="https://villapanoramasuite.it/wp-content/uploads/the7-css/css-vars.css?ver=493ba19b8954" type="text/css" media="all">
            <link rel="stylesheet" id="dt-custom-css" href="https://villapanoramasuite.it/wp-content/uploads/the7-css/custom.css?ver=493ba19b8954" type="text/css" media="all">
            <link rel="stylesheet" id="dt-media-css" href="https://villapanoramasuite.it/wp-content/uploads/the7-css/media.css?ver=493ba19b8954" type="text/css" media="all">
            <link rel="stylesheet" id="the7-mega-menu-css" href="https://villapanoramasuite.it/wp-content/uploads/the7-css/mega-menu.css?ver=493ba19b8954" type="text/css" media="all">
            <link rel="stylesheet" id="wpml.less-css" href="https://villapanoramasuite.it/wp-content/uploads/the7-css/compatibility/wpml.css?ver=493ba19b8954" type="text/css" media="all">
            <link rel="stylesheet" id="style-css" href="https://villapanoramasuite.it/wp-content/themes/dt-the7-child/style.css?ver=11.4.1" type="text/css" media="all">
            <link rel="stylesheet" id="the7-elementor-global-css" href="https://villapanoramasuite.it/wp-content/themes/dt-the7/css/compatibility/elementor/elementor-global.min.css?ver=11.4.1" type="text/css" media="all">
            <link rel="stylesheet" id="ex-wp-food-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/css/style.css?ver=6.6.1" type="text/css" media="all">
            <link rel="stylesheet" id="ex-wp-food-list-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/css/style-list.css?ver=6.6.1" type="text/css" media="all">
            <link rel="stylesheet" id="ex-wp-food-table-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/css/style-table.css?ver=6.6.1" type="text/css" media="all">
            <link rel="stylesheet" id="ex-wp-food-modal-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/css/modal.css?ver=6.6.1" type="text/css" media="all">
            <link rel="stylesheet" id="ex-wp-food-user-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/css/user.css?ver=6.6.1" type="text/css" media="all">
            <link rel="stylesheet" id="ex-wp-s_lick-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/js/ex_s_lick/ex_s_lick.css?ver=6.6.1" type="text/css" media="all">
            <link rel="stylesheet" id="ex_wp_s_lick-theme-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/js/ex_s_lick/ex_s_lick-theme.css?ver=6.6.1" type="text/css" media="all">
            <link rel="stylesheet" id="exfood-custom-css-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/js/ex_s_lick/ex_s_lick.css?ver=6.6.1" type="text/css" media="all">
            <style id="exfood-custom-css-inline-css" type="text/css">
                select.ex-ck-select,.exfood-select-loc select.ex-loc-select{background-image: url(https://villapanoramasuite.it/wp-content/plugins/wp-food/css/icon-dropdow.png);}
                /*.exfd-hide-order {display:none;}*/
            </style>
            <link rel="stylesheet" id="wpr-text-animations-css-css" href="https://villapanoramasuite.it/wp-content/plugins/royal-elementor-addons/assets/css/lib/animations/text-animations.min.css?ver=1.3.979" type="text/css" media="all">
            <link rel="stylesheet" id="wpr-addons-css-css" href="https://villapanoramasuite.it/wp-content/plugins/royal-elementor-addons/assets/css/frontend.min.css?ver=1.3.979" type="text/css" media="all">
            <link rel="stylesheet" id="font-awesome-5-all-css" href="https://villapanoramasuite.it/wp-content/plugins/elementor/assets/lib/font-awesome/css/all.min.css?ver=1.3.979" type="text/css" media="all">
            <link rel="stylesheet" id="google-fonts-1-css" href="https://fonts.googleapis.com/css?family=Roboto%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic%7CRoboto+Slab%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic&amp;display=auto&amp;ver=6.6.1" type="text/css" media="all">
            <link rel="stylesheet" id="elementor-icons-shared-0-css" href="https://villapanoramasuite.it/wp-content/plugins/elementor/assets/lib/font-awesome/css/fontawesome.min.css?ver=5.15.3" type="text/css" media="all">
            <link rel="stylesheet" id="elementor-icons-fa-solid-css" href="https://villapanoramasuite.it/wp-content/plugins/elementor/assets/lib/font-awesome/css/solid.min.css?ver=5.15.3" type="text/css" media="all">
`;


        let topNavigationBar = `
            <div class="masthead inline-header right light-preset-color widgets full-height shadow-decoration shadow-mobile-header-decoration type-9-mobile-menu-icon dt-parent-menu-clickable show-sub-menu-on-hover" style="background-color: rgba(0,0,0,0);" role="banner">
                <div class="top-bar line-content">
                    <div class="top-bar-bg" style="background-color: rgba(255,255,255,0);"></div>
                    <div class="left-widgets mini-widgets">
                        <a href="mailto: booking@villapanoramasuite.it" class="mini-contacts email show-on-desktop near-logo-first-switch in-menu-second-switch first last">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-fill" viewBox="0 0 16 16">
                                <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
                            </svg>&nbsp;
                            booking@villapanoramasuite.it
                        </a>
                    </div>
                </div>
            
                <header class="header-bar">
                    <div class="branding">
                        <div id="site-title" class="assistive-text">Villa Panorama</div>
                        <div id="site-description" class="assistive-text">Camere Suite a Porto Empedocle</div>
                        <a class="" href="https://villapanoramasuite.it/">
                            <img class=" preload-me" src="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-B70px.png" srcset="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-B70px.png 195w, https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-Bi240px.png 667w" width="195" height="70" sizes="195px" alt="Villa Panorama">
                        </a>
                    </div>
                    <ul id="primary-menu" class="main-nav underline-decoration l-to-r-line outside-item-remove-margin">
                        <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home current-menu-item page_item page-item-496 current_page_item menu-item-502 act first depth-0">
                            <a href="https://villapanoramasuite.it/" data-level="1">
                                <span class="menu-item-text">
                                    <span class="menu-text">Home</span>
                                    <i class="underline"></i>
                                </span>
                            </a>
                        </li>
                        <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-127 depth-0">
                            <a href="https://villapanoramasuite.it/struttura/" data-level="1">
                                <span class="menu-item-text">
                                    <span class="menu-text">Struttura</span>
                                    <i class="underline"></i>
                                </span>
                            </a>
                        </li>
                        <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2122 depth-0">
                            <a href="https://villapanoramasuite.it/suite/" data-level="1">
                                <span class="menu-item-text">
                                    <span class="menu-text">Suite</span>
                                    <i class="underline"></i>
                                </span>
                            </a>
                        </li>
                        <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2937 depth-0">
                            <a href="https://villapanoramasuite.it/gallery/" data-level="1">
                                <span class="menu-item-text">
                                    <span class="menu-text">Gallery</span>
                                    <i class="underline"></i>
                                </span>
                            </a>
                        </li>
                        <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-87 depth-0">
                            <a href="https://villapanoramasuite.it/punti-di-interesse/" data-level="1">
                                <span class="menu-item-text">
                                    <span class="menu-text">Punti di interesse</span>
                                    <i class="underline"></i>
                                </span>
                            </a>
                        </li>
                        <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-298 depth-0">
                            <a href="https://villapanoramasuite.it/contatti/" data-level="1">
                                <span class="menu-item-text">
                                    <span class="menu-text">Contatti</span>
                                    <i class="underline"></i>
                                </span>
                            </a>
                        </li>
                        <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-1650 last depth-0">
                            <a href="https://villapanoramasuite.it/prenota/" data-level="1">
                                <span class="menu-item-text">
                                    <span class="menu-text">Prenota</span>
                                    <i class="underline"></i>
                                </span>
                            </a>
                        </li>
                    </ul>
                </header>

                <div class="mobile-header-bar">
                    <div class="mobile-navigation">
                        <a href="#" class="dt-mobile-menu-icon" aria-label="Mobile menu icon">
                            <div class="lines-button ">
                                <span class="menu-line"></span>
                                <span class="menu-line"></span>
                                <span class="menu-line"></span>
                            </div>
                        </a>
                    </div>
                    <div class="mobile-mini-widgets">
                        <a href="mailto: booking@villapanoramasuite.it" class="mini-contacts email show-on-desktop near-logo-first-switch in-menu-second-switch show-on-first-switch">
                            <i class="fa-fw the7-mw-icon-mail-bold"></i> 
                            booking@villapanoramasuite.it
                        </a>
                    </div>
                    <div class="mobile-branding">
                        <a class="sticky-mobile-logo-second-switch" href="https://villapanoramasuite.it/">
                            <img class=" preload-me" src="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-70px.png" srcset="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-70px.png 195w, https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-240px.png 667w" width="195" height="70" sizes="195px" alt="Villa Panorama"> 
                        </a>
                        <a class="sticky-mobile-logo-first-switch" href="https://villapanoramasuite.it/"><img class=" preload-me" src="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-70px.png" srcset="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-70px.png 195w, https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-240px.png 667w" width="195" height="70" sizes="195px" alt="Villa Panorama"> </a><a class="" href="https://villapanoramasuite.it/"><img class=" preload-me" src="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-B70px.png" srcset="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-B70px.png 195w, https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-Bi240px.png 667w" width="195" height="70" sizes="195px" alt="Villa Panorama">
                        </a>
                    </div>
                </div>
            </div>
        `;


        var htmlResponsePrefix = `
        <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>`+translateText("Disponibilità Villa Panorama", lang)+`</title>
                <!-- Bootstrap CSS -->
                <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="assets/css/style.css">`
                +topNavigationBarCSS+`
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

                    `
                        +topNavigationBarCSS+
                    `

                </head>
                <body class="body_bg">
                `
                    +topNavigationBar+
                `
                    <div class="header" style="padding-top: 50px;">
                        <button onclick="window.history.back()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                            </svg>
                        </button>
                        <p>
                            <h4  style="
                                margin-top: 20px; 
                                padding: 10px 20px; 
                                background-color: #007BFF; 
                                color: white; 
                                border-radius: 5px; 
                                background-color: #11223355; 
                                border: 1px solid lightgray;
                                ">`+translateText("Nessuna Suite disponibile per l'intero periodo selezionato", lang)+`
                            </h4>
                        </p>
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
                const totalCost = BookingHelper.calculateTotalCostV2(bookings, timeMin, timeMax, adults, children, pets);
                return {
                    ...room,
                    totalCost
                };
            }));

            pets = formatPets(pets);

            // Modifica qui: genera l'URL di WordPress con i parametri
            // const htmlResponseRoomsList = `
            //     <div class="form-group col-md-6">
            //         ${roomCosts.length > 0 ? `
            //             <ul>
            //                 ${roomCosts.map(room => `
            //                     <div class="room">
            //                         <img src="/assets/images/${room.image}" alt="${room.name}">
            //                         <div class="room-name">${room.name}</div>
            //                         <div class="room-cost">`+translateText("Costo totale per il periodo selezionato:", lang)+` ${room.totalCost} €</div>
            //                         <a href="${wordpressBaseUrl}?room=${encodeURIComponent(room.name)}&checkin=${encodeURIComponent(timeMin)}&checkout=${encodeURIComponent(timeMax)}&adults=${adults}&children=${children}&pets=${pets}&price=${room.totalCost}&lang=${lang}" class="btn btn-primary">`+translateText("Richiesta prenotazione", lang)+`</a>
            //                     </div>
            //                 `).join('')}
            //             </ul>
            //         ` : `
            //             <p>`+translateText("Nessuno dei calendari è disponibile nel periodo selezionato.", lang)+`</p>
            //         `}
            //     </div>
            // `;

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
                                        <p class="room-cost card-text">`+translateText("Costo totale per il periodo selezionato:", lang)+` ${room.totalCost} €</p>
                                        <a href="${wordpressBaseUrl}?room=${encodeURIComponent(room.name)}&checkin=${encodeURIComponent(timeMin)}&checkout=${encodeURIComponent(timeMax)}&adults=${adults}&children=${children}&pets=${pets}&price=${room.totalCost}&lang=${lang}" class="btn btn-primary">`+translateText("Richiesta prenotazione", lang)+`</a>
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
                <div class="form-group col-md-6">
                    <h4
                        style="
                            margin-top: 20px; 
                            padding: 10px 20px; 
                            background-color: #007BFF; 
                            color: white; 
                            border-radius: 5px; 
                            background-color: #11223355; 
                            border: 1px solid lightgray;
                    ">`+translateText("Periodi alternativi disponibili", lang)+`</h4>
                    <ul style="
                            padding-left: 0px;
                        ">
                        ${alternativeAvailability.map(room => `
                            <div class="room">
                                <img src="/assets/images/${room.image}" alt="${room.name}">
                                <div class="room-name">${room.name}</div>
                                <ul style="font-weight: 300; list-style: none; font-size: smaller;">
                                    ${room.availablePeriods.map(period => {
                                        // Qui utilizziamo convertDate per formattare le date
                                        const formattedStartDate = convertDate(period.start);
                                        const formattedEndDate = convertDate(period.end);
                                        pets = formatPets(pets);
                                        return `
                                            <li style=" justify-content: space-between; display: flex; padding-top: 8px;">
                                                <div>
                                                    [${period.start} - ${period.end}]
                                                </div> 
                                                <div>
                                                    <b>€ ${period.totalCost}</b>
                                                </div>  
                                                <div>
                                                    <a href="${wordpressBaseUrl}?room=${encodeURIComponent(room.name)}&checkin=${encodeURIComponent(formattedStartDate)}&checkout=${encodeURIComponent(formattedEndDate)}&adults=${adults}&children=${children}&pets=${pets}&price=${period.totalCost}&lang=${lang}" class="btn btn-sm btn-primary" style="font-size: smaller;">`+translateText("Seleziona", lang)+`</a>
                                                </div>
                                            </li>
                                        `;
                                    }).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </ul>
                </div>
            `;

            const htmlResponse = htmlResponsePrefixNoAvail + htmlAlternativeResponse + htmlResponsePostfix;

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

// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
