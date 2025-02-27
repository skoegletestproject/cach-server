const express = require("express");
const path = require("path");
const NodeCache = require("node-cache");

const app = express();
const cache = new NodeCache();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files (JS)

// Route to render UI
app.get("/", (req, res) => {
    res.render("index");
});

// API to get all cache data
app.get("/get", (req, res) => {
    const cacheData = cache.keys().map(key => ({ key, value: cache.get(key) }));
    res.json(cacheData);
});

// API to set cache
app.post("/set", (req, res) => {
    const { key, value } = req.body;
    if (!key || !value) return res.status(400).send("Key and Value are required!");

    cache.set(key, value, 3600);
    res.sendStatus(200);
});

// API to delete a specific cache entry
app.post("/delete", (req, res) => {
    if (!req.body.key) return res.status(400).send("Key is required!");

    cache.del(req.body.key);
    res.sendStatus(200);
});
app.get("/get/:key", (req, res) => {
    const { key } = req.params;
    const value = cache.get(key);
    
    if (value === undefined) {
        return res.json({ message: "Key not found!" ,valid:false});
    }

    res.json({ key, value ,valid:true});
});


// API to clear all cache
app.post("/clear", (req, res) => {
    cache.flushAll();
    res.sendStatus(200);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
