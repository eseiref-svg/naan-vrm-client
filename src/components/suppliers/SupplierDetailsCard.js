import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { Button, TextField, Rating, Box, Typography, Card, CardHeader, CardContent, Divider, Tabs, Tab } from '@mui/material';
import RatingSummary from '../shared/RatingSummary';
import ReviewList from '../shared/ReviewList';

function SupplierDetailsCard({ supplier, onBackToList, onEdit }) {
  const [activeTab, setActiveTab] = useState('details');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // State for the new review form
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  
  const { user } = useAuth();

  const fetchReviews = () => {
    if (!supplier) return;
    setLoadingReviews(true);
    api.get(`/suppliers/${supplier.supplier_id}/reviews`)
      .then(response => {
        setReviews(response.data);
      })
      .catch(error => console.error("Error fetching reviews:", error))
      .finally(() => setLoadingReviews(false));
  };

  // Fetch reviews only when the 'performance' tab is selected
  useEffect(() => {
    if (activeTab === 'performance') {
      fetchReviews();
    }
  }, [activeTab, supplier]);


  const handleReviewSubmit = async () => {
    if (newRating === 0) {
      alert('אנא בחר דירוג (1-5 כוכבים).');
      return;
    }
    try {
      await api.post('/reviews', {
        supplier_id: supplier.supplier_id,
        rate: newRating,
        comment: newComment
        // user_id is automatically added by the server from the token
      });
      setNewRating(0);
      setNewComment('');
      fetchReviews(); // Refresh the reviews list after submitting
      alert('הדירוג נשלח בהצלחה!');
    } catch (err) {
      console.error("Error submitting review:", err);
      alert('שליחת הדירוג נכשלה.');
    }
  };

  const TabButton = ({ tabName, label }) => (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tabName ? 'bg-white border-b-0 border-t-2 border-r-2 border-l-2 border-blue-500 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
      onClick={() => setActiveTab(tabName)}
    >
      {label}
    </button>
  );

  return (
    <Card sx={{ p: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Button onClick={onBackToList} variant="contained" color="inherit" size="small">חזרה לרשימה</Button>
        <Button variant="contained" color="primary" size="small" onClick={() => onEdit(supplier)}>ערוך פרטי ספק</Button>
      </Box>

      <CardHeader title={<Typography variant="h6">{supplier.name}</Typography>} subheader={supplier.field || 'לא שויך'} />
      <CardContent>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2} sx={{ mb: 2 }}>
          <Typography variant="body2"><strong>איש קשר:</strong> {supplier.poc_name || 'לא הוזן'}</Typography>
          <Typography variant="body2"><strong>טלפון:</strong> {supplier.poc_phone || 'לא הוזן'}</Typography>
          <Typography variant="body2"><strong>אימייל:</strong> {supplier.poc_email || 'לא הוזן'}</Typography>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab label="פרטים" value="details" />
          <Tab label="היסטוריית תשלומים" value="payment_history" />
          <Tab label="ביצועים ודירוג" value="performance" />
        </Tabs>

        <Box>
          {activeTab === 'details' && (
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>פרטי התקשרות</Typography>
              <Typography variant="body2"><strong>איש קשר:</strong> {supplier.poc_name || 'לא הוזן'}</Typography>
              <Typography variant="body2"><strong>טלפון:</strong> {supplier.poc_phone || 'לא הוזן'}</Typography>
              <Typography variant="body2"><strong>אימייל:</strong> {supplier.poc_email || 'לא הוזן'}</Typography>
            </Box>
          )}
          {activeTab === 'payment_history' && (
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>היסטוריית תשלומים</Typography>
              <Typography variant="body2">יוצג בקרוב...</Typography>
            </Box>
          )}
          {activeTab === 'performance' && (
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Box component="fieldset" mb={3} borderColor="transparent" sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography component="legend" variant="subtitle1" sx={{ mb: 1 }}>הוסף דירוג חדש</Typography>
                <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                  <Typography variant="body2">דירוג (כוכבים):</Typography>
                  <Rating
                    name="new-rating"
                    value={newRating}
                    onChange={(event, newValue) => {
                      setNewRating(newValue);
                    }}
                  />
                </Box>
                <TextField
                    label="הערות נוספות (אופציונלי)"
                    multiline
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    variant="outlined"
                    fullWidth
                />
                <Button onClick={handleReviewSubmit} variant="contained" sx={{ mt: 2 }}>שלח דירוג</Button>
              </Box>

              <Typography variant="subtitle1" sx={{ mb: 2 }}>היסטוריית דירוגים</Typography>
              {loadingReviews ? (
                <Typography variant="body2">טוען דירוגים...</Typography>
              ) : (
                <ReviewList reviews={reviews} />
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default SupplierDetailsCard;

