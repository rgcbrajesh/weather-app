const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const partsRoutes = require('./routes/parts');
const customerRoutes = require('./routes/customers');
const billingRoutes = require('./routes/billing');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');

// Import middleware
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = require('./config/database');

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    await db.initializeDatabase();
    
    // Test database connection
    db.getConnection((err, connection) => {
      if (err) {
        console.error('Database connection failed:', err);
        return;
      }
      console.log('Database connected successfully');
      connection.release();
    });

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/parts', authenticateToken, partsRoutes);
    app.use('/api/customers', authenticateToken, customerRoutes);
    app.use('/api/billing', authenticateToken, billingRoutes);
    app.use('/api/reports', authenticateToken, reportRoutes);
    app.use('/api/users', authenticateToken, userRoutes);

    // Serve static assets in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static('client/build'));
      
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
      });
    }

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Something went wrong!' });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
