import classNames from "classnames";

import { Link } from "react-router-dom";

import { commify } from "@ethersproject/units";

import { formatBnMagic } from "../../utils";

import Grid from "../../components/tailwind/Grid";

export default function BalanceSection({
  label,
  balance,
  token,
  overrideSymbol,
  linkTo,
}) {
  const labelContent = <small>{label} </small>;

  let labelDisplay;
  if (linkTo) {
    labelDisplay = (
      <Link to={linkTo} className="hover:underline hover:text-gray-600">
        {labelContent}
      </Link>
    );
  } else {
    labelDisplay = labelContent;
  }

  return (
    <Grid gap={2} cols={{ xs: 1 }}>
      <div className="text-right text-purple-700">
        {labelDisplay}
        <small>
          <FancyBalance token={token} balance={balance} />
          {/* {balance !== 0 && (
            <i className="text-gray-400 text-md">
              {" "}
              {overrideSymbol ?? token.symbol}
            </i>
          )} */}
        </small>
      </div>
    </Grid>
  );
}

function FancyBalance({ token, balance }) {
  const formattedBalance = commify(formatBnMagic(balance, token.symbol, 8));
  const arr = formattedBalance.split(".");
  const integerStr = arr[0];
  const decimalStr = arr[1];

  return (
    <>
      <span
        className={classNames({
          "text-gray-800": integerStr !== "0",
          "text-gray-700": integerStr === "0",
        })}
      >
        {integerStr}.
      </span>

      <span
        className={classNames({
          "text-gray-800 text-xs": decimalStr !== "0",
          "text-gray-700": decimalStr === "0",
        })}
      >
        {decimalStr}
      </span>
    </>
  );
}
