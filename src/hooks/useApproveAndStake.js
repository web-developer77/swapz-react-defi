import { useToasts } from "react-toast-notifications";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";
import { useMasterMindContract, useAllContracts } from "../hooks/useContract";

import { STAKING_TOKEN_MAP } from "../constants";

import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade";

import BscScanToastLink from "../components/BscScanToastLink";

export function useApproveAndStake() {
  const tokenContracts = useAllContracts();
  const { account } = useActiveWeb3React();
  const { addToast } = useToasts();

  const masterMindContract = useMasterMindContract();

  return async function approveAndStake(state) {
    console.log("Called");

    if (!account) throw new Error("Wallet must be connected");
    if (!masterMindContract) throw new Error("MMind contract is not loaded");

    // For each token being deposited, check the allowance and approve it if necessary
    const tokenContract = tokenContracts?.[state.toStakeTokenSymbol];
    if (tokenContract === null) return;
    const fromToken = STAKING_TOKEN_MAP[state.toStakeTokenSymbol];
    console.log(fromToken);
    await checkAndApproveTokenForTrade(
      tokenContract,
      masterMindContract.address,
      account,
      state.amount,
      state.infiniteApproval
    );
    const stakeTransaction = await masterMindContract.deposit(
      state.poolId,
      state.amount
    );

    const tx = await stakeTransaction.wait();

    const toastContent = (
      <>
        {"Stake completed: "}
        <BscScanToastLink {...tx} />
      </>
    );

    addToast(toastContent, {
      appearance: "success",
      autoDismiss: true,
    });
  };
}
