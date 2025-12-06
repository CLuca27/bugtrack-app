const express = require('express');
const { Bug, UserProjects} = require('../models/associations'); // Modelul Bug
const bugRouter = express.Router();
const authenticateSession = require('../middleware/authenticateSession')

async function isProjectMember(userId, projectId) {
    const roleEntry = await UserProjects.findOne({
        where: { userId, projectId, role: 'MP' }
    });
    return !!roleEntry; 
}

bugRouter.get('/', authenticateSession, async (req, res) => {
  try {
    const projectId = parseInt(req.query.projectId, 10);

    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required as query param' });
    }

    
    const role = req.user.roles[projectId]; 

    if (!role) {
      return res.status(403).json({ message: 'User not associated with this project' });
    }

    const bugs = await Bug.findAll({ where: { projectId } });

    return res.status(200).json({ bugs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}); 

bugRouter.post('/', authenticateSession, async (req, res) => {
  try {
    const { description, severity, priority, commitLink, projectId } = req.body;

    const numericProjectId = parseInt(projectId, 10);
    if (!numericProjectId) {
      return res.status(400).json({ message: 'projectId is required in body' });
    }

    const role = req.user.roles[numericProjectId];

    if (!role) {
      return res.status(403).json({ message: 'User not associated with this project' });
    }

    if (role !== 'TST') {
      return res.status(403).json({ message: 'Only TST can create bugs' });
    }

    const bug = await Bug.create({
      description,
      severity,
      priority,
      commitLink,
      projectId: numericProjectId,
      reporterId: req.user.id,
      status: 'OPEN'
    });

    return res.status(201).json({ message: 'Bug created successfully', bug });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}); 

bugRouter.put('/:id', authenticateSession, async (req, res) => {
  try {
    const bugId = parseInt(req.params.id, 10);
    const { status, commitLink } = req.body;

    const bug = await Bug.findByPk(bugId);

    if (!bug) {
      return res.status(404).json({ message: 'Bug not found' });
    }

    const projectId = bug.projectId;
    const role = req.user.roles[projectId];

    if (!role) {
      return res.status(403).json({ message: 'User not associated with this project' });
    }

    if (role !== 'MP') {
      return res.status(403).json({ message: 'Only MP can update bug status' });
    }

    if (status) {
      bug.status = status;
    }
    if (commitLink) {
      bug.resolutionCommitLink = commitLink; 
    }

    await bug.save();

    return res.status(200).json({ message: 'Bug status updated successfully', bug });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}); 

bugRouter.put('/:id/assign', authenticateSession, async (req, res) => {
    try {
        const bugId = parseInt(req.params.id, 10);
        const mpId = req.user.id;

        const bug = await Bug.findByPk(bugId);
        if (!bug) {
            return res.status(404).json({ message: 'Bug not found.' });
        }

        const projectId = bug.projectId;
        const isMP = await isProjectMember(mpId, projectId);
        if (!isMP) {
             const role = req.user.roles[projectId];
             if (!role) {
                 return res.status(403).json({ message: 'User not associated with this project.' });
             }
             return res.status(403).json({ message: 'Access denied. Only MP can assign bugs.' });
        }
        if (bug.status === 'solved') {
            return res.status(400).json({ message: 'Cannot assign a bug that is already solved.' });
        }
        if (bug.assignedToId !== null && bug.assignedToId !== mpId) {
             return res.status(400).json({ 
                 message: `Bug is already assigned to MP with ID: ${bug.assignedToId}.` 
             });
        }
    
        bug.assignedToId = mpId;
        bug.status = 'in_progres'; 
        await bug.save();

        return res.status(200).json({ 
            message: 'Bug assigned successfully and status updated to in_progres.', 
            bug 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error during bug assignment' });
    }
});




module.exports = bugRouter;