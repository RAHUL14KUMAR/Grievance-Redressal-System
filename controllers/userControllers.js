const client=require('../database/db');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');

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

const generateJwt = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
  };

const register=async(req,res)=>{
    try{
        const {email,name,password,adharCardNumber}=req.body;

        if (!name || !email || !password) {
            res.status(400);
            throw new Error("Enter all details");
        }

        const userExists=await client.query(
            `SELECT * FROM users WHERE email=$1`,[email]
        );

        if (userExists.rows.length > 0) {
            res.status(400);
            throw new Error("User already Exists");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const user=await client.query(`
            INSERT INTO users (name,email,password,adharCardNumber) VALUES ($1,$2,$3,$4)
        `,[name,email,hashedPass,adharCardNumber]);

        const a=await client.query(`SELECT * FROM users WHERE email=$1`,[email]);

        console.log("user registration successfull",a.rows[0]);

        res.json({
            id:a.rows[0].id,
            name:a.rows[0].name,
            email:a.rows[0].email,
            adharCardNumber:a.rows[0].adharcardnumber,
            role:a.rows[0].role,
            token:generateJwt(a.rows[0].id)
        })

    }catch(error){
        console.log("get error from register user",error);
        res.status(500).json({error:error});
    }
}

module.exports = {
    createUserTable,
    register
}