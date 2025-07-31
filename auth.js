const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'clave_secreta';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token
  
  console.log('🔍 Verificando autenticación...');
  console.log('📋 Authorization header:', authHeader);
  console.log('🔑 Token extraído:', token ? 'Presente' : 'Ausente');

  if (!token) {
    console.log('❌ No se proporcionó token');
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      console.log('❌ Error al verificar token:', err.message);
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token inválido' });
      } else {
        return res.status(403).json({ error: 'Error de autenticación' });
      }
    }
    
    console.log('✅ Token válido para usuario:', user);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
