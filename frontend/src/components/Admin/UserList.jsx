// src/components/Admin/UserList.jsx
import React, { useEffect, useState } from "react";
import { apiService } from "../../services/api";

export default function UserList({ onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiService.getAllUsers();
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const admins = users.filter(user => user.role === "admin");
  const normalUsers = users.filter(user => user.role !== "admin");

  const renderUserTable = (userList, title) => (
    <div style={{ marginBottom: "20px" }}>
      <h4>{title}</h4>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Total Tasks</th>
            <th>Completed Tasks</th>
          </tr>
        </thead>
        <tbody>
          {userList.map(user => (
            <tr key={user._id} onClick={() => onSelectUser(user._id)} style={{ cursor: "pointer" }}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.totalTasks || 0}</td>
              <td>{user.completedTasks || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="user-list">
      {renderUserTable(admins, "Admins")}
      {renderUserTable(normalUsers, "Users")}
    </div>
  );
}
