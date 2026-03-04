# Fabriconix

A full-stack fabric ordering and management system designed for connecting customers with fabric stores, enabling seamless order placement, real-time chat, order tracking, and QR code scanning capabilities.

##  Overview

Fabriconix is a comprehensive e-commerce platform built for fabric trading that includes:
- User authentication and authorization
- Real-time order management
- Live chat functionality between customers and vendors
- Order tracking system
- QR code scanner integration
- File upload capabilities for fabric samples/images

##  Project Structure

```
Fabriconix/
├── backend/              # Node.js/Express backend server
│   ├── models/          # Database models (User, Order, Message)
│   ├── routes/          # API routes (auth, orders, chat)
│   ├── config/          # Configuration files
│   ├── uploads/         # Uploaded files storage
│   └── server.js        # Main server entry point
├── frontend/            # Frontend web application
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files (main, chat, tracking, scanner)
│   ├── images/         # Static images
│   └── index.html      # Main HTML file
├── database/           # Database configuration
│   ├── schema.sql      # Database schema
│   └── seed_data.sql   # Sample data
├── setup.bat           # Windows setup script
└── install.bat         # Installation script
```

##  Features

- **User Authentication**: Secure login and registration system with JWT tokens
- **Order Management**: Create, track, and manage fabric orders
- **Real-time Chat**: WebSocket-based chat system for customer-vendor communication
- **Order Tracking**: Track order status in real-time
- **QR Code Scanner**: Scan QR codes for quick order lookup and verification
- **File Uploads**: Upload fabric images and samples
- **SQLite Database**: Lightweight database solution for data persistence

##  Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **SQLite3** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Multer** - File upload handling
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling
- **JavaScript** - Client-side logic
- **Socket.io Client** - Real-time communication

##  Installation

### Prerequisites
- Node.js (v14 or higher) - [Download here](https://nodejs.org)
- npm (comes with Node.js)

### Windows Setup (Automated)

1. Clone the repository:
```bash
git clone https://github.com/shravya2209/Fabriconix.git
cd Fabriconix
```

2. Run the setup script:
```bash
setup.bat
```

3. Install backend dependencies:
```bash
cd backend
npm install express cors bcryptjs jsonwebtoken multer sqlite3 socket.io dotenv
npm install -D nodemon
```

### Manual Setup

1. Clone the repository:
```bash
git clone https://github.com/shravya2209/Fabriconix.git
cd Fabriconix
```

2. Create the folder structure:
```bash
mkdir -p backend/{uploads,models,routes,config}
mkdir -p frontend/{css,js,images,uploads}
mkdir -p database
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Set up environment variables:
Create a `.env` file in the `backend` directory:
```env
PORT=3000
JWT_SECRET=your_secret_key_here
DB_PATH=../database/fabriconix.db
```

5. Initialize the database:
```bash
cd ../database
# Run schema.sql to create tables
# Run seed_data.sql to populate initial data
```

##  Usage

### Starting the Backend Server

```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

### Running the Frontend

Open `frontend/index.html` in your web browser, or serve it using a local web server:

```bash
# Using Python
python -m http.server 8000

# Or using Node.js http-server
npx http-server frontend
```

Then navigate to `http://localhost:8000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Chat
- `GET /api/chat/messages/:orderId` - Get chat messages for an order
- `POST /api/chat/messages` - Send a new message
- WebSocket events for real-time messaging

##  Security Features

- Password hashing with bcrypt
- JWT-based authentication
- CORS configuration for API security
- Environment variable protection for sensitive data

##  Frontend Features

### Main Components
- **main.js**: Core application logic
- **chat.js**: Real-time chat functionality
- **tracking.js**: Order tracking interface
- **scanner.js**: QR code scanning capability

##  Database Schema

The application uses SQLite with the following main tables:
- **Users**: User authentication and profile data
- **Orders**: Fabric order information
- **Messages**: Chat messages between users

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  License

This project is open source and available under the [MIT License](LICENSE).

##  Author

**shravya2209**
- GitHub: [@shravya2209](https://github.com/shravya2209)

##  Bug Reports

If you discover any bugs, please create an issue on GitHub with:
- Bug description
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

##  Support

For support and questions, please open an issue in the GitHub repository.

##  Project Status

This project was created on March 4, 2026, and is actively under development.

##  Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Node.js Documentation](https://nodejs.org/docs/)

---

**Note**: Make sure to configure your `.env` file properly before running the application in production.
