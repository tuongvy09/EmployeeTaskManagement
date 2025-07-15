const express = require("express");
const { getTasksAssignedToEmployee, getEmployeeInfo, updateEmployeeInfo } = require("../controllers/Employee");
const { completeTask } = require("../controllers/Tasks");
const { getAllConversations } = require("../controllers/Chat");
const { verifyTokenAndEmployee } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/assigned/:employeeId", getTasksAssignedToEmployee);
router.put("/completeTasks/:id", completeTask);
router.get("/getAllConversations/:userId",  getAllConversations);
router.get("/:userId", verifyTokenAndEmployee, getEmployeeInfo);
router.put("/update/:userId", verifyTokenAndEmployee, updateEmployeeInfo);

module.exports = router;
