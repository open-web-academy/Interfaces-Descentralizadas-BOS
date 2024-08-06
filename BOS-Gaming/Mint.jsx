// Smart contract address (Aurora testnet)
const virtualPetContract = "0x363a236ABea6c7d89F3E3E1A1E02C100E6FFAAF7";

// Obtaining the ABI with the list of methods available in the contract
const virtualPetAbi = fetch(
  "https://raw.githubusercontent.com/cloudmex/burritobattle-pet/main/ABI3.txt"
);

if (!virtualPetAbi.ok) {
  return "Loading";
}

// Interface creation using ethers and ABI
const iface = new ethers.utils.Interface(virtualPetAbi.body);

// State init
State.init({
  init: true,
  mintedBurritos: 0,
  burritoName: "",
  minting: false,
});

// Verify that we are login
if (state.sender === undefined) {
  const accounts = Ethers.send("eth_requestAccounts", []);
  if (accounts.length) {
    State.update({ sender: accounts[0] });
  }
}

if (state.sender && state.init) {
  const contract = new ethers.Contract(
    virtualPetContract,
    virtualPetAbi.body,
    Ethers.provider().getSigner()
  );

  // Method to get minted NFTs
  contract.getMintedTokens().then((res) => {
    State.update({
      mintedBurritos: res.toNumber(),
    });
  });
}

// Method to mint
const mint = () => {
  // We initialize the contract with ethers and put into use the contract, the ABI and the account that will sign the transactions
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

// Definition of all styles used in the component
const ItemBackground = styled.div`
        width: 100%;
        //height: 100vh;
        display: flex;
        justify-content: center;
        //background-image: url('https://pin.ski/3XjZcs8');
        background-repeat: no-repeat;
        background-size: cover;
        margin-bottom: -50px;
        `;

const ItemContainer = styled.div`
        margin-top: 30px;
        box-sizing: border-box;
        min-width: 320px;
        max-width: 560px;
        width: 100%;
        padding: 0px 32px;
        position: relative;
        `;

const ItemTitle = styled.h3`
        text-align: center;
        color: white;
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
        text-shadow: 1px 1px 2px black, 0 0 1em blue, 0 0 0.2em blue;
        text-align: center;
        color: yellow;
        margin-bottom: 5px;
        `;

const ItemHeader = styled.div`
        background: #64473f;
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
        padding-inline: 32px;
        padding-top: 32px;
        box-shadow: none;
        background: #feb75b;
        color: black;
        `;

const ItemMintNumber = styled.label`
        font-size: 20px;
        font-weight: 800;
        color: black;
        `;

const ItemMintButton = styled.button`
        background: #f54866;
        color: white;
        font-weight: 700;
        padding: 15px 20px;
        border-radius: 1rem;
        border: none;
        &:hover {
            background: rgb(146 0 0);
        }
        `;

// FETCH CSS
const cssFont = fetch(
  "https://fonts.googleapis.com/css2?family=Lexend:wght@200;300;400;500;600;700;800"
).body;
const css = fetch(
  "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/style.css"
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

// Render of the component where the necessary method to mint a new NFT is called
// along with the implementation of each of the previously defined styles.
return (
  <Theme>
    <ItemBackground>
      <ItemContainer>
        <ItemHeader>
          <ItemTitle>
            <ItemImage src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/d2c54b3423f07d0e9e22bf8aa105b12cf7973922/icon.png"></ItemImage>
            <label
              style={{
                "text-shadow":
                  "1px 0px 0px black, 0px 1px 0px black, -1px 0px 0px black, 0px -1px 0px black",
              }}
            >
              Burrito Virtual Pets
            </label>
          </ItemTitle>
        </ItemHeader>
        <ItemBody>
          {state.sender ? (
            <div class="container text-center">
              <div>
                <ItemMintNumber>
                  Last Burrito Id: {state.mintedBurritos}
                </ItemMintNumber>
              </div>
              <br />
              {!state.minting ? (
                <div>
                  <div>
                    <input
                      placeholder="Burrito name"
                      value={state.burritoName}
                      onChange={(e) =>
                        State.update({ burritoName: e.target.value })
                      }
                    />
                  </div>
                  <br />
                  <div>
                    <ItemMintButton
                      onClick={async () => {
                        mint();
                      }}
                    >
                      Mint Burrito
                    </ItemMintButton>
                    <br /> <br />
                    <div>
                      <a
                        href="#/burrito-pets.near/widget/Burrito-Pets-Interact"
                        style={{ color: "black" }}
                      >
                        Go to Play
                      </a>
                    </div>
                    <br />
                    <div>
                      <label style={{ color: "black", "font-weight": "500" }}>
                        {" "}
                        Burrito’s contract to add your NFTs to wallet
                        0xc533FCB43DEf76ac1A175Ee6beB0Ad7d39469220
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <img
                    src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/d2c54b3423f07d0e9e22bf8aa105b12cf7973922/loading.gif"
                    style={{
                      height: "169px",
                      background: "rgb(255, 229, 188)",
                      "border-radius": "10px",
                    }}
                  ></img>
                  <br />
                  <label style={{ "font-size": "20px", "font-weight": "400" }}>
                    Minting...
                  </label>
                </div>
              )}
              <br />
            </div>
          ) : (
            <div style={{ "text-align": "center" }}>
              <Web3Connect
                className="ConnectButton"
                connectLabel="Connect with Web3"
              />
            </div>
          )}
        </ItemBody>
      </ItemContainer>
    </ItemBackground>
  </Theme>
);
