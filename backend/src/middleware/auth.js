const jwt = require('jsonwebtoken');

const authMiddleware = (context) => {
  // Extract token from headers
  const authHeader = context.req.headers['authorization'];
  if (!authHeader) throw new Error('Authentication required');
  
  // Token comes as "Bearer <token>"
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user information to context
    context.user = decoded;
    
    return context;
  } catch (err) {
    throw new Error('Invalid token');
  }
};

const adminMiddleware = (context) => {
  if (!context.user || !context.user.isAdmin) {
    throw new Error('Admin access required');
  }
  return context;
};

module.exports = { authMiddleware, adminMiddleware };