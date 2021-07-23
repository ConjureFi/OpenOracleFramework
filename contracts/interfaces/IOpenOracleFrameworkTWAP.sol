// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma abicoder v2;

/**
 * @dev Interface of the IOOFTWAP contract
 */
interface IOOFTWAP {
    /**
    * @dev gets TWAP prices from Open Oracle Framework
    *
    * @param OOFContract the open oracle framework contract
    * @param feedIDs the array of feed ids
    * @param timestampstart the array of start times
    * @param timestampfinish the array of end dates
    * @param strictMode indicates if first and last return values should be 0
    */
    function getTWAP(address OOFContract, uint256[] memory feedIDs, uint256[] memory timestampstart, uint256[] memory timestampfinish, bool strictMode) external view returns (uint256[] memory TWAP);

    /**
    * @dev gets TWAP prices from Open Oracle Framework for the last given period
    *
    * @param OOFContract the open oracle framework contract
    * @param feedIDs the array of feed ids
    * @param timeWindows the time windows to use for the TWAP
    */
    function lastTWAP(address OOFContract, uint256[] memory feedIDs, uint256[] memory timeWindows) external view returns (uint256[] memory TWAP);
}
