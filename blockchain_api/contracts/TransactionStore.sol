// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TransactionStore {
    struct Transaction {
        string cardHash; // Storing a hash of the card number, not the actual number
        string locationData;
        string ipAddress;
        string merchant;
        uint256 amount;
        string transactionType;
        uint256 timeOfDay;
        uint256 timestamp;
    }

    mapping(bytes32 => Transaction) private transactions;
    bytes32[] private transactionIds;

    event TransactionRecorded(bytes32 indexed transactionId, string merchant, uint256 amount, uint256 timestamp);

    // Function to store a transaction
    function recordTransaction(
        string memory cardHash,
        string memory locationData,
        string memory ipAddress,
        string memory merchant,
        uint256 amount,
        string memory transactionType,
        uint256 timeOfDay
    ) public returns (bytes32) {
        // Generate a unique transaction ID using keccak256
        bytes32 transactionId = keccak256(
            abi.encodePacked(
                cardHash,
                locationData,
                ipAddress,
                merchant,
                amount,
                transactionType,
                timeOfDay,
                block.timestamp
            )
        );

        // Store the transaction data
        transactions[transactionId] = Transaction({
            cardHash: cardHash,
            locationData: locationData,
            ipAddress: ipAddress,
            merchant: merchant,
            amount: amount,
            transactionType: transactionType,
            timeOfDay: timeOfDay,
            timestamp: block.timestamp
        });

        transactionIds.push(transactionId);

        emit TransactionRecorded(transactionId, merchant, amount, block.timestamp);

        return transactionId;
    }

    // Function to get a transaction by ID
    function getTransaction(bytes32 transactionId)
        public
        view
        returns (
            string memory cardHash,
            string memory locationData,
            string memory ipAddress,
            string memory merchant,
            uint256 amount,
            string memory transactionType,
            uint256 timeOfDay,
            uint256 timestamp
        )
    {
        Transaction memory txn = transactions[transactionId];
        return (
            txn.cardHash,
            txn.locationData,
            txn.ipAddress,
            txn.merchant,
            txn.amount,
            txn.transactionType,
            txn.timeOfDay,
            txn.timestamp
        );
    }

    // Function to get the number of transactions
    function getTransactionCount() public view returns (uint256) {
        return transactionIds.length;
    }

    // Function to get transaction ID by index
    function getTransactionIdAtIndex(uint256 index) public view returns (bytes32) {
        require(index < transactionIds.length, "Index out of bounds");
        return transactionIds[index];
    }
}