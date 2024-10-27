import userModel from "../model/userModel.js";
import UserOTPVerification from '../model/userOtpVerification.js'

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'
import nodemailer from "nodemailer";

// AUTH_EMAIL = "sp01csit@gmail.com"
// AUTH_PASSWORD = "Soumen@2486"
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'marge.osinski59@ethereal.email',
        pass: 'WsCNWAWwC7QHzVfFEa'
    }
});



//teating success
transporter.verify((error, success) => {
    if (error) {
        console.error("Error connecting to the email service:", error); // Improved logging
    } else {
        console.log("Ready for message:", success);
    }
});

// Login
const loginUser=async(req,res)=>{
    const{email,password}=req.body;
    try{
        const user=await userModel.findOne({email})
            if(!user){
                return res.json({success:false,massage:"User Doesn't exist"})
            }
           
              
        const isMatch=await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.json({success:false,massage:"Invalid credential"})
        }

       
       
        
        res.json({success:true,_id: user._id.toString() ,name:user.name.toString()})
    }
        
    
    catch(err){
        
        res.json({success:false,massage:"ERROR"})
        
    }

}



//verify otp email
const verifyOTP = async (req, res) => {
    try {
        let { userId, otp } = req.body;
        

        // Validate input
        if (!userId || !otp) {
            throw new Error("Empty OTP details are not allowed");
        } 
        else {
           
            const UserOTPVerificationRecords = await UserOTPVerification.find({ userId });
           
            if (UserOTPVerificationRecords.length <= 0) {
                // No record found
                throw new Error("Account record doesn't exist or has been verified already. Please sign up or log in");
            }
            else {
                // User OTP record exists
              
                const { expiresAt, otp: hashedOTP } = UserOTPVerificationRecords[0];
                
                
                if (expiresAt < Date.now()) {
                    // User OTP record has expired
                    await UserOTPVerification.deleteMany({ userId });
                    throw new Error("Code has expired. Please request again");
                } else {
                    const validOTP = await bcrypt.compare(otp, hashedOTP);
                    if (!validOTP) {
                        // Supplied OTP is wrong
                        throw new Error("Invalid code passed. Check your inbox");
                    } else {
                        // Find the user by ID
                        const userRecord = await  userModel.findById(userId);
                       
                        
                        if (!userRecord) {
                            throw new Error("User does not exist.");
                        }

                        if (userRecord.verified) {
                            throw new Error("User account has already been verified.");
                        }

                      
                        userRecord.verified = true; 
                        await userRecord.save(); 

                        await UserOTPVerification.deleteMany({ userId });
                        
                        // Send success response
                        res.json({
                            status: "VERIFIED",
                            message: "User email verified successfully",
                        });
                    }
                }
            }
        }
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message,
        });
    }
};


//resend verification
const resendOTPVerificationCode= async (req, res) => {
    try{
        let { userId, email } = req.body;
        
        if( !userId || !email) {
            throw Error("empty user details are not allowed");
        } else {
            //deleting existing records and re-send
            await UserOTPVerification.deleteMany({ userId });
            sendOTPVerificationEmail({_id: userId, email }, res);
        }

    }catch (error) {
        res.json({
            status: "FAILED",
            message: error.message,
        });
    }
};


const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)

}

//send otp verification email
const sendOTPVerificationEmail = async ({ _id, email }, res) => {
    try {
        const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

        // Email options
        const mailOptions = {
            from: "presley26@ethereal.email",
            to: email,
            subject: "Verify Your Email",
            html: `<p>Enter ${otp} in the app to verify your email address and complete the sign-up process.</p><p>This code <b>expires in 1 hour</b>.</p>`,
        };

        // Hash the OTP
        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);

        // Create and save a new OTP verification record
        const newOTPVerification = new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });

        await newOTPVerification.save();
        await transporter.sendMail(mailOptions);

       
        return {
            status: "PENDING",
            message: "Verification OTP email sent",
            data: { userId: _id, email },
        };
    } catch (error) {
        return {
            status: "FAILED",
            message: error.message,
        };
    }
};






const signUpUser = async (req, res) => {
    const { name, password, email } = req.body;

    try {
        const exist = await userModel.findOne({ email });
        if (exist) {
            return res.json({ Success: false, message: "User already exists" });
        }
        if (!validator.isEmail(email)) {
            return res.json({ Success: false, message: "Please Enter a valid Email" });
        }
        if (password.length < 8) {
            return res.json({ Success: false, message: "Please Enter a Strong Password" });
        }

        // Check password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const newUser = new userModel({
            name: name,
            email: email,
            password: hashPassword
        });

        const user = await newUser.save();
        
        // Send OTP Verification Email and wait for the response
        const otpResponse = await sendOTPVerificationEmail(user, res);
        
        // Check the response from sendOTPVerificationEmail
        if (otpResponse.status === "FAILED") {
            return res.json(otpResponse); // If sending OTP failed, return that response
        }
        
        // If successful, respond with success
        res.json({ Success: true, message: "User created and OTP sent", data: otpResponse });

    } catch (error) {
       
        res.json({ Success: false, message: "Error" });
    }
};



const saveInterest=async (req, res) => {
    
    const { _id, selectedCategories } = req.body;
    
    

    try {
        await userModel.findByIdAndUpdate(_id, { cartData: selectedCategories });
        res.json({ message: 'User interests updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



export {loginUser,signUpUser,verifyOTP,resendOTPVerificationCode,sendOTPVerificationEmail,saveInterest}
