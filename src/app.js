import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}))

app.use(express.json({limit:"16kb"}))  //used for getting the json file

app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public")) //used for storing the image,pdf,etc

app.use(cookieParser())  //user ke browser ka cookies access and set kar pau and then crud operation perform kar saku



import router from "./routes/user.route.js"


app.use("/api/v1/users", userRouter)


export default app