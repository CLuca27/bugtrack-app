const { UserProjects } = require('../models/associations');

const authenticateSession = async (req, res, next) => {
  // 1. Verificăm dacă există o sesiune activă. 
  // Folosim 401 (Unauthorized) pentru a semnala Frontend-ului că trebuie să redirecționeze la Login.
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Access denied. User not authenticated.' });
  }

  try {
    const userId = req.session.user.id;

    // 2. Interogăm Baza de Date pentru cele mai noi asocieri (Roluri).
    // Aceasta rezolvă problema cu "User not associated" fără a mai fi nevoie de Logout/Login.
    const userProjects = await UserProjects.findAll({
      where: { userId },
      attributes: ['projectId', 'role']
    }); 

    // 3. Construim obiectul de roluri. 
    // Ne asigurăm că cheia este de tip String (pentru a corespunde cu req.query.projectId).
    const projectRoles = {};
    userProjects.forEach(up => {
      projectRoles[up.projectId.toString()] = up.role;
    }); 

    // 4. Atașăm obiectul req.user pentru rutele următoare.
    req.user = {
      id: userId,
      email: req.session.user.email,
      roles: projectRoles      
    };
    
    // 5. Permitem trecerea la următoarea funcție din ruter.
    next();

  } catch (error) {
    console.error('Eroare în middleware-ul de autentificare:', error);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
} 

module.exports = authenticateSession;