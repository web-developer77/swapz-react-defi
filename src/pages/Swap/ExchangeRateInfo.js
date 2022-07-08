import classNames from "classnames"

import { formatBNToString } from "../../utils"

import Grid from "../../components/tailwind/Grid"

export default function ExchangeRateInfo({
  fromCoin,
  toCoin,
  exchangeRate,
  priceImpact,
}) {
  const formattedExchangeRate = formatBNToString(exchangeRate, 18, 4)

  // the below is actually retarded
  const numExchangeRate = Number(formattedExchangeRate)
  const isPriceImpactNegative = numExchangeRate < 1

  // const slippage = exchangeRate.sub(BigNumber.from(10).pow(18));

  let bgColor
  if (1.03 < numExchangeRate) {
    bgColor = "bg-teal-50"
  } else if (0.97 < numExchangeRate) {
    bgColor = "bg-coolGray-50"
  } else if (0.9 < numExchangeRate) {
    bgColor = "bg-amber-50"
  } else if (0 < numExchangeRate) {
    bgColor = "bg-red-50"
  } else {
    bgColor = "bg-coolGray-50"
  }

  return (
    <>
      <hr />
      <div className={classNames("py-3.5 pr-6 pl-6 rounded-b-2xl ", bgColor)}>
        <Grid cols={{ xs: 1, sm: 2 }} gapY={4}>
          <div className="text-center sm:text-left">
            <p className=" text-sm font-medium opacity-70 pb-0.5">
              Price per {fromCoin.symbol}
            </p>
            <span className="text-lg sm:text-2xl font-mono font-medium">
              {formattedExchangeRate}
            </span>
            <span className="pl-2 text-lg font-mono font-medium ">
              {toCoin.symbol}
            </span>
          </div>
          <div className="text-center sm:text-right cursor-pointer">
            <p className=" text-sm font-medium opacity-70 pb-1.5">
              {!isPriceImpactNegative && "Positive "}
              Slippage
            </p>
            <span
              className={classNames("pl-2 text-lg font-medium ", {
                "ml-auto": true,
                "text-red-500": isPriceImpactNegative,
                "text-green-500": !isPriceImpactNegative,
              })}
            >
              {/* {formattedPercentSlippage} */}
            </span>
          </div>
        </Grid>
      </div>
    </>
  )
}
