import { useEffect, useState, useContext } from "react";

import { commify, parseUnits, formatUnits } from "@ethersproject/units";
import { Zero } from "@ethersproject/constants";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";

import { useApproveAndStake } from "../hooks/useApproveAndStake";
import { usePoolAPYData } from "../hooks/usePoolAPYData";
import { useTokenContract } from "../hooks/useContract";
import { useTokenBalance, useStakedBalance } from "../hooks/useTokenBalances";
import { useClaimStake } from "../hooks/useClaimStake";
import { useWithdrawStake } from "../hooks/useWithdrawStake";

import { Context } from "../store";

import { STAKING_MAP_TOKENS, STAKING_MAP } from "../constants";

import { formatBnMagic } from "../utils";

import Card from "../components/tailwind/Card";

import ApyTooltip from "../components/ApyTooltip";
import BaseButton from "../components/BaseButton";
import InteractiveInputRow from "../components/InteractiveInputRow";

export default function StakeCard({
  poolName,
  poolLabel,
  rightContent = false,
}) {
  const token = STAKING_MAP_TOKENS[poolName];
  const poolId = STAKING_MAP[poolName];

  const approveAndStake = useApproveAndStake();
  const withdrawStake = useWithdrawStake();
  const claimStake = useClaimStake();
  const stakedBalance = useStakedBalance(poolId);
  const { account } = useActiveWeb3React();
  const [state] = useContext(Context);

  const poolTokenContract = useTokenContract(token);
  const poolAPYData = usePoolAPYData();

  const [deposit, setDeposit] = useState("");
  const [withdraw, setWithdraw] = useState("");
  const [stakeApy, setStakeApy] = useState(null);

  // TODO: FIX THIS
  const LP_TOKEN_BALANCE = useTokenBalance(token) ?? Zero;

  useEffect(() => {
    async function fetchAPY() {
      const APY = await poolAPYData({
        poolId: poolId,
        poolToken: token,
        poolTokenContract: poolTokenContract,
        account: account,
      });

      setStakeApy(APY);
      // return APY
      return () => {};
    }
    fetchAPY().then();
  }, [state.nrvPrice, account]);

  const apyData = stakeApy ?? "";

  return (
    <Card
      title={
        <>
          <div>{poolLabel ?? poolName} Staking</div>
          <div className="flex">
            <div>Earning {apyData.yearlyAPRUnvested}% APR</div>
            <ApyTooltip apyData={apyData} className="ml-1" />
          </div>
        </>
      }
      btn={rightContent}
    >
      <div className="mt-4">
        <InteractiveInputRow
          title="Stake"
          balanceStr={commify(formatBnMagic(LP_TOKEN_BALANCE, token.symbol, 2))}
          onClickBalance={() => {
            setDeposit(formatUnits(LP_TOKEN_BALANCE, 18));
          }}
          value={deposit}
          placeholder={"0.0"}
          onChange={(e) => setDeposit(e.target.value)}
          disabled={LP_TOKEN_BALANCE.eq(0) || deposit === ""}
          onClickEnter={async (e) => {
            approveAndStake({
              poolId: poolId,
              toStakeTokenSymbol: token.symbol,
              infiniteApproval: true,
              amount: parseUnits(deposit.replace(/,/g, ""), 18),
            });
            setDeposit("");
          }}
        />
        <InteractiveInputRow
          title="Unstake"
          balanceStr={commify(
            formatBnMagic(stakedBalance.amount, token.symbol, 4)
          )}
          onClickBalance={() => {
            setWithdraw(formatUnits(stakedBalance.amount, 18));
          }}
          value={withdraw}
          placeholder={"0.0"}
          onChange={(e) => setWithdraw(e.target.value)}
          disabled={stakedBalance.amount.eq(0) || withdraw === ""}
          onClickEnter={() => {
            withdrawStake({
              poolId: poolId,
              toStakeTokenSymbol: token.symbol,
              amount: parseUnits(withdraw.replace(/,/g, ""), 18),
              // gasPriceSelected: 'STANDARD',
            });
            setWithdraw("");
          }}
        />
        <div className="mt-6">
          <BaseButton
            fancy={true}
            disabled={stakedBalance.reward.eq(0)}
            className="w-full py-4"
            onClick={async () => {
              await claimStake({ poolId });
            }}
          >
            Claim {formatBnMagic(stakedBalance.reward, token.symbol, 6)} NRV
          </BaseButton>
        </div>
      </div>
    </Card>
  );
}
