// Smart contract address (Aurora Testnet)
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
  inputTokenId: 0,
  tokenId: 0,
  isBusy: false,
  isPlay: false,
  error: "",
  pet: null,
});

// Verify that we are login
if (state.sender === undefined) {
  const accounts = Ethers.send("eth_requestAccounts", []);
  if (accounts.length) {
    State.update({ sender: accounts[0] });
  }
}

// Method to get user account
const getSender = () => {
  return !state.sender
    ? ""
    : state.sender.substring(0, 6) +
        "..." +
        state.sender.substring(state.sender.length - 4, state.sender.length);
};

// We make the conversion of information from the NFT
const _castData = (data) => {
  console.log(data);
  return {
    tokenId: data[0],
    image: data[1],
    name: data[2],
    happiness: data[3].toNumber(),
    hunger: data[4].toNumber(),
    sleep: data[5].toNumber(),
    currentActivity: data[6],
    isHungry: data[7],
    isSleepy: data[8],
    isBored: data[9],
  };
};

// Method to get NFT information
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
    console.log(res);
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

// Methods to obtain the NFT image depending on its status
const _getCurrentImg = (petInfo) => {
  if (petInfo.isHungry) {
    return _getIsHungryImg(petInfo.image);
  } else if (petInfo.isSleepy) {
    return _getIsSleepyImg(petInfo.image);
  } else if (petInfo.isBored) {
    return _getIsBoredImg(petInfo.image);
  } else if (!petInfo.isHungry && !petInfo.isSleepy && !petInfo.isBored) {
    return _getIdleImg(petInfo.image);
  }
};

const _getIdleImg = (img) => {
  switch (img) {
    case "https://pin.ski/3Jjp95g":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Fuego-Idle.gif";
    case "https://pin.ski/3NwRR57":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Planta-Idle.gif";
    case "https://pin.ski/3JfJ1X6":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Agua-Idle.gif";
  }
};

const _getPlayImg = (img) => {
  switch (img) {
    case "https://pin.ski/3Jjp95g":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Play.gif";
    case "https://pin.ski/3NwRR57":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Play.gif";
    case "https://pin.ski/3JfJ1X6":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Play.gif";
  }
};

const _getEatImg = (img) => {
  switch (img) {
    case "https://pin.ski/3Jjp95g":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Fuego-Eat.gif";
    case "https://pin.ski/3NwRR57":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Planta-Eat.gif";
    case "https://pin.ski/3JfJ1X6":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Agua-Eat.gif";
  }
};

const _getSleepImg = (img) => {
  switch (img) {
    case "https://pin.ski/3Jjp95g":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Fuego-Sleep.gif";
    case "https://pin.ski/3NwRR57":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Planta-Sleep.gif";
    case "https://pin.ski/3JfJ1X6":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Agua-Sleep.gif";
  }
};

const _getIsBoredImg = (img) => {
  switch (img) {
    case "https://pin.ski/3Jjp95g":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Fuego-Bored.gif";
    case "https://pin.ski/3NwRR57":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Planta-Bored.gif";
    case "https://pin.ski/3JfJ1X6":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Agua-Bored.gif";
  }
};

const _getIsHungryImg = (img) => {
  switch (img) {
    case "https://pin.ski/3Jjp95g":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Fuego-Hungry.gif";
    case "https://pin.ski/3NwRR57":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Planta-Hungry.gif";
    case "https://pin.ski/3JfJ1X6":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Agua-Hungry.gif";
  }
};

const _getIsSleepyImg = (img) => {
  switch (img) {
    case "https://pin.ski/3Jjp95g":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Fuego-Sleepy.gif";
    case "https://pin.ski/3NwRR57":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Planta-Sleepy.gif";
    case "https://pin.ski/3JfJ1X6":
      return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Agua-Sleepy.gif";
  }
};

// Method to play
const play = () => {
  const contract = new ethers.Contract(
    virtualPetContract,
    virtualPetAbi.body,
    Ethers.provider().getSigner()
  );
  contract.play(state.tokenId).then((res) => {
    State.update({
      isBusy: true,
      isPlay: true,
    });
  });
};

// Method to eat
const eat = () => {
  const contract = new ethers.Contract(
    virtualPetContract,
    virtualPetAbi.body,
    Ethers.provider().getSigner()
  );

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

// Method to sleep
const sleep = () => {
  const contract = new ethers.Contract(
    virtualPetContract,
    virtualPetAbi.body,
    Ethers.provider().getSigner()
  );

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

// Method to back menu
const back = () => {
  State.update({
    tokenId: 0,
    pet: null,
  });
};

// Method to select random game
const getGame = () => {
  return Math.floor(Math.random() * 2);
};

// Méthod to finish playing
const onFinish = () => {
  State.update({ isPlay: false });
  getNft();
};

// Definition of all styles used in the component
const ItemBackground = styled.div`
        width: 100%;
        //height: 100vh;
        display: flex;
        justify-content: center;
        margin-bottom: -50px;
        //background-image: url('https://pin.ski/444ghZP');
        background-repeat: no-repeat;
        background-size: cover;
        `;

const ItemContainer = styled.div`
        margin-top: 30px;
        box-sizing: border-box;
        min-width: 500px;
        max-width: 600px;
        width: 100%;
        padding: 0px 32px;
        position: relative;
        `;

const ItemTitle = styled.h3`
        font-weight: 900;
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

const ItemBodySelect = styled.div`
        font-weight: 400;
        font-size: 1em;
        line-height: 1.6em;
        border-radius: 0px 0px 20px 20px;
        margin: -20px 0px 0px;
        padding-inline: 10px;
        box-shadow: none;
        background-image: url('https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/background.png');
        background-repeat: no-repeat;
        background-size: cover;        
        color: #feb75b;
        min-height: 500px;
        max-height: auto;
        border: solid 5px;
        `;

const ItemBodyPlay = styled.div`
        font-weight: 400;
        font-size: 1em;
        line-height: 1.6em;
        border-radius: 0px 0px 20px 20px;
        margin: -20px 0px 0px;
        padding-inline: 10px;
        box-shadow: none;
        background-image: url('https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/backgorund-play.png');
        background-repeat: no-repeat;
        background-size: cover;        
        color: #feb75b;
        min-height: 500px;
        max-height: auto;
        border: solid 5px;
        `;

const ItemPetsSection = styled.div`
        gap: 3rem  7rem !important;
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fit, 160px);
        justify-content: center;
        min-height: 500px;
        max-height: 550px;
        align-content: end;
        `;

const ItemPet = styled.div`
    display: flex !important;
    width: 100%;
    display: flex !important;
    justify-content: center;
    cursor: pointer;
  `;
const ItemPetAction = styled.div`
    gap: 0.25rem !important;
    padding: 1rem !important;
    flex-direction: column !important;
    display: flex !important;
    border: solid 3px;
    border-radius: 20px;
    color: black;
    background: rgb(0 0 0 / 40%);
    align-items: center;
    cursor: pointer;
  `;
const ItemPetImg = styled.img`
    height: 400px;
  `;

const ItemMintButton = styled.button`
        background: #f54866;
        color: white;
        font-weight: 700;
        padding: 10px 15px;
        border-radius: 1rem;
        border: none;
        font-size: 14px;
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

// Render of the component where the necessary methods to interact with the NFT are called
// along with the implementation of each of the previously defined styles.
return (
  <Theme>
    <ItemBackground>
      <ItemContainer>
        <ItemHeader>
          <ItemTitle class="row">
            <div class="col-4" style={{ "text-align": "left" }}>
              <ItemImage src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/icon.png"></ItemImage>
            </div>
            <div
              class="col-4"
              style={{
                "text-shadow":
                  "black 1px 0px 0px, black 0px 1px 0px, black -1px 0px 0px, black 0px -1px 0px",
              }}
            >
              {state.pet.name}
            </div>
            <div class="col-4" style={{ "text-align": "right" }}>
              {state.sender ? (
                !state.pet ? (
                  <a href="#/burrito-pets.near/widget/Burrito-Pets-Mint">
                    <ItemMintButton
                      onClick={async () => {
                        mint();
                      }}
                    >
                      Mint Burrito
                    </ItemMintButton>
                  </a>
                ) : (
                  <ItemMintButton
                    onClick={async () => {
                      back();
                    }}
                  >
                    Back
                  </ItemMintButton>
                )
              ) : null}
            </div>
          </ItemTitle>
        </ItemHeader>
        {state.sender ? (
          !state.pet ? (
            <ItemBodySelect>
              <div class="m-5">
                <div style={{ "text-align": "center" }}>
                  <img
                    src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/find.png"
                    style={{
                      height: "230px",
                      background: "#ffe5bc",
                      "border-radius": "10px",
                    }}
                  ></img>
                </div>
                <br />
                <div class="container">
                  <div class="row justify-content-center">
                    <div class="col-4">
                      <input
                        placeholder="Token Id"
                        onChange={(e) =>
                          State.update({ inputTokenId: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <br />
                  <div style={{ "text-align": "center" }}>
                    <ItemMintButton
                      onClick={async () => {
                        getNft();
                      }}
                    >
                      Get NFT
                    </ItemMintButton>
                  </div>
                  <div style={{ "text-align": "center" }}>{state.error}</div>
                </div>
              </div>
            </ItemBodySelect>
          ) : (
            <div
              style={{
                background: "rgb(242, 167, 115)",
                "border-radius": "20px",
              }}
            >
              <ItemBodyPlay>
                <div
                  class="row"
                  style={{
                    "text-align": "center",
                    background: "rgb(242, 167, 115)",
                    "margin-inline": "-10px",
                    "border-radius": "1px 1px 0px 0px",
                  }}
                >
                  <div
                    class="col-4"
                    style={{
                      color: "black",
                      display: "flex",
                      "justify-content": "center",
                      "align-items": "center",
                    }}
                  >
                    <img
                      style={{ height: "50px", "margin-right": "10px" }}
                      src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/happy.png"
                    ></img>
                    <label style={{ "font-weight": "900" }}>
                      {state.pet.happiness}
                    </label>
                  </div>
                  <div
                    class="col-4"
                    style={{
                      color: "black",
                      display: "flex",
                      "justify-content": "center",
                      "align-items": "center",
                    }}
                  >
                    <img
                      style={{ height: "50px", "margin-right": "10px" }}
                      src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/eat.png"
                    ></img>
                    <label style={{ "font-weight": "900" }}>
                      {state.pet.hunger}
                    </label>
                  </div>
                  <div
                    class="col-4"
                    style={{
                      color: "black",
                      display: "flex",
                      "justify-content": "center",
                      "align-items": "center",
                    }}
                  >
                    <img
                      style={{ height: "50px", "margin-right": "10px" }}
                      src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/sleep.png"
                    ></img>
                    <label style={{ "font-weight": "900" }}>
                      {state.pet.sleep}
                    </label>
                  </div>
                </div>
                <ItemPetsSection>
                  <ItemPet>
                    <div>
                      {!state.isPlay ? (
                        <ItemPetImg src={state.currentImg} />
                      ) : getGame() == 0 ? (
                        <Widget
                          src="yairnava.near/widget/Tic-Tac-Toe"
                          props={{ onFinish, isModal: true }}
                        />
                      ) : (
                        <Widget
                          src="yairnava.near/widget/Rock-Paper-Scissors"
                          props={{ onFinish, isModal: true }}
                        />
                      )}
                    </div>
                  </ItemPet>
                </ItemPetsSection>
              </ItemBodyPlay>
              <div
                style={{
                  "text-align": "center",
                  "margin-inline": "5px",
                  "margin-top": "7px",
                  "padding-bottom": "7px",
                  height: "68.33px",
                }}
              >
                {!state.isBusy ? (
                  state.pet.isHungry ? (
                    <div class="row">
                      <div class="col-4"></div>
                      <div class="col-4">
                        <ItemPetAction
                          onClick={async () => {
                            eat();
                          }}
                        >
                          <label
                            style={{
                              color: "white",
                              "font-weight": "900",
                              cursor: "pointer",
                            }}
                          >
                            Eat
                          </label>
                        </ItemPetAction>
                      </div>
                      <div class="col-4"></div>
                    </div>
                  ) : state.pet.isSleepy ? (
                    <div class="row">
                      <div class="col-4"></div>
                      <div class="col-4"></div>
                      <div class="col-4">
                        <ItemPetAction
                          onClick={async () => {
                            sleep();
                          }}
                        >
                          <label
                            style={{
                              color: "white",
                              "font-weight": "900",
                              cursor: "pointer",
                            }}
                          >
                            Sleep
                          </label>
                        </ItemPetAction>
                      </div>
                    </div>
                  ) : state.pet.isBored ? (
                    <div class="row">
                      <div class="col-4">
                        <ItemPetAction
                          onClick={async () => {
                            play();
                          }}
                        >
                          <label
                            style={{
                              color: "white",
                              "font-weight": "900",
                              cursor: "pointer",
                            }}
                          >
                            Play
                          </label>
                        </ItemPetAction>
                      </div>
                      <div class="col-4"></div>
                      <div class="col-4"></div>
                    </div>
                  ) : (
                    <div class="row">
                      <div class="col-4">
                        <ItemPetAction
                          onClick={async () => {
                            play();
                          }}
                        >
                          <label
                            style={{
                              color: "white",
                              "font-weight": "900",
                              cursor: "pointer",
                            }}
                          >
                            Play
                          </label>
                        </ItemPetAction>
                      </div>
                      <div class="col-4">
                        <ItemPetAction
                          onClick={async () => {
                            eat();
                          }}
                        >
                          <label
                            style={{
                              color: "white",
                              "font-weight": "900",
                              cursor: "pointer",
                            }}
                          >
                            Eat
                          </label>
                        </ItemPetAction>
                      </div>
                      <div class="col-4">
                        <ItemPetAction
                          onClick={async () => {
                            sleep();
                          }}
                        >
                          <label
                            style={{
                              color: "white",
                              "font-weight": "900",
                              cursor: "pointer",
                            }}
                          >
                            Sleep
                          </label>
                        </ItemPetAction>
                      </div>
                    </div>
                  )
                ) : null}
              </div>
            </div>
          )
        ) : (
          <ItemBodySelect>
            <br />
            <div style={{ "text-align": "center" }}>
              <Web3Connect
                className="ConnectButton"
                connectLabel="Connect with Web3"
              />
            </div>
          </ItemBodySelect>
        )}
      </ItemContainer>
    </ItemBackground>
  </Theme>
);
