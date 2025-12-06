const { UserProjects } = require('../models/associations')
const authenticateSession = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(403).json({ message: 'Access denied. User not authenticated.' });
  }

  try {
    const userId = req.session.user.id;

  
    const userProjects = await UserProjects.findAll({
      where: { userId },
      attributes: ['projectId', 'role']
    }); 

   
    const projectRoles = {};
    userProjects.forEach(up => {
      projectRoles[up.projectId] = up.role;
    }); 


    req.user = {
      id: userId,
      email: req.session.user.email,
      roles: projectRoles      
    };

    next();

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
} 

module.exports = authenticateSession