const express = require("express");
const { createUserTable, register } = require("../controllers/userControllers");

const router = express.Router();

router.get('/createTable', createUserTable);
router.post('/register', register);

module.exports=router;