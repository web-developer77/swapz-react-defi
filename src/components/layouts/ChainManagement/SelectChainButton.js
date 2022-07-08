export default function SelectChainButton({ onClick, children, className }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`w-full cursor-pointer px-4 py-2 border border-transparent rounded-lg text-white focus:outline-none ${className}`}
    >
      <span>{children}</span>
    </button>
  );
}
