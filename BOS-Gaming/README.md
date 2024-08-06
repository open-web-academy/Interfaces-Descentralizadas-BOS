# BOS + Gaming

This repository is an example of how to create a game in BOS using any blockchain.

This game is a tamagotchi with a Burrito theme where you can mint new NFT and interact with them with the possibility to play, feed them and make them sleep.

<img src="https://drive.google.com/uc?id=1ix6w76D6P4wmovlnSAaehrK59qqCKgB1" width="50%">

## How to implement the game in BOS?

A simple way to implement this type of games in BOS is by using animated images, which will be displayed depending on the activity that the Burrito is performing.

All the statistics will be stored in the smart contract from where we will also be retrieving the information from the NFTs and sending to update the information after performing any action.

The main configurations and methods to be called from BOS to successfully run this game will be shown below.

The following lines of code show the constants with the respective addresses of the smart contract and the ABI containing the available methods of the contract used for this game.
```jsx
// Smart contract address
const virtualPetContract = "0xE3B4cf554EA9113fbbF0715309ce87165024901E";

// Obtaining the ABI with the list of methods available in the contract
const virtualPetAbi = fetch(
  "https://raw.githubusercontent.com/cloudmex/burritobattle-pet/main/ABI.txt"
);
```

**Mint**: This is the method used to mint a new Burrito, as we can see this method only receives one parameter which is the name of the Burrito, once the smart contract method is called to mint the new NFT we proceed to call a second method to query the amount of Burritos minted and display this counter in the user interface.

```jsx
const mint = () => {
  // We initialize the contract with ethers.Contract and put into use the contract, the ABI and the account that will sign the transactions
  const contract = new ethers.Contract(
    virtualPetContract,
    virtualPetAbi.body,
    Ethers.provider().getSigner()
  );

  // We call the mintPet method
  contract.mintPet(state.burritoName).then((res) => {
    const lastId = (state.mintedBurritos += 1);
    State.update({
      init: false,
      burritoName: "",
      mintedBurritos: lastId,
      minting: true,
    });
    setTimeout(() => {
      contract.getMintedTokens().then((res) => {
        State.update({
          minting: false,
        });
      });
    }, "20000");
  });
};
```

<img src="https://drive.google.com/uc?id=1PrTHQP1pQ6LtoKG4VXGUnyARFzlvuDLW" width="50%">


**Get Burrito**: This method is used to obtain the information of one of our previously minted Burritos, it only receives as parameter the ID of the Burrito to obtain and after retrieving the information from the smart contract it gives the necessary format and stores it in the state of the component.

```jsx
const getNft = () => {
  State.update({
    tokenId: state.inputTokenId,
  });

  // We initialize the contract with ethers and put into use the contract, the ABI and the account that will sign the transactions
  const contract = new ethers.Contract(
    virtualPetContract,
    virtualPetAbi.body,
    Ethers.provider().getSigner()
  );

  // We call the getTokenInfoById method to query the NFT information by its Id
  contract.getTokenInfoById(state.inputTokenId).then((res) => {
    if (!res[1]) {
      State.update({
        error: "Burrito's ID doesn't exist or You don't own the Burrito",
      });
    }
    if (res[1]) {
      // We change the format of the information obtained from the contract
      const petInfo = [res].map(_castData);
      State.update({
        firstSearch: false,
        pet: petInfo[0],
        currentActivity: petInfo[0].currentActivity,
        currentImg: _getCurrentImg(petInfo[0]),
        isBusy: false,
        error: "",
      });
    }
  });
};
```

<img src="https://drive.google.com/uc?id=1vEYy2MZG4AGZaIQQ_cFjxr3fzdqPfB4S" width="50%">

**Play**: This is the method used to play with our Burrito and which only receives as a parameter the ID of the Burrito we will play with (internally the smart contract makes the modifications of the Burrito's statistics).

```jsx
const play = () => {
  // We initialize the contract with ethers.Contract and put into use the contract, the ABI and the account that will sign the transactions
  const contract = new ethers.Contract(
    virtualPetContract,
    virtualPetAbi.body,
    Ethers.provider().getSigner()
  );

  // We call the play method
  contract.play(state.tokenId).then((res) => {
    State.update({
      isBusy: true,
      isPlay: true,
    });
  });
};
```

<img src="https://drive.google.com/uc?id=1geax6MzEKyPqrnJO5RQdel4V84xOWJxR" width="50%">

**Eat**: This is the method used to feed our Burrito and only receives as parameter the ID of the Burrito we are going to feed.

```jsx
const eat = () => {
  // We initialize the contract with ethers.Contract and put into use the contract, the ABI and the account that will sign the transactions
  const contract = new ethers.Contract(
    virtualPetContract,
    virtualPetAbi.body,
    Ethers.provider().getSigner()
  );

  // We call the eat method
  contract.eat(state.tokenId).then((res) => {
    State.update({
      currentImg: _getEatImg(state.pet.image),
      isBusy: true,
    });
    setTimeout(() => {
      getNft();
    }, "20000");
  });
};
```

<img src="https://drive.google.com/uc?id=13ptJzTIzHr14b3E45w204NathGljjUYC" width="50%">

**Sleep**: This is the method used to put our Burrito to sleep and like the previous methods it only receives as parameter the ID of the Burrito.

```jsx
const sleep = () => {
  // We initialize the contract with ethers.Contract and put into use the contract, the ABI and the account that will sign the transactions
  const contract = new ethers.Contract(
    virtualPetContract,
    virtualPetAbi.body,
    Ethers.provider().getSigner()
  );

  // We call the doze method
  contract.doze(state.tokenId).then((res) => {
    State.update({
      currentImg: _getSleepImg(state.pet.image),
      isBusy: true,
    });
    setTimeout(() => {
      getNft();
    }, "20000");
  });
};
```

<img src="https://drive.google.com/uc?id=1HB8gUR5OQl8nA3FYHTQAKcM1rQ6S-gmA" width="50%">

## How to test the Component?

To run this project in BOS you must run both widgets (Mint.jsx and Interact.jsx) on an available BOS gateway, for example: [near.social ](https://near.social/edit)

Once the code for both widgets has been added we can render it by clicking on the preview button to render the component.

<img src="https://drive.google.com/uc?id=1ijRT8cM4MwtDDA592xk80mVlNEqGEuxY" width="50%">

For this example you will also need to have installed and configured [metamask](https://metamask.io/) and the [Aurora test network](https://aurora.dev/faucet).

Once this is done, you can click **Connect with Web3** to run metamask and connect the component to your account.

<img src="https://drive.google.com/uc?id=12Vp3p8SHzJCPZFJd6SsyiGaB1e2WB90i" width="50%">

This process will be necessary to execute both components, once metamask is connected we will be able to start interacting with the UI and start playing.

The first thing to do is to get a new Burrito from the Mint Component. We just enter the name we want our Burrito to have and click on **Mint Burrito** to launch Metamask and send the transaction.

<img src="https://drive.google.com/uc?id=1E1sRLyKBBG9r5lphXLDsi7vyqq2t3b8F" width="50%">

The identifiers of the Burritos are consecutive, so the last id of the counter will be that of the Burrito we have just minted and which we will have to enter in the second component to start interacting. From here we can make our Burrito play, eat or sleep.

<img src="https://drive.google.com/uc?id=11U4zbbZGWiRkULVcZuf-6w5ce3gGDEPI" width="50%">

## BOS Widgets

Mint: https://near.social/owa-is-bos.near/widget/BOS-Gaming-Burrito-Mint <br/>
Interact: https://near.social/owa-is-bos.near/widget/BOS-Gaming-Burrito-Interact
