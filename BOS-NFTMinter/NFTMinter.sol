// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721 {
    struct NFT {
        string name;
        string description;
        string image;
    }

    NFT[] public nfts;

    event NFTCreated(uint256 tokenId, string name, string description, string image, address owner);

    constructor() ERC721("MyNFT", "MNFT") {}

    function mintNFT(string memory _name, string memory _description, string memory _image, address _to) external {
        uint256 tokenId = nfts.length;
        nfts.push(NFT(_name, _description, _image));

        emit NFTCreated(tokenId, _name, _description, _image, _to);

        _safeMint(_to, tokenId);
    }

    function totalNFTs() external view returns (uint256) {
        return nfts.length;
    }

    function getNFT(uint256 _tokenId) external view returns (string memory name, string memory description, string memory image) {
        require(_tokenId < nfts.length, "NFT no existe");
        NFT memory nft = nfts[_tokenId];
        return (nft.name, nft.description, nft.image);
    }
}
