import mongoose from "mongoose";

const FFschema = mongoose.Schema({
    userId: { type: String, },

    followers: [{ type: String }], // References to followers
    following: [{ type: String }]
});



const FollowFriendship = mongoose.model('FollowFriendship', FFschema);
export default FollowFriendship;