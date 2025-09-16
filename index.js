require('dotenv').config(); // Carica le variabili d'ambiente dal file .env
const express = require('express');
const session = require('express-session');
const path = require('path');
const axios = require('axios');
const OpenAI = require('openai');
const multer = require('multer');
const fs = require('fs');

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

// AI PROMPT MANAGEMENT FUNCTIONS

// Funzione per leggere il prompt dal file
function readPrompt() {
    const promptPath = path.join(__dirname, 'ai_prompt.txt');
    try {
        if (fs.existsSync(promptPath)) {
            return fs.readFileSync(promptPath, 'utf8').trim();
        } else {
            // Prompt di default se il file non esiste
            const defaultPrompt = "Rispondi in html, che può essere direttamente incluso all'interno di un <div></div>. Non includere cose come ```html o ```. Ho questi dati di prezzo per una stanza di unn B&B. Ritieni ci siano congrui o che ci sia qualche errore, tipo un prezzo eccessivamente basso o eccessivamente alto?";
            fs.writeFileSync(promptPath, defaultPrompt, 'utf8');
            return defaultPrompt;
        }
    } catch (error) {
        console.error('Errore nella lettura del prompt:', error);
        return "Rispondi in html, che può essere direttamente incluso all'interno di un <div></div>. Non includere cose come ```html o ```. Ho questi dati di prezzo per una stanza di unn B&B. Ritieni ci siano congrui o che ci sia qualche errore, tipo un prezzo eccessivamente basso o eccessivamente alto?";
    }
}

// Funzione per scrivere il prompt nel file
function writePrompt(prompt) {
    const promptPath = path.join(__dirname, 'ai_prompt.txt');
    try {
        fs.writeFileSync(promptPath, prompt, 'utf8');
        return true;
    } catch (error) {
        console.error('Errore nella scrittura del prompt:', error);
        return false;
    }
}

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

// Configura multer per l'upload dei file
const upload = multer({
    dest: 'temp_uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Solo file CSV sono consentiti!'), false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 // 1MB
    }
});


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

    const promptTemplate = readPrompt();
    const prompt = promptTemplate + " " +
    `${csvData.map(row => `Data inizio: ${row['data inizio']}, Data fine: ${row['data fine']}, Costo: ${row.costo}`).join('\n')}`;

    // Chiamata alle API di OpenAI per chiedere conferma della congruità dei prezzi
    const openAiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-5-nano",
        messages: [{ role: "user", content: prompt }],
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });

    const aiConfirmation = openAiResponse.data.choices[0].message.content;
    // console.log(aiConfirmation);

    try {
        // Scriviamo i dati aggiornati nel file CSV
        await writeCSV(roomName, csvData);
        // Rispondi con JSON
        res.json({ success: true, data: csvData, aiConfirmation: aiConfirmation });
    } catch (error) {
        res.status(500).json({ error: 'Errore durante la scrittura nel file CSV' });
    }
});

// AI PROMPT MANAGEMENT ROUTES

// Rotta per ottenere il prompt corrente
app.get('/admin/prompt', checkAdminAuth, (req, res) => {
    try {
        const prompt = readPrompt();
        res.json({ success: true, prompt: prompt });
    } catch (error) {
        console.error('Errore nel caricamento del prompt:', error);
        res.status(500).json({ success: false, error: 'Errore nel caricamento del prompt' });
    }
});

// Rotta per salvare il nuovo prompt
app.post('/admin/prompt', checkAdminAuth, (req, res) => {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ success: false, error: 'Il prompt non può essere vuoto' });
    }

    try {
        const success = writePrompt(prompt.trim());
        if (success) {
            res.json({ success: true, message: 'Prompt salvato con successo' });
        } else {
            res.status(500).json({ success: false, error: 'Errore nel salvataggio del prompt' });
        }
    } catch (error) {
        console.error('Errore nel salvataggio del prompt:', error);
        res.status(500).json({ success: false, error: 'Errore nel salvataggio del prompt' });
    }
});

// CSV MANAGEMENT ROUTES

// Rotta per la pagina di gestione CSV
app.get('/admin/csv/:roomName', checkAdminAuth, (req, res) => {
    const roomName = req.params.roomName;
    res.render('csv-management', { roomName });
});

// Rotta per il download del CSV
app.get('/admin/csv/download/:roomName', checkAdminAuth, async (req, res) => {
    const roomName = req.params.roomName;
    const csvFilePath = path.join(__dirname, 'rooms_prices', `${roomName}.csv`);

    try {
        if (fs.existsSync(csvFilePath)) {
            res.download(csvFilePath, `${roomName}.csv`);
        } else {
            res.status(404).send('File CSV non trovato');
        }
    } catch (error) {
        console.error('Errore durante il download del CSV:', error);
        res.status(500).send('Errore durante il download del file');
    }
});

// Rotta per l'upload del CSV
app.post('/admin/csv/upload/:roomName', checkAdminAuth, upload.single('csvFile'), async (req, res) => {
    const roomName = req.params.roomName;

    if (!req.file) {
        return res.status(400).json({ error: 'Nessun file caricato' });
    }

    try {
        // Leggi il file caricato
        const uploadedFilePath = req.file.path;
        const csvContent = fs.readFileSync(uploadedFilePath, 'utf8');

        // Parsing del CSV
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) {
            fs.unlinkSync(uploadedFilePath); // Rimuovi il file temporaneo
            return res.status(400).json({ error: 'Il file CSV deve contenere almeno una riga di dati oltre all\'header' });
        }

        // Verifica header
        const expectedHeaders = ['data inizio', 'data fine', 'costo'];
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const hasValidHeaders = expectedHeaders.every(header =>
            headers.some(h => h.includes(header.split(' ')[0]) && h.includes(header.split(' ')[1] || ''))
        );

        if (!hasValidHeaders) {
            fs.unlinkSync(uploadedFilePath);
            return res.status(400).json({ error: 'Header del CSV non validi. Devono essere: data inizio, data fine, costo' });
        }

        // Parsing dei dati
        const csvData = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length >= 3) {
                csvData.push({
                    'data inizio': values[0],
                    'data fine': values[1],
                    costo: values[2]
                });
            }
        }

        // Validazione delle date
        const validationError = validateDates(csvData);
        if (validationError) {
            fs.unlinkSync(uploadedFilePath);
            return res.status(400).json({ error: validationError });
        }

        // Chiamata AI per validazione prezzi
        const promptTemplate = readPrompt();
        const prompt = promptTemplate + " " +
            `${csvData.map(row => `Data inizio: ${row['data inizio']}, Data fine: ${row['data fine']}, Costo: ${row.costo}`).join('\n')}`;

        const openAiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-5-nano",
            messages: [{ role: "user", content: prompt }],
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const aiConfirmation = openAiResponse.data.choices[0].message.content;

        // Salva il nuovo CSV
        await writeCSV(roomName, csvData);

        // Rimuovi il file temporaneo
        fs.unlinkSync(uploadedFilePath);

        res.json({
            success: true,
            data: csvData,
            aiConfirmation: aiConfirmation,
            message: 'File CSV caricato e validato con successo'
        });

    } catch (error) {
        // Pulisci il file temporaneo in caso di errore
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error('Errore durante l\'upload del CSV:', error);
        res.status(500).json({ error: 'Errore durante il caricamento del file: ' + error.message });
    }
});

// Avvia il server solo se non siamo in ambiente di test
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server in ascolto su http://localhost:${port}`);
    });
}

module.exports = app;
