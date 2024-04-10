const client=require('../database/db');

const createComplaintTable = async (req, res) => {
    try{
        await client.query(
            `
            CREATE TABLE nodal (
                nodal_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                assignedDept VARCHAR(255),
                assignedDist VARCHAR(255),
                assignedPost VARCHAR(255),
                markDone CHAR(1) DEFAULT 'N' CHECK (markDone IN ('Y', 'N'))
              );
            `
        )

        console.log("Complaint NODAL Table created");

        await client.query(
            `CREATE TABLE comments (
                comment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                commentText VARCHAR(1000),
                commentBy VARCHAR(255)
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
                pathToTravel nodal[],
                descriptionByNodalOfficer varchar(100),
                addComments comments[],
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
module.exports={
    createComplaintTable
}