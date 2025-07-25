#!/bin/bash

# default versions
GO_VERSION='1.24.2';
HUGO_VERSION='0.146.5';

echo "USING NODE VERSION: $(node -v)"

# Define a local installation directory
export LOCAL_BIN_DIR="$(pwd)/.bin"
mkdir -p "$LOCAL_BIN_DIR"

# Add local bin directory to PATH for the current session
export PATH=$PATH:"$LOCAL_BIN_DIR"

# install Go
echo "Installing Go $GO_VERSION..."
curl -sSOL https://dl.google.com/go/go${GO_VERSION}.linux-amd64.tar.gz
# Extract Go into a subdirectory within LOCAL_BIN_DIR
tar -C "$LOCAL_BIN_DIR" -xzf go${GO_VERSION}.linux-amd64.tar.gz
# Add Go's specific bin directory to PATH
export PATH=$PATH:"$LOCAL_BIN_DIR/go/bin"
rm -rf go${GO_VERSION}.linux-amd64.tar.gz
go version

# install Hugo
echo "Installing Hugo $HUGO_VERSION..."
curl -sSOL https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz
tar -xzf hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz
# Move Hugo executable to LOCAL_BIN_DIR
mv hugo "$LOCAL_BIN_DIR/"
rm -rf hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz
hugo version

# project setup
echo "Project setting up..."
npm run project-setup

# install dependencies
echo "Installing project dependencies..."
npm install

# run the build command
echo "Running the build command..."
npm run build