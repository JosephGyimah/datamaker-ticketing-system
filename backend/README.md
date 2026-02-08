# Datamaker Ticketing System - Backend

A professional Node.js + Express backend for a cloud-hosted ticketing system.

## Project Structure

```
datamaker-ticketing-backend/
├── src/
│   ├── server.js                 # Main Express server
│   ├── routes/                   # API route definitions
│   │   ├── auth.routes.js
│   │   ├── ticket.routes.js
│   │   └── admin.routes.js
│   ├── controllers/              # Business logic and request handlers
│   │   ├── auth.controller.js
│   │   ├── ticket.controller.js
│   │   └── admin.controller.js
│   ├── models/                   # Data models and schemas
│   │   ├── User.model.js
│   │   └── Ticket.model.js
│   ├── middleware/               # Custom middleware functions
│   │   ├── auth.middleware.js
│   │   └── role.middleware.js
│   ├── config/                   # Configuration files
│   │   └── db.js
│   └── utils/                    # Utility functions
│       └── csvExport.js
├── .env                          # Environment variables (not tracked)
├── .gitignore                    # Git ignore rules
├── package.json                  # Project dependencies
└── README.md                     # This file
```

## Getting Started

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd datamaker-ticketing-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`

### Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Tickets
- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get ticket by ID
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Admin
- `GET /api/admin/dashboard` - Get dashboard data
- `GET /api/admin/users` - Get all users
- `POST /api/admin/export` - Export data

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Environment Variables

See `.env` file for all required configuration variables.

## Technologies Used

- **Express.js** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

## Cloud Deployment

This backend is ready for cloud deployment on:
- AWS (EC2, Elastic Beanstalk, Lambda)
- Azure (App Service, Container Instances)
- Google Cloud Platform (Cloud Run, App Engine)
- Heroku
- DigitalOcean

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please create an issue in the repository.
