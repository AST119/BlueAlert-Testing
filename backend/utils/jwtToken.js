export const generateToken=(user,message,statusCode,res)=>{
    const token=user.generateJsonWebToken()
    let cookieName;
    if(user.role==="Admin"){
         cookieName="adminToken";
    }else if(user.role==="Citizen"){
        cookieName="citizenToken";
    }else{
        cookieName="analystToken";
    }
    res.status(statusCode).cookie(cookieName,token,{
        expires:new Date(
            Date.now()+process.env.COOKIE_EXPIRE*24*60*1000
        ),
        httpOnly:true,
    }).json({
        success:true,
        message,
        user,
        token
    })
}
