# Event Management System 🎉

A comprehensive full-stack web application for booking and managing event halls. This system provides a seamless experience for users to browse, book, and manage event venues, while administrators can oversee the entire platform.

## 📖 Project Description

The **Event Management System** is a modern, full-featured web application designed to revolutionize the way event halls are discovered, booked, and managed. Built with cutting-edge technologies, this platform bridges the gap between venue seekers and event space providers, offering an intuitive and efficient solution for event planning.

### 🎯 Purpose

This system addresses the common challenges faced in event venue booking:
- **For Users**: Eliminates the hassle of manually searching for event halls, making phone calls, and managing bookings through scattered channels
- **For Venue Owners**: Provides a centralized platform to showcase venues, manage bookings, and track revenue
- **For Administrators**: Offers powerful tools to oversee the entire ecosystem, from user management to analytics

### 🌟 What Makes It Special

- **Smart Search & Discovery**: Leverages Google Places API to help users find nearby venues based on their location, complemented by city-based filtering for precise results
- **Automated Pricing Engine**: Intelligently calculates booking costs including base amount, 18% GST, and service fees, ensuring transparency and accuracy
- **Real-time Availability**: Prevents double-bookings with intelligent time slot validation
- **Comprehensive Analytics**: Provides both users and administrators with insightful dashboards featuring charts, statistics, and trends
- **Role-based Access Control**: Implements secure, session-based authentication with distinct capabilities for regular users and administrators
- **Responsive Design**: Built with modern UI components (Radix UI + Tailwind CSS) for a seamless experience across all devices

### 💡 Use Cases

- **Event Planners**: Quickly find and book suitable venues for weddings, conferences, parties, and corporate events
- **Venue Managers**: Showcase properties, manage bookings, and track performance metrics
- **System Administrators**: Oversee platform operations, manage users, and analyze business metrics
- **Individual Users**: Book halls for personal events with complete transparency on pricing and availability

### 🔬 Technical Highlights

This project demonstrates best practices in modern web development:
- **Backend**: RESTful API design with FastAPI, SQLAlchemy ORM for database operations, and Pydantic for data validation
- **Frontend**: Component-based architecture with React, TypeScript for type safety, and TanStack Query for efficient data fetching
- **Security**: Session-based authentication, password hashing with bcrypt, and CORS protection
- **Data Visualization**: Interactive charts using Recharts for booking trends and revenue analytics
- **External Integration**: Google Maps and Places API for enhanced location services

![Use Case Diagram](UseCase_Diagram.png)

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [User Roles](#-user-roles)
- [Project Structure](#-project-structure)
- [Key Functionalities](#-key-functionalities)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### For Users
- **Authentication & Authorization**: Secure signup/login with session-based authentication
- **Hall Browsing**: Browse available event halls with pagination and filtering
- **Advanced Search**: Search halls by city and view nearby venues using Google Places API
- **Booking Management**: Create, view, and cancel bookings with automated pricing
- **User Dashboard**: 
  - View booking statistics and spending analytics
  - Monthly bookings chart
  - Hall usage visualization
  - Revenue tracking
- **Booking Details**: View detailed invoices with breakdown of amount, tax (18% GST), and service fees
- **Contact Support**: Submit inquiries and support requests

### For Administrators
- **Admin Dashboard**: 
  - System-wide statistics (total users, bookings, revenue)
  - Recent bookings overview
  - Quick actions panel
- **Hall Management**: 
  - Add, update, and delete halls
  - Seed dummy data for testing
  - Advanced filtering and sorting
- **Booking Management**: 
  - View all bookings across the system
  - Confirm or cancel bookings
  - Detailed booking information
- **User Management**: 
  - View all registered users
  - Update user roles (promote/demote admins)
- **Event Management**: Create and manage events
- **Contact Management**: View and respond to user inquiries

## 🛠 Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: Session-based with secure cookie handling
- **API**: RESTful architecture
- **Validation**: Pydantic schemas

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Maps**: React Leaflet for location display
- **Animations**: Framer Motion

### External Services
- **Google Places API**: For nearby venue discovery
- **Google Maps API**: For location visualization

## 🏗 System Architecture

```
Event Management System
│
├── Backend (FastAPI)
│   ├── Authentication & Session Management
│   ├── RESTful API Endpoints
│   ├── Database Models (SQLAlchemy)
│   └── Business Logic
│
├── Frontend (React + TypeScript)
│   ├── User Interface Components
│   ├── State Management (React Query)
│   ├── Routing & Navigation
│   └── Form Validation
│
└── Database (SQLite)
    ├── Users & Sessions
    ├── Halls
    ├── Bookings
    ├── Events
    └── Contact Messages
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python**: 3.8 or higher
- **Node.js**: 16.x or higher
- **npm**: 8.x or higher
- **Git**: For version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EVENT
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv myenv

# Activate virtual environment
# On Windows:
myenv\Scripts\activate
# On macOS/Linux:
source myenv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install additional required packages
pip install sqlalchemy python-multipart passlib bcrypt python-jose
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. **Environment Variables** (Optional)

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=sqlite:///./event_booking.db
SECRET_KEY=your-secret-key-here
GOOGLE_PLACES_API_KEY=your-google-api-key
```

2. **Database Initialization**

```bash
# From the backend directory
python recreate_db.py  # Creates tables and seeds initial data
```

3. **Create Admin User**

```bash
python create_admin.py
```

Default admin credentials:
- Email: `admin@gmail.com`
- Password: `admin123`

### Frontend Configuration

The frontend is pre-configured to proxy API requests to `http://localhost:8000`. No additional configuration is needed for local development.

## 🎮 Running the Application

### Start Backend Server

```bash
# From the backend directory
cd backend
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Start Frontend Development Server

```bash
# From the Frontend directory
cd Frontend
npm run dev
```

The application will be available at `http://localhost:5173`

### Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Sign up for a new account or login with admin credentials
3. Start exploring the features!

## 📚 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Main API Endpoints

#### Authentication
- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login and create session
- `POST /auth/logout` - Logout and destroy session
- `GET /auth/me` - Get current user information

#### Halls
- `GET /halls` - List all halls (with pagination)
- `GET /halls/{id}` - Get hall details
- `GET /halls/city/{city}` - Search halls by city
- `GET /halls/google/nearby` - Get nearby halls from Google Places
- `POST /halls` - Create new hall (Admin only)
- `PUT /halls/{id}` - Update hall (Admin only)
- `DELETE /halls/{id}` - Delete hall (Admin only)

#### Bookings
- `GET /bookings/my` - Get user's bookings
- `GET /bookings/{id}` - Get booking details
- `POST /bookings` - Create new booking
- `PUT /bookings/{id}/cancel` - Cancel booking
- `GET /bookings/hall/{hall_id}` - Get hall's bookings

#### Dashboard
- `GET /dashboard/user/summary` - Get user dashboard data
- `GET /dashboard/user/monthly-bookings` - Get monthly bookings chart
- `GET /dashboard/user/hall-usage` - Get hall usage statistics
- `GET /dashboard/user/revenue` - Get revenue data

#### Admin
- `GET /admin/stats` - Get system statistics
- `GET /admin/bookings` - Get all bookings
- `GET /admin/users` - Get all users
- `PUT /admin/users/{id}/role` - Update user role
- `PUT /admin/bookings/{id}/confirm` - Confirm booking
- `PUT /admin/bookings/{id}/cancel` - Cancel booking

#### Events
- `GET /events` - List all events
- `POST /events` - Create event (Admin only)

#### Contact
- `POST /contact` - Submit contact message
- `GET /contact/messages` - Get all messages (Admin only)

## 🗄 Database Schema

### Users
- `id`: Primary key
- `full_name`: User's full name
- `email`: Unique email address
- `hashed_password`: Encrypted password
- `is_admin`: Admin flag
- `created_at`: Registration timestamp

### Sessions
- `id`: Primary key
- `token`: Unique session token
- `user_id`: Foreign key to Users
- `expiration`: Session expiry timestamp

### Halls
- `id`: Primary key
- `name`: Hall name
- `city`: City location
- `state`: State location
- `latitude`: GPS latitude
- `longitude`: GPS longitude
- `location`: Full address
- `capacity`: Maximum capacity
- `price_per_hour`: Hourly rate
- `description`: Hall description
- `image_url`: Hall image URL

### Bookings
- `id`: Primary key
- `user_id`: Foreign key to Users
- `hall_id`: Foreign key to Halls
- `booking_ref`: Unique booking reference
- `start_time`: Booking start time
- `end_time`: Booking end time
- `guests`: Number of guests
- `note`: Additional notes
- `amount`: Base amount
- `tax`: Tax amount (18% GST)
- `service_fee`: Service fee (₹300)
- `total_price`: Total amount
- `status`: Booking status (pending/confirmed/cancelled)
- `created_at`: Booking creation timestamp

### Events
- `id`: Primary key
- `title`: Event title
- `category`: Event category
- `description`: Event description
- `date`: Event date
- `hall_id`: Foreign key to Halls

### Contact Messages
- `id`: Primary key
- `name`: Sender name
- `email`: Sender email
- `subject`: Message subject
- `message`: Message content
- `created_at`: Submission timestamp
- `resolved`: Resolution status

## 👥 User Roles

### Regular User
- Browse and search halls
- Create and manage own bookings
- View personal dashboard and analytics
- Submit contact messages
- View events

### Administrator
- All user capabilities
- Manage halls (CRUD operations)
- View and manage all bookings
- Manage user accounts and roles
- Create events
- View contact messages
- Access system-wide analytics

## 📁 Project Structure

```
EVENT/
│
├── backend/                    # Backend application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI application entry point
│   │   ├── database.py        # Database configuration
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   └── routers/           # API route handlers
│   │       ├── auth.py        # Authentication endpoints
│   │       ├── halls.py       # Hall management endpoints
│   │       ├── bookings.py    # Booking endpoints
│   │       ├── dashboard.py   # Dashboard endpoints
│   │       ├── admin.py       # Admin endpoints
│   │       ├── events.py      # Event endpoints
│   │       └── contact.py     # Contact endpoints
│   │
│   ├── requirements.txt       # Python dependencies
│   ├── create_admin.py        # Admin user creation script
│   ├── recreate_db.py         # Database recreation script
│   ├── seed_halls.py          # Hall data seeding script
│   └── event_booking.db       # SQLite database
│
├── Frontend/                   # Frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Halls.tsx
│   │   │   ├── HallDetail.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── BookingDetail.tsx
│   │   │   ├── Events.tsx
│   │   │   └── Contact.tsx
│   │   ├── context/           # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   ├── lib/               # Utility functions
│   │   ├── App.tsx            # Main application component
│   │   └── main.tsx            # Application entry point
│   │
│   ├── package.json           # Node dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.ts     # Tailwind CSS configuration
│   └── tsconfig.json          # TypeScript configuration
│
├── UseCase_Diagram.png        # System use case diagram
├── UseCase_Diagram_Documentation.md  # Use case documentation
└── README.md                  # This file
```

## 🔑 Key Functionalities

### Booking System
- **Automated Pricing**: Calculates base amount, 18% GST, and ₹300 service fee
- **Unique References**: Generates unique booking references (e.g., BK-1733123456-1)
- **Time Validation**: Prevents double-booking of halls
- **Status Management**: Tracks booking lifecycle (pending → confirmed/cancelled)

### Authentication & Security
- **Session-based Authentication**: Secure cookie and header-based sessions
- **Password Hashing**: Uses bcrypt for password encryption
- **Session Expiry**: 7 days for users, 1 day for admins
- **CORS Protection**: Configured for localhost development

### Dashboard Analytics
- **User Dashboard**:
  - Total bookings and spending
  - Most frequently used hall
  - Monthly booking trends
  - Hall usage distribution
  - Revenue over time

- **Admin Dashboard**:
  - Total users, bookings, and revenue
  - Recent bookings list
  - Quick action buttons
  - System-wide statistics

### Search & Discovery
- **City-based Search**: Filter halls by city
- **Google Places Integration**: Discover nearby venues
- **Pagination**: Efficient browsing of large datasets
- **Detailed Views**: Comprehensive hall information with images and maps

## 📸 Screenshots

> Add screenshots of your application here to showcase the UI

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🔧 Troubleshooting

### Common Issues

**Backend won't start:**
- Ensure Python virtual environment is activated
- Check all dependencies are installed: `pip install -r requirements.txt`
- Verify database file exists: `python recreate_db.py`

**Frontend won't start:**
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`
- Check Node.js version: `node --version` (should be 16+)

**Database errors:**
- Recreate database: `python recreate_db.py`
- Check file permissions on `event_booking.db`

**API connection errors:**
- Verify backend is running on port 8000
- Check CORS configuration in `backend/app/main.py`
- Ensure frontend proxy is configured correctly in `vite.config.ts`

**Login issues:**
- Clear browser cookies and local storage
- Verify admin user exists: `python create_admin.py`
- Check session expiry settings

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

## 🙏 Acknowledgments

- FastAPI for the excellent Python web framework
- React and Vite for the modern frontend tooling
- Radix UI for accessible component primitives
- Tailwind CSS for utility-first styling
- Google Places API for location services

---


