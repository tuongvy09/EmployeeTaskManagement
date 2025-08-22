const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");

const ownerRoutes = require("./routes/OwnerRoute");
const employeeRoutes = require("./routes/EmployeeRoute");
const notificationRoutes = require("./routes/NotificationRoutes");
const { initSocket } = require("./config/socket");

dotenv.config();

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

app.use("/api", ownerRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
