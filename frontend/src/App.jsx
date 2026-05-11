import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Popup from './components/Popup';
import BookList from './pages/BookList';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';
import ResetPassword from './pages/ResetPassword';
import BookDetail from './pages/BookDetail';
import Wishlist from './pages/Wishlist';
import GlobalSearch from './components/GlobalSearch';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Popup />
      <Navbar />
      <GlobalSearch />
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
