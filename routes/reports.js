const express = require('express');
const db = require('../config/database');
const { requireAdmin } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// Get sales report
router.get('/sales', async (req, res) => {
  try {
    // Check if there are any paid invoices first
    const [invoiceCount] = await db.query('SELECT COUNT(*) as count FROM invoices WHERE status = "paid"');
    
    if (invoiceCount[0].count === 0) {
      return res.json({
        sales: [],
        summary: {
          total_revenue: 0,
          total_invoices: 0,
          average_invoice: 0
        }
      });
    }

    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT i.*, j.description as job_description, c.first_name, c.last_name, u.username as created_by
      FROM invoices i
      JOIN jobs j ON i.job_id = j.id
      JOIN customers c ON j.customer_id = c.id
      JOIN users u ON j.user_id = u.id
      WHERE i.status = 'paid'
    `;
    
    const params = [];
    if (startDate && endDate) {
      query += ' AND i.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY i.date DESC';
    
    const [sales] = await db.query(query, params);
    
    const totalRevenue = sales.reduce((sum, invoice) => sum + parseFloat(invoice.total_amount), 0);
    const totalInvoices = sales.length;
    
    res.json({
      sales,
      summary: {
        total_revenue: totalRevenue,
        total_invoices: totalInvoices,
        average_invoice: totalInvoices > 0 ? totalRevenue / totalInvoices : 0
      }
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ message: 'Error fetching sales report' });
  }
});

// Get monthly summary
router.get('/monthly-summary', async (req, res) => {
  try {
    // Check if there are any invoices first
    const [invoiceCount] = await db.query('SELECT COUNT(*) as count FROM invoices');
    
    if (invoiceCount[0].count === 0) {
      // Return empty monthly data for the current year
      const currentYear = new Date().getFullYear();
      const emptyMonthlyData = [];
      
      for (let month = 1; month <= 12; month++) {
        emptyMonthlyData.push({
          month: month,
          total_invoices: 0,
          total_revenue: 0,
          average_invoice: 0
        });
      }
      
      return res.json(emptyMonthlyData);
    }

    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    const [monthlySummary] = await db.query(`
      SELECT 
        MONTH(date) as month,
        COUNT(*) as total_invoices,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_invoice
      FROM invoices 
      WHERE YEAR(date) = ? AND status = 'paid'
      GROUP BY MONTH(date)
      ORDER BY month
    `, [currentYear]);
    
    res.json(monthlySummary);
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ message: 'Error fetching monthly summary' });
  }
});

// Get parts usage report
router.get('/parts-usage', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        p.name as part_name,
        p.part_number,
        p.category,
        SUM(ii.quantity) as total_used,
        SUM(ii.total_price) as total_revenue,
        COUNT(DISTINCT i.id) as invoices_count
      FROM invoice_items ii
      JOIN parts p ON ii.item_id = p.id
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.status = 'paid' AND ii.item_type = 'part'
    `;
    
    const params = [];
    if (startDate && endDate) {
      query += ' AND i.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += `
      GROUP BY p.id, p.name, p.part_number, p.category
      ORDER BY total_used DESC
    `;
    
    const [topParts] = await db.query(query, params);
    
    res.json(topParts);
  } catch (error) {
    console.error('Error fetching parts usage report:', error);
    res.status(500).json({ message: 'Error fetching parts usage report' });
  }
});

// Get inventory report
router.get('/inventory', async (req, res) => {
  try {
    const [inventory] = await db.query(`
      SELECT 
        p.*,
        CASE 
          WHEN p.stock_quantity <= p.min_stock_level THEN 'Low Stock'
          WHEN p.stock_quantity <= p.min_stock_level * 2 THEN 'Medium Stock'
          ELSE 'Good Stock'
        END as stock_status
      FROM parts p
      ORDER BY p.stock_quantity ASC
    `);
    
    const lowStockCount = inventory.filter(item => item.stock_quantity <= item.min_stock_level).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.stock_quantity * item.cost_price), 0);
    
    res.json({
      inventory,
      summary: {
        total_parts: inventory.length,
        low_stock_count: lowStockCount,
        total_inventory_value: totalValue
      }
    });
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({ message: 'Error fetching inventory report' });
  }
});

// Get customer report
router.get('/customers', async (req, res) => {
  try {
    // Check if there are any customers first
    const [customerCount] = await db.query('SELECT COUNT(*) as count FROM customers');
    
    if (customerCount[0].count === 0) {
      return res.json({
        customers: [],
        summary: {
          total_customers: 0,
          active_customers: 0,
          total_revenue: 0,
          average_customer_value: 0
        }
      });
    }

    // First get all customers
    const [customers] = await db.query('SELECT * FROM customers ORDER BY id');
    
    // Since there are no jobs or invoices yet, return customers with default values
    const summary = customers.map(customer => ({
      ...customer,
      total_invoices: 0,
      total_spent: 0,
      last_visit: null
    }));
    
    const totalCustomers = summary.length;
    const activeCustomers = summary.filter(c => c.total_invoices > 0).length;
    const totalRevenue = summary.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    
    res.json({
      customers: summary,
      summary: {
        total_customers: totalCustomers,
        active_customers: activeCustomers,
        total_revenue: totalRevenue,
        average_customer_value: activeCustomers > 0 ? totalRevenue / activeCustomers : 0
      }
    });
  } catch (error) {
    console.error('Error fetching customer report:', error);
    res.status(500).json({ message: 'Error fetching customer report' });
  }
});

// Get top customers
router.get('/top-customers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const [topCustomers] = await db.query(`
      SELECT 
        c.first_name,
        c.last_name,
        c.phone,
        c.email,
        COUNT(i.id) as total_invoices,
        SUM(i.total_amount) as total_spent,
        AVG(i.total_amount) as average_invoice
      FROM customers c
      JOIN jobs j ON c.id = j.customer_id
      JOIN invoices i ON j.id = i.job_id
      WHERE i.status = 'paid'
      GROUP BY c.id
      ORDER BY total_spent DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    res.json(topCustomers);
  } catch (error) {
    console.error('Error fetching top customers:', error);
    res.status(500).json({ message: 'Error fetching top customers' });
  }
});

// Get customer count by vehicle info
router.get('/customers-by-vehicle', async (req, res) => {
  try {
    const [customerCount] = await db.query(`
      SELECT 
        vehicle_info,
        COUNT(*) as customer_count
      FROM customers
      WHERE vehicle_info IS NOT NULL AND vehicle_info != ''
      GROUP BY vehicle_info
      ORDER BY customer_count DESC
    `);
    
    res.json(customerCount);
  } catch (error) {
    console.error('Error fetching customer count by vehicle:', error);
    res.status(500).json({ message: 'Error fetching customer count by vehicle' });
  }
});

// Get low stock alert
router.get('/low-stock-alert', async (req, res) => {
  try {
    const [lowStockParts] = await db.query(`
      SELECT 
        p.*,
        (p.min_stock_level - p.stock_quantity) as needed_quantity
      FROM parts p
      WHERE p.stock_quantity <= p.min_stock_level
      ORDER BY (p.min_stock_level - p.stock_quantity) DESC
    `);
    
    res.json({
      low_stock_parts: lowStockParts,
      total_low_stock: lowStockParts.length
    });
  } catch (error) {
    console.error('Error fetching low stock alert:', error);
    res.status(500).json({ message: 'Error fetching low stock alert' });
  }
});

// Get revenue trends
router.get('/revenue-trends', async (req, res) => {
  try {
    // Check if there are any paid invoices first
    const [invoiceCount] = await db.query('SELECT COUNT(*) as count FROM invoices WHERE status = "paid"');
    
    if (invoiceCount[0].count === 0) {
      return res.json([]);
    }

    const { months = 12 } = req.query;
    
    const [trends] = await db.query(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        COUNT(*) as total_invoices,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_invoice
      FROM invoices
      WHERE status = 'paid' AND date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
    `, [parseInt(months)]);
    
    res.json(trends);
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    res.status(500).json({ message: 'Error fetching revenue trends' });
  }
});

module.exports = router;
