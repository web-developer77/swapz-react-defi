import { useState } from "react";

import {
  getNetworkButtonBgClassName,
  getNetworkTextColorContrast,
} from "../../../utils/styles/networks";
import Modal from "../../../components/Modal";

import { CHAIN_INFO_MAP } from "../../../constants/networks";

import { useActiveWeb3React } from "../../../hooks/useActiveWeb3React";
import SelectChainButton from "./SelectChainButton";
import SelectChain from "./SelectChain";

export default function ChainManagement() {
  const { account, error, chainId } = useActiveWeb3React();
  const [showModal, setShowModal] = useState();

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const activeButtonClassname =
    "bg-indigo-700 hover:bg-indigo-600 hover:bg-opacity-75 focus:ring-0 focus:ring-indigo-500 ";

  const { chainSymbol, chainImg } = CHAIN_INFO_MAP[chainId] ?? {};

  const chainClassName = getNetworkButtonBgClassName(chainSymbol);

  let chainButton;
  if (account && !error) {
    chainButton = (
      <SelectChainButton
        className={`
          ${chainClassName}
          hover:shadow-indigo-lg
        `}
        onClick={handleShow}
      >
        <div>
          <div className="inline-block">
            <div className="text-sm text-gray-100 w-full">
              <div className="-top-2 inline-block">
                <span className="opacity-90 mr-1.5">Connected to</span>
                <span className={getNetworkTextColorContrast(chainId)}>
                  {chainSymbol}
                </span>{" "}
              </div>
              <img
                src={chainImg}
                className="inline-block w-6 h-6 rounded-md ml-2 -mt-0.5 float-right opacity-80"
                alt="chain-img"
              />
            </div>
          </div>
        </div>
      </SelectChainButton>
    );
  } else {
    chainButton = (
      <SelectChainButton
        onClick={handleShow}
        className={`${activeButtonClassname} focus:ring-offset-2 shadow-indigo-sm `}
      >
        No Chain Selected
      </SelectChainButton>
    );
  }

  return (
    <>
      <div className="flex items-center">{chainButton}</div>
      <Modal isOpen={showModal} onClose={handleClose}>
        <SelectChain onClose={handleClose} />
      </Modal>
    </>
  );
}
