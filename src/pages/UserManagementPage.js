import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const permissionMap = { 1: 'Admin', 2: 'גזבר', 3: 'הנהלת חשבונות', 4: 'מנהל ענף', 5: 'Derictrion' };

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching users:", err);
        setError('שגיאה בטעינת המשתמשים.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setCurrentUser(user);
    } else {
      setIsEditing(false);
      setCurrentUser({ first_name: '', surname: '', email: '', phone_no: '', password: '', permissions_id: 2, status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
    setError('');
  };

  const handleChange = (e) => {
    setCurrentUser({ ...currentUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await api.put(`/users/${currentUser.user_id}`, currentUser);
      } else {
        await api.post('/users/register', currentUser);
      }
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving user:", err);
      setError(err.response?.data?.message || 'שמירת המשתמש נכשלה.');
    }
  };
  
  const handleDeactivate = async (userId) => {
    if (window.confirm('האם אתה בטוח שברצונך להשבית משתמש זה?')) {
        try {
            await api.delete(`/users/${userId}`);
            fetchUsers();
        } catch (err) {
            console.error("Error deactivating user:", err);
            alert('השבתת המשתמש נכשלה.');
        }
    }
  };

  // --- פונקציה חדשה לטיפול בבקשת איפוס סיסמה ---
  const handlePasswordReset = async (userId) => {
    if (window.confirm('האם אתה בטוח שברצונך ליצור קישור לאיפוס סיסמה עבור משתמש זה?')) {
      try {
        const response = await api.post(`/users/${userId}/request-password-reset`);
        // הצגת הקישור שנוצר למנהל בחלון קטן כדי שיוכל להעתיק אותו
        window.prompt("העתק את הקישור ושלח אותו למשתמש במייל:", response.data.resetUrl);
      } catch (err) {
        console.error("Error requesting password reset:", err);
        alert('יצירת קישור לאיפוס סיסמה נכשלה.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">ניהול משתמשים</h2>
        <Button variant="contained" color="primary" onClick={() => handleOpenModal()}>
          הוסף משתמש חדש
        </Button>
      </div>

      {loading && <p>טוען משתמשים...</p>}
      {error && !loading && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 text-right font-semibold">שם מלא</th>
                <th className="py-2 px-3 text-right font-semibold">אימייל</th>
                <th className="py-2 px-3 text-right font-semibold">תפקיד</th>
                <th className="py-2 px-3 text-right font-semibold">סטטוס</th>
                <th className="py-2 px-3 text-right font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.user_id} className="border-b">
                  <td className="py-2 px-3">{user.first_name} {user.surname}</td>
                  <td className="py-2 px-3">{user.email}</td>
                  <td className="py-2 px-3">{permissionMap[user.permissions_id] || user.permissions_id}</td>
                  <td className="py-2 px-3">{user.status === 'active' ? 'פעיל' : 'לא פעיל'}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2">
                        <Button size="small" onClick={() => handleOpenModal(user)}>ערוך</Button>
                        {user.status === 'active' && 
                        <>
                            <Button size="small" color="secondary" onClick={() => handleDeactivate(user.user_id)}>השבת</Button>
                            {/* --- הכפתור החדש לאיפוס סיסמה --- */}
                            <Button size="small" color="warning" onClick={() => handlePasswordReset(user.user_id)}>שלח איפוס</Button>
                        </>
                        }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'עריכת משתמש' : 'הוספת משתמש חדש'}</DialogTitle>
        <DialogContent>
          {currentUser && (
            <div className="space-y-4 pt-2">
              <TextField name="first_name" label="שם פרטי" defaultValue={currentUser.first_name} onChange={handleChange} fullWidth required />
              <TextField name="surname" label="שם משפחה" defaultValue={currentUser.surname} onChange={handleChange} fullWidth required />
              <TextField name="email" label="אימייל" type="email" defaultValue={currentUser.email} onChange={handleChange} fullWidth required disabled={isEditing} />
              <TextField name="phone_no" label="טלפון" defaultValue={currentUser.phone_no} onChange={handleChange} fullWidth required />
              {!isEditing && <TextField name="password" label="סיסמה" type="password" onChange={handleChange} fullWidth required />}
              <FormControl fullWidth>
                <InputLabel>תפקיד</InputLabel>
                <Select name="permissions_id" label="תפקיד" defaultValue={currentUser.permissions_id} onChange={handleChange}>
                  {Object.entries(permissionMap).map(([id, name]) => (
                    <MenuItem key={id} value={parseInt(id, 10)}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
               {isEditing && (
                 <FormControl fullWidth>
                    <InputLabel>סטטוס</InputLabel>
                    <Select name="status" label="סטטוס" defaultValue={currentUser.status} onChange={handleChange}>
                        <MenuItem value={'active'}>פעיל</MenuItem>
                        <MenuItem value={'inactive'}>לא פעיל</MenuItem>
                    </Select>
                 </FormControl>
               )}
            </div>
          )}
           {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>ביטול</Button>
          <Button onClick={handleSubmit} variant="contained">שמור</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UserManagementPage;

