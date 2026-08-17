const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'एडमिन लॉगिन आवश्यक है।' });
  }
  try {
    const decoded = jwt.verify(
      authHeader.split(' ')[1],
      process.env.JWT_SECRET || 'kaam_saathi_super_secret_jwt_key_2026'
    );
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'एडमिन अनुमति आवश्यक है।' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'एडमिन सत्र समाप्त हो गया है।' });
  }
};
