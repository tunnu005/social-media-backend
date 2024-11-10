import express from 'express'
import jwt from 'jsonwebtoken'
import { getMessage, getUserFollow, SendMessage } from '../controllers/chatController.js';
import Auth from '../middleware/auth.js';



const router = express.Router();


router.post('/send', Auth,SendMessage)
router.get('/getMessages/:user1/:user2',getMessage)
router.get('/getUsersfollow',Auth,getUserFollow)

export default router