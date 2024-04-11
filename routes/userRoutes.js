const express = require("express");
const { createUserTable, register, login, adminAddOfficer,putDesignation, allOfficersInAdminDashboard, changeDesignation } = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get('/createTable', createUserTable);
router.get('/seeAllOfficers',protect, allOfficersInAdminDashboard);

router.post('/register', register);
router.post('/login',login)
router.post("/addOfficer", protect, adminAddOfficer);

router.put("/addDesignation", protect, putDesignation);
router.put("/changeDesignation", protect, changeDesignation);

module.exports=router;