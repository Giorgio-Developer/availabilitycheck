const request = require('supertest');
const express = require('express');
const session = require('express-session');
const axios = require('axios');

// Import the main app parts needed for admin functionality
const { readCSV, writeCSV } = require('../../utils/csvUtils');
const { convertDateToDDMMYYYY, validateDates } = require('../../utils/dateUtils');

// Mock dependencies
jest.mock('axios');
jest.mock('../../utils/csvUtils');
jest.mock('../../utils/dateUtils');

describe('Admin Authentication and Dashboard', () => {
  let app;

  beforeEach(() => {
    // Create Express app with admin routes
    app = express();

    // Configure session
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Set test environment variables
    process.env.ADMIN_EMAIL = 'admin@test.com';
    process.env.ADMIN_PASSWORD = 'testpassword';
    process.env.OPENAI_API_KEY = 'test-openai-key';

    // Admin middleware
    function authenticateAdmin(req, res, next) {
      const { email, password } = req.body;

      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        req.session.isAdminAuthenticated = true;
        next();
      } else {
        res.status(401).send('Autenticazione fallita. Credenziali errate.');
      }
    }

    function checkAdminAuth(req, res, next) {
      if (req.session.isAdminAuthenticated) {
        next();
      } else {
        res.status(401).send('Accesso non autorizzato. Effettua il login.');
      }
    }

    // Admin routes
    app.get('/admin/login', (req, res) => {
      res.send('<html><body>Admin Login Page</body></html>');
    });

    app.post('/admin/login', authenticateAdmin, (req, res) => {
      res.redirect('/admin/dashboard');
    });

    app.get('/admin/dashboard', checkAdminAuth, (req, res) => {
      res.send('<html><body>Admin Dashboard</body></html>');
    });

    app.get('/admin/edit/:roomName', checkAdminAuth, async (req, res) => {
      const roomName = req.params.roomName;

      function convertDateToISO(date) {
        const parts = date.split('/');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2];
          return `${year}-${month}-${day}`;
        }
        return date;
      }

      try {
        const csvData = await readCSV(roomName);

        csvData.forEach(row => {
          row['data inizio'] = convertDateToISO(row['data inizio']);
          row['data fine'] = convertDateToISO(row['data fine']);
        });

        res.json({ roomName, csvData });
      } catch (error) {
        res.status(500).send('Errore durante la lettura del file CSV');
      }
    });

    app.post('/admin/edit/:roomName', checkAdminAuth, async (req, res) => {
      const roomName = req.params.roomName;
      let csvData = req.body.csvData;

      // Convert dates and validate
      convertDateToDDMMYYYY.mockImplementation(date => {
        const parts = date.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return date;
      });

      csvData = csvData.map(row => ({
        'data inizio': convertDateToDDMMYYYY(row['data inizio']),
        'data fine': convertDateToDDMMYYYY(row['data fine']),
        costo: row.costo
      }));

      const validationError = validateDates(csvData);
      if (validationError) {
        return res.status(500).json({ error: validationError });
      }

      // Mock OpenAI API call
      const prompt = `Rispondi in html, che può essere direttamente incluso all'interno di un <div></div>. Non includere cose come \`\`\`html o \`\`\`. Ho questi dati di prezzo per una stanza di unn B&B. Ritieni ci siano congrui o che ci sia qualche errore, tipo un prezzo eccessivamente basso o eccessivamente alto?${csvData.map(row => `Data inizio: ${row['data inizio']}, Data fine: ${row['data fine']}, Costo: ${row.costo}`).join('\n')}`;

      try {
        const openAiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        const aiConfirmation = openAiResponse.data.choices[0].message.content;

        await writeCSV(roomName, csvData);
        res.json({ success: true, data: csvData, aiConfirmation: aiConfirmation });
      } catch (error) {
        res.status(500).json({ error: 'Errore durante la scrittura nel file CSV' });
      }
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Admin Login', () => {
    test('should serve admin login page', async () => {
      const response = await request(app).get('/admin/login');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Admin Login Page');
    });

    test('should authenticate admin with correct credentials', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/admin/dashboard');
    });

    test('should reject admin with incorrect email', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({
          email: 'wrong@test.com',
          password: 'testpassword'
        });

      expect(response.status).toBe(401);
      expect(response.text).toBe('Autenticazione fallita. Credenziali errate.');
    });

    test('should reject admin with incorrect password', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.text).toBe('Autenticazione fallita. Credenziali errate.');
    });

    test('should reject admin with missing credentials', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({});

      expect(response.status).toBe(401);
      expect(response.text).toBe('Autenticazione fallita. Credenziali errate.');
    });
  });

  describe('Admin Dashboard Access', () => {
    test('should allow access to dashboard after authentication', async () => {
      const agent = request.agent(app);

      // First login
      await agent
        .post('/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      // Then access dashboard
      const response = await agent.get('/admin/dashboard');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Admin Dashboard');
    });

    test('should deny access to dashboard without authentication', async () => {
      const response = await request(app).get('/admin/dashboard');

      expect(response.status).toBe(401);
      expect(response.text).toBe('Accesso non autorizzato. Effettua il login.');
    });
  });

  describe('Room Edit Functionality', () => {
    test('should get room data for editing when authenticated', async () => {
      const agent = request.agent(app);

      // Mock CSV data
      const mockCsvData = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100.00' },
        { 'data inizio': '06/01/2024', 'data fine': '10/01/2024', 'costo': '120.00' }
      ];
      readCSV.mockResolvedValue(mockCsvData);

      // Login first
      await agent
        .post('/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      // Get room edit data
      const response = await agent.get('/admin/edit/Villa%20Panorama');

      expect(response.status).toBe(200);
      expect(response.body.roomName).toBe('Villa Panorama');
      expect(response.body.csvData).toHaveLength(2);
      expect(response.body.csvData[0]['data inizio']).toBe('2024-01-01');
      expect(readCSV).toHaveBeenCalledWith('Villa Panorama');
    });

    test('should deny room edit access without authentication', async () => {
      const response = await request(app).get('/admin/edit/Villa%20Panorama');

      expect(response.status).toBe(401);
      expect(response.text).toBe('Accesso non autorizzato. Effettua il login.');
    });

    test('should handle CSV read errors', async () => {
      const agent = request.agent(app);

      readCSV.mockRejectedValue(new Error('File not found'));

      // Login first
      await agent
        .post('/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      const response = await agent.get('/admin/edit/NonExistentRoom');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Errore durante la lettura del file CSV');
    });
  });

  describe('Room Data Update', () => {
    test('should update room data with valid inputs and AI validation', async () => {
      const agent = request.agent(app);

      const mockCsvData = [
        { 'data inizio': '2024-01-01', 'data fine': '2024-01-05', 'costo': '100.00' }
      ];

      // Mock successful operations
      validateDates.mockReturnValue(null);
      writeCSV.mockResolvedValue();

      const mockOpenAIResponse = {
        data: {
          choices: [{
            message: {
              content: '<p>I prezzi sembrano congrui per il periodo indicato.</p>'
            }
          }]
        }
      };
      axios.post.mockResolvedValue(mockOpenAIResponse);

      // Login first
      await agent
        .post('/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      const response = await agent
        .post('/admin/edit/Villa%20Panorama')
        .send({ csvData: mockCsvData });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.aiConfirmation).toContain('prezzi sembrano congrui');
      expect(writeCSV).toHaveBeenCalledWith('Villa Panorama', expect.any(Array));
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-openai-key'
          })
        })
      );
    });

    test('should reject invalid date ranges', async () => {
      const agent = request.agent(app);

      const mockCsvData = [
        { 'data inizio': '2024-01-01', 'data fine': '2024-01-05', 'costo': '100.00' }
      ];

      validateDates.mockReturnValue('Errore: Ci sono sovrapposizioni nelle date');

      // Login first
      await agent
        .post('/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      const response = await agent
        .post('/admin/edit/Villa%20Panorama')
        .send({ csvData: mockCsvData });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Errore: Ci sono sovrapposizioni nelle date');
      expect(writeCSV).not.toHaveBeenCalled();
    });

    test('should handle OpenAI API errors', async () => {
      const agent = request.agent(app);

      const mockCsvData = [
        { 'data inizio': '2024-01-01', 'data fine': '2024-01-05', 'costo': '100.00' }
      ];

      validateDates.mockReturnValue(null);
      axios.post.mockRejectedValue(new Error('OpenAI API error'));

      // Login first
      await agent
        .post('/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      const response = await agent
        .post('/admin/edit/Villa%20Panorama')
        .send({ csvData: mockCsvData });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Errore durante la scrittura nel file CSV');
    });

    test('should handle CSV write errors', async () => {
      const agent = request.agent(app);

      const mockCsvData = [
        { 'data inizio': '2024-01-01', 'data fine': '2024-01-05', 'costo': '100.00' }
      ];

      validateDates.mockReturnValue(null);
      writeCSV.mockRejectedValue(new Error('Write error'));

      const mockOpenAIResponse = {
        data: {
          choices: [{
            message: {
              content: '<p>Prezzi OK</p>'
            }
          }]
        }
      };
      axios.post.mockResolvedValue(mockOpenAIResponse);

      // Login first
      await agent
        .post('/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      const response = await agent
        .post('/admin/edit/Villa%20Panorama')
        .send({ csvData: mockCsvData });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Errore durante la scrittura nel file CSV');
    });

    test('should deny room update without authentication', async () => {
      const mockCsvData = [
        { 'data inizio': '2024-01-01', 'data fine': '2024-01-05', 'costo': '100.00' }
      ];

      const response = await request(app)
        .post('/admin/edit/Villa%20Panorama')
        .send({ csvData: mockCsvData });

      expect(response.status).toBe(401);
      expect(response.text).toBe('Accesso non autorizzato. Effettua il login.');
    });
  });

  describe('Session Management', () => {
    test('should maintain session across multiple requests', async () => {
      const agent = request.agent(app);

      // Login
      await agent
        .post('/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      // Multiple authenticated requests
      const response1 = await agent.get('/admin/dashboard');
      const response2 = await agent.get('/admin/dashboard');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });

    test('should handle concurrent admin sessions independently', async () => {
      const agent1 = request.agent(app);
      const agent2 = request.agent(app);

      // Login with first agent
      await agent1
        .post('/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      // Second agent should not be authenticated
      const response1 = await agent1.get('/admin/dashboard');
      const response2 = await agent2.get('/admin/dashboard');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(401);
    });
  });
});