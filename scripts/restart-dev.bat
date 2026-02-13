@echo off
echo Stopping any running Next.js dev servers...

REM Kill processes on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
)

REM Kill processes on port 3001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /F /PID %%a 2>nul
)

echo Stopped dev servers
echo.
echo Regenerating Prisma client...
call npx prisma generate

echo.
echo Starting dev server...
call npm run dev
