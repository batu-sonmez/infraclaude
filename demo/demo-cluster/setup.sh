#!/usr/bin/env bash
# InfraClaude Demo Cluster Setup
# Creates a minikube cluster with demo applications for testing InfraClaude

set -euo pipefail

echo "🚀 Setting up InfraClaude demo cluster..."

# Start minikube if not running
if ! minikube status &>/dev/null; then
  echo "Starting minikube..."
  minikube start --cpus=4 --memory=8192 --addons=metrics-server
else
  echo "Minikube is already running."
fi

# Enable metrics-server addon
echo "Enabling metrics-server..."
minikube addons enable metrics-server

# Create demo namespace
kubectl create namespace demo --dry-run=client -o yaml | kubectl apply -f -

# Deploy demo applications
echo "Deploying demo applications..."
kubectl apply -f manifests/

# Wait for deployments
echo "Waiting for deployments to be ready..."
kubectl -n demo wait --for=condition=available deployment/demo-api --timeout=120s || true
kubectl -n demo wait --for=condition=available deployment/demo-worker --timeout=120s || true

echo ""
echo "✅ Demo cluster is ready!"
echo ""
echo "Try these InfraClaude commands in Claude Code:"
echo "  'Show me all pods in the demo namespace'"
echo "  'Why is the broken-pod crashing?'"
echo "  'What's the CPU usage of my cluster?'"
echo "  'Check for any warning events'"
echo ""
echo "To tear down: minikube delete"
