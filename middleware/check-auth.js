const jwt = require('jsonwebtoken');
const _ = require('underscore');

/**
 * Check Authentication and Authorization
 * @param {string[]} allowedRoles - allowed roles to access route
 */
module.exports = async(allowedRoles, req, res, next) => {
  if(req.headers.authorization){
      const token = req.headers.authorization.split(" ")[1];
      if(token !== "null"){
        try{
          const decodedToken = jwt.verify(token, "secret");
          const role = await req.redisClient.get(decodedToken.empNum);
  
          const roles = _.intersection([role] , allowedRoles);
          if (roles.length > 0) {
            next();
          } else {
            res.status(401).json({ message: "Auth failed!" });
          }
        } catch(err){
          console.log(err);
          res.status(401).json({ message: "Auth failed! invalid token" });
        }
        
      } else {
        res.status(401).json({ message: "Auth failed!" });
      }
  } else{
    res.status(401).json({ message: "Access Denied!" });
  }
}
