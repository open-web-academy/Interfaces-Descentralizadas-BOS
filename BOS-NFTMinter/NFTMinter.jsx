// Address of the smart contract.
const factoryContract = "0x80fe30fc135dD9538fAE625a8761cCe5A51De69a";

// URL to the JSON file containing the ABI of the contract.
const nftMinterAbi = fetch(
  "https://raw.githubusercontent.com/open-web-academy/BOS-NFTMinter/main/NFTMinterABI.txt"
);

if (!nftMinterAbi.ok) {
  return "Loading";
}

// These lines use the useState hook to create state variables for assigning information.
const [sender, setSender] = useState(null);
const [tokens, setTokens] = useState([]);

const [title, setTitle] = useState("Example title");
const [description, setDescription] = useState("Example description");
const [receiver, setReceiver] = useState(
  "0x34149390029Bbf4f4D9E7AdEa715D7055e145C05"
);
const [minting, setMinting] = useState(false);
const [tabSelected, setTabSelected] = useState("mint");

//We define the navigation tabs of the component
const pills = [
  { id: "mint", title: "Mint" },
  { id: "nftList", title: "NFT List" },
];

// Validation to obtain the account we are connected to the component with
if (!sender) {
  const accounts = Ethers.send("eth_requestAccounts", []);
  if (accounts.length) {
    setSender(accounts[0]);
  }
}

// Method to obtain the tokens created in the smart contract.
const getTokens = () => {
  const contract = new ethers.Contract(
    factoryContract,
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

useEffect(() => {
  if (sender) {
    getTokens();
  }
}, []);

// Method to crate a new tokens in the smart contract.
const createToken = () => {
  const contract = new ethers.Contract(
    factoryContract,
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
        {tabSelected == "mint" ? (
          <ItemBackground>
            <ItemContainer>
              <ItemHeader>
                <ItemTitle>
                  <label>Create NFT</label>
                </ItemTitle>
              </ItemHeader>
              <ItemBody>
                {sender ? (
                  !minting ? (
                    <div class="row" style={{ color: "white" }}>
                      <div class="col-12">
                        <Card className="d-flex flex-column align-items-center">
                          {!!state.image.cid ?? (
                            <ImageCard>
                              <img
                                src={`https://ipfs.io/ipfs/` + state.image.cid}
                                alt="uploaded image"
                                width="100%"
                                height="100%"
                                className="rounded-3"
                              />
                            </ImageCard>
                          )}
                          <div>
                            <IpfsImageUpload
                              image={state.image}
                              className="btn border-0 rounded-3 uploadIMG"
                            />
                          </div>
                        </Card>
                      </div>
                      <div class="col-6" style={{ alignContent: "end" }}>
                        <div class="row">
                          <div class="col-12">
                            <div class="mb-3">
                              <label for="symbol" class="form-label">
                                Title
                              </label>
                              <input
                                value={title}
                                class="form-control"
                                onChange={(e) => setTitle(e.target.value)}
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
                            Description
                          </label>
                          <input
                            value={description}
                            class="form-control"
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="mb-3">
                          <label for="supply" class="form-label">
                            Receiver
                          </label>
                          <input
                            value={receiver}
                            class="form-control"
                            placeholder=""
                            onChange={(e) => setReceiver(e.target.value)}
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
                            Mint
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
                  <label>NFT List</label>
                </ItemTitle>
              </ItemHeader>
              <ItemBody>
                <table className="table table-sm">
                  <thead>
                    <tr class="p-3 mb-2 bg-primary text-white text-center">
                      <th>Id</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Img</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((data, key) => {
                      return (
                        <tr class="text-center">
                          <td>{key}</td>
                          <td>{data[0]}</td>
                          <td>{data[1]}</td>
                          <td>
                            <img
                              src={"https://ipfs.near.social/ipfs/" + data[2]}
                              style={{
                                height: "100px",
                                width: "100px",
                              }}
                            ></img>
                          </td>
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
