const express = require("express");

const { createDepartmentTable } = require("../controllers/departmentControllers");


const router = express.Router();

router.get('/createTable', createDepartmentTable);

module.exports=router;