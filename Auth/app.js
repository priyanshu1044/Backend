require("dotenv").config()
require("./database/db").connect()


const bcrypt = require("bcryptjs")
const User = require("./models/user.model")
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/register', async (req, res) => {
    try{

        const {firstname, lastname, email, password} = req.body

        if(!(email && password && firstname && lastname)){
            res.status(400).send("All input is required")
        }


        const existingUser= await User.findOne({email})
        if(existingUser){
            return res.status(409).send("User already exists")
        }

        const myEncPassword = await bcrypt.hash(password, 8)

        const user = await User.create({
            firstname,
            lastname,
            email: email.toLowerCase(),
            password: myEncPassword
        })


        const token=jwt.sign(
            {user_id: user._id, email},
            process.env.TOKEN_KEY,
            {expiresIn: "2h"},
            (err, token) => {
                if(err) throw err
                res.status(200).json({token})
            }
        )

        user.token = token
        user.password = undefined

        res.status(201).json(user)

    }catch(err){
        console.log(err)
    }
})

app.post('/login', async (req, res) => {
    try{
        //get all data from frontend
        const {email, password} = req.body
        if(!(email&&password)){
            res.status(400).send("All input is required")
        }
        //find user from db
        const user=await User.findOne({email})
        //check if user exists
        if(user && (await bcrypt.compare(password, user.password))){
            //create token
            const token=jwt.sign(
                {user_id: user._id, email},
                process.env.TOKEN_KEY,
                {expiresIn: "2h"},
                (err, token) => {
                    if(err) throw err
                    res.status(200).json({token})
                }
            )
            user.token = token
            user.password = undefined
            res.status(200).json(user)
        }
        
        //match password
        //send token to frontend
    }
    catch(err){
        console.log(err)
    }
})
module.exports = app;