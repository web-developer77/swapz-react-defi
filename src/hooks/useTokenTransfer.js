import { useTokenContract } from "../hooks/useContract";

export function useTokenTransfer(token) {
  const tokenContract = useTokenContract(token);

  return async function tokenTransfer(state) {
    await tokenContract?.transfer(state.address, state.amount);
  };
}
