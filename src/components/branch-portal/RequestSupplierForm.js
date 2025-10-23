import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

// Theme provider for RTL support
import { createTheme, ThemeProvider } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const theme = createTheme({
  direction: 'rtl',
});

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

function RequestSupplierForm({ open, onClose, onSuccess, userId, branchId }) {
  const [formData, setFormData] = useState({
    supplier_name: '',
    poc_name: '',
    poc_email: '',
    poc_phone: '',
    justification: ''
  });
  const [supplierFields, setSupplierFields] = useState([]);
  const [selectedField, setSelectedField] = useState('');
  const [newField, setNewField] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      axios.get('http://localhost:5000/api/supplier-fields')
        .then(response => {
          setSupplierFields(response.data);
        })
        .catch(err => {
          console.error("Failed to fetch supplier fields:", err);
          setError("שגיאה בטעינת תחומי הספקים.");
        });
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFieldChange = (event) => {
    setSelectedField(event.target.value);
  };

  const handleSubmit = async () => {
    setError('');
    try {
      await axios.post('http://localhost:5000/api/supplier-requests', {
        ...formData,
        requested_by_user_id: userId,
        branch_id: branchId,
        supplier_field_id: selectedField === 'new' ? null : selectedField,
        new_supplier_field: selectedField === 'new' ? newField : null,
      });
      onSuccess();
    } catch (err) {
      console.error("Failed to submit request:", err);
      setError('הגשת הבקשה נכשלה, אנא נסה שוב.');
    }
  };

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
          <DialogTitle>בקשה להוספת ספק חדש</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" name="supplier_name" label="שם הספק" type="text" fullWidth variant="outlined" onChange={handleChange} required />
            
            <FormControl fullWidth margin="dense" required>
              <InputLabel id="supplier-field-label">תחום הספק</InputLabel>
              <Select
                labelId="supplier-field-label"
                value={selectedField}
                label="תחום הספק"
                onChange={handleFieldChange}
              >
                {supplierFields.map((fieldOption) => (
                  <MenuItem key={fieldOption.supplier_field_id} value={fieldOption.supplier_field_id}>
                    {/* THE FIX IS HERE: Changed 'field_of_work' to 'field' */}
                    {fieldOption.field}
                  </MenuItem>
                ))}
                <MenuItem value="new">אחר (תחום חדש)</MenuItem>
              </Select>
            </FormControl>

            {selectedField === 'new' && (
              <TextField 
                margin="dense" 
                name="new_field" 
                label="שם התחום החדש" 
                type="text" 
                fullWidth 
                variant="outlined" 
                value={newField}
                onChange={(e) => setNewField(e.target.value)} 
                required 
              />
            )}

            <TextField margin="dense" name="poc_name" label="שם איש קשר" type="text" fullWidth variant="outlined" onChange={handleChange} />
            <TextField margin="dense" name="poc_email" label="אימייל איש קשר" type="email" fullWidth variant="outlined" onChange={handleChange} />
            <TextField margin="dense" name="poc_phone" label="טלפון איש קשר" type="tel" fullWidth variant="outlined" onChange={handleChange} />
            <TextField margin="dense" name="justification" label="נימוק לבקשה (למה צריך את הספק?)" type="text" fullWidth multiline rows={3} variant="outlined" onChange={handleChange} required />
            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>ביטול</Button>
            <Button onClick={handleSubmit} variant="contained">שלח בקשה</Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default RequestSupplierForm;

