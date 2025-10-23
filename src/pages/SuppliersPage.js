import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // שימוש במחזיק המפתחות האוטומטי
import SuppliersTable from '../components/SuppliersTable';
import SupplierSearch from '../components/suppliers/SupplierSearch';
import SupplierDetailsCard from '../components/suppliers/SupplierDetailsCard';
import AddSupplierForm from '../components/AddSupplierForm';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [supplierFields, setSupplierFields] = useState([]); // State for supplier fields list
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('name');
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchSuppliers = (criteria = '', query = '') => {
    setLoading(true);
    api.get(`/suppliers/search`, {
      params: { criteria: criteria.trim(), query: query.trim() }
    })
      .then(response => {
        setSuppliers(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the suppliers!", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Function to fetch the list of supplier fields for the dropdowns
  const fetchSupplierFields = () => {
    api.get('/supplier-fields')
        .then(response => setSupplierFields(response.data))
        .catch(error => console.error("Error fetching supplier fields", error));
  };

  useEffect(() => {
    fetchSuppliers();
    fetchSupplierFields(); // Fetch fields on component load
  }, []);

  const handleSearch = () => {
    fetchSuppliers(searchCriteria, searchQuery);
  };

  const handleSupplierAdded = () => {
    fetchSuppliers();
    setShowAddForm(false);
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm(`האם אתה בטוח שברצונך להעביר לארכיון את ספק מספר ${id}?`)) {
      try {
        await api.delete(`/suppliers/${id}`);
        fetchSuppliers();
        alert('הספק הועבר לארכיון בהצלחה');
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('הפעולה נכשלה.');
      }
    }
  };
  
  const handleEditClick = (supplier) => {
    setCurrentUser(supplier);
    setIsEditing(true);
  };

  const handleUpdateSupplier = async () => {
    if (!currentUser) return;
    try {
      const response = await api.put(`/suppliers/${currentUser.supplier_id}`, currentUser);
      fetchSuppliers();
      setIsEditing(false);
      if (selectedSupplier && selectedSupplier.supplier_id === currentUser.supplier_id) {
          setSelectedSupplier(response.data);
      }
      setCurrentUser(null);
      alert('הספק עודכן בהצלחה');
    } catch (error) {
      console.error('Error updating supplier:', error);
      alert('נכשל בעדכון הספק.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">ניהול ספקים</h2>
        {!selectedSupplier && (
           <button 
             onClick={() => setShowAddForm(!showAddForm)}
             className="bg-green-500 text-white hover:bg-green-600 font-bold py-2 px-4 rounded-lg"
           >
             {showAddForm ? 'הסתר טופס' : 'הוסף ספק חדש'}
           </button>
        )}
      </div>

      {showAddForm && <AddSupplierForm onSupplierAdded={handleSupplierAdded} supplierFields={supplierFields} />}

      {selectedSupplier ? (
        <SupplierDetailsCard 
          supplier={selectedSupplier}
          onBackToList={() => setSelectedSupplier(null)}
          onEdit={handleEditClick}
        />
      ) : (
        <>
          <SupplierSearch 
            query={searchQuery}
            setQuery={setSearchQuery}
            criteria={searchCriteria}
            setCriteria={setSearchCriteria}
            onSearch={handleSearch}
          />
          <div className="mt-8">
            {loading ? (
              <p>טוען נתונים...</p>
            ) : (
              <SuppliersTable 
                suppliers={suppliers}
                onDelete={handleDeleteSupplier} 
                onEdit={handleEditClick} 
                onRowClick={setSelectedSupplier}
              />
            )}
          </div>
        </>
      )}

      {/* Edit Supplier Modal - NOW WITH SUPPLIER FIELD DROPDOWN */}
      <Dialog open={isEditing} onClose={() => setIsEditing(false)}>
        <DialogTitle>עריכת ספק</DialogTitle>
        <DialogContent>
          {currentUser && (
            <div className="space-y-4 pt-2">
              <TextField margin="dense" label="שם הספק" type="text" fullWidth name="name" value={currentUser.name || ''} onChange={handleEditChange} />
              <TextField margin="dense" label="איש קשר" type="text" fullWidth name="poc_name" value={currentUser.poc_name || ''} onChange={handleEditChange} />
              <TextField margin="dense" label="טלפון" type="text" fullWidth name="poc_phone" value={currentUser.poc_phone || ''} onChange={handleEditChange} />
              <TextField margin="dense" label="אימייל" type="email" fullWidth name="poc_email" value={currentUser.poc_email || ''} onChange={handleEditChange} />
              
              <FormControl fullWidth margin="dense">
                <InputLabel>תחום ספק</InputLabel>
                <Select name="supplier_field_id" label="תחום ספק" value={currentUser.supplier_field_id || ''} onChange={handleEditChange}>
                  {supplierFields.map(field => (
                    <MenuItem key={field.supplier_field_id} value={field.supplier_field_id}>
                      {field.field}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField margin="dense" label="סטטוס" type="text" fullWidth name="status" value={currentUser.status || ''} onChange={handleEditChange} />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)}>ביטול</Button>
          <Button onClick={handleUpdateSupplier} color="primary">שמור שינויים</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SuppliersPage;

