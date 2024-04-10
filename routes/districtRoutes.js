const express = require("express");
const { createDistrictTable } = require("../controllers/districtControllers");

const router = express.Router();

router.get('/createTable', createDistrictTable);

module.exports=router;