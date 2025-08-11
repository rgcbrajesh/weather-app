# Garage Management System

A comprehensive garage management system built with React, Node.js, and MySQL. This system provides complete inventory management, customer tracking, billing, and reporting capabilities for automotive repair shops.

## Features

### 🔐 Authentication & Authorization
- Secure login system with JWT tokens
- Role-based access control (Admin/Staff)
- Protected routes and middleware

### 📊 Dashboard
- Real-time statistics and metrics
- Revenue and billing charts
- Recent activity tracking
- Responsive design with Material-UI

### 🏷️ Parts Inventory Management
- Add, edit, and delete parts
- Track stock levels and minimum thresholds
- Categorize parts by type
- Supplier information management
- Low stock alerts

### 👥 Customer Management
- Comprehensive customer profiles
- Vehicle information tracking
- Contact details and address management
- Customer history and billing records

### 💰 Billing & Invoicing
- Create detailed invoices
- Parts and labor cost calculation
- Multiple payment statuses
- Bill history and management
- Automatic stock updates

### 📈 Reports & Analytics
- Sales and revenue reports
- Parts performance analytics
- Customer growth metrics
- Inventory value reports
- Export functionality

### 👤 User Management
- Staff and admin user creation
- Role assignment and permissions
- Password management
- User activity tracking

### 📱 SMS Notifications
- Twilio integration for SMS alerts
- Low stock notifications
- Customer communication

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Material-UI (MUI)** - Professional UI components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization charts
- **Date-fns** - Date manipulation utilities

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Multer** - File upload handling
- **Twilio** - SMS service
- **Nodemailer** - Email service
- **Moment** - Date utilities

### Database
- **MySQL** - Relational database
- **Connection pooling** - Optimized database connections
- **Automatic table creation** - Self-initializing schema

## Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn** package manager

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd weather-app
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=garage_management
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=24h

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Database Setup
1. Start your MySQL server
2. Create a database named `garage_management` (or use the name in your .env file)
3. The application will automatically create all necessary tables on first run

### 5. Run the Application

#### Development Mode
```bash
# Terminal 1: Start backend server
npm run dev

# Terminal 2: Start frontend development server
npm run client
```

#### Production Mode
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## Default Login Credentials

- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Administrator

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/profile` - Get current user profile

### Parts Management
- `GET /api/parts` - Get all parts
- `POST /api/parts` - Add new part
- `PUT /api/parts/:id` - Update part
- `DELETE /api/parts/:id` - Delete part
- `GET /api/parts/low-stock` - Get low stock parts

### Customer Management
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Add new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Billing
- `GET /api/billing` - Get all bills
- `POST /api/billing` - Create new bill
- `PATCH /api/billing/:id/status` - Update bill status
- `DELETE /api/billing/:id` - Delete bill

### Reports
- `GET /api/reports/monthly-sales` - Monthly sales report
- `GET /api/reports/top-selling-parts` - Top selling parts
- `GET /api/reports/inventory-value` - Inventory value report
- `GET /api/reports/customer-analytics` - Customer analytics

### User Management
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Project Structure

```
weather-app/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json       # Frontend dependencies
├── config/                 # Configuration files
│   └── database.js        # Database configuration
├── middleware/             # Express middleware
│   └── auth.js            # Authentication middleware
├── routes/                 # API routes
│   ├── auth.js            # Authentication routes
│   ├── parts.js           # Parts management routes
│   ├── customers.js       # Customer management routes
│   ├── billing.js         # Billing routes
│   ├── reports.js         # Reporting routes
│   └── users.js           # User management routes
├── services/               # External services
│   └── smsService.js      # SMS service (Twilio)
├── server.js               # Main server file
├── package.json            # Backend dependencies
└── .env                    # Environment variables
```

## Features in Detail

### Dashboard
- **Statistics Cards**: Display total parts, customers, bills, and monthly revenue
- **Revenue Chart**: Bar chart showing monthly revenue and bill counts
- **Recent Activity**: Latest system activities and alerts
- **Responsive Design**: Works on all device sizes

### Parts Management
- **Data Grid**: Sortable and searchable parts table
- **CRUD Operations**: Full create, read, update, delete functionality
- **Stock Tracking**: Automatic stock level monitoring
- **Category Management**: Organized part categorization
- **Supplier Information**: Track part suppliers and costs

### Customer Management
- **Customer Profiles**: Complete customer information storage
- **Vehicle Details**: Track customer vehicle information
- **Contact Management**: Phone, email, and address storage
- **Billing History**: Link customers to their invoices

### Billing System
- **Invoice Creation**: Generate detailed invoices with parts and labor
- **Cost Calculation**: Automatic total calculation
- **Stock Updates**: Real-time inventory updates when bills are created
- **Status Tracking**: Track payment status (pending, paid, cancelled)
- **Customer Linking**: Associate bills with customers

### Reporting System
- **Sales Reports**: Monthly revenue and profit analysis
- **Parts Analytics**: Top-selling parts and category breakdown
- **Customer Insights**: Customer growth and spending patterns
- **Inventory Reports**: Stock value and low stock alerts
- **Export Functionality**: Download reports in various formats

### User Management
- **Role-Based Access**: Admin and staff user roles
- **Permission Control**: Different access levels for different functions
- **User Creation**: Add new staff members
- **Password Management**: Secure password handling

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Input Validation**: Comprehensive input sanitization
- **Role-Based Access**: Protected routes and endpoints
- **SQL Injection Prevention**: Parameterized queries

## Performance Features

- **Database Connection Pooling**: Optimized database connections
- **React Optimization**: Efficient component rendering
- **Material-UI**: Optimized UI components
- **Responsive Design**: Mobile-first approach

## Deployment

### Heroku Deployment
The project includes Heroku deployment configuration:
```bash
npm run heroku-postbuild
```

### Environment Variables
Make sure to set all required environment variables in your production environment.

### Database
For production, use a managed MySQL service like:
- AWS RDS
- Google Cloud SQL
- Heroku Postgres (with MySQL adapter)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

## Roadmap

- [ ] Email notifications
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] Integration with accounting software
- [ ] Customer portal
- [ ] Appointment scheduling
- [ ] Work order management
- [ ] Multi-location support

---

**Note**: This is a production-ready garage management system with comprehensive features for automotive repair shops. The system includes all necessary security measures, validation, and error handling for professional use.
