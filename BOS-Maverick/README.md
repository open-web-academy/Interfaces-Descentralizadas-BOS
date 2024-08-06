# BOS + Maverick

This repository is an example of how to implement Maverick LP contracts in BOS to add liquidity to a pool in both left and right modes.

<img src="https://drive.google.com/uc?id=1NcAQb5QimcquiI3DCc2OZhdy3sIwHIAA" width="35%">

## How to implement the LP contract of Maverick in BOS?

To implement the Maverick LP contract and be able to add liquidity from our BOS component we will have to make some configurations and calls to the contract methods.

The first thing we must do is to initialize our contract and call the corresponding ABI to obtain the information of the methods of the contract, for them we make use of the following lines:

```jsx
const routerAbi = fetch(
  "https://raw.githubusercontent.com/yaairnaavaa/Maverick/main/maverick-router.txt"
);

const poolAbi = fetch(
  "https://raw.githubusercontent.com/yaairnaavaa/Maverick/main/IPoolABI.txt"
);
```

Once this is done, we will proceed to initialize each of the state variables.

```jsx
State.init({
  isZkSync: false,
  routerContract: "0x39E098A153Ad69834a9Dac32f0FCa92066aD03f4",
  step: 1,
  poolSelected: undefined,
  poolModeSelected: POOLSMODE[0],
  needMoreAllowanceTA: false,
  needMoreAllowanceTB: false,
  amountInputTokenA: null,
  inputBalanceTokenA: null,
  amountInputTokenB: null,
  inputBalanceTokenB: null,
  poolList: [],
  pools: [],
  poolOptions: [],
  need2Tokens: true,
  onlyRight: false,
});
```

To interact with Maverick's LP smart contracts we will have to make use of the following methods:

**getUserBalances**: Obtains the balance of each of the tokens that the user has in the zkSyncEra network, for this we make a query to the corresponding API.

To get information from an API we only have to make a call from BOS using asyncFetch to the corresponding URL.

The following is the basic structure of an asyncFetch showing its main elements:
  * **URL_API**: address of the API to be consumed.
  * **method**: http method to be used (GET, POST, PUT or DELETE).
  * **headers**: Additional metadata that is sent to the API to help the server understand what type of request is being sent.

**Structure of asyncFetch**:
```jsx
  asyncFetch(
    "URL_API",
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    }
  )
    .then(({ body }) => { })
    .catch((err) => { });
```

In this case, the maverick API call would look like this:

```jsx
const getUserBalances = () => {
  const accounts = Ethers.send("eth_requestAccounts", []);
  asyncFetch(`https://api.mav.xyz/api/v4/tokenBalances/324/${accounts[0]}`)
    .catch((err) => {
      console.log(err);
    })
    .then((res) => {
      State.update({ userBalances: res.body.tokenBalances });
    });
};
```

**getPools**: Gets the list of available pools to add liquidity in the zkSyncEra network.

```jsx
const getPools = () => {
  asyncFetch(`https://api.mav.xyz/api/v4/pools/324
          `)
    .catch((err) => {
      console.log(err);
    })
    .then((res) => {
      let poolList = [
        ...new Map(res.body.pools.map((item) => [item["name"], item])).values(),
      ];
      pools = res.body.pools;
      State.update({
        poolList: poolList,
        poolSelected: poolList[0],
        selectedPoolOptions: poolList[0],
      });
      getPoolOptions(poolList[0].name, res.body.pools);
    });
};
```

**getAccountAllowance**: Gets the user's available allowance of the selected token to add liquidity.

```jsx
const getAccountAllowance = (data) => {
  let token = data.token;
  if (token.symbol == "ETH") {
    data.mode == "TA"
      ? State.update({ tokenAAllowance: undefined })
      : State.update({ tokenBAllowance: undefined });
  } else {
    asyncFetch(
      "https://gist.githubusercontent.com/veox/8800debbf56e24718f9f483e1e40c35c/raw/f853187315486225002ba56e5283c1dba0556e6f/erc20.abi.json"
    ).then((res) => {
      const contract = token.address;
      const approveContract = new ethers.Contract(
        contract,
        res.body,
        Ethers.provider().getSigner()
      );
      approveContract
        .allowance(state.sender, state.routerContract)
        .then((res) => {
          console.log(res);
          if (data.mode == "TA") {
            State.update({ tokenAAllowance: parseInt(res.toString()) });
          } else {
            State.update({ tokenBAllowance: parseInt(res.toString()) });
          }
        });
    });
  }
};
```

**addLiquidity**: This method allows you to add liquidity to the selected pool. From this method the instance of the smart contract is created using the address and the corresponding ABI to later interact with the smart contract.

```jsx
const addLiquidity = () => {
  const router = new ethers.Contract(
    state.routerContract,
    routerAbi.body,
    Ethers.provider().getSigner()
  );

  const pool = new ethers.Contract(
    state.selectedPoolOptions.id,
    poolAbi.body,
    Ethers.provider().getSigner()
  );

  let amountInA, amountInB;
  let inputA = state.amountInputTokenA;
  let inputB = state.amountInputTokenB;
  let usingETH =
    state.selectedPoolOptions.tokenA.symbol == "ETH" ||
    state.selectedPoolOptions.tokenB.symbol == "ETH";
  let tokUsedETH =
    state.selectedPoolOptions.tokenA.symbol == "ETH" ? "tokA" : "tokB";

  if (state.poolModeSelected.id == 1) {
    amountInA = ethers.utils.parseUnits(
      inputA,
      state.selectedPoolOptions.tokenA.decimals
    );
    amountInB = ethers.utils.parseUnits(
      "0",
      state.selectedPoolOptions.tokenB.decimals
    );
  } else if (state.poolModeSelected.id == 2) {
    amountInA = ethers.utils.parseUnits(
      "0",
      state.selectedPoolOptions.tokenA.decimals
    );
    amountInB = ethers.utils.parseUnits(
      inputB,
      state.selectedPoolOptions.tokenB.decimals
    );
  }

  const overrides = {
    value: usingETH
      ? tokUsedETH == "tokA"
        ? amountInA
        : amountInB
      : ethers.utils.parseUnits("0", 18),
    gasLimit: 3000000,
  };

  pool.getState().then((res) => {
    let lowerTick = res[0];

    let position =
      state.poolModeSelected.id == 1 ? lowerTick - 1 : lowerTick + 1;

    pool.binPositions(res[0], state.poolModeSelected.id).then((res) => {
      let liquidityParams = [];
      if (state.poolModeSelected.id == 1 || state.poolModeSelected.id == 2) {
        liquidityParams.push({
          kind: state.poolModeSelected.id,
          pos: position,
          isDelta: false,
          deltaA: amountInA,
          deltaB: amountInB,
        });
      }
      try {
        router
          .addLiquidityToPool(
            state.selectedPoolOptions.id,
            state.userNFT ? state.userNFT : 0,
            liquidityParams,
            0,
            0,
            1e13,
            overrides
          )
          .then((res) => {
            State.update({
              addingLiquidity: true,
            });
            setTimeout(() => {
              State.update({
                step: 1,
                poolSelected: undefined,
                selectedPoolOptions: undefined,
                poolOptions: undefined,
                poolModeSelected: POOLSMODE[0],
                needMoreAllowanceTA: false,
                needMoreAllowanceTB: false,
                amountInputTokenA: null,
                inputBalanceTokenA: null,
                amountInputTokenB: null,
                inputBalanceTokenB: null,
                need2Tokens: true,
                addingLiquidity: false,
                onlyRight: false,
                tokenABalance: undefined,
                tokenBBalance: undefined,
                tokenAAllowance: undefined,
                tokenBAllowance: undefined,
                moreTokenAAllowance: undefined,
                moreTokenBAllowance: undefined,
              });
              getUserBalances();
            }, 25000);
          });
      } catch (err) {
        console.log(err);
      }
    });
  });
};
```

## How to test the Component?

To run this project in BOS you must run the widget (BOS-Maverick.jsx) on an available BOS gateway, for example: [near.social ](https://near.social/edit)

Once the code for the widget has been added we can render it by clicking on the preview button to render the component.

<img src="https://drive.google.com/uc?id=1oiuRLjC2RJDts2K57av4I5YzuGtSukVT" width="50%">

For this example you will also need to have installed and configured [metamask](https://metamask.io/) and [zkSyncEra](https://docs.zksync.io/build/quick-start/add-zksync-to-metamask.html) network.

Once this is done, you can click **Connect Wallet** to run metamask and connect the component to your account.

<img src="https://drive.google.com/uc?id=1b9qgOoFL9a1eTi67aWYqH1UeGnYLa7Ye" width="50%">

Once metamask is connected we will be able to start interacting with the UI.

To add liquidity to a pool we must follow the following steps:

1. Select a pool.
2. Select the pool options.
3. Select the type of liquidity (right or left).
4. Enter the amount of tokens to be added.
5. Validate the information and accept the transaction in metamask.

<img src="https://drive.google.com/uc?id=1S3nu7eEUs-7PW0kOT4VJpNZHdI5QaodR" width="50%">

## BOS Widget

Maverick: https://near.social/owa-is-bos.near/widget/BOS-Maverick
