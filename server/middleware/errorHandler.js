const errorHandler = (err, req, res, next) => {
  console.error('[API Error]:', err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'कुछ गलत हो गया। कृपया दोबारा कोशिश करें।',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
