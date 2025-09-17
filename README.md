# Reusable Authentication System

A comprehensive, production-ready authentication system built with Node.js, Express, Prisma, PostgreSQL, and React. This system provides a complete solution for user authentication, authorization, and role-based access control that can be easily integrated into any project.

## 🚀 Features

### Backend Features
- **User Authentication**: Registration, login, logout, password reset
- **Role-Based Access Control (RBAC)**: Flexible role and permission system
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Session Management**: Track and manage user sessions
- **Audit Logging**: Comprehensive audit trail for all user actions
- **Rate Limiting**: Built-in protection against abuse
- **Input Validation**: Robust validation using Joi
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Security**: Helmet.js for security headers, CORS configuration
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations

### Frontend Features
- **Modern React**: Built with React 18 and modern hooks
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Form Handling**: React Hook Form for efficient form management
- **State Management**: Context API for global state management
- **API Integration**: Axios with automatic token refresh
- **Toast Notifications**: User-friendly feedback with react-hot-toast
- **Protected Routes**: Route protection based on roles and permissions
- **Admin Panel**: Complete admin interface for user and role management

## 📁 Project Structure

```
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers (MVC)
│   │   ├── middleware/    # Custom middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic (Models)
│   │   └── utils/         # Utility functions
│   ├── prisma/            # Database schema and migrations
│   └── package.json
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context providers
│   │   ├── lib/          # Utility functions and API client
│   │   ├── pages/        # Page components
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd userAuthentication
```

### 2. Backend Setup
```bash
cd server
npm install
```

### 3. Database Setup
1. Create a PostgreSQL database
2. Copy the environment file:
```bash
cp env.example .env
```

3. Update the `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/auth_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
PORT=5000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

4. Generate Prisma client and run migrations:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Frontend Setup
```bash
cd ../client
npm install
```

5. Create environment file:
```bash
cp .env.example .env.local
```

6. Update the environment variables:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start the Development Servers

Backend (Terminal 1):
```bash
cd server
npm run dev
```

Frontend (Terminal 2):
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Documentation: http://localhost:5000/api/docs

## 🔐 Default Credentials

After running the seed script, you can use these default credentials:

- **Admin User**: admin@example.com / admin123
- **Regular User**: user@example.com / admin123

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password` | Reset password | Public |
| POST | `/api/auth/change-password` | Change password | Private |
| GET | `/api/auth/me` | Get current user | Private |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users/profile` | Get user profile | Private |
| PUT | `/api/users/profile` | Update user profile | Private |
| DELETE | `/api/users/profile` | Delete user account | Private |
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin/Self |
| PUT | `/api/users/:id` | Update user | Admin/Self |
| DELETE | `/api/users/:id` | Delete user | Admin |

### Role Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/roles` | Get all roles | Admin |
| GET | `/api/roles/:id` | Get role by ID | Admin |
| POST | `/api/roles` | Create new role | Admin |
| PUT | `/api/roles/:id` | Update role | Admin |
| DELETE | `/api/roles/:id` | Delete role | Admin |
| POST | `/api/roles/assign` | Assign role to user | Admin |
| DELETE | `/api/roles/remove` | Remove role from user | Admin |
| GET | `/api/roles/permissions/all` | Get all permissions | Admin |
| GET | `/api/roles/permissions/check` | Check user permission | Private |
| GET | `/api/roles/permissions/user` | Get user permissions | Private |

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/auth_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Server Configuration
PORT=5000
NODE_ENV="development"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET="your-session-secret-key"

# API Configuration
API_VERSION="v1"
API_PREFIX="/api"
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🎯 Usage Examples

### Adding to Your Project

1. **Copy the authentication system** to your project
2. **Update the database schema** to include your project-specific models
3. **Customize the user model** if needed (add fields, relationships)
4. **Configure roles and permissions** for your application
5. **Integrate the frontend components** into your UI

### Customizing Roles and Permissions

1. **Add new permissions** in the Prisma schema:
```prisma
model Permission {
  // ... existing fields
  resource    String   // e.g., 'products', 'orders'
  action      String   // e.g., 'create', 'read', 'update', 'delete'
}
```

2. **Create roles** with specific permissions:
```javascript
// In your seed file or admin panel
const productManagerRole = await prisma.role.create({
  data: {
    name: 'product_manager',
    description: 'Can manage products',
    permissions: {
      create: [
        { permissionId: 'products.create' },
        { permissionId: 'products.read' },
        { permissionId: 'products.update' }
      ]
    }
  }
});
```

3. **Use in your components**:
```jsx
import { useAuth } from './context/AuthContext';

function ProductPage() {
  const { hasPermission } = useAuth();
  
  return (
    <div>
      {hasPermission('products.create') && (
        <button>Create Product</button>
      )}
    </div>
  );
}
```

## 🚀 Deployment

### Backend Deployment
1. Set up a PostgreSQL database (e.g., AWS RDS, Heroku Postgres)
2. Configure environment variables
3. Run database migrations: `npm run db:push`
4. Deploy to your preferred platform (Heroku, AWS, DigitalOcean)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Update the API URL in environment variables

## 🔒 Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Security**: Secure token generation and validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: Helmet.js security headers
- **Session Management**: Secure session handling

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Note**: This is a production-ready authentication system. Make sure to:
- Change all default passwords and secrets
- Configure proper CORS origins for production
- Set up proper logging and monitoring
- Review and customize the security settings
- Test thoroughly before deploying to production