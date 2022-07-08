import { Web3Provider } from "@ethersproject/providers";

export default function getLibrary(provider) {
  const library = new Web3Provider(provider, "any");
  library.pollingInterval = 2500;
  return library;
}
