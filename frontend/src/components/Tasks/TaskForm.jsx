// src/components/Tasks/TaskForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../../services/api";
import "../../styles/TaskForm.css";

export default function TaskForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "low",
    status: "pending",
    tags: [],
    dueDate: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      tags: e.target.value.split(",").map((tag) => tag.trim())
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (id) {
        await apiService.updateTask(id, formData);
      } else {
        await apiService.createTask(formData);
      }
      navigate("/tasks");
    } catch (err) {
      setError(err.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-container">
      <h2>{id ? "Edit Task" : "Add New Task"}</h2>
      {error && <div className="error-message">{error}</div>}

      <form className="task-form" onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <label>Priority</label>
        <select name="priority" value={formData.priority} onChange={handleChange}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <label>Status</label>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <label>Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
        />

        <label>Tags (comma-separated)</label>
        <input
          type="text"
          name="tags"
          value={formData.tags.join(", ")}
          onChange={handleTagsChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : id ? "Update Task" : "Create Task"}
        </button>
      </form>
    </div>
  );
}
