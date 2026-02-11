const BookingHelper = require('../BookingHelper'); // Importa la classe BookingHelper

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

        // Verifica che non ci siano buchi temporali
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

async function findNextAvailablePeriods(busyPeriods, timeMin, timeMax, adults, children, pets, roomName) {
    // Validazione edge cases
    if (!timeMin || !timeMax) {
        throw new Error('timeMin and timeMax are required');
    }

    const startDate = new Date(timeMin);
    const endDate = new Date(timeMax);
    const now = new Date();

    // Verifica che le date siano valide
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
    }

    // Verifica che timeMin < timeMax
    if (startDate >= endDate) {
        throw new Error('timeMin must be before timeMax');
    }

    // Verifica che le date siano nel futuro (con tolleranza di 1 ora)
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    if (endDate < oneHourAgo) {
        throw new Error('Cannot search for periods in the past');
    }

    const availablePeriods = [];

    if (!busyPeriods || busyPeriods.length === 0) {
        // Se non ci sono periodi occupati, tutto il range è disponibile
        availablePeriods.push({ start: timeMin, end: timeMax });
        return availablePeriods;
    }

    // FIX: Assicurati che i busyPeriods siano ordinati per data di inizio
    const sortedBusyPeriods = busyPeriods.slice().sort((a, b) => new Date(a.start) - new Date(b.start));

    // Aggiungi disponibilità prima del primo periodo occupato
    if (new Date(sortedBusyPeriods[0].start).getTime() > new Date(timeMin).getTime()) {
        availablePeriods.push({ start: timeMin, end: sortedBusyPeriods[0].start });
    }

    // Calcola i gap tra i periodi occupati
    for (let i = 0; i < sortedBusyPeriods.length - 1; i++) {
        if (new Date(sortedBusyPeriods[i].end).getTime() < new Date(sortedBusyPeriods[i + 1].start).getTime()) {
            availablePeriods.push({ start: sortedBusyPeriods[i].end, end: sortedBusyPeriods[i + 1].start });
        }
    }

    // Aggiungi disponibilità dopo l'ultimo periodo occupato
    if (new Date(sortedBusyPeriods[sortedBusyPeriods.length - 1].end).getTime() < new Date(timeMax).getTime()) {
        availablePeriods.push({ start: sortedBusyPeriods[sortedBusyPeriods.length - 1].end, end: timeMax });
    }

    // Filtra periodi troppo corti (meno di 1 giorno)
    const validPeriods = availablePeriods.filter(period => {
        const start = new Date(period.start);
        const end = new Date(period.end);
        const diffHours = (end - start) / (1000 * 60 * 60);
        return diffHours >= 12; // Almeno 12 ore (mezza giornata)
    });

    // Calcolo del costo totale per ciascun periodo disponibile
    return Promise.all(validPeriods.map(async period => {
        try {
            const bookings = await BookingHelper.readCSV(`rooms_prices/${roomName}.csv`);
            const totalCost = BookingHelper.calculateTotalCostV2(bookings, period.start, period.end, adults, children, pets);
            return {
                start: formatDateForDisplay(period.start),
                end: formatDateForDisplay(period.end),
                startISO: period.start, // Manteniamo anche il formato ISO per API
                endISO: period.end,
                totalCost
            };
        } catch (error) {
            return {
                start: formatDateForDisplay(period.start),
                end: formatDateForDisplay(period.end),
                startISO: period.start,
                endISO: period.end,
                totalCost: "Error in cost calculation"
            };
        }
    }));
}

// Funzione per formattare una data ISO in formato dd-mm-yyyy (per display)
function formatDateForDisplay(dateIsoString) {
    const date = new Date(dateIsoString);
    // Usa il fuso orario locale per evitare problemi di shift
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Funzione per convertire da ISO a formato yyyy-mm-dd (per form/API)
function formatDateForAPI(dateIsoString) {
    const date = new Date(dateIsoString);
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

// Manteniamo per compatibilità (deprecata)
function formatDate(dateIsoString) {
    return formatDateForDisplay(dateIsoString);
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

    // Validazione più rigorosa: verifica che sia formato dd-mm-yyyy
    // Il giorno dovrebbe essere 1-2 cifre (01-31), il mese 1-2 cifre (01-12), l'anno 4 cifre
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) ||
        dayNum < 1 || dayNum > 31 ||
        monthNum < 1 || monthNum > 12 ||
        year.length !== 4 ||
        (day.length !== 1 && day.length !== 2) ||
        (month.length !== 1 && month.length !== 2)) {
        throw new Error('Formato data non valido. Assicurati che sia "dd-mm-yyyy".');
    }

    // Restituiamo una nuova stringa nel formato "yyyy-mm-dd"
    return `${year}-${month}-${day}`;
}

// Funzione per unire periodi occupati sovrapposti o adiacenti
function mergeOverlappingPeriods(busyPeriods) {
    if (busyPeriods.length === 0) {
        return [];
    }

    // Ordina i periodi per data di inizio
    const sortedPeriods = busyPeriods.slice().sort((a, b) => new Date(a.start) - new Date(b.start));

    const mergedPeriods = [sortedPeriods[0]];

    for (let i = 1; i < sortedPeriods.length; i++) {
        const currentPeriod = sortedPeriods[i];
        const lastMergedPeriod = mergedPeriods[mergedPeriods.length - 1];

        const currentStart = new Date(currentPeriod.start);
        const currentEnd = new Date(currentPeriod.end);
        const lastEnd = new Date(lastMergedPeriod.end);

        // Se il periodo corrente inizia prima o esattamente quando finisce l'ultimo,
        // sono sovrapposti o adiacenti, quindi li uniamo
        if (currentStart <= lastEnd) {
            // Estendi l'ultimo periodo unito fino al massimo tra le due date di fine
            lastMergedPeriod.end = currentEnd > lastEnd ? currentPeriod.end : lastMergedPeriod.end;
        } else {
            // I periodi non si sovrappongono, aggiungi il nuovo periodo
            mergedPeriods.push(currentPeriod);
        }
    }

    return mergedPeriods;
}

module.exports = {
    convertDateToDDMMYYYY,
    convertToDateObject,
    validateDates,
    findNextAvailablePeriods,
    formatDate,
    formatDateForDisplay,
    formatDateForAPI,
    convertDate,
    mergeOverlappingPeriods
};
