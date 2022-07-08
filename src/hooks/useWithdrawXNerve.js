import { useToasts } from "react-toast-notifications";
import { useXNerveContract } from "../hooks/useContract";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";

import { formatBNToString } from "../utils";

import BscScanToastLink from "../components/BscScanToastLink";

export function useWithdrawXNerve() {
  // const tokenContracts = useAllContracts()
  const { account } = useActiveWeb3React();
  const { addToast } = useToasts();

  const xNerveContract = useXNerveContract();

  return async function withdrawXNerve(state) {
    if (!account) throw new Error("Wallet must be connected");
    if (!xNerveContract) throw new Error("XNRV contract is not loaded");

    if (xNerveContract === null) return;

    const xNerveEnterTx = await xNerveContract.leave(state.amount);

    const tx = await xNerveEnterTx.wait();

    const toastContent = (
      <>
        {formatBNToString(state.amount, 18, 2)} xNRV redeemed for NRV
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
