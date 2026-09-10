# Petri Server & Petri SmartShield Architecture

## Overview
Petri Server provides zero-trust self-hosted cloud server capabilities within Petri Zero:
- **Engine**: Container management via `/var/run/docker.sock`.
- **Zero-Trust**: Petri SmartShield (rate limiting, anti-bot, anti-ddos, 2FA, SSL termination).
- **Proxy**: Petri Proxy routing table with target routing rules.
- **Market**: 1-click Docker application store for AI and database workloads (Ollama, PostgreSQL, Redis, ChromaDB, MinIO, Nginx).
- **Branding**: Strictly branded Petri Zero / Petri Server. Zero occurrences of external server names.
