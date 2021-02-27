const mongoose = require("mongoose");
const express  = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const auth = require('./middleware/auth');


const app = express();
const db = require("./keys").MONGO_URI;
const SECRET = require("./keys").SECRET;
app.use(bodyParser.json());




mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }).then(()=> console.log('connected')).catch((err) => console.log(err));


const port = process.env.PORT || 5000

//  Api Routes

const User  = require('./model/User');
//user  signup and login api routes
app.post('/api/signup',async(req, res) => {
    // console.log(req.body)
    // res.send(200);
     console.log(req.body);
     const {email,firstname,lastname,phone,password} = req.body;
     if(!email || !password||!firstname || !lastname || !phone){
        return res.status(400).json({err: "please enter all fields properly"});
    } 
    try {
        
        const user = await User.findOne({email})
    if(user){
       throw Error('User is already exist please sign up using another email');
    }

    const salt = await bcrypt.genSalt(14);
    if(!salt){
        throw Error('some thing not right with password')
    }
    const newPassword = await bcrypt.hash(req.body.password,salt);
    if(!newPassword){

        throw Error('something is wrong with hasing');
    }
    //creating the user 
    const newUser = new User({
        firstname:req.body.firstname,
        lastname: req.body.lastname,
        phone:req.body.phone,
        email: req.body.email,
        hashed_password: newPassword

    })
    const saveduser = await newUser.save()
     if(!saveduser){
          throw Error("User is not Saved something went wrong")
     }
     const token = jwt.sign({id:saveduser._id},SECRET, {expiresIn: 1200})
     res.status(200).json({
         token,
         user: {id:saveduser.id,
                name: saveduser.firstname,
                email:saveduser.email
               }
     })
   
    } catch (error) {
        console.log(error.message)
        res.status(400).json({error: error.message})
    }
    
    
}) // end signup 

app.post('/api/login',async(req,res)=>{
    const {email,password} = req.body;

    try {
        const loggedUser = await User.findOne({email});
        if(!loggedUser){
            throw Error("User is not present in databse ");
        }
        const ispasswordValid = await bcrypt.compare(password, loggedUser.hashed_password)
        if(!ispasswordValid){
            throw Error('user password is not valid please renter');
        }
        const token = jwt.sign({id:loggedUser._id}, SECRET,{expiresIn:1200})
        res.status(200).json({
            token,
            user:{
                id: loggedUser._id,
                name: loggedUser.firstname,
                email:loggedUser.email
            }
        })
    } catch (error) {
        res.status(400).json({err: error.message})
    }
}) // end login 

app.get('/api/profile',auth,(req, res)=>{
     
     User.findById(req.user.id).select('-hashed_password').then((user)=>{
         res.status(200).json(user)
     });
     
})
app.patch('/api/update/profile',auth,(req, res)=>{
    const userId = req.user.id;
    console.log(userId)
    console.log(req.body);
    try {
     const user =  User.findByIdAndUpdate(userId, req.body,{new:true})
     console.log(user)
    if(!user){
        console.log('USER NOT FOUND');
        return res.send(404);
    }
    res.status(200).json(user)
    } catch (error) {
        
        res.status(400).json({msg: error})
    }
})

app.listen(port,() => console.log('app is up and runnig on port') )