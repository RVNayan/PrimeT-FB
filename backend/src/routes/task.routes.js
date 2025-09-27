// src/routes/task.routes.js
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { createTaskValidation, updateTaskValidation } from '../validations/task.validation.js';

const router = express.Router();

// Apply authentication to all task routes
router.use(authenticate);

// GET /api/tasks - Get user's tasks with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, priority, search } = req.query;
    
    // Build filter object
    const filter = {
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id },
        { isPublic: true }
      ]
    };
    
    // Add filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task
    if (task.createdBy._id.toString() !== req.user._id.toString() && 
        task.assignedTo._id.toString() !== req.user._id.toString() && 
        !task.isPublic && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/tasks - Create new task
// In src/routes/task.routes.js, update the POST route:
router.post('/', async (req, res) => {
  try {
    console.log('=== TASK CREATION DEBUG ===');
    console.log('1. Headers received:', JSON.stringify(req.headers, null, 2));
    console.log('2. Raw body received:', req.body);
    console.log('3. Body type:', typeof req.body);
    console.log('4. Body keys:', Object.keys(req.body || {}));
    console.log('5. User authenticated:', req.user ? req.user.email : 'No user');
    
    // Check if body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('6. Body is empty or undefined');
      return res.status(400).json({ message: 'Request body is required' });
    }
    
    console.log('7. Title value:', req.body.title);
    console.log('8. Full body content:', JSON.stringify(req.body, null, 2));

    await createTaskValidation.validate(req.body);

    const taskData = {
      ...req.body,
      createdBy: req.user._id,
      assignedTo: req.body.assignedTo || req.user._id
    };

    console.log('9. Task data to create:', taskData);
    
    const task = await Task.create(taskData);
    
    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    console.log('10. Task created successfully');
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    });
  } catch (error) {
    console.error('11. Task creation error:', error.message);
    console.error('12. Error details:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  try {
    await updateTaskValidation.validate(req.body);

    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions (creator, assigned user, or admin)
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    
    if (!isCreator && !isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // If marking as completed, set completedAt
    if (req.body.status === 'completed' && task.status !== 'completed') {
      req.body.completedAt = new Date();
    } else if (req.body.status !== 'completed' && task.status === 'completed') {
      req.body.completedAt = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.errors.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only creator or admin can delete
    if (task.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH /api/tasks/:id/status - Update task status only
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    if (!isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const updateData = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (task.status === 'completed' && status !== 'completed') {
      updateData.completedAt = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy', 'name email')
     .populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;