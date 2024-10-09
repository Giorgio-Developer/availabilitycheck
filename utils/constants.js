// constants.js

// Array associativo per mappare gli ID dei calendari ai nomi delle stanze
const roomsNames = {
    "hm24qf24l1v16fqg8iv9sgbnt1s7ctm5@import.calendar.google.com": "Villa Panorama",
    "ipdt2erdd6eoriaukuae2vv0c22fsba8@import.calendar.google.com": "Elettra",
    "1uo0g04eif8o44c4mcn8dlufim485l0l@import.calendar.google.com": "Calypso",
    "htbraiua1erp01qpo1g46nsn8bsibcuq@import.calendar.google.com": "Hermes",
    "ceph5hop46teenje89bt5g2pbr70td9g@import.calendar.google.com": "Demetra",
    "tqscm1ioj0n52vdda1bjsvsms019tkq3@import.calendar.google.com": "Iris Oasis",
};

const roomsImages = {
    "hm24qf24l1v16fqg8iv9sgbnt1s7ctm5@import.calendar.google.com": "Villa_Panorama_Suite.jpg",
    "ipdt2erdd6eoriaukuae2vv0c22fsba8@import.calendar.google.com": "Elettra.jpg",
    "1uo0g04eif8o44c4mcn8dlufim485l0l@import.calendar.google.com": "Calypso.jpeg",
    "htbraiua1erp01qpo1g46nsn8bsibcuq@import.calendar.google.com": "Hermes.jpg",
    "ceph5hop46teenje89bt5g2pbr70td9g@import.calendar.google.com": "Demetra.jpg",
    "tqscm1ioj0n52vdda1bjsvsms019tkq3@import.calendar.google.com": "IrisOasis.jpg",
};

// Traduzioni
const translations_it = {
    "Disponibilità Villa Panorama": "Disponibilità Villa Panorama",
    "Costo totale per il periodo selezionato:": "Costo totale per il periodo selezionato:",
    "Camere disponibili nel periodo selezionato": "Camere disponibili nel periodo selezionato",
    "Nessuno dei calendari è disponibile nel periodo selezionato.": "Nessuno dei calendari è disponibile nel periodo selezionato.",
    "Periodi alternativi disponibili": "Periodi alternativi disponibili:",
    "Richiesta prenotazione": "Richiesta prenotazione",
    "Ecco le stanze disponibili con periodi più vicini alle date richieste": "Ecco le stanze disponibili con periodi più vicini alle date richieste",
    "Seleziona": "Seleziona",
    "Al momento non ci sono stanze disponibili nel periodo richiesto. Contattaci all'indirizzo: booking@villapanoramasuite.it": "Al momento non ci sono stanze disponibili nel periodo richiesto. Contattaci all'indirizzo: booking@villapanoramasuite.it"
};

const translations_en = {
    "Disponibilità Villa Panorama": "Villa Panorama Availability",
    "Costo totale per il periodo selezionato:": "Total cost for the selected period",
    "Camere disponibili nel periodo selezionato": "Rooms available in the selected period",
    "Nessuno dei calendari è disponibile nel periodo selezionato.": "None of the calendars are available in the selected period.",
    "Periodi alternativi disponibili": "Alternative periods available:",
    "Richiesta prenotazione": "Booking request",
    "Ecco le stanze disponibili con periodi più vicini alle date richieste": "Here are the available rooms closest to the requested dates",
    "Seleziona": "Choose",
    "Al momento non ci sono stanze disponibili nel periodo richiesto. Contattaci all'indirizzo: booking@villapanoramasuite.it": "At the moment there are no rooms available in the requested period. Contact us at: booking@villapanoramasuite.it"
};

const translations_fr = {
    "Disponibilità Villa Panorama": "Disponibilité Villa Panorama",
    "Costo totale per il periodo selezionato:": "Coût total pour la période sélectionnée",
    "Camere disponibili nel periodo selezionato": "Chambres disponibles dans la période sélectionnée",
    "Nessuno dei calendari è disponibile nel periodo selezionato.": "Aucun des calendriers n'est disponible dans la période sélectionnée.",
    "Periodi alternativi disponibili": "Périodes alternatives disponibles:",
    "Richiesta prenotazione": "Demande de réservation",
    "Ecco le stanze disponibili con periodi più vicini alle date richieste": "Voici les chambres disponibles les plus proches des dates demandées",
    "Seleziona": "Choisir",
    "Al momento non ci sono stanze disponibili nel periodo richiesto. Contattaci all'indirizzo: booking@villapanoramasuite.it": "Pour le moment, il n'y a pas de chambres disponibles dans la période demandée. Contactez-nous à l'adresse:booking@villapanoramasuite.it"
};

const translations_de = {
    "Disponibilità Villa Panorama": "Villa Panorama Verfügbarkeit",
    "Costo totale per il periodo selezionato:": "Gesamtkosten für den ausgewählten Zeitraum",
    "Camere disponibili nel periodo selezionato": "Zimmer verfügbar im ausgewählten Zeitraum",
    "Nessuno dei calendari è disponibile nel periodo selezionato.": "Keiner der Kalender ist im ausgewählten Zeitraum verfügbar.",
    "Periodi alternativi disponibili": "Alternative Zeiträume verfügbar:",
    "Richiesta prenotazione": "Buchungsanfrage",
    "Ecco le stanze disponibili con periodi più vicini alle date richieste": "Hier sind die verfügbaren Zimmer, die am nächsten zu den gewünschten Terminen liegen",
    "Seleziona": "Wählen",
    "Al momento non ci sono stanze disponibili nel periodo richiesto. Contattaci all'indirizzo: booking@villapanoramasuite.it": "Derzeit sind keine Zimmer im gewünschten Zeitraum verfügbar. Kontaktieren Sie uns unter:booking@villapanoramasuite.it"
};

const htmlResponsePostfix = `
    <div class="form-group col-md-3">
        &nbsp;
    </div>
    </div>

    <!-- Bootstrap JS and dependencies -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.slim.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>

    </body>
</html>
`;

const topNavigationBarCSS = `
    <style id="wp-emoji-styles-inline-css" type="text/css">
        img.wp-smiley, img.emoji {
            display: inline !important;
            border: none !important;
            box-shadow: none !important;
            height: 1em !important;
            width: 1em !important;
            margin: 0 0.07em !important;
            vertical-align: -0.1em !important;
            background: none !important;
            padding: 0 !important;
        }
    </style>
    <style id="joinchat-button-style-inline-css" type="text/css">
    .wp-block-joinchat-button{border:none!important;text-align:center}.wp-block-joinchat-button figure{display:table;margin:0 auto;padding:0}.wp-block-joinchat-button figcaption{font:normal normal 400 .6em/2em var(--wp--preset--font-family--system-font,sans-serif);margin:0;padding:0}.wp-block-joinchat-button .joinchat-button__qr{background-color:#fff;border:6px solid #25d366;border-radius:30px;box-sizing:content-box;display:block;height:200px;margin:auto;overflow:hidden;padding:10px;width:200px}.wp-block-joinchat-button .joinchat-button__qr canvas,.wp-block-joinchat-button .joinchat-button__qr img{display:block;margin:auto}.wp-block-joinchat-button .joinchat-button__link{align-items:center;background-color:#25d366;border:6px solid #25d366;border-radius:30px;display:inline-flex;flex-flow:row nowrap;justify-content:center;line-height:1.25em;margin:0 auto;text-decoration:none}.wp-block-joinchat-button .joinchat-button__link:before{background:transparent var(--joinchat-ico) no-repeat center;background-size:100%;content:"";display:block;height:1.5em;margin:-.75em .75em -.75em 0;width:1.5em}.wp-block-joinchat-button figure+.joinchat-button__link{margin-top:10px}@media (orientation:landscape)and (min-height:481px),(orientation:portrait)and (min-width:481px){.wp-block-joinchat-button.joinchat-button--qr-only figure+.joinchat-button__link{display:none}}@media (max-width:480px),(orientation:landscape)and (max-height:480px){.wp-block-joinchat-button figure{display:none}}
    </style>
    <style id="classic-theme-styles-inline-css" type="text/css">
    /*! This file is auto-generated */
    .wp-block-button__link{color:#fff;background-color:#32373c;border-radius:9999px;box-shadow:none;text-decoration:none;padding:calc(.667em + 2px) calc(1.333em + 2px);font-size:1.125em}.wp-block-file__button{background:#32373c;color:#fff;text-decoration:none}
    </style>
    <style id="global-styles-inline-css" type="text/css">
    :root{--wp--preset--aspect-ratio--square: 1;--wp--preset--aspect-ratio--4-3: 4/3;--wp--preset--aspect-ratio--3-4: 3/4;--wp--preset--aspect-ratio--3-2: 3/2;--wp--preset--aspect-ratio--2-3: 2/3;--wp--preset--aspect-ratio--16-9: 16/9;--wp--preset--aspect-ratio--9-16: 9/16;--wp--preset--color--black: #000000;--wp--preset--color--cyan-bluish-gray: #abb8c3;--wp--preset--color--white: #FFF;--wp--preset--color--pale-pink: #f78da7;--wp--preset--color--vivid-red: #cf2e2e;--wp--preset--color--luminous-vivid-orange: #ff6900;--wp--preset--color--luminous-vivid-amber: #fcb900;--wp--preset--color--light-green-cyan: #7bdcb5;--wp--preset--color--vivid-green-cyan: #00d084;--wp--preset--color--pale-cyan-blue: #8ed1fc;--wp--preset--color--vivid-cyan-blue: #0693e3;--wp--preset--color--vivid-purple: #9b51e0;--wp--preset--color--accent: #4089ae;--wp--preset--color--dark-gray: #111;--wp--preset--color--light-gray: #767676;--wp--preset--gradient--vivid-cyan-blue-to-vivid-purple: linear-gradient(135deg,rgba(6,147,227,1) 0%,rgb(155,81,224) 100%);--wp--preset--gradient--light-green-cyan-to-vivid-green-cyan: linear-gradient(135deg,rgb(122,220,180) 0%,rgb(0,208,130) 100%);--wp--preset--gradient--luminous-vivid-amber-to-luminous-vivid-orange: linear-gradient(135deg,rgba(252,185,0,1) 0%,rgba(255,105,0,1) 100%);--wp--preset--gradient--luminous-vivid-orange-to-vivid-red: linear-gradient(135deg,rgba(255,105,0,1) 0%,rgb(207,46,46) 100%);--wp--preset--gradient--very-light-gray-to-cyan-bluish-gray: linear-gradient(135deg,rgb(238,238,238) 0%,rgb(169,184,195) 100%);--wp--preset--gradient--cool-to-warm-spectrum: linear-gradient(135deg,rgb(74,234,220) 0%,rgb(151,120,209) 20%,rgb(207,42,186) 40%,rgb(238,44,130) 60%,rgb(251,105,98) 80%,rgb(254,248,76) 100%);--wp--preset--gradient--blush-light-purple: linear-gradient(135deg,rgb(255,206,236) 0%,rgb(152,150,240) 100%);--wp--preset--gradient--blush-bordeaux: linear-gradient(135deg,rgb(254,205,165) 0%,rgb(254,45,45) 50%,rgb(107,0,62) 100%);--wp--preset--gradient--luminous-dusk: linear-gradient(135deg,rgb(255,203,112) 0%,rgb(199,81,192) 50%,rgb(65,88,208) 100%);--wp--preset--gradient--pale-ocean: linear-gradient(135deg,rgb(255,245,203) 0%,rgb(182,227,212) 50%,rgb(51,167,181) 100%);--wp--preset--gradient--electric-grass: linear-gradient(135deg,rgb(202,248,128) 0%,rgb(113,206,126) 100%);--wp--preset--gradient--midnight: linear-gradient(135deg,rgb(2,3,129) 0%,rgb(40,116,252) 100%);--wp--preset--font-size--small: 13px;--wp--preset--font-size--medium: 20px;--wp--preset--font-size--large: 36px;--wp--preset--font-size--x-large: 42px;--wp--preset--spacing--20: 0.44rem;--wp--preset--spacing--30: 0.67rem;--wp--preset--spacing--40: 1rem;--wp--preset--spacing--50: 1.5rem;--wp--preset--spacing--60: 2.25rem;--wp--preset--spacing--70: 3.38rem;--wp--preset--spacing--80: 5.06rem;--wp--preset--shadow--natural: 6px 6px 9px rgba(0, 0, 0, 0.2);--wp--preset--shadow--deep: 12px 12px 50px rgba(0, 0, 0, 0.4);--wp--preset--shadow--sharp: 6px 6px 0px rgba(0, 0, 0, 0.2);--wp--preset--shadow--outlined: 6px 6px 0px -3px rgba(255, 255, 255, 1), 6px 6px rgba(0, 0, 0, 1);--wp--preset--shadow--crisp: 6px 6px 0px rgba(0, 0, 0, 1);}:where(.is-layout-flex){gap: 0.5em;}:where(.is-layout-grid){gap: 0.5em;}body .is-layout-flex{display: flex;}.is-layout-flex{flex-wrap: wrap;align-items: center;}.is-layout-flex > :is(*, div){margin: 0;}body .is-layout-grid{display: grid;}.is-layout-grid > :is(*, div){margin: 0;}:where(.wp-block-columns.is-layout-flex){gap: 2em;}:where(.wp-block-columns.is-layout-grid){gap: 2em;}:where(.wp-block-post-template.is-layout-flex){gap: 1.25em;}:where(.wp-block-post-template.is-layout-grid){gap: 1.25em;}.has-black-color{color: var(--wp--preset--color--black) !important;}.has-cyan-bluish-gray-color{color: var(--wp--preset--color--cyan-bluish-gray) !important;}.has-white-color{color: var(--wp--preset--color--white) !important;}.has-pale-pink-color{color: var(--wp--preset--color--pale-pink) !important;}.has-vivid-red-color{color: var(--wp--preset--color--vivid-red) !important;}.has-luminous-vivid-orange-color{color: var(--wp--preset--color--luminous-vivid-orange) !important;}.has-luminous-vivid-amber-color{color: var(--wp--preset--color--luminous-vivid-amber) !important;}.has-light-green-cyan-color{color: var(--wp--preset--color--light-green-cyan) !important;}.has-vivid-green-cyan-color{color: var(--wp--preset--color--vivid-green-cyan) !important;}.has-pale-cyan-blue-color{color: var(--wp--preset--color--pale-cyan-blue) !important;}.has-vivid-cyan-blue-color{color: var(--wp--preset--color--vivid-cyan-blue) !important;}.has-vivid-purple-color{color: var(--wp--preset--color--vivid-purple) !important;}.has-black-background-color{background-color: var(--wp--preset--color--black) !important;}.has-cyan-bluish-gray-background-color{background-color: var(--wp--preset--color--cyan-bluish-gray) !important;}.has-white-background-color{background-color: var(--wp--preset--color--white) !important;}.has-pale-pink-background-color{background-color: var(--wp--preset--color--pale-pink) !important;}.has-vivid-red-background-color{background-color: var(--wp--preset--color--vivid-red) !important;}.has-luminous-vivid-orange-background-color{background-color: var(--wp--preset--color--luminous-vivid-orange) !important;}.has-luminous-vivid-amber-background-color{background-color: var(--wp--preset--color--luminous-vivid-amber) !important;}.has-light-green-cyan-background-color{background-color: var(--wp--preset--color--light-green-cyan) !important;}.has-vivid-green-cyan-background-color{background-color: var(--wp--preset--color--vivid-green-cyan) !important;}.has-pale-cyan-blue-background-color{background-color: var(--wp--preset--color--pale-cyan-blue) !important;}.has-vivid-cyan-blue-background-color{background-color: var(--wp--preset--color--vivid-cyan-blue) !important;}.has-vivid-purple-background-color{background-color: var(--wp--preset--color--vivid-purple) !important;}.has-black-border-color{border-color: var(--wp--preset--color--black) !important;}.has-cyan-bluish-gray-border-color{border-color: var(--wp--preset--color--cyan-bluish-gray) !important;}.has-white-border-color{border-color: var(--wp--preset--color--white) !important;}.has-pale-pink-border-color{border-color: var(--wp--preset--color--pale-pink) !important;}.has-vivid-red-border-color{border-color: var(--wp--preset--color--vivid-red) !important;}.has-luminous-vivid-orange-border-color{border-color: var(--wp--preset--color--luminous-vivid-orange) !important;}.has-luminous-vivid-amber-border-color{border-color: var(--wp--preset--color--luminous-vivid-amber) !important;}.has-light-green-cyan-border-color{border-color: var(--wp--preset--color--light-green-cyan) !important;}.has-vivid-green-cyan-border-color{border-color: var(--wp--preset--color--vivid-green-cyan) !important;}.has-pale-cyan-blue-border-color{border-color: var(--wp--preset--color--pale-cyan-blue) !important;}.has-vivid-cyan-blue-to-vivid-purple-gradient-background{background: var(--wp--preset--gradient--vivid-cyan-blue-to-vivid-purple) !important;}.has-light-green-cyan-to-vivid-green-cyan-gradient-background{background: var(--wp--preset--gradient--light-green-cyan-to-vivid-green-cyan) !important;}.has-luminous-vivid-amber-to-luminous-vivid-orange-gradient-background{background: var(--wp--preset--gradient--luminous-vivid-amber-to-luminous-vivid-orange) !important;}.has-luminous-vivid-orange-to-vivid-red-gradient-background{background: var(--wp--preset--gradient--luminous-vivid-orange-to-vivid-red) !important;}.has-very-light-gray-to-cyan-bluish-gray-gradient-background{background: var(--wp--preset--gradient--very-light-gray-to-cyan-bluish-gray) !important;}.has-cool-to-warm-spectrum-gradient-background{background: var(--wp--preset--gradient--cool-to-warm-spectrum) !important;}.has-blush-light-purple-gradient-background{background: var(--wp--preset--gradient--blush-light-purple) !important;}.has-blush-bordeaux-gradient-background{background: var(--wp--preset--gradient--blush-bordeaux) !important;}.has-luminous-dusk-gradient-background{background: var(--wp--preset--gradient--luminous-dusk) !important;}.has-pale-ocean-gradient-background{background: var(--wp--preset--gradient--pale-ocean) !important;}.has-electric-grass-gradient-background{background: var(--wp--preset--gradient--electric-grass) !important;}.has-midnight-gradient-background{background: var(--wp--preset--gradient--midnight) !important;}.has-small-font-size{font-size: var(--wp--preset--font-size--small) !important;}.has-medium-font-size{font-size: var(--wp--preset--font-size--medium) !important;}.has-large-font-size{font-size: var(--wp--preset--font-size--large) !important;}.has-x-large-font-size{font-size: var(--wp--preset--font-size--x-large) !important;}
    :where(.wp-block-post-template.is-layout-flex){gap: 1.25em;}:where(.wp-block-post-template.is-layout-grid){gap: 1.25em;}
    :where(.wp-block-columns.is-layout-flex){gap: 2em;}:where(.wp-block-columns.is-layout-grid){gap: 2em;}
    :root :where(.wp-block-pullquote){font-size: 1.5em;line-height: 1.6;}
    </style>
    <link rel="stylesheet" id="contact-form-7-css" href="https://villapanoramasuite.it/wp-content/plugins/contact-form-7/includes/css/styles.css?ver=5.9.6" type="text/css" media="all">
    <link rel="stylesheet" id="venomaps-css" href="https://villapanoramasuite.it/wp-content/plugins/venomaps/include/css/venomaps-bundle.min.css?ver=1.2.4" type="text/css" media="all">
    <link rel="stylesheet" id="ex-google-fonts-css" href="//fonts.googleapis.com/css?family=Source+Sans+Pro&amp;ver=1.0.0" type="text/css" media="all">
    <link rel="stylesheet" id="wpcf7-redirect-script-frontend-css" href="https://villapanoramasuite.it/wp-content/plugins/wpcf7-redirect/build/css/wpcf7-redirect-frontend.min.css?ver=1.1" type="text/css" media="all">
    <link rel="stylesheet" id="extendify-utility-styles-css" href="https://villapanoramasuite.it/wp-content/plugins/extendify/public/build/utility-minimum.css?ver=6.6.1" type="text/css" media="all">
    <link rel="stylesheet" id="elementor-icons-css" href="https://villapanoramasuite.it/wp-content/plugins/elementor/assets/lib/eicons/css/elementor-icons.min.css?ver=5.30.0" type="text/css" media="all">
    <link rel="stylesheet" id="elementor-frontend-css" href="https://villapanoramasuite.it/wp-content/plugins/elementor/assets/css/frontend.min.css?ver=3.22.3" type="text/css" media="all">
    <link rel="stylesheet" id="swiper-css" href="https://villapanoramasuite.it/wp-content/plugins/elementor/assets/lib/swiper/v8/css/swiper.min.css?ver=8.4.5" type="text/css" media="all">
    <link rel="stylesheet" id="elementor-post-231-css" href="https://villapanoramasuite.it/wp-content/uploads/elementor/css/post-231.css?ver=1722410044" type="text/css" media="all">
    <link rel="stylesheet" id="elementor-global-css" href="https://villapanoramasuite.it/wp-content/uploads/elementor/css/global.css?ver=1722410044" type="text/css" media="all">
    <link rel="stylesheet" id="elementor-post-496-css" href="https://villapanoramasuite.it/wp-content/uploads/elementor/css/post-496.css?ver=1722411998" type="text/css" media="all">
    <link rel="stylesheet" id="the7-font-css" href="https://villapanoramasuite.it/wp-content/themes/dt-the7/fonts/icomoon-the7-font/icomoon-the7-font.min.css?ver=11.4.1" type="text/css" media="all">
    <link rel="stylesheet" id="the7-fontello-css" href="https://villapanoramasuite.it/wp-content/themes/dt-the7/fonts/fontello/css/fontello.min.css?ver=11.4.1" type="text/css" media="all">
    <link rel="stylesheet" id="joinchat-css" href="https://villapanoramasuite.it/wp-content/plugins/creame-whatsapp-me/public/css/joinchat.min.css?ver=5.1.6" type="text/css" media="all">
    <link rel="stylesheet" id="dt-web-fonts-css" href="https://fonts.googleapis.com/css?family=Roboto:400,500,600,700%7CPlayfair+Display:400,600,700%7CPoppins:400,600,700" type="text/css" media="all">
    <link rel="stylesheet" id="dt-main-css" href="https://villapanoramasuite.it/wp-content/themes/dt-the7/css/main.min.css?ver=11.4.1" type="text/css" media="all">
    <link rel="stylesheet" id="the7-custom-scrollbar-css" href="https://villapanoramasuite.it/wp-content/themes/dt-the7/lib/custom-scrollbar/custom-scrollbar.min.css?ver=11.4.1" type="text/css" media="all">
    <link rel="stylesheet" id="the7-css-vars-css" href="https://villapanoramasuite.it/wp-content/uploads/the7-css/css-vars.css?ver=493ba19b8954" type="text/css" media="all">
    <link rel="stylesheet" id="dt-custom-css" href="https://villapanoramasuite.it/wp-content/uploads/the7-css/custom.css?ver=493ba19b8954" type="text/css" media="all">
    <link rel="stylesheet" id="dt-media-css" href="https://villapanoramasuite.it/wp-content/uploads/the7-css/media.css?ver=493ba19b8954" type="text/css" media="all">
    <link rel="stylesheet" id="the7-mega-menu-css" href="https://villapanoramasuite.it/wp-content/uploads/the7-css/mega-menu.css?ver=493ba19b8954" type="text/css" media="all">
    <link rel="stylesheet" id="wpml.less-css" href="https://villapanoramasuite.it/wp-content/uploads/the7-css/compatibility/wpml.css?ver=493ba19b8954" type="text/css" media="all">
    <link rel="stylesheet" id="style-css" href="https://villapanoramasuite.it/wp-content/themes/dt-the7-child/style.css?ver=11.4.1" type="text/css" media="all">
    <link rel="stylesheet" id="the7-elementor-global-css" href="https://villapanoramasuite.it/wp-content/themes/dt-the7/css/compatibility/elementor/elementor-global.min.css?ver=11.4.1" type="text/css" media="all">
    <link rel="stylesheet" id="ex-wp-food-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/css/style.css?ver=6.6.1" type="text/css" media="all">
    <link rel="stylesheet" id="ex-wp-food-list-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/css/style-list.css?ver=6.6.1" type="text/css" media="all">
    <link rel="stylesheet" id="ex-wp-food-table-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/css/style-table.css?ver=6.6.1" type="text/css" media="all">
    <link rel="stylesheet" id="ex-wp-food-modal-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/css/modal.css?ver=6.6.1" type="text/css" media="all">
    <link rel="stylesheet" id="ex-wp-food-user-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/css/user.css?ver=6.6.1" type="text/css" media="all">
    <link rel="stylesheet" id="ex-wp-s_lick-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/js/ex_s_lick/ex_s_lick.css?ver=6.6.1" type="text/css" media="all">
    <link rel="stylesheet" id="ex_wp_s_lick-theme-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/js/ex_s_lick/ex_s_lick-theme.css?ver=6.6.1" type="text/css" media="all">
    <link rel="stylesheet" id="exfood-custom-css-css" href="https://villapanoramasuite.it/wp-content/plugins/wp-food/js/ex_s_lick/ex_s_lick.css?ver=6.6.1" type="text/css" media="all">
    <style id="exfood-custom-css-inline-css" type="text/css">
        select.ex-ck-select,.exfood-select-loc select.ex-loc-select{background-image: url(https://villapanoramasuite.it/wp-content/plugins/wp-food/css/icon-dropdow.png);}
        /*.exfd-hide-order {display:none;}*/
    </style>
    <link rel="stylesheet" id="wpr-text-animations-css-css" href="https://villapanoramasuite.it/wp-content/plugins/royal-elementor-addons/assets/css/lib/animations/text-animations.min.css?ver=1.3.979" type="text/css" media="all">
    <link rel="stylesheet" id="wpr-addons-css-css" href="https://villapanoramasuite.it/wp-content/plugins/royal-elementor-addons/assets/css/frontend.min.css?ver=1.3.979" type="text/css" media="all">
    <link rel="stylesheet" id="font-awesome-5-all-css" href="https://villapanoramasuite.it/wp-content/plugins/elementor/assets/lib/font-awesome/css/all.min.css?ver=1.3.979" type="text/css" media="all">
    <link rel="stylesheet" id="google-fonts-1-css" href="https://fonts.googleapis.com/css?family=Roboto%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic%7CRoboto+Slab%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic&amp;display=auto&amp;ver=6.6.1" type="text/css" media="all">
    <link rel="stylesheet" id="elementor-icons-shared-0-css" href="https://villapanoramasuite.it/wp-content/plugins/elementor/assets/lib/font-awesome/css/fontawesome.min.css?ver=5.15.3" type="text/css" media="all">
    <link rel="stylesheet" id="elementor-icons-fa-solid-css" href="https://villapanoramasuite.it/wp-content/plugins/elementor/assets/lib/font-awesome/css/solid.min.css?ver=5.15.3" type="text/css" media="all">
`;

const topNavBarJS = `
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Seleziona il pulsante del menù hamburger
            var hamburgerButton = document.querySelector('.lines-button');
            // Seleziona il menù mobile che sarà espanso/collassato
            var mobileMenu = document.querySelector('.mobile-menu');

            if (!hamburgerButton || !mobileMenu) return;

            // Aggiungi un listener per il click sul pulsante hamburger
            hamburgerButton.addEventListener('click', function() {
                // Aggiunge o rimuove la classe 'expanded' per mostrare o nascondere il menù
                mobileMenu.classList.toggle('expanded');

                // Cambia lo stato del pulsante (ad esempio, attivazione dello stato "attivo")
                hamburgerButton.classList.toggle('is-active');
            });
        });
    </script>
`;

const topNavigationBar = `
    <div class="masthead inline-header right light-preset-color widgets full-height shadow-decoration shadow-mobile-header-decoration type-9-mobile-menu-icon dt-parent-menu-clickable show-sub-menu-on-hover" style="background-color: rgba(0,0,0,0);" role="banner">
        <div class="top-bar line-content">
            <div class="top-bar-bg" style="background-color: rgba(255,255,255,0);"></div>
            <div class="left-widgets mini-widgets">
                <a href="mailto: booking@villapanoramasuite.it" class="mini-contacts email show-on-desktop near-logo-first-switch in-menu-second-switch first last">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-fill" viewBox="0 0 16 16">
                        <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
                    </svg>&nbsp;
                    booking@villapanoramasuite.it
                </a>
            </div>
        </div>
    
        <header class="header-bar">
            <div class="branding">
                <div id="site-title" class="assistive-text">Villa Panorama</div>
                <div id="site-description" class="assistive-text">Camere Suite a Porto Empedocle</div>
                <a class="" href="https://villapanoramasuite.it/">
                    <img class=" preload-me" src="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-B70px.png" srcset="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-B70px.png 195w, https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-Bi240px.png 667w" width="195" height="70" sizes="195px" alt="Villa Panorama">
                </a>
            </div>
            <ul id="primary-menu" class="main-nav underline-decoration l-to-r-line outside-item-remove-margin">
                <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home current-menu-item page_item page-item-496 current_page_item menu-item-502 act first depth-0">
                    <a href="https://villapanoramasuite.it/" data-level="1">
                        <span class="menu-item-text">
                            <span class="menu-text">Home</span>
                            <i class="underline"></i>
                        </span>
                    </a>
                </li>
                <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-127 depth-0">
                    <a href="https://villapanoramasuite.it/struttura/" data-level="1">
                        <span class="menu-item-text">
                            <span class="menu-text">Struttura</span>
                            <i class="underline"></i>
                        </span>
                    </a>
                </li>
                <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2122 depth-0">
                    <a href="https://villapanoramasuite.it/suite/" data-level="1">
                        <span class="menu-item-text">
                            <span class="menu-text">Suite</span>
                            <i class="underline"></i>
                        </span>
                    </a>
                </li>
                <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2937 depth-0">
                    <a href="https://villapanoramasuite.it/gallery/" data-level="1">
                        <span class="menu-item-text">
                            <span class="menu-text">Gallery</span>
                            <i class="underline"></i>
                        </span>
                    </a>
                </li>
                <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-87 depth-0">
                    <a href="https://villapanoramasuite.it/punti-di-interesse/" data-level="1">
                        <span class="menu-item-text">
                            <span class="menu-text">Punti di interesse</span>
                            <i class="underline"></i>
                        </span>
                    </a>
                </li>
                <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-298 depth-0">
                    <a href="https://villapanoramasuite.it/contatti/" data-level="1">
                        <span class="menu-item-text">
                            <span class="menu-text">Contatti</span>
                            <i class="underline"></i>
                        </span>
                    </a>
                </li>
                <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-1650 last depth-0">
                    <a href="https://villapanoramasuite.it/prenota/" data-level="1">
                        <span class="menu-item-text">
                            <span class="menu-text">Prenota</span>
                            <i class="underline"></i>
                        </span>
                    </a>
                </li>
            </ul>
        </header>

        <div class="mobile-header-bar">
            <div class="mobile-navigation">
                <a href="#" class="dt-mobile-menu-icon" aria-label="Mobile menu icon">
                    <div class="lines-button ">
                        <span class="menu-line"></span>
                        <span class="menu-line"></span>
                        <span class="menu-line"></span>
                    </div>
                </a>
            </div>
            <div class="mobile-mini-widgets">
                <a href="mailto: booking@villapanoramasuite.it" class="mini-contacts email show-on-desktop near-logo-first-switch in-menu-second-switch show-on-first-switch">
                    <i class="fa-fw the7-mw-icon-mail-bold"></i> 
                    booking@villapanoramasuite.it
                </a>
            </div>
            <div class="mobile-branding">
                <a class="sticky-mobile-logo-second-switch" href="https://villapanoramasuite.it/">
                    <img class=" preload-me" src="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-70px.png" srcset="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-70px.png 195w, https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-240px.png 667w" width="195" height="70" sizes="195px" alt="Villa Panorama"> 
                </a>
                <a class="sticky-mobile-logo-first-switch" href="https://villapanoramasuite.it/"><img class=" preload-me" src="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-70px.png" srcset="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-70px.png 195w, https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-240px.png 667w" width="195" height="70" sizes="195px" alt="Villa Panorama"> </a><a class="" href="https://villapanoramasuite.it/"><img class=" preload-me" src="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-B70px.png" srcset="https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-B70px.png 195w, https://villapanoramasuite.it/wp-content/uploads/2023/02/villa-panorama-Bi240px.png 667w" width="195" height="70" sizes="195px" alt="Villa Panorama">
                </a>
            </div>
        </div>
    </div>
`;

module.exports = {

    roomsNames,
    roomsImages,
    translations_it,
    translations_en,
    translations_fr,
    translations_de,
    htmlResponsePostfix,
    topNavigationBarCSS,
    topNavBarJS,
    topNavigationBar
};
