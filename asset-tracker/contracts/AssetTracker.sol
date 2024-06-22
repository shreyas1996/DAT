// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AssetTracker {
    struct Asset {
        string name;
        string metadata;
        address owner;
    }

    mapping(uint256 => Asset) public assets;
    uint256 public assetCount;
    address public admin;

    event AssetCreated(
        uint256 indexed id,
        string name,
        string metadata,
        address owner
    );

    event AssetTransferred(
        uint256 id,
        address from,
        address to
    );

    constructor() {
        admin = msg.sender; // Set the pre-funded account as admin during deployment
    }

    function createAsset(string memory name, string memory metadata, address owner) public {
        require(msg.sender == admin, "Only admin can create assets");
        assetCount++;
        assets[assetCount] = Asset(name, metadata, owner);
        emit AssetCreated(assetCount, name, metadata, owner);
    }

    function transferAsset(uint256 id, address newOwner) public {
        require(
            msg.sender == assets[id].owner || msg.sender == admin,
            "Only the owner or admin can transfer this asset"
        );
        address previousOwner = assets[id].owner;
        assets[id].owner = newOwner;
        emit AssetTransferred(id, previousOwner, newOwner);
    }

    function getAsset(uint256 id) public view returns (string memory, string memory, address) {
        Asset memory asset = assets[id];
        return (asset.name, asset.metadata, asset.owner);
    }

    function getAssetsByOwner(address owner) public view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](assetCount);
        uint256 counter = 0;
        for (uint256 i = 1; i <= assetCount; i++) {
            if (assets[i].owner == owner) {
                result[counter] = i;
                counter++;
            }
        }
        // Resize the array to the actual number of assets owned
        uint256[] memory trimmedResult = new uint256[](counter);
        for (uint256 j = 0; j < counter; j++) {
            trimmedResult[j] = result[j];
        }
        return trimmedResult;
    }
}
