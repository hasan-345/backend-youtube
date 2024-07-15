import mongoose, { mongo } from "mongoose";
import { Schema } from "mongoose";

const subscritionSchema = new Schema({
 
    subscriber:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel:{
         type: Schema.Types.ObjectId,
        ref: "User"
    }

},{timestamps:true})

export const Subscribtion = mongoose.model("Subscribtion",subscritionSchema);