import { useXNerveContract, useAllContracts } from "../hooks/useContract";

import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";
import { formatBNToString } from "../utils";
import { useToasts } from "react-toast-notifications";
import BscScanToastLink from "../components/BscScanToastLink";

export function useApproveAndDepositXNerve() {
  const { addToast } = useToasts();
  const tokenContracts = useAllContracts();
  const { account } = useActiveWeb3React();

  const xNerveContract = useXNerveContract();

  return async function approveAndDepositXNerve(state) {
    console.log("approveAndDepositXNerve");
    if (!account) throw new Error("Wallet must be connected");
    if (!xNerveContract) throw new Error("XNRV contract is not loaded");

    // For each token being used, check the allowance and approve it if necessary
    const nrvContract = tokenContracts?.NRV;
    if (nrvContract === null) {
      console.log("null contract");
      return;
    }

    await checkAndApproveTokenForTrade(
      nrvContract,
      xNerveContract.address,
      account,
      state.amount,
      state.infiniteApproval
    );
    const xNerveEnterTx = await xNerveContract.enter(state.amount);

    const tx = await xNerveEnterTx.wait();
    const toastContent = (
      <>
        Successfully minted {formatBNToString(state.amount, 18, 2)} xNRV
        <br />
        <BscScanToastLink {...tx} />
      </>
    );

    addToast(toastContent, {
      appearance: "success",
      autoDismiss: true,
    });
  };
}
