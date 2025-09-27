// src/components/Layout/Header.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <h1>Task Tracker Dashboard</h1>
      <div className="user-info">
        <span>Welcome, {user?.name} ({user?.role})</span>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;