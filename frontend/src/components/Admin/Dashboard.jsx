import React, { useEffect, useState } from "react";
import { apiService } from "../../services/api";
import UserList from "./UserList";
import "../../styles/AdminDashboard.css";
import InteractiveTable from "./InteractiveTable";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#FF6B6B", "#FFD93D", "#4BC0C0"];

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserTaskData, setSelectedUserTaskData] = useState(null);

  const [adminPage, setAdminPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiService.getAdminDashboard();
        setDashboardData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error fetching dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setSelectedUserTaskData(null);
      return;
    }
    const fetchUserTasks = async () => {
      try {
        const res = await apiService.getUserTasks(selectedUser);
        const tasks = res.data.tasks || [];
        const perPriority = tasks.reduce(
          (acc, t) => {
            acc[t.priority] = (acc[t.priority] || 0) + 1;
            return acc;
          },
          { high: 0, medium: 0, low: 0 }
        );

        const lastDays = 14;
        const today = new Date();
        const dates = Array.from({ length: lastDays }).map((_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (lastDays - 1 - i));
          return d;
        });

        const byDate = {};
        dates.forEach((d) => {
          byDate[d.toISOString().slice(0, 10)] = 0;
        });

        tasks.forEach((t) => {
          if (!t.createdAt) return;
          const key = new Date(t.createdAt).toISOString().slice(0, 10);
          if (key in byDate) byDate[key] += 1;
        });

        const lineData = Object.keys(byDate).map((k) => ({
          date: k,
          count: byDate[k],
        }));

        setSelectedUserTaskData({
          perPriority,
          lineData,
          tasks,
          statistics: res.data.statistics,
        });
      } catch (err) {
        console.error(err);
        setSelectedUserTaskData(null);
      }
    };

    fetchUserTasks();
  }, [selectedUser]);

  if (loading) return <div className="loading">Loading admin dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!dashboardData) return <div className="empty">No data available</div>;

  const { overview, users, recentActivity, priorityBreakdown } = dashboardData;
  const admins = users.list.filter((u) => u.role === "admin");
  const regularUsers = users.list.filter((u) => u.role !== "admin");

  const paginatedAdmins = admins.slice(
    (adminPage - 1) * itemsPerPage,
    adminPage * itemsPerPage
  );

  const paginatedUsers = regularUsers.slice(
    (userPage - 1) * itemsPerPage,
    userPage * itemsPerPage
  );

  const pieData = [
    { name: "High", value: priorityBreakdown.high },
    { name: "Medium", value: priorityBreakdown.medium },
    { name: "Low", value: priorityBreakdown.low },
  ];

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <p>Overview of tasks, users, and activity</p>
        </div>
        <div className="overview-cards">
          {[
            { label: "Total Tasks", value: overview.totalTasks },
            { label: "Completed", value: overview.completedTasks },
            { label: "Pending", value: overview.pendingTasks },
            { label: "Completion Rate", value: `${overview.completionRate}%` },
          ].map((card, idx) => (
            <div key={idx} className="card small">
              <div className="card-label">{card.label}</div>
              <div className="card-value">{card.value}</div>
            </div>
          ))}
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="left-panel">
          <div className="panel">
            <h3>Users</h3>
            <div className="split">
              <div>
                <h4>Admins</h4>
                <UserList
                  users={paginatedAdmins}
                  onSelectUser={(id) => setSelectedUser(id)}
                  showCounts
                />
                <PaginationControls
                  page={adminPage}
                  setPage={setAdminPage}
                  totalItems={admins.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
              <div>
                <h4>Users</h4>
                <UserList
                  users={paginatedUsers}
                  onSelectUser={(id) => setSelectedUser(id)}
                  showCounts
                />
                <PaginationControls
                  page={userPage}
                  setPage={setUserPage}
                  totalItems={regularUsers.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            </div>
          </div>

          <div className="panel">
            <h3>Priority Breakdown</h3>
            <ResponsiveContainer height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="right-panel">
          <div className="panel">
            <h3>Recent Activity</h3>
            <div className="activity-row">
              {[
                { number: recentActivity.recentTasks, label: "New Tasks (7d)" },
                { number: recentActivity.recentCompleted, label: "Completed (7d)" },
                { number: users.totalUsers, label: "Total Users" },
              ].map((act, idx) => (
                <div key={idx} className="activity-card">
                  <div className="activity-number">{act.number}</div>
                  <div className="activity-label">{act.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3>Selected User Details</h3>
            {!selectedUser && <div className="empty">Select a user to view details</div>}

            {selectedUser && !selectedUserTaskData && (
              <div className="loading">Loading user data...</div>
            )}

            {selectedUser && selectedUserTaskData && (
              <div className="selected-user">
                <div className="selected-user-header">
                  <strong>{selectedUserTaskData.statistics?.user?.name}</strong>
                  <div>
                    Total: {selectedUserTaskData.statistics.total} | Completed:{" "}
                    {selectedUserTaskData.statistics.completed}
                  </div>
                </div>

                <div className="charts-row">
                  <div className="chart-card">
                    <h4>Priority (user)</h4>
                    <ResponsiveContainer height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "High", value: selectedUserTaskData.perPriority.high },
                            { name: "Medium", value: selectedUserTaskData.perPriority.medium },
                            { name: "Low", value: selectedUserTaskData.perPriority.low },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={60}
                          label
                        >
                          <Cell fill={COLORS[0]} />
                          <Cell fill={COLORS[1]} />
                          <Cell fill={COLORS[2]} />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h4>Tasks over time (14d)</h4>
                    <ResponsiveContainer height={200}>
                      <LineChart data={selectedUserTaskData.lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="panel-sub">
                  <h4>Recent tasks</h4>
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUserTaskData.tasks.slice(0, 10).map((t, idx) => (
                        <tr key={idx}>
                          <td>{t.title}</td>
                          <td>{new Date(t.createdAt).toLocaleString()}</td>
                          <td>{t.priority}</td>
                          <td>{t.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// Pagination Controls component
function PaginationControls({ page, setPage, totalItems, itemsPerPage }) {
  return (
    <div className="pagination-controls">
      <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
        ◀
      </button>
      <span>{page}</span>
      <button
        onClick={() => setPage((p) => (p * itemsPerPage < totalItems ? p + 1 : p))}
        disabled={page * itemsPerPage >= totalItems}
      >
        ▶
      </button>
    </div>
  );
}
