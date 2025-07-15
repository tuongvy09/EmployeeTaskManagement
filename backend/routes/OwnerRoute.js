const express = require("express");
const router = express.Router();
const {
    createNewAccessCode,
    validateAccessCode,
    createEmployee,
    setupEmployeeAccount,
    getEmployees,
    updateEmployee,
    deleteEmployee
} = require("../controllers/Owner.js");
const { refreshToken } = require("../controllers/auth.js");
const { createTask, assignTask, getTasks } = require("../controllers/Tasks.js");
const { getAllConversations, getConversationDetail, createConversation } = require("../controllers/Chat.js");
const { verifyTokenAndOwner, verifyToken } = require("../middleware/authMiddleware.js");

router.post("/createNewAccessCode", createNewAccessCode);
router.post("/validateAccessCode", validateAccessCode);
router.post("/createEmployee", verifyTokenAndOwner, createEmployee);
router.post("/setupEmployeeAccount", setupEmployeeAccount);
router.get("/getEmployees", verifyTokenAndOwner, getEmployees);
router.put("/updateEmployee/:id", verifyTokenAndOwner,  updateEmployee);
router.delete("/deleteEmployee/:id", verifyTokenAndOwner, deleteEmployee);
router.post("/createTask", verifyTokenAndOwner, createTask);
router.put("/:id/assign",verifyTokenAndOwner,  assignTask);
router.get("/getTasks", verifyTokenAndOwner,  getTasks);

router.get("/getAllConversations/:userId", verifyToken,  getAllConversations);
router.get("/conversation/:conversationId", verifyToken,  getConversationDetail);
router.post("/messages/conversation", createConversation);

router.post('/refresh-token', refreshToken);

module.exports = router;
