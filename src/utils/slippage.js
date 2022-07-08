import { BigNumber } from "@ethersproject/bignumber";
import { formatUnits } from "@ethersproject/units";

const Slippages = {
  One: "ONE",
  OneTenth: "ONE_TENTH",
  Custom: "CUSTOM",
};

export function _applySlippage(
  inputValue,
  slippageSelected,
  slippageCustom,
  add = false
) {
  let numerator;
  let denominator;
  if (slippageSelected === Slippages.Custom && !!slippageCustom) {
    denominator = BigNumber.from(10).pow(slippageCustom.precision + 2);
    numerator = add
      ? denominator.add(slippageCustom.valueSafe)
      : denominator.sub(slippageCustom.valueSafe);
  } else if (slippageSelected === Slippages.OneTenth) {
    denominator = 1000;
    numerator = denominator + (add ? 1 : -1);
  } else {
    // default to 1%
    denominator = 100;
    numerator = denominator + (add ? 1 : -1);
  }
  return inputValue.mul(numerator).div(denominator);
}

export function addSlippage(inputValue, slippageSelected, slippageCustom) {
  return _applySlippage(inputValue, slippageSelected, slippageCustom, true);
}

export function subtractSlippage(inputValue, slippageSelected, slippageCustom) {
  return _applySlippage(inputValue, slippageSelected, slippageCustom, false);
}

export function formatSlippageToString(slippageSelected, slippageCustom) {
  if (slippageSelected === Slippages.Custom && !!slippageCustom) {
    return formatUnits(slippageCustom.valueSafe, slippageCustom?.precision);
  } else if (slippageSelected === Slippages.OneTenth) {
    return formatUnits(BigNumber.from(100), 3);
  } else if (slippageSelected === Slippages.One) {
    return formatUnits(BigNumber.from(100), 2);
  } else {
    return "N/A";
  }
}
