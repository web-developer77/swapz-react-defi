import { useState } from "react";
import { useActiveWeb3React } from "../../../hooks/useActiveWeb3React";
import { useAnyswapData } from "../../../hooks/useAnyswapData";

import Grid from "../../../components/tailwind/Grid";

import InfoListItem from "../../../components/InfoListItem";
import CurrencySymbol from "../../../components/CurrencySymbol";
import LabelWrapper from "../../../components/LabelWrapper";
import BackButton from "../../../components/BackButton";

import NerveLogoSvg from "../../../components/icons/NerveLogoSvg";

import FinishingWithdraw from "./FinishingWithdraw";

export default function FeeAndConfirm({
  assetToBridge,
  assetFromBridge,
  onClickBack,
  destinationNetwork,
}) {
  const { account } = useActiveWeb3React();
  const anyswapData = useAnyswapData();

  const coinAnyswapInfo = anyswapData?.[assetToBridge.symbol];

  const [amount, setAmount] = useState("");

  let sectionContent;
  let finishingDepositContent;
  if (account) {
    if (coinAnyswapInfo) {
      sectionContent = (
        <FeeAndConfirmContent coinAnyswapInfo={coinAnyswapInfo} />
      );
      finishingDepositContent = (
        <FinishingWithdraw
          amount={amount}
          setAmount={setAmount}
          coinAnyswapInfo={coinAnyswapInfo}
          assetToBridge={assetToBridge}
          assetFromBridge={assetFromBridge}
          destinationNetwork={destinationNetwork}
        />
      );
    } else {
      sectionContent = (
        <Grid className="w-full place-items-center" cols={{ xs: 1 }}>
          <NerveLogoSvg className="animate-spin place-self-center" />
        </Grid>
      );
    }
  } else {
    sectionContent = <div>Please connect wallet</div>;
  }

  return (
    <div className="w-full">
      <div className="text-center  py-2 place-items-center prose">
        <BackButton onClick={onClickBack} />
        <div className="px-3">
          Confirm Redeem
          {/* <div className='-mt-2'>
            <small className='text-gray-500'>We hate them too</small>
          </div> */}
        </div>
      </div>
      {sectionContent}
      {finishingDepositContent}
    </div>
  );
}

function FeeAndConfirmContent({ coinAnyswapInfo }) {
  let { SrcToken: DestToken, DestToken: SrcToken } = coinAnyswapInfo;

  return (
    <div>
      <InfoListItem
        labelText={
          <LabelWrapper
            labelText="Maximum Redeem"
            content={`The maximum amount of ${SrcToken.Symbol} you can redeem`}
          />
        }
        content={
          <CurrencySymbol symbol={SrcToken.Symbol}>
            {SrcToken.MaximumSwap}
          </CurrencySymbol>
        }
      />
      <InfoListItem
        labelText={
          <LabelWrapper
            labelText="Minimum Redeem"
            content={`The minimum amount of ${SrcToken.Symbol} you can redeem`}
          />
        }
        content={
          <CurrencySymbol symbol={SrcToken.Symbol}>
            {SrcToken.MinimumSwap}
          </CurrencySymbol>
        }
      />
      <InfoListItem
        labelText={
          <LabelWrapper
            labelText="Redeem Fee Rate"
            content={`
              The expected redeem fee in ${SrcToken.Symbol} from swapping ${SrcToken.Symbol}
              to ${DestToken.Symbol}. `}
          />
        }
        content={`${(SrcToken.SwapFeeRate * 100).toFixed(2)}%`}
      />
      <InfoListItem
        labelText={
          <LabelWrapper
            labelText="Maximum Redeem Fee"
            content={`The maximum redeem fee you will be charged.`}
          />
        }
        content={
          <CurrencySymbol symbol={SrcToken.Symbol}>
            {SrcToken.MaximumSwapFee}
          </CurrencySymbol>
        }
      />
      <InfoListItem
        labelText={
          <LabelWrapper
            labelText="Minimum Redeem Fee"
            content={`The minimum redeem fee you will be charged.`}
          />
        }
        content={
          <CurrencySymbol symbol={SrcToken.Symbol}>
            {SrcToken.MinimumSwapFee}
          </CurrencySymbol>
        }
      />
    </div>
  );
}
