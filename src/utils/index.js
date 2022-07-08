import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { formatUnits } from "@ethersproject/units";
import { getAddress } from "@ethersproject/address";

import { ALL_TOKENS_MAP } from "../constants";

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value) {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

// account is not optional
export function getSigner(library, account) {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(library, account) {
  return account ? getSigner(library, account) : library;
}

// account is optional
export function getContract(address, ABI, library, account) {
  if (!isAddress(address)) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account));
}

export function formatBNToString(bn, nativePrecison, decimalPlaces) {
  const fullPrecision = formatUnits(bn, nativePrecison);
  const decimalIdx = fullPrecision.indexOf(".");

  if (decimalPlaces === undefined || decimalIdx === -1) {
    return fullPrecision;
  } else {
    // don't include decimal point if places = 0
    // const num = decimalIdx + (decimalPlaces > 0 ? decimalPlaces + 1 : 0)
    const rawNumber = Number(fullPrecision);

    if (rawNumber === 0) {
      return rawNumber.toFixed(1);
    } else {
      return rawNumber.toFixed(decimalPlaces); //.slice(0, num)
    }
  }
}

export function formatBnMagic(bn, tokenStr, decimalPlaces) {
  const nativePrecison = ALL_TOKENS_MAP[tokenStr].decimals;
  return formatBNToString(bn, nativePrecison, decimalPlaces);
}

export function formatBNToPercentString(bn, nativePrecison, decimalPlaces = 2) {
  return `${formatBNToString(bn, nativePrecison - 2, decimalPlaces)}%`;
}

export function shiftBNDecimals(bn, shiftAmount) {
  if (shiftAmount < 0) throw new Error("shiftAmount must be positive");
  return bn.mul(BigNumber.from(10).pow(shiftAmount));
}
