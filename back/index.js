// server/index.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Change this to your Vite dev server URL
    methods: ["GET", "POST"]
  }
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'roots',
  password: '',
  database: 'chat'
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('message', (message) => {
    io.emit('message', message);

    // Save message to the database
    const query = 'INSERT INTO messages (content) VALUES (?)';
    db.query(query, [message], (err, result) => {
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
