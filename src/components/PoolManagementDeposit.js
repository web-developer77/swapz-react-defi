import _ from "lodash";
import TokenInput from "../components/TokenInput";
import BaseButton from "../components/BaseButton";
import PriceImpactDisplay from "../components/PriceImpactDisplay";

export default function PoolManagementDeposit({
  onChangeTokenInputValue,
  tokens,
  onConfirmTransaction,
  priceImpact,
}) {
  const sumInputValues = _.sum(
    tokens.map((i) => {
      if (i.inputValue === "") {
        return 0;
      } else {
        return Number(i.inputValue);
      }
    })
  );

  return (
    <div className="flex-col">
      {tokens.map((token, key) => (
        <div className="mt-4">
          <TokenInput
            symbol={token.symbol}
            icon={token.icon}
            max={token.max}
            inputValue={token.inputValue}
            onChange={(value) => onChangeTokenInputValue(token.symbol, value)}
            disabled={false}
            key={key}
          />
        </div>
      ))}
      <BaseButton
        fancy={true}
        disabled={!(sumInputValues > 0)}
        className="w-full mt-4 text-md items-center px-6 py-3 rounded-lg"
        onClick={async () => {
          await onConfirmTransaction?.();
        }}
      >
        Deposit
      </BaseButton>
      <PriceImpactDisplay priceImpact={priceImpact} />
    </div>
  );
}
