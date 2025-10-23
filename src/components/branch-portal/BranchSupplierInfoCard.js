// src/components/branch-portal/BranchSupplierInfoCard.js
import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { Button, TextField, Rating, Box, Typography, Card, CardHeader, CardContent, Divider } from '@mui/material';
import RatingSummary from '../shared/RatingSummary';
import ReviewList from '../shared/ReviewList';

function BranchSupplierInfoCard({ supplier, onClear }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!supplier) {
    return (
      <div className="bg-yellow-100 p-4 mt-4 rounded-md border border-yellow-200 text-center text-yellow-800">
        לא נמצא ספק התואם לחיפוש.
      </div>
    );
  }

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

  const handleReviewSubmit = async () => {
    if (newRating === 0) {
      alert('אנא בחר דירוג (1-5 כוכבים).');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/reviews', {
        supplier_id: supplier.supplier_id,
        rate: newRating,
        comment: newComment
      });
      setNewRating(0);
      setNewComment('');
      fetchReviews(); // Refresh the reviews list after submitting
      alert('הדירוג נשלח בהצלחה!');
    } catch (err) {
      console.error("Error submitting review:", err);
      alert('שליחת הדירוג נכשלה.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-lg">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400 text-lg">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i + fullStars + (hasHalfStar ? 1 : 0)} className="text-gray-300 text-lg">☆</span>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating.toFixed(1)} (${supplier.total_reviews} דירוגים)` : 'אין דירוגים'}
        </span>
      </div>
    );
  };

  const toggleReviews = () => {
    if (!showReviews) {
      fetchReviews();
    }
    setShowReviews(!showReviews);
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader
        title={
          <Typography variant="h6">{supplier.name}</Typography>
        }
        action={
          <Button onClick={onClear} size="small">נקה</Button>
        }
      />
      <CardContent>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
          <Typography variant="body2"><strong>שם:</strong> {supplier.name}</Typography>
          <Typography variant="body2"><strong>ח.פ./ע.מ.:</strong> {supplier.supplier_id}</Typography>
          <Typography variant="body2"><strong>איש קשר:</strong> {supplier.poc_name}</Typography>
          <Typography variant="body2">
            <strong>טלפון:</strong> <a href={`tel:${supplier.poc_phone}`}>{supplier.poc_phone}</a>
          </Typography>
          <Box gridColumn={{ xs: 'span 1', sm: 'span 2' }}>
            <Typography variant="body2">
              <strong>אימייל:</strong> <a href={`mailto:${supplier.poc_email}`}>{supplier.poc_email}</a>
            </Typography>
          </Box>
          <Box gridColumn={{ xs: 'span 1', sm: 'span 2' }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>דירוג</Typography>
            <RatingSummary average={parseFloat(supplier.average_rating)} totalReviews={supplier.total_reviews} />
            <Button onClick={toggleReviews} size="small" sx={{ mt: 1 }}>
              {showReviews ? 'צמצם דירוגים' : 'הרחב דירוגים'}
            </Button>
          </Box>
        </Box>

        {showReviews && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
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
              <Button 
                onClick={handleReviewSubmit} 
                variant="contained" 
                sx={{ mt: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'שולח...' : 'שלח דירוג'}
              </Button>
            </Box>

            <Typography variant="subtitle1" sx={{ mb: 2 }}>היסטוריית דירוגים</Typography>
            {loadingReviews ? (
              <Typography variant="body2">טוען דירוגים...</Typography>
            ) : (
              <ReviewList reviews={reviews} />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default BranchSupplierInfoCard;