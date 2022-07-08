import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

import { BscConnector } from "@binance-chain/bsc-connector";

import { ChainId, CHAIN_RPC } from "../constants/networks";

import { NetworkConnector } from "./NetworkConnector";

export const NETWORK_CHAIN_ID = ChainId.BSC;

export const NETWORK = new NetworkConnector({
  defaultChainId: ChainId.BSC,
  urls: CHAIN_RPC,
});

export const injected = new InjectedConnector({
  // mainnet, ropsten, rinkeby, goerli, kovan, local buidler
  // see: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
  supportedChainIds: [1, 56, 31337],
});

export const bsc = new BscConnector({ supportedChainIds: [1, 56] });

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: CHAIN_RPC,
  bridge: "https://bridge.walletconnect.org", // url should prob go somehwere
  qrcode: true,
  pollingInterval: 15000,
});
