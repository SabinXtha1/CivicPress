import mongoose from "mongoose";

export const connectDB = async ()=>{
    try{
       await mongoose.connect(process.env.DATABASE_URI)
       console.log("MongoDB Connected Sucessfully")
    }catch(error){
        console.log(`Failed to Connect MongoDB. Error:${error}`)
    }
}