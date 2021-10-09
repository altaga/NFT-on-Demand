[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [<img src="https://img.shields.io/badge/View-Website-blue">](https://main.d3cj520d113l13.amplifyapp.com/) [<img src="https://img.shields.io/badge/View-Slides-red">]() [<img src="https://img.shields.io/badge/View-Video-red">](https://www.youtube.com/watch?v=NpEaa2P7qZI)

Socials:

https://www.instagram.com/nft_ondemand/


# NFT on Demand

<img src="https://i.ibb.co/4mvnbNH/on5.png" width="400">
 
Welcome to NFT on Demand.

### NFT on Demand is a marketplace that connects users with real NFT artists, where you can order the content you want to have.

This is our submission for the ETHOnline 2021 hackathon.

#### Click here to watch our demo video:

[<img src="https://raw.githubusercontent.com/altaga/SCUP-WWAC/master/Images/click-here-button.png" width=200>](https://www.youtube.com/watch?v=NpEaa2P7qZI)

## To test the product follow this link (Over here Tech judges!):
<a href="https://www.nftondemand.online/" target="_blank" style="font-size:30px;">
https://www.nftondemand.online/
</a>
<hr>

# Tech:

## General Diagram:

Este es el diagrama general de toda la aplicacion, diferenciando los dos tipos de servicios donde la aplicacion obtiene sus datos.

## Centralizados (Cloud Services):

- Hosting y SSL en AWS.
- API Gateway para comunicacion con NodeJS.

## Decentralizados (Web3.js y comunicacion con Smart Contracts):

Alchemy:
- Obtencion de precios de los NFT en tiempo real.
Metamask:
- Despliegue del contrato en la Red de ETH (Ropsten).
- Mint de los NFT.
- Venta de los NFT mediante Interaccion con Smart Contract.
NFT.Storage:
- Almacenamiento IPFS del NFT y metadata.json

<img src="./Images/diagram.png">

## Minting Process:

Como parte importante de la plataforma este es el algoritmo para realizar el Upload de un NFT en nuestra plataforma, prowered by NFT.storage

<img src="./Images/diagram2.png">

## Contract:

El contrato que se despliega cada vez que se quiere subir un NFT a nuestra plataforma es el siguiente.

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
            _; // Close Modifier
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