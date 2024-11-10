import express from 'express';
const router = express.Router();
import { followUser, getuser, getUserProfile,search,unfollowUser,updateProfile } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

router.get('/profile/:userId', getUserProfile);
router.get('/user',auth,getuser)
router.put('/profile', auth, updateProfile);
router.get('/search', search)
router.post('/follow',followUser)
router.post('/unfollow',unfollowUser)


export default router