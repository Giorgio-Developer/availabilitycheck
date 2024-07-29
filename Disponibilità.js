document.addEventListener('DOMContentLoaded', function() {
	
	let bookingForm = document.getElementById('bookingForm');
	
	if(!bookingForm) 
		return;
	
    bookingForm.addEventListener('submit', function(event) {
        var timeMin = document.getElementById('timeMin').value;
        var timeMax = document.getElementById('timeMax').value;
        
        var errorMessage = '';

		if (!timeMin || !timeMax) {
			errorMessage += 'Le date di check-in e check-out sono obbligatorie.\nCheck-in and check-out dates are mandatory.\n';
		} else if (new Date(timeMin) >= new Date(timeMax)) {
			errorMessage += 'La data di check-out deve essere successiva alla data di check-in.\nThe check-out date must be later than the check-in date.\n';
		}


        if (errorMessage) {
            event.preventDefault();
            alert(errorMessage);
        }
    });
});