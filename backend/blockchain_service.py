"""
Blockchain Service for Governance Portal
=========================================
Provides integration with Hyperledger Fabric CensusContract chaincode.

This module handles:
- SHA256 hash computation for census records
- Communication with Fabric network via gateway
- Record initialization, review, and integrity verification

Note: For development/demo without Fabric network, uses mock mode.
"""

import hashlib
import json
import os
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger(__name__)

# ========================================
# Configuration
# ========================================

FABRIC_ENABLED = os.environ.get('FABRIC_ENABLED', 'false').lower() == 'true'
FABRIC_CHANNEL = os.environ.get('FABRIC_CHANNEL', 'census-channel')
FABRIC_CHAINCODE = os.environ.get('FABRIC_CHAINCODE', 'census-contract')
FABRIC_MSP_ID = os.environ.get('FABRIC_MSP_ID', 'StateMSP')
FABRIC_WALLET_PATH = os.environ.get('FABRIC_WALLET_PATH', './wallet')
FABRIC_CONNECTION_PROFILE = os.environ.get('FABRIC_CONNECTION_PROFILE', './connection-profile.json')


class RecordStatus(str, Enum):
    """Census record status on blockchain"""
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    NEEDS_VERIFICATION = "NEEDS_VERIFICATION"
    PRIORITY = "PRIORITY"


class FlagStatus(str, Enum):
    """Flag status for census records"""
    NORMAL = "NORMAL"
    REVIEW = "REVIEW"
    PRIORITY = "PRIORITY"


@dataclass
class LedgerRecord:
    """Representation of a census record on the blockchain ledger"""
    record_id: str
    data_hash: str
    owner_household_id: str
    current_status: str
    flag_status: str
    created_by: str
    created_at: str
    last_updated_by: str
    last_updated_at: str
    version: int = 1
    previous_hash: Optional[str] = None


@dataclass
class IntegrityResult:
    """Result of an integrity verification check"""
    record_id: str
    verified: bool
    on_chain_hash: Optional[str] = None
    provided_hash: Optional[str] = None
    current_status: Optional[str] = None
    last_updated_at: Optional[str] = None
    error: Optional[str] = None
    timestamp: str = ""
    
    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()


@dataclass
class AccessLogEntry:
    """An access log entry from the blockchain"""
    log_id: str
    record_id: str
    accessor_id: str
    accessor_msp: str
    action_type: str
    details: str
    timestamp: str
    tx_id: str


# ========================================
# Hash Computation
# ========================================

def compute_record_hash(record: Dict[str, Any]) -> str:
    """
    Compute SHA256 hash of a census record.
    
    The hash is computed over a canonical JSON representation
    to ensure consistency across systems.
    
    Args:
        record: Census record dictionary
        
    Returns:
        SHA256 hex digest string
    """
    # Select only the fields that should be hashed (exclude metadata)
    hashable_fields = [
        'record_id', 'household_id', 'name', 'age', 'sex', 'relation',
        'caste', 'income', 'region', 'district', 'state', 'pin_code',
        'latitude', 'longitude', 'welfare_score', 'ration_card_type',
        'scheme_enrollment_count', 'employment_status', 'occupation_category',
        'sector', 'housing_type', 'water_source', 'toilet_access',
        'cooking_fuel', 'internet_access', 'household_size',
        'parent_id', 'spouse_id'
    ]
    
    # Build canonical record with sorted keys
    canonical = {}
    for field in sorted(hashable_fields):
        if field in record:
            value = record[field]
            # Convert to string for consistent hashing
            if value is None:
                canonical[field] = ""
            elif isinstance(value, (int, float)):
                canonical[field] = str(value)
            else:
                canonical[field] = str(value)
    
    # Create canonical JSON string (sorted keys, no whitespace)
    canonical_json = json.dumps(canonical, sort_keys=True, separators=(',', ':'))
    
    # Compute SHA256
    hash_obj = hashlib.sha256(canonical_json.encode('utf-8'))
    return hash_obj.hexdigest()


def verify_record_hash(record: Dict[str, Any], expected_hash: str) -> bool:
    """
    Verify that a record's computed hash matches the expected hash.
    
    Args:
        record: Census record dictionary
        expected_hash: Expected SHA256 hash
        
    Returns:
        True if hashes match, False otherwise
    """
    computed = compute_record_hash(record)
    return computed == expected_hash


# ========================================
# Mock Ledger (for development without Fabric)
# ========================================

class MockLedger:
    """
    In-memory mock ledger for development/testing.
    Simulates blockchain behavior without requiring Fabric network.
    """
    
    def __init__(self):
        self.records: Dict[str, LedgerRecord] = {}
        self.access_logs: List[AccessLogEntry] = []
        self.tx_counter = 0
    
    def _generate_tx_id(self) -> str:
        """Generate a mock transaction ID"""
        self.tx_counter += 1
        return f"tx_{self.tx_counter:08x}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    
    async def initialize_record(
        self,
        record_id: str,
        data_hash: str,
        household_id: str,
        flag_status: str,
        user_id: str
    ) -> str:
        """Initialize a new record on the mock ledger"""
        if record_id in self.records:
            raise ValueError(f"Record {record_id} already exists on ledger")
        
        now = datetime.now(timezone.utc).isoformat()
        
        self.records[record_id] = LedgerRecord(
            record_id=record_id,
            data_hash=data_hash,
            owner_household_id=household_id,
            current_status=RecordStatus.PENDING_REVIEW.value,
            flag_status=flag_status,
            created_by=user_id,
            created_at=now,
            last_updated_by=user_id,
            last_updated_at=now,
            version=1
        )
        
        tx_id = self._generate_tx_id()
        
        # Log the action
        self.access_logs.append(AccessLogEntry(
            log_id=f"LOG_{record_id}_{len(self.access_logs)}",
            record_id=record_id,
            accessor_id=user_id,
            accessor_msp=FABRIC_MSP_ID,
            action_type="INITIALIZE",
            details="Record initialized on ledger",
            timestamp=now,
            tx_id=tx_id
        ))
        
        logger.info(f"[MockLedger] Initialized record {record_id}, tx={tx_id}")
        return tx_id
    
    async def review_record(
        self,
        record_id: str,
        reviewer_id: str,
        decision: str,
        new_hash: Optional[str] = None
    ) -> str:
        """Update record status after review"""
        if record_id not in self.records:
            raise ValueError(f"Record {record_id} not found on ledger")
        
        record = self.records[record_id]
        now = datetime.now(timezone.utc).isoformat()
        
        # Update record
        record.current_status = decision
        record.last_updated_by = reviewer_id
        record.last_updated_at = now
        record.version += 1
        
        if new_hash:
            record.previous_hash = record.data_hash
            record.data_hash = new_hash
        
        tx_id = self._generate_tx_id()
        
        # Log the action
        self.access_logs.append(AccessLogEntry(
            log_id=f"LOG_{record_id}_{len(self.access_logs)}",
            record_id=record_id,
            accessor_id=reviewer_id,
            accessor_msp=FABRIC_MSP_ID,
            action_type="REVIEW",
            details=f"Decision: {decision}",
            timestamp=now,
            tx_id=tx_id
        ))
        
        logger.info(f"[MockLedger] Reviewed record {record_id}, decision={decision}, tx={tx_id}")
        return tx_id
    
    async def verify_integrity(
        self,
        record_id: str,
        provided_hash: str,
        accessor_id: str
    ) -> IntegrityResult:
        """Verify record integrity by comparing hashes"""
        if record_id not in self.records:
            return IntegrityResult(
                record_id=record_id,
                verified=False,
                error="Record not found on ledger"
            )
        
        record = self.records[record_id]
        is_valid = record.data_hash == provided_hash
        
        now = datetime.now(timezone.utc).isoformat()
        
        # Log the verification
        self.access_logs.append(AccessLogEntry(
            log_id=f"LOG_{record_id}_{len(self.access_logs)}",
            record_id=record_id,
            accessor_id=accessor_id,
            accessor_msp=FABRIC_MSP_ID,
            action_type="VERIFY",
            details=f"Integrity check: {'PASSED' if is_valid else 'FAILED'}",
            timestamp=now,
            tx_id=self._generate_tx_id()
        ))
        
        return IntegrityResult(
            record_id=record_id,
            verified=is_valid,
            on_chain_hash=record.data_hash,
            provided_hash=provided_hash,
            current_status=record.current_status,
            last_updated_at=record.last_updated_at
        )
    
    async def log_access(
        self,
        record_id: str,
        accessor_id: str,
        reason: str
    ) -> str:
        """Log access to a record"""
        now = datetime.now(timezone.utc).isoformat()
        tx_id = self._generate_tx_id()
        
        self.access_logs.append(AccessLogEntry(
            log_id=f"LOG_{record_id}_{len(self.access_logs)}",
            record_id=record_id,
            accessor_id=accessor_id,
            accessor_msp=FABRIC_MSP_ID,
            action_type="ACCESS",
            details=reason,
            timestamp=now,
            tx_id=tx_id
        ))
        
        logger.info(f"[MockLedger] Logged access for {record_id}, reason={reason}")
        return tx_id
    
    async def get_record(self, record_id: str) -> Optional[LedgerRecord]:
        """Get a record from the ledger"""
        return self.records.get(record_id)
    
    async def get_access_logs(self, record_id: str) -> List[AccessLogEntry]:
        """Get all access logs for a record"""
        return [log for log in self.access_logs if log.record_id == record_id]
    
    async def query_by_status(self, status: str) -> List[LedgerRecord]:
        """Query records by status"""
        return [r for r in self.records.values() if r.current_status == status]
    
    async def query_by_flag_status(self, flag_status: str) -> List[LedgerRecord]:
        """Query records by flag status"""
        return [r for r in self.records.values() if r.flag_status == flag_status]


# ========================================
# Blockchain Service (Main Interface)
# ========================================

class BlockchainService:
    """
    Main service class for blockchain operations.
    
    Uses MockLedger for development or real Fabric SDK when enabled.
    """
    
    def __init__(self):
        self.ledger = MockLedger()
        self._initialized = False
        
        if FABRIC_ENABLED:
            logger.info("Fabric mode enabled - will connect to real network")
        else:
            logger.info("Using mock ledger (set FABRIC_ENABLED=true for real network)")
    
    async def initialize(self):
        """Initialize the blockchain service"""
        if self._initialized:
            return
        
        if FABRIC_ENABLED:
            # TODO: Initialize real Fabric gateway
            # self.gateway = Gateway()
            # await self.gateway.connect(...)
            pass
        
        self._initialized = True
        logger.info("BlockchainService initialized")
    
    async def anchor_record(
        self,
        record: Dict[str, Any],
        user_id: str
    ) -> Dict[str, Any]:
        """
        Anchor a new census record on the blockchain.
        
        Computes hash and stores on ledger.
        
        Args:
            record: Census record dictionary
            user_id: ID of user creating the record
            
        Returns:
            Dict with tx_id, record_id, data_hash
        """
        await self.initialize()
        
        record_id = record.get('record_id', '')
        household_id = record.get('household_id', '')
        flag_status = record.get('flag_status', 'NORMAL').upper()
        
        # Normalize flag status
        if flag_status not in [e.value for e in FlagStatus]:
            flag_status = FlagStatus.NORMAL.value
        
        # Compute hash
        data_hash = compute_record_hash(record)
        
        # Store on ledger
        tx_id = await self.ledger.initialize_record(
            record_id=record_id,
            data_hash=data_hash,
            household_id=household_id,
            flag_status=flag_status,
            user_id=user_id
        )
        
        return {
            "tx_id": tx_id,
            "record_id": record_id,
            "data_hash": data_hash,
            "status": RecordStatus.PENDING_REVIEW.value,
            "ledger_anchored": True
        }
    
    async def review_record(
        self,
        record_id: str,
        reviewer_id: str,
        decision: str,
        updated_record: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Submit a review decision for a record.
        
        Args:
            record_id: ID of record to review
            reviewer_id: ID of reviewer
            decision: Review decision (APPROVED, REJECTED, etc.)
            updated_record: If data was corrected, the updated record
            
        Returns:
            Dict with tx_id and updated status
        """
        await self.initialize()
        
        # Normalize decision
        decision = decision.upper()
        valid_decisions = [e.value for e in RecordStatus if e != RecordStatus.PENDING_REVIEW]
        if decision not in valid_decisions:
            raise ValueError(f"Invalid decision: {decision}")
        
        # Compute new hash if record was updated
        new_hash = None
        if updated_record:
            new_hash = compute_record_hash(updated_record)
        
        tx_id = await self.ledger.review_record(
            record_id=record_id,
            reviewer_id=reviewer_id,
            decision=decision,
            new_hash=new_hash
        )
        
        return {
            "tx_id": tx_id,
            "record_id": record_id,
            "new_status": decision,
            "new_hash": new_hash
        }
    
    async def verify_integrity(
        self,
        record_id: str,
        record: Dict[str, Any],
        accessor_id: str
    ) -> Dict[str, Any]:
        """
        Verify that a record's data hasn't been tampered with.
        
        Compares computed hash against on-chain hash.
        
        Args:
            record_id: ID of record to verify
            record: Current record data from MongoDB
            accessor_id: ID of user performing verification
            
        Returns:
            Dict with verification result
        """
        await self.initialize()
        
        # Compute hash of current data
        current_hash = compute_record_hash(record)
        
        # Verify against ledger
        result = await self.ledger.verify_integrity(
            record_id=record_id,
            provided_hash=current_hash,
            accessor_id=accessor_id
        )
        
        return asdict(result)
    
    async def log_access(
        self,
        record_id: str,
        accessor_id: str,
        reason: str
    ) -> Dict[str, Any]:
        """
        Log access to a record for audit purposes.
        
        Args:
            record_id: ID of accessed record
            accessor_id: ID of user accessing
            reason: Reason for access
            
        Returns:
            Dict with tx_id
        """
        await self.initialize()
        
        tx_id = await self.ledger.log_access(
            record_id=record_id,
            accessor_id=accessor_id,
            reason=reason
        )
        
        return {
            "tx_id": tx_id,
            "record_id": record_id,
            "logged": True
        }
    
    async def get_ledger_record(self, record_id: str) -> Optional[Dict[str, Any]]:
        """Get a record from the blockchain ledger"""
        await self.initialize()
        
        record = await self.ledger.get_record(record_id)
        if record:
            return asdict(record)
        return None
    
    async def get_access_logs(self, record_id: str) -> List[Dict[str, Any]]:
        """Get all access logs for a record"""
        await self.initialize()
        
        logs = await self.ledger.get_access_logs(record_id)
        return [asdict(log) for log in logs]
    
    async def get_ledger_status(self) -> Dict[str, Any]:
        """Get status of the blockchain service"""
        return {
            "fabric_enabled": FABRIC_ENABLED,
            "channel": FABRIC_CHANNEL,
            "chaincode": FABRIC_CHAINCODE,
            "msp_id": FABRIC_MSP_ID,
            "mode": "fabric" if FABRIC_ENABLED else "mock",
            "records_count": len(self.ledger.records),
            "logs_count": len(self.ledger.access_logs)
        }


# ========================================
# Global Service Instance
# ========================================

blockchain_service = BlockchainService()
