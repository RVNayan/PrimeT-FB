// src/components/Layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <Link 
              to="/tasks" 
              className={isActive('/tasks') || isActive('/') ? 'active' : ''}
            >
              My Tasks
            </Link>
          </li>
          <li>
            <Link 
              to="/tasks/new" 
              className={isActive('/tasks/new') ? 'active' : ''}
            >
              Add New Task
            </Link>
          </li>
          
          {user?.role === 'admin' && (
            <>
              <li>
                <Link 
                  to="/admin" 
                  className={isActive('/admin') ? 'active' : ''}
                >
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/users" 
                  className={isActive('/admin/users') ? 'active' : ''}
                >
                  User Management
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;