const express = require('express');
const userRouter = express.Router();
const { User } = require('../models/associations');
const bcrypt = require('bcrypt');

userRouter.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, role });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

userRouter.post('/login', async (req, res) => {
  try {
    const { email, password} = req.body;
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }  
    req.session.user = { id: user.id, email: user.email}; 
    console.log(req.session)
    res.status(200).json({message: "Succesful login !"})
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}); 

userRouter.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(403).json({ message: 'Access denied. User not authenticated.' });
  }
  res.status(200).json({ message: 'User profile', user: req.session.user, email: req.session.email});
});


module.exports = userRouter;

