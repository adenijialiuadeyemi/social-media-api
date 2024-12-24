import express from "express"
import { User } from "../models/User.js"
import bcrypt from 'bcrypt'
const router = express.Router()


router.get('/', (req, res) => {
  res.send("This is the home page of AUTH route")
})

//register a user
router.post('/register', async (req, res) => {
  try {

    //hash the password given
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    //create the user
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    })
    //save the user
    await user.save()
    res.status(200).json("User Created Successfuly")
  } catch (err) {
    res.status(500).json("An Error Occured")
  }
})

//login a user
router.post('/login', async (req, res) => {
  try {

    const user = await User.findOne({
      email: req.body.email
    })

    !user && res.json({
      "status": 404,
      "message": "User not found"
    })

    //validate password
    const validPassword = await bcrypt.compare(req.body.password, user.password)

    !validPassword && res.json({
      "status": 400,
      "message": "Wrong password"
    })

    res.json({
      "status": 200,
      "message": "Login Successful",
      "data": user
    })
  } catch (err) {
    res.status(500).json(err.message)
  }
})

export const authRoute = router