import express from 'express'
import {loginUser,signUpUser,verifyOTP,resendOTPVerificationCode,saveInterest} from '../controller/userController.js'
const createRoute=express.Router();

createRoute.post('/login',loginUser)
createRoute.post('/signup',signUpUser)
createRoute.post('/verifyOTP',verifyOTP)
createRoute.post('/resendOTP',resendOTPVerificationCode)
createRoute.post('/saveInterest',saveInterest)


export default createRoute;