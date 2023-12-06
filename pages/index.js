import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useContractWrite,
  useContractRead,
  useWaitForTransaction,
  erc20ABI,
  useAccount,
} from "wagmi";
import { ethers } from "ethers";
import {
  AxelarQueryAPI,
  Environment,
  EvmChain,
  GasToken,
} from "@axelar-network/axelarjs-sdk";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BountyContract from "../hardhat/artifacts/contracts/Bounty.sol/Bounty.json";

const FANTOM_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FANTOM_CONTRACT_ADDRESS;
const AVALANCHE_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_AVALANCHE_CONTRACT_ADDRESS;
const AVALANCHE_RPC_URL = process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL;

export default function Home() {
  const [amount, setAmount] = useState(0);

  // Addresses to send aUSDC to
  const [Addresses, setAddresses] = useState("");
  const { address } = useAccount();

  // Visibility of buttons and textarea  based on the state of the app
  const [isSendButtonVisible, setIsSendButtonVisible] = useState(false);
  const [isApproveButtonVisible, setIsApproveButtonVisible] = useState(true);
  const [isTextareaVisible, setIsTextareaVisible] = useState(false);

  // Axelar API
  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });
  const [gasFee, setGasFee] = useState(0);

  // Token Status
  const [amountReceived, setAmountReceived] = useState(0);
  const [bountyRecipients, setBountyRecipients] = useState([]);

  const toastOptions = {
    position: "top-right",
    autoClose: 8000,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
  };

  // Approve USDC to be spent by the contract
  const { data: useContractWriteUSDCData, write: approveWrite } =
    useContractWrite({
      address: "0x75Cc4fDf1ee3E781C1A3Ee9151D5c6Ce34Cf5C61", // Address of the aUSDC contract on Fantom
      abi: erc20ABI,
      functionName: "approve",
      args: [
        FANTOM_CONTRACT_ADDRESS,
        ethers.utils.parseUnits(amount.toString(), 6),
      ],
    });

  const { data: useWaitForTransactionUSDCData, isSuccess: isUSDCSuccess } =
    useWaitForTransaction({
      hash: useContractWriteUSDCData?.hash,
    });

  // Check Allowance
  const {
    data: readAllowance,
    isError: isAllowanceError,
    isLoading: isAllowanceLoading,
  } = useContractRead({
    address: "0x75Cc4fDf1ee3E781C1A3Ee9151D5c6Ce34Cf5C61", // Address of the aUSDC contract on Fantom
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, FANTOM_CONTRACT_ADDRESS],
  });

  // Estimate Gas
  const gasEstimator = async () => {
    const gas = await api.estimateGasFee(
      EvmChain.FANTOM,
      EvmChain.AVALANCHE,
      GasToken.FANTOM,
      700000,
      2
    );
    setGasFee(gas);
  };

  // Send Bounty
  const { data: useContractWriteData, write } = useContractWrite({
    address: FANTOM_CONTRACT_ADDRESS,
    abi: BountyContract.abi,
    functionName: "sendToMany",
    args: [
      "Avalanche",
      AVALANCHE_CONTRACT_ADDRESS,
      Addresses.split(","),
      "aUSDC",
      ethers.utils.parseUnits(amount.toString(), 6),
    ],
    value: gasFee,
  });

  const { data: useWaitForTransactionData, isSuccess } = useWaitForTransaction({
    // Calling a hook to wait for the transaction to be mined
    hash: useContractWriteData?.hash,
  });

  // Utility function to validate an Ethereum address
  const isValidAddress = (address) => {
    return (
      address &&
      ethers.utils.isAddress(address) &&
      address !== "0x0000000000000000000000000000000000000000"
    );
  };

  // Handle send Bounty button
  const handleSendBounty = async () => {
    if (!(amount && Addresses)) {
      toast.error("Please enter amount and addresses", toastOptions);
      return;
    }

    // Split addresses and validate each
    const addressArray = Addresses.split(",");
    if (!addressArray.every(isValidAddress)) {
      toast.error("Invalid or zero address detected", toastOptions);
      return;
    }

    if (isAllowanceError) {
      toast.error("Error checking allowance", toastOptions);
      return;
    }

    write();
    toast.info("Sending Bounty...", {
      ...toastOptions,
    });
  };

  // Handle Approval
  const handleApprove = () => {
    if (!amount) {
      toast.error("Please enter amount", toastOptions);
      return;
    }
    approveWrite();

    toast.info("Approving...", toastOptions);
  };

  // Read data from Avalanche
  const provider = new ethers.providers.JsonRpcProvider(AVALANCHE_RPC_URL);
  const contract = new ethers.Contract(
    AVALANCHE_CONTRACT_ADDRESS,
    BountyContract.abi,
    provider
  );

  async function readDestinationChainVariables() {
    try {
      const amountReceived = await contract.amountReceived();

      const bountyRecipients = await contract.getRecipients();

      setAmountReceived(amountReceived.toString());

      setBountyRecipients(bountyRecipients);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    gasEstimator();

    isSuccess
      ? toast.success("Bounty sent!", {
          toastOptions,
        })
      : useWaitForTransactionData?.error || useContractWriteData?.error
      ? toast.error("Error sending message")
      : null;

    if (isUSDCSuccess) {
      toast.success("aUSDC Approved!", { toastOptions });
      setIsApproveButtonVisible(false);
      setIsSendButtonVisible(true);
      setIsTextareaVisible(true);
    } else if (
      useWaitForTransactionUSDCData?.error ||
      useContractWriteUSDCData?.error
    ) {
      toast.error("Error approving USDC", { toastOptions });
    }

    // Interval to periodically update the data
    const intervalId = setInterval(() => {
      readDestinationChainVariables();
    }, 10000); // Update every 10000 milliseconds (10 seconds)

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [
    useContractWriteData,
    useWaitForTransactionData,
    useContractWriteUSDCData,
    useWaitForTransactionUSDCData,
  ]);

  return (
    <div className="container mx-auto px-4 flex flex-col min-h-screen">
      <header className="py-4">
        <div className="flex justify-between items-center">
          <a href="https://github.com/Olanetsoft/devfest-lagos-student-edition-demo-with-axelar" className="text-2xl font-bold text-gray-800">
            <FaGithub />
          </a>
          <ConnectButton />
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center">
        <div
          className="bg-white rounded-lg p-8 m-4"
          style={{
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 20px 10px -5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h1 className="text-5xl font-bold mb-10 text-center text-gray-800">
            Cross-chain Bounty dApp with{" "}
            <span className="text-blue-600">Axelar 🔥</span>
          </h1>
          <p className="text-center max-w-4xl mx-auto text-lg text-gray-600">
            A cross-chain decentralized application using NextJs, Solidity, and
            Axelar General Message Passing that allows users to receive bounties
            cross-chain.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="max-w-2xl bg-white border border-gray-200 rounded-lg shadow-md p-8 m-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Send Bounty 💸 Fantom to Avalanche
            </h2>
            <div className="mb-6">
              <label className="block font-semibold text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {isTextareaVisible && (
              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">
                  Addresses
                </label>
                <textarea
                  placeholder="Enter addresses (separate with a comma)"
                  className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                  onChange={(e) => setAddresses(e.target.value)}
                />
              </div>
            )}
            {isApproveButtonVisible && (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg mr-4 mb-4 transition duration-200"
                onClick={() => handleApprove()}
              >
                Approve
              </button>
            )}
            {isSendButtonVisible && (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                onClick={handleSendBounty}
              >
                Send
              </button>
            )}
          </div>

          <div className="max-w-2xl bg-white border border-gray-200 rounded-lg shadow-md p-8 m-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Bounty Status 🎉
            </h2>
            {bountyRecipients.length > 0 ? (
              <div className="space-y-4">
                <p className="font-semibold text-gray-700">
                  Total Amount:{" "}
                  <span className="font-normal">
                    {amountReceived / 1000000} aUSDC
                  </span>
                </p>
                <p className="font-semibold text-gray-700">
                  Total Addresses:{" "}
                  <span className="font-normal">{bountyRecipients.length}</span>
                </p>
                {bountyRecipients.map((recipient, index) => (
                  <div
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                    key={index}
                  >
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">
                      Recipient #{index + 1}
                    </h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">
                        Address:
                      </span>
                      <span className="font-normal text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                        {recipient.substr(0, 6) + "..." + recipient.substr(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        Amount Received:
                      </span>
                      <span className="font-normal text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        {(
                          amountReceived /
                          bountyRecipients.length /
                          1000000
                        ).toFixed(2)}{" "}
                        aUSDC
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-red-500">Waiting for response...</span>
            )}
          </div>
        </div>

        {/* <div className="flex justify-center">
          <div className="border border-gray-300 rounded-lg p-8 m-2">
            <h2 className="text-2xl font-bold mb-4">
              Sent Bounty 💸 Fantom to Avalanche
            </h2>
            <div className="flex flex-col mb-4">
              <label className="font-semibold mb-2">Amount</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="border border-gray-300 rounded-lg p-2"
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {isTextareaVisible && (
              <div className="flex flex-col mb-4">
                <label className="font-semibold mb-2">Addresses</label>
                <textarea
                  placeholder="Enter addresses (separate with a comma)"
                  className="border border-gray-300 rounded-lg p-2 h-32"
                  onChange={(e) => setAddresses(e.target.value)}
                />
              </div>
            )}
            {isApproveButtonVisible && (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full mr-5"
                onClick={() => handleApprove()}
                display="none"
              >
                Approve
              </button>
            )}
            {isSendButtonVisible && (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full"
                onClick={handleSendBounty}
              >
                Send
              </button>
            )}
          </div>

          <div className="border border-gray-300 rounded-lg p-8 m-2 ">
            <h2 className="text-2xl font-bold mb-4">Bounty Status 🎉</h2>
            {bountyRecipients.length > 0 ? (
              <>
                <div className="flex flex-col">
                  <p className="font-semibold mb-2">
                    Total Amount:{" "}
                    <span className="font-normal text-gray-500">
                      {amountReceived / 1000000}
                    </span>
                  </p>

                  <p className="font-semibold mb-2">
                    Total Addresses:{" "}
                    <span className="font-normal text-gray-500">
                      {bountyRecipients.length}
                    </span>
                  </p>

                  {bountyRecipients.map((recipient, index) => (
                    <div
                      className="bg-white shadow-lg rounded-lg p-4 mb-4 hover:shadow-xl transition-shadow duration-300"
                      key={index}
                    >
                      <h3 className="font-semibold text-xl text-gray-800 mb-3">
                        Recipient #{index + 1}
                      </h3>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">
                          Address:
                        </span>
                        <span className="font-normal text-indigo-600 bg-indigo-100 px-3 py-2 rounded-full">
                          {recipient.substr(0, 10) +
                            "...." +
                            recipient.substr(-6)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">
                          Amount Received:
                        </span>
                        <span className="font-normal text-green-600 bg-green-100 px-3 py-2 rounded-full">
                          {(
                            amountReceived /
                            bountyRecipients.length /
                            1000000
                          ).toFixed(2)}{" "}
                          aUSDC
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <span className="text-red-500">Waiting for response...</span>
            )}
          </div>
        </div> */}
      </main>
      <ToastContainer />
    </div>
  );
}
