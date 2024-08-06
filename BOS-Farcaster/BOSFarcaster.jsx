// These lines use the useState hook to create state variables for assigning information.
const [channels, setChannels] = useState([]);

// Methd to get channel list from farcaster API
const getChannels = () => {
  asyncFetch("https://apis-bos.vercel.app/farcaster/all-channels", {
    method: "GET",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  })
    .then(({ body }) => {
      if (body) {
        setChannels(body.data.result.channels.slice(0, 50));
      }
    })
    .catch((err) => console.log(err));
};

// Get channels
useEffect(() => {
  getChannels();
}, [null]);

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
    <ItemBackground>
      <ItemContainer>
        <ItemHeader>
          <ItemTitle>
            <label>BOS + Farcaster</label>
          </ItemTitle>
        </ItemHeader>
        <ItemBody>
          <div class="row" style={{ color: "white" }}>
            <div class="col-6" style={{ alignContent: "center" }}>
              <div class="row">
                <div class="col-12">
                  <div style={{ textAlign: "center", fontSize: "35px" }}>
                    <label>Channel List</label>
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
            <div class="col-12" style={{ height: "500px", overflow: "scroll" }}>
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  "justify-content": "center",
                  "align-items": "center",
                }}
              >
                <div
                  style={{
                    marginTop: "10px",
                    display: "grid",
                    "grid-template-columns": "repeat(3, 1fr)",
                    "grid-column-gap": "10px",
                    "grid-row-gap": "10px",
                    height: "100%",
                  }}
                >
                  {channels.map((c, i) => (
                    <div>
                      <label>Chanel: {c.name}</label>
                      <br />
                      <img
                        src={c.imageUrl}
                        style={{ width: "150px", height: "150px" }}
                      />
                      <br />
                      <label>Followers: {c.followerCount}</label>
                      <br />
                      <a href={c.url} target="_blank">
                        Go to channel
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ItemBody>
      </ItemContainer>
    </ItemBackground>
  </Theme>
);
