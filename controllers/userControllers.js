const client=require('../database/db');

const createUserTable = async (req, res) => {
    try{
        await client.query(
            `CREATE TABLE officers (
                officer_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                post VARCHAR(255),
                dist VARCHAR(255),
                dept VARCHAR(255)
            )`
        );

        console.log("Officers Table created");


        const create=await client.query(
            `CREATE TABLE users (
                id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255),
                password VARCHAR(255),
                adharCardNumber VARCHAR(255),
                role VARCHAR(50) DEFAULT 'citizen',
                designation INT,
                FOREIGN KEY (designation) REFERENCES officers(officer_id)
            )`
        );

        console.log("user Table create",create);
        res.status(200).json({message:"user table created"});

    }catch(error){
        console.log("get error from create user table",error);
        res.status(500).json({error:error});
    }
}

module.exports = {
    createUserTable
}