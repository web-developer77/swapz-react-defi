import { useEffect } from "react";
import { useToasts } from "react-toast-notifications";

import { INVERTED_CHAIN_ID_MAP } from "../../constants/networks";

export default function StandardPageContainer({ children }) {
  const { addToast } = useToasts();

  function accountChangeEvent(accounts) {
    const accountId = accounts[0];

    const toastContent = (
      <>
        Switched account to
        <br />
        <span className="break-all">{accountId}</span>
      </>
    );

    addToast(toastContent, {
      appearance: "info",
      autoDismiss: true,
    });
  }

  function chainChangeEvent(hexChainId) {
    const chainId = parseInt(hexChainId, 16);

    const rawChainName = INVERTED_CHAIN_ID_MAP[chainId];
    let chainName;
    if (rawChainName === "BSC") {
      chainName = "BSC";
    } else if (rawChainName === "ETH") {
      chainName = "Ethereum";
    } else {
      chainName = rawChainName;
    }

    const toastContent = (
      <>
        Switched to the <b>{chainName}</b> chain
      </>
    );

    addToast(toastContent, {
      appearance: "info",
      autoDismiss: true,
    });
  }

  function walletActionCheckEffect() {
    window.ethereum?.on("accountsChanged", accountChangeEvent);
    window.ethereum?.on("chainChanged", chainChangeEvent);
  }

  useEffect(walletActionCheckEffect, []);

  return (
    <main className="flex-1 relative z-0 overflow-y-auto h-full focus:outline-none text-white">
      <div className="2xl:w-3/4 items-center mt-4 sm:mt-6 mx-auto px-4 sm:px-8 md:px-12 py-8">
        {children}
      </div>
    </main>
  );
}
