import Post from '../models/Post.js'
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';

export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const file = req.file;
    // console.log(file);
    console.log(typeof req.userId);
    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });
    console.log("result", result);
    // Store the image URL and caption in MongoDB
    const newPost = new Post({
      userId: req.userId,
      caption,
      image: result.secure_url,
    });
    console.log("post", newPost);
    const resp = await newPost.save();
    console.log(resp)
    res.status(201).json({ message: 'Boom! 💥 Your post just hit the feed. Get ready for those likes and comments to roll in 🔥!', description: 'post uploaded successfully!', success: true });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getPosts = async (req, res) => {

  const { userId } = req.params
  try {
    const posts = await Post.find({ userId: userId }).populate('userId', 'username profilePic');
    console.log(posts);
    res.status(201).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const gethomepost = async (req, res) => {
  const { page = 1, limit = 10 } = req.params; // default values for pagination

  try {
    // Get the current user's following list (an array of usernames)
    const user = await User.findById(req.userId);
    console.log("Following:", user.following);

    // Find the users being followed by the current user (by username)
    const followingUsers = await User.find({ _id: { $in: user.following } });

    // const followingUserIds = followingUsers.map((user) => user._id);

    console.log("Following User IDs:", followingUsers);
    const pos = await Post.find({ userId: { $in: followingUsers } })
    console.log("num posts:", pos.length);
    // Fetch posts from users the current user is following by their userId
    const posts = await Post.find({ userId: { $in: followingUsers } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'username profilePic');

    const postsWithLikeStatus = posts.map((post) => ({
      ...post.toObject(),
      likedByUser: post.likedBy.some((likeId) => likeId.equals(req.userId)) // Check if user liked this post
    }));

    res.status(200).json(postsWithLikeStatus || []);  // Return empty array if no posts found

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const addLike = async (req, res) => {
  try {
      const { postId, liked } = req.body;
      const userId = req.userId; // Assuming `req.userId` is set after authentication
      console.log(typeof liked)
      console.log(liked)
      // Determine the action based on the `liked` flag
      const update = liked
          ? { $inc: { likes: 1 }, $addToSet: { likedBy: userId } } // Add like
          : { $inc: { likes: -1 }, $pull: { likedBy: userId } };  // Remove like

      const respo = await Post.findByIdAndUpdate(postId, update);
      console.log(respo);
      return res.status(200).json({ success: true });
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
};
