const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const GoogleCalendar = require('../GoogleCalendar');
const googleCalendar = new GoogleCalendar();

// Servire la pagina HTML
router.get('/', async (req, res) => {
    try {
        const oAuth2Client = await googleCalendar.authorize();
        const token = oAuth2Client.credentials;
        if (token && token.access_token) {
            res.sendFile(path.join(__dirname, '../disponibilita.html'));
        } else {
            res.sendFile(path.join(__dirname, '../index.html'));
        }
    } catch (error) {
        res.sendFile(path.join(__dirname, '../index.html'));
    }
});

// Verifica se il token esiste
router.get('/check-token', async (req, res) => {
    try {
        if (fs.existsSync(path.join(__dirname, '../token.json'))) {
            res.json({ hasToken: true });
        } else {
            res.json({ hasToken: false });
        }
    } catch (error) {
        console.error('Error checking token:', error);
        res.status(500).json({ error: 'Error checking token' });
    }
});

// Endpoint per generare l'URL di autorizzazione
router.get('/auth-url', async (req, res) => {
    try {
        await googleCalendar.loadCredentials();
        const authUrl = googleCalendar.generateAuthUrl();
        res.send({ url: authUrl });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).send('Error generating auth URL');
    }
});

// Endpoint per gestire la pagina di callback OAuth2
router.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    try {
        const oAuth2Client = await googleCalendar.authorize();
        await googleCalendar.getAccessToken(oAuth2Client, code);
        res.sendFile(path.join(__dirname, '../oauth2callback.html'));
    } catch (error) {
        console.error('Error during OAuth2 callback:', error);
        res.status(500).send('Error during OAuth2 callback');
    }
});

// Endpoint per gestire il form di callback e filtrare gli eventi
router.post('/events', async (req, res) => {
    try {
        const { calendarIds, timeMin, timeMax } = req.body;
        const oAuth2Client = await googleCalendar.authorize();
        const events = [];
        for (const calendarId of calendarIds) {
            const calendarEvents = await googleCalendar.listEvents(oAuth2Client, calendarId, timeMin, timeMax);
            events.push(...calendarEvents);
        }
        res.send(events);
    } catch (error) {
        console.error('Error listing events:', error);
        res.status(500).send('Error listing events');
    }
});

module.exports = router;
