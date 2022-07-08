import { ChainId } from "../../constants/networks";

export function getNetworkButtonBgClassName(chainSymbol) {
  switch (chainSymbol) {
    case "BSC":
      return "bg-gray-800 hover:bg-gray-900 active:bg-[#3c3c44]";
    case "ETH":
      return "bg-[#5170ad] hover:bg-[#3f4f8c] active:bg-[#314367]";
    default:
      return "";
  }
}

export function getNetworkButtonBorderClassName(chainSymbol) {
  switch (chainSymbol) {
    case "BSC":
      return "hover:!border-[#ecae0b]";
    case "ETH":
      return "hover:!border-[#5170ad]";
    default:
      return "";
  }
}

export function getNetworkTextColor(chainId) {
  switch (chainId) {
    case ChainId.BSC:
      return "text-[#ecae0b]";
    case ChainId.ETH:
      return "text-[#5170ad]";
    default:
      return "";
  }
}

export function getNetworkTextColorContrast(chainId) {
  switch (chainId) {
    case ChainId.BSC:
      return "text-[#ecae0b]";
    case ChainId.ETH:
      return "text-white";
    default:
      return "";
  }
}
