const { translateText } = require('../../utils/translate');

describe('translateText', () => {
  test('should return Italian text for "it" language', () => {
    expect(translateText('Disponibilità Villa Panorama', 'it')).toBe('Disponibilità Villa Panorama');
    expect(translateText('Richiesta prenotazione', 'it')).toBe('Richiesta prenotazione');
    expect(translateText('Seleziona', 'it')).toBe('Seleziona');
  });

  test('should return English translation for "en" language', () => {
    expect(translateText('Disponibilità Villa Panorama', 'en')).toBe('Villa Panorama Availability');
    expect(translateText('Richiesta prenotazione', 'en')).toBe('Booking request');
    expect(translateText('Seleziona', 'en')).toBe('Choose');
  });

  test('should return French translation for "fr" language', () => {
    expect(translateText('Disponibilità Villa Panorama', 'fr')).toBe('Disponibilité Villa Panorama');
    expect(translateText('Richiesta prenotazione', 'fr')).toBe('Demande de réservation');
    expect(translateText('Seleziona', 'fr')).toBe('Choisir');
  });

  test('should return German translation for "de" language', () => {
    expect(translateText('Disponibilità Villa Panorama', 'de')).toBe('Villa Panorama Verfügbarkeit');
    expect(translateText('Richiesta prenotazione', 'de')).toBe('Buchungsanfrage');
    expect(translateText('Seleziona', 'de')).toBe('Wählen');
  });

  test('should default to English for unsupported languages', () => {
    expect(translateText('Disponibilità Villa Panorama', 'es')).toBe('Villa Panorama Availability');
    expect(translateText('Richiesta prenotazione', 'pt')).toBe('Booking request');
    expect(translateText('Seleziona', 'zh')).toBe('Choose');
  });

  test('should default to English for undefined language', () => {
    expect(translateText('Disponibilità Villa Panorama', undefined)).toBe('Villa Panorama Availability');
    expect(translateText('Richiesta prenotazione', null)).toBe('Booking request');
  });

  test('should return original text if translation is not found', () => {
    const untranslatedText = 'This text does not exist in translations';
    expect(translateText(untranslatedText, 'it')).toBe(untranslatedText);
    expect(translateText(untranslatedText, 'en')).toBe(untranslatedText);
    expect(translateText(untranslatedText, 'fr')).toBe(untranslatedText);
    expect(translateText(untranslatedText, 'de')).toBe(untranslatedText);
  });

  test('should handle empty strings', () => {
    expect(translateText('', 'it')).toBe('');
    expect(translateText('', 'en')).toBe('');
  });

  test('should handle complex sentences with punctuation', () => {
    const complexText = 'Al momento non ci sono stanze disponibili nel periodo richiesto. Contattaci all\'indirizzo: booking@villapanoramasuite.it';
    expect(translateText(complexText, 'en')).toBe('At the moment there are no rooms available in the requested period. Contact us at: booking@villapanoramasuite.it');
    expect(translateText(complexText, 'fr')).toBe('Pour le moment, il n\'y a pas de chambres disponibles dans la période demandée. Contactez-nous à l\'adresse:booking@villapanoramasuite.it');
    expect(translateText(complexText, 'de')).toBe('Derzeit sind keine Zimmer im gewünschten Zeitraum verfügbar. Kontaktieren Sie uns unter:booking@villapanoramasuite.it');
  });

  test('should be case sensitive', () => {
    expect(translateText('seleziona', 'en')).toBe('seleziona'); // lowercase should not match
    expect(translateText('Seleziona', 'en')).toBe('Choose'); // exact case should match
  });

  test('should handle all supported languages correctly', () => {
    const testText = 'Costo totale per il periodo selezionato:';

    expect(translateText(testText, 'it')).toBe('Costo totale per il periodo selezionato:');
    expect(translateText(testText, 'en')).toBe('Total cost for the selected period');
    expect(translateText(testText, 'fr')).toBe('Coût total pour la période sélectionnée');
    expect(translateText(testText, 'de')).toBe('Gesamtkosten für den ausgewählten Zeitraum');
  });
});