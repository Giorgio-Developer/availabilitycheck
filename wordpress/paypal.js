/// PAYPAL
document.addEventListener('DOMContentLoaded', function() {

    // Funzione per ottenere i parametri dall'URL
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Funzione per convertire la data da YYYY-mm-dd a dd-mm-YYYY
    function convertDateFormat(dateString) {
        let parts = dateString.split('-');
        return parts[2] + '-' + parts[1] + '-' + parts[0];
    }


	let anticipo = getUrlParameter('anticipo');
	let checkin = getUrlParameter('date-995');
	let checkout = getUrlParameter('date-996');
	let room = getUrlParameter('room');
	let guest = getUrlParameter('your-name');

	
	let item_name = document.getElementsByName('item_name')[0];
	let amount = document.getElementById('amount');
	let anticipoText = document.getElementById('anticipoText');
    
    // Precompila i per il Paypal Button
	if (anticipo != null && amount != null) {
		amount.value = anticipo;
	}
	
    if (checkin != null & checkout != null & room != null & item_name != null) {  
        item_name.value = guest+" dal "+ convertDateFormat(checkin)+ " al "+convertDateFormat(checkout)+" in "+room;
	}


});

