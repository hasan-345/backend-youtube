import dotenv from "dotenv" //important
import express from "express"
import connectDB from "./db/index.js"
import mongoose from "mongoose"
import app from "./app.js"
import { DB_NAME } from "./constants.js"
dotenv.config({
    path:"./.env"
})// important


connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("error",error);
        throw error;
    })
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`Server is running at port http://localhost:${process.env.PORT}`);
    })
})
.catch((error)=>{
  console.log(`MONGODB CONNECTION FAILED`,error);
})

app.get("/",(req,res)=>{
    res.send("hello world")
})


//  ;(async()=>{

//  try {
//     mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     app.on("Error",(error)=>{
//         console.log("error",error)
//         throw error
//     })
//     app.listen(process.env.PORT,()=>{
//         console.log(`app is listening on ${process.env.PORT}`);
//     })
//  } catch (error) {
//     throw error
//  }

// })()