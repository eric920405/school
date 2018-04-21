const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const low = require("lowdb");
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ users: [] }).write();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get("/",function(){
    res.status(200).sendFile(__dirname + "/main/welcome.html");
});

app.listen(3000,function(){
    console.log("server start");
});