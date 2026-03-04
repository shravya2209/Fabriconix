@echo off
echo Cleaning up...
del package.json 2>nul
del package-lock.json 2>nul
rmdir node_modules /s /q 2>nul

echo Creating package.json...
echo { > package.json
echo   "name": "fabriconix-backend", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "description": "Backend for Fabriconix", >> package.json
echo   "main": "server.js", >> package.json
echo   "scripts": { >> package.json
echo     "start": "node server.js", >> package.json
echo     "dev": "nodemon server.js" >> package.json
echo   }, >> package.json
echo   "dependencies": {}, >> package.json
echo   "devDependencies": {} >> package.json
echo } >> package.json

echo Installing dependencies...
npm install express cors bcryptjs jsonwebtoken multer sqlite3 socket.io dotenv
npm install -D nodemon

echo.
echo Installation complete!
echo Run: npm run dev
pause