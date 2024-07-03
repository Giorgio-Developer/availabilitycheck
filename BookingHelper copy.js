// BookingHelper.js
const fs = require('fs');
const csv = require('csv-parser');
const { parse, format } = require('date-fns');

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
        let currentDate = new Date(startDate);

        // Escludi l'ultimo giorno
        const lastDate = new Date(endDate);
        lastDate.setDate(lastDate.getDate() - 1);

        while (currentDate <= lastDate) {
            const formattedDate = format(currentDate, 'dd/MM/yy');
            const booking = bookings.find(booking => {
                const start = parse(booking['data inizio'], 'dd/MM/yy', new Date());
                const end = parse(booking['data fine'], 'dd/MM/yy', new Date());
                return currentDate >= start && currentDate <= end;
            });

            if (booking) {
                totalCost += parseFloat(booking.costo.replace(',', '.'));
            }

            currentDate.setDate(currentDate.getDate() + 1); // Passa al giorno successivo
        }

        return totalCost.toFixed(2);
    }
}

module.exports = BookingHelper;
