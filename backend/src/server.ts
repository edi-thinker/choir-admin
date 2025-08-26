import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import { spawn } from "child_process"
import path from "path"
import memberRoutes from "./routes/memberRoutes"
import alumniRoutes from "./routes/alumniRoutes"
import musicSheetRoutes from "./routes/musicSheetRoutes"
import messageRoutes from "./routes/messageRoutes"
import documentRoutes from "./routes/documentRoutes"
import transactionRoutes from "./routes/transactionRoutes"
import authRoutes from "./routes/authRoutes"
import User from "./models/User"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Function to check and run the createUsers script if needed
async function ensureInitialUsers() {
  try {
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log("🔄 No users found in database. Running createUsers script...");
      
      // Path to the createUsers script
      const createUsersScriptPath = path.join(__dirname, "../seeds/createUsers.ts");
      
      return new Promise<void>((resolve, reject) => {
        // Run the createUsers script using ts-node
        // Use 'node' with ts-node/register for better Windows compatibility
        const child = spawn("node", ["-r", "ts-node/register", createUsersScriptPath], {
          stdio: "inherit", // This will show the script output in the main console
          cwd: path.join(__dirname, ".."), // Set working directory to backend folder
          shell: true, // Use shell for better Windows compatibility
        });

        child.on("close", (code) => {
          if (code === 0) {
            console.log("✅ Initial users created successfully via createUsers script");
            resolve();
          } else {
            console.error(`❌ createUsers script exited with code ${code}`);
            reject(new Error(`createUsers script failed with exit code ${code}`));
          }
        });

        child.on("error", (error) => {
          console.error("❌ Error running createUsers script:", error);
          reject(error);
        });
      });
    } else {
      console.log(`✅ Found ${userCount} existing users in database. Skipping user creation.`);
    }
  } catch (error) {
    console.error("❌ Error checking for initial users:", error);
    // Don't exit the process, just log the error and continue
  }
}

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(async () => {
    console.log("✅ Connected to MongoDB")
    // Ensure initial users exist after successful database connection
    await ensureInitialUsers();
  })
  .catch((error) => console.error("❌ MongoDB connection error:", error))

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

