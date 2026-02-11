import express from 'express'
import dotenv from 'dotenv'

const app = express()

dotenv.config()
const PORT = process.env.PORT || 3002

app.get('/', (req, res) => {
  res.send("backend server will be start")
})

app.listen(PORT, ()=> {
  console.log(`Server running at: http://localhost:${PORT}`)
})