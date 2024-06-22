#!/bin/bash

# Start ganache-cli with workspace directory
ganache-cli -d --db ../asset-tracker/ganache-workspace &

# Wait for ganache-cli to fully start
sleep 10

# Deploy contracts
cd ../asset-tracker
truffle compile
truffle migrate --reset

# Restore assets
cd ../asset-tracker-backend
node restoreAssets.js
