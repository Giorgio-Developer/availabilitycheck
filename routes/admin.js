const express = require('express');
const router = express.Router();
// const checkAdminAuth = require('../middleware/checkAdminAuth'); // Middleware di autenticazione
const { convertDateToDDMMYYYY, convertToDateObject, validateDates } = require('../utils/dateUtils');
const { writeCSV } = require('../utils/csvUtils');

const adminAuth = require('../middleware/checkAdminAuth');

router.get('/admin/edit/:roomName', adminAuth.checkAdminAuth, async (req, res) => {
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
router.post('/edit/:roomName', adminAuth.checkAdminAuth, async (req, res) => {
    const roomName = req.params.roomName;
    let csvData = req.body.csvData;

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

module.exports = router;
