// src/components/SuppliersTable.js
import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

function SuppliersTable({ suppliers, onDelete, onEdit, onRowClick }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>שם הספק</TableCell>
            <TableCell>איש קשר</TableCell>
            <TableCell>סטטוס</TableCell>
            <TableCell>פעולות</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow 
              key={supplier.supplier_id}
              onClick={() => onRowClick(supplier)}
              className="cursor-pointer hover:bg-gray-100"
            >
              {/* הקפד על סדר התאים כך שיתאים לכותרת */}
              <TableCell>{supplier.supplier_id}</TableCell>
              <TableCell>{supplier.name}</TableCell>
              <TableCell>{supplier.poc_name}</TableCell>
              <TableCell>{supplier.status}</TableCell>
              
              {/* התא האחרון מכיל את כל כפתורי הפעולה */}
              <TableCell>
                <Button 
                  variant="contained" 
                  color="primary" 
                  style={{ marginLeft: '10px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(supplier);
                  }}
                >
                  ערוך
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(supplier.supplier_id);
                  }}
                >
                  מחק
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default SuppliersTable;