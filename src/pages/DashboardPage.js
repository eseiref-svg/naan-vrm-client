import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import InfoCard from '../components/dashboard/InfoCard';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import ExpensesChart from '../components/dashboard/ExpensesChart';
import SupplierRequestsWidget from '../components/dashboard/SupplierRequestsWidget';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function DashboardPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('monthly');

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    const summaryPromise = api.get('/dashboard/summary', { params: { period } });
    const requestsPromise = api.get('/supplier-requests/pending');

    Promise.all([summaryPromise, requestsPromise])
      .then(([summaryRes, requestsRes]) => {
        setSummaryData(summaryRes.data);
        setRequests(requestsRes.data);
      })
      .catch(err => {
        console.error("Error fetching dashboard data:", err);
        setError('שגיאה בטעינת הנתונים.');
      })
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequestUpdate = (requestId) => {
    setRequests(prevRequests => prevRequests.filter(req => req.request_id !== requestId));
  };

  const handleExportPDF = () => {
    if (!summaryData) return;
    const doc = new jsPDF();
    
    // Add a Hebrew-supporting font
    doc.addFont('arial', 'Arial', 'normal');
    doc.setFont('arial');

    doc.text(`סיכום לוח מחוונים - ${new Date().toLocaleDateString('he-IL')}`, 105, 15, { align: 'center' });

    // Add KPI data
    doc.text(`יתרה לתשלום לספקים: ${parseFloat(summaryData.totalSupplierBalance).toLocaleString('he-IL')} ש"ח`, 20, 30);
    doc.text(`חשבוניות בחריגה: ${summaryData.overdueInvoices}`, 20, 40);
    doc.text(`בקשות ספקים ממתינות: ${requests.length}`, 20, 50);

    // Add expenses by branch table
    doc.autoTable({
      startY: 60,
      head: [['ענף', 'סך הוצאות (ש"ח)']],
      body: summaryData.expensesByBranch.map(e => [e.name, parseFloat(e.total_expenses).toLocaleString('he-IL')]),
      styles: { font: "arial", halign: 'right' },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`dashboard_summary_${period}.pdf`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">לוח מחוונים - גזבר/ית</h2>
        <div className="flex items-center gap-4">
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="border border-gray-300 rounded-md p-2">
                <option value="monthly">תצוגה חודשית</option>
                <option value="quarterly">תצוגה רבעונית</option>
                <option value="annual">תצוגה שנתית</option>
            </select>
            <button onClick={handleExportPDF} className="bg-green-500 text-white hover:bg-green-600 font-bold py-2 px-4 rounded-md">
              ייצוא ל-PDF
            </button>
        </div>
      </div>

      {loading && <p>טוען נתונים...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && summaryData && (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <InfoCard title="יתרות בנקים (₪)"><div className="text-4xl font-extrabold text-green-600">₪12,350,000</div><p className="text-gray-600 text-sm mt-1">נתון סטטי לדוגמה</p></InfoCard>
                <InfoCard title="תזרים מזומנים (לתקופה)"><CashFlowChart /></InfoCard>
                <InfoCard title="הוצאות לפי ענפים (לתקופה)"><ExpensesChart data={summaryData.expensesByBranch} /></InfoCard>
                <InfoCard title="ספקים וחריגות">
                    <div className="text-3xl font-extrabold text-blue-700">₪{parseFloat(summaryData.totalSupplierBalance).toLocaleString('he-IL')}</div>
                    <p className="text-gray-600 text-sm my-2">יתרה לתשלום (לתקופה)</p>
                    <div className="text-red-600 font-bold">{summaryData.overdueInvoices} חשבוניות בחריגה</div>
                </InfoCard>
            </div>
            <SupplierRequestsWidget requests={requests} onUpdateRequest={handleRequestUpdate} />
        </div>
      )}
    </div>
  );
}

export default DashboardPage;

