# BOS + TokenFactory

This repository is an example of how to implement a token factory contract in BOS, in this case using the Sepolia testnet.

<img src="https://drive.google.com/uc?id=1Oh3s3WVgur8kPYBbLc8e3Pa4XaIcFOg3" width="50%">

## About the token factory contract

This contract imports an external contract from OpenZeppelin, a popular library for developing smart contracts in Ethereum. The imported contract is ERC20.sol, which is a standard implementation of the ERC-20 standard for tokens in Ethereum.

This contract has two methods:

**deployToken**: is used to deploy a new token. It takes the token name, symbol and initial supply as parameters and returns the address of the newly created token. 

```js
    function deployToken(string calldata _name, string calldata _ticker, uint256 _supply) public returns (address) {
        Token token = new Token(_name, _ticker, _supply);
        token.transfer(msg.sender, _supply);
        tokens.push(address(token));
        tokenCount += 1;
        tokenInfo[address(token)] = TokenData(address(token), _name, _ticker, _supply);
        emit TokenDeployed(address(token));
        return address(token);
    }
```

**getAllTokens**: returns information about all tokens created by the factory.

```js
    function getAllTokens() public view returns (TokenData[] memory) {
        TokenData[] memory allTokens = new TokenData[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            allTokens[i] = tokenInfo[tokens[i]];
        }
        return allTokens;
    }
```

## How to implement the Token Factory contract in BOS?

To implement the Token Factory contract and be able to create new tokens from our BOS component we will have to make some configurations and calls to the contract methods.

The first thing we must do is to initialize our contract and call the corresponding ABI to obtain the information of the methods of the contract, for them we make use of the following lines:

```jsx
const factoryContract = "0xAc9221060455f60dfFF8bf8C4f601E500AC095D7";

const factoryAbi = fetch(
  "https://raw.githubusercontent.com/open-web-academy/BOS-TokenFactory/main/TokenFactoryABI.txt"
);
```

Once this is done, we will proceed to initialize each of the state variables as well as each of the methods to change their values.

```jsx
const [sender, setSender] = useState(null);
const [tokens, setTokens] = useState([]);
const [tokenName, setTokenName] = useState("MYTOKEN");
const [tokenSymbol, setTokenSymbol] = useState("MTKN");
const [initialSupply, setInitialSupply] = useState(10000);
const [minting, setMinting] = useState(false);
const [tabSelected, setTabSelected] = useState("factory");
```

As mentioned before, the Token Factory contract has two main methods, to call them from BOS we will have to do the following: 

**getTokens**: With this method we get each of the tokens created in the factory to later show them in the UI:

```jsx
const getTokens = () => {
  const factory = new ethers.Contract(
    factoryContract,
    factoryAbi.body,
    Ethers.provider().getSigner()
  );

  factory.getAllTokens().then((res) => {
    setTokens(res);
    console.log(res);
  });
};
```

**createToken**: With this method we create a new token, the parameters to be sent are the following:
  * **tokenName**: token name to create.
  * **tokenSymbol**: token symbol to craete.
  * **amount**: initial token supply to create.

```jsx
const createToken = () => {
  const contract = new ethers.Contract(
    factoryContract,
    factoryAbi.body,
    Ethers.provider().getSigner()
  );

  const amount = ethers.utils.parseUnits(initialSupply.toString(), 18);
  contract.deployToken(tokenName, tokenSymbol, amount).then((res) => {
  });
};
```

## How to test the Component?

To run this project in BOS you must run the widget (BOS-TokenFactory.jsx) on an available BOS gateway, for example: [near.social ](https://near.social/edit)

Once the code for the widget has been added we can render it by clicking on the preview button to render the component.

<img src="https://drive.google.com/uc?id=16VU0L6J8Zd4_lUMP5zpgzIpOKmWghguQ" width="50%">

For this example you will also need to have installed and configured [metamask](https://metamask.io/) and [Sepolia](https://sepolia.dev/) network.

Once this is done, you can click **Connect Wallet** to run metamask and connect the component to your account.

<img src="https://drive.google.com/uc?id=1ofh3_jT6FGug0JON-EM0IFay4oq4JQNG" width="50%">

Once metamask is connected we will be able to start interacting with the UI.

The first step to create a new token is to fill in the form with the three fields: token name, token symbol and token supply.

Then we must click on the "Create Token" button which will launch a transaction in metamask and we must confirm it to start with the creation of our token.

Finally we can go to the "Token List" tab where we can see all the tokens created with their respective addresses to add the token to metamask.

<img src="https://drive.google.com/uc?id=1hGApes700TyMT7aMbIWA61QC1mdFBzcP" width="50%">

## BOS Widget

Token Factory: https://near.social/owa-is-bos.near/widget/BOS-TokenFactory
