// BookingHelper.js
const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment');

class BookingHelper {
    // Funzione per leggere il CSV e restituire i dati
    static async readCSV(filename) {
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(filename)
                .pipe(csv({ separator: ',' }))
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (error) => reject(error));
        });
    }

    // Funzione per calcolare il costo totale basato sulle date
    static calculateTotalCost(bookings, startDate, endDate) {
        let totalCost = 0;
        let currentDate = moment(startDate, 'YYYY-MM-DD');

        // Modifica: escludi l'ultimo giorno
        const lastDate = moment(endDate, 'YYYY-MM-DD').subtract(1, 'days');

        while (currentDate.isSameOrBefore(lastDate)) {
            const booking = bookings.find(booking => {
                const start = moment(booking['data inizio'], 'DD/MM/YY');
                const end = moment(booking['data fine'], 'DD/MM/YY');
                return currentDate.isBetween(start, end, null, '[]');
            });

            if (booking) {
                totalCost += parseFloat(booking.costo.replace(',', '.'));
            }

            currentDate.add(1, 'days'); // Passa al giorno successivo
        }

        return totalCost.toFixed(2);
    }
}

module.exports = BookingHelper;
