import { useState } from "react";
import { useActiveWeb3React } from "../../../hooks/useActiveWeb3React";
import { useAnyswapData } from "../../../hooks/useAnyswapData";

import Grid from "../../../components/tailwind/Grid";

import InfoListItem from "../../../components/InfoListItem";
import CurrencySymbol from "../../../components/CurrencySymbol";
import LabelWrapper from "../../../components/LabelWrapper";
import BackButton from "../../../components/BackButton";

import NerveLogoSvg from "../../../components/icons/NerveLogoSvg";

import FinishingDeposit from "./FinishingDeposit";

export default function FeeAndConfirm({ assetToBridge, onClickBack }) {
  const { account } = useActiveWeb3React();
  const anyswapData = useAnyswapData();
  const [amount, setAmount] = useState("");

  const coinAnyswapInfo = anyswapData?.[assetToBridge.symbol];

  let sectionContent;
  let finishingDepositContent;
  if (account) {
    if (coinAnyswapInfo) {
      sectionContent = (
        <FeeAndConfirmContent coinAnyswapInfo={coinAnyswapInfo} />
      );
      finishingDepositContent = (
        <FinishingDeposit
          amount={amount}
          setAmount={setAmount}
          coinAnyswapInfo={coinAnyswapInfo}
          assetToBridge={assetToBridge}
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
        <div className="px-3">Confirm Deposit</div>
      </div>
      {sectionContent}
      {finishingDepositContent}
    </div>
  );
}

function FeeAndConfirmContent({ coinAnyswapInfo }) {
  const { SrcToken, DestToken } = coinAnyswapInfo;

  return (
    <div>
      <InfoListItem
        labelText={
          <LabelWrapper
            labelText="Deposit Asset"
            content={`Deposit ${SrcToken.Symbol} to bridge`}
          />
        }
        content={<>{SrcToken.Symbol}</>}
      />
      <InfoListItem
        labelText={
          <LabelWrapper
            labelText="Maximum Deposit"
            content={`The maximum amount of ${SrcToken.Symbol} you can deposit`}
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
            labelText="Minimum Deposit"
            content={`The minimum amount of ${SrcToken.Symbol} you have to deposit`}
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
            labelText="Deposit Fee Rate"
            content={`
              The expected deposit fee in ${SrcToken.Symbol} from swapping ${SrcToken.Symbol}
              to ${DestToken.Symbol}. Note, there aren't any swap fees on deposits`}
          />
        }
        content={`${SrcToken.SwapFeeRate * 100}%`}
      />
    </div>
  );
}
