const { verifyToken } = require('../utils/jwt');

function authenticateJWT(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.replace("Bearer ", "")
  try {
    const user = verifyToken(token);
    req.user = user;
    console.log("DecodedTokenData", req.user)
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Forbidden' });
  }
}

module.exports = { authenticateJWT };