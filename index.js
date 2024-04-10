require('dotenv').config();
const express=require('express');
const client = require('./database/db');
const userRoute = require("./routes/userRoutes");
const districtRoute = require("./routes/districtRoutes");
const departmentRoute = require("./routes/departmentRoutes");
const complaintRoute = require("./routes/complaintRoutes");
const cors = require("cors");
const errorMiddleware = require("./middleware/errorMiddleware");

const app=express();
app.use(express.json());

const port = process.env.PORT;

app.get("/", (req, res) => {
    res.send("hello!!!!");
});

app.use("/user", userRoute);
app.use('/district',districtRoute)
app.use('/dept',departmentRoute);
app.use('/complain',complaintRoute);

app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`);
});