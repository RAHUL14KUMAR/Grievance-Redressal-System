const express = require("express");
const { createDistrictTable, getAllDistrict, createDistrict } = require("../controllers/districtControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get('/createTable', createDistrictTable);
router.get('/getAlldistricts',protect, getAllDistrict);

router.post('/createDistrict',protect,createDistrict)

module.exports=router;