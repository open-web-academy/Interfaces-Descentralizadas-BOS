# BOS + Aave

This repository is an example of how to implement Aave technology in a BOS component to query the supply and borrow available on the ETH network.

<img src="https://drive.google.com/uc?id=1U10_dhSXLOo_0PY1kFuEEwhGiMKuYv8R" width="50%">

## How to implement the Aave technology in BOS?

To implement the Aave technology and get the supply and borrow available from our BOS component we will have to make some configurations and calls to an API.

The first thing to do is to initialize each of the corresponding ABI and network configurations, in this case ETH:

```jsx
// Contract ABIs
const CONTRACT_ABI = {
  wrappedTokenGatewayV3ABI:
    "https://raw.githubusercontent.com/corndao/aave-v3-bos-app/main/abi/WrappedTokenGatewayV3ABI.json",
  erc20Abi:
    "https://raw.githubusercontent.com/corndao/aave-v3-bos-app/main/abi/ERC20Permit.json",
  aavePoolV3ABI:
    "https://raw.githubusercontent.com/corndao/aave-v3-bos-app/main/abi/AAVEPoolV3.json",
  variableDebtTokenABI:
    "https://raw.githubusercontent.com/corndao/aave-v3-bos-app/main/abi/VariableDebtToken.json",
  walletBalanceProviderABI:
    "https://raw.githubusercontent.com/corndao/aave-v3-bos-app/main/abi/WalletBalanceProvider.json",
};

// Default data from chain Id and ETH token
const DEFAULT_CHAIN_ID = 1;
const NATIVE_SYMBOL_ADDRESS_MAP_KEY = "0x0";
const ETH_TOKEN = { name: "Ethereum", symbol: "ETH", decimals: 18 };
const WETH_TOKEN = { name: "Wrapped Ether", symbol: "WETH", decimals: 18 };
const ACTUAL_BORROW_AMOUNT_RATE = 0.99;

// Get AAVE network config by chain id
function getNetworkConfig(chainId) {
  const abis = {
    wrappedTokenGatewayV3ABI: fetch(CONTRACT_ABI.wrappedTokenGatewayV3ABI),
    erc20Abi: fetch(CONTRACT_ABI.erc20Abi),
    aavePoolV3ABI: fetch(CONTRACT_ABI.aavePoolV3ABI),
    variableDebtTokenABI: fetch(CONTRACT_ABI.variableDebtTokenABI),
    walletBalanceProviderABI: fetch(CONTRACT_ABI.walletBalanceProviderABI),
  };

  const constants = {
    FIXED_LIQUIDATION_VALUE: "1.0",
    MAX_UINT_256:
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    AAVE_API_BASE_URL: "https://aave-data-service-7a85eea3aebe.herokuapp.com",
  };

  switch (chainId) {
    case 1: // ethereum mainnet
      return {
        chainName: "Ethereum Mainnet",
        nativeCurrency: ETH_TOKEN,
        nativeWrapCurrency: WETH_TOKEN,
        rpcUrl: "https://rpc.ankr.com/eth",
        aavePoolV3Address: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
        wrappedTokenGatewayV3Address:
          "0xD322A49006FC828F9B5B37Ab215F99B4E5caB19C",
        balanceProviderAddress: "0xC7be5307ba715ce89b152f3Df0658295b3dbA8E2",
        ...abis,
        ...constants,
      };
    default:
      throw new Error("unknown chain id");
  }
}
```

Method to switch to the corresponding network (ETH) and validation to determine that we are on the correct network:

```jsx
// Change network to Ethereum
function switchEthereumChain(chainId) {
  const chainIdHex = `0x${chainId.toString(16)}`;
  const res = Ethers.send("wallet_switchEthereumChain", [
    { chainId: chainIdHex },
  ]);
  if (res === undefined) {
    console.log(
      `Failed to switch chain to ${chainId}. Add the chain to wallet`
    );
    const config = getNetworkConfig(chainId);
    Ethers.send("wallet_addEthereumChain", [
      {
        chainId: chainIdHex,
        chainName: config.chainName,
        nativeCurrency: config.nativeCurrency,
        rpcUrls: [config.rpcUrl],
      },
    ]);
  }
}

// Verify that you are on the correct network (Ethereum).
if (
  state.chainId === undefined &&
  ethers !== undefined &&
  Ethers.send("eth_requestAccounts", [])[0]
) {
  Ethers.provider()
    .getNetwork()
    .then((data) => {
      const chainId = data?.chainId;
      const config = getNetworkConfig(chainId);
      if (!config) {
        State.update({ isChainSupported: true });
        switchEthereumChain(DEFAULT_CHAIN_ID);
      } else {
        State.update({ chainId, isChainSupported: true });
      }
    });
}
```

Method to obtain the available assets to supply with all their specifications:

```jsx
function updateData(refresh) {
  // Check ABI loaded
  if (
    Object.keys(CONTRACT_ABI)
      .map((key) => config[key])
      .filter((ele) => !!ele).length !== Object.keys(CONTRACT_ABI).length
  ) {
    return;
  }
  const provider = Ethers.provider();
  if (!provider) {
    return;
  }
  provider
    .getSigner()
    ?.getAddress()
    ?.then((address) => {
      State.update({ address });
    });
  provider
    .getSigner()
    ?.getBalance()
    .then((balance) => State.update({ baseAssetBalance: balance }));
  if (!state.address || !state.baseAssetBalance) {
    return;
  }

  getMarkets(state.chainId).then((marketsResponse) => {
    if (!marketsResponse) {
      return;
    }
    const markets = marketsResponse.body;
    const marketsMapping = markets.reduce((prev, cur) => {
      prev[cur.underlyingAsset] = cur;
      return prev;
    }, {});

    const nativeMarket = markets.find(
      (market) => market.symbol === config.nativeWrapCurrency.symbol
    );
    markets.push({
      ...nativeMarket,
      ...{
        ...config.nativeCurrency,
        supportPermit: true,
      },
    });

    // Get user balances
    batchBalanceOf(
      state.chainId,
      state.address,
      markets.map((market) => market.underlyingAsset),
      config.walletBalanceProviderABI
    )
      .then((balances) => balances.map((balance) => balance.toString()))
      .then((userBalances) => {
        const assetsToSupply = markets
          .map((market, idx) => {
            const balanceRaw = Big(
              market.symbol === config.nativeCurrency.symbol
                ? state.baseAssetBalance
                : userBalances[idx]
            ).div(Big(10).pow(market.decimals));
            const balance = balanceRaw.toFixed(market.decimals, 0);
            const balanceInUSD = balanceRaw
              .mul(market.marketReferencePriceInUsd)
              .toFixed(3, 0);
            return {
              ...market,
              balance,
              balanceInUSD,
            };
          })
          .sort((asset1, asset2) => {
            const balanceInUSD1 = Number(asset1.balanceInUSD);
            const balanceInUSD2 = Number(asset2.balanceInUSD);
            if (balanceInUSD1 !== balanceInUSD2)
              return balanceInUSD2 - balanceInUSD1;
            return asset1.symbol.localeCompare(asset2.symbol);
          });

        State.update({
          assetsToSupply,
        });

        updateUserDebts(marketsMapping, assetsToSupply, refresh);
      });
  });
}
```

Method to obtain all the available borrow with each of their specifications:

```jsx
function updateUserDebts(marketsMapping, assetsToSupply) {
  if (!marketsMapping || !assetsToSupply) {
    return;
  }

  const prevYourBorrows = state.yourBorrows;
  // userDebts depends on the balance from assetsToSupply
  const assetsToSupplyMap = assetsToSupply.reduce((prev, cur) => {
    if (cur.symbol !== config.nativeCurrency.symbol) {
      prev[cur.underlyingAsset] = cur;
    } else {
      prev[NATIVE_SYMBOL_ADDRESS_MAP_KEY] = cur;
    }
    return prev;
  }, {});

  getUserDebts(state.chainId, state.address).then((userDebtsResponse) => {
    if (!userDebtsResponse) {
      return;
    }
    const userDebts = userDebtsResponse.body;
    const assetsToBorrow = {
      ...userDebts,
      healthFactor: formatHealthFactor(userDebts.healthFactor),
      debts: userDebts.debts
        .map((userDebt) => {
          const market = marketsMapping[userDebt.underlyingAsset];
          if (!market) {
            return;
          }
          const { availableLiquidityUSD } = market;
          const availableBorrowsUSD = bigMin(
            userDebts.availableBorrowsUSD,
            availableLiquidityUSD
          )
            .times(ACTUAL_BORROW_AMOUNT_RATE)
            .toFixed();
          const assetsToSupplyMapKey =
            market.symbol === config.nativeWrapCurrency.symbol
              ? NATIVE_SYMBOL_ADDRESS_MAP_KEY
              : userDebt.underlyingAsset;
          return {
            ...market,
            ...userDebt,
            ...(market.symbol === config.nativeWrapCurrency.symbol
              ? {
                  ...config.nativeCurrency,
                  supportPermit: true,
                }
              : {}),
            availableBorrows: calculateAvailableBorrows({
              availableBorrowsUSD,
              marketReferencePriceInUsd: market.marketReferencePriceInUsd,
            }),
            availableBorrowsUSD,
            balance: assetsToSupplyMap[assetsToSupplyMapKey].balance,
            balanceInUSD: assetsToSupplyMap[assetsToSupplyMapKey].balanceInUSD,
          };
        })
        .filter((asset) => !!asset)
        .sort((asset1, asset2) => {
          const availableBorrowsUSD1 = Number(asset1.availableBorrowsUSD);
          const availableBorrowsUSD2 = Number(asset2.availableBorrowsUSD);
          if (availableBorrowsUSD1 !== availableBorrowsUSD2)
            return availableBorrowsUSD2 - availableBorrowsUSD1;
          return asset1.symbol.localeCompare(asset2.symbol);
        })
        .filter((asset) => {
          return asset.borrowingEnabled;
        }),
    };

    const yourBorrows = {
      ...assetsToBorrow,
      debts: assetsToBorrow.debts.filter(
        (row) =>
          !isNaN(Number(row.variableBorrowsUSD)) &&
          Number(row.variableBorrowsUSD) > 0
      ),
    };

    State.update({
      yourBorrows,
      assetsToBorrow,
      loadData: true,
    });
  });
}
```

## How to test the Component?

To run this project in BOS you must run the widget (BOS-Aave.jsx) on an available BOS gateway, for example: [near.social ](https://near.social/edit)

Once the code for the widget has been added we can render it by clicking on the preview button to render the component.

<img src="https://drive.google.com/uc?id=1Q6TgIz26ZMsliTlR1M9glGx4YQWM2U2A" width="50%">

For this example you will also need to have installed and configured [metamask](https://metamask.io/) and [ETH](https://revoke.cash/es/learn/wallets/add-network/ethereum) network.

Once this is done, you can click **Connect Wallet** to run metamask and connect the component to your account.

<img src="https://drive.google.com/uc?id=1pOoc5njKVM9EpXubbH8HB3Gy55dLGQWT" width="50%">

Once metamask is connected we will be able to start interacting with the UI.

Once connected to our metamask account, the component will automatically make the necessary queries to the corresponding API to obtain the supply and borrow available in the ETH network, this information can be displayed in the available tabs.

<img src="https://drive.google.com/uc?id=1vuOoLd7mX6zHraoRSBkXHY1YsxE16Sue" width="50%">

## BOS Widget

Aave: https://near.social/owa-is-bos.near/widget/BOS-Aave
