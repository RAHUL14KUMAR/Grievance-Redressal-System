const express = require("express");
const { createUserTable, register, login } = require("../controllers/userControllers");

const router = express.Router();

router.get('/createTable', createUserTable);
router.post('/register', register);
router.post('/login',login)

module.exports=router;