import _ from "lodash";

import { format } from "date-fns";

import { commify } from "@ethersproject/units";

import { NRVBTC_SWAP_ADDRESSES, POOLS_MAP } from "../../constants";
import { ChainId } from "../../constants/networks";

import { formatBNToString, formatBnMagic } from "../../utils";
import { getExplorerTxUrl } from "../../utils/urls";

import TableCell from "../../components/tailwind/TableCell";

import NarrowArrowIcon from "../../components/icons/NarrowArrowIcon";

function getHashFragment(hash) {
  return `${hash.slice(0, 6)}...${hash.slice(-4, hash.length)}`;
}

function buildCompatibleDate(dt) {
  return new Date(dt.split(" ").join("T"));
}

export default function ContractEventDataRow({
  block,
  smartContract,
  transaction,
  fuckingArguments,
  poolName,
}) {
  const groupedArguments = groupArguments(fuckingArguments);

  const isBtcSwapPool =
    smartContract.address.address.toUpperCase() ===
    NRVBTC_SWAP_ADDRESSES[ChainId.BSC].toUpperCase();

  let valueCellContent;
  if (isBtcSwapPool && groupedArguments["soldId"][0].value === 1) {
    valueCellContent = formatBNToString(
      groupedArguments["tokensSold"][0].value,
      8,
      4
    );
  } else {
    valueCellContent = commify(
      formatBNToString(groupedArguments["tokensSold"][0].value, 18, 14)
    );
  }

  return (
    <tr>
      <TableCell>
        {format(buildCompatibleDate(block.timestamp.time), "PPpp")}
      </TableCell>
      <TableCell>
        <a
          href={getExplorerTxUrl(transaction)}
          className="hover:text-blue-600 active:text-blue-800"
          target="_blank"
        >
          {getHashFragment(transaction.hash)}
        </a>
      </TableCell>
      <TableCell>
        <TokenBlob
          token={POOLS_MAP[poolName][groupedArguments["soldId"][0].value]}
          value={groupedArguments["tokensSold"][0].value}
        />
        <NarrowArrowIcon className="inline w-4 h-4 text-gray-400 justify-self-center" />
        <TokenBlob
          token={POOLS_MAP[poolName][groupedArguments["boughtId"][0].value]}
          value={groupedArguments["tokensBought"][0].value}
        />
      </TableCell>
    </tr>
  );
}

function TokenBlob({ token, value }) {
  const formattedValue = formatBnMagic(value, token.symbol, 14);
  return (
    <div className="inline-block px-2 pb-0.5">
      <div>
        <img src={token?.icon} className="inline w-4 h-4 mr-1" />
        <span className="text-xs font-medium text-gray-500 mt-1">
          {token.symbol}
        </span>
      </div>
      <div>
        <small>{formattedValue}</small>
      </div>
    </div>
  );
}

function groupArguments(fuckingArguments) {
  return _.groupBy(fuckingArguments, "argument");
}
