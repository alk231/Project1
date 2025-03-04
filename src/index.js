
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import express from "express"


dotenv.config({
  path:"/.env"
})

const app=express();
app.get("/",(req,res)=>{
  res.send("hello")
})
//connectDB()
//.then(()=>{
  app.listen(process.env.PORT||3000,()=>{
    console.log(`Server is running at port :${process.env.PORT}`)
  })
//})
// .catch((err)=>{
//   console.log("Mongo db connection failed !!!",err);
// })










// import express from "express"
// const app=express()

// (async()=>{
//   try{
//     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//     app.on("error",(error)=>{
//       console.log("error",error);
//       throw error
//     })

//     app.listen(process.env.PORT,()=>{
//       console.log(`App is listening on port ${process.env.PORT}`)
//     })
//   }
//   catch(error){
//         console.error("Error",error)
//   }
// })