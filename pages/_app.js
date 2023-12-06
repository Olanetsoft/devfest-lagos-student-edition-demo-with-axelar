import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import {
  avalancheFuji,
  baseGoerli,
  polygonMumbai,
  fantomTestnet,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import "../styles/globals.css";

const { chains, publicClient } = configureChains(
  [avalancheFuji, baseGoerli, polygonMumbai, fantomTestnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  projectId: "573d60ae210e8d772ee485c4483cff78",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />;
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
