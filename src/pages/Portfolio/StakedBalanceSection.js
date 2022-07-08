import { useStakedBalance } from "../../hooks/useTokenBalances";

import BalanceSection from "./BalanceSection";

export default function StakedBalanceSection({ poolId, token, stakeLinkTo }) {
  const stakedBalance = useStakedBalance(poolId);

  return (
    <>
      <BalanceSection
        label="Staked Balance"
        balance={stakedBalance.amount}
        token={token}
        linkTo={stakeLinkTo}
      />
      {stakedBalance.reward !== 0 && (
        <BalanceSection
          label="Unclaimed Rewards"
          balance={stakedBalance.reward}
          token={token}
          overrideSymbol="NRV"
          linkTo={stakeLinkTo}
        />
      )}
    </>
  );
}
