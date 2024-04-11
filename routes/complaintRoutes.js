const express = require("express");
const { createComplaintTable, createComplaint } = require("../controllers/complaintControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get('/createTable', createComplaintTable);

router.post('/createComplain',protect,createComplaint)

module.exports=router;