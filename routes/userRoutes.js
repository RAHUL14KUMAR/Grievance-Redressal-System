const express = require("express");
const { createUserTable, register, login, adminAddOfficer } = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get('/createTable', createUserTable);
router.post('/register', register);
router.post('/login',login)
router.post("/addOfficer", protect, adminAddOfficer);

module.exports=router;