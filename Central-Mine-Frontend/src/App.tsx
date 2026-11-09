import { Navigate, Route, Routes } from 'react-router-dom'
import { RegisterProvider } from './context/RegisterContext'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyCodePage from './pages/auth/VerifyCodePage'
import TermsPage from './pages/TermsPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <RegisterProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/catalog" element={<Navigate to="/home" replace />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/verify" element={<VerifyCodePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </RegisterProvider>
  )
}
