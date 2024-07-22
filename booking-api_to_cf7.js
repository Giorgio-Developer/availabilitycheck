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

    if (room) {
        roomImage.src = "https://booking-api.it/assets/images/" + roomsImages[room];
    } else {
        roomImage.src = "https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-2-240px-1.png";
    }

    // Precompila i campi del form e rendili non modificabili
    if (checkin) {
        let checkinInput = document.getElementById('checkin');
        checkinInput.value = checkin;

        let checkinText = document.getElementById('checkinText');
        checkinText.innerHTML = convertDateFormat(checkin);
    }

    if (checkout) {
        let checkoutInput = document.getElementById('checkout');
        checkoutInput.value = checkout;

        let checkoutText = document.getElementById('checkoutText');
        checkoutText.innerHTML = convertDateFormat(checkout);
    }

    if(adults) {
        let adultsInput = document.getElementById('adults');
        adultsInput.value = adults;

        let adultsText = document.getElementById('adultsText');
        adultsText.innerHTML = adults;
    }

    if(room) {
        let roomInput = document.getElementById('room');
        roomInput.value = room;

        let roomText = document.getElementById('roomText');
        roomText.innerHTML = room;
        
        let roomName = document.getElementById('roomName');
        roomName.innerHTML = room;

    }

    if(children) {
        let childrenInput = document.getElementById('children');
        childrenInput.value = children;

        let childrenText = document.getElementById('childrenText');
        childrenText.innerHTML = children;
    }

    if(pets) {
        let petsInput = document.getElementById('pets');
        petsInput.value = pets;

        let petsText = document.getElementById('petsText');
        petsText.innerHTML = pets;
    }

    if(price) {
        let priceInput = document.getElementById('price');
        priceInput.value = price;

        let priceText = document.getElementById('priceText');
        priceText.innerHTML =  price+" €";
    }

});
