const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const md5 = require("md5");
const fs = require("fs");
const low = require("lowdb");
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ users: [] , server: []}).write();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(session({ secret: 'Because this is a school session , so it must be difficult to read .', key: 'PHPSESSID', proxy: true, resave: true, saveUninitialized: true}));

const serverData = db.get("server").find({server:"server"});

const checkReg = {english:/^(?=.*[A-Za-z]).*$/,number:/^(?=.*[0-9]).*$/};

const checkCode = function(a){
    var b = a;
    a = ""+a;
    a = a.split("");
    for(var i = 0;i<a.length;i++){
        a[i]*=1;
    }
    return b*10+(a[0]*a[2]*a[4]*a[6]+a[1]+a[3]+a[5])%10;
}

app.get("/",function(req,res){
    if(req.session.user){
        res.status(200).sendFile(__dirname + "/main/main.html");
    }else{
        res.status(200).sendFile(__dirname + "/main/welcome.html");
    }
});

app.get("/data-class",(req,res) => {
    if(req.session.user){
        var data = db.get("users").find({number:req.session.user.number}).value().class;
        if(data.length==0){
            res.sendStatus(404);
        }else{
            res.status(200).send(data);
        }
    }else{
        res.sendStatus(400);
    }
});

app.post("/login",function(req,res){
    var user = db.get("users").find({name:req.body.name}).value();
    if(!user){
        user = db.get("users").find({number:req.body.name/1}).value();
    }
    if(!user){
        res.status(400).send();
    }else{
        if(md5(req.body.password)==user.password){
            req.session.user = user;
            res.status(200).send()
        }else{
            res.status(400).send();
        }
    }
});

app.get("/register",function(req,res){
    if(req.session.user){
        res.redirect(302,"/");
    }else{
        res.status(200).sendFile(__dirname + "/main/register.html");
    }
});

app.post("/create-account",function(req,res){
    var user = db.get("users").find({name:req.body.name}).value();
    if(user){
        res.status(400).send({name:true,password:false,text:"帳號名稱已使用!!"});
    }else{
        var wrong = {name:false,password:false,text:"資料須有英文和數字!!"}
        if(!(checkReg.english.test(req.body.name)&&checkReg.number.test(req.body.name))){
            wrong.name = true;
        }
        if(!(checkReg.english.test(req.body.password)&&checkReg.number.test(req.body.password))){
            wrong.password = true;
        }
        if(wrong.name||wrong.password){
            res.status(400).send(wrong);
        }else{
            db.get("users").push({name:req.body.name,password:md5(req.body.password),number:checkCode(serverData.value().number),class:[]}).last().write();
            serverData.assign({number:serverData.value().number+1}).write();
            res.status(200).send(""+checkCode(serverData.value().number-1));
        }
    }
});

app.get("/logout",(req,res) =>{
    delete req.session.user;
    res.redirect(302,"/");
})
app.listen(3000,function(){
    console.log("server start");
});