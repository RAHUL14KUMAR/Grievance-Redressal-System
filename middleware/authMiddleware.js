const jwt = require("jsonwebtoken");
const client=require('../database/db');

const protect=async(req,res,next)=>{
    try{
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token=req.headers.authorization.split(" ")[1];
        }
        if(!token){
            return res.status(401).json({message:"Not authorized to access this route"});
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await client.query(`SELECT * FROM users WHERE id=$1`,[decoded.id]);
        if(user.rows.length===0){
            return res.status(404).json({message:"No user found with this id"});
        }
        req.user=user.rows[0];
        next();
    }catch(error){
        console.log("get error from protect middleware",error);
        return res.status(500).json({error:error});
    }
}

module.exports={
    protect
}