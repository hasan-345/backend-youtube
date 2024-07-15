import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async()=>{

   try {
      const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      console.log(`MONGODB connected : DB_HOST ${connectionInstance.connection.host}`);
   } catch (error) {
     console.log("MONGODB is not connected",error);
     process.exit(1) //entire code is not responding.
   }

}

export default connectDB;