const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const [customers] = await db.query('SELECT * FROM customers ORDER BY first_name, last_name');
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const [customers] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (customers.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customers[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer' });
  }
});

// Add new customer
router.post('/', [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, phone, address, city, state, zip_code, vehicle_info, notes } = req.body;

    const [result] = await db.query(
      'INSERT INTO customers (first_name, last_name, email, phone, address, city, state, zip_code, vehicle_info, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, address, city, state, zip_code, vehicle_info, notes]
    );

    const [newCustomer] = await db.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    res.status(201).json(newCustomer[0]);
  } catch (error) {
    console.error('Error adding customer:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Phone number already exists' });
    } else {
      res.status(500).json({ message: 'Error adding customer' });
    }
  }
});

// Update customer
router.put('/:id', [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, phone, address, city, state, zip_code, vehicle_info, notes } = req.body;
    const customerId = req.params.id;

    // Check if phone number already exists for other customers
    const [existingCustomers] = await db.query(
      'SELECT id FROM customers WHERE phone = ? AND id != ?',
      [phone, customerId]
    );

    if (existingCustomers.length > 0) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    await db.query(
      'UPDATE customers SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ?, vehicle_info = ?, notes = ? WHERE id = ?',
      [first_name, last_name, email, phone, address, city, state, zip_code, vehicle_info, notes, customerId]
    );

    const [updatedCustomer] = await db.query('SELECT * FROM customers WHERE id = ?', [customerId]);
    res.json(updatedCustomer[0]);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Error updating customer' });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customerId = req.params.id;

    // Check if customer has any jobs
    const [jobs] = await db.query(
      'SELECT COUNT(*) as count FROM jobs WHERE customer_id = ?',
      [customerId]
    );

    if (jobs[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete customer as they have job records' 
      });
    }

    await db.query('DELETE FROM customers WHERE id = ?', [customerId]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer' });
  }
});

// Search customers
router.get('/search/:query', async (req, res) => {
  try {
    const query = `%${req.params.query}%`;
    const [customers] = await db.query(
      'SELECT * FROM customers WHERE first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ? ORDER BY first_name, last_name',
      [query, query, query, query]
    );
    res.json(customers);
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ message: 'Error searching customers' });
  }
});

// Get customer job history
router.get('/:id/jobs', async (req, res) => {
  try {
    const customerId = req.params.id;
    const [jobs] = await db.query(
      'SELECT * FROM jobs WHERE customer_id = ? ORDER BY start_date DESC',
      [customerId]
    );
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching customer jobs:', error);
    res.status(500).json({ message: 'Error fetching customer jobs' });
  }
});

// Get customers by vehicle info
router.get('/vehicle/:info', async (req, res) => {
  try {
    const info = req.params.info;
    const [customers] = await db.query(
      'SELECT * FROM customers WHERE vehicle_info LIKE ? ORDER BY first_name, last_name',
      [`%${info}%`]
    );
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers by vehicle info:', error);
    res.status(500).json({ message: 'Error fetching customers by vehicle info' });
  }
});

module.exports = router;
