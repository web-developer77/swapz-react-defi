import { commify } from "@ethersproject/units";

import { ChainId } from "../../constants/networks";

import { useActiveWeb3React } from "../../hooks/useActiveWeb3React";

import { useClaimAirdrop2 } from "../../hooks/useClaimAirdrop2";

import Grid from "../../components/tailwind/Grid";
import Card from "../../components/tailwind/Card";

import { useAirdropBalance2 } from "../../hooks/useTokenBalances";
import { formatBNToString } from "../../utils";
import BaseButton from "../../components/BaseButton";

export default function AirdropCard2() {
  const { chainId } = useActiveWeb3React();

  const claimAmount = useAirdropBalance2();

  let claimSection;
  if (chainId === ChainId.BSC) {
    const formattedClaimBalance = commify(formatBNToString(claimAmount, 18, 0));

    claimSection = (
      <div className="-mb-3">
        <Grid cols={{ xs: 1 }} className="text-coolGray-400">
          <div className="w-full text-center py-2">
            <div className="text-xl text-gray-700 text-center">
              {formattedClaimBalance}{" "}
            </div>
            <span className={`font-medium text-indigo-500`}>NRV</span>
          </div>
        </Grid>
        <div className="space-y-2">
          <ClaimButton2 claimAmount={claimAmount} />
        </div>
      </div>
    );
  } else {
    claimSection = (
      <div className="max-w-[500px] text-coolGray-500">
        Switch to <span className={"text-gray-800"}>BSC</span> to claim
      </div>
    );
  }

  return (
    <Card
      title="Claim Tokens (May 1 to July 5)"
      divider={false}
      style={{ minWidth: 380 }}
      className={`
        shadow-indigo-xl hover:shadow-purple-2xl
        transform transition-all duration-100 rounded-2xl
        min-w-[380px]
      `}
    >
      {claimSection}
    </Card>
  );
}

function ClaimButton2({ claimAmount }) {
  const claimAirdrop = useClaimAirdrop2();
  return (
    <BaseButton
      fancy={true}
      disabled={!(claimAmount > 0)}
      onClick={async () => {
        claimAirdrop();
      }}
      className={`
                    mt-4 px-4 py-3 text-base font-medium rounded-xl w-full
                    shadow-indigo-lg hover:shadow-indigo-xl
                    text-white focus:outline-none
                    `}
    >
      Claim
    </BaseButton>
  );
}
