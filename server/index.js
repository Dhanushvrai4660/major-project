require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Socket.io
require('./socket/signaling')(io);

// MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected!'))
.catch((err) => console.log('DB Error:', err));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'IRCP Server is running!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`IRCP Server running on port ${PORT}`);
});