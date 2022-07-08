import { usePoolData } from "../hooks/usePoolData";
import { useApproveAndDeposit } from "../hooks/useApproveAndDeposit";
import { useApproveAndWithdraw } from "../hooks/useApproveAndWithdraw";
import {
  useSwapContract,
  useMetaSwapDepositContract,
} from "../hooks/useContract";
import { useWithdrawFormState } from "../hooks/useWithdrawFormState";
import { useSharedPoolMagic } from "../hooks/useSharedPoolMagic";

export function useSwapPoolMagic({ poolName, isMeta = false }) {
  const approveAndDeposit = useApproveAndDeposit(poolName, isMeta);
  const approveAndWithdraw = useApproveAndWithdraw(poolName, isMeta);
  const basicSwapContract = useSwapContract(poolName);
  const metaSwapContract = useMetaSwapDepositContract(poolName);
  const [poolData] = usePoolData(poolName, isMeta);

  const [withdrawFormState, updateWithdrawFormState] = useWithdrawFormState(
    poolName,
    isMeta
  );

  let swapContract;
  if (isMeta) {
    swapContract = metaSwapContract;
  } else {
    swapContract = basicSwapContract;
  }

  const sharedArgs = useSharedPoolMagic({
    poolName,
    poolData,
    swapContract,
    withdrawFormState,
    updateWithdrawFormState,
    approveAndDepositFunc: approveAndDeposit,
    approveAndWithdrawFunc: approveAndWithdraw,
  });

  return {
    ...sharedArgs,

    poolData,
    updateWithdrawFormState,
    withdrawFormState,
    poolName,
  };
}
