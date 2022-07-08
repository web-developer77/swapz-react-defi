import { useToasts } from "react-toast-notifications";

import { useMasterMindContract } from "../hooks/useContract";
import { useActiveWeb3React } from "../hooks/useActiveWeb3React";

import BscScanToastLink from "../components/BscScanToastLink";

export function useClaimStake() {
  const { account } = useActiveWeb3React();
  const { addToast } = useToasts();
  const masterMindContract = useMasterMindContract();

  return async function claimStake(state) {
    if (!account) throw new Error("Wallet must be connected");
    if (!masterMindContract) throw new Error("MMind contract is not loaded");

    const stakeTransaction = await masterMindContract.deposit(state.poolId, 0);

    const tx = await stakeTransaction.wait();

    const toastContent = (
      <>
        {"Claim completed: "}
        <BscScanToastLink {...tx} />
      </>
    );

    addToast(toastContent, {
      appearance: "success",
      autoDismiss: true,
    });
    return Promise.resolve();
  };
}
