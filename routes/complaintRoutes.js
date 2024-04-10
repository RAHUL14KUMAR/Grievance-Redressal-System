const express = require("express");
const { createComplaintTable } = require("../controllers/complaintControllers");

const router = express.Router();

router.get('/createTable', createComplaintTable);

module.exports=router;