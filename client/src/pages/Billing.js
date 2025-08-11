import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    customerId: '',
    billNumber: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    laborHours: 0,
    laborRate: 75,
    notes: ''
  });

  const [currentItem, setCurrentItem] = useState({
    partId: '',
    quantity: 1,
    selling_price: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, partsRes] = await Promise.all([
        axios.get('/api/customers'),
        axios.get('/api/parts')
      ]);
      
      setCustomers(customersRes.data);
      setParts(partsRes.data);
      console.log(customersRes.data);
      console.log(partsRes.data);
      
      const billsRes = await axios.get('/api/billing');
      // Map server invoices to grid rows structure expected by the UI
      const mapped = (billsRes.data || []).map((inv) => ({
        id: inv.id,
        billNumber: inv.invoice_number,
        customerName: `${inv.first_name || ''} ${inv.last_name || ''}`.trim(),
        date: inv.date || inv.created_at?.slice(0,10),
        total: Number(inv.total_amount || 0),
        status: "paid"
      }));
      setBills(mapped);
    } catch (error) {
      console.error('Error fetching data:', error);
      setCustomers([
        { id: 1, name: 'John Smith' },
        { id: 2, name: 'Sarah Johnson' },
        { id: 3, name: 'Mike Davis' }
      ]);
      setParts([
        { id: 1, name: 'Brake Pads', selling_price: 25.99 },
        { id: 2, name: 'Oil Filter', selling_price: 8.99 },
        { id: 3, name: 'Air Filter', selling_price: 12.99 }
      ]);
      setBills([
        { 
          id: 1, 
          billNumber: 'INV-001', 
          customerName: 'John Smith',
          date: '2024-01-15',
          total_amount: 156.97,
          status: 'paid'
        },
        { 
          id: 2, 
          billNumber: 'INV-002', 
          customerName: 'Sarah Johnson',
          date: '2024-01-16',
          total_amount: 89.98,
          status: 'pending'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = async (bill = null) => {
    if (bill) {
      try {
        setEditingBill(bill);
        // Fetch full invoice for editing
        const { data: inv } = await axios.get(`/api/billing/${bill.id}`);
        const laborItems = (inv.items || []).filter(i => i.item_type === 'service');
        const laborTotalHours = laborItems.reduce((s, i) => s + (i.quantity || 0), 0);
        const laborRate = laborItems.length > 0 ? (laborItems[0].unit_price || 0) : 75;
        const partItems = (inv.items || []).filter(i => i.item_type === 'part');
        const mappedItems = partItems.map(i => ({
          id: i.id,
          partId: i.item_id,
          partName: i.item_name || i.description,
          quantity: i.quantity,
          selling_price: i.unit_price,
          total: (i.total_price || (i.unit_price * i.quantity))
        }));
        setFormData({
          customerId: inv.customer_id || bill.customerId || '',
          billNumber: inv.invoice_number || bill.billNumber || '',
          date: inv.date || bill.date || new Date().toISOString().split('T')[0],
          items: mappedItems,
          laborHours: laborTotalHours,
          laborRate: laborRate,
          notes: inv.notes || ''
        });
      } catch (e) {
        // Fallback to minimal editing if fetch fails
        setFormData({
          customerId: bill.customerId || '',
          billNumber: bill.billNumber || '',
          date: bill.date || new Date().toISOString().split('T')[0],
          items: [],
          laborHours: 0,
          laborRate: 75,
          notes: ''
        });
      }
    } else {
      setEditingBill(null);
      setFormData({
        customerId: '',
        billNumber: '',
        date: new Date().toISOString().split('T')[0],
        items: [],
        laborHours: 0,
        laborRate: 75,
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBill(null);
    setFormData({
      customerId: '',
      billNumber: '',
      date: new Date().toISOString().split('T')[0],
      items: [],
      laborHours: 0,
      laborRate: 75,
      notes: ''
    });
    setCurrentItem({ partId: '', quantity: 1, selling_price: 0 });
  };

  const addItem = () => {
    if (currentItem.partId && currentItem.quantity > 0) {
      const part = parts.find(p => p.id === currentItem.partId);
      if (part) {
        const newItem = {
          id: Date.now(),
          partId: currentItem.partId,
          partName: part.name,
          quantity: currentItem.quantity,
          selling_price: part.selling_price || 0, // Default to 0 if selling_price is undefined
          total: (part.selling_price || 0) * currentItem.quantity
        };
        
        setFormData({
          ...formData,
          items: [...formData.items, newItem]
        });
        
        setCurrentItem({ partId: '', quantity: 1, selling_price: 0 });
      } else {
        console.warn('No part found for partId:', currentItem.partId);
      }
    }
  };

  const removeItem = (itemId) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId)
    });
  };

  const calculateTotal = () => {
    const partsTotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const laborTotal = (formData.laborHours || 0) * (formData.laborRate || 0);
    return partsTotal + laborTotal;
  };

  const handleSubmit = async () => {
    try {
      const billData = {
        customerId: formData.customerId,
        billNumber: formData.billNumber,
        date: formData.date,
        notes: formData.notes,
        laborHours: formData.laborHours,
        laborRate: formData.laborRate,
        items: formData.items.map(i => ({ partId: i.partId, quantity: i.quantity, selling_price: i.selling_price }))
      };

      if (editingBill) {
        await axios.put(`/api/billing/${editingBill.id}`, billData);
        setSnackbar({ open: true, message: 'Bill updated successfully!', severity: 'success' });
      } else {
        await axios.post('/api/billing', billData);
        setSnackbar({ open: true, message: 'Bill created successfully!', severity: 'success' });
      }
      
      handleCloseDialog();
      fetchData();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Operation failed', 
        severity: 'error' 
      });
    }
  };

  const columns = [
    { field: 'billNumber', headerName: 'Bill Number', flex: 1, minWidth: 120 },
    { field: 'customerName', headerName: 'Customer', flex: 1, minWidth: 150 },
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'total', headerName: 'Total ($)', width: 120, type: 'number',
      valueFormatter: (params) => `$${params.value?.toFixed(2) || '0.00'}` },
    { field: 'status', headerName: 'Status', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button
            size="small"
            onClick={() => handleOpenDialog(params.row)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
          <Button
            size="small"
            sx={{ ml: 1 }}
            onClick={() => window.open(`/api/billing/${params.row.id}/receipt`, '_blank')}
          >
            Receipt
          </Button>
        </Box>
      )
    }
  ];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await axios.delete(`/api/billing/${id}`);
        setSnackbar({ open: true, message: 'Bill deleted successfully!', severity: 'success' });
        fetchData();
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: error.response?.data?.message || 'Delete failed', 
          severity: 'error' 
        });
    }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Billing & Invoices
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Bill
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={bills}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #e0e0e0'
            }
          }}
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingBill ? 'Edit Bill' : 'Create New Bill'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Customer</InputLabel>
                  <Select
                    name="customerId"
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    label="Customer"
                  >
                    {customers.map(customer => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.name || `${customer.first_name} ${customer.last_name}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bill Number"
                  name="billNumber"
                  value={formData.billNumber}
                  onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Labor Hours"
                  name="laborHours"
                  type="number"
                  value={formData.laborHours}
                  onChange={(e) => setFormData({ ...formData, laborHours: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Labor Rate ($/hr)"
                  name="laborRate"
                  type="number"
                  value={formData.laborRate}
                  onChange={(e) => setFormData({ ...formData, laborRate: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Parts & Services
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Part</InputLabel>
                    <Select
                      value={currentItem.partId}
                      onChange={(e) => {
                        const part = parts.find(p => p.id === e.target.value);
                        setCurrentItem({ 
                          partId: e.target.value, 
                          quantity: 1, 
                          selling_price: part?.selling_price || 0 
                        });
                      }}
                      label="Part"
                    >
                      {parts.map(part => (
                        <MenuItem key={part.id} value={part.id}>
                          {part.name} - ${part.selling_price || 0}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    variant="contained"
                    onClick={addItem}
                    disabled={!currentItem.partId}
                    sx={{ mt: 1 }}
                  >
                    Add Item
                  </Button>
                </Grid>
              </Grid>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Part</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>selling_price</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.partName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.selling_price}</TableCell>
                        <TableCell>${(item.total || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeItem(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Typography variant="h6">
                  Total: ${(calculateTotal() || 0).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBill ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Billing;