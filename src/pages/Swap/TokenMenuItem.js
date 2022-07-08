import classNames from "classnames";
import { commify } from "@ethersproject/units";
import { formatBnMagic } from "../../utils";
import { useTokenBalance } from "../../hooks/useTokenBalances";

import {
  getMenuItemStyleForCoin,
  getMenuItemBgForCoin,
  getBorderStyleForCoin,
} from "../../utils/coinStyles";

export default function TokenMenuItem({ active, coin, selected, onClick }) {
  const tokenBalance = useTokenBalance(coin);

  const formattedBalance = commify(formatBnMagic(tokenBalance, coin.symbol, 2));

  const isCurrentlySelected = selected.symbol === coin.symbol;

  return (
    <div className="px-2 py-1 bg-transparent">
      <div
        onClick={onClick}
        className={classNames(
          "cursor-pointer px-4 py-4 transition w-full",
          "rounded-lg border",
          getMenuItemStyleForCoin(coin),
          {
            [getMenuItemBgForCoin(coin)]: active,
            [getBorderStyleForCoin(coin)]: isCurrentlySelected,
            "border-coolGray-100": !isCurrentlySelected,
          }
        )}
      >
        <img className="w-6 mr-2 inline-block " src={coin.icon} />
        <div className="inline-block">
          <span>{coin.symbol}</span>
          <span className="text-coolGray-500 text-sm"> - {coin.name}</span>
        </div>
        <div className="inline-block float-right pt-1.5">
          {!tokenBalance.eq(0) && (
            <p className="text-xs text-coolGray-600 text-right">
              {formattedBalance}
              <span className="text-coolGray-400"> {coin.symbol}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
