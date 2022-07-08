import Slider from "react-input-slider";

import { getCoinTextColor } from "../utils/coinStyles";

import Grid from "../components/tailwind/Grid";

import TokenInput from "../components/TokenInput";
import RadioButton from "../components/RadioButton";
import PriceImpactDisplay from "../components/PriceImpactDisplay";

export default function PoolManagementWithdraw({
  onFormChange,
  formStateData,
  tokens,
  onConfirmTransaction,
  priceImpact,
}) {
  return (
    <div>
      <div className="percentage">
        <span>Withdraw Percentage(%) </span>
        <input
          className="px-2 py-1 w-1/5 border bg-transparent border-gray-500 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="100"
          onChange={(e) =>
            onFormChange({
              fieldName: "percentage",
              value: e.currentTarget.value,
            })
          }
          onFocus={(e) => e.target.select()}
          value={formStateData.percentage ? formStateData.percentage : ""}
        />
        <div className="my-2">
          <Slider
            axis="x"
            xstep={1}
            xmin={0}
            xmax={100}
            x={formStateData.percentage ? formStateData.percentage : "100"}
            onChange={({ x }) => {
              onFormChange({
                fieldName: "percentage",
                value: String(x),
              });
            }}
            styles={{
              track: {
                backgroundColor: "#E0E7FF",
                width: "95%",
              },
              active: {
                backgroundColor: "#6366F1",
              },
              thumb: {
                backgroundColor: "#312E81",
              },
            }}
          />
        </div>
        {formStateData.error && (
          <div className="error">{formStateData.error.message}</div>
        )}
      </div>
      <Grid gap={0} cols={{ xs: 2 }} className=" mt-2">
        <RadioButton
          checked={formStateData.withdrawType === "ALL"}
          onChange={() =>
            onFormChange({
              fieldName: "withdrawType",
              value: "ALL",
            })
          }
          label="Combo"
        />
        {tokens.map((t) => {
          return (
            <RadioButton
              radioClassName={getCoinTextColor(t)}
              key={t.symbol}
              checked={formStateData.withdrawType === t.symbol}
              onChange={() =>
                onFormChange({
                  fieldName: "withdrawType",
                  value: t.symbol,
                })
              }
              label={t.name}
            />
          );
        })}
      </Grid>

      {tokens.map((token, index) => {
        return (
          <div className="mt-4" key={index}>
            <TokenInput
              {...token}
              // inputValue={parseFloat(token.inputValue).toFixed(5)}
              onChange={(value) =>
                onFormChange({
                  fieldName: "tokenInputs",
                  value: value,
                  tokenSymbol: token.symbol,
                })
              }
            />
          </div>
        );
      })}
      <button
        className="w-full mt-4 text-md items-center px-6 py-3 border border-transparent rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={async () => {
          await onConfirmTransaction?.();
        }}
      >
        Withdraw
      </button>
      <PriceImpactDisplay priceImpact={priceImpact} />
    </div>
  );
}
