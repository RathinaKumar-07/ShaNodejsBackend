const jwt = require('jsonwebtoken');


function generateToken(user) {
  return jwt.sign(user, "town-council", { expiresIn: '1h' });
}

function verifyToken(token) {
  return jwt.verify(token, "town-council");
}

module.exports = { generateToken, verifyToken };