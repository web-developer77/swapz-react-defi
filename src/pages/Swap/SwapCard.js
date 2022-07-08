import { useState } from "react"
import classNames from "classnames"
import { parseUnits } from "@ethersproject/units"

import { Transition } from "@headlessui/react"

import { useApproveAndSwap } from "../../hooks/useApproveAndSwap"

import { getSwapCardShadowStyleForCoin } from "../../utils/coinStyles"

import Grid from "../../components/tailwind/Grid"
import Card from "../../components/tailwind/Card"

import BaseButton from "../../components/BaseButton"

import CoreSwapContainer from "./CoreSwapContainer"
import ExchangeRateInfo from "./ExchangeRateInfo"
import CoinSlideOver from "./CoinSlideOver"

import { sanitizeValue } from "./funcs"

export default function SwapCard({
  poolName,
  coins,
  fromCoin,
  fromValue,
  toCoin,
  toValue,
  swapFromToCoins,
  onSelectFromCoin,
  onSelectToCoin,
  onChangeFromAmount,
  onChangeToAmount,
  error,
  priceImpact,
  exchangeRate,
  fromRef,
  toRef,
}) {
  const approveAndSwap = useApproveAndSwap(poolName)

  const [displayType, setDisplayType] = useState(undefined)

  let btnText
  if (error === null) {
    btnText = "Execute Swap"
  } else {
    btnText = error
  }

  const toAmount = parseUnits(sanitizeValue(toValue), toCoin.decimals)
  const fromAmount = parseUnits(sanitizeValue(fromValue), fromCoin.decimals)

  const fromArgs = {
    isSwapFrom: true,
    tokens: coins, //.filter(i => (i.symbol !== fromCoin.symbol)),
    selected: fromCoin,
    onChangeSelected: onSelectFromCoin,
    onChangeAmount: onChangeFromAmount,
    inputValue: fromValue,
    setDisplayType,
    inputRef: fromRef,
  }

  const toArgs = {
    isSwapFrom: false,
    tokens: coins, //.filter(i => (i.symbol !== toCoin.symbol)),
    selected: toCoin,
    onChangeSelected: onSelectToCoin,
    onChangeAmount: onChangeToAmount,
    inputValue: toValue,
    swapFromToCoins: swapFromToCoins,
    setDisplayType,
    inputRef: toRef,
  }

  const exchangeRateInfoContent = (
    <ExchangeRateInfo
      fromCoin={fromCoin}
      toCoin={toCoin}
      exchangeRate={exchangeRate}
      priceImpact={priceImpact}
    />
  )

  const swapCardMainContent = (
    <>
      <Grid cols={{ xs: 1 }} gap={4} className="place-content-center">
        <CoreSwapContainer {...fromArgs} />
        <CoreSwapContainer {...toArgs} />
      </Grid>
      <BaseButton
        disabled={toAmount.eq(0) || error}
        fancy={true}
        type="button"
        className="w-full rounded-full mt-4 mb-4 px-4 py-3 tracking-wide text-white disabled:bg-gray-300 "
        onClick={async () => {
          await approveAndSwap({
            fromAmount: fromAmount,
            fromTokenSymbol: fromCoin.symbol,
            toAmount: toAmount,
            toTokenSymbol: toCoin.symbol,
            slippageCustom: null,
            slippageSelected: "ONE_TENTH",
            infiniteApproval: true,
            transactionDeadline: 10,
          })
        }}
      >
        <span>{btnText}</span>
      </BaseButton>
      <Transition
        appear={true}
        unmount={false}
        show={!fromAmount.eq(0)}
        enter="transition duration-100 ease-out"
        enterFrom="transform-gpu scale-y-0 "
        enterTo="transform-gpu scale-y-100 opacity-100"
        leave="transition duration-75 ease-out "
        leaveFrom="transform-gpu scale-y-100 opacity-100"
        leaveTo="transform-gpu scale-y-0 "
        className="origin-top -mx-6 "
      >
        {exchangeRateInfoContent}
      </Transition>
    </>
  )

  const fromCardContent = <CoinSlideOver key="fromBlock" {...fromArgs} />

  const toCardContent = <CoinSlideOver key="toBlock" {...toArgs} />

  const transitionProps = {
    appear: true,
    unmount: true,
    enter: "transition duration-150 ease-out",
    enterFrom: "transform-gpu scale-y-0 ",
    enterTo: "transform-gpu scale-y-100 opacity-100",
    leave: "transition duration-150 ease-out ",
    leaveFrom: "transform-gpu scale-y-100 opacity-100",
    leaveTo: "transform-gpu scale-y-0 opacity-50",
    className:
      "origin-bottom absolute w-full h-full bg-modal modal-style -ml-6 -mt-12 z-20 rounded-2xl",
  }
  return (
    <Card
      title="Swap"
      divider={false}
      className={classNames(
        " transform transition-all duration-100 rounded-2xl",
        {
          [getSwapCardShadowStyleForCoin(fromCoin)]: displayType === "from",
          [getSwapCardShadowStyleForCoin(toCoin)]: displayType === "to",
          "shadow-indigo-xl hover:shadow-purple-2xl": !displayType,
        }
      )}
    >
      <div className="-mb-6">
        <Transition show={displayType === "from"} {...transitionProps}>
          {fromCardContent}
        </Transition>
        <Transition show={displayType === "to"} {...transitionProps}>
          {toCardContent}
        </Transition>

        {swapCardMainContent}
      </div>
    </Card>
  )
}
