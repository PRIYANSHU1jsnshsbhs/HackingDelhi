#!/bin/bash
# Copyright Governance Portal. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

# Generate crypto material for GovernanceNet
# Requires cryptogen binary from Fabric

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOCKCHAIN_DIR="$(dirname "$SCRIPT_DIR")"

cd "$BLOCKCHAIN_DIR"

echo "========================================"
echo "Generating crypto material..."
echo "========================================"

# Check for cryptogen
if ! command -v cryptogen &> /dev/null; then
    echo "ERROR: cryptogen not found. Please install Fabric binaries."
    echo "Run: curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.0 1.5.5 -d -s"
    exit 1
fi

# Remove old crypto material
rm -rf crypto-config

# Generate crypto material
cryptogen generate --config=./crypto-config.yaml --output="crypto-config"

echo "========================================"
echo "Crypto material generated successfully!"
echo "========================================"

echo ""
echo "Organizations created:"
echo "  - OrdererMSP (governance.com)"
echo "  - StateMSP (state.governance.com)"
echo "  - DistrictMSP (district.governance.com)"
echo "  - AuditMSP (audit.governance.com)"
