import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";

export function calculatePriceImpact(
  tokenInputAmount, // assumed to be 18d precision
  tokenOutputAmount,
  virtualPrice
) {
  if (tokenInputAmount.gt(0)) {
    return virtualPrice
      .mul(tokenOutputAmount)
      .div(tokenInputAmount)
      .sub(BigNumber.from(10).pow(18));
  } else {
    return Zero;
  }
}
