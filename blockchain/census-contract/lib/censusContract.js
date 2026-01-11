'use strict';

const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

/**
 * CensusContract - Smart contract for census record lifecycle management
 * 
 * This contract stores ONLY hashes of census data, NOT PII.
 * The actual data remains in MongoDB off-chain.
 * 
 * Organizations:
 * - StateMSP: Network governance, policy simulation access
 * - DistrictMSP: Submit/verify census records, endorse updates  
 * - AuditMSP: Read-only access for auditors
 */
class CensusContract extends Contract {

    /**
     * Initialize the ledger (optional - called on chaincode instantiation)
     */
    async InitLedger(ctx) {
        console.info('CensusContract initialized');
        return JSON.stringify({ status: 'initialized', timestamp: new Date().toISOString() });
    }

    /**
     * InitializeRecord - Anchor a new census record on-chain
     * Called when a new survey is uploaded to MongoDB.
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} recordID - Unique record identifier (e.g., "REC123456")
     * @param {string} dataHash - SHA256 hash of the MongoDB record JSON
     * @param {string} metadata - JSON string with additional info (household_id, etc.)
     * @returns {string} Transaction ID
     */
    async InitializeRecord(ctx, recordID, dataHash, metadata) {
        // Check if record already exists
        const existing = await ctx.stub.getState(recordID);
        if (existing && existing.length > 0) {
            throw new Error(`Record ${recordID} already exists on the ledger`);
        }

        // Parse metadata
        let parsedMetadata = {};
        try {
            parsedMetadata = JSON.parse(metadata);
        } catch (e) {
            parsedMetadata = { raw: metadata };
        }

        // Get caller identity
        const cid = new ClientIdentity(ctx.stub);
        const mspId = cid.getMSPID();
        const callerId = cid.getID();

        // Create the census record asset
        const censusRecord = {
            docType: 'census_record',
            record_id: recordID,
            data_hash: dataHash,
            owner_household_id: parsedMetadata.household_id || '',
            current_status: 'PENDING_REVIEW',
            flag_status: parsedMetadata.flag_status || 'NORMAL',
            created_by: callerId,
            created_by_msp: mspId,
            created_at: new Date().toISOString(),
            last_updated_by: callerId,
            last_updated_by_msp: mspId,
            last_updated_at: new Date().toISOString(),
            version: 1
        };

        // Store on ledger
        await ctx.stub.putState(recordID, Buffer.from(JSON.stringify(censusRecord)));

        // Log the initialization
        await this._logAccess(ctx, recordID, callerId, 'INITIALIZE', 'Record initialized on ledger');

        return ctx.stub.getTxID();
    }

    /**
     * ReviewRecord - Update record status after supervisor review
     * Called when a Supervisor approves/rejects a record.
     * 
     * Endorsement Policy should require the owning DistrictMSP.
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} recordID - Record identifier
     * @param {string} reviewerID - Reviewer's user ID
     * @param {string} decision - "APPROVED", "REJECTED", or "NEEDS_VERIFICATION"
     * @param {string} newHash - New data hash if record was corrected (can be empty)
     * @returns {string} Transaction ID
     */
    async ReviewRecord(ctx, recordID, reviewerID, decision, newHash) {
        // Validate decision
        const validDecisions = ['APPROVED', 'REJECTED', 'NEEDS_VERIFICATION', 'PRIORITY'];
        if (!validDecisions.includes(decision)) {
            throw new Error(`Invalid decision: ${decision}. Must be one of: ${validDecisions.join(', ')}`);
        }

        // Get existing record
        const recordBytes = await ctx.stub.getState(recordID);
        if (!recordBytes || recordBytes.length === 0) {
            throw new Error(`Record ${recordID} does not exist`);
        }

        const record = JSON.parse(recordBytes.toString());

        // Get caller identity
        const cid = new ClientIdentity(ctx.stub);
        const mspId = cid.getMSPID();
        const callerId = cid.getID();

        // Update record
        record.current_status = decision;
        record.last_updated_by = reviewerID || callerId;
        record.last_updated_by_msp = mspId;
        record.last_updated_at = new Date().toISOString();
        record.version += 1;

        // Update hash if data was corrected
        if (newHash && newHash.length > 0) {
            record.previous_hash = record.data_hash;
            record.data_hash = newHash;
        }

        // Store updated record
        await ctx.stub.putState(recordID, Buffer.from(JSON.stringify(record)));

        // Log the review action
        await this._logAccess(ctx, recordID, reviewerID || callerId, 'REVIEW', `Decision: ${decision}`);

        return ctx.stub.getTxID();
    }

    /**
     * VerifyIntegrity - Check if off-chain data matches on-chain hash
     * Used before policy simulations to ensure data hasn't been tampered.
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} recordID - Record identifier
     * @param {string} providedHash - Hash calculated from current MongoDB data
     * @returns {string} JSON with verification result
     */
    async VerifyIntegrity(ctx, recordID, providedHash) {
        // Get record from ledger
        const recordBytes = await ctx.stub.getState(recordID);
        if (!recordBytes || recordBytes.length === 0) {
            return JSON.stringify({
                record_id: recordID,
                verified: false,
                error: 'Record not found on ledger',
                timestamp: new Date().toISOString()
            });
        }

        const record = JSON.parse(recordBytes.toString());
        const onChainHash = record.data_hash;

        // Compare hashes
        const isValid = onChainHash === providedHash;

        // Log the verification attempt
        const cid = new ClientIdentity(ctx.stub);
        await this._logAccess(ctx, recordID, cid.getID(), 'VERIFY', 
            `Integrity check: ${isValid ? 'PASSED' : 'FAILED'}`);

        return JSON.stringify({
            record_id: recordID,
            verified: isValid,
            on_chain_hash: onChainHash,
            provided_hash: providedHash,
            current_status: record.current_status,
            last_updated_at: record.last_updated_at,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * LogAccess - Create immutable access log entry
     * Used for privacy compliance and audit trails.
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} recordID - Record that was accessed
     * @param {string} accessorID - Who accessed the record
     * @param {string} reason - Purpose of access (e.g., "POLICY_SIMULATION", "AUDIT")
     * @returns {string} Transaction ID
     */
    async LogAccess(ctx, recordID, accessorID, reason) {
        return await this._logAccess(ctx, recordID, accessorID, 'ACCESS', reason);
    }

    /**
     * Internal helper for logging access
     */
    async _logAccess(ctx, recordID, accessorID, actionType, details) {
        const cid = new ClientIdentity(ctx.stub);
        const mspId = cid.getMSPID();
        
        const logEntry = {
            docType: 'access_log',
            log_id: `LOG_${recordID}_${Date.now()}`,
            record_id: recordID,
            accessor_id: accessorID,
            accessor_msp: mspId,
            action_type: actionType,
            details: details,
            timestamp: new Date().toISOString(),
            tx_id: ctx.stub.getTxID()
        };

        // Store log with composite key for efficient querying
        const logKey = ctx.stub.createCompositeKey('access_log', [recordID, logEntry.log_id]);
        await ctx.stub.putState(logKey, Buffer.from(JSON.stringify(logEntry)));

        return ctx.stub.getTxID();
    }

    /**
     * GetRecord - Read a census record by ID
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} recordID - Record identifier
     * @returns {string} JSON representation of the record
     */
    async GetRecord(ctx, recordID) {
        const recordBytes = await ctx.stub.getState(recordID);
        if (!recordBytes || recordBytes.length === 0) {
            throw new Error(`Record ${recordID} does not exist`);
        }

        // Log the read access
        const cid = new ClientIdentity(ctx.stub);
        await this._logAccess(ctx, recordID, cid.getID(), 'READ', 'Record retrieved');

        return recordBytes.toString();
    }

    /**
     * GetRecordHistory - Get full transaction history for a record
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} recordID - Record identifier
     * @returns {string} JSON array of historical states
     */
    async GetRecordHistory(ctx, recordID) {
        const iterator = await ctx.stub.getHistoryForKey(recordID);
        const history = [];

        let result = await iterator.next();
        while (!result.done) {
            const historyItem = {
                txId: result.value.txId,
                timestamp: result.value.timestamp,
                isDelete: result.value.isDelete
            };

            if (!result.value.isDelete) {
                try {
                    historyItem.value = JSON.parse(result.value.value.toString('utf8'));
                } catch (e) {
                    historyItem.value = result.value.value.toString('utf8');
                }
            }

            history.push(historyItem);
            result = await iterator.next();
        }

        await iterator.close();
        return JSON.stringify(history);
    }

    /**
     * GetAccessLogs - Get all access logs for a record
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} recordID - Record identifier
     * @returns {string} JSON array of access log entries
     */
    async GetAccessLogs(ctx, recordID) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey('access_log', [recordID]);
        const logs = [];

        let result = await iterator.next();
        while (!result.done) {
            try {
                logs.push(JSON.parse(result.value.value.toString('utf8')));
            } catch (e) {
                logs.push({ raw: result.value.value.toString('utf8') });
            }
            result = await iterator.next();
        }

        await iterator.close();
        return JSON.stringify(logs);
    }

    /**
     * QueryByStatus - Find all records with a specific status
     * Requires CouchDB as state database.
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} status - Status to filter by (e.g., "PENDING_REVIEW", "APPROVED")
     * @returns {string} JSON array of matching records
     */
    async QueryByStatus(ctx, status) {
        const queryString = JSON.stringify({
            selector: {
                docType: 'census_record',
                current_status: status
            },
            use_index: ['_design/statusIndex', 'status']
        });

        return await this._queryWithString(ctx, queryString);
    }

    /**
     * QueryByFlagStatus - Find all records with a specific flag status
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} flagStatus - Flag status (e.g., "PRIORITY", "NORMAL", "REVIEW")
     * @returns {string} JSON array of matching records
     */
    async QueryByFlagStatus(ctx, flagStatus) {
        const queryString = JSON.stringify({
            selector: {
                docType: 'census_record',
                flag_status: flagStatus
            }
        });

        return await this._queryWithString(ctx, queryString);
    }

    /**
     * Internal helper for CouchDB queries
     */
    async _queryWithString(ctx, queryString) {
        const iterator = await ctx.stub.getQueryResult(queryString);
        const results = [];

        let result = await iterator.next();
        while (!result.done) {
            try {
                results.push({
                    Key: result.value.key,
                    Record: JSON.parse(result.value.value.toString('utf8'))
                });
            } catch (e) {
                results.push({
                    Key: result.value.key,
                    Record: result.value.value.toString('utf8')
                });
            }
            result = await iterator.next();
        }

        await iterator.close();
        return JSON.stringify(results);
    }

    /**
     * RecordExists - Check if a record exists on the ledger
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} recordID - Record identifier
     * @returns {boolean} True if exists
     */
    async RecordExists(ctx, recordID) {
        const recordBytes = await ctx.stub.getState(recordID);
        return recordBytes && recordBytes.length > 0;
    }
}

module.exports = CensusContract;
