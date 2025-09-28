import React from "react";

export default function UserList({ users, onSelectUser, showCounts }) {
  return (
    <table className="styled-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          {showCounts && <th>Total Tasks</th>}
          {showCounts && <th>Completed Tasks</th>}
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} onClick={() => onSelectUser(user.id)}>
            <td>{user.name}</td>
            <td>{user.role}</td>
            {showCounts && <td>{user.totalTasks}</td>}
            {showCounts && <td>{user.completedTasks}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
