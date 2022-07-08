export function getOnConfrimTransaction({
  poolTokens,
  updateTokenFormState,
  tokenFormState,
  approveAndDepositFunc,
}) {
  async function onConfirmTransaction() {
    const appAndDeposit = await approveAndDepositFunc({
      slippageCustom: null,
      slippageSelected: "ONE_TENTH",
      infiniteApproval: false,
      tokenFormState,
    });
    // Clear input after deposit
    updateTokenFormState(
      poolTokens.reduce((acc, t) => ({ ...acc, [t.symbol]: "" }), {})
    );

    return appAndDeposit;
  }

  return onConfirmTransaction;
}
