import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // We use axios directly here because this is a public page and doesn't need the auth token
import { Button, TextField, Alert } from '@mui/material';

function ResetPasswordPage() {
  const { token } = useParams(); // Reads the unique token from the URL
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות.');
      return;
    }
    if (password.length < 6) {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים.');
        return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/reset-password', {
        token,
        newPassword: password,
      });
      setSuccess(response.data.message + ' הנך מועבר/ת לעמוד הכניסה בעוד מספר שניות.');
      setTimeout(() => {
        navigate('/login');
      }, 4000); // Redirect to login page after 4 seconds
    } catch (err) {
      setError(err.response?.data?.message || 'איפוס הסיסמה נכשל.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">איפוס סיסמה</h2>
            {!success ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <TextField 
                        label="סיסמה חדשה"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        required
                    />
                    <TextField 
                        label="אימות סיסמה חדשה"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        required
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button type="submit" variant="contained" fullWidth size="large">
                        אפס סיסמה
                    </Button>
                </form>
            ) : (
                <Alert severity="success">{success}</Alert>
            )}
        </div>
    </div>
  );
}

export default ResetPasswordPage;

