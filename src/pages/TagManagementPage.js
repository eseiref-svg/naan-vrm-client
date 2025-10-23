import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // שימוש במחזיק המפתחות האוטומטי

function TagManagementPage() {
  const [supplierFields, setSupplierFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [currentTags, setCurrentTags] = useState('');

  // Fetch all supplier fields when the component mounts
  const fetchSupplierFields = () => {
    setLoading(true);
    api.get('/supplier-fields') // שימוש ב-api במקום ב-axios
      .then(response => {
        setSupplierFields(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching supplier fields:", err);
        setError('שגיאה בטעינת תחומי הספקים.');
        setLoading(false);
      });
  };
  
  useEffect(() => {
    fetchSupplierFields();
  }, []);


  const handleEditClick = (field) => {
    setEditingFieldId(field.supplier_field_id);
    setCurrentTags(field.tags ? field.tags.join(', ') : '');
  };

  const handleSaveClick = async (fieldId) => {
    const tagsArray = currentTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    try {
      await api.put(`/supplier-fields/${fieldId}`, { // שימוש ב-api במקום ב-axios
        tags: tagsArray,
      });
      alert('התגים עודכנו בהצלחה!');
      setEditingFieldId(null);
      fetchSupplierFields(); 
    } catch (err) {
      console.error("Error updating tags:", err);
      alert('שגיאה בעדכון התגים.');
    }
  };

  const handleCancelClick = () => {
    setEditingFieldId(null);
    setCurrentTags('');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-4 border-b-2 border-gray-200">
        ניהול תגים לתחומי ספקים
      </h2>

      {loading && <p>טוען נתונים...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="space-y-4">
            {supplierFields.map(field => (
              <div key={field.supplier_field_id} className="p-4 border rounded-md">
                <h3 className="text-xl font-bold text-gray-800">{field.field}</h3>
                {editingFieldId === field.supplier_field_id ? (
                  // Edit mode
                  <div className="mt-2">
                    <textarea
                      value={currentTags}
                      onChange={(e) => setCurrentTags(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows="3"
                      placeholder="הזן תגים מופרדים בפסיק (לדוגמה: אוכל, שתיה, בירה)"
                    />
                    <div className="mt-2 space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleSaveClick(field.supplier_field_id)}
                        className="bg-blue-500 text-white hover:bg-blue-600 font-bold py-1 px-3 rounded text-sm"
                      >
                        שמור
                      </button>
                      <button 
                        onClick={handleCancelClick}
                        className="bg-gray-500 text-white hover:bg-gray-600 font-bold py-1 px-3 rounded text-sm"
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="mt-2">
                    <p className="text-gray-600">
                      <strong>תגים:</strong> {field.tags && field.tags.length > 0 ? field.tags.join(', ') : 'אין תגים'}
                    </p>
                    <button 
                      onClick={() => handleEditClick(field)}
                      className="text-blue-600 hover:underline mt-2 text-sm"
                    >
                      ערוך תגים
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TagManagementPage;

