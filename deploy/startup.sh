#!/usr/bin/env bash
set -euo pipefail

echo "[Petri Startup] Starting Turnkey Node Initialization on Ubuntu 24.04..."

# 1. Format and Mount 50 GB Balanced Persistent Disk
DISKPTR="/dev/disk/by-id/google-petri-vault"
VAULT_DIR="/var/lib/petri/vault"

if [ -e "$DISKPTR" ]; then
  if ! blkid "$DISKPTR" > /dev/null 2>&1; then
    echo "[Petri Startup] Formatting 50 GB persistent disk as ext4..."
    mkfs.ext4 -m 0 -E lazy_itable_init=0,lazy_journal_init=0 "$DISKPTR"
  fi
  mkdir -p "$VAULT_DIR"
  if ! grep -qs "$VAULT_DIR" /proc/mounts; then
    echo "[Petri Startup] Mounting $DISKPTR to $VAULT_DIR..."
    mount -o discard,defaults "$DISKPTR" "$VAULT_DIR"
    echo "$DISKPTR $VAULT_DIR ext4 discard,defaults,nofail 0 2" >> /etc/fstab
  fi
fi

mkdir -p "$VAULT_DIR/caddy_data" "$VAULT_DIR/caddy_config" "$VAULT_DIR/browser_vault" "$VAULT_DIR/tailscale"

# 2. Install Docker & Docker Compose Plugin
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release git

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Clone / Sync Repository
APP_DIR="/opt/zero-petri"
if [ ! -d "$APP_DIR" ]; then
  echo "[Petri Startup] Cloning zero-petri repository..."
  git clone https://github.com/the-open-engine-company/zero-petri.git "$APP_DIR" || \
  git clone https://github.com/intortpo/zero-petri.git "$APP_DIR"
else
  echo "[Petri Startup] Updating zero-petri repository..."
  cd "$APP_DIR" && git pull || true
fi

# 4. Setup Systemd Service for Turnkey Fleet
cat <<'EOF' > /etc/systemd/system/petri-turnkey.service
[Unit]
Description=Petri Dedicated Turnkey Service Fleet (Web UI, Rust Daemon, Playwright, Caddy)
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=/opt/zero-petri/deploy
ExecStart=/usr/bin/docker compose -f docker-compose.turnkey.yml up
ExecStop=/usr/bin/docker compose -f docker-compose.turnkey.yml down
Restart=always
RestartSec=10s
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable petri-turnkey.service
systemctl start petri-turnkey.service

echo "[Petri Startup] Turnkey Systemd service launched successfully!"
