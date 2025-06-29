import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import Authentication from './pages/Authentication';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider >
      <Routes >
        <Route element={<MainLayout />}>
          <Route path='/' element={<HomePage />} />
          <Route path="/login" element={<Authentication formType="login" />} />
          <Route path="/signup" element={<Authentication formType="signup" />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
