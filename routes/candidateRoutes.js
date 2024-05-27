const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate');
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt');

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.role === 'admin';
    } catch (error) {
        return false;
    }
}

router.post('/', jwtAuthMiddleware, async (req,res) => {
    try {
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: "user doesn't have admin role"});
        }

        const data = req.body;
        const newCandidate = new Candidate(data);
        
        const response = await newCandidate.save()
        console.log('Candidate Data Saved');

        res.status(200).json({response: response});
        } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server Error'});
    }
 
 });



router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {

        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: "user doesn't have admin role"});
        }
        const candidateId = req.params.candidateId;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true, //return updated document
            runValidators: true, //run mongoose validations
        });

        if(!response){
            return res.status(404).json({ error: "No Candidate found"});s
        }

        console.log('Data updated');
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server Error'});
    }
});


router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {

        if(!  await checkAdminRole(req.user.id)){
            return res.status(403).json({message: "user doesn't have admin role"});
        }
        const candidateId = req.params.candidateId;

        const response = await Candidate.findByIdAndDelete(candidateId)
        

        if(!response){
            return res.status(404).json({ error: "No Candidate found"});s
        }

        console.log('Candidate Deleted');
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server Error'});
    }
});


//start voting

router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
    candidateId = req.params.candidateId;
    userId= req.user.id;
    try {
        const candidate = await Candidate.findById(candidateId);

        if(!candidate){
            return res.status(404).json({message: "Candidate Not found"});
        }

        const user = await User.findById(userId);
        if(!candidate){
            return res.status(404).json({message: "User Not found"});
        }
        if(user.isVoted ) {
           return res.status(400).json({mesage: " User has already voted"});
        }
        if(user.role === 'admin' ) {
            return res.status(403).json({mesage: " Admin can't vote"});
        }

        //Update candidtae votes and vote count

        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();

        //update user document
        user.isVoted= true;
        await user.save();

        res.status(200).json({message:" Vote recorded successfully!"});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server Error'});
    }    
})

//vote count

router.get("/vote/count", async (req, res) =>{
    try {
        
        const candidate = await Candidate.find().sort({voteCount: 'desc'});
        const record = candidate.map((data) =>{
            return {
                party: data.party,
                count: data.voteCount
            };

        });

        res.status(200).json(record);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server Error'});  
    }
})

module.exports = router;