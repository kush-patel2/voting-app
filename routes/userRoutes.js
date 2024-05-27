const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt');

router.post('/signup', async (req,res) => {
    try {
     const data = req.body;
     const newUser = new User(data);
     
    const response = await newUser.save()
    console.log(' User Data Saved');

    const payload = {
        id: response.id,
        
    }
    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is: ", token);

    res.status(200).json({response: response, token: token});
    } catch (error) {
     console.log(error);
     res.status(500).json({error: 'Internal server Error'});
    }
 
 });

 //login route
 router.post("/login", async (req, res) =>{
    try {
        //Extract username and password from body
        const {aadharCardNumber, password} = req.body;

        //Find user by username
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});
        if(!user || !(await user.comparePassword(password))){
            return res.status(404).json({ error: 'Invalid username or password'});
        }

        //generate tokens
        const payload = {
            id : user.id,
        };
        const token = generateToken(payload);

        //return token as response
        res.json({token})

    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server Error'});
    }
 });

 //profile routes
 router.get('/profile', jwtAuthMiddleware, async (req,res) =>{
    try {
        const userData = req.user;
        console.log(" User Data", userData);

        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json({user});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server Error'});
    }
 })



router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user;
        const {currentPassword, newPassword} = req.body;

        //Find user by username
        const user = await User.findById(userId);

        if(!(await user.comparePassword(currentPassword))){
            return res.status(404).json({ error: 'Invalid username or password'});
        }

        //update user's password
        user.password = newPassword;
        await user.save();

        
        console.log('Password Updated');
        res.status(200).json({message: "Password Updated"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server Error'});
    }
});



//comment added

module.exports = router;