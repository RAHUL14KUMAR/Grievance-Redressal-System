const client=require('../database/db');
const { get } = require('../routes/userRoutes');

const createComplaintTable = async (req, res) => {
    try{
        await client.query(
            `
            CREATE TABLE nodal (
                nodal_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                complaint_id INT,
                assignedDept VARCHAR(255),
                assignedDist VARCHAR(255),
                assignedPost VARCHAR(255),
                markDone CHAR(1) DEFAULT 'N' CHECK (markDone IN ('Y', 'N'))
                foreign key (complaint_key) references complaints(c_id)
               );
            `
        )

        console.log("Complaint NODAL Table created");

        await client.query(
            `create table comments(
                comment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                complaint_id INT,
                comment_text VARCHAR(255),
                comment_by VARCHAR(255),
                foreign key (complaint_id) REFERENCES complaints(c_id)
            );`
        )
        console.log("comment table created");

        const create=await client.query(
            `create table complaints(
                c_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                raisedBy varchar(100),
                description varchar(100),
                image varchar(100),
                department varchar(100),
                district varchar(100),
                descriptionByNodalOfficer varchar(100),
                status varchar(100) default 'UN-RESOLVED' CHECK (STATUS IN ('PARTIALLY-RESOLVED', 'RESOLVED', 'UN-RESOLVED'))
            )`
        )
        console.log("create complaint table",create)
        res.status(200).json({message:"complaint table created"});

    }catch(error){
        console.log("get error from create complaint table",error);
        res.status(500).json({error:error});
    }
}

// complaint create by users/citizen
const createComplaint=async(req,res)=>{
    try{
        const {email,role}=req.user;
        const {description,image,department,district}=req.body;

        if(role!=="citizen"){
            res.status(400);
            throw new Error("Not authorized to create complaint");
        }else{
            const create=await client.query(
                `INSERT INTO complaints(raisedBy,description,image,department,district) VALUES($1,$2,$3,$4,$5)`,[email,description,image,department,district]
            );
            console.log("create complaint",create);
            res.status(200).json({message:"Complaint created"}); 
        
        }
    }catch(error){
        console.log("get error from create complaint",error);
        res.status(500).json({error:error});
    }
}

// complaint seen vy citizen/nodal officer
const getComplaint=async(req,res)=>{
    try{
        const{designation,role,email}=req.user;

        console.log(role,designation)
        if(role==='citizen'){
            const get=await client.query(
                `SELECT * FROM complaints WHERE raisedBy=$1`,[email]
            );
            res.status(200).json({complaints:get.rows});
        }else if(role==="officer"){
            const getPost=await client.query(`
            SELECT * FROM officers WHERE officer_id=$1`,[designation]);

            if(getPost.rows[0].post==='nodal officer'){
                const get=await client.query(
                    `SELECT * FROM complaints WHERE district=$1 and department=$2`,
                    [
                        getPost.rows[0].dist,
                        getPost.rows[0].dept
                    ]
                );
                console.log("get complaint",get);
                res.status(200).json({complaints:get.rows});
            }
        }else{

        }

    }catch(error){
        console.log("get error from get complaint",error);
        res.status(500).json({error:error});
    }
}

// nodal officer can add descriptiton on particular complaint

const addNodalDescription=async(req,res)=>{
    try{
        const complainId=req.params.id;
        const {designation}=req.user;
        const {description}=req.body;

        const getPost=await client.query(`
            SELECT * FROM officers WHERE officer_id=$1`,[designation]
        );

        if(getPost.rows[0].post==='nodal officer'){
            const add=await client.query(
                `UPDATE complaints SET descriptionByNodalOfficer=$1 WHERE c_id=$2`,[description,complainId]
            );
            res.status(200).json({message:"Description added successfully"});
        }

    }catch(error){
        console.log("get error from add nodal description",error);
        res.status(500).json({error:error});
    }
}

// add pathToTravel and description of particular complaint done byNodalOfficer
const addNodeToPath=async(req,res)=>{
    try{
        const complainId=req.params.id;
        const {designation}=req.user;
        const {department,post,district}=req.body;

        const complain=await client.query(`
            SELECT * FROM complaints WHERE c_id=$1`,[complainId]
        );
        
        const officers=await client.query(`
            SELECT * FROM officers WHERE OFFICER_ID=$1`,[designation]
        );

        if(officers.rows[0].post==='nodal officer' && complain.rows.length>0){
            const add = await client.query(`
                INSERT INTO nodal(complaint_id,assignedDept,assignedDist,assignedPost) VALUES($1,$2,$3,$4)`,[complainId,department,district,post]
            );
            res.status(200).json({message:"Path added successfully"});
        }

    }catch(error){
        console.log("get error from add node to path",error);
        res.status(500).json({error:error});
    }
}

// can see the complaint path that takes to travel
const seePathToTravel=async(req,res)=>{
    try{
        const complainId=req.params.id;
        const get=await client.query(`
            SELECT * FROM nodal WHERE complaint_id=$1`,[complainId]
        );
        res.status(200).json({path:get.rows});

    }catch(error){
        console.log("get error from see path to travel",error);
        res.status(500).json({error:error});
    }
}


// add comments on particular complaint
const addCommentsOnparticularComplaint=async(req,res)=>{
    try{
        const complainId=req.params.id;
        const {name}=req.user;
        const {comment}=req.body;

        const complain=await client.query(`
            SELECT * FROM complaints WHERE c_id=$1`,[complainId]
        );

        if(complain.rows.length>0){
            const add=await client.query(`
                INSERT INTO comments(complaint_id,comment_text,comment_by) VALUES($1,$2,$3)`,[complainId,comment,name]
            );
            res.status(200).json({message:"Comment added successfully"});
        }

    }catch(error){
        console.log("get error from add comments on particular complaint",error);
        res.status(500).json({error:error});
    }
}

// complaint which is assigned to a particular officer can update the status of their own process completion
const markAsDoneByAssignedOfficers=async(req,res)=>{
    try{
        const complainId=req.params.id;
        const {designation,role}=req.user;

        const officers=await client.query(`
            SELECT * FROM officers WHERE officer_id=$1`,[designation]
        )

        const complain=await client.query(`
            SELECT * FROM complaints WHERE c_id=$1`,[complainId]
        )
        
        if(complain.rows.length>0 && role==='officer'){
            const res=await client.query(`
                select * from nodal where complaint_id=$1`,[complainId]
            )

            const pathToTravel=res.rows.map((node)=>{
                if(node.assignedPost===officers.rows[0].post && node.assignedDept===officers.rows[0].dept && node.assignedDist===officers.rows[0].dist){
                    node.markDone='Y';   
                }
                return node;
            })

            let cnt=0;
            pathToTravel.forEach((node)=>{
                if(node.markDone==='Y'){
                    cnt++;
                }
            })

            if(cnt===pathToTravel.length){
                const update=await client.query(`
                    UPDATE complaints SET status='PARTIALLY-RESOLVED' WHERE c_id=$1`,[complainId]
                );
            }
            res.status(200).json({message:"Marked as done by assigned officers"});
        }

    }catch(error){
        console.log("get error from mark as done",error);
        res.status(500).json({error:error});
    }
}


// get all comments on particular complaint
const getAllCommentOnParticularComplaint=async(req,res)=>{
    try{
        const complainId=req.params.id;
        const get=await client.query(`
            SELECT * FROM comments WHERE complaint_id=$1`,[complainId]
        );
        res.status(200).json({comments:get.rows});

    }catch(error){
        console.log("get error from get all comments on particular complaint",error);
        res.status(500).json({error:error});
    }
}

// user mark complaint stsus resolved finally
const userMarkedComplaintStatus=async(req,res)=>{
    try{
        const complainId=req.params.id;
        const {role}=req.user;

        if(role==='citizen'){
            const prev_status=await client.query(`
                SELECT * FROM complaints WHERE c_id=$1`,[complainId]
            );

            if(prev_status.rows[0].status==='PARTIALLY-RESOLVED'){
                const update=await client.query(`
                    UPDATE complaints SET status='RESOLVED' WHERE c_id=$1`,[complainId]
                );

                res.status(200).json({message:"Complaint resolved"});
            }else{
                res.status(400).json({message:"Complaint is not resolved yet"});
            }
        }

    }catch(error){
        console.log("get error from user marked complaint status",error);
        res.status(500).json({error:error});
    }
}
module.exports={
    createComplaintTable,
    createComplaint,
    getComplaint,
    addNodalDescription,
    addNodeToPath,
    addCommentsOnparticularComplaint,getAllCommentOnParticularComplaint,seePathToTravel,
    userMarkedComplaintStatus,
    markAsDoneByAssignedOfficers
}