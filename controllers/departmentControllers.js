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

module.exports={
    createDepartmentTable
}