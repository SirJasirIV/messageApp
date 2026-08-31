import express from "express";
const app = express();
app.set("etag", false);
import router from "./routers/authRouter.js";
import indexRouter from "./routers/indexRouter.js"
import cors from "cors";
import path from "path";
import cleanupGuests from "./controllers/cleanUpGuest.js";

const HOUR = 60 * 60 * 1000
setInterval(cleanupGuests, HOUR);
cleanupGuests(); 
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("working!")
});

app.use("/auth", router);
app.use("/connect", indexRouter);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.listen(3000, () => {
    console.log("working in terminal")
});