const client=require('../database/db');
const { get } = require('../routes/userRoutes');

const createDistrictTable = async (req, res) => {
    try{
        const create=await client.query(
            `CREATE TABLE districts(
                d_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                d_name VARCHAR(255)
            )`
        );

        console.log("Districts Table created",create);
        res.status(200).json({message:"District table created"});

    }catch(error){
        console.log("get error from create district table",error);
        res.status(500).json({error:error});
    }
}

// admin create district
const createDistrict=async(req,res)=>{
    try{
        const {role}=req.user;
        const {d_name}=req.body;

        if(role!=="admin"){
            res.status(400);
            throw new Error("Not authorized to create district");
        }else{
            const create=await client.query(
                `INSERT INTO districts(d_name) VALUES($1)`,[d_name]
            );
            console.log("create district",create);
            res.status(200).json({message:"District created"}); 
        }

    }catch(error){
        console.log("get error from create district",error);
        res.status(500).json({error:error});
    }
}

// admin can get all district
const getAllDistrict=async(req,res)=>{
    try{
        const {role}=req.user;

        if(role!=="admin"){
            res.status(400);
            throw new Error("Not authorized to get all district");
        }else{
            const get=await client.query(
                `SELECT * FROM districts`
            );
            console.log("get all district",get);
            res.status(200).json({districts:get.rows});
        }

    }catch(error){
        console.log("get error from get all district",error);
        res.status(500).json({error:error});
    }
}

module.exports={
    createDistrictTable,
    getAllDistrict,
    createDistrict
}