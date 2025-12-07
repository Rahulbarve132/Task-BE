const Task = require('../models/task.model');
const { validateTaskFields } = require('../utils/validation');

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      userId: req.user._id,
    });
    return res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { status, search, priority, dueDate, dueDateFrom, dueDateTo, overdue, upcoming } = req.query;
    let query = { userId: req.user._id };
    
    // Status filter
    if (status) query.status = status;
    
    // Priority filter
    if (priority) query.priority = priority;
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Due date filters
    if (dueDate) {
      // Filter by specific date
      const startOfDay = new Date(dueDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dueDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (dueDateFrom || dueDateTo) {
      // Filter by date range
      query.dueDate = {};
      if (dueDateFrom) {
        const fromDate = new Date(dueDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        query.dueDate.$gte = fromDate;
      }
      if (dueDateTo) {
        const toDate = new Date(dueDateTo);
        toDate.setHours(23, 59, 59, 999);
        query.dueDate.$lte = toDate;
      }
    } else if (overdue === 'true') {
      // Filter overdue tasks (due date is in the past and status is not completed)
      const now = new Date();
      query.dueDate = { $lt: now };
      query.status = { $ne: 'completed' };
    } else if (upcoming) {
      // Filter upcoming tasks (due within specified number of days)
      const days = parseInt(upcoming);
      if (!isNaN(days) && days > 0) {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        query.dueDate = { $gte: now, $lte: futureDate };
      }
    }
    
    const tasks = await Task.find(query);
    return res.status(200).json({ tasks });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.status(200).json({ task });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }
    if (!validateTaskFields(req)) {
      throw new Error("Invalid profile fields");
    }
    Object.keys(req.body).forEach((key) => (task[key] = req.body[key]));
    await task.save();
    return res.status(200).json({ message: 'Task updated', task });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }
    return res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
