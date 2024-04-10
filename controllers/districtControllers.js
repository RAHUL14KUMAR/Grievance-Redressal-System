const client=require('../database/db');

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

module.exports={
    createDistrictTable
}