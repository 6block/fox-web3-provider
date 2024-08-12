"use strict";

import FoxWeb3Provider from "./ethereum_provider";
import FoxWalletSolanaProvider from "./solana_provider";
import FoxWalletAptosProvider from "./aptos_provider";
import { registerWallet } from "@wallet-standard/core";
import { SuiProvider } from "./sui_provider";
import { initialize } from "foxwallet-standard-wallet";
import { BTCProvider } from "./btc_provider";
import FoxAleoProvider from "./aleo_provider";
import FoxQtumProvider from "./qtum_provider";
import { NOSTRProvider } from "./nostr_provider";
import { CustomProvider } from "./custom_provider";
import FoxCosmosProvider from "./cosmos_provider";
import { TONProvider } from "./ton_provider";

window.foxwallet = {
  Provider: FoxWeb3Provider,
  BitcoinProvider: BTCProvider,
  SolanaProvider: FoxWalletSolanaProvider,
  AptosProvider: FoxWalletAptosProvider,
  AleoProvider: FoxAleoProvider,
  QtumProvider: FoxQtumProvider,
  NostrProvider: NOSTRProvider,
  TonProvider: TONProvider,
  CosmosProvider: FoxCosmosProvider,
  postMessage: null,
};

const initSolWallet = (config) => {
  let foxWalletSolanaProvider = new FoxWalletSolanaProvider(config);
  initialize(foxWalletSolanaProvider);

  window.solana = foxWalletSolanaProvider;
  if (window.foxwallet) {
    window.foxwallet.solana = window.solana;
  }
};

window.initSolWallet = initSolWallet;

const initSuiWallet = (config) => {
  if (window.suiWallet || window.foxwallet.suiWallet) {
    return;
  }
  window.suiWallet = new SuiProvider(config);
  registerWallet(window.suiWallet);
  window.foxwallet.suiWallet = window.suiWallet;
};
window.initSuiWallet = initSuiWallet;

window.foxwallet.custom = new CustomProvider();
