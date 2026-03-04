const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const socketIo = require("socket.io");
const http = require("http");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Create uploads directory
const fs = require("fs");
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Database setup
const db = new sqlite3.Database("../database/fabriconix.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("✅ Connected to SQLite database");
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        user_type TEXT NOT NULL,
        address TEXT,
        profile_pic TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        tailor_id INTEGER,
        fabric_type TEXT,
        dress_type TEXT,
        design_details TEXT,
        measurements TEXT,
        images TEXT,
        instructions TEXT,
        status TEXT DEFAULT 'pending',
        total_amount DECIMAL(10,2),
        payment_method TEXT,
        delivery_address TEXT,
        tracking_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        receiver_id INTEGER,
        message TEXT,
        message_type TEXT DEFAULT 'text',
        file_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    console.log("✅ Database tables initialized");
}

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ==================== ROUTES ====================

// Health check
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "OK", 
        message: "Fabriconix API is running",
        timestamp: new Date().toISOString()
    });
});

// Register user
app.post("/api/register", async (req, res) => {
    const { name, email, phone, password, user_type, address } = req.body;
    
    console.log("📝 Registration attempt:", { name, email, user_type });
    
    if (!name || !email || !phone || !password || !user_type) {
        return res.status(400).json({ error: "All fields are required" });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(
            "INSERT INTO users (name, email, phone, password, user_type, address) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, phone, hashedPassword, user_type, address || ""],
            function(err) {
                if (err) {
                    console.error("❌ Database error:", err.message);
                    return res.status(400).json({ error: "Email already exists" });
                }
                
                const token = jwt.sign(
                    { id: this.lastID, email, user_type },
                    process.env.JWT_SECRET || "fabriconix_secret",
                    { expiresIn: "24h" }
                );
                
                console.log("✅ User registered:", { id: this.lastID, name, user_type });
                
                res.json({ 
                    success: true,
                    token, 
                    user: { 
                        id: this.lastID, 
                        name, 
                        email, 
                        user_type,
                        phone,
                        address: address || ""
                    } 
                });
            }
        );
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
});

// Login user
app.post("/api/login", (req, res) => {
    const { email, password, user_type } = req.body;
    
    console.log("🔐 Login attempt:", { email, user_type });
    
    if (!email || !password || !user_type) {
        return res.status(400).json({ error: "All fields are required" });
    }
    
    db.get("SELECT * FROM users WHERE email = ? AND user_type = ?", [email, user_type], async (err, user) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        
        if (!user) {
            return res.status(400).json({ error: "Invalid email or user type" });
        }
        
        try {
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ error: "Invalid password" });
            }
            
            const token = jwt.sign(
                { id: user.id, email: user.email, user_type: user.user_type },
                process.env.JWT_SECRET || "fabriconix_secret",
                { expiresIn: "24h" }
            );
            
            console.log("✅ User logged in:", { id: user.id, name: user.name });
            
            res.json({ 
                success: true,
                token, 
                user: { 
                    id: user.id, 
                    name: user.name, 
                    email: user.email, 
                    user_type: user.user_type,
                    phone: user.phone,
                    address: user.address,
                    profile_pic: user.profile_pic
                } 
            });
        } catch (error) {
            console.error("❌ Login error:", error);
            res.status(500).json({ error: "Server error during login" });
        }
    });
});

// Get user profile
app.get("/api/profile", authenticateToken, (req, res) => {
    db.get("SELECT id, name, email, phone, user_type, address, profile_pic FROM users WHERE id = ?", 
        [req.user.id], 
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
            }
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json(user);
        }
    );
});

// Create order
app.post("/api/orders", authenticateToken, upload.array("images", 5), (req, res) => {
    const { fabric_type, dress_type, total_amount, delivery_address } = req.body;
    
    if (!fabric_type || !dress_type || !total_amount || !delivery_address) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const trackingCode = "FCX" + Date.now().toString().slice(-6);
    
    db.run(
        `INSERT INTO orders (customer_id, fabric_type, dress_type, total_amount, delivery_address, tracking_code, images) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, fabric_type, dress_type, parseFloat(total_amount), delivery_address, trackingCode, JSON.stringify(images)],
        function(err) {
            if (err) {
                console.error("❌ Order creation error:", err);
                return res.status(500).json({ error: "Failed to create order" });
            }
            
            console.log("✅ Order created:", { orderId: this.lastID, customer: req.user.id });
            
            res.json({
                success: true,
                orderId: this.lastID,
                trackingCode,
                message: "Order placed successfully"
            });
        }
    );
});

// Get user orders
app.get("/api/orders", authenticateToken, (req, res) => {
    db.all("SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC", [req.user.id], (err, orders) => {
        if (err) {
            console.error("❌ Error fetching orders:", err);
            return res.status(500).json({ error: "Database error" });
        }
        
        // Parse JSON fields
        const parsedOrders = orders.map(order => ({
            ...order,
            images: order.images ? JSON.parse(order.images) : []
        }));
        
        res.json(parsedOrders);
    });
});

// Get all users (for testing)
app.get("/api/users", (req, res) => {
    db.all("SELECT id, name, email, user_type, created_at FROM users", (err, users) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(users);
        }
    });
});

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) return res.status(401).json({ error: "Access token required" });
    
    jwt.verify(token, process.env.JWT_SECRET || "fabriconix_secret", (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
}

// Socket.io for real-time chat
io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);
    
    socket.on("join-room", (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room`);
    });
    
    socket.on("send-message", (data) => {
        const { receiverId, message } = data;
        
        if (!receiverId || !message) {
            return;
        }
        
        db.run(
            `INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)`,
            [data.senderId, receiverId, message],
            function(err) {
                if (!err) {
                    const messageData = {
                        id: this.lastID,
                        sender_id: data.senderId,
                        receiver_id: receiverId,
                        message,
                        created_at: new Date().toISOString()
                    };
                    
                    io.to(`user_${receiverId}`).emit("receive-message", messageData);
                    console.log(`💬 Message sent from ${data.senderId} to ${receiverId}`);
                }
            }
        );
    });
    
    socket.on("disconnect", () => {
        console.log("🔌 Client disconnected:", socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`👥 Users list: http://localhost:${PORT}/api/users`);
    console.log(`💬 WebSocket ready for real-time chat`);
});
