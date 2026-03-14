import express, { type Express } from "express";
import cors from "cors";
import router from "./routes/index.js";
import { startBot } from "./lib/bot.js";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

startBot().then((result) => {
  if (result.success) {
    console.log("🤖 " + result.message);
  } else {
    console.warn("⚠️ Bot did not start:", result.message);
  }
});

export default app;
