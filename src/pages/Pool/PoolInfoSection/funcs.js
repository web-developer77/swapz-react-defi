import { commify } from "@ethersproject/units";

import { POOL_FEE_PRECISION } from "../../../constants";

import { formatBNToPercentString, formatBNToString } from "../../../utils";

export function commifyBnToString(value, decimals = 2) {
  return commify(formatBNToString(value, 18, decimals));
}

export function commifyBnWithDefault(value, decimals) {
  return value ? commifyBnToString(value, decimals) : "0";
}

export function bnPercentFormat(value) {
  return value ? formatBNToPercentString(value, POOL_FEE_PRECISION) : null;
}
