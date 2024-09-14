const express = require('express');
const path = require('path');
const JWT = require('jsonwebtoken');
const app = express();
const JWT_SECRET = 'SECRET';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware for auth
const authMiddleware = (req, res, next) => {
  const token = req.headers.token;
  if (!token) {
    return res.json({ message: 'No token provided' });
  }
  try {
    const decodedData = JWT.verify(token, JWT_SECRET);
    req.username = decodedData.username;
    next();
  } catch (error) {
    return res.json({ message: 'Invalid or expired token' });
  }
};

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (username.length < 3 || password.length < 3 || email.length < 3) {
    return res.json({
      success: false,
      message: 'Username, email, and password must be greater than 3 characters',
    });
  } else {
    const checkUser = users.find((u) => u.username === username);
    if (!checkUser) {
      users.push({
        username,
        email,
        password,
        todos: [],
      });
      res.json({
        message: 'Registered Successfully',
        success: true,
      });
    } else {
      res.json({
        success: false,
        message: 'User is Already Registered',
      });
    }
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username.length < 3 || password.length < 3) {
    return res.json({
      success: false,
      message: 'Username or password must be greater than 3 characters',
    });
  }

  const checkUser = users.find(
    (u) => u.username === username && u.password === password
  );
  if (checkUser) {
    const token = JWT.sign({ username }, JWT_SECRET);
    res.json({
      success: true,
      message: 'Logged In Successfully',
      token: token,
    });
  } else {
    res.json({
      success: false,
      message: 'Username or password is incorrect',
    });
  }
});

app.get('/me', authMiddleware, (req, res) => {
  const currentUser = req.username;
  const isUser = users.find((u) => u.username === currentUser);
  if (isUser) {
    res.json({
      success: true,
      message: 'You are authorized',
      todos: isUser.todos,
    });
  } else {
    res.json({
      success: false,
      message: 'You are not authorized',
    });
  }
});

app.post('/addtodo', authMiddleware, async (req, res) => {
  const currentUser = req.username;
  const { name } = req.body;
  const isUser = users.find((u) => u.username === currentUser);
  if (isUser) {
    isUser.todos.push({ name });
    res.json({
      success: true,
      message: 'Todo Added Successfully',
      user: isUser,
    });
  } else {
    res.json({
      success: false,
      message: 'You are not authorized',
    });
  }
});

app.post('/deleteTodo', authMiddleware, (req, res) => {
  const { id } = req.body;
  const user = req.username;
  const checkUser = users.find((u) => u.username === user);

  if (checkUser) {
    const todoId = parseInt(id);

    if (todoId !== -1) {
      checkUser.todos.splice(todoId, 1);
      res.json({
        success: true,
        message: 'Todo Deleted Successfully',
      });
    } else {
      res.json({
        success: false,
        message: 'Todo Not Found',
      });
    }
  } else {
    res.json({
      success: false,
      message: 'User Not Found',
    });
  }
});

app.listen(3000, () => {
  console.log('App is connected');
});
