// src/components/Admin/UserList.jsx
import React from "react";
import "../../styles/AdminDashboard.css";

export default function UserList({ users }) {
  return (
    <table className="dashboard-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Total Tasks</th>
          <th>Completed Tasks</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.role}</td>
            <td>{user.totalTasks}</td>
            <td>{user.completedTasks}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
