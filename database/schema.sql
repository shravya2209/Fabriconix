CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    user_type TEXT NOT NULL,
    address TEXT,
    profile_pic TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
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
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    message TEXT,
    message_type TEXT DEFAULT 'text',
    file_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
