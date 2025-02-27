const express = require("express");
const path = require("path");
const NodeCache = require("node-cache");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const cache = new NodeCache();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Function to broadcast cache updates
const broadcastCacheUpdate = () => {
    const cacheData = cache.keys().map(key => ({ key, value: cache.get(key) }));
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(cacheData));
        }
    });
};

// WebSocket connection handling
wss.on("connection", (ws) => {
    console.log("📡 New WebSocket connection established!");
    const initialCache = cache.keys().map(key => ({ key, value: cache.get(key) }));
    ws.send(JSON.stringify(initialCache));
});

// Route to render UI
app.get("/", (req, res) => {
    res.render("index");
});

// API to set cache
app.post("/set", (req, res) => {
    const { key, value } = req.body;
    if (!key || !value) return res.status(400).send("Key and Value are required!");

    cache.set(key, value, 3600);
    broadcastCacheUpdate();
    res.sendStatus(200);
});

// API to get all cache data
app.get("/get", (req, res) => {
    const cacheData = cache.keys().map(key => ({ key, value: cache.get(key) }));
    res.json(cacheData);
});

// API to get a specific cache entry
app.get("/get/:key", (req, res) => {
    const { key } = req.params;
    const value = cache.get(key);
    if (value === undefined) return res.status(404).send("Key not found!");
    res.json({ key, value });
});

// API to delete a specific cache entry
app.post("/delete", (req, res) => {
    if (!req.body.key) return res.status(400).send("Key is required!");

    cache.del(req.body.key);
    broadcastCacheUpdate();
    res.sendStatus(200);
});

// API to clear all cache
app.post("/clear", (req, res) => {
    cache.flushAll();
    broadcastCacheUpdate();
    res.sendStatus(200);
});

const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
