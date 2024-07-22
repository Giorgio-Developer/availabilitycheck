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

    let roomImage = document.getElementById('roomImage');

    if (room) {
        roomImage.src = "https://booking-api.it/assets/images/" + roomsImages[room];
    } else {
        roomImage.src = "https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-2-240px-1.png";
    }

    // Precompila i campi del form
    let messaggio = "";

    if(room) 
        messaggio = messaggio + "Camera: " + room + "\n";

    // if(checkin && checkout)
    //     messaggio = messaggio + "Periodo: dal " + convertDateFormat(checkin) + " al " + convertDateFormat(checkout) + "\n";

    if(adults)
        messaggio = messaggio + "Adulti: " + adults + "\n";

    if(children)
        messaggio = messaggio + "Bambini: " + children + "\n";

    if(pets)
        messaggio = messaggio + "Animali: " + pets + "\n";

    const yourmessageEl = document.getElementsByName('your-message')[0];
    yourmessageEl.innerHTML = messaggio;

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

});
