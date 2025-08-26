"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const memberRoutes_1 = __importDefault(require("./routes/memberRoutes"));
const alumniRoutes_1 = __importDefault(require("./routes/alumniRoutes"));
const musicSheetRoutes_1 = __importDefault(require("./routes/musicSheetRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));
app.use("/api/members", memberRoutes_1.default);
app.use("/api/alumni", alumniRoutes_1.default);
app.use("/api/music-sheets", musicSheetRoutes_1.default);
app.use("/api/messages", messageRoutes_1.default);
app.use("/api/documents", documentRoutes_1.default);
app.use("/api/transactions", transactionRoutes_1.default);
app.use("/api", authRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
