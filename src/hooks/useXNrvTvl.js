import { useEffect, useState } from "react";

import { formatUnits } from "@ethersproject/units";

import { useXNerveContract } from "../hooks/useContract";
import { useNrvPrice } from "../hooks/useNrvPrice";

export function useXNrvTvl() {
  const nrvPrice = useNrvPrice();
  const xNerveContract = useXNerveContract();

  const [xNrvTotalSupply, setXNrvTotalSupply] = useState(0);

  async function func() {
    const res = await xNerveContract.totalSupply();
    if (res.gt(0)) {
      setXNrvTotalSupply(res);
    }
  }

  useEffect(func, [xNerveContract, nrvPrice]);

  if (xNrvTotalSupply === 0) {
    return { totalLockedUSD: 0 };
  } else {
    const totalLockedUSD = Number(formatUnits(xNrvTotalSupply)) * nrvPrice;

    return { totalLockedUSD };
  }
}
