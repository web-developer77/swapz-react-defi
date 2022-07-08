import { useState } from "react"

import { UnsupportedChainIdError } from "@web3-react/core"

import { UserIcon } from "@heroicons/react/outline"

import { setupNetwork } from "../../../utils/wallet"

import Modal from "../../../components/Modal"

import { useActiveWeb3React } from "../../../hooks/useActiveWeb3React"

import ConnectWallet from "./ConnectWallet"
import WalletConnectButton from "./WalletConnectButton"

export default function WalletManagement() {
  const { account, error } = useActiveWeb3React()
  const [showWalletModal, setShowWalletModal] = useState()
  const handleShow = () => setShowWalletModal(true)
  const handleClose = () => setShowWalletModal(false)

  const activeButtonClassname =
    "bg-indigo-700 hover:bg-indigo-600 hover:bg-opacity-75 focus:ring-0 focus:ring-indigo-500 "

  let walletButton
  if (account && !error) {
    walletButton = (
      <WalletConnectButton
        className={` hover:shadow-indigo-lg group`}
        onClick={handleShow}
      >
        <div className="flex">
          <div className="flex-1 rounded-md text-white bg-opacity-30 px-0.5 py-2 group-hover:bg-opacity-10 bg-gray-900 tracking-wide font-light">
            {account.substring(0, 6)}...
            {account.substring(account.length - 4, account.length)}
          </div>
          <div className="flex-shrink rounded-md px-1 pt-1.5 pb-1 mx-2">
            <UserIcon
              className={`
                inline-block w-5 h-5 text-white opacity-70 group-hover:opacity-100
                `}
            />
          </div>
        </div>
      </WalletConnectButton>
    )
  } else if (error) {
    walletButton = (
      <WalletConnectButton
        onClick={async () => {
          if (error instanceof UnsupportedChainIdError) {
            const hasSetup = await setupNetwork()
            if (hasSetup) {
              handleShow()
            }
          } else {
            console.log(error)
          }
        }}
        className=" bg-red-600 shadow-sm hover:bg-red-700 focus:outline-none focus:ring-0"
      >
        Wrong Network
      </WalletConnectButton>
    )
  } else {
    walletButton = (
      <WalletConnectButton
        onClick={handleShow}
        className={`${activeButtonClassname} focus:ring-offset-2 shadow-indigo-sm flex-shrink rounded-md px-1 !py-2`}
      >
        <span className="px-2">Connect Wallet</span>
      </WalletConnectButton>
    )
  }

  return (
    <>
      <div className="flex items-center">{walletButton}</div>
      <Modal isOpen={showWalletModal} onClose={handleClose}>
        <ConnectWallet onClose={handleClose} />
      </Modal>
    </>
  )
}
