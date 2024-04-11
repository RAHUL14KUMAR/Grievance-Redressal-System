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

const login=async(req,res)=>{
    try{
        const {email,password}=req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error("Enter all details");
        }

        const userExists=await client.query(
            `SELECT * FROM users WHERE email=$1`,[email]
        );

        if (userExists.rows.length === 0) {
            res.status(400);
            throw new Error("User does not Exists");
        }

        const isMatch = await bcrypt.compare(password, userExists.rows[0].password);

        if (!isMatch) {
            res.status(400);
            throw new Error("Invalid credentials");
        }

        res.json({
            id:userExists.rows[0].id,
            name:userExists.rows[0].name,
            email:userExists.rows[0].email,
            adharCardNumber:userExists.rows[0].adharcardnumber,
            role:userExists.rows[0].role,
            token:generateJwt(userExists.rows[0].id)
        })

    }catch(error){
        console.log("get error from login user",error);
        res.status(500).json({error:error});
    }
}

// admin can add new officer || nodal-officer
const adminAddOfficer=async(req,res)=>{
    try{
        const {role}=req.user;
        const { name, email, password, adharCardNumber } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        if(role!=='admin'){
            res.status(400);
            throw new Error("Only Admin can add officer");
        }else{
            const users=await client.query(
                `insert into users (name,email,password,adharCardNumber,role) values ($1,$2,$3,$4,$5)`,[name,email,hashedPass,adharCardNumber,'officer']
            )

            const a=await client.query(`SELECT * FROM users WHERE email=$1`,[email]);

            res.json({
                id:a.rows[0].id,
                name:a.rows[0].name,
                email:a.rows[0].email,
                adharCardNumber:a.rows[0].adharcardnumber,
                role:a.rows[0].role,
                token:generateJwt(a.rows[0].id)
            });
        }

    }catch(error){
        console.log("get error from add officer",error);
        res.status(500).json({error:error});
    }
}

// admin now put designation of the officer
const putDesignation=async(req,res)=>{
    try{
        const {post,dist,dept,email}=req.body;
        const {role}=req.user;

        const officer=await client.query(`
            SELECT * FROM users WHERE email=$1
        `,[email]);

        if(officer.rows.length===0){
            res.status(400);
            throw new Error("Officer not found");
        }else if(officer.rows.length>0 && role==="admin"){
            const officerDetails=await client.query(
                `insert into officers (post,dist,dept) values ($1,$2,$3)`,[post,dist,dept]
            )

            const a=await client.query(`select count(officer_id) from officers`)
            await client.query(`
                UPDATE users SET designation=$1 WHERE email=$2
            `,[a.rows[0].count,email]);

            res.status(200).json({message:"designation added successfully"});
        }

    }catch(error){
        console.log("get error from put designation",error);
        res.status(500).json({error:error});
    }
}

// see all the user whose role is officer
const allOfficersInAdminDashboard=async(req,res)=>{
    try{
        const {role}=req.user;
        if(role!=='admin'){
            res.status(400);
            throw new Error("Only Admin can see all officer");
        }else{
            const officers=await client.query(
                `SELECT * FROM users WHERE role=$1`,['officer']
            )

            res.status(200).json({officers:officers.rows});
        }

    }catch(error){
        console.log("get error from all officer in admin dashboard",error);
        res.status(500).json({error:error});
    
    }
}

// we can updtae the designation of the officer in to empty object
const changeDesignation=async(req,res)=>{
    try{
        const {email}=req.body;
        const {role}=req.user;

        const officer=await client.query(`
            SELECT * FROM users WHERE email=$1
        `,[email]);

        if(officer.rows.length===0){
            res.status(400);
            throw new Error("Officer not found");
        }else if(officer.rows.length>0 && role==="admin"){
            const id=officer.rows[0].designation;

            console.log("id",id)
            await client.query(`
                UPDATE users SET designation=$1 WHERE email=$2
            `,[null,email]);

            await client.query(`
                DELETE FROM officers WHERE officer_id=$1
            `,[id]);

            res.status(200).json({message:"designation removed successfully"});
        }

    }catch(error){
        console.log("get error from change designation",error);
        res.status(500).json({error:error});
    }
}

module.exports = {
    createUserTable,
    register,
    login,
    adminAddOfficer,
    putDesignation,
    allOfficersInAdminDashboard,
    changeDesignation
}