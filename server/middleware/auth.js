const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'ऑथेंटिकेशन टोकन नहीं मिला। कृपया लॉगिन करें।'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kaam_saathi_super_secret_jwt_key_2026');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'अमान्य या पुराना ऑथेंटिकेशन टोकन।',
      error: err.message
    });
  }
};

module.exports = authMiddleware;
