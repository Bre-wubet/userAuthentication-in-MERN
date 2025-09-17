#!/bin/bash

# Reusable Authentication System Setup Script
# This script sets up the complete authentication system

set -e

echo "🚀 Setting up Reusable Authentication System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js (v16 or higher) first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if PostgreSQL is installed
check_postgres() {
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed. Please install PostgreSQL first."
        exit 1
    fi
    
    print_success "PostgreSQL is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd server
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cp env.example .env
        print_warning "Please update the .env file with your database credentials"
    else
        print_status ".env file already exists"
    fi
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npm run db:generate
    
    cd ..
    print_success "Backend setup completed"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd client
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Create .env.local file if it doesn't exist
    if [ ! -f .env.local ]; then
        print_status "Creating .env.local file..."
        echo "VITE_API_URL=http://localhost:5000/api" > .env.local
        print_success "Frontend environment file created"
    else
        print_status ".env.local file already exists"
    fi
    
    cd ..
    print_success "Frontend setup completed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd server
    
    # Check if DATABASE_URL is set
    if ! grep -q "DATABASE_URL=" .env; then
        print_error "DATABASE_URL not found in .env file. Please set it up first."
        exit 1
    fi
    
    # Push database schema
    print_status "Pushing database schema..."
    npm run db:push
    
    # Seed database
    print_status "Seeding database..."
    npm run db:seed
    
    cd ..
    print_success "Database setup completed"
}

# Main setup function
main() {
    echo "=========================================="
    echo "  Reusable Authentication System Setup"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_node
    check_npm
    check_postgres
    echo ""
    
    # Setup backend
    setup_backend
    echo ""
    
    # Setup frontend
    setup_frontend
    echo ""
    
    # Ask about database setup
    echo "Database setup is required. This will:"
    echo "1. Create database tables"
    echo "2. Seed with default data (admin@example.com / admin123)"
    echo ""
    read -p "Do you want to proceed with database setup? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_database
        echo ""
    else
        print_warning "Skipping database setup. You can run it later with:"
        echo "  cd server && npm run db:push && npm run db:seed"
        echo ""
    fi
    
    # Final instructions
    echo "=========================================="
    echo "  Setup Completed Successfully!"
    echo "=========================================="
    echo ""
    print_success "Backend and frontend are ready!"
    echo ""
    echo "Next steps:"
    echo "1. Update server/.env with your database credentials"
    echo "2. Start the backend: cd server && npm run dev"
    echo "3. Start the frontend: cd client && npm run dev"
    echo ""
    echo "Default credentials:"
    echo "  Admin: admin@example.com / admin123"
    echo "  User:  user@example.com / admin123"
    echo ""
    echo "Access the application at:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5000/api"
    echo ""
}

# Run main function
main "$@"
