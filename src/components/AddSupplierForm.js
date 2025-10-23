import React, { useState } from 'react';
import axios from 'axios';

function AddSupplierForm({ onSupplierAdded }) {
  const [formData, setFormData] = useState({
    supplier_id: '',
    name: '',
    address_id: 1, 
    poc_name: '',
    poc_phone: '',
    poc_email: '',
    supplier_field_id: 1, 
    payment_terms_id: 1, 
    status: 'pending'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/suppliers', formData);
      onSupplierAdded(response.data); 
      alert('Supplier added successfully!');
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('Failed to add supplier.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
      <h3>הוספת ספק חדש</h3>
      <input name="supplier_id" value={formData.supplier_id} onChange={handleChange} placeholder="Supplier ID" required />
      <input name="name" value={formData.name} onChange={handleChange} placeholder="שם הספק" required />
      <input name="poc_name" value={formData.poc_name} onChange={handleChange} placeholder="איש קשר" required />
      <input name="poc_phone" value={formData.poc_phone} onChange={handleChange} placeholder="טלפון איש קשר" required />
      <input name="poc_email" value={formData.poc_email} onChange={handleChange} placeholder="אימייל איש קשר" required type="email" />
      <button type="submit">הוסף ספק</button>
    </form>
  );
}

export default AddSupplierForm;