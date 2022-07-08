import { useActiveWeb3React } from "../hooks/useActiveWeb3React";
import { getProviderOrSigner } from "../utils";
import { BigNumber } from "@ethersproject/bignumber";

export function useSendNativeToken() {
  const { library, account } = useActiveWeb3React();

  return async function sendNativeToken(state) {
    const signer = getProviderOrSigner(library, account);

    await signer.sendTransaction({
      from: account,
      to: state.address,
      value: BigNumber.from(state.amount),
    });
  };
}
