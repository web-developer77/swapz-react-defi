import BaseButton from "../../../components/BaseButton"

export default function WalletConnectButton({ children, className, ...props }) {
  return (
    <BaseButton
      type="button"
      className={`w-full cursor-pointer px-0 py-0 rounded-lg focus:outline-none shadow-lg ${className}`}
      fancy={true}
      {...props}
    >
      <span>{children}</span>
    </BaseButton>
  )
}
