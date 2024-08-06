# BOS + OpenSea

This repository is an example of how to implement an API to get the NFTs of famous collections in other protocols, in this case that of Bored Apes in OpenSea.

![NFTs](https://drive.google.com/uc?id=1Cdk6nVJicpt6C0iRauQKlIggNLCz4L2q)

## How to get OpenSea NFTs information in BOS?

In order to query information from famous collections in OpenSea we will make use of alchemy, an API to query information from other networks, for example Ethereum.

The following link provides information on the methods available in the API for querying information: https://docs.alchemy.com/reference/getnftsforcontract-v3

![alchemy](https://drive.google.com/uc?id=1g9Jd7vaP8eSP4pObP_HQeckgr4i2zmLK)

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

In the following example we can observe that in the URL of the api we must send the api_key and the contract of the collection to look for, both data are assigned to a property of the state of the component to be able to be making these consultations in a dynamic way and to consult any other collection. Also for this case, the method to call will be a GET and in the headers we only make reference to the fact that the content type to be used will be a json.

**Example**:
```jsx
  asyncFetch(
    "https://eth-mainnet.g.alchemy.com/nft/v3/" +
      state.api_key +
      "/getNFTsForContract?contractAddress=" +
      state.contract +
      "&withMetadata=true",
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    }
  )
    .then(({ body }) => {
      if (body) {
        State.update({
          allNFTS: body.nfts,
          init: true,
        });
      } else {
        State.update({
          allNFTS: null,
          init: true,
        });
      }
    })
    .catch((err) => console.log(err));
```

## How to test the Component?

To run this project in BOS you must run the widget (GetNFTsOpenSea.jsx) on an available BOS gateway, for example: [near.social ](https://near.social/edit)

Once the code for the widget has been added we can render it by clicking on the preview button to render the component.

![preview](https://drive.google.com/uc?id=1U1gXwajmOwhfibIS0oo9nyF6iSsAFSTn)

(This example does not have any interaction with a smart contract, so we should not use Metamak).

If we want to consult the NFTs of a collection in OpenSea we only have to introduce the smart contract in the component input, in this case the test will be done with the collection of Bored Ape Yacht Club (**0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D**)

Finally, click on **Search Collection** to execute the corresponding method and obtain the information of the NFTs of the collection entered. Each NFT will have a link to OpenSea for more details.

![preview](https://drive.google.com/uc?id=19pt3zAijOEeA5NTKtITAlkV4U0RqvYuh)

## BOS Widget

Get NFTs OpenSea: https://near.social/owa-is-bos.near/widget/BOS-OpenSea
