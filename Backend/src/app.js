import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./DB/connectDb.js";

dotenv.config();
connectDB();

const app = express();

app.use('/', (req, res) => {
    res.send("Our API")
})

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

