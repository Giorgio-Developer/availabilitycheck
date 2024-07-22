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
        var parts = dateString.split('-');
        return parts[2] + '-' + parts[1] + '-' + parts[0];
    }

    // Ottieni i valori dai parametri dell'URL
    var room = getUrlParameter('room');
    var checkin = getUrlParameter('checkin');
    var checkout = getUrlParameter('checkout');
    var adults = getUrlParameter('adults');
    var children = getUrlParameter('children');
    var pets = getUrlParameter('pets');

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
