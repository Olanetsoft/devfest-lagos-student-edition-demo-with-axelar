# Devfest Lagos Student Edition Demo with Axelar

This is a cross-chain bounty DApp that allows users to send tokens as bounty from one chain to another. This DApp is built using Solidity, Next.js and [Axelar General Message Passing](https://docs.axelar.dev/dev/general-message-passing/overview).

## **Table of Contents**

- [**Features**](https://github.com/Olanetsoft/devfest-lagos-student-edition-demo-with-axelar#features)
- [**Installation**](#installation)
- [**Usage**](#usage)
- [**Technologies Used**](#technologies-used)
- [**Contributing**](#contributing)

## **Features**

- Token from one chain to another
- Bounty stats
- User-friendly interface with dark mode support
- Integration with Axelar General Message Passing
- Real-time response and bounty status updates

## **Installation**

To install and run this application locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/Olanetsoft/devfest-lagos-student-edition-demo-with-axelar.git
   ```

2. Navigate to the project directory:

   ```bash
   cd devfest-lagos-student-edition-demo-with-axelar
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Navigate to the hardhat directory:

   ```bash
   cd hardhat
   ```

5. Set up the environment variables to deploy the smart contracts:

   - Create a `.env` file in the hardhat directory.
   - Define the following variables in the `.env` file:
     ```apache
      PRIVATE_KEY=<Your Wallet Private Key>
     ```
     Replace `<Your Wallet Private Key>` with your wallet private key.

6. Compile and Deploy the smart contracts:

   ```bash
   npm i
   npx hardhat run scripts/deploy.js --network <network>
   ```

   Replace `<network>` with the desired network (e.g. `fantom` and `avalanche` in this case). Copy the contract address once the deployment is complete.

   > Ensure you update the Axelar gateway and gas service address for Binance and Avalanche respectively in `deploy.js` file under the `scripts` directory and deploy them separately. You can find the gateway and gas service address [here](https://docs.axelar.dev/resources/testnet).

7. Set up the environment variables:

   - Create a `.env.local` file in the root directory.
   - Define the following variables in the `.env.local` file:
     ```apache
     NEXT_PUBLIC_FANTOM_CONTRACT_ADDRESS=<Fantom contract address>
     NEXT_PUBLIC_AVALANCHE_CONTRACT_ADDRESS=<Avalanche contract address>
     NEXT_PUBLIC_AVALANCHE_RPC_URL=https://avalanche-fuji-c-chain.publicnode.com
     ```
     Replace `<Fantom contract address>` and `<Avalanche contract address>`, with the respective values.

8. Start the development server:

```bash
cd ..
npm run dev
```

9.  Access the application in your browser:

Open your web browser and visit [`http://localhost:3000`](http://localhost:3000) to see the application running.

## **Usage**

1. Connect your wallet to the DApp. Ensure you have some test tokens in your wallet.
2. Approve the DApp to spend your tokens.
3. Enter the amount of tokens for the bounty, receivers addresses and click on the `Send` button.
4. Confirm the transaction in your wallet.
5. Wait for the transaction to be confirmed. You can check the status of the transaction in the `Bounty Stats` section.

## **Technologies Used**

- React
- Solidity
- [Axelar General Message Passing](https://docs.axelar.dev/dev/general-message-passing/overview)
- @rainbow-me/rainbowkit
- wagmi
- ethers.js
- Next.js
- Toastify
- CSS (Tailwind CSS)

## **Contributing**

Contributions are welcome! If you find any issues or want to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with descriptive messages.
4. Push your changes to your forked repository.
5. Submit a pull request detailing your changes.
