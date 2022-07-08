import { useMemo, useState } from "react";
import { Zero } from "@ethersproject/constants";

import {
  BLOCK_TIME,
  ANYBTC,
  BTCB,
  BUSD,
  ETHB,
  ANYETH,
  USDC,
  USDT,
  RUSD,
  FUSDT,
  UST,
  STABLECOIN_POOL_NAME,
  NRVBTC_POOL_NAME,
  NRVETH_POOL_NAME,
  RUSD_POOL_NAME,
  FUSDT_POOL_NAME,
  UST_POOL_NAME,
} from "../constants";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";
import { usePoller } from "../hooks/usePoller";

import {
  useAirdropContract,
  useAirdropContract2,
  useMasterMindContract,
  useTokenContract,
} from "../hooks/useContract";

export function useTokenBalance(t) {
  const { account, chainId } = useActiveWeb3React();
  const [balance, setBalance] = useState(Zero);

  const tokenContract = useTokenContract(t);

  usePoller(() => {
    async function pollBalance() {
      const newBalance = (await tokenContract?.balanceOf(account)) ?? Zero;
      if (newBalance !== balance) {
        setBalance(newBalance);
      }
    }
    if (account && chainId) {
      void pollBalance();
    }
  }, BLOCK_TIME);

  return balance;
}

export function useTokenBalanceOfAddress(t, address) {
  const { account, chainId } = useActiveWeb3React();
  const [balance, setBalance] = useState(Zero);

  const tokenContract = useTokenContract(t);

  usePoller(() => {
    async function pollBalance() {
      console.log("in poll");
      const newBalance = await tokenContract?.balanceOf(address);
      if (newBalance !== balance) {
        setBalance(newBalance);
      }
    }
    if (account && chainId) {
      void pollBalance();
    }
  }, BLOCK_TIME);

  return balance;
}

export function useStakedBalance(poolId) {
  const { account, chainId } = useActiveWeb3React();

  const [balance, setBalance] = useState({
    amount: Zero,
    reward: Zero,
  });

  const masterMindContract = useMasterMindContract();

  usePoller(() => {
    async function pollBalance() {
      // TODO: Fix Later
      const newAmount = (await masterMindContract?.userInfo(
        poolId,
        account
      )) ?? { amount: Zero };
      const newReward =
        (await masterMindContract?.pendingNerve(poolId, account)) ?? Zero;
      if (newAmount.amount !== balance.amount && newReward !== balance.reward) {
        setBalance({
          amount: newAmount.amount,
          reward: newReward,
        });
      }
    }
    if (account && chainId) {
      void pollBalance();
    }
  }, BLOCK_TIME);

  return balance;
}

export function usePoolTokenBalances(poolName) {
  const busdTokenBalance = useTokenBalance(BUSD);
  const usdtTokenBalance = useTokenBalance(USDT);
  const usdcTokenBalance = useTokenBalance(USDC);
  const anybtcTokenBalance = useTokenBalance(ANYBTC);
  const btcbTokenBalance = useTokenBalance(BTCB);
  const anyethTokenBalance = useTokenBalance(ANYETH);
  const ethbTokenBalance = useTokenBalance(ETHB);
  const rusdTokenBalance = useTokenBalance(RUSD);
  const fusdtTokenBalance = useTokenBalance(FUSDT);
  const ustTokenBalance = useTokenBalance(UST);

  const stablePoolTokenBalances = useMemo(
    () => ({
      [BUSD.symbol]: busdTokenBalance,
      [USDT.symbol]: usdtTokenBalance,
      [USDC.symbol]: usdcTokenBalance,
    }),
    [busdTokenBalance, usdtTokenBalance, usdcTokenBalance]
  );

  const btcPoolTokenBalances = useMemo(
    () => ({
      [BTCB.symbol]: btcbTokenBalance,
      [ANYBTC.symbol]: anybtcTokenBalance,
    }),
    [btcbTokenBalance, anybtcTokenBalance]
  );
  const ethPoolTokenBalances = useMemo(
    () => ({
      [ETHB.symbol]: ethbTokenBalance,
      [ANYETH.symbol]: anyethTokenBalance,
    }),
    [ethbTokenBalance, anyethTokenBalance]
  );
  const rusdTokenBalances = useMemo(
    () => ({
      [BUSD.symbol]: busdTokenBalance,
      [USDT.symbol]: usdtTokenBalance,
      [USDC.symbol]: usdcTokenBalance,
      [RUSD.symbol]: rusdTokenBalance,
    }),
    [busdTokenBalance, usdtTokenBalance, usdcTokenBalance, rusdTokenBalance]
  );

  const fusdtTokenBalances = useMemo(
    () => ({
      [BUSD.symbol]: busdTokenBalance,
      [USDT.symbol]: usdtTokenBalance,
      [USDC.symbol]: usdcTokenBalance,
      [FUSDT.symbol]: fusdtTokenBalance,
    }),
    [busdTokenBalance, usdtTokenBalance, usdcTokenBalance, fusdtTokenBalance]
  );

  const ustTokenBalances = useMemo(
    () => ({
      [BUSD.symbol]: busdTokenBalance,
      [USDT.symbol]: usdtTokenBalance,
      [USDC.symbol]: usdcTokenBalance,
      [UST.symbol]: ustTokenBalance,
    }),
    [busdTokenBalance, usdtTokenBalance, usdcTokenBalance, ustTokenBalance]
  );

  switch (poolName) {
    case STABLECOIN_POOL_NAME:
      return stablePoolTokenBalances;
    case NRVBTC_POOL_NAME:
      return btcPoolTokenBalances;
    case NRVETH_POOL_NAME:
      return ethPoolTokenBalances;
    case RUSD_POOL_NAME:
      return rusdTokenBalances;
    case FUSDT_POOL_NAME:
      return fusdtTokenBalances;
    case UST_POOL_NAME:
      return ustTokenBalances;
    default:
      return null;
  }
}

export function useAirdropBalance() {
  const { account, chainId } = useActiveWeb3React();

  const [amount, setAmount] = useState(Zero);

  const airdropContract = useAirdropContract();

  usePoller(() => {
    async function pollAmount() {
      // TODO: Fix Later
      const newAmount = (await airdropContract?.claimBalances(account)) ?? Zero;

      if (newAmount !== amount) {
        setAmount(newAmount);
      }
    }
    if (account && chainId) {
      pollAmount();
    }
  }, BLOCK_TIME);

  return amount;
}

export function useAirdropBalance2() {
  const { account, chainId } = useActiveWeb3React();

  const [amount, setAmount] = useState(Zero);

  const airdropContract = useAirdropContract2();

  usePoller(() => {
    async function pollAmount() {
      // TODO: Fix Later
      const newAmount = (await airdropContract?.claimBalances(account)) ?? Zero;

      if (newAmount !== amount) {
        setAmount(newAmount);
      }
    }
    if (account && chainId) {
      pollAmount();
    }
  }, BLOCK_TIME);

  return amount;
}
