// src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // ייבוא ה-hook לניהול משתמש
import { useNavigate } from 'react-router-dom';   // ייבוא ה-hook לניווט

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // קבלת פונקציית הלוגין הגלובלית
  const navigate = useNavigate(); // קבלת פונקציית הניווט

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // נקה שגיאות קודמות
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      });
      
      // קרא לפונקציית הלוגין הגלובלית עם הטוקן שהתקבל
      login(response.data.token);
      
      // העבר את המשתמש לעמוד הבית לאחר התחברות מוצלחת
      navigate('/');
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'ההתחברות נכשלה. אנא נסה שוב.';
      console.error('ההתחברות נכשלה:', errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">כניסה למערכת</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">
              אימייל
            </label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              required 
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">
              סיסמה
            </label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              required 
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-blue-500 text-white hover:bg-blue-600 font-bold py-2 px-4 rounded-md"
          >
            התחבר
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

