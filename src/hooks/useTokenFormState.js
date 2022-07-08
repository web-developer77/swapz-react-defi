import { useState } from "react";

import { Zero } from "@ethersproject/constants";

import { numberInputStateCreator } from "../utils/numberInputState";

export function useTokenFormState(tokens) {
  // Token input state handlers
  const tokenInputStateCreators = tokens.reduce(
    (acc, token) => ({
      ...acc,
      [token.symbol]: numberInputStateCreator(token.decimals, Zero),
    }),
    {}
  );

  // Token input values, both "raw" and formatted "safe" BigNumbers
  const [tokenFormState, setTokenFormState] = useState(
    tokens.reduce(
      (acc, token) => ({
        ...acc,
        [token.symbol]: tokenInputStateCreators[token.symbol](""),
      }),
      {}
    )
  );

  function updateTokenFormState(newState) {
    const convertedNewState = Object.keys(newState).reduce(
      (acc, symbol) => ({
        ...acc,
        [symbol]: tokenInputStateCreators[symbol](newState[symbol]),
      }),
      {}
    );
    setTokenFormState((prevState) => ({
      ...prevState,
      ...convertedNewState,
    }));
  }

  return [tokenFormState, updateTokenFormState];
}
