import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PoolManagementDeposit from "../../components/PoolManagementDeposit";
import PoolManagementWithdraw from "../../components/PoolManagementWithdraw";
import PoolStakingButton from "../../components/PoolStakingButton";

import LiquidityManagementTabs from "./LiquidityManagementTabs";

export default function DepositDisplay({
  onChangeTokenInputValue,
  tokens,
  poolData,
  onConfirmTransaction,
  priceImpact,
  updateWithdrawFormState,
  poolTokens,
  withdrawFormState,
  onConfirmWithdrawTransaction,
  estWithdrawBonus,
  poolStakingLink,
  poolStakingLinkText,
  poolName,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [cardNav, setCardNav] = useState(getLiquidityMode(location.hash)); // 'addLiquidity'

  const withdrawTokens = poolTokens.map(({ name, symbol, icon }) => ({
    name,
    symbol,
    icon,
    inputValue: withdrawFormState.tokenInputs[symbol].valueRaw,
  }));

  return (
    <div>
      <div className="rounded-lg  text-default">
        <LiquidityManagementTabs
          cardNav={cardNav}
          setCardNav={(val) => {
            navigate(`#${val}`);
            setCardNav(val);
          }}
        />
        <div className="mt-4">
          {cardNav === "addLiquidity" && (
            <PoolManagementDeposit
              onChangeTokenInputValue={onChangeTokenInputValue}
              tokens={tokens}
              poolData={poolData}
              onConfirmTransaction={onConfirmTransaction}
              priceImpact={priceImpact}
            />
          )}
          {cardNav === "removeLiquidity" && (
            <PoolManagementWithdraw
              onFormChange={updateWithdrawFormState}
              tokens={withdrawTokens}
              poolData={poolData}
              formStateData={withdrawFormState}
              onConfirmTransaction={onConfirmWithdrawTransaction}
              priceImpact={estWithdrawBonus}
            />
          )}
        </div>
      </div>
      {poolStakingLink && (
        <PoolStakingButton
          poolName={poolName}
          poolStakingLink={poolStakingLink}
          poolStakingLinkText={poolStakingLinkText}
        />
      )}
    </div>
  );
}

function getLiquidityMode(browserHash) {
  switch (browserHash) {
    case "#addLiquidity":
      return "addLiquidity";
    case "#removeLiquidity":
      return "removeLiquidity";
    default:
      return "addLiquidity";
  }
}
