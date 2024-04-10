const express = require("express");
const { createUserTable } = require("../controllers/userControllers");

const router = express.Router();

router.get('/createTable', createUserTable);

module.exports=router;