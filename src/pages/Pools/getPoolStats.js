import { POOLS_MAP, INVERTED_ROUTER_INDEX } from "../../constants";
import { formatBNToString } from "../../utils";
import { commify } from "@ethersproject/units";

export function getPoolStats({ poolName, poolData }) {
  const poolRouterIndex = INVERTED_ROUTER_INDEX[poolName];
  const coins = POOLS_MAP[poolName];

  const { apy, totalLockedUSD } = poolData ?? {};

  let fullCompoundedApyStr;
  let totalLockedUSDStr;
  let yearlyAPRUnvestedStr;

  if (poolData) {
    try {
      if (
        0 < apy?.fullCompoundedAPY &&
        apy?.fullCompoundedAPY < Number.MAX_SAFE_INTEGER
      ) {
        fullCompoundedApyStr = apy?.fullCompoundedAPY;
      }
      if (
        0 < apy?.yearlyAPRUnvested &&
        apy?.yearlyAPRUnvested < Number.MAX_SAFE_INTEGER
      ) {
        yearlyAPRUnvestedStr = apy?.yearlyAPRUnvested;
      }
      if (totalLockedUSD) {
        totalLockedUSDStr = commify(formatBNToString(totalLockedUSD, 18, 0));
      }
    } catch (error) {
      console.log({ error });
    }
  }

  return {
    poolRouterIndex,
    coins,
    apy,
    totalLockedUSD,
    fullCompoundedApyStr,
    yearlyAPRUnvestedStr,
    totalLockedUSDStr,
  };
}
