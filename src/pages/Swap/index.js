import { useRef, useState, useEffect } from "react"

import { Link } from "react-router-dom"

import { parseUnits, formatUnits } from "@ethersproject/units"
import { Zero, One } from "@ethersproject/constants"

import {
  STABLECOIN_POOL_NAME,
  SWAPABLE_TOKENS,
  POOLS_MAP,
  STABLE_SWAP_TOKEN,
} from "../../constants"

import { useMasterSwapContract } from "../../hooks/useContract"
// import { usePoolData } from "../../hooks/usePoolData";
import { usePoolTokenBalances } from "../../hooks/useTokenBalances"

import Grid from "../../components/tailwind/Grid"

import BaseButton from "../../components/BaseButton"

import PageWrapper from "../../components/layouts/PageWrapper"

import SwapCard from "./SwapCard"

import {
  estimateAmountToGive,
  calcAmountToRecieve,
  sanitizeValue,
  calculateExchangeRate,
} from "./funcs"

import { getInfoMultiCoin } from "./getInfoMultiCoin"

export default function SwapPage() {
  const [poolName, setPoolName] = useState(STABLECOIN_POOL_NAME)
  const swapContract = useMasterSwapContract(poolName)
  const tokenBalances = usePoolTokenBalances(poolName)
  // const [poolData] = usePoolData(poolName);

  // build a representation of pool tokens for the UI
  const index = SWAPABLE_TOKENS.indexOf(STABLE_SWAP_TOKEN)
  let coins
  if (index > -1) {
    coins = SWAPABLE_TOKENS.splice(index, 1)
  } else {
    coins = SWAPABLE_TOKENS
  }
  const [fromCoin, setFromCoin] = useState(SWAPABLE_TOKENS[0])
  const [toCoin, setToCoin] = useState(SWAPABLE_TOKENS[1])

  const [fromValue, setFromValue] = useState("")
  const [toValue, setToValue] = useState("")

  const fromRef = useRef(null)
  const toRef = useRef(null)

  const [priceImpact, setPriceImpact] = useState(Zero)
  const [exchangeRate, setExchangeRate] = useState(Zero)

  const [error, setError] = useState(null)

  const [lastChangeType, setLastChangeType] = useState("from")

  function swapFromToCoins() {
    setFromCoin(toCoin)
    setToCoin(fromCoin)
    if (lastChangeType === "from") {
      setToValue("")
    } else {
      setFromValue("")
    }
    setPriceImpact(Zero)
    setExchangeRate(Zero)
  }

  function onSelectFromCoin(coin, checkPool = true) {
    if (checkPool !== false) {
      const info = getInfoMultiCoin(coin, toCoin)
      setPoolName(info.poolName)
      onSelectToCoin(info.otherCoin, false)
    }

    if (coin.symbol === toCoin.symbol) {
      swapFromToCoins()
    } else {
      setError(null)
      setFromCoin(coin)
    }
  }

  function resetRates() {
    setPriceImpact(Zero)
    setExchangeRate(Zero)
  }

  function onSelectToCoin(coin, checkPool = true) {
    if (checkPool !== false) {
      const info = getInfoMultiCoin(coin, fromCoin)
      setPoolName(info.poolName)
      onSelectFromCoin(info.otherCoin, false)
    }

    if (coin.symbol === fromCoin.symbol) {
      swapFromToCoins()
    } else {
      setError(null)
      setToCoin(coin)
      setToValue("")
      if (lastChangeType === "to") {
        setFromValue("")
      }
      resetRates()
    }
  }

  const selectedPool = POOLS_MAP[poolName]
  const tokenIndexFrom = selectedPool.findIndex(
    (i) => i.symbol === fromCoin.symbol
  )
  const tokenIndexTo = selectedPool.findIndex((i) => i.symbol === toCoin.symbol)
  const coinSymbols = [fromCoin.symbol, toCoin.symbol]

  function triggerRateAndImpact({ amountToGive, amountToReceive }) {
    setExchangeRate(
      calculateExchangeRate(
        amountToGive,
        fromCoin.decimals,
        amountToReceive,
        toCoin.decimals
      )
    )
  }

  function checkIfBalanceSufficient({ amountToGive }) {
    let errorMsg
    if (amountToGive.gt(tokenBalances[fromCoin.symbol])) {
      errorMsg = "Insufficent Balance"
    } else {
      errorMsg = null
    }
    setError(errorMsg)
  }

  const calculateSwapAmount = async () => {
    if (swapContract === null) return
    // if (fromValue.length === 0) return
    let cleanedFromValue = sanitizeValue(fromValue) // remove common copy/pasted financial characters
    if (checkCleanedValue(cleanedFromValue)) {
      setToValue("")
      // setPriceImpact(Zero)
      return
    }

    const amountToGive = parseUnits(cleanedFromValue, fromCoin.decimals)

    checkIfBalanceSufficient({ amountToGive })

    const amountToReceive = await calcAmountToRecieve({
      swapContract,
      tokenIndexFrom,
      tokenIndexTo,
      coinSymbols,
      amountToGive,
    })

    if (sanitizeValue(fromRef.current.value) === sanitizeValue(fromValue)) {
      setToValue(formatUnits(amountToReceive, toCoin.decimals))
      triggerRateAndImpact({ amountToGive, amountToReceive })
    }
  }

  const calculateInverseSwapAmount = async () => {
    if (swapContract === null) return
    const cleanedToValue = sanitizeValue(toValue) // remove common copy/pasted financial characters
    if (checkCleanedValue(cleanedToValue)) {
      setFromValue("")
      return
    }

    const amountToReceive = parseUnits(cleanedToValue, toCoin.decimals) ?? One

    const amountToGive = await estimateAmountToGive({
      targetAmountToRecieve: amountToReceive,
      swapContract,
      tokenIndexFrom,
      tokenIndexTo,
      coinSymbols,
      fromCoin,
      toCoin,
    })

    checkIfBalanceSufficient({ amountToGive })
    if (sanitizeValue(toRef.current.value) === sanitizeValue(toValue)) {
      setFromValue(formatUnits(amountToGive, fromCoin.decimals))
      triggerRateAndImpact({ amountToGive, amountToReceive })
    }
  }

  useEffect(() => {
    if (lastChangeType === "from") {
      calculateSwapAmount()
    }
  }, [fromCoin, toCoin, fromValue, lastChangeType])

  useEffect(() => {
    if (lastChangeType === "to") {
      calculateInverseSwapAmount()
    }
  }, [fromCoin, toCoin, toValue, lastChangeType])

  function onChangeFromAmount(value) {
    setLastChangeType("from")
    setFromValue(value)
  }

  function onChangeToAmount(value) {
    setLastChangeType("to")
    setToValue(value)
  }

  return (
    <PageWrapper>
      <main className="relative z-0 overflow-y-auto focus:outline-none h-full">
        <div className="py-6">
          <Grid
            cols={{ xs: 1 }}
            gap={6}
            className="py-8 sm:py-28 justify-center px-2 sm:px-6 md:px-8"
          >
            <div className="place-self-center bg-dark-blue box-shadow text-white">
              <SwapCard
                {...{
                  fromCoin,
                  fromValue,
                  toCoin,
                  toValue,
                  coins,
                  onSelectFromCoin,
                  onSelectToCoin,
                  swapFromToCoins,
                  tokenBalances,
                  poolName,
                  onChangeFromAmount,
                  onChangeToAmount,
                  error,
                  priceImpact,
                  exchangeRate,
                  fromRef,
                  toRef,
                }}
              />
            </div>
          </Grid>
          <RemainingHomeContent />
        </div>
      </main>
    </PageWrapper>
  )
}

function RemainingHomeContent() {
  return (
    <Grid
      cols={{ xs: 1 }}
      gap={6}
      className="py-3 justify-center px-2 sm:px-6 md:px-8"
    >
      <div className="px-4 text-white">
        <div className="flex flex-col my-6 text-center">
          <h3 className="text-default font-medium text-2xl">About Nerve</h3>
          <p className="mt-5 max-w-prose mx-auto text-lg  text-coolGray-700">
            Nerve is a trustless on-ramp and stableswap on the Binance Smart
            Chain.
          </p>
          <p className="mt-2 max-w-prose mx-auto text-base  text-coolGray-500">
            Bridge assets onto BSC and earn yield on BTC, ETH, and stablecoins
          </p>
          <Grid cols={{ xs: 1 }} gap={2}>
            <div className="place-self-center">
              <Link to="/pools">
                <BaseButton
                  fancy={true}
                  className={`
                    mt-4 px-4 py-3 text-base font-medium rounded-lg
                    shadow-indigo-lg hover:shadow-indigo-xl
                    text-white focus:outline-none
                    `}
                >
                  Explore Nerve Pools
                </BaseButton>
              </Link>
            </div>
          </Grid>
        </div>
      </div>
    </Grid>
  )
}

function checkCleanedValue(cleanedValue) {
  return cleanedValue === 0 || cleanedValue === "" || isNaN(+cleanedValue)
}
