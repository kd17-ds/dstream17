import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Routes >
      <Route element={<MainLayout />}>
        <Route path='/' element={<HomePage />} />
      </Route>
    </Routes>
  )
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
