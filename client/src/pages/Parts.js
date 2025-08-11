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
  Grid
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const Parts = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    name: '',
    part_number: '',
    category: '',
    stock_quantity: '',
    selling_price: '',
    supplier: '',
    min_stock_level: ''
  });

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      console.log('Fetching parts from API...');
      const response = await axios.get('/api/parts');
      console.log('API response:', response.data);
      setParts(response.data);
    } catch (error) {
      console.error('Error fetching parts:', error);
      console.log('Using mock data as fallback...');
      // Use mock data for demo
      setParts([
        { id: 1, name: 'Brake Pads', part_number: 'BP001', category: 'Brakes', stock_quantity: 45, selling_price: 25.99, supplier: 'AutoZone', min_stock_level: 10 },
        { id: 2, name: 'Oil Filter', part_number: 'OF002', category: 'Engine', stock_quantity: 32, selling_price: 8.99, supplier: 'NAPA', min_stock_level: 15 },
        { id: 3, name: 'Air Filter', part_number: 'AF003', category: 'Engine', stock_quantity: 28, selling_price: 12.99, supplier: 'NAPA', min_stock_level: 12 },
        { id: 4, name: 'Spark Plugs', part_number: 'SP004', category: 'Engine', stock_quantity: 60, selling_price: 4.99, supplier: 'AutoZone', min_stock_level: 20 },
        { id: 5, name: 'Windshield Wipers', part_number: 'WW005', category: 'Exterior', stock_quantity: 18, selling_price: 15.99, supplier: 'O\'Reilly', min_stock_level: 8 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (part = null) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        name: part.name,
        part_number: part.part_number,
        category: part.category,
        stock_quantity: part.stock_quantity,
        selling_price: part.selling_price,
        supplier: part.supplier,
        min_stock_level: part.min_stock_level
      });
    } else {
      setEditingPart(null);
      setFormData({
        name: '',
        part_number: '',
        category: '',
        stock_quantity: '',
        selling_price: '',
        supplier: '',
        min_stock_level: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPart(null);
    setFormData({
      name: '',
      part_number: '',
      category: '',
      stock_quantity: '',
      selling_price: '',
      supplier: '',
      min_stock_level: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingPart) {
        await axios.put(`/api/parts/${editingPart.id}`, formData);
        setSnackbar({ open: true, message: 'Part updated successfully!', severity: 'success' });
      } else {
        await axios.post('/api/parts', formData);
        setSnackbar({ open: true, message: 'Part added successfully!', severity: 'success' });
      }
      
      handleCloseDialog();
      fetchParts();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Operation failed', 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      try {
        await axios.delete(`/api/parts/${id}`);
        setSnackbar({ open: true, message: 'Part deleted successfully!', severity: 'success' });
        fetchParts();
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: error.response?.data?.message || 'Delete failed', 
          severity: 'error' 
        });
      }
    }
  };

  const columns = [
    { field: 'name', headerName: 'Part Name', flex: 1, minWidth: 150 },
    { field: 'part_number', headerName: 'Part Number', width: 130 },
    { field: 'category', headerName: 'Category', width: 120 },
    { field: 'stock_quantity', headerName: 'Quantity', width: 100, type: 'number' },
    { field: 'selling_price', headerName: 'Price ($)', width: 120, type: 'number', 
      valueFormatter: (params) => {
        if (params.value != null && !isNaN(params.value)) {
          return `$${Number(params.value).toFixed(2)}`;
        }
        return '$0.00';
      } },
    { field: 'supplier', headerName: 'Supplier', width: 150 },
    { field: 'min_stock_level', headerName: 'Min Stock', width: 100, type: 'number' },
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
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Parts Inventory
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Part
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={parts}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPart ? 'Edit Part' : 'Add New Part'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Part Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Part Number"
                  name="part_number"
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Category"
                  >
                    <MenuItem value="Brakes">Brakes</MenuItem>
                    <MenuItem value="Engine">Engine</MenuItem>
                    <MenuItem value="Exterior">Exterior</MenuItem>
                    <MenuItem value="Interior">Interior</MenuItem>
                    <MenuItem value="Suspension">Suspension</MenuItem>
                    <MenuItem value="Electrical">Electrical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price ($)"
                  name="selling_price"
                  type="number"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Minimum Stock Level"
                  name="min_stock_level"
                  type="number"
                  value={formData.min_stock_level}
                  onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPart ? 'Update' : 'Add'}
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

export default Parts;
