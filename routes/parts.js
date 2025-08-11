const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { requireAdmin, requireStaff } = require('../middleware/auth');

const router = express.Router();

// Get all parts
router.get('/', async (req, res) => {
  try {
    const [parts] = await db.query('SELECT * FROM parts ORDER BY name');
    res.json(parts);
  } catch (error) {
    console.error('Error fetching parts:', error);
    res.status(500).json({ message: 'Error fetching parts' });
  }
});

// Get part by ID
router.get('/:id', async (req, res) => {
  try {
    const [parts] = await db.query('SELECT * FROM parts WHERE id = ?', [req.params.id]);
    if (parts.length === 0) {
      return res.status(404).json({ message: 'Part not found' });
    }
    res.json(parts[0]);
  } catch (error) {
    console.error('Error fetching part:', error);
    res.status(500).json({ message: 'Error fetching part' });
  }
});

// Add new part
router.post('/', [
  body('name').notEmpty().withMessage('Part name is required'),
  body('part_number').notEmpty().withMessage('Part number is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('selling_price').isFloat({ min: 0 }).withMessage('Valid selling price is required'),
  body('stock_quantity').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
  body('min_stock_level').isInt({ min: 0 }).withMessage('Valid minimum stock level is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, part_number, description, category, brand, supplier, selling_price, stock_quantity, min_stock_level, location } = req.body;
    
    // Set cost_price to selling_price if not provided
    const cost_price = selling_price;

    const [result] = await db.query(
      'INSERT INTO parts (name, part_number, description, category, brand, supplier, cost_price, selling_price, stock_quantity, min_stock_level, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, part_number, description, category, brand, supplier, cost_price, selling_price, stock_quantity, min_stock_level, location]
    );

    const [newPart] = await db.query('SELECT * FROM parts WHERE id = ?', [result.insertId]);
    res.status(201).json(newPart[0]);
  } catch (error) {
    console.error('Error adding part:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Part number already exists' });
    } else {
      res.status(500).json({ message: 'Error adding part' });
    }
  }
});

// Update part
router.put('/:id', [
  body('name').notEmpty().withMessage('Part name is required'),
  body('part_number').notEmpty().withMessage('Part number is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('selling_price').isFloat({ min: 0 }).withMessage('Valid selling price is required'),
  body('stock_quantity').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
  body('min_stock_level').isInt({ min: 0 }).withMessage('Valid minimum stock level is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, part_number, description, category, brand, supplier, selling_price, stock_quantity, min_stock_level, location } = req.body;
    const partId = req.params.id;
    
    // Set cost_price to selling_price if not provided
    const cost_price = selling_price;

    // Check if part number already exists for other parts
    const [existingParts] = await db.query(
      'SELECT id FROM parts WHERE part_number = ? AND id != ?',
      [part_number, partId]
    );

    if (existingParts.length > 0) {
      return res.status(400).json({ message: 'Part number already exists' });
    }

    await db.query(
      'UPDATE parts SET name = ?, part_number = ?, description = ?, category = ?, brand = ?, supplier = ?, cost_price = ?, selling_price = ?, stock_quantity = ?, min_stock_level = ?, location = ? WHERE id = ?',
      [name, part_number, description, category, brand, supplier, cost_price, selling_price, stock_quantity, min_stock_level, location, partId]
    );

    const [updatedPart] = await db.query('SELECT * FROM parts WHERE id = ?', [partId]);
    res.json(updatedPart[0]);
  } catch (error) {
    console.error('Error updating part:', error);
    res.status(500).json({ message: 'Error updating part' });
  }
});

// Delete part
router.delete('/:id', async (req, res) => {
  try {
    const partId = req.params.id;

    // Check if part is used in any job parts
    const [jobParts] = await db.query(
      'SELECT COUNT(*) as count FROM job_parts WHERE part_id = ?',
      [partId]
    );

    if (jobParts[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete part as it is used in job records' 
      });
    }

    await db.query('DELETE FROM parts WHERE id = ?', [partId]);
    res.json({ message: 'Part deleted successfully' });
  } catch (error) {
    console.error('Error deleting part:', error);
    res.status(500).json({ message: 'Error deleting part' });
  }
});

// Update part quantity
router.patch('/:id/quantity', [
  body('stock_quantity').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
  body('type').isIn(['add', 'subtract']).withMessage('Type must be add or subtract')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { stock_quantity, type } = req.body;
    const partId = req.params.id;

    if (type === 'subtract') {
      // Check if we have enough stock
      const [parts] = await db.query(
        'SELECT stock_quantity FROM parts WHERE id = ?',
        [partId]
      );

      if (parts[0].stock_quantity < stock_quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      await db.query(
        'UPDATE parts SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [stock_quantity, partId]
      );
    } else {
      await db.query(
        'UPDATE parts SET stock_quantity = stock_quantity + ? WHERE id = ?',
        [stock_quantity, partId]
      );
    }

    const [updatedPart] = await db.query('SELECT * FROM parts WHERE id = ?', [partId]);
    res.json(updatedPart[0]);
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ message: 'Error updating quantity' });
  }
});

// Search parts
router.get('/search/:query', async (req, res) => {
  try {
    const query = `%${req.params.query}%`;
    const [parts] = await db.query(
      'SELECT * FROM parts WHERE name LIKE ? OR part_number LIKE ? OR category LIKE ? ORDER BY name',
      [query, query, query]
    );
    res.json(parts);
  } catch (error) {
    console.error('Error searching parts:', error);
    res.status(500).json({ message: 'Error searching parts' });
  }
});

// Get low stock parts
router.get('/low-stock/parts', async (req, res) => {
  try {
    const [parts] = await db.query(
      'SELECT * FROM parts WHERE stock_quantity <= min_stock_level ORDER BY stock_quantity ASC'
    );
    res.json(parts);
  } catch (error) {
    console.error('Error fetching low stock parts:', error);
    res.status(500).json({ message: 'Error fetching low stock parts' });
  }
});

module.exports = router;
