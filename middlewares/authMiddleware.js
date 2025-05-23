import jwt from 'jsonwebtoken';

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies?.token;
  //console.log('Token:', token);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token missing',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      isAdmin: decoded.isAdmin,
    };
    console.log('User ID:', req.user.id);
    //console.log('Decoded token:', decoded);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
