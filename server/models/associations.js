const Bug = require('./bug') 
const Project = require('./project') 
const User = require('./user') 
const UserProjects = require('./userProjects')

User.belongsToMany(Project, {
  through: UserProjects,
  foreignKey: 'userId',
  otherKey: 'projectId',
  as: 'Projects',
});


Project.belongsToMany(User, {
  through: UserProjects,
  foreignKey: 'projectId',
  otherKey: 'userId',
  as: 'Users',
}); 


Bug.belongsTo(Project, {foreignKey: 'projectId'}) 


Bug.belongsTo(User, {foreignKey: 'reporterId'}) 


Bug.belongsTo(User, {foreignKey: 'assignedToId'})

module.exports = {Bug, Project, User, UserProjects}