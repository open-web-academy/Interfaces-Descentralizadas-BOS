# BOS-Farcaster

This repository is an example of how to implement Farcaster technology (a protocol for building sufficiently decentralized social networks) in BOS, in this case using the API available for channel queries.

<img src="https://drive.google.com/uc?id=1z74BSjc664S7bHWfdMmSI8Y3u_zJCmKX" width="50%">

## How to get Farcaster Channels information in BOS?

To consult the information of the channels available in farcaster, an API was implemented to obtain this information.

The following link provides information on the methods available in the API for querying information: https://docs.farcaster.xyz/reference/warpcast/api

<img src="https://drive.google.com/uc?id=18KS7Ql68hUdId7-LuOjwwjSUTWggl5Qu" width="50%">

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

In the following example we can see that we are using a different URL to the one provided by the API, this happens because BOS does not allow to make the direct call to the API due to configuration problems of the same, so a server was mounted with Node.js which will be responsible for making these requests and send them to BOS. (If you want to run this server, you will find the complete code in the BOS-API folder of this repository).

Once the information of the channels is retrieved we will proceed to assign it to a variable to later make use of the information.

**Example**:
```jsx
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
        console.log(body.data.result.channels.slice(0, 50));
      }
    })
    .catch((err) => console.log(err));
```

## How to test the Component?

To run this project in BOS you must run the widget (BOSFarcaster.jsx) on an available BOS gateway, for example: [near.social ](https://near.social/edit)

Once the code for the widget has been added we can render it by clicking on the preview button to render the component.

<img src="https://drive.google.com/uc?id=120wfDGd1Id1wy4TFWtlTFjnQ5q3lut_H" width="50%">

(This example does not have any interaction with a smart contract, so we should not use Metamak).

When you open the component, it will automatically query the information of the channels available in farcaster through the use of the API, each channel includes the link to go to farcaster and view the channel.

<img src="https://drive.google.com/uc?id=1nwLx8g4RJkwJd4ST72dzJ4VYGqEzizMe" width="50%">

## BOS Widget

Farcaster: https://near.social/owa-is-bos.near/widget/BOS-Farcaster
