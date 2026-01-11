#!/bin/bash
# Copyright Governance Portal. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

# Create census-channel and join all peers
# Run after network is up and crypto is generated

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOCKCHAIN_DIR="$(dirname "$SCRIPT_DIR")"

cd "$BLOCKCHAIN_DIR"

CHANNEL_NAME="census-channel"
ORDERER_CA="crypto-config/ordererOrganizations/governance.com/orderers/orderer.governance.com/msp/tlscacerts/tlsca.governance.com-cert.pem"
ORDERER_ADMIN_TLS_CERT="crypto-config/ordererOrganizations/governance.com/orderers/orderer.governance.com/tls/server.crt"
ORDERER_ADMIN_TLS_KEY="crypto-config/ordererOrganizations/governance.com/orderers/orderer.governance.com/tls/server.key"

echo "========================================"
echo "Creating channel: $CHANNEL_NAME"
echo "========================================"

# Check for configtxgen
if ! command -v configtxgen &> /dev/null; then
    echo "ERROR: configtxgen not found. Please install Fabric binaries."
    exit 1
fi

# Create channel-artifacts directory
mkdir -p channel-artifacts

# Generate genesis block
echo "Generating genesis block..."
export FABRIC_CFG_PATH=$BLOCKCHAIN_DIR
configtxgen -profile GovernanceGenesis -outputBlock ./channel-artifacts/genesis.block -channelID system-channel

# Generate channel creation transaction
echo "Generating channel creation tx..."
configtxgen -profile CensusChannel -outputCreateChannelTx ./channel-artifacts/${CHANNEL_NAME}.tx -channelID $CHANNEL_NAME

# Generate anchor peer updates for each org
echo "Generating anchor peer updates..."
configtxgen -profile CensusChannel -outputAnchorPeersUpdate ./channel-artifacts/StateMSPanchors.tx -channelID $CHANNEL_NAME -asOrg StateMSP
configtxgen -profile CensusChannel -outputAnchorPeersUpdate ./channel-artifacts/DistrictMSPanchors.tx -channelID $CHANNEL_NAME -asOrg DistrictMSP
configtxgen -profile CensusChannel -outputAnchorPeersUpdate ./channel-artifacts/AuditMSPanchors.tx -channelID $CHANNEL_NAME -asOrg AuditMSP

echo "========================================"
echo "Channel artifacts generated!"
echo "========================================"

echo ""
echo "Files created:"
ls -la channel-artifacts/

echo ""
echo "Next steps:"
echo "1. Start the network: docker-compose -f docker-compose-governance.yaml up -d"
echo "2. Join orderers to system channel using osnadmin"
echo "3. Create and join the census-channel"
echo "4. Deploy the census-contract chaincode"
