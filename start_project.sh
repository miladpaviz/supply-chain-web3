#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}>>> Starting Supply Chain Management DApp Setup...${NC}"

# 1. Kill existing processes on ports 5001 (Backend) and 5173 (Frontend)
echo -e "${BLUE}>>> Cleaning up ports 5001 and 5173...${NC}"
lsof -t -i:5001 | xargs kill -9 2>/dev/null
lsof -t -i:5173 | xargs kill -9 2>/dev/null

# 2. Start Backend
echo -e "${GREEN}>>> Starting Backend Server (Port 5001)...${NC}"
cd backend
npm start &
BACKEND_PID=$!

# 3. Start Frontend
echo -e "${GREEN}>>> Starting Frontend (Port 5173)...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo -e "${BLUE}>>> Both servers are launching!${NC}"
echo -e "${BLUE}>>> Backend PID: $BACKEND_PID${NC}"
echo -e "${BLUE}>>> Frontend PID: $FRONTEND_PID${NC}"
echo -e "${GREEN}>>> Access the app at: http://localhost:5173${NC}"

# Wait for background processes
wait
