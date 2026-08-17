// @desc Get helpline operational status
// @route GET /api/helpline/status
exports.getStatus = async (req, res, next) => {
  try {
    const now = new Date();
    const currentHour = now.getHours(); // 0 - 23

    // Operational hours: 6 AM (6) to 6 PM (18)
    const isOpen = currentHour >= 6 && currentHour < 18;
    const helplineNumber = process.env.HELPLINE_NUMBER || '+919876543210';

    res.status(200).json({
      success: true,
      isOpen,
      helplineNumber,
      operatingHours: 'सुबह 6 बजे से शाम 6 बजे तक',
      message: isOpen
        ? 'ऐप चलाने में परेशानी है? हमें कॉल करें।'
        : 'हेल्पलाइन सुबह 6 बजे से शाम 6 बजे तक उपलब्ध है।',
      currentServerTime: now.toLocaleTimeString('en-US', { hour12: true })
    });
  } catch (err) {
    next(err);
  }
};
