// src/routes/admin/task.routes.js
import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import Task from '../../models/Task.js';
import User from '../../models/User.js';

const router = express.Router();

// Admin only routes
router.use(authenticate, authorize('admin'));

// GET /api/admin/tasks - Get all tasks across all users
router.get('/tasks', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, userId, search } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.$or = [{ createdBy: userId }, { assignedTo: userId }];
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


// POST /api/admin/tasks - Create a new task (Admin)
router.post('/tasks', async (req, res) => {
  try {
    const { title, description, priority, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || "low",
      assignedTo: assignedTo || null,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error("Error creating admin task:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/tasks/dashboard - Admin dashboard statistics
router.get('/tasks/dashboard', async (req, res) => {
  try {
    // --- Global statistics ---
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });

    // --- User statistics ---
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTasks = await Task.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentCompleted = await Task.countDocuments({
      status: 'completed',
      completedAt: { $gte: sevenDaysAgo }
    });

    // Tasks by priority
    const highPriorityTasks = await Task.countDocuments({ priority: 'high' });
    const mediumPriorityTasks = await Task.countDocuments({ priority: 'medium' });
    const lowPriorityTasks = await Task.countDocuments({ priority: 'low' });

    // --- Per-user statistics ---
    const users = await User.find().select('_id name role isActive');

    const userStats = await Promise.all(users.map(async (user) => {
      const total = await Task.countDocuments({
        $or: [{ createdBy: user._id }, { assignedTo: user._id }]
      });

      const completed = await Task.countDocuments({
        $or: [{ createdBy: user._id }, { assignedTo: user._id }],
        status: 'completed'
      });

      return {
        id: user._id,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        totalTasks: total,
        completedTasks: completed
      };
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0
        },
        users: {
          totalUsers,
          activeUsers,
          list: userStats // This contains per-user counts
        },
        recentActivity: {
          recentTasks,
          recentCompleted
        },
        priorityBreakdown: {
          high: highPriorityTasks,
          medium: mediumPriorityTasks,
          low: lowPriorityTasks
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/admin/tasks/user/:userId - Get all tasks for a specific user
router.get('/tasks/user/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { createdBy: req.params.userId },
        { assignedTo: req.params.userId }
      ]
    })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });

    const user = await User.findById(req.params.userId).select('name email role');

    res.json({
      success: true,
      data: {
        user,
        tasks,
        statistics: {
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'completed').length,
          pending: tasks.filter(t => t.status === 'pending').length,
          inProgress: tasks.filter(t => t.status === 'in-progress').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


export default router;