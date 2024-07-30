document.addEventListener('DOMContentLoaded', function() {
	
	let bookingForm = document.getElementById('bookingForm');
	
	if(!bookingForm) 
		return;
	
    bookingForm.addEventListener('submit', function(event) {
        var timeMin = document.getElementById('timeMin').value;
        var timeMax = document.getElementById('timeMax').value;
        
        var errorMessage = '';
        var userLang = navigator.language || navigator.userLanguage;

        if (!timeMin || !timeMax) {
            if (userLang.startsWith('it')) {
                errorMessage += 'Le date di check-in e check-out sono obbligatorie.\n';
            } else if (userLang.startsWith('fr')) {
                errorMessage += 'Les dates de check-in et check-out sont obligatoires.\n';
            } else {
                errorMessage += 'Check-in and check-out dates are mandatory.\n';
            }
        } else if (new Date(timeMin) >= new Date(timeMax)) {
            if (userLang.startsWith('it')) {
                errorMessage += 'La data di check-out deve essere successiva alla data di check-in.\n';
            } else if (userLang.startsWith('fr')) {
                errorMessage += 'La date de check-out doit être postérieure à la date de check-in.\n';
            } else {
                errorMessage += 'The check-out date must be later than the check-in date.\n';
            }
        }


        if (errorMessage) {
            event.preventDefault();
            alert(errorMessage);
        }
    });
});