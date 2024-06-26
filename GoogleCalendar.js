const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

class GoogleCalendar {
    constructor() {
        this.SCOPES = ['https://www.googleapis.com/auth/calendar'];
        this.TOKEN_PATH = path.join(__dirname, 'token.json');
        this.credentialsPath = path.join(__dirname, 'credentials.json');
    }

    async loadCredentials() {
        const content = fs.readFileSync(this.credentialsPath, 'utf8');
        const credentials = JSON.parse(content);

        this.client_id = credentials.web.client_id;
        this.client_secret = credentials.web.client_secret;
        this.redirect_uris = credentials.web.redirect_uris;
    }

    async authorize() {
        await this.loadCredentials();
        const oAuth2Client = new google.auth.OAuth2(this.client_id, this.client_secret, this.redirect_uris[0]);

        if (fs.existsSync(this.TOKEN_PATH)) {
            const token = fs.readFileSync(this.TOKEN_PATH, 'utf8');
            oAuth2Client.setCredentials(JSON.parse(token));

            // Set up the tokens event listener
            oAuth2Client.on('tokens', (tokens) => {
                if (tokens.refresh_token) {
                    // Save the new tokens
                    fs.writeFileSync(this.TOKEN_PATH, JSON.stringify(tokens));
                }
            });

            return oAuth2Client;
        } else {
            return oAuth2Client;
        }
    }

    generateAuthUrl() {
        this.loadCredentials();
        const oAuth2Client = new google.auth.OAuth2(this.client_id, this.client_secret, this.redirect_uris[0]);

        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.SCOPES,
            prompt: 'select_account',
        });

        return authUrl;
    }

    async getAccessToken(oAuth2Client, code) {
        return new Promise((resolve, reject) => {
            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    console.error('Error retrieving access token', err);
                    return reject(err);
                }
                oAuth2Client.setCredentials(token);
                fs.writeFileSync(this.TOKEN_PATH, JSON.stringify(token));
                resolve(oAuth2Client);
            });
        });
    }

    async listEvents(auth, calendarId, timeMin, timeMax) {
        const calendar = google.calendar({ version: 'v3', auth });
        
        // Convert timeMin and timeMax to Date objects and then to ISO strings
        const timeMinISO = new Date(timeMin).toISOString();
        const timeMaxISO = new Date(timeMax).toISOString();
        
        const res = await calendar.events.list({
            calendarId,
            timeMin: timeMinISO,
            timeMax: timeMaxISO,
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
    
        return res.data.items;
    }

    async listCalendars(auth) {
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.calendarList.list();
        return res.data.items;
    }

    // async checkFreeBusy(auth, calendarId, timeMin, timeMax) {
    //     const calendar = google.calendar({ version: 'v3', auth });

    //     const requestBody = {
    //         timeMin: new Date(timeMin).toISOString(),
    //         timeMax: new Date(timeMax).toISOString(),
    //         items: [{ id: calendarId }]
    //     };

    //     const res = await calendar.freebusy.query({
    //         requestBody
    //     });

    //     return res.data.calendars;
    // }

    async checkFreeBusy(auth, requestBody) {
        const calendar = google.calendar({ version: 'v3', auth });
    
        const res = await calendar.freebusy.query({
            requestBody
        });
    
        return res.data.calendars;
    }
    

    async listCalendars(auth) {
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.calendarList.list();
        return res.data.items;
    }
}

module.exports = GoogleCalendar;
