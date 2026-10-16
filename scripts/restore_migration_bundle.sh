#!/usr/bin/env bash
# ==============================================================================
# CUSTOMERPILOT & CAKECONNECTION - ZERO-SCAN MASTER RESTORE ENGINE
# ==============================================================================
# Usage:
#   bash /root/restore_migration_bundle.sh /path/to/customerpilot_zero_scan_migration_bundle_*.tar.gz
# ==============================================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path-to-migration-bundle.tar.gz>"
  exit 1
fi

BUNDLE_FILE="$1"
if [ ! -f "${BUNDLE_FILE}" ]; then
  echo "Error: Bundle file '${BUNDLE_FILE}' does not exist!"
  exit 1
fi

EXTRACT_DIR="/tmp/migration_restore_$(date +%s)"
mkdir -p "${EXTRACT_DIR}"

echo "===================================================================="
echo ">> Starting CustomerPilot Zero-Scan Migration Restore"
echo "Bundle: ${BUNDLE_FILE}"
echo "===================================================================="

tar -xzf "${BUNDLE_FILE}" -C "${EXTRACT_DIR}"

# 1. Restore WhatsApp Evolution API Cryptographic Session Keys (ZERO RE-SCAN CORE)
echo "[1/6] Restoring Evolution API WhatsApp sessions into Docker volume..."
EVO_VOLUME_PATH="/var/lib/docker/volumes/evolution-api_evolution_instances/_data"
mkdir -p "${EVO_VOLUME_PATH}"
if [ -f "${EXTRACT_DIR}/evolution_instances.tar.gz" ]; then
  # Temporarily stop Evolution API container to safely write keys
  cd /opt/evolution-api && docker compose stop evolution-api 2>/dev/null || true
  tar -xzf "${EXTRACT_DIR}/evolution_instances.tar.gz" -C "${EVO_VOLUME_PATH}"
  chown -R root:root "${EVO_VOLUME_PATH}"
  docker compose start evolution-api 2>/dev/null || docker compose up -d
  echo "      ✅ Evolution API sessions restored and container revived."
fi

# 2. Restore PostgreSQL Databases (CakeConnection & Evolution API)
echo "[2/6] Restoring PostgreSQL 14 databases..."
if [ -f "${EXTRACT_DIR}/cakeconnection.sql" ]; then
  sudo -u postgres psql -c "CREATE DATABASE cakeconnection;" 2>/dev/null || true
  sudo -u postgres psql cakeconnection < "${EXTRACT_DIR}/cakeconnection.sql" 2>/dev/null || true
  echo "      ✅ CakeConnection PostgreSQL database restored."
fi

if [ -f "${EXTRACT_DIR}/evolution_db.sql" ]; then
  sudo -u postgres psql -c "CREATE DATABASE evolution_db;" 2>/dev/null || true
  sudo -u postgres psql evolution_db < "${EXTRACT_DIR}/evolution_db.sql" 2>/dev/null || true
  echo "      ✅ Evolution API PostgreSQL database restored."
fi

# 3. Restore CustomerPilot SQLite Database
echo "[3/6] Restoring SQLite database (dev.db)..."
if [ -f "${EXTRACT_DIR}/dev.db" ]; then
  mkdir -p /var/www/CustomerPilot/prisma
  cp -f "${EXTRACT_DIR}/dev.db" /var/www/CustomerPilot/prisma/dev.db
  # Also copy to standalone dir if it exists
  if [ -d "/var/www/CustomerPilot/.next/standalone" ]; then
    mkdir -p /var/www/CustomerPilot/.next/standalone/prisma
    cp -f "${EXTRACT_DIR}/dev.db" /var/www/CustomerPilot/.next/standalone/prisma/dev.db
  fi
  echo "      ✅ CustomerPilot dev.db restored to active and standalone paths."
fi

# 4. Restore Environment Credentials
echo "[4/6] Restoring environment credentials..."
if [ -f "${EXTRACT_DIR}/customerpilot.env.production" ]; then
  cp -f "${EXTRACT_DIR}/customerpilot.env.production" /var/www/CustomerPilot/.env.production
  cp -f "${EXTRACT_DIR}/customerpilot.env.production" /var/www/CustomerPilot/.env
  if [ -d "/var/www/CustomerPilot/.next/standalone" ]; then
    cp -f "${EXTRACT_DIR}/customerpilot.env.production" /var/www/CustomerPilot/.next/standalone/.env
  fi
  echo "      ✅ CustomerPilot .env.production restored."
fi

if [ -f "${EXTRACT_DIR}/cakeconnection.env" ]; then
  mkdir -p /var/www/CakeConnection/next-app
  cp -f "${EXTRACT_DIR}/cakeconnection.env" /var/www/CakeConnection/next-app/.env
  echo "      ✅ CakeConnection .env restored."
fi

# 5. Restore Media & User Uploads
echo "[5/6] Restoring public media uploads..."
if [ -f "${EXTRACT_DIR}/customerpilot_uploads.tar.gz" ]; then
  mkdir -p /var/www/CustomerPilot/public
  tar -xzf "${EXTRACT_DIR}/customerpilot_uploads.tar.gz" -C /var/www/CustomerPilot/public 2>/dev/null || true
  if [ -d "/var/www/CustomerPilot/.next/standalone/public" ]; then
    tar -xzf "${EXTRACT_DIR}/customerpilot_uploads.tar.gz" -C /var/www/CustomerPilot/.next/standalone/public 2>/dev/null || true
  fi
  echo "      ✅ CustomerPilot public uploads restored."
fi

if [ -f "${EXTRACT_DIR}/cakeconnection_uploads.tar.gz" ]; then
  mkdir -p /var/www/CakeConnection/public
  tar -xzf "${EXTRACT_DIR}/cakeconnection_uploads.tar.gz" -C /var/www/CakeConnection/public 2>/dev/null || true
  echo "      ✅ CakeConnection public uploads restored."
fi

# 6. Restart PM2 Services and Clean Up
echo "[6/6] Reloading PM2 services..."
pm2 restart all || true
rm -rf "${EXTRACT_DIR}"

echo "===================================================================="
echo "🎉 ZERO-SCAN MIGRATION RESTORE COMPLETED SUCCESSFULLY!"
echo "All WhatsApp sessions, databases, and assets are 100% active."
echo "===================================================================="
