const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { parse } = require('json2csv');



// const csvWriter = require('csv-writer');

// Funzione per scrivere i dati nel file CSV
// async function writeCSV(roomName, csvData) {
//     const filePath = path.join(__dirname, '../data', `${roomName}.csv`); // Imposta il percorso del file CSV
//     const writer = csvWriter.createObjectCsvWriter({
//         path: filePath,
//         header: [
//             { id: 'data inizio', title: 'Data Inizio' },
//             { id: 'data fine', title: 'Data Fine' },
//             { id: 'costo', title: 'Costo' }
//         ]
//     });

//     await writer.writeRecords(csvData); // Scrive i record nel file
// }


// CSV Manipulation
// Funzione per leggere i dati dal file CSV
function readCSV(roomName) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, `../rooms_prices/${roomName}.csv`);
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
        const filePath = path.join(__dirname, `../rooms_prices/${roomName}.csv`);
        const csv = parse(data, { fields: ['data inizio', 'data fine', 'costo'] });
        fs.writeFile(filePath, csv, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

module.exports = {
    writeCSV,
    readCSV
};
