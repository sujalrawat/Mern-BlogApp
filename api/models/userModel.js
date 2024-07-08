import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        min:4
    },
    password:{
        type:String,
        required:true
    }
})

const User = mongoose.model("User",userSchema);

export default User;