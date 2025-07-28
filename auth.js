const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'clave_secreta';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token
  console.log('Authorization header:', req.headers['authorization']);


  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token inválido
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
