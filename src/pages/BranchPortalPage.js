import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // שימוש במחזיק המפתחות האוטומטי
import { useAuth } from '../context/AuthContext';
import BalanceCard from '../components/branch-portal/BalanceCard';
import RecentOrdersTable from '../components/branch-portal/RecentOrdersTable';
import BranchSupplierSearch from '../components/branch-portal/BranchSupplierSearch';
import BranchSupplierInfoCard from '../components/branch-portal/BranchSupplierInfoCard';
import RequestSupplierForm from '../components/branch-portal/RequestSupplierForm';

function BranchPortalPage() {
  const { user } = useAuth();
  
  // State for branch data
  const [branch, setBranch] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // State for supplier search
  const [foundSuppliers, setFoundSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('name');
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Effect to automatically find the manager's branch
  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      api.get(`/users/${user.id}/branch`)
        .then(response => {
          setBranch(response.data);
        })
        .catch(error => {
          console.error("Could not find a branch for this manager:", error);
          // In a real app, you might show a message that the user is not assigned to a branch
        });
    }
  }, [user]);

  // Effect to fetch data for the identified branch
  useEffect(() => {
    if (!branch) return;

    const fetchBalance = api.get(`/branches/${branch.branch_id}/balance`);
    const fetchTransactions = api.get(`/branches/${branch.branch_id}/transactions`);

    Promise.all([fetchBalance, fetchTransactions])
      .then(([balanceRes, transactionsRes]) => {
        setBalance(balanceRes.data);
        setTransactions(transactionsRes.data);
      })
      .catch(error => console.error("Error fetching branch data:", error))
      .finally(() => setLoading(false));

  }, [branch]);

  const handleSupplierSearch = () => {
    api.get('/suppliers/search', {
      params: { criteria: searchCriteria, query: searchQuery.trim() }
    })
    .then(response => {
      setFoundSuppliers(response.data);
    })
    .catch(error => console.error("Error searching suppliers:", error));
  };

  const clearSearch = () => {
    setFoundSuppliers([]);
    setSearchQuery('');
  };
  
  const handleRequestSent = () => {
    setShowRequestForm(false);
    alert('הבקשה נשלחה בהצלחה ותועבר לאישור הגזבר.');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">
          פורטל מנהל ענף {branch ? `- ${branch.name}` : ''}
        </h2>
      </div>
      
      {loading ? (
        <p>טוען נתונים...</p>
      ) : branch ? (
        <div className="space-y-8">
          <BalanceCard balanceData={balance} />
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h3 className="text-xl font-bold text-gray-800">מאגר ספקים מאושרים</h3>
                <button 
                    onClick={() => setShowRequestForm(true)}
                    className="bg-green-500 text-white hover:bg-green-600 font-bold py-2 px-4 rounded-lg text-sm"
                >
                    הגש בקשה לספק חדש
                </button>
            </div>
            <BranchSupplierSearch 
              query={searchQuery}
              setQuery={setSearchQuery}
              criteria={searchCriteria}
              setCriteria={setSearchCriteria}
              onSearch={handleSupplierSearch}
            />
            {foundSuppliers.length > 0 && (
              <div className="mt-4 space-y-4">
                {foundSuppliers.map(supplier => (
                  <BranchSupplierInfoCard 
                    key={supplier.supplier_id}
                    supplier={supplier}
                    onClear={clearSearch} 
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">סטטוס הזמנות אחרונות</h3>
            <RecentOrdersTable transactions={transactions} />
          </div>
        </div>
      ) : (
        <p>לא משויך ענף למשתמש זה.</p>
      )}

      {branch && (
        <RequestSupplierForm 
          open={showRequestForm}
          onClose={() => setShowRequestForm(false)}
          onSuccess={handleRequestSent}
          userId={user?.id}
          branchId={branch.branch_id}
        />
      )}
    </div>
  );
}

export default BranchPortalPage;

