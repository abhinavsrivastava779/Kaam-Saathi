const Feedback = require('../models/Feedback');

exports.createFeedback = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      role,
      comment
    } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Feedback/comment लिखना जरूरी है।'
      });
    }

    const feedback = await Feedback.create({
      name: name?.trim() || 'Anonymous',
      phone: phone?.trim() || '',
      role: ['worker', 'employer'].includes(role) ? role : 'guest',
      comment: comment.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Feedback successfully submit हो गया।',
      feedback
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    next(error);
  }
};

exports.updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['new', 'reviewed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback status.'
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback नहीं मिला।'
      });
    }

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    next(error);
  }
};
