const jwt = require('jsonwebtoken');


function setTokenCookie(res, userId) {
    const token = jwt.sign({ id: userId }, "JWT_SECRET", { expiresIn: '1h' });
    res.cookie('token', token, {
      httpOnly: true, // Ensures the cookie is sent only in HTTP(S) requests
      maxAge: 3600000 ,// 1 hour in milliseconds
    });
  }
  
  module.exports = setTokenCookie;