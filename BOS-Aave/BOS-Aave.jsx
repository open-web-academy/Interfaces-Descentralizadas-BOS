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

// Validation to determine that it is a number
function isValid(a) {
  if (!a) return false;
  if (isNaN(Number(a))) return false;
  if (a === "") return false;
  return true;
}

// Function to get markets
function getMarkets(chainId) {
  return asyncFetch(`${config.AAVE_API_BASE_URL}/${chainId}/markets`);
}

// Function to get user debts
function getUserDebts(chainId, address) {
  return asyncFetch(`${config.AAVE_API_BASE_URL}/${chainId}/debts/${address}`);
}

// App config
function getConfig(network) {
  const chainId = state.chainId;
  switch (network) {
    case "mainnet":
      return {
        ownerId: "aave-v3.near",
        nodeUrl: "https://rpc.mainnet.near.org",
        ipfsPrefix: "https://ipfs.near.social/ipfs",
        ...(chainId ? getNetworkConfig(chainId) : {}),
      };
    case "testnet":
      return {
        ownerId: "aave-v3.testnet",
        nodeUrl: "https://rpc.testnet.near.org",
        ipfsPrefix: "https://ipfs.near.social/ipfs",
        ...(chainId ? getNetworkConfig(chainId) : {}),
      };
    default:
      throw Error(`Unconfigured environment '${network}'.`);
  }
}
const config = getConfig(context.networkId);

// App states
State.init({
  imports: {},
  chainId: undefined, // chainId is undefined in the case of unsupported chains
  isChainSupported: true,
  assetsToSupply: undefined,
  yourSupplies: undefined,
  assetsToBorrow: undefined,
  yourBorrows: undefined,
  address: undefined,
  baseAssetBalance: undefined,
  selectTab: "supply", // supply | borrow
});

const loading =
  !state.assetsToSupply || !state.yourSupplies || !state.assetsToBorrow;

// Import functions to state.imports
function importFunctions(imports) {
  if (loading) {
    State.update({
      imports,
    });
  }
}

// Define the modules you'd like to import
const modules = {
  number: `${config.ownerId}/widget/Utils.Number`,
  date: `${config.ownerId}/widget/Utils.Date`,
  data: `${config.ownerId}/widget/AAVE.Data`,
};

function checkProvider() {
  const provider = Ethers.provider();
  if (provider) {
    State.update({ walletConnected: true });
  } else {
    State.update({ walletConnected: false });
  }
}

function calculateAvailableBorrows({
  availableBorrowsUSD,
  marketReferencePriceInUsd,
}) {
  return isValid(availableBorrowsUSD) && isValid(marketReferencePriceInUsd)
    ? Big(availableBorrowsUSD).div(marketReferencePriceInUsd).toFixed()
    : Number(0).toFixed();
}

function bigMin(_a, _b) {
  const a = Big(_a);
  const b = Big(_b);
  return a.gt(b) ? b : a;
}

function formatHealthFactor(healthFactor) {
  if (healthFactor === "∞") return healthFactor;
  if (!healthFactor || !isValid(healthFactor)) return "-";
  if (Number(healthFactor) === -1) return "∞";
  return Big(healthFactor).toFixed(2, 0);
}

function batchBalanceOf(chainId, userAddress, tokenAddresses, abi) {
  const balanceProvider = new ethers.Contract(
    config.balanceProviderAddress,
    abi.body,
    Ethers.provider().getSigner()
  );

  return balanceProvider.batchBalanceOf([userAddress], tokenAddresses);
}

// Update data in async manner
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

        console.log("assetsToSupply");
        console.log(assetsToSupply);

        State.update({
          assetsToSupply,
        });

        updateUserDebts(marketsMapping, assetsToSupply, refresh);
      });
  });
}

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

    console.log("assetsToBorrow");
    console.log(assetsToBorrow);

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

checkProvider();

if (!state.loadData) {
  updateData();
}

// These lines use the useState hook to create state variables for assigning information.
const [sender, setSender] = useState(null);
const [tabSelected, setTabSelected] = useState("supply");

//We define the navigation tabs of the component
const pills = [
  { id: "supply", title: "Supply" },
  { id: "borrow", title: "Borrow" },
];

// We define all the necessary styles for our component by using styled components.
const Wrapper = styled.div`
* {
  font-family: 'system-ui','Inter', 'Space Grotesk' !important;
  color: 'white';
}

.connectB {
        background: #ECA227;
        color: #1E1E1E;
        font-weight: 700;
        padding: 15px 20px;
        border-radius: 1rem;
        border: none;
        &:hover {
            background: #4A21A5;
            color: white;
        }: 
}

.uploadIMG {
        background: #ECA227;
        color: #1E1E1E;
        font-weight: 700;
        padding: 15px 20px;
        border-radius: 1rem;
        border: none;
        &:hover {
            background: #4A21A5;
            color: white;
        }
    }
`;

const PillButtonActive = styled.div`
font-weight: 700;
background-color: #ECA227;
color: black;
border-radius: 10px;
margin: 0 10px 0 10px;
cursor: pointer;
padding: 7px 0 7px 0;
  }
`;

const PillButton = styled.div`
font-weight: 700;
cursor: pointer;
background-color: #1E1E1E;
color: white;
padding-bottom: 5px;
border-radius: 10px;
margin: 0 10px 0 10px;
padding: 7px 0 7px 0;
  }
`;

const ItemBackground = styled.div`
        width: 100%;
        display: flex;
        justify-content: center;
        background-repeat: no-repeat;
        background-size: cover;
        margin-bottom: -50px;
        `;

const ItemContainer = styled.div`
        margin-top: 30px;
        box-sizing: border-box;
        min-width: 320px;
        width: 100%;
        padding: 0px 32px;
        position: relative;
        `;

const ItemTitle = styled.h3`
        text-align: center;
        color: black;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 1rem;
        `;

const ItemImage = styled.img`
            width: 40px;
            margin-right: 15px;
        `;

const ItemSubTitle = styled.div`
        text-align: center;
        color: yellow;
        margin-bottom: 5px;
        `;

const ItemHeader = styled.div`
        background: #ECA227;
        color: #1E1E1E;
        font-weight: 400;
        font-size: 12px;
        line-height: 1.6em;
        border-radius: 20px;
        margin: 0px;
        padding: 20px;
        box-shadow: none;
        color: rgb(255, 255, 255);
        `;

const ItemBody = styled.div`
        font-weight: 400;
        font-size: 1em;
        line-height: 1.6em;
        border-radius: 0px 0px 20px 20px;
        margin: -20px 0px 0px;
        padding: 32px;
        box-shadow: none;
        background: #1E1E1E;
        color: black;
        `;

const ItemMintNumber = styled.label`
        font-size: 20px;
        font-weight: 800;
        color: black;
        `;

const ItemMintButton = styled.button`
        background: #ECA227;
        color: #1E1E1E;
        font-weight: 700;
        padding: 15px 20px;
        border-radius: 1rem;
        border: none;
        &:hover {
            background: #4A21A5;
            color: white;
        }
        `;

const Card = styled.div`
        padding: 1em;
        border: 1px solid #ECA227;
        gap: 2em;
        margin: 10px auto;
        border-radius: .7em;
`;

const ImageCard = styled.div`
        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        height:fit-content;
        max-height:500px;
        width: 90%;
        max-width: 500px;
        border-radius: 1rem;
        &>img{
            object-fit: contain;
        }
`;

// FETCH CSS
const cssFont = fetch(
  "https://fonts.googleapis.com/css2?family=Lexend:wght@200;300;400;500;600;700;800"
).body;
const css = fetch(
  "https://nativonft.mypinata.cloud/ipfs/QmQNCGVCwmkPxcKqDdubvb8Goy5xP8md2MfWCAix7HxgGE"
).body;

if (!cssFont || !css) return "";

if (!state.theme) {
  State.update({
    theme: styled.div`
    font-family: Lexend;
    ${cssFont}
    ${css}
`,
  });
}
const Theme = state.theme;

// Finally we render the component where we call the necessary methods to interact with the smart contract.
return (
  <Theme>
    <Wrapper>
      <div
        style={{
          display: "flex",
          "justify-content": "center",
        }}
      ></div>
      <br />
      <ul
        className="nav nav-pills nav-fill mb-4"
        id="pills-tab2"
        role="tablist2"
        style={{ "margin-top": "15px" }}
      >
        {pills.map(({ id, title }, i) => (
          <li className="nav-item" role="presentation" key={i}>
            {tabSelected == id ? (
              <PillButtonActive
                onClick={() => {
                  setTabSelected(id);
                }}
              >
                {title}
              </PillButtonActive>
            ) : (
              <PillButton
                onClick={() => {
                  setTabSelected(id);
                }}
              >
                {title}
              </PillButton>
            )}
          </li>
        ))}
      </ul>

      <div
        className="tab-content"
        id="pills-tabContent"
        style={{ display: "flex", "justify-content": "center" }}
      >
        {tabSelected == "supply" ? (
          <ItemBackground>
            <ItemContainer>
              <ItemHeader>
                <ItemTitle>
                  <label></label>
                </ItemTitle>
              </ItemHeader>
              <ItemBody>
                {state.address ? (
                  <>
                    <div class="row" style={{ color: "white" }}>
                      <div class="col-6" style={{ alignContent: "center" }}>
                        <div class="row">
                          <div class="col-12">
                            <div
                              style={{ textAlign: "center", fontSize: "35px" }}
                            >
                              <label>Assets to supply</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            "justify-content": "center",
                            "align-items": "center",
                          }}
                        >
                          <img
                            src="https://ipfs.near.social/ipfs/bafkreifotevq6g6ralhvutlcssaasa7xbfjjc6mbo5hlnvgpxxgfmwswmq"
                            style={{
                              height: "150px",
                            }}
                          ></img>
                        </div>
                      </div>
                      <div
                        class="col-12"
                        style={{ height: "500px", overflow: "scroll" }}
                      >
                        <Widget
                          src={`owa-is-bos.near/widget/BOS-Aave.AssetsToSupply`}
                          props={{
                            config,
                            chainId: state.chainId,
                            assetsToSupply: state.assetsToSupply,
                            healthFactor: formatHealthFactor(
                              state.assetsToBorrow.healthFactor
                            ),
                            formatHealthFactor,
                            depositETHGas,
                            depositERC20Gas,
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ "text-align": "center" }}>
                    <Web3Connect
                      className="connectB"
                      connectLabel="Connect with Web3"
                    />
                  </div>
                )}
              </ItemBody>
            </ItemContainer>
          </ItemBackground>
        ) : (
          <ItemBackground>
            <ItemContainer>
              <ItemHeader>
                <ItemTitle>
                  <label></label>
                </ItemTitle>
              </ItemHeader>
              <ItemBody>
                {state.address ? (
                  <>
                    <div class="row" style={{ color: "white" }}>
                      <div class="col-6" style={{ alignContent: "center" }}>
                        <div class="row">
                          <div class="col-12">
                            <div
                              style={{ textAlign: "center", fontSize: "35px" }}
                            >
                              <label>Assets to borrow</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            "justify-content": "center",
                            "align-items": "center",
                          }}
                        >
                          <img
                            src="https://ipfs.near.social/ipfs/bafkreifotevq6g6ralhvutlcssaasa7xbfjjc6mbo5hlnvgpxxgfmwswmq"
                            style={{
                              height: "150px",
                            }}
                          ></img>
                        </div>
                      </div>
                      <div
                        class="col-12"
                        style={{ height: "500px", overflow: "scroll" }}
                      >
                        <Widget
                          src={`owa-is-bos.near/widget/BOS-Aave.AssetsToBorrow`}
                          props={{
                            config,
                            chainId: state.chainId,
                            assetsToBorrow: state.assetsToBorrow,
                            showBorrowModal: state.showBorrowModal,
                            yourSupplies: state.yourSupplies,
                            setShowBorrowModal: (isShow) =>
                              State.update({ showBorrowModal: isShow }),
                            formatHealthFactor,
                            onActionSuccess,
                            borrowETHGas,
                            borrowERC20Gas,
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ "text-align": "center" }}>
                    <Web3Connect
                      className="connectB"
                      connectLabel="Connect with Web3"
                    />
                  </div>
                )}
              </ItemBody>
            </ItemContainer>
          </ItemBackground>
        )}
      </div>
    </Wrapper>
  </Theme>
);
