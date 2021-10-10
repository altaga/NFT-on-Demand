// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol';
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract MyToken is ERC721URIStorage {
    
    address public owner;
    address public actualAddress;
    uint256 public price;
    uint256 public actualBid;
    string public tokenURI;
    bool public flag = false;
    address constant public nftOnDemand = 0x2C1DfE385413b61FD4bd9183edE8C0b2168f0170;
    
    modifier onlyOwner{
        require(msg.sender == owner);
        _; // Cerrar modificador, si se cumple lo de arriba, continua
    }
    
    constructor() ERC721('NFT', 'MyNFT') {
        owner = msg.sender;
    }
    
    function mintNFT(string memory _tokenURI, uint256 _price) public onlyOwner returns (uint256)
    {
        tokenURI = _tokenURI;
        _mint(owner, 1);
        _setTokenURI(1, tokenURI);
        price = _price;
        flag = true;
        return 1;
    }
    
    function bidUp() public payable {
        require(msg.value > actualBid);
        require(msg.value > price);
        require(flag == true);
        if(actualBid>0){
          payable(actualAddress).transfer(actualBid);  
        }
        actualAddress = msg.sender;
        actualBid = msg.value;
        price = msg.value;
    }
    
    function changePrice(uint256 _price) public onlyOwner {
        require(0 == actualBid);
        price = _price;
    }
    
    function activate() public onlyOwner{
        flag = true;
    }
    
    function finish() public onlyOwner payable {
        _transfer(owner, actualAddress, 1);
        actualBid = 0;
        flag = false;
        payable(nftOnDemand).transfer(address(this).balance/50);
        payable(owner).transfer(address(this).balance); // send the ETH to the seller
        owner = actualAddress;
    }
}