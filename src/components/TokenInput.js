import { SWAPABLE_TOKENS_MAP } from "../constants";

import InteractiveInputRow from "../components/InteractiveInputRow";

import { parseUnits } from "@ethersproject/units";
import { formatBnMagic } from "../utils";
import { ALL_TOKENS_MAP } from "../constants";

function TokenInput({ symbol, icon, max, inputValue, onChange }) {
  function onClickMax(e) {
    e.preventDefault();
    const maxStr = String(max);
    if (maxStr !== "undefined") {
      onChange(maxStr);
    }
  }

  function onChangeInput(e) {
    const { decimals } = SWAPABLE_TOKENS_MAP[symbol];
    const parsedValue = parseFloat("0" + e.target.value);
    const periodIndex = e.target.value.indexOf(".");
    const isValidInput = e.target.value === "" || !isNaN(parsedValue);
    const isValidPrecision =
      periodIndex === -1 || e.target.value.length - 1 - periodIndex <= decimals;
    if (isValidInput && isValidPrecision) {
      // don't allow input longer than the token allows
      onChange(e.target.value);
    }
  }

  let balanceStr;
  if (max && max !== "") {
    balanceStr = formatBnMagic(
      parseUnits(max, ALL_TOKENS_MAP[symbol].decimals),
      symbol,
      4
    );
  } else {
    balanceStr = "0.0";
  }

  return (
    <div className=" items-center">
      <div className="w-full">
        <InteractiveInputRow
          title={symbol}
          balanceStr={balanceStr}
          onClickBalance={onClickMax}
          value={inputValue}
          placeholder={"0.0"}
          onChange={onChangeInput}
          disabled={inputValue === ""}
          showButton={false}
          icon={icon}
        />
      </div>
    </div>
  );
}

export default TokenInput;
