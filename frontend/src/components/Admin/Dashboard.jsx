// src/components/Admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { apiService } from "../../services/api";
import UserList from "./UserList";
import UserTasks from "./UserTasks";
import "../../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

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

  if (loading) return <div>Loading admin dashboard...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!dashboardData) return <div>No data available</div>;

  const { overview, users, recentActivity, priorityBreakdown } = dashboardData;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      <section>
        <h3>Admin Stats</h3>
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Total Tasks</th>
              <th>Completed Tasks</th>
              <th>Pending Tasks</th>
              <th>In Progress</th>
              <th>Completion Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{overview.totalTasks}</td>
              <td>{overview.completedTasks}</td>
              <td>{overview.pendingTasks}</td>
              <td>{overview.inProgressTasks}</td>
              <td>{overview.completionRate}%</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3>User Stats</h3>
        <p>Total Users: {users.totalUsers} | Active Users: {users.activeUsers}</p>
        <UserList onSelectUser={setSelectedUserId} />
      </section>

      <section>
        {selectedUserId && (
          <>
            <h3>User Tasks</h3>
            <UserTasks userId={selectedUserId} />
          </>
        )}
      </section>

      <section>
        <h3>Priority Breakdown</h3>
        <table border="1" cellPadding="8">
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
    </div>
  );
}
