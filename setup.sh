#!/bin/bash
echo "======================================================"
echo " CUSTOMERPILOT - SETUP SCRIPT (LINUX / MACOS)"
echo "======================================================"

echo "[1/4] Installing Node.js Dependencies..."
npm install

if [ ! -f .env ]; then
  echo "[2/4] Creating .env file from .env.example..."
  cp .env.example .env
  echo "WARNING: Please review the .env file and add your Google/Gemini keys."
else
  echo "[2/4] .env file already exists. Skipping..."
fi

echo "[3/4] Starting Docker Containers (Postgres, Redis, Evolution)..."
docker-compose up -d postgres redis evolution-api pgadmin redisinsight

echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo "[4/4] Initializing Database (Prisma)..."
npx prisma generate
npx prisma migrate dev --name init

echo "======================================================"
echo " Setup Complete! Run './start.sh' to launch."
echo "======================================================"
