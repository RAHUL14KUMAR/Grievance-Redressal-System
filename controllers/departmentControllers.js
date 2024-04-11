const client=require('../database/db');

const createDepartmentTable = async (req, res) => {
    try{
        const create=await client.query(
            `CREATE TABLE departments(
                dept_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                dept_name VARCHAR(255),
                dept_dist VARCHAR(255)
            )`
        );

        console.log("Departments Table created",create);
        res.status(200).json({message:"Department table created"});

    }catch(error){
        console.log("get error from create department table",error);
        res.status(500).json({error:error});
    }
}

// admin can create department
const createDepartment=async(req,res)=>{
    try{
        const {role}=req.user;
        const {dept_name,dept_dist}=req.body;

        if(role!=="admin"){
            res.status(400);
            throw new Error("Not authorized to create department");
        }else{
            const create=await client.query(
                `INSERT INTO departments(dept_name,dept_dist) VALUES($1,$2)`,[dept_name,dept_dist]
            );
            console.log("create department",create);
            res.status(200).json({message:"Department created"}); 
        }

    }catch(error){
        console.log("get error from create department",error);
        res.status(500).json({error:error});
    }
}


// admin can see all department district wise
const sellAllDepartmentDistrictwise=async(req,res)=>{
    try{
        const {role}=req.user;
        const {district}=req.body;

        if(role!=="admin"){
            res.status(400);
            throw new Error("Not authorized to get all department district wise");
        }else{
            const get=await client.query(
                `SELECT * FROM departments
                where dept_dist=$1`,[district]
            );
            console.log("get all department district wise",get);
            res.status(200).json({departments:get.rows});
        }

    }catch(error){
        console.log("get error from get all department district wise",error);
        res.status(500).json({error:error});
    }
}

module.exports={
    createDepartmentTable,
    createDepartment,
    sellAllDepartmentDistrictwise
}