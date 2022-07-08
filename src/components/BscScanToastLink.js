import { ExternalLinkIcon } from "@heroicons/react/outline";
import { getExplorerTxUrl } from "../utils/urls";

export default function BscScanToastLink({ transactionHash }) {
  const bscScanTxUrl = getExplorerTxUrl({ hash: transactionHash });
  const len = transactionHash.length;
  return (
    <a
      target="_blank"
      href={bscScanTxUrl}
      className="hover:text-blue-500"
      rel="noopener noreferrer"
    >
      {transactionHash.slice(0, 6)}...{transactionHash.slice(len - 5, len)}
      <ExternalLinkIcon className="w-4 h-4 ml-2 inline" />
    </a>
  );
}
