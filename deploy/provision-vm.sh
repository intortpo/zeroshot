#!/usr/bin/env bash
set -euo pipefail

# Provisioning Automation for Option 2: Dedicated Single Compute Engine VM
# Region: asia-southeast1 (Singapore - sub-25ms to Bangkok)
# Machine: e2-standard-2 (2 vCPUs, 8 GB RAM)
# Disk: 50 GB pd-balanced

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo 'petri-production')}"
ZONE="asia-southeast1-b"
REGION="asia-southeast1"
INSTANCE_NAME="petri-turnkey-vm"
MACHINE_TYPE="e2-standard-2"
DISK_NAME="petri-turnkey-disk-50gb"
STATIC_IP_NAME="petri-turnkey-static-ip"

echo "========================================================"
echo " Launching Petri Option 2: Dedicated Turnkey VM"
echo " Project: $PROJECT_ID | Zone: $ZONE"
echo " Machine: $MACHINE_TYPE | Monthly: ~$56.50/mo"
echo "========================================================"

echo ">>> 1. Reserving Regional Static IPv4..."
gcloud compute addresses create "$STATIC_IP_NAME" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --description="Petri Turnkey Static IP" || true

STATIC_IP=$(gcloud compute addresses describe "$STATIC_IP_NAME" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --format="value(address)")
echo "Reserved Static IP: $STATIC_IP"

echo ">>> 2. Creating 50 GB Balanced Persistent Disk..."
gcloud compute disks create "$DISK_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --type="pd-balanced" \
  --size="50GB" \
  --description="Persistent Vault for Petri SQLite, Tokens, and Repos" || true

echo ">>> 3. Creating Firewall Rules for Ingress (HTTP/HTTPS)..."
gcloud compute firewall-rules create "allow-petri-ingress" \
  --project="$PROJECT_ID" \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:80,tcp:443,udp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=petri-server || true

echo ">>> 4. Launching Dedicated e2-standard-2 VM Instance..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
gcloud compute instances create "$INSTANCE_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --machine-type="$MACHINE_TYPE" \
  --tags="petri-server,http-server,https-server" \
  --address="$STATIC_IP" \
  --disk="name=$DISK_NAME,device-name=petri-vault,mode=rw,boot=no" \
  --image-family="ubuntu-2404-lts-amd64" \
  --image-project="ubuntu-os-cloud" \
  --metadata-from-file="startup-script=${SCRIPT_DIR}/startup.sh" \
  --scopes="cloud-platform"

echo "========================================================"
echo " Petri Turnkey VM Launched Successfully!"
echo " IP Address: http://$STATIC_IP"
echo " Expected initialization time: ~2-3 minutes"
echo " Check status with: gcloud compute ssh $INSTANCE_NAME --zone=$ZONE"
echo "========================================================"
