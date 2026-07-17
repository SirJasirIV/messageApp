import express from "express";
const app = express();
import router from "./routers/authRouter.js";
import cors from "cors";

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("working!")
});

app.use("/auth", router);

app.listen(3000, () => {
    console.log("working in terminal")
});