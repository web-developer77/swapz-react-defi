import { useState } from "react";

import { commify } from "@ethersproject/units";
import { parseUnits, formatUnits } from "@ethersproject/units";

import { useTokenBalance } from "../../hooks/useTokenBalances";
import { useApproveAndDepositXNerve } from "../../hooks/useApproveAndDepositXNerve";
import { useWithdrawXNerve } from "../../hooks/useWithdrawXNerve";

import { formatBnMagic } from "../../utils";

import { XNERVE_TOKEN, NRV } from "../../constants";

import Card from "../../components/tailwind/Card";
import InteractiveInputRow from "../../components/InteractiveInputRow";

export default function XNRVForm() {
  const approveAndDepositXNerve = useApproveAndDepositXNerve();
  const withdrawXNerve = useWithdrawXNerve();

  const XNERVE_TOKEN_BALANCE = useTokenBalance(XNERVE_TOKEN);
  const NRV_TOKEN_BALANCE = useTokenBalance(NRV);

  const [deposit, setDeposit] = useState("");
  const [withdraw, setWithdraw] = useState("");

  return (
    <Card title="xNRV Mint">
      <div className="mt-4">
        <InteractiveInputRow
          title="Mint"
          balanceStr={formatBnMagic(NRV_TOKEN_BALANCE, "NRV", 2)}
          onClickBalance={() => {
            setDeposit(formatUnits(NRV_TOKEN_BALANCE, NRV.decimals));
          }}
          value={deposit}
          placeholder={"0.0"}
          onChange={(e) => setDeposit(e.target.value)}
          disabled={NRV_TOKEN_BALANCE.eq(0) || deposit === ""}
          onClickEnter={() => {
            approveAndDepositXNerve({
              infiniteApproval: true,
              amount: parseUnits(deposit.replace(/,/g, ""), NRV.decimals),
            });

            setDeposit("");
          }}
          buttonLabel="Mint xNRV"
        />
        <InteractiveInputRow
          title="Redeem"
          balanceStr={commify(formatBnMagic(XNERVE_TOKEN_BALANCE, "xNRV", 2))}
          onClickBalance={() => {
            setWithdraw(
              formatUnits(XNERVE_TOKEN_BALANCE, XNERVE_TOKEN.decimals)
            );
          }}
          value={withdraw}
          placeholder={"0.0"}
          onChange={(e) => setWithdraw(e.target.value)}
          disabled={XNERVE_TOKEN_BALANCE.eq(0) || withdraw === ""}
          onClickEnter={() => {
            withdrawXNerve({
              amount: parseUnits(
                withdraw.replace(/,/g, ""),
                XNERVE_TOKEN.decimals
              ),
            });
            setWithdraw("");
          }}
          buttonLabel="Redeem NRV"
        />
      </div>
    </Card>
  );
}
