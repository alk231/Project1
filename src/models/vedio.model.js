import mongoose from "mongoose";

const vedioSchema=new mongoose.Schema({
  vedioFile:{
    type:String,
    required:true
  },
  thumbnails:{
    type:String,
    required:true
  },
  title:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  duration:{
    type:Number, //Cloudinary url
    required:true
  },
  views:{
    type:Number,
    default:0
  },
  isPublished:{
    type:Boolean,
    default:true
  },
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
},{timestamps:true})

export const Vedio=mongoose.model("Vedio",vedioSchema)