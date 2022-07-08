import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import { Web3ReactProvider, createWeb3ReactRoot } from "@web3-react/core";

import { NetworkContextName } from "./constants/networks";

import getLibrary from "./utils/getLibrary";

import { ApolloProvider, APOLLO_CLIENT } from "./graphql";

import { Store } from "./store";

import { WATERBEAR_ASCII_ART, THE_PLAN } from "./constants/misc";

import App from "./App";

import "./styles/global.css";

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

// The Plan
console.log(WATERBEAR_ASCII_ART);
console.log(THE_PLAN);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <ApolloProvider client={APOLLO_CLIENT}>
          <Store>
            <Router>
              <App />
            </Router>
          </Store>
        </ApolloProvider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </React.StrictMode>
);
