import { useSwapPoolMagic } from "../../hooks/useSwapPoolMagic";
import DepositDisplay from "./DepositDisplay";

export default function PoolManagement(props) {
  const poolMagicProps = useSwapPoolMagic(props);

  return <DepositDisplay {...props} {...poolMagicProps} />;
}
