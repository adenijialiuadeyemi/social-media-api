import dotenv from "dotenv";
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import mongoose from 'mongoose'
import { userRoute } from "./routes/users.js";
import { authRoute } from "./routes/auth.js";
import { postRoute } from "./routes/posts.js";

dotenv.config()

const app = express()

//middlewares
app.use(express.json())
app.use(helmet())
app.use(morgan("common"))

//users endpoint
app.use('/api/v1/users', userRoute)

//auth endpoint
app.use('/api/v1/auth', authRoute)

//posts endpoint
app.use('/api/v1/posts', postRoute)

app.get('', (req, res) => {
  res.send("HOME PAGE")
})




app.listen(process.env.PORT, () => {
  console.log(`Server running at: http://localhost:${process.env.PORT}`)
  mongoose.connect(process.env.MONGO_URL,
    console.log("Connected to mongoDB")
  )

})