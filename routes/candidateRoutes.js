const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const Candidate = require('../models/candidate');
//checks if the user is admit or not if he/she is admin then process hoga nhi to err
const checkAdminRole = async(userID) => {
        try {
            const user = await User.findById(userID);
            if (user.role === 'admin') {
                return true;
            };
        } catch (err) {
            return false;
        }
    }
    //post route to add a candidate
router.post('/', jwtAuthMiddleware, async(req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: 'user does not have a admin role' });
        const data = req.body //  Assuming the request body contains the person data
            // Create a new Person documnet using the Mongoose model
        const newCandidate = new Candidate(data);
        //save the new person to databases
        const response = await newCandidate.save();

        console.log('data saved');

        res.status(200).json({ response: response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.put('/:candidateID', jwtAuthMiddleware, async(req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: 'user does not have admin role' });
        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;
        const response = await personalbar.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, //Return the updated document
            runValidators: true, //Run Mongoose validation
        })
        if (!response) {
            return res.status(404).json({ error: 'candidate not found' });
        }
        console.log('candidate data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server error' });
    }
})
router.delete('/:candidateID', jwtAuthMiddleware, async(req, res) => {
        try {
            if (!(await checkAdminRole(req.user.id)))
                return res.status(403).json({ message: 'user does not have admin role' });
            const candidateID = req.params.candidateID;

            const response = await personalbar.findByIdAndDelete(candidateID);
            if (!response) {
                return res.status(404).json({ error: 'candidate not found' });
            }
            console.log('candidate delete');
            res.status(200).json(response);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server error' });
        }
    })
    //lets's Start Voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async(req, res) => {
    //no admin can vote
    //user can only vote once
    candidateID = req.params.candidateID;
    userId = req.user.id;
    //find the candidate document with the specified candidateID
    try {
        //if Candidate is present or not
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        //if user is present or not
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        //if user has already voted then cannot vote again
        if (user.isVoted) {
            res.status(400).json({ message: 'You have already Voted' });
        }
        //if the person voting is admin
        if (user.role == 'admin') {
            res.status(403).json({ message: 'admin is not allowed to vote' });
        }
        //Updating the candidate document to save the vote
        candidate.votes.push({ user: userId })
        candidate.voteCount++;
        await candidate.save();

        //Update the user document
        user.isVoted = true;
        await user.save();

        res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Interval Server Error' });
    }
});
//vote count
router.get('/vote/count', async(req, res) => {
    try {
        //find all candidate sorted by votecount in decending order
        const candidate = await Candidate.find().sort({ voteCount: 'desc' });

        //Map the candidates to only return their their names and votesCount
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        });
        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/', async(req, res) => {
    try {
        //find all candidates and select only name and party field excludind id
        const candidates = await Candidate.find({}, 'name party-_id');
        // retur the candidate list 
        res.status(200).json(candidates);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;