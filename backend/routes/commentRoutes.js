const express = require("express");
const multer = require("multer");
const { createComment, getComments } = require("../controllers/comment");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), createComment);

router.get("/:taskId", getComments);

module.exports = router;
