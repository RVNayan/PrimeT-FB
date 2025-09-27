// src/components/Admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { apiService } from "../../services/api";
import UserList from "./UserList";
import "../../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiService.getAdminDashboard();
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error fetching admin dashboard:", err);
        setError(err.message || "Error fetching dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="loading">Loading admin dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!dashboardData) return <div>No data available</div>;

  const { overview, users, recentActivity, priorityBreakdown } = dashboardData;

  const admins = users.list.filter(u => u.role === "admin");
  const regularUsers = users.list.filter(u => u.role !== "admin");

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="card">
          <h3>Total Tasks</h3>
          <p>{overview.totalTasks}</p>
        </div>
        <div className="card">
          <h3>Completed Tasks</h3>
          <p>{overview.completedTasks}</p>
        </div>
        <div className="card">
          <h3>Pending Tasks</h3>
          <p>{overview.pendingTasks}</p>
        </div>
        <div className="card">
          <h3>Completion Rate</h3>
          <p>{overview.completionRate}%</p>
        </div>
      </div>

      {/* Users Section */}
      <section>
        <h3>User Stats</h3>
        <p>Total Users: {users.totalUsers} | Active Users: {users.activeUsers}</p>

        <div className="table-container">
          <h4>Admins</h4>
          <UserList users={admins} />
        </div>

        <div className="table-container">
          <h4>Users</h4>
          <UserList users={regularUsers} />
        </div>
      </section>

      {/* Priority Breakdown */}
      <section>
        <h3>Priority Breakdown</h3>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>High</th>
              <th>Medium</th>
              <th>Low</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{priorityBreakdown.high}</td>
              <td>{priorityBreakdown.medium}</td>
              <td>{priorityBreakdown.low}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Recent Activity */}
      <section>
        <h3>Recent Activity (Last 7 days)</h3>
        <p>Recent Tasks: {recentActivity.recentTasks}</p>
        <p>Completed Tasks: {recentActivity.recentCompleted}</p>
      </section>
    </div>
  );
}
