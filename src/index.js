"use strict";

import FoxWeb3Provider from "./ethereum_provider";
import FoxWalletSolanaProvider from "./solana_provider";
// import TrustCosmosWeb3Provider from "./cosmos_provider";
import FoxWalletAptosProvider from "./aptos_provider";
import { registerWallet } from "@wallet-standard/core";
import { SuiProvider } from "./sui_provider";
import { initialize } from "foxwallet-standard-wallet";
import { BTCProvider } from "./btc_provider";
import FoxAleoProvider from "./aleo_provider";

window.foxwallet = {
  Provider: FoxWeb3Provider,
  SolanaProvider: FoxWalletSolanaProvider,
  AptosProvider: FoxWalletAptosProvider,
  AleoProvider: FoxAleoProvider,
  postMessage: null,
};

window.aptos = new FoxWalletAptosProvider();
window.petra = window.aptos;
if (window.foxwallet) {
  window.foxwallet.aptos = window.aptos;
}

let foxWalletSolanaProvider = new FoxWalletSolanaProvider();
initialize(foxWalletSolanaProvider);

window.solana = foxWalletSolanaProvider;
if (window.foxwallet) {
  window.foxwallet.solana = window.solana;
}

window.suiWallet = new SuiProvider();

registerWallet(window.suiWallet);

window.foxwallet.suiWallet = window.suiWallet;

window.unisat = new BTCProvider();
window.foxwallet.bitcoin = window.unisat;
