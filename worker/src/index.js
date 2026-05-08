// index.js - Cloudflare Worker entry point.
// Creates the Hono app, wires up CORS, and registers all API routes.
// Hono is a lightweight web framework designed for edge runtimes like Cloudflare Workers.

import { Hono } from "hono";
import { cors } from "hono/cors";
import { handleCharacters } from "./routes/characters.js";
import { handleDaily } from "./routes/daily.js";
import { handleGuess } from "./routes/guess.js";

const app = new Hono();

// Allow requests from the frontend. In production, CLIENT_URL is set in wrangler.toml.
// In local dev it falls back to the Vite dev server address.
app.use("/api/*", cors({
  origin: (origin, c) => {
    const allowed = [
      "http://localhost:5173",
      "http://localhost:8787",
      c.env.CLIENT_URL,
    ].filter(Boolean);
    return allowed.includes(origin) ? origin : allowed[0];
  },
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type"],
}));

// ── Routes ──────────────────────────────────────────────────────────────────
app.get("/api/characters", handleCharacters); // returns the full character roster
app.get("/api/daily",      handleDaily);      // returns today's puzzle number (not the answer)
app.post("/api/guess",     handleGuess);      // accepts a guess and returns a comparison
app.get("/api/health",     (c) => c.json({ ok: true })); // simple uptime check

export default app;
