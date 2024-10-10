require('dotenv').config(); // Carica le variabili d'ambiente dal file .env
const express = require('express');
const session = require('express-session');
const path = require('path');
const axios = require('axios');

// ENV Constants
const apiKey = process.env.OPENAI_API_KEY;
const port = process.env.PORT || 3000;
const sessionSecret = process.env.SESSION_SECRET;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

// Importa le rotte
const calendarRoutes = require('./routes/calendar');
const freebusyRoutes = require('./routes/freebusy');

const { convertDateToDDMMYYYY, validateDates } = require('./utils/dateUtils');
const { readCSV, writeCSV } = require('./utils/csvUtils');
const { admin } = require('googleapis/build/src/apis/admin');

// Crea un'applicazione Express
const app = express();

// Configura express-session
app.use(session({
    secret: sessionSecret, // Utilizza la variabile SESSION_SECRET dal file .env
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Assicurati che secure sia false se non stai usando HTTPS
}));

// Configura EJS come motore di visualizzazione
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Imposta la cartella views

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'assets'))); // Servire i file statici dalla cartella assets


// Rotte per il calendario e la disponibilità
app.use('/', calendarRoutes);
app.use('/', freebusyRoutes);


// ADMIN AREA
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

// Middleware per l'autenticazione dell'amministratore
function authenticateAdmin(req, res, next) {
    const { email, password } = req.body;

    if (email === adminEmail && password === adminPassword) {
        req.session.isAdminAuthenticated = true; // Imposta la sessione
        next();
    } else {
        res.status(401).send('Autenticazione fallita. Credenziali errate.');
    }
}

// Middleware per verificare se l'amministratore è autenticato
function checkAdminAuth(req, res, next) {
    if (req.session.isAdminAuthenticated) {
        next(); // Se l'utente è autenticato, passa alla prossima funzione
    } else {
        res.status(401).send('Accesso non autorizzato. Effettua il login.');
    }
}

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

    // Convertiamo le date nel formato DD/MM/YYYY e verifichiamo le sovrapposizioni e i buchi temporali
    csvData = csvData.map(row => ({
        'data inizio': convertDateToDDMMYYYY(row['data inizio']),
        'data fine': convertDateToDDMMYYYY(row['data fine']),
        costo: row.costo
    }));

    // Esegui la validazione delle date
    const validationError = validateDates(csvData);
    if (validationError) {
        return res.status(500).json({ error: validationError });
    }

    try {
        // Scriviamo i dati aggiornati nel file CSV
        await writeCSV(roomName, csvData);
        // Rispondi con JSON
        res.json({ success: true, data: csvData });
    } catch (error) {
        res.status(500).json({ error: 'Errore durante la scrittura nel file CSV' });
    }
});




// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});

module.exports = app;
