// SPDX-License-Identifier: MIT
pragma solidity >=0.8.16;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(string memory _name, string memory _ticker, uint256 _supply) ERC20(_name, _ticker) {
        _mint(msg.sender, _supply);
    }
}

contract Factory {
    struct TokenData {
        address tokenAddress;
        string name;
        string ticker;
        uint256 supply;
    }

    address[] public tokens;
    mapping(address => TokenData) public tokenInfo;
    uint256 public tokenCount;
    event TokenDeployed(address tokenAddress);

    function deployToken(string calldata _name, string calldata _ticker, uint256 _supply) public returns (address) {
        Token token = new Token(_name, _ticker, _supply);
        token.transfer(msg.sender, _supply);
        tokens.push(address(token));
        tokenCount += 1;
        tokenInfo[address(token)] = TokenData(address(token), _name, _ticker, _supply);
        emit TokenDeployed(address(token));
        return address(token);
    }

    function getAllTokens() public view returns (TokenData[] memory) {
        TokenData[] memory allTokens = new TokenData[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            allTokens[i] = tokenInfo[tokens[i]];
        }
        return allTokens;
    }
}
