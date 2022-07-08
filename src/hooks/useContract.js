import {
  BUSD,
  NRV,
  USDC,
  USDT,
  STABLE_SWAP_TOKEN,
  XNERVE_TOKEN,
  STABLECOIN_SWAP_ADDRESSES,
  STABLECOIN_POOL_NAME,
  MASTERMIND_ADDRESSES,
  XNERVE_CONTRACT_ADDRESSES,
  ANYETH,
  FUSDT,
  ANYBTC,
  NRVBTC_POOL_NAME,
  NRVBTC_SWAP_ADDRESSES,
  BTCB,
  NRVETH_SWAP_ADDRESSES,
  ETHB,
  NRVETH_POOL_NAME,
  NRVBTC_SWAP_TOKEN,
  NRVETH_SWAP_TOKEN,
  NRV_BUSD_CAKE_TOKEN,
  RUSD_POOL_NAME,
  RUSD_SWAP_DEPOSIT_ADDRESSES,
  RUSD_SWAP_ADDRESSES,
  RUSD,
  FUSDT_POOL_NAME,
  FUSDT_SWAP_ADDRESSES,
  FUSDT_SWAP_DEPOSIT_ADDRESSES,
  FUSDT_SWAP_TOKEN,
  UST_SWAP_TOKEN,
  UST,
  UST_SWAP_DEPOSIT_ADDRESSES,
  UST_POOL_NAME,
  UST_SWAP_ADDRESSES,
  METAPOOL_NAMES,
  BASIC_POOL_NAMES,
  TOKEN_DIST_ADDRESSES,
  TOKEN_DIST_ADDRESSES2,
} from "../constants";
import { useMemo, useState } from "react";
// import ERC20_ABI from "@constants/abis/erc20.json";
// import ANYERC20_ABI from "@constants/abis/anyErc20.json";
// import ANYBTC_ABI from "@constants/abis/anyBTC.json";
// import LPTOKEN_ABI from "@constants/abis/lpToken.json";
// import SWAP_ABI from "@constants/abis/swap.json";
// import TOKEN_DIST_ABI from "@constants/abis/tokedist.json";
// import META_SWAP_DEPOSIT_ABI from "@constants/abis/metaSwapDeposit.json";
// import METASWAP_ABI from "@constants/abis/metaSwap.json";
// import MASTERMIND_ABI from "@constants/abis/mastermind.json";
// import MIGRATION_ABI from "@constants/abis/migration.json";
// import XNERVE_ABI from "@constants/abis/xnerve.json";

import { getContract } from "../utils";
import { useActiveWeb3React } from "../hooks/useActiveWeb3React";

// returns null on errors
export function useContract(address, ABI, withSignerIfPossible = true) {
  const { library, account } = useActiveWeb3React();

  return useMemo(() => {
    if (!address || !ABI || !library) return null;
    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined
      );
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [address, ABI, library, withSignerIfPossible, account]);
}

export function useTokenContract(t, withSignerIfPossible) {
  const { chainId } = useActiveWeb3React();
  const tokenAddress = chainId ? t.addresses[chainId] : undefined;
  return useContract(tokenAddress, withSignerIfPossible);
}

export function useAnyTokenContract(t, withSignerIfPossible) {
  const { chainId } = useActiveWeb3React();
  const tokenAddress = chainId ? t.addresses[chainId] : undefined;
  const BTCABI_CONTRACT = useContract(tokenAddress, withSignerIfPossible);
  const ERCABI_CONTRACT = useContract(tokenAddress, withSignerIfPossible);
  if (t.symbol === "anyBTC") {
    return BTCABI_CONTRACT;
  } else {
    return ERCABI_CONTRACT;
  }
}

export function useMetaSwapDepositContract(poolName) {
  const withSignerIfPossible = true;
  const { chainId } = useActiveWeb3React();
  const rusdMetaSwapDepositContract = useContract(
    chainId ? RUSD_SWAP_DEPOSIT_ADDRESSES[chainId] : undefined,
    withSignerIfPossible
  );
  const fusdtMetaSwapDepositContract = useContract(
    chainId ? FUSDT_SWAP_DEPOSIT_ADDRESSES[chainId] : undefined,
    withSignerIfPossible
  );

  const ustMetaSwapDepositContract = useContract(
    chainId ? UST_SWAP_DEPOSIT_ADDRESSES[chainId] : undefined,
    withSignerIfPossible
  );

  return useMemo(() => {
    switch (poolName) {
      case RUSD_POOL_NAME:
        return rusdMetaSwapDepositContract;
      case FUSDT_POOL_NAME:
        return fusdtMetaSwapDepositContract;
      case UST_POOL_NAME:
        return ustMetaSwapDepositContract;
      default:
        return null;
    }
  }, [
    rusdMetaSwapDepositContract,
    fusdtMetaSwapDepositContract,
    ustMetaSwapDepositContract,
    poolName,
  ]);
}

export function useMetaSwapContract(poolName) {
  const withSignerIfPossible = true;
  const { chainId } = useActiveWeb3React();
  const rusdMetaSwapContract = useContract(
    chainId ? RUSD_SWAP_ADDRESSES[chainId] : undefined,
    withSignerIfPossible
  );
  const fusdtMetaSwapContract = useContract(
    chainId ? FUSDT_SWAP_ADDRESSES[chainId] : undefined,
    withSignerIfPossible
  );
  const ustMetaSwapContract = useContract(
    chainId ? UST_SWAP_ADDRESSES[chainId] : undefined,
    withSignerIfPossible
  );

  return useMemo(() => {
    switch (poolName) {
      case RUSD_POOL_NAME:
        return rusdMetaSwapContract;
      case FUSDT_POOL_NAME:
        return fusdtMetaSwapContract;
      case UST_POOL_NAME:
        return ustMetaSwapContract;
      default:
        return null;
    }
  }, [
    rusdMetaSwapContract,
    fusdtMetaSwapContract,
    ustMetaSwapContract,
    poolName,
  ]);
}

export function useMasterSwapContract(poolName) {
  const baseSwapContract = useSwapContract(poolName);
  const metaSwapContract = useMetaSwapContract(poolName);

  if (BASIC_POOL_NAMES.includes(poolName)) {
    return baseSwapContract;
  }

  if (METAPOOL_NAMES.includes(poolName)) {
    return metaSwapContract;
  }
}

export function useSwapContract(poolName) {
  const withSignerIfPossible = true;
  const { chainId } = useActiveWeb3React();
  const stablecoinSwapContract = useContract(
    chainId ? STABLECOIN_SWAP_ADDRESSES[chainId] : undefined,
    withSignerIfPossible
  );
  const nrvbtcSwapContract = useContract(
    chainId ? NRVBTC_SWAP_ADDRESSES[chainId] : undefined,
    withSignerIfPossible
  );
  const nrvethSwapContract = useContract(
    chainId ? NRVETH_SWAP_ADDRESSES[chainId] : undefined,
    withSignerIfPossible
  );
  return useMemo(() => {
    switch (poolName) {
      case STABLECOIN_POOL_NAME:
        return stablecoinSwapContract;
      case NRVBTC_POOL_NAME:
        return nrvbtcSwapContract;
      case NRVETH_POOL_NAME:
        return nrvethSwapContract;
      default:
        return null;
    }
  }, [
    stablecoinSwapContract,
    nrvbtcSwapContract,
    nrvethSwapContract,
    poolName,
  ]);
}

export function useLPTokenContract(poolName) {
  // const { chainId } = useActiveWeb3React()
  const swapContract = useSwapContract(poolName);
  let [lpTokenAddress, setLPTokenAddress] = useState("");
  void swapContract
    ?.swapStorage()
    .then(({ lpToken }) => setLPTokenAddress(lpToken));

  return useContract(lpTokenAddress);
}

export function useMetaLPTokenContract(poolName) {
  // const { chainId } = useActiveWeb3React()
  const swapContract = useMasterSwapContract(poolName);
  let [lpTokenAddress, setLPTokenAddress] = useState("");
  void swapContract
    ?.swapStorage()
    .then(({ lpToken }) => setLPTokenAddress(lpToken));

  return useContract(lpTokenAddress);
}

export function useMasterMindContract() {
  const { chainId } = useActiveWeb3React();
  const masterMindContract = useContract(
    chainId ? MASTERMIND_ADDRESSES[chainId] : undefined
  );
  return masterMindContract;
}

export function useXNerveContract() {
  const { chainId } = useActiveWeb3React();

  const xNerveContract = useContract(
    chainId ? XNERVE_CONTRACT_ADDRESSES[chainId] : undefined
  );
  return xNerveContract;
}

export function useAllContracts() {
  const busdContract = useTokenContract(BUSD);
  const usdtContract = useTokenContract(USDT);
  const usdcContract = useTokenContract(USDC);
  const nrvContract = useTokenContract(NRV);
  const xNerveContract = useTokenContract(XNERVE_TOKEN);
  const stableSwapTokenContract = useTokenContract(STABLE_SWAP_TOKEN);
  const anybtcContract = useTokenContract(ANYBTC);
  const btcContract = useTokenContract(BTCB);
  const anyethContract = useTokenContract(ANYETH);
  const ethContract = useTokenContract(ETHB);
  const nrvethContract = useTokenContract(NRVETH_SWAP_TOKEN);
  const nrvbtcContract = useTokenContract(NRVBTC_SWAP_TOKEN);
  const cakeLpContract = useTokenContract(NRV_BUSD_CAKE_TOKEN);
  const rusdContract = useTokenContract(RUSD);
  const fusdtContract = useTokenContract(FUSDT);
  const nrvfusdtContract = useTokenContract(FUSDT_SWAP_TOKEN);
  const ustContract = useTokenContract(UST);
  const nrvustContract = useTokenContract(UST_SWAP_TOKEN);

  return useMemo(() => {
    if (
      ![
        busdContract,
        usdtContract,
        usdcContract,
        stableSwapTokenContract,
        xNerveContract,
        nrvContract,
        anybtcContract,
        btcContract,
        anyethContract,
        ethContract,
        nrvethContract,
        nrvbtcContract,
        cakeLpContract,
        rusdContract,
        fusdtContract,
        nrvfusdtContract,
        ustContract,
        nrvustContract,
      ].some(Boolean)
    )
      return null;
    return {
      [BUSD.symbol]: busdContract,
      [USDT.symbol]: usdtContract,
      [USDC.symbol]: usdcContract,
      [STABLE_SWAP_TOKEN.symbol]: stableSwapTokenContract,
      [XNERVE_TOKEN.symbol]: xNerveContract,
      [NRV.symbol]: nrvContract,
      [ANYBTC.symbol]: anybtcContract,
      [BTCB.symbol]: btcContract,
      [ANYETH.symbol]: anyethContract,
      [ETHB.symbol]: ethContract,
      [NRVETH_SWAP_TOKEN.symbol]: nrvethContract,
      [NRVBTC_SWAP_TOKEN.symbol]: nrvbtcContract,
      [NRV_BUSD_CAKE_TOKEN.symbol]: cakeLpContract,
      [RUSD.symbol]: rusdContract,
      [FUSDT.symbol]: fusdtContract,
      [FUSDT_SWAP_TOKEN.symbol]: nrvfusdtContract,
      [UST.symbol]: ustContract,
      [UST_SWAP_TOKEN.symbol]: nrvustContract,
    };
  }, [
    busdContract,
    usdtContract,
    usdcContract,
    stableSwapTokenContract,
    xNerveContract,
    nrvContract,
    anybtcContract,
    btcContract,
    anyethContract,
    ethContract,
    nrvethContract,
    nrvbtcContract,
    cakeLpContract,
    rusdContract,
    fusdtContract,
    nrvfusdtContract,
    ustContract,
    nrvustContract,
  ]);
}

export function useAnyContracts() {
  const anyEthContract = useAnyTokenContract(ANYETH);
  const fusdtContract = useAnyTokenContract(FUSDT);
  const anyBtcContract = useAnyTokenContract(ANYBTC);

  return useMemo(() => {
    if (![anyEthContract, fusdtContract, anyBtcContract].some(Boolean))
      return null;
    return {
      [ANYETH.symbol]: anyEthContract,
      [FUSDT.symbol]: fusdtContract,
      [ANYBTC.symbol]: anyBtcContract,
    };
  }, [anyEthContract, fusdtContract, anyBtcContract]);
}

export function useAirdropContract() {
  const { chainId } = useActiveWeb3React();
  return useContract(TOKEN_DIST_ADDRESSES[chainId]);
}
export function useAirdropContract2() {
  const { chainId } = useActiveWeb3React();
  return useContract(TOKEN_DIST_ADDRESSES2[chainId]);
}
