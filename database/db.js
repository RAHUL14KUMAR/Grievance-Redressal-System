const {Client}=require('pg')

const client=new Client({
    host:'localhost',
    user:'postgres',
    port:5432,
    password:process.env.PGPASSWORD,
    database:'SIHTEST'
})
client.connect();

module.exports = client;