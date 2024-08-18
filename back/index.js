// server/index.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const db = require('./db');
const app = express();
const dotenv = require('dotenv');


dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
}));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});



app.use(express.json());
const saltRounds = 10;


app.post('/api/signup', (req, res) => {
  const { email, userName, password } = req.body;

  if (!email || !userName || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  bcrypt.hash(password, saltRounds, (err, hashedPassword) =>{
    if(err){
      console.error('Error When Hasheing', err);
      return res.status(500).json({success:false, message: 'Sign-in failed' });
    }

    const query = 'INSERT INTO user (email, userName, password) VALUES (?, ?, ?)';
  db.query(query, [email, userName, hashedPassword], (err, result) => {
      if (err) {
          console.error('Error inserting user data:', err);
          return res.status(500).json({ success: false, message: 'Sign-in failed' });
      }
      res.json({ success: true, message: 'Sign-in successful' });
    })
  });
});




app.post('/api/login', (req, res)=>{
  const { email, password} = req.body;

  const queryLogin = 'SELECT * FROM user where email = ?';
  db.query(queryLogin, [email], (err, results) =>{
    if(err){
      console.error('ERROR WHEN RETRIVE PASS', err);
      return res.status(500).json({success:false, message: 'Login failed' });
    }
    if(results.length === 0 ){
      return res.status(400).json({ success: false, message : 'user not found' });
    }

    const user = results[0];
    const hashedPassword = results[0].password;

    bcrypt.compare(password, hashedPassword, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ success: false, message: 'Login failed' });
            }

            if (isMatch) {
                const token = jwt.sign({ id: user.id, email: user.email, password: user.password }, jwtSecret, { expiresIn: '7h' });
                res.json({ success: true, token });
            } else {
                res.status(400).json({ success: false, message: 'Incorrect password' });
            }
    });
  })
})





app.post('/api/group', (req, res) => {
  const { groupName, password, userId } = req.body;

  if (!groupName || !password || !userId) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  bcrypt.hash(password, saltRounds, (err, hashedPassword) =>{
    if(err){
      console.error('Error When Hashing', err);
      return res.status(500).json({success:false, message: 'Group Create failed' });
    }

    const queryGroup = 'INSERT INTO chat_group (groupName, password,createdBy) VALUES (?, ?, ?)';
  db.query(queryGroup, [ groupName, hashedPassword, userId], (err, result) => {
      if (err) {
          console.error('Error inserting user data:', err);
          return res.status(500).json({ success: false, message: 'Group Create failed' });
      }
      res.json({ success: true, message: 'Group Create successful' });
    })

    const query = 'INSERT INTO chat_group_access (group_id, user_id,status) VALUES (?, ?, 1)';
  db.query(query, [ groupName, userId], (err, result) => {
      if (err) {
          console.error('Error inserting user data:', err);
          return res.status(500).json({ success: false, message: 'Group Create failed' });
      }
      res.json({ success: true, message: 'Group Create successful' });
    })
  });
});

// app.get('/api/protected', verifyToken, (req, res) => {
//   res.json({ success: true, message: 'Access granted', userId: req.userId });
// });





function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token, unauthorized

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err)return res.sendStatus(403);

    const userId = user.id;

    const querys = 'SELECT * FROM user WHERE id = ?';
    db.query(querys,[userId], (err,result) => {
        if(err){
          console.error('Error Query User' , err);
          return res.sendStatus(500);
        };
        if(result.length === 0 ){
          console.log('user not found', err);
          return res.sendStatus(404);
        }
        console.log(result[0]);
      req.user = result[0];
      next();
    })
  });
}



app.get('/api/get_group', authenticateToken , (req,res) =>{
  const userId=  req.user.id;
  const query = 'SELECT a.* FROM chat_group a, chat_group_access b WHERE a.id = b.group_id AND (b.user_id = ? OR a.createdBy = ?)';
  db.query(query, [ userId, userId], (err, result) => {
      if (err) {
          console.error('Error finding group chat', err);
          return res.status(500).json({ success: false, message: 'Error FInding Group' });
      }
      console.log('Groups:', result);
      res.json({ success: true, groups: result });

    })
})



app.get('/api/showmessage', (req,res) =>{
  const groupId = req.query.groupId
  const query = 'SELECT * FROM messages WHERE group_id = ? ';
  db.query(query, [ groupId ], (err, result) => {
      if (err) {
          console.error('Error finding group chat', err);
          return res.status(500).json({ success: false, message: 'Error FInding Group' });
      }
      console.log('Messages:', result);
      res.json({ success: true, messages: result });

    })
})


io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('message', (messageData) => {
    const { content, groupId, userId} = messageData;
    io.emit('message', messageData);

    const query = 'INSERT INTO messages (content, group_id , user_id) VALUES (?,?,?)';
    db.query(query, [content, groupId, userId], (err, result) => {
      if (err) throw err;
      console.log('Message saved to database');
    });
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
