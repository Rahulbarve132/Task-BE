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
    const { status, search } = req.query;
    let query = { userId: req.user._id };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
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
