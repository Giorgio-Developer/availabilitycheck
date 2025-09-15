# Villa Panorama B&B - Test Suite Documentation

## Overview

Questo documento descrive la suite completa di test automatici per il sistema di prenotazioni Villa Panorama B&B. La suite include test unitari, di integrazione e end-to-end per tutti i componenti critici dell'applicazione.

## Struttura dei Test

```
tests/
├── unit/                     # Test unitari
│   ├── dateUtils.test.js     # Test utilità date
│   ├── csvUtils.test.js      # Test gestione CSV
│   ├── translate.test.js     # Test sistema traduzioni
│   ├── BookingHelper.test.js # Test calcolo prezzi
│   └── GoogleCalendar.test.js# Test API Google Calendar
├── integration/              # Test di integrazione
│   ├── calendar.route.test.js# Test routes calendario
│   ├── freebusy.route.test.js# Test controllo disponibilità
│   ├── admin.test.js         # Test autenticazione admin
│   └── app.test.js           # Test integrazione app completa
├── mocks/                    # Mock per servizi esterni
│   ├── googleApiMocks.js     # Mock Google Calendar API
│   └── csvMocks.js           # Mock dati CSV
├── helpers/                  # Utilità per test
│   └── testHelpers.js        # Funzioni helper comuni
├── setup.js                  # Configurazione globale test
└── README.md                 # Questa documentazione
```

## Setup e Installazione

### 1. Installazione Dipendenze

```bash
# Installazione automatica dipendenze test
npm run test:install

# Oppure manualmente
npm install --save-dev jest supertest @types/jest jest-environment-node
```

### 2. Configurazione Environment

Il file `.env.test` contiene le variabili d'ambiente per i test:

```bash
NODE_ENV=test
PORT=3001
SESSION_SECRET=test-session-secret-key
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=testpassword123
OPENAI_API_KEY=test-openai-api-key
```

## Esecuzione Test

### Comandi Base

```bash
# Eseguire tutti i test
npm test

# Test con coverage
npm run test:coverage

# Test in modalità watch
npm run test:watch

# Test verbosi per debugging
npm run test:verbose
```

### Test Specifici per Componente

```bash
# Test utilities (date, CSV, traduzioni)
npm run test:utils

# Test BookingHelper (calcolo prezzi)
npm run test:booking

# Test Google Calendar API
npm run test:google

# Test routes (calendar, freebusy)
npm run test:routes

# Test autenticazione admin
npm run test:admin

# Test integrazione app completa
npm run test:app
```

### Test per Categoria

```bash
# Solo test unitari
npm run test:unit

# Solo test di integrazione
npm run test:integration

# Test per debugging con rilevamento handle aperti
npm run test:debug
```

## Framework di Testing

### Jest

La suite utilizza **Jest** come framework principale per:
- Test runner
- Assertion library
- Mocking framework
- Coverage reporting

### Supertest

**Supertest** è utilizzato per:
- Test HTTP endpoints
- Test integrazione Express routes
- Simulazione richieste client

## Componenti Testati

### 1. Test Unitari

#### dateUtils.js
- ✅ Conversione formati date (DD/MM/YYYY ↔ YYYY-MM-DD)
- ✅ Validazione range date (sovrapposizioni, buchi)
- ✅ Gestione date leap year
- ✅ Formattazione date per diversi contesti

#### csvUtils.js
- ✅ Lettura file CSV con gestione errori
- ✅ Scrittura file CSV con formattazione corretta
- ✅ Gestione caratteri speciali in CSV
- ✅ Validazione struttura dati CSV

#### translate.js
- ✅ Traduzione multilingue (IT, EN, FR, DE)
- ✅ Fallback a inglese per lingue non supportate
- ✅ Gestione testi non tradotti
- ✅ Case sensitivity nelle traduzioni

#### BookingHelper.js
- ✅ Calcolo costi totali per soggiorni
- ✅ Gestione costi extra per ospiti aggiuntivi
- ✅ Calcolo costi animali domestici
- ✅ Gestione formati date diverse (DD/MM/YY vs DD/MM/YYYY)
- ✅ Validazione periodi di prenotazione

#### GoogleCalendar.js
- ✅ Autorizzazione OAuth2 Google
- ✅ Gestione token refresh automatico
- ✅ Query freebusy per disponibilità camere
- ✅ Listing eventi calendario
- ✅ Gestione errori API Google

### 2. Test di Integrazione

#### Routes Calendar
- ✅ Generazione URL autorizzazione Google
- ✅ Callback OAuth2 con gestione codici
- ✅ Verifica esistenza token
- ✅ Listing eventi multipli calendari
- ✅ Gestione errori autenticazione

#### Routes Freebusy
- ✅ Controllo disponibilità camere per periodo
- ✅ Calcolo prezzi totali con tutti gli extra
- ✅ Gestione richieste oltre 12 mesi
- ✅ Ricerca periodi alternativi quando non disponibile
- ✅ Supporto multilingue nelle risposte HTML
- ✅ Formattazione URL prenotazione WordPress

#### Admin Authentication
- ✅ Login admin con credenziali corrette/errate
- ✅ Gestione sessioni admin persistenti
- ✅ Protezione routes admin da accesso non autorizzato
- ✅ Editing prezzi camere con validazione AI
- ✅ Validazione range date per evitare sovrapposizioni
- ✅ Integrazione OpenAI per controllo congruità prezzi

#### App Integration
- ✅ Configurazione middleware Express
- ✅ Integrazione routes calendar e freebusy
- ✅ Gestione sessioni con express-session
- ✅ Servizio file statici
- ✅ Gestione errori 404 e malformed requests

## Mock e Test Data

### Google API Mocks
- OAuth2 client con token management
- Calendar API con eventi mock
- FreeBusy API con periodi occupati configurabili
- Simulazione errori API per test robustezza

### CSV Data Mocks
- Dati prezzi per tutte le 6 camere
- Range date validi e invalidi
- Sovrapposizioni e buchi temporali
- Formati diversi per compatibilità

### Test Helpers
- Autenticazione automatica admin
- Generazione range date per test
- Validazione struttura HTML responses
- Setup/cleanup environment test

## Coverage e Quality Metrics

### Coverage Targets
- **Unit Tests**: >90% line coverage
- **Integration Tests**: >80% line coverage
- **Overall**: >85% line coverage

### Coverage Report
```bash
npm run test:coverage
# Report HTML disponibile in: coverage/lcov-report/index.html
```

### Metriche Qualità
- Test isolation (no shared state)
- Proper mock cleanup
- Error handling coverage
- Edge cases testing
- Performance test per operazioni critiche

## Scenari di Test Critici

### 1. Flusso Prenotazione Completo
```javascript
// Test integrazione end-to-end
1. Richiesta disponibilità periodo specifico
2. Verifica calendari Google per occupazione
3. Calcolo prezzo totale con extra
4. Generazione URL prenotazione WordPress
5. Validazione risposta HTML multilingue
```

### 2. Gestione Admin Completa
```javascript
// Test workflow admin
1. Login con credenziali
2. Accesso dashboard protetta
3. Modifica prezzi camera
4. Validazione range date
5. Controllo congruità AI OpenAI
6. Salvataggio dati CSV
```

### 3. Integrazione Google Calendar
```javascript
// Test autorizzazione e API calls
1. Generazione URL autorizzazione
2. Callback OAuth con codice
3. Token refresh automatico
4. Query freebusy multipli calendari
5. Gestione errori API e network
```

## Troubleshooting

### Problemi Comuni

#### Test Timeouts
```bash
# Aumentare timeout per test lenti
jest.setTimeout(10000);

# Oppure per test specifici
npm run test:debug
```

#### Handle Aperti
```bash
# Rilevare handle non chiusi
npm run test:debug
```

#### Mock Non Funzionanti
```bash
# Reset completo mocks
jest.clearAllMocks();
jest.resetModules();
```

### Environment Issues
- Verificare `.env.test` sia presente
- Controllare variabili environment in `tests/setup.js`
- Assicurarsi che port 3001 sia libero per test

## Best Practices

### 1. Scrittura Test
- Un test per funzionalità specifica
- Nomi descrittivi per test cases
- Setup/teardown appropriati
- Mock isolati per ogni test

### 2. Mock Strategy
- Mock servizi esterni (Google, OpenAI)
- Non mockare codice sotto test
- Mock al livello giusto (module vs function)
- Cleanup mock dopo ogni test

### 3. Data Management
- Usare factory functions per test data
- Evitare hardcoded values dove possibile
- Separare test data dalla logica test
- Gestire edge cases (date leap year, etc.)

## Continuous Integration

### Pre-commit Hooks
```bash
# Eseguire test prima di commit
npm test

# Coverage check
npm run test:coverage
```

### CI/CD Pipeline
```yaml
# Esempio configurazione CI
- name: Run Tests
  run: |
    npm ci
    npm run test:coverage
    npm run test:debug
```

## Contribuire ai Test

### Aggiungere Nuovi Test
1. Creare file test nella directory appropriata (`unit/` o `integration/`)
2. Seguire naming convention: `ComponentName.test.js`
3. Usare helper functions disponibili in `tests/helpers/`
4. Aggiornare questo README con nuovi test

### Modificare Test Esistenti
1. Mantenere backward compatibility
2. Aggiornare mock se necessario
3. Verificare che coverage non diminuisca
4. Testare tutte le modifiche localmente

## Contatti e Supporto

Per problemi con la test suite:
1. Verificare documentazione sopra
2. Controllare issues nel repository
3. Contattare il team di sviluppo

---

**Nota**: Questa test suite è stata generata automaticamente e copre tutti i componenti critici del sistema Villa Panorama B&B. Mantenere aggiornata con modifiche al codice principale.