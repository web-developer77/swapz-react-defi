import {
  ChainId,
  CHAIN_PARAMS,
  CHAIN_INFO_MAP,
} from "../../../constants/networks";

import {
  getNetworkButtonBgClassName,
  getNetworkTextColor,
  getNetworkButtonBorderClassName,
} from "../../../utils/styles/networks";

import { useActiveWeb3React } from "../../../hooks/useActiveWeb3React";

import CloseIcon from "../../icons/CloseIcon";
import BaseButton from "../../../components/BaseButton";

export default function SelectChain({ onClose }) {
  const { chainId, library, account } = useActiveWeb3React();
  const { chainName } = CHAIN_PARAMS[chainId];

  return (
    <div
      className="inline-block align-bottom bg-dark-blue rounded-lg pt-2 px-6 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:align-middle w-96 w-"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div>
        <div className="">
          <div className="flex">
            <h3 className="pt-4 mb-3" id="modal-headline">
              <p className="text-2xl leading-6 font-medium text-white mb-3 ">
                Select Network
              </p>
              <p className="text-coolGray-700">
                Currently on{" "}
                <b className={getNetworkTextColor(chainId)}>{chainName} </b>
              </p>
            </h3>

            <div
              className=" w-16 ml-auto cursor-pointer pt-1.5  -mr-2"
              onClick={onClose}
            >
              <div className="float-right hover:bg-coolGray-50 rounded-full p-1.5 group">
                <CloseIcon className="text-gray-600 group-hover:text-gray-900" />
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-3 overflow-y-auto py-2">
            {[ChainId.ETH, ChainId.BSC].map((itemChainId, i) => {
              const isCurrentChain = chainId === itemChainId;
              function onClick() {
                const params = CHAIN_PARAMS[itemChainId];
                library?.send("wallet_addEthereumChain", [params, account]);
              }
              return (
                <SelectSpecificNetworkButton
                  chainId={itemChainId}
                  isCurrentChain={isCurrentChain}
                  onClick={
                    !isCurrentChain ? onClick : () => console.log("INCEPTION")
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectSpecificNetworkButton({ chainId, isCurrentChain, onClick }) {
  const { chainImg, chainSymbol } = CHAIN_INFO_MAP[chainId];
  const { chainName } = CHAIN_PARAMS[chainId];

  const borderClassName = getNetworkButtonBorderClassName(chainSymbol);
  let activeClassName;
  if (isCurrentChain) {
    activeClassName = getNetworkButtonBgClassName(chainSymbol);
  } else {
    //bg-dark-800 hover:bg-dark-700
    activeClassName = "";
  }

  return (
    <BaseButton
      outline={!isCurrentChain}
      className={`flex items-center w-full rounded-md !p-4 cursor-pointer ${borderClassName} ${activeClassName}`}
      onClick={onClick}
    >
      <img
        src={chainImg}
        alt="Switch Network"
        className="rounded-md mr-2 w-6 h-6"
      />
      <div className="text-primary font-medium">{chainName}</div>
    </BaseButton>
  );
}
