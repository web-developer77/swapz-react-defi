export default function YourDepositWillBeCredited({ account }) {
  return (
    <small className="text-gray-500 my-2">
      Your deposit will typically be credited in 10-20 minutes <br />
      to this BSC address: {account}
    </small>
  );
}
