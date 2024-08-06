// Address of the token factory smart contract.
const factoryContract = "0xAc9221060455f60dfFF8bf8C4f601E500AC095D7";

// URL to the JSON file containing the ABI of the factory contract.
const factoryAbi = fetch(
  "https://raw.githubusercontent.com/open-web-academy/BOS-TokenFactory/main/TokenFactoryABI.txt"
);

if (!factoryAbi.ok) {
  return "Loading";
}

// These lines use the useState hook to create state variables for assigning information.
const [sender, setSender] = useState(null);
const [tokens, setTokens] = useState([]);

const [tokenName, setTokenName] = useState("MYTOKEN");
const [tokenSymbol, setTokenSymbol] = useState("MTKN");
const [initialSupply, setInitialSupply] = useState(10000);
const [minting, setMinting] = useState(false);
const [tabSelected, setTabSelected] = useState("factory");

//We define the navigation tabs of the component
const pills = [
  { id: "factory", title: "Factory" },
  { id: "tokenlist", title: "Token List" },
];

// Validation to obtain the account we are connected to the component
if (!sender) {
  const accounts = Ethers.send("eth_requestAccounts", []);
  if (accounts.length) {
    setSender(accounts[0]);
  }
}

// Method to obtain the tokens created in the smart contract of token factory.
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

useEffect(() => {
  if (sender) {
    getTokens();
  }
}, []);

// Method to crate a new tokens in the smart contract of token factory.
const createToken = () => {
  const contract = new ethers.Contract(
    factoryContract,
    factoryAbi.body,
    Ethers.provider().getSigner()
  );

  const amount = ethers.utils.parseUnits(initialSupply.toString(), 18);
  contract.deployToken(tokenName, tokenSymbol, amount).then((res) => {
    setMinting(true);

    setTimeout(() => {
      setTokenName("MYTOKEN");
      setTokenSymbol("MTKN");
      setInitialSupply(10000);
      setMinting(false);
      getTokens();
    }, "20000");
  });
};

// We define all the necessary styles for our component by using styled components.
const Wrapper = styled.div`
* {
  font-family: 'system-ui','Inter', 'Space Grotesk' !important;
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
                  getTokens();
                }}
              >
                {title}
              </PillButtonActive>
            ) : (
              <PillButton
                onClick={() => {
                  setTabSelected(id);
                  getTokens();
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
        {tabSelected == "factory" ? (
          <ItemBackground>
            <ItemContainer>
              <ItemHeader>
                <ItemTitle>
                  <label>Token Factory</label>
                </ItemTitle>
              </ItemHeader>
              <ItemBody>
                {sender ? (
                  !minting ? (
                    <div class="row" style={{ color: "white" }}>
                      <div class="col-12">
                        <h3>New Token</h3>
                      </div>
                      <div class="col-6" style={{ alignContent: "end" }}>
                        <div class="row">
                          <div class="col-12">
                            <div class="mb-3">
                              <label for="symbol" class="form-label">
                                Token Name
                              </label>
                              <input
                                value={tokenName}
                                class="form-control"
                                id="symbol" // only allow for numbers
                                onChange={(e) => setTokenName(e.target.value)}
                              />
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
                      <div class="col-6">
                        <div class="mb-3">
                          <label for="symbol" class="form-label">
                            Token Symbol
                          </label>
                          <input
                            value={tokenSymbol}
                            class="form-control"
                            id="symbol"
                            placeholder="TKN"
                            onChange={(e) => setTokenSymbol(e.target.value)}
                          />
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="mb-3">
                          <label for="supply" class="form-label">
                            Token Supply
                          </label>
                          <input
                            value={initialSupply}
                            class="form-control"
                            id="supply"
                            placeholder=""
                            onChange={(e) => setInitialSupply(e.target.value)}
                          />
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="mb-3">
                          <ItemMintButton
                            onClick={async () => {
                              createToken();
                            }}
                          >
                            Create Token
                          </ItemMintButton>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      class="row"
                      style={{ display: "flex", "justify-content": "center" }}
                    >
                      <img
                        src="https://ipfs.near.social/ipfs/bafkreifotevq6g6ralhvutlcssaasa7xbfjjc6mbo5hlnvgpxxgfmwswmq"
                        style={{
                          height: "200px",
                          width: "200px",
                        }}
                      ></img>
                      <br />
                      <label
                        style={{
                          "font-size": "20px",
                          "font-weight": "400",
                          "text-align": "center",
                          color: "white",
                        }}
                      >
                        Minting...
                      </label>
                    </div>
                  )
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
                  <label>Token List</label>
                </ItemTitle>
              </ItemHeader>
              <ItemBody>
                <table className="table table-sm">
                  <thead>
                    <tr class="p-3 mb-2 bg-primary text-white text-center">
                      <th>Name</th>
                      <th>Symbol</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((data, key) => {
                      return (
                        <tr class="text-center">
                          <td>{data[1]}</td>
                          <td>{data[2]}</td>
                          <td>{data[0]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </ItemBody>
            </ItemContainer>
          </ItemBackground>
        )}
      </div>
    </Wrapper>
  </Theme>
);
