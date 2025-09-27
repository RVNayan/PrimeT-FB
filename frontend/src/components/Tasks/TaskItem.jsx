// src/components/Tasks/TaskItem.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await apiService.updateTaskStatus(task._id, newStatus);
      onUpdate();
    } catch (error) {
      alert('Failed to update task status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true);
        await apiService.deleteTask(task._id);
        onDelete(task._id);
      } catch (error) {
        alert('Failed to delete task: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getPriorityClass = (priority) => {
    return `task-priority priority-${priority}`;
  };

  const getStatusClass = (status) => {
    return `task-status status-${status.replace('-', '')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="task-item">
      <div className="task-header-info">
        <div>
          <h3 className="task-title">{task.title}</h3>
          <div style={{marginTop: '0.5rem'}}>
            <span className={getStatusClass(task.status)}>
              {task.status.replace('-', ' ').toUpperCase()}
            </span>
            <span className={getPriorityClass(task.priority)}>
              {task.priority.toUpperCase()} PRIORITY
            </span>
          </div>
        </div>
        <div className="task-actions">
          <Link to={`/tasks/edit/${task._id}`} className="action-btn edit-btn">
            Edit
          </Link>
          <button 
            onClick={handleDelete} 
            disabled={loading}
            className="action-btn delete-btn"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
          {task.status !== 'completed' && (
            <button 
              onClick={() => handleStatusChange('completed')}
              disabled={loading}
              className="action-btn complete-btn"
            >
              {loading ? 'Updating...' : 'Complete'}
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div>
          <span>Due: {formatDate(task.dueDate)}</span>
          {task.tags && task.tags.length > 0 && (
            <span style={{marginLeft: '1rem'}}>
              Tags: {task.tags.join(', ')}
            </span>
          )}
        </div>
        <div>
          Created: {new Date(task.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;