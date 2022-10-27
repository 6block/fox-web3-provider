// Copyright © 2017-2022 Trust Wallet.
//
// This file is part of Trust. The full Trust copyright notice, including
// terms governing use, modification, and redistribution, is contained in the
// file LICENSE at the root of the source code distribution tree.

"use strict";

import TrustWeb3Provider from "./ethereum_provider";
import FoxWalletSolanaProvider from "./solana_provider";
// import TrustCosmosWeb3Provider from "./cosmos_provider";
import FoxWalletAptosProvider from "./aptos_provider";

window.foxwallet = {
  Provider: TrustWeb3Provider,
  SolanaProvider: FoxWalletSolanaProvider,
  // CosmosProvider: TrustCosmosWeb3Provider,
  AptosProvider: FoxWalletAptosProvider,
  postMessage: null,
};


window.aptos = new FoxWalletAptosProvider();
window.petra = window.aptos;
if(window.foxwallet){
  window.foxwallet.aptos = window.aptos;
}

window.solana = new FoxWalletSolanaProvider();
window.clover_solana = window.solana;
window.phantom = {solana: window.solana};
window.glowSolana = window.solana;
if(window.foxwallet){
  window.foxwallet.solana = window.solana;
}
