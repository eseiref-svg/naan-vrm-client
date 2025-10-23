import React from 'react';
import axios from 'axios';

function SupplierRequestsWidget({ requests, onUpdateRequest }) {

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/supplier-requests/${requestId}`, { status: newStatus });
      onUpdateRequest(requestId); // Notify the parent component to refresh the list
    } catch (error) {
      console.error(`Failed to ${newStatus} request`, error);
      alert('הפעולה נכשלה. אנא נסה שוב.');
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">בקשות ספקים חדשים להוספה</h3>
        <p className="text-gray-500 text-center py-4">אין בקשות חדשות הממתינות לאישור.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">בקשות ספקים חדשים להוספה</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-right font-semibold">שם הספק</th>
              <th className="py-2 px-3 text-right font-semibold">הוגש על ידי</th>
              <th className="py-2 px-3 text-right font-semibold">ענף</th>
              <th className="py-2 px-3 text-right font-semibold">תאריך</th>
              <th className="py-2 px-3 text-center font-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.request_id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{req.supplier_name}</td>
                <td className="py-2 px-3">{req.requested_by}</td>
                <td className="py-2 px-3">{req.branch_name}</td>
                <td className="py-2 px-3">{new Date(req.created_at).toLocaleDateString('he-IL')}</td>
                <td className="py-2 px-3 text-center">
                  <button 
                    onClick={() => handleUpdateStatus(req.request_id, 'approved')}
                    className="bg-green-500 text-white hover:bg-green-600 text-xs font-bold py-1 px-3 rounded-md ml-2"
                  >
                    אשר
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(req.request_id, 'rejected')}
                    className="bg-red-500 text-white hover:bg-red-600 text-xs font-bold py-1 px-3 rounded-md"
                  >
                    דחה
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SupplierRequestsWidget;

