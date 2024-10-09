// Middleware per controllare se l'utente è autenticato come amministratore

require('dotenv').config(); // Carica le variabili d'ambiente dal file .env


function checkAdminAuth(req, res, next) {


    console.log(req.isAuthenticated);
    console.log(req.user);
    console.log(req.user.isAdmin);

    // Logica per controllare se l'utente è autenticato come amministratore
    if (req.isAuthenticated && req.user && req.user.isAdmin) {
        return next();
    } else {
        return res.status(403).send('Non sei autorizzato a visualizzare questa pagina.');
    }
}


function authenticateAdmin(req, res, next) {
    const { email, password } = req.body;

    console.log(email, password);
    console.log(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        // Imposta la sessione come autenticata e salva l'utente
        req.session.user = { email: email, isAdmin: true }; // Salva l'utente nella sessione
        req.session.isAdminAuthenticated = true; // Imposta la sessione come autenticata

        console.log(req.session);

        next();
    } else {
        res.status(401).send('Autenticazione fallita. Credenziali errate.');
    }
}


module.exports = {
    checkAdminAuth,
    authenticateAdmin
};
