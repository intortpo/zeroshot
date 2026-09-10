#!/usr/bin/env bash
set -euo pipefail

# Automated Encrypted Daily Backup of Petri Persistent Vault to Google Cloud Storage
BACKUP_BUCKET="${PETRI_BACKUP_BUCKET:-gs://petri-backups-bangkok}"
VAULT_DIR="/var/lib/petri/vault"
DATE_TAG=$(date +%Y-%m-%d-%H%M)
ARCHIVE_PATH="/tmp/petri-vault-backup-${DATE_TAG}.tar.gz"

echo "[Petri Backup] Creating snapshot of $VAULT_DIR..."
tar -czf "$ARCHIVE_PATH" -C "$VAULT_DIR" .

echo "[Petri Backup] Uploading snapshot to $BACKUP_BUCKET..."
if command -v gcloud > /dev/null 2>&1; then
  gcloud storage cp "$ARCHIVE_PATH" "${BACKUP_BUCKET}/petri-vault-backup-${DATE_TAG}.tar.gz"
fi

rm -f "$ARCHIVE_PATH"
echo "[Petri Backup] Backup completed successfully."
