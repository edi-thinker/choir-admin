import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import memberRoutes from "../src/routes/memberRoutes"
import alumniRoutes from "../src/routes/alumniRoutes"
import musicSheetRoutes from "./routes/musicSheetRoutes"
import messageRoutes from "../src/routes/messageRoutes"
import documentRoutes from "../src/routes/documentRoutes"
import transactionRoutes from "../src/routes/transactionRoutes"
import authRoutes from "../src/routes/authRoutes"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error))

app.use("/api/members", memberRoutes)
app.use("/api/alumni", alumniRoutes)
app.use("/api/music-sheets", musicSheetRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/documents", documentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

