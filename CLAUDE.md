# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a B&B (Bed & Breakfast) booking system for Villa Panorama that integrates with Google Calendar to check room availability and manage pricing. The application provides a web interface for guests to check availability and allows administrators to manage room prices.

## Architecture

### Core Components

- **Express.js Web Server** (`index.js`): Main application server with session management, admin authentication, and OpenAI integration for price validation
- **Google Calendar Integration** (`GoogleCalendar.js`): Handles OAuth2 authentication and calendar API calls
- **Booking System** (`BookingHelper.js`): Core booking logic and availability checking
- **Route Handlers**:
  - `routes/calendar.js`: OAuth authentication and calendar access
  - `routes/freebusy.js`: Room availability checking and booking logic

### Data Management

- **Room Pricing**: CSV files stored in `rooms_prices/` directory (Calypso.csv, Demetra.csv, etc.)
- **Utilities**:
  - `utils/csvUtils.js`: CSV reading/writing operations
  - `utils/dateUtils.js`: Date validation and conversion utilities
  - `utils/translate.js`: Multi-language support
  - `utils/constants.js`: Room mappings, calendar IDs, and translations

### Key Architecture Patterns

1. **Room-Calendar Mapping**: Each room has multiple Google Calendar IDs (primary + secondary booking platforms)
2. **Pricing Periods**: CSV-based pricing with date ranges and validation
3. **Multi-language Support**: Italian, English, French translations
4. **Admin Interface**: Session-based authentication with CSV editing capabilities

## Environment Setup

Required environment variables (see `.env.example`):
- `ADMIN_EMAIL`: Administrator login email
- `ADMIN_PASSWORD`: Administrator password
- `OPENAI_API_KEY`: OpenAI API key for price validation
- `SESSION_SECRET`: Express session secret
- `PORT`: Server port (defaults to 3000)

## Google Calendar Configuration

The application requires Google Calendar API setup with OAuth2 credentials stored in `credentials.json`. See `GoogleCalendarGuide.txt` for detailed setup instructions.

Each room maps to specific Google Calendar IDs defined in `routes/freebusy.js`:
- Villa Panorama, Calypso, Hermes, Elettra, Demetra, Iris Oasis

## Development Commands

```bash
# Start the server
npm start
# or
node index.js

# Install dependencies
npm install
```

## Room Management

Room pricing data is stored as CSV files in `rooms_prices/` with structure:
- `data inizio`: Start date (DD/MM/YYYY format)
- `data fine`: End date (DD/MM/YYYY format)
- `costo`: Price for the period

The admin interface (`/admin/dashboard`) allows editing these CSV files with OpenAI-powered price validation.

## API Endpoints

### Public Routes
- `GET /`: Main availability check page
- `POST /availability`: Check room availability for date ranges
- `GET /oauth2callback`: OAuth2 callback handler

### Admin Routes (Authentication Required)
- `GET /admin/login`: Admin login page
- `GET /admin/dashboard`: Admin dashboard
- `GET /admin/edit/:roomName`: Edit room pricing
- `POST /admin/edit/:roomName`: Update room pricing with AI validation

## Key Files to Understand

- `index.js`: Server setup, admin authentication, CSV editing with OpenAI validation
- `routes/freebusy.js`: Core availability checking logic, room calendar mapping
- `utils/dateUtils.js`: Date validation, format conversion, availability period calculation
- `BookingHelper.js`: Booking confirmation and calendar event creation
- `constants.js`: Room definitions, calendar IDs, translations

## WordPress Integration

The project includes WordPress integration files for embedding the booking system:
- HTML templates for WordPress embedding
- Contact Form 7 integration (`CF7_Mail.md`)