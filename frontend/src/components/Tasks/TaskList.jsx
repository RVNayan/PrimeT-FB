// src/components/Tasks/TaskList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import TaskItem from './TaskItem';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTasks(filters);
      setTasks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTaskUpdate = () => {
    loadTasks(); // Reload tasks after update
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prev => prev.filter(task => task._id !== taskId));
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div>
      <div className="task-header">
        <h2>My Tasks</h2>
        <Link to="/tasks/new" className="add-task-btn">
          + Add New Task
        </Link>
      </div>

      {/* Filters */}
      <div className="task-filters">
        <select 
          value={filters.status} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select 
          value={filters.priority} 
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="filter-select"
        >
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="search-input"
        />
      </div>

      {/* Task List */}
      <div className="task-list">
        {tasks.length === 0 ? (
          <div style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
            No tasks found. <Link to="/tasks/new">Create your first task!</Link>
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem 
              key={task._id} 
              task={task} 
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;