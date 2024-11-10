import express from 'express'
import jwt from 'jsonwebtoken'


const router = express.Router();

import { createUser,login, logout } from '../controllers/authController.js';
// import Auth from '../middleware/auth.js';
import multer from 'multer';
import Auth from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage() });

router.post('/signup', upload.single('file'),createUser);
router.post('/login',login);
router.post('/logout',Auth,logout)
router.get('/verifyToken',(req,res)=>{

    console.log('hit')
    const {token} = req.cookies
    console.log('token at verification',token);
    if(!token) return res.status(400).json({message:'User Not Login',success:false});
    const decodedData = jwt.verify(token,process.env.JWT_SECRET);
    res.status(200).json({message:'User Login',success:true,user:decodedData.payload});

})
// router.get('/',Auth,(req,res)=>{
//     console.log("auth route")
//     console.log(req.userId);
//     return res.json({message:"success"})
// })

export default router;