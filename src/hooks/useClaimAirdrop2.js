import { useActiveWeb3React } from "../hooks/useActiveWeb3React";

import { useAirdropContract2 } from "../hooks/useContract";

import { useToasts } from "react-toast-notifications";

export function useClaimAirdrop2() {
  const { account } = useActiveWeb3React();
  const nrvAirdropContract = useAirdropContract2();
  const { addToast } = useToasts();

  return async function claimAirdrop() {
    if (!account) throw new Error("Wallet must be connected");

    const airdropTransaction = await nrvAirdropContract.claim(account);
    const tx = await airdropTransaction.wait();

    if (tx?.status === 1) {
      addToast("Claimed", {
        appearance: "success",
        autoDismiss: true,
      });
    }

    return Promise.resolve();
  };
}
