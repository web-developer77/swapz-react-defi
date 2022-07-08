import { ChainId, CHAIN_RPC } from "../constants/networks";
import { getExplorerUrl } from "../utils/urls";

export const setupNetwork = async () => {
  const provider = window.ethereum;

  if (provider) {
    const chainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10);

    try {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${chainId.toString(16)}`,
            chainName: "Binance Smart Chain",
            nativeCurrency: {
              name: "BNB",
              symbol: "BNB",
              decimals: 18,
            },
            rpcUrls: [CHAIN_RPC.BSC],
            blockExplorerUrls: [getExplorerUrl()],
          },
        ],
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  } else {
    console.error(
      "Can't setup the BSC network on metamask because window.ethereum is undefined"
    );
    return false;
  }
};

/* Add NRV to MetaMask */
export const addTokenToWallet = async (token, image = "") => {
  const provider = window.ethereum;

  if (provider) {
    try {
      const address = token.addresses[ChainId.BSC];
      let symbol = token.symbol;
      /* the below is some wack fix for rpc issue
      on char length im too lazy to fix correctly */
      if (token.symbol?.length > 6) {
        symbol = token.symbol.split("-").join("");
        if (symbol?.length > 6) {
          symbol = symbol.slice(0, 6);
        }
      }
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: address, // The address that the token is at.
            symbol: symbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: token.decimals, // The number of decimals in the token
            image: image, // A string url of the token logo
          },
        },
      });

      if (wasAdded) {
        console.log("Thanks for your interest!");
      } else {
        console.log("Your loss!");
      }
    } catch (error) {
      console.log(error);
    }
  }
};
