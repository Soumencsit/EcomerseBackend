import mongoose from 'mongoose'


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    verified:{
        type:Boolean,
        default:false
    },
    cartData:{
        type:Object,
       default:{}
    }

},{minimize:false})


const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;