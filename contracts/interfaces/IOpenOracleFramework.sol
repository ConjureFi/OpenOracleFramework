// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma abicoder v2;

/**
 * @dev Interface of the OpenOracleFramework contract
 */
interface IOpenOracleFramework {
    /**
    * @dev initialize function lets the factory init the cloned contract and set it up
    *
    * @param signers_ array of signer addresses
    * @param signerThreshold_ the threshold which has to be met for consensus
    * @param payoutAddress_ the address where all fees will be sent to. 0 address for an even split across signers
    * @param subscriptionPassPrice_ the price for an oracle subscription pass
    * @param factoryContract_ the address of the factory contract
    */
    function initialize(
        address[] memory signers_,
        uint256 signerThreshold_,
        address payable payoutAddress_,
        uint256 subscriptionPassPrice_,
        address factoryContract_
    ) external;

    /**
    * @dev getHistoricalFeeds function lets the caller receive historical values for a given timestamp
    *
    * @param feedIDs the array of feedIds
    * @param timestamps the array of timestamps
    */
    function getHistoricalFeeds(uint256[] memory feedIDs, uint256[] memory timestamps) external view returns (uint256[] memory);

    /**
    * @dev getFeeds function lets anyone call the oracle to receive data (maybe pay an optional fee)
    *
    * @param feedIDs the array of feedIds
    */
    function getFeeds(uint256[] memory feedIDs) external view returns (uint256[] memory, uint256[] memory, uint256[] memory);

    /**
    * @dev getFeed function lets anyone call the oracle to receive data (maybe pay an optional fee)
    *
    * @param feedID the array of feedId
    */
    function getFeed(uint256 feedID) external view returns (uint256, uint256, uint256);

    /**
    * @dev getFeedList function returns the metadata of a feed
    *
    * @param feedIDs the array of feedId
    */
    function getFeedList(uint256[] memory feedIDs) external view returns(string[] memory, uint256[] memory, uint256[] memory, uint256[] memory, uint256[] memory);

    /**
    * @dev withdrawFunds function sends the collected fees to the given address
    */
    function withdrawFunds() external;

    function createNewFeeds(string[] memory names, string[] memory descriptions, uint256[] memory decimals, uint256[] memory timeslots, uint256[] memory feedCosts, uint256[] memory revenueModes) external;

    function submitFeed(uint256[] memory feedIDs, uint256[] memory values) external;

    function signProposal(uint256 proposalId) external;

    function createProposal(uint256 uintValue, address addressValue, uint256 proposalType, uint256 feedId) external;

    function subscribeToFeed(uint256[] memory feedIDs, uint256[] memory durations, address buyer) payable external;

    function buyPass(address buyer, uint256 duration) payable external;

    function supportFeeds(uint256[] memory feedIds, uint256[] memory values) payable external;
}
