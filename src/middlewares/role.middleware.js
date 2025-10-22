const restrictTo = function (...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        status: "success",
        message: "You are not logged in please log in",
      });
    }

    if (allowedRoles.includes(req.user.role) === false) {
      return res.status(403).json({
        status: "fail",
        message: "Acess denied.You cant perform these action",
      });
    }

    next();
  };
};

module.exports={restrictTo};
