# BOS + TheGraph

This repository is an example for the implementation of The Graph, a decentralized protocol that allows indexing and querying blockchain data.

In this case its implementation with BOS consists of retrieving the NFTs listed in a Marketplace whose information is indexed in TheGraph.

![NFTs](https://drive.google.com/uc?id=1g_8K90qRKjCGZeenBwYnYbzbTXbmKdo3)

## How to implement TheGraph in BOS?

Making queries to The Graph is very simple, we only have to make a call from BOS to the API using asyncFetch to the URL of the subgraph that contains the information.

In the following example we will use the following subgraph: https://thegraph.com/hosted-service/subgraph/devscloudmex/nativonft

Finally we must send the query with the parameters that we want to obtain from the subgraph, in the previous link we can generate the queries to test and add them in the API query in BOS.

![TheGraph](https://drive.google.com/uc?id=10gTvJH3Idnc8JFucFG3upmygVYN0bpMr)

To get information from an API we only have to make a call from BOS using asyncFetch to the corresponding URL.

The following is the basic structure of an asyncFetch showing its main elements:
  * **URL_API**: address of the API to be consumed.
  * **method**: http method to be used (GET, POST, PUT or DELETE).
  * **headers**: additional metadata that is sent to the API to help the server understand what type of request is being sent.
  * **body**: information submitted in the body of the request.

**Structure of asyncFetch**:
```jsx
  asyncFetch(
    "URL_API",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({ }),
    }
  )
    .then(({ body }) => { })
    .catch((err) => { });
```

In the following example we can see that before making the call to the asyncFetch and obtain the information from the API, we first create a variable where we store the query with each of the fields of the information to query, and then send this information through a POST method to the URL of the API.

**Example**:
```jsx
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
```

## How to test the Component?

To run this project in BOS you must run the widget (GetNFTsTheGraph.jsx) on an available BOS gateway, for example: [near.social ](https://near.social/edit)

Once the code for the widget has been added we can render it by clicking on the preview button to render the component.

![preview](https://drive.google.com/uc?id=1K0WuCC3ZcCNQkIF3DX1YdygAjDhrpn0V)

(This example does not have any interaction with a smart contract, so we should not use Metamak).

When executing this component, the method to query the subgraph information and in this case to obtain the NFTs information will be automatically executed.

## BOS Widget

Get NFTs TheGraph: https://near.social/owa-is-bos.near/widget/BOS-TheGraph
