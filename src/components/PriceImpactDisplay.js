import { formatBNToPercentString } from "../utils";

export default function PriceImpactDisplay({ priceImpact }) {
  let colorClassName;
  let labelText;
  if (priceImpact.gt(0)) {
    colorClassName = "text-green-500";
    labelText = "Bonus";
  } else if (priceImpact.lt(0)) {
    colorClassName = "text-red-500";
    labelText = "Price Impact";
  }

  return (
    <div className="inline-flex mt-3 text-sm">
      {labelText && (
        <div>
          <span>{labelText}: </span>{" "}
          <span className={colorClassName}>
            {formatBNToPercentString(priceImpact, 18, 4)}
          </span>
        </div>
      )}
    </div>
  );
}
