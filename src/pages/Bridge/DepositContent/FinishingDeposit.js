import { useActiveWeb3React } from "../../../hooks/useActiveWeb3React";
import { useSendNativeToken } from "../../../hooks/useSendNativeToken";
import { useTokenTransfer } from "../../../hooks/useTokenTransfer";

import { parseUnits } from "@ethersproject/units";

import Grid from "../../../components/tailwind/Grid";

import BitcoinAddressQrCode from "../../../components/BitcoinAddressQrCode";
import BaseButton from "../../../components/BaseButton";
import CopyableAddress from "../../../components/CopyableAddress";
import InfoListItem from "../../../components/InfoListItem";
import LabelWrapper from "../../../components/LabelWrapper";

import YourDepositWillBeCredited from "./YourDepositWillBeCredited";

export default function FinishingDeposit({
  amount,
  setAmount,
  coinAnyswapInfo,
  assetToBridge,
}) {
  const { account, chainId } = useActiveWeb3React();
  const sendNativeToken = useSendNativeToken();
  const tokenTransfer = useTokenTransfer(assetToBridge);

  const { SrcToken } = coinAnyswapInfo;
  const isEthereumNetwork = chainId === 1;

  let content;
  let address;
  let isBtc = SrcToken.Symbol === "BTC";
  if (isBtc) {
    address = coinAnyswapInfo.info.P2shAddress;
    content = (
      <BitcoinAddressQrCode address={address} className="items-center" />
    );
  } else {
    address = SrcToken.DepositAddress;
    content = (
      <InfoListItem
        labelText={
          <LabelWrapper
            labelText={`Deposit Amount in ${SrcToken.Symbol}`}
            content={`The deposit amount in ${SrcToken.Symbol}`}
          />
        }
        content={
          <input
            className={`
              border border-gray-300 hover:border-gray-400
              rounded-md px-4 py-2
              focus:ring-indigo-500 focus:border-indigo-500
              `}
            value={amount}
            placeholder="0.0"
            onChange={(e) => setAmount?.(e.target.value)}
          />
        }
      />
    );
  }
  return (
    <>
      {!isBtc && content}
      <Grid className="place-items-center text-center" cols={{ xs: 1 }}>
        Deposit Address:
        <CopyableAddress className="inline-block ml-3" address={address} />
        {isBtc && content}
        <YourDepositWillBeCredited account={account} />
        <TimeDelayDeposit token={SrcToken} />
        {!isBtc && (
          <BaseButton
            className="rounded-xl py-3 px-4 w-full disabled:text-gray-600"
            fancy={true}
            disabled={!isEthereumNetwork}
            onClick={async () => {
              const transferArgs = {
                address: address,
                amount: parseUnits(
                  amount.replace(/,/g, ""),
                  assetToBridge.decimals
                ),
              };
              if (assetToBridge.symbol === "ETH") {
                await sendNativeToken(transferArgs);
              } else {
                await tokenTransfer(transferArgs);
              }
            }}
          >
            {isEthereumNetwork
              ? "Deposit"
              : "Switch to the Ethereum Network to use"}
          </BaseButton>
        )}
      </Grid>
    </>
  );
}

function TimeDelayDeposit({ token }) {
  return (
    <small className="text-gray-500 my-2">
      <span className="font-medium underline">
        Transactions over {token.BigValueThreshold} {token.Symbol} may take 12
        hours to process
      </span>
    </small>
  );
}
