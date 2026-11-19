"""
Centralized Evolution API & VPS Client Helper.
Reads API keys and secrets securely from environment variables / .env files.
Zero hardcoded keys permitted in any script.
"""

import os
import sys
from pathlib import Path

def load_env_file():
    """Find and load key-value pairs from .env.production or .env.local without requiring external packages."""
    repo_root = Path(__file__).resolve().parent.parent.parent
    for fname in [".env.production", ".env.local", ".env"]:
        env_path = repo_root / fname
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'").strip('"')
                            if k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass

# Load environment on module import
load_env_file()

def get_evo_api_key() -> str:
    key = os.environ.get("EVOLUTION_API_KEY")
    if not key:
        raise ValueError("[evo_client] EVOLUTION_API_KEY is not configured in environment or .env files!")
    return key

def get_evo_headers() -> dict:
    return {
        "apikey": get_evo_api_key(),
        "Content-Type": "application/json"
    }

def get_vps_ssh_client():
    import paramiko
    host = os.environ.get("VPS_HOST", "187.127.170.36")
    user = os.environ.get("VPS_USER", "root")
    pwd = os.environ.get("VPS_PASSWORD")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=user, password=pwd)
    return ssh

if __name__ == "__main__":
    try:
        key = get_evo_api_key()
        print(f"[evo_client] Key loaded successfully (length: {len(key)})")
    except Exception as e:
        print(f"[evo_client] Error: {e}")
