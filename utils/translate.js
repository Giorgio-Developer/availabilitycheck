const { translations_it, translations_en, translations_fr, translations_de } = require('./constants');

// Funzione per tradurre un testo in base alla lingua
function translateText(text, lang) {
    let translations;

    // Scegli il dizionario di traduzione in base alla lingua
    switch (lang) {
        case 'it':
            translations = translations_it;
            break;
        case 'en':
            translations = translations_en;
            break;
        case 'fr':
            translations = translations_fr;
            break;
        case 'de':
            translations = translations_de;
            break;
        default:
            translations = translations_en; // Lingua predefinita
    }

    // Restituisce il testo tradotto o il testo originale se non c'è una traduzione disponibile
    return translations[text] || text;
}

module.exports = {
    translateText
};
