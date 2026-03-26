import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Invoice from './pages/Invoice';
import Reports from './pages/Reports';
import Sales from './pages/Sales';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Purchase from './pages/Purchase';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';

import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';

const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();
    if (!token) return <Navigate to="/login" />;
    return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/invoice/:id" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
          
          <Route path="*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/products" element={<Inventory />} />
                  <Route path="/sales-history" element={<Sales />} />
                  <Route path="/purchase" element={<Purchase />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/:id" element={<CustomerDetails />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
