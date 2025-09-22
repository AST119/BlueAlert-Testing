import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userScheema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true,
    minlength:[10,"phone number must contain Ten digits "],
    maxlength:[10,"phone number must contain Ten digits "]
  },

  role: {
    type: String,
    enum: ["Admin", "Citizen","Analyst"],
    default: "Citizen"
  },
  isVerified:{
    type:Number,
    default:0
  },
  credibilityScore:{ 
    type: Number, 
    default: 0 
  },
  userAvatar:{
        public_id:{
            type:String,
        },
        url:{
            type:String,
        },
    },
}, {
  timestamps: true
});

// any time user is registered password is saved in hash form
userScheema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,10)
})

userScheema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}


// jwt key created =>> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
userScheema.methods.generateJsonWebToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRES,
    });
}

export const User=mongoose.model("User",userScheema)