import User from '../models/User.js'
import mongoose from 'mongoose';
export const getUserProfile = async (req, res) => {
    try {
        // console.log(req.userId)
        const {userId} = req.params
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user)
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

export const getuser = async (req, res) => {
    try {
        console.log('here it is')
        console.log("user id ",req.userId)
        console.log(req.userId)
        // const {username} = req.params
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user)
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const { name, bio, profileImage } = req.body;
        const user = await User.findByIdAndUpdate(req.userId, { name, bio, profileImage }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const searchUsers = async (searchTerm) => {
    try {
        // Ensure the searchTerm is trimmed and in lowercase for case-insensitive search
        const term = searchTerm.trim().toLowerCase();

        // Find users where the username starts with the searchTerm
        const users = await User.find({
            username: { $regex: `^${term}`, $options: 'i' } // Case-insensitive search
        });
        console.log(users)
        return users;
    } catch (error) {
        console.error('Error searching users:', error);
        throw error;
    }
};

export const search = async(req, res) => {
    const { term } = req.query;
    console.log(term);
    if (!term) {
        return res.status(400).json({ message: 'Search term is required' });
    }

    try {
        const users = await searchUsers(term);
        res.status(201).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error searching for users' });
    }
}


export const followUser = async (req, res) => {
    try {
        const { usernameToFollow } = req.body;  // The username of the user to follow
        const currentUsername = req.body.currentUsername; // The username of the current user

        // Find and update the current user by username
        const user = await User.findOneAndUpdate(
            {_id:currentUsername},
            { $addToSet: { following: usernameToFollow } },  // Add the target username to the `following` list
            { new: true }  // Return the updated document
        );

        if (!user) {
            return res.status(404).json({ message: 'Current user not found' });
        }

        // Optionally, update the followed user to add the current user's username to their followers
        const followedUser = await User.findOneAndUpdate(
            {_id:usernameToFollow},  // Query by the target username
            { $addToSet: { followers: currentUsername } },  // Add the current username to the `followers` list
            { new: true }  // Return the updated document
        );

        if (!followedUser) {
            return res.status(404).json({ message: 'User to follow not found' });
        }

        return res.status(200).json({ user, followedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error });
    }
};


// Unfollow a user
export const unfollowUser = async (req, res) => {
    try {
        const { currentUsername, usernameToFollow } = req.body;
        console.log(currentUsername, usernameToFollow);

        // Ensure the ids are valid ObjectIds, since they're in string form
        const currentUserId = new mongoose.Types.ObjectId(currentUsername);
        const userToUnfollowId = new mongoose.Types.ObjectId(usernameToFollow);

        // Fetch the users by their ObjectId
        const currentUser = await User.findOne({ _id: currentUserId });
        const userToUnfollow = await User.findOne({ _id: userToUnfollowId });

        if (!currentUser || !userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if currentUser is following the userToUnfollow
        if (!currentUser.following.includes(userToUnfollowId)) {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        // Use $pull to remove the user from both the following and followers arrays
        await User.updateOne(
            { _id: currentUserId },
            { $pull: { following: userToUnfollowId } }
        );

        await User.updateOne(
            { _id: userToUnfollowId },
            { $pull: { followers: currentUserId } }
        );

        res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (error) {
        console.error('Error while unfollowing user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};