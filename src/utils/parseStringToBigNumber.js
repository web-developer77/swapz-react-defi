import { parseUnits } from "@ethersproject/units";
import { Zero } from "@ethersproject/constants";

import { SWAPABLE_TOKENS_MAP } from "../constants";

export default function parseStringToBigNumber(valueRaw, precision, fallback) {
  let valueSafe;
  let isFallback;
  try {
    // attempt to parse string. Use fallback value if library error is thrown
    valueSafe = parseUnits(valueRaw, precision);
    isFallback = false;
  } catch {
    valueSafe = fallback ?? Zero;
    isFallback = true;
  }
  return { value: valueSafe, isFallback };
}

export function parseStringAndTokenToBigNumber(value, tokenSymbol) {
  return parseStringToBigNumber(
    value,
    tokenSymbol ? SWAPABLE_TOKENS_MAP[tokenSymbol]?.decimals : 18,
    Zero
  );
}
