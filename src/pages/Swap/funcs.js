import { BigNumber } from "@ethersproject/bignumber";
import { formatUnits } from "@ethersproject/units";
import { Zero, Two } from "@ethersproject/constants";

const ERROR_THRESHOLD = 1 / 5000; // 10000

const MAX_LOOP_COUNT = 20;

export async function estimateAmountToGive({
  targetAmountToRecieve,
  toCoin,
  fromCoin,
  ...props
}) {
  targetAmountToRecieve = targetAmountToRecieve.mul(
    BigNumber.from(10).pow(18 - toCoin.decimals)
  );
  let fromCoinDecimalAdjustment = BigNumber.from(10).pow(
    18 - fromCoin.decimals
  );
  let toCoinDecimalAdjustment = BigNumber.from(10).pow(18 - toCoin.decimals);

  const sharedCalcArgs = {
    ...props,
    fromCoinDecimalAdjustment,
    toCoinDecimalAdjustment,
  };

  let currentAmtToRecieve = await calcDecimalAdjustedAmountToRecieve({
    ...sharedCalcArgs,
    amountToGive: targetAmountToRecieve.div(fromCoinDecimalAdjustment),
  });

  let newAmountToGive = targetAmountToRecieve;

  if (targetAmountToRecieve.isZero()) {
    newAmountToGive = Zero;
  } else {
    let error = targetAmountToRecieve.sub(currentAmtToRecieve);

    let errorFrac = getErrorFrac({ error, targetAmountToRecieve });
    let loopCount = 0;
    while (errorFrac > ERROR_THRESHOLD && loopCount < MAX_LOOP_COUNT) {
      error = targetAmountToRecieve.sub(currentAmtToRecieve);
      errorFrac = getErrorFrac({ error, targetAmountToRecieve });
      const errorCorrection = error.div(Two);
      newAmountToGive = newAmountToGive.add(errorCorrection);

      currentAmtToRecieve = await calcDecimalAdjustedAmountToRecieve({
        ...sharedCalcArgs,
        amountToGive: newAmountToGive,
      });

      loopCount += 1;
    }
  }

  return newAmountToGive.div(fromCoinDecimalAdjustment);
}

function getErrorFrac({ error, targetAmountToRecieve }) {
  return Math.abs(
    Number(formatUnits(error)) / Number(formatUnits(targetAmountToRecieve))
  );
}

async function calcDecimalAdjustedAmountToRecieve({
  amountToGive,
  fromCoinDecimalAdjustment,
  toCoinDecimalAdjustment,
  ...props
}) {
  let currentAmtToRecieve = await calcAmountToRecieve({
    ...props,
    amountToGive: amountToGive.div(fromCoinDecimalAdjustment),
  });

  return currentAmtToRecieve.mul(toCoinDecimalAdjustment);
}

export async function calcAmountToRecieve({
  swapContract,
  tokenIndexFrom,
  tokenIndexTo,
  coinSymbols,
  amountToGive,
}) {
  let amountToReceive;
  const swapArgs = [tokenIndexFrom, tokenIndexTo, amountToGive];
  if (amountToGive.isZero()) {
    amountToReceive = Zero;
  } else if (
    coinSymbols.includes("rUSD") ||
    coinSymbols.includes("fUSDT") ||
    coinSymbols.includes("UST")
  ) {
    amountToReceive = await swapContract.calculateSwapUnderlying(...swapArgs);
  } else {
    amountToReceive = await swapContract.calculateSwap(...swapArgs);
  }
  return amountToReceive;
}

export function sanitizeValue(rawVal) {
  const val = rawVal.replace(/[$,]/g, "");

  if ([".", "0.", ""].includes(val)) {
    return "0";
  } else {
    return val;
  }
}

export function calculateExchangeRate(
  amountFrom,
  tokenPrecisionFrom,
  amountTo,
  tokenPrecisionTo
) {
  if (amountFrom.gt("0")) {
    return amountTo
      .mul(BigNumber.from(10).pow(36 - tokenPrecisionTo)) // convert to standard 1e18 precision
      .div(amountFrom.mul(BigNumber.from(10).pow(18 - tokenPrecisionFrom)));
  } else {
    return Zero;
  }
}
