# BOS + NFTMinter

This repository is an example of how to implement a smart contract for NFTs minting in BOS.

<img src="https://drive.google.com/uc?id=1lkssV5p8D8N9Dunh9-Od1U1jTbKcDp4v" width="50%">

## About the NFT contract

This contract imports an external contract from OpenZeppelin, a popular library for developing smart contracts in Ethereum. The imported contract is ERC721.sol, which defines a standard interface for non-fungible tokens (NFTs).

This contract has three methods:

**mintNFT**: Function to create and assign a new NFT to a recipient. 

```js
function mintNFT(string memory _name, string memory _description, string memory _image, address _to) external {
        uint256 tokenId = nfts.length;
        nfts.push(NFT(_name, _description, _image));

        emit NFTCreated(tokenId, _name, _description, _image, _to);

        _safeMint(_to, tokenId);
    }
```

**totalNFTs**: Returns the total number of NFTs created. 

```js
function totalNFTs() external view returns (uint256) {
        return nfts.length;
    }
```

**getNFT**: Gets the information of a specific NFT. 

```js
function getNFT(uint256 _tokenId) external view returns (string memory name, string memory description, string memory image) {
        require(_tokenId < nfts.length, "NFT no existe");
        NFT memory nft = nfts[_tokenId];
        return (nft.name, nft.description, nft.image);
    }
```

## How to implement the NFT contract in BOS?

To implement the NFT contract and be able to create new tokens from our BOS component we will have to make some configurations and calls to the contract methods.

The first thing we must do is to initialize our contract and call the corresponding ABI to obtain the information of the methods of the contract, for them we make use of the following lines:

```jsx
const nftContract = "0x80fe30fc135dD9538fAE625a8761cCe5A51De69a";

const nftMinterAbi = fetch(
  "https://raw.githubusercontent.com/open-web-academy/BOS-NFTMinter/main/NFTMinterABI.txt"
);
```

Once this is done, we will proceed to initialize each of the state variables as well as each of the methods to change their values.

```jsx
const [sender, setSender] = useState(null);
const [tokens, setTokens] = useState([]);
const [title, setTitle] = useState("Example title");
const [description, setDescription] = useState("Example description");
const [receiver, setReceiver] = useState("0x34149390029Bbf4f4D9E7AdEa715D7055e145C05");
const [minting, setMinting] = useState(false);
const [tabSelected, setTabSelected] = useState("mint");
```

As mentioned before, the NFT contract has three main methods, to call them from BOS we will have to do the following: 

**getTokens**: With this method we first get the number of NFTs minted in the contract and then retrieve the information for each of them:

```jsx
const getTokens = () => {
  const contract = new ethers.Contract(
    nftContract,
    nftMinterAbi.body,
    Ethers.provider().getSigner()
  );
  let nfts = [];
  contract.totalNFTs().then((res) => {
    for (let i = 0; i < parseInt(res); i++) {
      contract.getNFT(i).then((nft) => {
        nfts.push(nft);
        setTokens(nfts);
      });
    }
  });
};
```

**createToken**: With this method we create a new NFT, the parameters to be sent are the following:
  * **tokenName**: Name of the NFT.
  * **tokenSymbol**: Description of the NFT.
  * **image**: Image of the NFT.
  * **receiver**: Receiver of the NFT.

```jsx
const createToken = () => {
  const contract = new ethers.Contract(
    nftContract,
    nftMinterAbi.body,
    Ethers.provider().getSigner()
  );

  contract
    .mintNFT(title, description, state.image.cid, receiver)
    .then((res) => {
      setMinting(true);

      setTimeout(() => {
        setTitle("Example title");
        setDescription("Example description");
        setReceiver("0x34149390029Bbf4f4D9E7AdEa715D7055e145C05");
        setMinting(false);
        getTokens();
      }, "20000");
    });
};
```

## How to test the Component?

To run this project in BOS you must run the widget (NFTMinter.jsx) on an available BOS gateway, for example: [near.social ](https://near.social/edit)

Once the code for the widget has been added we can render it by clicking on the preview button to render the component.

<img src="https://drive.google.com/uc?id=12xF-C5U7z55G8klki3JdFOfXYvFD4Tnn" width="50%">

For this example you will also need to have installed and configured [metamask](https://metamask.io/) and [Sepolia](https://sepolia.dev/) network.

Once this is done, you can click **Connect Wallet** to run metamask and connect the component to your account.

<img src="https://drive.google.com/uc?id=1NftfP965x8n2Ljifw3ithWvOAW4OUcUR" width="50%">

Once metamask is connected we will be able to start interacting with the UI.

The first step to create a new NFT is to fill in the form with the four fields: name, description, receiver and NFT image.

Then we must click on the "Mint" button which will launch a transaction in metamask and we must confirm it to start with the creation of our NFT.

Finally we can go to the "NFT List" tab where we can see all the NFT created with their respective information.

<img src="https://drive.google.com/uc?id=1NlA90FIlizQUcllrOjvxlh6VVyeLOBcV" width="50%">

## BOS Widget

NFT Minter: https://near.social/owa-is-bos.near/widget/BOS-CreateNFT
