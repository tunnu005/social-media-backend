import express from 'express';
const router = express.Router();
import { addLike, createPost,gethomepost,getPosts } from '../controllers/postController.js';
import auth from '../middleware/auth.js';
import multer from 'multer';



const upload = multer({ storage: multer.memoryStorage() });

router.post('/create', auth, upload.single('file'), createPost);
router.get('/getpost/:userId', getPosts);
router.get('/getHome/:page/:limit',auth,gethomepost)
router.post('/addlike',auth,addLike)

export default router