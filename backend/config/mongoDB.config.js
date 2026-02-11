import mongoose from "mongoose"
const connectDB = async () => {
  try {
    const connectDB = await mongoose.connect(`${process.env.MONGODB_URL}/finalYearProject`)
    console.log(`Database Connection Successful: ${connectDB.connection.host}`)
  } catch (error) {
    console.log('Database Connection failed', error)
    process.exit(1)
  }
}

export default connectDB