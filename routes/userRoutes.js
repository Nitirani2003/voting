const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

router.post('/signup', async(req, res) => {
    try {
        const data = req.body //  Assuming the request body contains the person data
            // Create a new Person documnet using the Mongoose model
        const newUser = new User(data);
        //save the new person to databases
        const response = await newUser.save();
        console.log('data saved');
        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is:", token);

        res.status(200).json({ response: response, token: token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.post('/login', async(req, res) => {
    try {
        const { aadharCardNumber, password } = req.body;
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        //generate Token
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);
        //return token as response
        res.json({ token })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internet Server Error' });
    }
});
//profile route
router.get('/profile', jwtAuthMiddleware, async(req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.put('/profile/password', jwtAuthMiddleware, async(req, res) => {
    try {
        const userId = req.user; //Extract the id from the URL parameter
        const { currentPassword, newPassword } = req.body
            //Update data for the person
        const user = await User.findById(userId);
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid Username or password' });
        }
        user.password = newPassword;
        await user.save();
        console.log('password change updated');
        res.status(200).json({ message: "password updated" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server error' });
    }
})
module.exports = router;