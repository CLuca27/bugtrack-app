const express = require('express');
const { UserProjects, Project, User} = require('../models/associations');
const projectRouter = express.Router(); 
const authenticateSession = require('../middleware/authenticateSession')
const { Op } = require('sequelize');

projectRouter.post('/create', authenticateSession, async (req, res) => {
  try {
    const { name, repositoryLink, status, description } = req.body;
    const userId = req.user.id;

    if (!name || !repositoryLink) {
      return res.status(400).json({ message: 'Name and repositoryLink are required' });
    }

    const project = await Project.create({
      name,
      repositoryLink,
      status,       
      description
    });

    
    await UserProjects.create({
      userId,
      projectId: project.id,
      role: 'MP'
    });

    return res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}); 

projectRouter.get("/available", authenticateSession, async (req, res) => {
  try {
    const userId = req.user.id; // mai bine decat req.session.user.id, pt ca middleware deja seteaza req.user

    const links = await UserProjects.findAll({
      where: { userId },
      attributes: ["projectId"],
    });

    const myProjectIds = links.map(x => x.projectId);

    const availableProjects = await Project.findAll({
      where: myProjectIds.length
        ? { id: { [Op.notIn]: myProjectIds } }
        : {},
    });

    return res.status(200).json({ projects: availableProjects });
  } catch (error) {
    console.error("GET /projects/available error:", error);
    return res.status(500).json({ message: "Eroare server", error: String(error) });
  }
});


projectRouter.get('/:id', authenticateSession, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);

   
    const role = req.user.roles[projectId];

    if (!role) {
      return res.status(403).json({ message: 'User not associated with this project' });
    }

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({ project, role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}); 

projectRouter.get('/', authenticateSession, async (req, res) => {
  try {
    const projectIds = Object.keys(req.user.roles).map(id => parseInt(id, 10));

    if (projectIds.length === 0) {
      return res.status(200).json({ projects: [] });
    }

    const projects = await Project.findAll({
      where: { id: projectIds }
    });

    const result = projects.map(p => ({
      id: p.id,
      name: p.name,
      repositoryLink: p.repositoryLink,
      status: p.status,
      description: p.description,
      role: req.user.roles[p.id]   
    }));

    return res.status(200).json({ projects: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
});
 
projectRouter.put('/:id', authenticateSession, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const { name, description, status, repositoryLink } = req.body;

    const role = req.user.roles[projectId];

    if (!role) {
      return res.status(403).json({ message: 'User not associated with this project' });
    }

    if (role !== 'MP') {
      return res.status(403).json({ message: 'Only MP can update this project' });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    let changed = false;

    // NAME
    if (name !== undefined && name !== project.name) {
      project.name = name;
      changed = true;
    }

    // DESCRIPTION
    if (description !== undefined && description !== project.description) {
      project.description = description;
      changed = true;
    }

    // STATUS
    if (status !== undefined && status !== project.status) {
      project.status = status;
      changed = true;
    }

    // REPOSITORY LINK
    if (repositoryLink !== undefined && repositoryLink !== project.repositoryLink) {
      project.repositoryLink = repositoryLink;
      changed = true;
    }

    if (!changed) {
      return res.status(200).json({
        message: 'No changes were made to the project',
        project
      });
    }
    await project.save();

    return res.status(200).json({
      message: 'Project updated successfully',
      project
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
});

projectRouter.post('/:id/add-tester', authenticateSession, async (req, res) => {
    try {
        const projectId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        const existingAssociation = await UserProjects.findOne({
            where: { userId, projectId }
        });

        if (existingAssociation) {
            if (existingAssociation.role === 'TST') {
                return res.status(409).json({ message: 'You are already registered as TST for this project.' });
            } else if (existingAssociation.role === 'MP') {
                return res.status(409).json({ message: 'You are already an MP for this project.' });
            }
        }

        await UserProjects.create({
            userId,
            projectId,
            role: 'TST'
        });
        return res.status(201).json({ 
            message: 'Successfully registered as TST for the project.', 
            projectId 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error during TST registration' });
    }
});
projectRouter.post('/:id/add-member', authenticateSession, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const { email } = req.body; // Am eliminat 'role' din body, îl setăm automat mai jos

    // 1. Găsim utilizatorul după email
    const userToAdd = await User.findOne({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ message: 'Utilizatorul cu acest email nu a fost găsit în baza de date.' });
    }

    // 2. Îl adăugăm automat ca MP (Project Manager)
    await UserProjects.create({
      userId: userToAdd.id,
      projectId,
      role: 'MP' // Rol fixat automat aici
    });

    return res.status(201).json({ message: 'Membru adăugat cu succes ca MP!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Eroare la server.' });
  }
});
module.exports = projectRouter;