const express = require("express");
const { createUserTable, register, login, adminAddOfficer,putDesignation } = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get('/createTable', createUserTable);
router.post('/register', register);
router.post('/login',login)
router.post("/addOfficer", protect, adminAddOfficer);

router.put("/addDesignation", protect, putDesignation);

module.exports=router;