import { useState } from "react";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { formatBNToString } from "../../../utils";

import { useActiveWeb3React } from "../../../hooks/useActiveWeb3React";
import { useTokenBalance } from "../../../hooks/useTokenBalances";
import { useSwapOut } from "../../../hooks/useSwapOut";

import Grid from "../../../components/tailwind/Grid";

import BaseButton from "../../../components/BaseButton";
import InfoListItem from "../../../components/InfoListItem";
import LabelWrapper from "../../../components/LabelWrapper";
import InteractiveInputRow from "../../../components/InteractiveInputRow";

export default function FinishingWithdraw({
  amount,
  setAmount,
  coinAnyswapInfo,
  assetFromBridge,
  destinationNetwork,
}) {
  const { account, chainId } = useActiveWeb3React();
  const swapOut = useSwapOut();
  let selectedCoinBalance =
    useTokenBalance(assetFromBridge) ?? BigNumber.from(0);

  const [address, setAddress] = useState("");

  // the below is a divine offering to lord haxor the great,
  // may he have mercy on our souls
  const { SrcToken: DestToken, DestToken: SrcToken } = coinAnyswapInfo;

  const isBsc = chainId === 56;

  return (
    <>
      <InfoListItem
        labelText={
          <LabelWrapper
            labelText={`Withdraw Amount in ${SrcToken.Symbol}`}
            content={`The amount you'd like to withdraw from ${SrcToken.Symbol} into ${DestToken.Symbol}`}
          />
        }
        content={
          <div className="-mt-6">
            <InteractiveInputRow
              balanceStr={formatBNToString(
                selectedCoinBalance,
                assetFromBridge.decimals,
                4
              )}
              onClickBalance={() => {
                setAmount(
                  formatUnits(selectedCoinBalance, assetFromBridge.decimals)
                );
              }}
              value={amount}
              placeholder={"0.0"}
              onChange={(e) => setAmount(e.target.value)}
              disabled={selectedCoinBalance.eq(0)}
              showButton={false}
            />
          </div>
        }
      />
      <InfoListItem
        labelText={
          <LabelWrapper
            labelText={`${destinationNetwork} Withdrawal Address`}
            content={`The address on the ${destinationNetwork} network you'd like to withdraw ${DestToken.Symbol} into`}
          />
        }
        content={
          <input
            className=" border border-gray-300 hover:border-gray-400 rounded-md px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 "
            value={address}
            placeholder="address..."
            onChange={(e) => setAddress(e.target.value)}
          />
        }
      />
      <Grid className="place-items-center text-center" cols={{ xs: 1 }}>
        <TimeDelayWithdraw token={DestToken} />
        <BaseButton
          className="rounded-xl py-3 px-4 w-full"
          fancy={true}
          disabled={selectedCoinBalance.eq(0) || !isBsc}
          onClick={async () => {
            await swapOut({
              fromSymbol: assetFromBridge.symbol,
              amount: parseUnits(
                amount.replace(/,/g, ""),
                assetFromBridge.decimals
              ),
              toAddress: address,
            });
          }}
        >
          {isBsc
            ? selectedCoinBalance.eq(0)
              ? `No balance for ${SrcToken.Symbol}`
              : "Redeem"
            : "Switch Network to BSC to Redeem"}
        </BaseButton>
      </Grid>
    </>
  );
}

function TimeDelayWithdraw({ token }) {
  return (
    <small className="text-gray-500 my-2">
      Your redeem will typically be credited in 10 - 20 minutes. However,
      <span className="font-medium underline">
        {" "}
        transactions over {token.BigValueThreshold} {token.Symbol} may take 12
        hours to process
      </span>
    </small>
  );
}
