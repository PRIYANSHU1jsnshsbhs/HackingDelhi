#!/bin/bash
# Copyright Governance Portal. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

# Deploy CensusContract chaincode to all peers
# Run after channel is created and peers have joined

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOCKCHAIN_DIR="$(dirname "$SCRIPT_DIR")"

cd "$BLOCKCHAIN_DIR"

CHANNEL_NAME="census-channel"
CC_NAME="census-contract"
CC_SRC_PATH="../census-contract"
CC_VERSION="1.0"
CC_SEQUENCE="1"
CC_INIT_FCN="InitLedger"
CC_END_POLICY="OR('StateMSP.peer','DistrictMSP.peer')"

# TLS Certificates
ORDERER_CA="crypto-config/ordererOrganizations/governance.com/orderers/orderer.governance.com/msp/tlscacerts/tlsca.governance.com-cert.pem"

echo "========================================"
echo "Deploying CensusContract Chaincode"
echo "========================================"

# Function to set peer environment
setGlobals() {
  local ORG=$1
  local PEER=$2
  
  case $ORG in
    state)
      export CORE_PEER_LOCALMSPID="StateMSP"
      export CORE_PEER_TLS_ROOTCERT_FILE="${BLOCKCHAIN_DIR}/crypto-config/peerOrganizations/state.governance.com/peers/peer${PEER}.state.governance.com/tls/ca.crt"
      export CORE_PEER_MSPCONFIGPATH="${BLOCKCHAIN_DIR}/crypto-config/peerOrganizations/state.governance.com/users/Admin@state.governance.com/msp"
      if [ "$PEER" = "0" ]; then
        export CORE_PEER_ADDRESS=localhost:7051
      else
        export CORE_PEER_ADDRESS=localhost:7151
      fi
      ;;
    district)
      export CORE_PEER_LOCALMSPID="DistrictMSP"
      export CORE_PEER_TLS_ROOTCERT_FILE="${BLOCKCHAIN_DIR}/crypto-config/peerOrganizations/district.governance.com/peers/peer${PEER}.district.governance.com/tls/ca.crt"
      export CORE_PEER_MSPCONFIGPATH="${BLOCKCHAIN_DIR}/crypto-config/peerOrganizations/district.governance.com/users/Admin@district.governance.com/msp"
      if [ "$PEER" = "0" ]; then
        export CORE_PEER_ADDRESS=localhost:9051
      else
        export CORE_PEER_ADDRESS=localhost:9151
      fi
      ;;
    audit)
      export CORE_PEER_LOCALMSPID="AuditMSP"
      export CORE_PEER_TLS_ROOTCERT_FILE="${BLOCKCHAIN_DIR}/crypto-config/peerOrganizations/audit.governance.com/peers/peer0.audit.governance.com/tls/ca.crt"
      export CORE_PEER_MSPCONFIGPATH="${BLOCKCHAIN_DIR}/crypto-config/peerOrganizations/audit.governance.com/users/Admin@audit.governance.com/msp"
      export CORE_PEER_ADDRESS=localhost:11051
      ;;
  esac
  
  export CORE_PEER_TLS_ENABLED=true
}

# Package chaincode
echo "Packaging chaincode..."
cd "$CC_SRC_PATH"
npm install
cd "$BLOCKCHAIN_DIR"

peer lifecycle chaincode package ${CC_NAME}.tar.gz \
  --path ${CC_SRC_PATH} \
  --lang node \
  --label ${CC_NAME}_${CC_VERSION}

echo "Chaincode packaged successfully!"

# Install on all peers
echo "Installing chaincode on peers..."

# State peers
for PEER in 0 1; do
  setGlobals state $PEER
  echo "Installing on peer${PEER}.state.governance.com..."
  peer lifecycle chaincode install ${CC_NAME}.tar.gz
done

# District peers
for PEER in 0 1; do
  setGlobals district $PEER
  echo "Installing on peer${PEER}.district.governance.com..."
  peer lifecycle chaincode install ${CC_NAME}.tar.gz
done

# Audit peer
setGlobals audit 0
echo "Installing on peer0.audit.governance.com..."
peer lifecycle chaincode install ${CC_NAME}.tar.gz

# Get package ID
setGlobals state 0
CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r ".installed_chaincodes[] | select(.label==\"${CC_NAME}_${CC_VERSION}\") | .package_id")
echo "Package ID: $CC_PACKAGE_ID"

# Approve for each org
echo "Approving chaincode for organizations..."

# State org approval  
setGlobals state 0
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.governance.com \
  --tls \
  --cafile "$ORDERER_CA" \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $CC_PACKAGE_ID \
  --sequence $CC_SEQUENCE \
  --signature-policy "$CC_END_POLICY" \
  --init-required

# District org approval
setGlobals district 0
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.governance.com \
  --tls \
  --cafile "$ORDERER_CA" \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $CC_PACKAGE_ID \
  --sequence $CC_SEQUENCE \
  --signature-policy "$CC_END_POLICY" \
  --init-required

# Audit org approval (read-only but still needs to approve)
setGlobals audit 0
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.governance.com \
  --tls \
  --cafile "$ORDERER_CA" \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $CC_PACKAGE_ID \
  --sequence $CC_SEQUENCE \
  --signature-policy "$CC_END_POLICY" \
  --init-required

# Check commit readiness
echo "Checking commit readiness..."
setGlobals state 0
peer lifecycle chaincode checkcommitreadiness \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --sequence $CC_SEQUENCE \
  --signature-policy "$CC_END_POLICY" \
  --init-required \
  --output json

# Commit chaincode
echo "Committing chaincode..."
peer lifecycle chaincode commit \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.governance.com \
  --tls \
  --cafile "$ORDERER_CA" \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --sequence $CC_SEQUENCE \
  --signature-policy "$CC_END_POLICY" \
  --init-required \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles "${BLOCKCHAIN_DIR}/crypto-config/peerOrganizations/state.governance.com/peers/peer0.state.governance.com/tls/ca.crt" \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles "${BLOCKCHAIN_DIR}/crypto-config/peerOrganizations/district.governance.com/peers/peer0.district.governance.com/tls/ca.crt"

# Initialize chaincode
echo "Initializing chaincode..."
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.governance.com \
  --tls \
  --cafile "$ORDERER_CA" \
  -C $CHANNEL_NAME \
  -n $CC_NAME \
  --isInit \
  -c '{"function":"InitLedger","Args":[]}'

echo "========================================"
echo "CensusContract deployed successfully!"
echo "========================================"

echo ""
echo "Chaincode functions available:"
echo "  - InitializeRecord(recordID, dataHash, metadata)"
echo "  - ReviewRecord(recordID, reviewerID, decision, newHash)"
echo "  - VerifyIntegrity(recordID, providedHash)"
echo "  - LogAccess(recordID, accessorID, reason)"
echo "  - GetRecord(recordID)"
echo "  - GetRecordHistory(recordID)"
echo "  - GetAccessLogs(recordID)"
echo "  - QueryByStatus(status)"
echo "  - QueryByFlagStatus(flagStatus)"
