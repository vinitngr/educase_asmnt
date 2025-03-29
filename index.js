import express from "express";
import { db } from "./data.js";
import rateLimit from "express-rate-limit";


const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
});

const app = express();
app.use(express.json());
app.use(limiter);


app.post("/addSchool", async (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    await db.query("INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)", [name, address, latitude, longitude]);
    res.status(200).json({ message: "Added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/listSchools", async (req, res) => {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Coordinates required" });
  }
  try {
    const [schools] = await db.query("SELECT * FROM schools");
    schools.sort((a, b) => {
        const distA = Math.sqrt((a.latitude - latitude) ** 2 + (a.longitude - longitude) ** 2);
        const distB = Math.sqrt((b.latitude - latitude) ** 2 + (b.longitude - longitude) ** 2);
        return distA - distB;
    });
    res.status(200).json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log('server is runnin on port' , PORT));
