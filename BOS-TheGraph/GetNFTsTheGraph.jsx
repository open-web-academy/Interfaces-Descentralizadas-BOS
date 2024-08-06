// This line uses the useState hook to create a state variable nftData initialized as an empty array, 
// and a function setNFTData to update this state.
const [nftData, setNFTData] = useState([]);

// Here, useEffect hook is used. 
// It executes a block of code after the component is mounted. 
// We make the API call to obtain the information of the corresponding subgraph.
useEffect(() => {
  var query = `query {
                        tokens{
                                id
                                title
                                owner_id
                                media
                                owner_id
                            }
                        }`;

  asyncFetch("https://api.thegraph.com/subgraphs/name/devscloudmex/nativonft", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: query,
    }),
  })
    .then(({ body }) => {
      setNFTData(body.data.tokens);
    })
    .catch((err) => console.log(err));
}, []);

// This line defines a constant loadingUrl which holds a URL to an image used as a loading indicator if the image for a token is not available. 
// It uses a default value if props.loadingUrl is not provided.
const loadingUrl =
  props.loadingUrl ??
  "https://ipfs.near.social/ipfs/bafkreidoxgv2w7kmzurdnmflegkthgzaclgwpiccgztpkfdkfzb4265zuu";

// Finally we render the component where we iterate the nftData array to show the information of each of the tokens.
return (
  <div>
    <h1>BOS + TheGraph</h1>
    {nftData && (
      <>
        <div
          style={{
            marginTop: "10px",
            display: "grid",
            "grid-template-columns": "repeat(3, 1fr)",
            "grid-column-gap": "10px",
            "grid-row-gap": "10px",
          }}
        >
          {nftData &&
            nftData.map(
              (nft, i) =>
                nft.media && (
                  <div>
                    <img
                      src={
                        nft.media !== null
                          ? "https://ipfs.near.social/ipfs/" + nft.media
                          : loadingUrl
                      }
                      style={{ width: "150px", height: "150px" }}
                    />
                    <br />
                    <label>
                      <span style={{ fontWeight: "bold" }}>Token Id:</span>
                      {nft.id}
                    </label>
                    <br />
                    <label>
                      <span style={{ fontWeight: "bold" }}>Title:</span>
                      {nft.title}
                    </label>
                    <label>
                      <span style={{ fontWeight: "bold" }}>Owner:</span>
                      {nft.owner_id}
                    </label>
                  </div>
                )
            )}
        </div>
      </>
    )}
  </div>
);
