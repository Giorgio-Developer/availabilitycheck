// Booking-API to CF7
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

    const roomsImages = {
        "Villa Panorama": "Villa_Panorama_Suite.jpg",
        "Elettra": "Elettra.jpg",
        "Calypso": "Calypso.jpeg",
        "Hermes": "Hermes.jpg",
        "Demetra": "Demetra.jpg",
        "Iris Oasis": "IrisOasis.jpg",
    };

    // Ottieni i valori dai parametri dell'URL
    let room = getUrlParameter('room');
    let checkin = getUrlParameter('checkin');
    let checkout = getUrlParameter('checkout');
    let adults = getUrlParameter('adults');
    let children = getUrlParameter('children');
    let pets = getUrlParameter('pets');
    let price = getUrlParameter('price');

    let roomImage = document.getElementById('roomImage');
	let checkinInput = document.getElementById('checkin');
	let checkinText = document.getElementById('checkinText');
	let checkoutInput = document.getElementById('checkout');
	let checkoutText = document.getElementById('checkoutText');
	let adultsInput = document.getElementById('adults');
	let adultsText = document.getElementById('adultsText');
	let roomInput = document.getElementById('room');
	let roomText = document.getElementById('roomText');
	let roomName = document.getElementById('roomName');
	let childrenInput = document.getElementById('children');
	let childrenText = document.getElementById('childrenText');
	let petsInput = document.getElementById('pets');
	let petsText = document.getElementById('petsText');
	
	function setFieldValue(parameterName) {
		
		// parameterName = adults
		let value = getUrlParameter(parameterName);
		let inputField = document.getElementById(parameterName);
		let text = document.getElementById(parameterName+'Text');
		
		if(value) {
			if(inputField)
				inputField.value = value;
			if(text)
				if(parameterName == 'checkin' || parameterName == 'checkout')
					text.innerHTML = convertDateFormat(value);
				else
					text.innerHTML = value;
		}
	}
	
	
    if (roomImage) {
		if (room) 
			roomImage.src = "https://booking-api.it/assets/images/" + roomsImages[room];
		 else 
			roomImage.src = "https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-2-240px-1.png";
	}

    // Precompila i campi del form e rendili non modificabili
    if (checkin) {
        checkinInput.value = checkin;       
        checkinText.innerHTML = convertDateFormat(checkin);
    }

    if (checkout) {    
        checkoutInput.value = checkout;    
        checkoutText.innerHTML = convertDateFormat(checkout);
    }
/*
    if(adults) {
		if (adultsInput)
        	adultsInput.value = adults;
        adultsText.innerHTML = adults;
    }
*/
	
	setFieldValue('adults');
	
    if(room ) {
        roomInput.value = room;
        roomText.innerHTML = room;
        roomName.innerHTML = room;
    }

    if(children) {
        childrenInput.value = children;
        childrenText.innerHTML = children;
    }

    if(pets) {
 
        petsInput.value = pets;
        petsText.innerHTML = pets;
    }

    if(price) {
        let priceInput = document.getElementById('price');
        priceInput.value = price;

        let priceText = document.getElementById('priceText');
        priceText.innerHTML =  price + " €";

        let anticipoInput = document.getElementById('anticipo');
        let anticipo = (price * 0.30);
        anticipoInput.value = anticipo;

        let saldoInput = document.getElementById('saldo');
        let saldo = (price * 0.70);
        saldoInput.value = saldo;

    }

});
