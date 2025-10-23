import React from 'react';
import { Box, Button, TextField, MenuItem, Typography } from '@mui/material';

// הרכיב מקבל כעת את כל הפונקציות הדרושות לחיפוש מתקדם
function BranchSupplierSearch({ query, setQuery, criteria, setCriteria, onSearch }) {

  const getPlaceholder = () => {
    if (criteria === 'name') return 'הקלד שם ספק...';
    if (criteria === 'tag') return 'הקלד תג... (למשל: food, travel)';
    return 'הקלד ערך לחיפוש...';
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>חיפוש ספק מאושר</Typography>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems="stretch">
        <TextField
          select
          value={criteria}
          label="סוג חיפוש"
          onChange={(e) => setCriteria(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="name">לפי שם</MenuItem>
          <MenuItem value="tag">לפי תחום / תג</MenuItem>
        </TextField>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          label={getPlaceholder()}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        <Button variant="contained" onClick={onSearch} sx={{ whiteSpace: 'nowrap' }}>חיפוש</Button>
      </Box>
    </Box>
  );
}
export default BranchSupplierSearch;
