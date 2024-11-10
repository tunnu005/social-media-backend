import mongoose from "mongoose";
const PostSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image : {type:String,required: true},
    caption: { type: String },
    likes: { type: Number, default: 0 },
    // comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    // shares: { type: Number, default: 0 },
    // tags: { type: [String] }, // Add array of tags if needed
    createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', PostSchema);
export default Post;
