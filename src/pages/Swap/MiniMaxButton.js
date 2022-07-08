import BaseButton from "../../components/BaseButton";
import Tooltip from "../../components/tailwind/Tooltip";

export default function MiniMaxButton({
  formattedBalance,
  inputValue,
  selected,
  onClickBalance,
}) {
  return (
    <Tooltip
      content={
        <>
          <b>{formattedBalance}</b> {selected.symbol}
        </>
      }
    >
      <BaseButton
        className="pt-1 pb-1 text-xs"
        // fancy={allowMax}
        fancy={formattedBalance === `${Number(inputValue)}`}
        outline={true}
        onClick={onClickBalance}
      >
        Max
      </BaseButton>
    </Tooltip>
  );
}
