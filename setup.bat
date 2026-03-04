@echo off
echo ============================================
echo    FABRICONIX PROJECT SETUP - WINDOWS
echo ============================================
echo.

echo Step 1: Creating folder structure...
mkdir backend\uploads 2>nul
mkdir backend\models 2>nul
mkdir backend\routes 2>nul
mkdir backend\config 2>nul
mkdir database 2>nul
mkdir frontend\css 2>nul
mkdir frontend\js 2>nul
mkdir frontend\images 2>nul
mkdir frontend\uploads 2>nul

echo Step 2: Creating files...
cd. > backend\server.js
cd. > backend\package.json
cd. > backend\.env
cd. > backend\models\User.js
cd. > backend\models\Order.js
cd. > backend\models\Message.js
cd. > backend\routes\auth.js
cd. > backend\routes\orders.js
cd. > backend\routes\chat.js
cd. > database\schema.sql
cd. > database\seed_data.sql
cd. > frontend\index.html
cd. > frontend\css\style.css
cd. > frontend\js\main.js
cd. > frontend\js\chat.js
cd. > frontend\js\tracking.js
cd. > frontend\js\scanner.js
cd. > README.md

echo.
echo Step 3: Structure created successfully!
echo.
echo ============================================
echo          NEXT STEPS TO FOLLOW:
echo ============================================
echo 1. Install Node.js from https://nodejs.org
echo 2. Open PowerShell as Administrator
echo 3. Run these commands:
echo.
echo    cd C:\fabriconix\backend
echo    npm init -y
echo    npm install express cors bcryptjs jsonwebtoken multer sqlite3 socket.io dotenv
echo    npm install -D nodemon
echo.
echo 4. Copy the code I provide into each file
echo ============================================
pause