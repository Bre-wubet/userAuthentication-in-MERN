# Deployment Guide

This guide covers deploying the Reusable Authentication System to various platforms.

## 🚀 Quick Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Frontend (Vercel)
1. **Connect to Vercel**:
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Set build command: `npm run build`
   - Set output directory: `dist`

2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

#### Backend (Railway)
1. **Connect to Railway**:
   - Push your code to GitHub
   - Connect your repository to Railway
   - Add PostgreSQL service

2. **Environment Variables**:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

3. **Deploy Commands**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Option 2: Netlify + Heroku

#### Frontend (Netlify)
1. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.herokuapp.com/api
   ```

#### Backend (Heroku)
1. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   heroku addons:create heroku-postgresql:hobby-dev
   ```

2. **Environment Variables**:
   ```bash
   heroku config:set JWT_SECRET=your-super-secret-jwt-key
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN=https://your-frontend.netlify.app
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   heroku run npm run db:push
   heroku run npm run db:seed
   ```

### Option 3: DigitalOcean App Platform

#### Full Stack Deployment
1. **Create App**:
   - Connect your GitHub repository
   - Choose "Full Stack App"

2. **Configure Services**:
   - **Frontend Service**:
     - Source: `client/`
     - Build command: `npm run build`
     - Output directory: `dist`
     - Environment: `VITE_API_URL=https://your-backend-url`

   - **Backend Service**:
     - Source: `server/`
     - Build command: `npm run build`
     - Run command: `npm start`
     - Environment: Set all required variables

   - **Database**:
     - Add PostgreSQL database
     - Connect to backend service

## 🔧 Production Configuration

### Environment Variables

#### Backend Production Variables
```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key

# API Configuration
API_VERSION=v1
API_PREFIX=/api
```

#### Frontend Production Variables
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Security Considerations

1. **JWT Secret**: Use a strong, random secret (minimum 32 characters)
2. **CORS**: Set specific origins, not wildcards
3. **Rate Limiting**: Configure appropriate limits for your use case
4. **HTTPS**: Always use HTTPS in production
5. **Database**: Use connection pooling and SSL
6. **Environment Variables**: Never commit secrets to version control

### Database Setup

1. **Create Production Database**:
   ```sql
   CREATE DATABASE auth_production;
   CREATE USER auth_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE auth_production TO auth_user;
   ```

2. **Run Migrations**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Backup Strategy**:
   - Set up automated backups
   - Test restore procedures
   - Monitor database performance

## 📊 Monitoring and Logging

### Application Monitoring
- **Uptime Monitoring**: Use services like UptimeRobot or Pingdom
- **Error Tracking**: Integrate Sentry or similar service
- **Performance Monitoring**: Use New Relic or DataDog

### Logging
```javascript
// Add to your server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd server && npm ci
      - run: cd server && npm run build
      - run: cd server && npm run db:push
      - name: Deploy to Railway
        run: railway deploy

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd client && npm ci
      - run: cd client && npm run build
      - name: Deploy to Vercel
        run: vercel --prod
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check DATABASE_URL format
   - Verify database credentials
   - Ensure database is accessible

2. **CORS Errors**:
   - Verify CORS_ORIGIN setting
   - Check frontend URL matches exactly

3. **JWT Errors**:
   - Ensure JWT_SECRET is set
   - Check token expiration settings

4. **Build Errors**:
   - Verify Node.js version compatibility
   - Check all dependencies are installed
   - Review build logs for specific errors

### Health Checks

Add health check endpoints:
```javascript
// In server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected' // Add actual DB check
  });
});
```

## 📈 Performance Optimization

### Backend Optimization
- Enable gzip compression
- Use Redis for session storage
- Implement database connection pooling
- Add response caching where appropriate

### Frontend Optimization
- Enable code splitting
- Optimize bundle size
- Use CDN for static assets
- Implement service worker for caching

## 🔐 Security Checklist

- [ ] JWT secrets are strong and unique
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Database connections use SSL
- [ ] Environment variables are secure
- [ ] Error messages don't leak sensitive info
- [ ] Input validation is comprehensive
- [ ] SQL injection protection is in place
- [ ] XSS protection is enabled

## 📞 Support

For deployment issues:
1. Check the logs for specific error messages
2. Verify all environment variables are set correctly
3. Test database connectivity
4. Review platform-specific documentation
5. Open an issue in the repository

---

**Remember**: Always test your deployment in a staging environment before going to production!
