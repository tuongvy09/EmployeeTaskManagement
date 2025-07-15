const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const ownerRoutes = require('./routes/OwnerRoute');
const employeeRoutes = require('./routes/EmployeeRoute');
const handleSocket = require('./config/socket');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use("/api", ownerRoutes);
app.use("/api/employee", employeeRoutes);

io.on("connection", (socket) => {
    handleSocket(socket, io);
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
