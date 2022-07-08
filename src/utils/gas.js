export const GAS_PRICES_NUMERIC = {
  DEFAULT: 5, // what the binance network does by default
  STANDARD: 6, // what we standardize on accross the application
  FAST: 7,
  INSTANT: 15,
  CUSTOM: 20,
};

export function getGasPrice(gasPriceSelected) {
  const gasPrice =
    GAS_PRICES_NUMERIC[gasPriceSelected] ?? GAS_PRICES_NUMERIC.STANDARD;

  return gasPrice;
}
