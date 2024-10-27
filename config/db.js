import mongoose  from "mongoose";
import 'dotenv/config';
const uri=process.env.MONGO_URI
export const connectDB=async()=>{
     await mongoose.connect(uri)
    .then(()=>{console.log("Data Base Connection Success Full");
    })
    
}

