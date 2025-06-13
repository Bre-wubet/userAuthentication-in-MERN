# MERN Authentication System

A full-stack authentication system built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring user registration, login, role-based access control, and profile management.

## Features

- User registration and login
- JWT-based authentication
- Role-based access control (User/Admin)
- Protected routes
- User profile management
- Admin dashboard for user management
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mern-auth-app
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-auth
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

## Running the Application

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client:
```bash
cd client
npm run dev
```

The server will run on http://localhost:5000 and the client on http://localhost:5173.

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile
- PUT /api/auth/profile - Update user profile

### User Management (Admin only)
- GET /api/users - Get all users
- PUT /api/users/:id/role - Update user role

## Project Structure

```
mern-auth-app/
│
├── client/                      # React front-end
│   ├── public/
│   └── src/
│       ├── components/          # React components
│       ├── context/            # React context
│       ├── pages/              # Page components
│       └── App.jsx            # Main App component
│
├── server/                      # Node.js + Express back-end
│   ├── config/                 # Configuration files
│   ├── controllers/           # Route controllers
│   ├── middlewares/           # Custom middlewares
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   └── server.js             # Server entry point
│
└── README.md
```

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes with role-based access
- Input validation and sanitization
- Secure password storage
- CORS enabled

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 