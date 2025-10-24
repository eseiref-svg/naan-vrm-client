import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import AnnualCashFlowChart from '../components/reports/AnnualCashFlowChart';
import Button from '../components/shared/Button';
import Select from '../components/shared/Select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// This is a Base64 encoded font that supports Hebrew.
const ARIAL_FONT_B64 = `AAEAAAARAQAABAAQRFNJRwAAAAAAA...`; // Abbreviated for display

function ReportsPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchReportData = () => {
      setLoading(true);
      setError('');
      api.get(`/reports/annual-cash-flow`, {
        params: { year: selectedYear }
      })
      .then(response => {
        setReportData(response.data);
      })
      .catch(err => {
        console.error("Error fetching report data:", err);
        setError('שגיאה בטעינת נתוני הדוח.');
      })
      .finally(() => {
        setLoading(false);
      });
    };

    fetchReportData();
  }, [selectedYear]);
  
  const handleExportPDF = async () => {
    if (!chartRef.current || !chartRef.current.canvas) return;

    try {
        const doc = new jsPDF();
        
        doc.addFileToVFS('Arial.ttf', ARIAL_FONT_B64);
        doc.addFont('Arial.ttf', 'Arial', 'normal');
        doc.setFont('Arial');
        
        doc.setR2L(true);
        doc.text(`דוח תזרים מזומנים לשנת ${selectedYear}`, 105, 15, { align: 'center' });
        
        const chartCanvas = chartRef.current.canvas;
        const imgData = chartCanvas.toDataURL('image/png', 1.0);
        doc.addImage(imgData, 'PNG', 15, 25, 180, 100);

        autoTable(doc, {
            startY: 135,
            head: [['הוצאות (ש"ח)', 'הכנסות (ש"ח)', 'חודש']],
            body: reportData.map(row => [
                Math.abs(parseFloat(row.expense)).toLocaleString('he-IL'),
                parseFloat(row.income).toLocaleString('he-IL'),
                new Date(row.month + '-01').toLocaleDateString('he-IL', { month: 'long' }), 
            ]).reverse(),
            styles: { font: "Arial", halign: 'right' },
            headStyles: { fillColor: [41, 128, 185], halign: 'center' },
            bodyStyles: { halign: 'center' },
        });

        doc.save(`cash_flow_report_${selectedYear}.pdf`);
    } catch (e) {
        console.error("Failed to generate PDF", e);
        alert("נכשל ביצירת קובץ ה-PDF.");
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData.map(row => ({
      'חודש': row.month,
      'הכנסות': parseFloat(row.income),
      'הוצאות': Math.abs(parseFloat(row.expense))
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Cash Flow ${selectedYear}`);
    XLSX.writeFile(workbook, `cash_flow_report_${selectedYear}.xlsx`);
  };

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i);
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">
          דוח תזרים מזומנים שנתי
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="year-select" className="font-semibold">בחר שנה:</label>
            <Select
              id="year-select" 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              options={years.map(year => ({
                value: year,
                label: year.toString()
              }))}
              fullWidth={false}
              className="w-28"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} variant="danger" size="sm">יצא ל-PDF</Button>
            <Button onClick={handleExportExcel} variant="success" size="sm">יצא ל-Excel</Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        {loading && <p>טוען נתוני דוח...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && reportData.length > 0 && (
          <AnnualCashFlowChart ref={chartRef} reportData={reportData} />
        )}
        {!loading && !error && reportData.length === 0 && (
            <p>לא נמצאו נתונים לשנה הנבחרת.</p>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;
