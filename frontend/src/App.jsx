import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import TaskList from "./components/Tasks/TaskList";
import TaskForm from "./components/Tasks/TaskForm";
import AdminDashboard from "./components/Admin/Dashboard";
import UserList from "./components/Admin/UserList";
import "./App.css";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Router>
      {!user ? (
        <div className="app auth-page">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      ) : (
        <div className="app">
          <Header />
          <div className="app-body" style={{ display: "flex" }}>
            <Sidebar />
            <main className="main-content" style={{ padding: "20px", flex: 1 }}>
              <Routes>
                <Route path="/" element={<TaskList />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/new" element={<TaskForm />} />
                <Route path="/tasks/edit/:id" element={<TaskForm />} />

                {user.role === "admin" && (
                  <>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<UserList />} />
                    <Route path="/admin/users/:userId/tasks" element={<UserList />} />
                  </>
                )}

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
