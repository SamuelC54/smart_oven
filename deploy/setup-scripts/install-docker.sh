#!/bin/bash

echo "Installing Docker..."

# Check if Docker is already installed
if command -v docker &> /dev/null; then
  echo "Docker is already installed:"
  docker --version
  echo "Skipping Docker installation"
else
  echo "Docker not found, installing..."

  # Remove old versions
  sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

  # Update package index
  sudo apt-get update

  # Install prerequisites
  sudo apt-get install -y ca-certificates curl gnupg lsb-release

  # Add Docker's official GPG key (non-interactive)
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --batch --dearmor -o /etc/apt/keyrings/docker.gpg

  # Set up repository
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  # Install Docker
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

  echo "Docker installed successfully"
fi

# Add user to docker group
USERNAME="$(id -un)"
sudo usermod -aG docker "$USERNAME"
echo "Added $USERNAME to docker group."
