// src/components/Admin/UserTasks.jsx
import React, { useEffect, useState } from "react";
import { apiService } from "../../services/api";

export default function UserTasks({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchTasks = async () => {
      try {
        const res = await apiService.getUserTasks(userId);
        setTasks(res.data || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(err.message || "Error fetching tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [userId]);

  if (!userId) return <div>Select a user to view tasks</div>;
  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  if (!tasks.length) return <div>No tasks found for this user</div>;

  return (
    <div className="user-tasks">
      <h4>User Tasks</h4>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Task</th>
            <th>Status</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.status}</td>
              <td>{new Date(task.dueDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
