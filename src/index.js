import dotenv from "dotenv" //important
import connectDB from "./db/index.js"
import app from "./app.js"
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
