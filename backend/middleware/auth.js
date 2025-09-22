// backend/middleware/auth.js

import jwt from "jsonwebtoken";
import { User } from "../models/user_scheema.js";
import { catchAsyncErrors } from "../middleware/CatchAssyncErrors.js";
import ErrorHandler from "./errormiddleware.js";



export const isAdminAuthenticated=catchAsyncErrors(async(req,res,next)=>{
     const token=req.cookies.adminToken;
     if(!token){
        return next(new ErrorHandler("Admin not authenticated",400))

     }
     const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
     req.user=await User.findById(decoded.id);
    //  Autherization
     if(req.user.role!=="Admin"){
        return next(new ErrorHandler(`${req.user.role} not autherized for this resourse`,403))
     }
     next()

})

export const isCitizenAuthenticated=catchAsyncErrors(async(req,res,next)=>{
    const token=req.cookies.citizenToken;
    if(!token){
       return next(new ErrorHandler("Citizen not authenticated",400))

    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
    req.user=await User.findById(decoded.id);
   //  Autherization
    if(req.user.role!=="Citizen"){
       return next(new ErrorHandler(`${req.user.role} not autherized for this resourse`,403))
    }
    next()

})

export const isAnalystAuthenticated=catchAsyncErrors(async(req,res,next)=>{
    const token=req.cookies.analystToken;
    if(!token){
       return next(new ErrorHandler("Analyst not authenticated",400))

    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
    req.user=await User.findById(decoded.id);
   //  Autherization
    if(req.user.role!=="Analyst"){
       return next(new ErrorHandler(`${req.user.role} not autherized for this resourse`,403))
    }
    next()

})
