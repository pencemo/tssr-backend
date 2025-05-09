import jwt from 'jsonwebtoken';

export const isAuthenticated = (req, res, next) => {
  // console.log(req.cookies)
  const token = req.cookies?.token;
  return next();
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
    console.log('Decoded token:', decoded);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
