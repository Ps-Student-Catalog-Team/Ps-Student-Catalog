import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.join(projectDirectory, "dist");
const port = Number(process.env.PORT) || 3133;

app.use(express.static(distDirectory));
app.get("*", (request, response) => {
  response.sendFile(path.join(distDirectory, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`About Us server running on http://0.0.0.0:${port}`);
});