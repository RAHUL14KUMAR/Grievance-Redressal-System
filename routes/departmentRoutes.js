const express = require("express");
const {protect} = require("../middleware/authMiddleware");
const { createDepartmentTable, sellAllDepartmentDistrictwise, createDepartment } = require("../controllers/departmentControllers");


const router = express.Router();

router.get('/createTable', createDepartmentTable);
router.get('/allDepartmentDistrictwise',protect,sellAllDepartmentDistrictwise)

router.post('/createDepartment',protect,createDepartment)


module.exports=router;