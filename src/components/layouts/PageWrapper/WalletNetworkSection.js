import { useActiveWeb3React } from "../../../hooks/useActiveWeb3React";

import WalletManagement from "../../layouts/WalletManagement";
import ChainManagement from "../../layouts/ChainManagement";

export default function WalletNetworkSection() {
  const { account } = useActiveWeb3React();
  return (
    <>
      <WalletManagement />
      {account && <ChainManagement />}
    </>
  );
}
