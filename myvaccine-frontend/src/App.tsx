import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Posts from './pages/Posts';
import VaccinationHistory from './pages/VaccinationHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import VaccineManagement from './pages/admin/VaccineManagement';
import PostManagement from './pages/admin/PostManagement';
import StockManagement from './pages/admin/StockManagement';
import PostStockManagement from './pages/admin/PostStockManagement';
import VaccinationApplication from './pages/admin/VaccinationApplication';
import StockHistory from './pages/admin/StockHistory';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  // Se não estiver autenticado, mostrar apenas login/register
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Se estiver autenticado, mostrar as rotas protegidas
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="posts" element={<Posts />} />
        <Route path="vaccination-history" element={<VaccinationHistory />} />
        
        {/* Rotas administrativas */}
        {user?.role === 'admin' && (
          <>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/vaccines" element={<VaccineManagement />} />
            <Route path="admin/posts" element={<PostManagement />} />
            <Route path="admin/stocks" element={<StockManagement />} />
            <Route path="admin/post-stocks" element={<PostStockManagement />} />
            <Route path="admin/vaccination-application" element={<VaccinationApplication />} />
            <Route path="admin/stock-history" element={<StockHistory />} />
          </>
        )}
      </Route>
      
      {/* Redirecionar rotas de login/register se já autenticado */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;