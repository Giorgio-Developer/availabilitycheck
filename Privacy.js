document.addEventListener('DOMContentLoaded', function() {
    // Seleziona il modulo
    var form = document.querySelector('.wpcf7-form');

    if(!form)
        return;
    
    // Seleziona la checkbox della privacy e il bottone di invio
    var privacyCheckbox = form.querySelector('input[name="Privacy[]"]');
    var submitButton = form.querySelector('input[type="submit"]');

    // Aggiungi un listener sull'evento di submit
    form.addEventListener('submit', function(event) {
        // Se la checkbox non è selezionata, impedisci l'invio del modulo
        if (!privacyCheckbox.checked) {
            event.preventDefault();

            // Mostra un messaggio di errore
            var errorMessage = document.createElement('div');
            errorMessage.textContent = "È necessario accettare la privacy policy.";
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