#!/bin/bash
echo "Starting CustomerPilot Dev Server..."
docker-compose up -d postgres redis evolution-api
npm run dev
