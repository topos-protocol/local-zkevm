// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Mcdo {
    address payable public owner;

    struct Info {
        string source;
        uint8 quantity;
        // ...
    }

    mapping(string => Info) compositions;

    constructor() payable {
        owner = payable(msg.sender);
    }

    function setIngredient(
        string calldata name,
        string calldata source,
        uint8 quantity
    ) public {
        require(msg.sender == owner, "You aren't the owner");
        if (keccak256(bytes(name)) == keccak256("sugar")) {
            require(quantity < uint8(100), "waaay too much sugar");
        }

        compositions[name] = Info(source, quantity);
    }
}
