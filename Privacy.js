document.addEventListener('DOMContentLoaded', function() {
    // Seleziona il modulo
    var form = document.querySelector('.wpcf7-form');

       if(!form)
        return;
   
    // Seleziona la checkbox della privacy
    var privacyCheckbox = form.querySelector('input[name="Privacy[]"]');

    // Determina la lingua del browser
    var userLang = navigator.language || navigator.userLanguage;

    // Messaggi di errore in diverse lingue
    var messages = {
        'it': "È necessario accettare la privacy policy.",
        'fr': "Vous devez accepter la politique de confidentialité.",
        'en': "You need to accept the privacy policy."
    };

    // Seleziona il messaggio in base alla lingua del browser
    var errorMessageText = messages['en']; // Default in English
    if (userLang.startsWith('it')) {
        errorMessageText = messages['it'];
    } else if (userLang.startsWith('fr')) {
        errorMessageText = messages['fr'];
    }

    // Aggiungi un listener sull'evento di submit
    form.addEventListener('submit', function(event) {
        // Se la checkbox non è selezionata, impedisci l'invio del modulo
        if (!privacyCheckbox.checked) {
            event.preventDefault();

            // Mostra un messaggio di errore
            var errorMessage = document.createElement('div');
            errorMessage.textContent = errorMessageText;
            errorMessage.style.color = 'red';
            errorMessage.className = 'privacy-error';

            // Rimuovi il vecchio messaggio di errore, se presente
            var oldError = form.querySelector('.privacy-error');
            if (oldError) {
                oldError.remove();
            }

            // Aggiungi il nuovo messaggio di errore
            privacyCheckbox.parentNode.appendChild(errorMessage);
        }
    });
});