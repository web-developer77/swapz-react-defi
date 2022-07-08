import React from "react";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";

import { injected, bsc, walletconnect } from "../../../connectors";
import { setupNetwork } from "../../../utils/wallet";

import CloseIcon from "../../icons/CloseIcon";
import metamaskLogo from "../../../assets/icons/metamask.svg";
import walletLogo from "../../../assets/icons/walletconnect.svg";
import bscLogo from "../../../assets/icons/binance.svg";

const wallets = [
  {
    name: "MetaMask",
    connector: injected,
    icon: metamaskLogo,
  },
  {
    name: "Wallet Connect",
    connector: walletconnect,
    icon: walletLogo,
  },
  {
    name: "Binance SmartChain Wallet",
    connector: bsc,
    icon: bscLogo,
  },
];

export default function ConnectWallet({ onClose }) {
  const { activate } = useWeb3React();

  return (
    <>
      <div
        className="inline-block align-bottom bg-dark-blue rounded-lg py-4 px-6 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:align-middle w-96 w-"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div>
          <div className="sm:mt-5">
            <div className="flex">
              <h3
                className="text-2xl leading-6 font-medium text-white mb-4"
                id="modal-headline"
              >
                Connect Wallet
              </h3>
              <span className="w-6 ml-auto cursor-pointer" onClick={onClose}>
                <CloseIcon />
              </span>
            </div>
            <div className="">
              <div className="flex flex-col">
                {wallets.map((wallet, index) => (
                  <button
                    className="inline-flex py-4 px-6 my-4 rounded-md mt-2 border border-solid border-gray-300 shadow-sm hover:border-gray-600"
                    key={index}
                    onClick={() => {
                      activate(wallet.connector, async (error) => {
                        if (error instanceof UnsupportedChainIdError) {
                          const hasSetup = await setupNetwork();
                          if (hasSetup) {
                            activate(wallet.connector);
                          }
                        } else {
                          console.log(error);
                        }
                      });
                      onClose();
                    }}
                  >
                    <span className="text-lg mt-0.5">{wallet.name}</span>
                    <img
                      src={wallet.icon}
                      alt="icon"
                      className="ml-auto w-8 mr-4"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
