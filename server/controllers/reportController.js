const WorkerReport = require('../models/WorkerReport');

exports.createWorkerReport = async (req, res, next) => {
  try {
    const employerId = req.user?.id || req.user?._id;

    const {
      workerId,
      reason,
      description
    } = req.body;

    if (!employerId) {
      return res.status(401).json({
        success: false,
        message: 'Employer login required.'
      });
    }

    if (!workerId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Worker और report reason जरूरी हैं।'
      });
    }

    const report = await WorkerReport.create({
      worker: workerId,
      employer: employerId,
      reason: reason.trim(),
      description: description?.trim() || ''
    });

    res.status(201).json({
      success: true,
      message: 'Report admin को भेज दी गई है।',
      report
    });
  } catch (error) {
    next(error);
  }
};

exports.getWorkerReports = async (req, res, next) => {
  try {
    const reports = await WorkerReport.find()
      .populate('worker', 'name phone skill')
      .populate('employer', 'name phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      reports
    });
  } catch (error) {
    next(error);
  }
};

exports.updateWorkerReport = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['new', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report status.'
      });
    }

    const report = await WorkerReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('worker', 'name phone skill')
      .populate('employer', 'name phone');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report नहीं मिली।'
      });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};