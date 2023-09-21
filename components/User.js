import { contractAddresses, abi } from "../constants"
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification, Form } from "web3uikit"
import { ethers } from "ethers"


export default function User() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const shopAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // State hooks
    // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables
    
    const [userAddress, setUserAddress] = useState("0")
    const [userMail, setUserMail] = useState("0")
    const [userTelephone, setUserTelephone] = useState("0")

    const dispatch = useNotification()
    const { runContractFunction } = useWeb3Contract()

    const { runContractFunction: getAddress, isLoading, isFetching } = useWeb3Contract({
        abi: abi,
        contractAddress: shopAddress, // specify the networkId
        functionName: "getMyAddress",
        params: {},
    })

    const { runContractFunction: getMail } = useWeb3Contract({
        abi: abi,
        contractAddress: shopAddress, // specify the networkId
        functionName: "getMyMail",
        params: {},
    })

    const { runContractFunction: getTelephone } = useWeb3Contract({
        abi: abi,
        contractAddress: shopAddress, // specify the networkId
        functionName: "getMyTelephone",
        params: {},
    })

    async function updateUIValues() {
        const addressFromCall = (await getAddress()).toString()
        const mailFromCall = (await getMail()).toString()
        const telephoneFromCall = (await getTelephone()).toString()
        setUserAddress(addressFromCall)
        setUserMail(mailFromCall)
        setUserTelephone(telephoneFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    async function setAddress(data) {
        const address = data.data[0].inputResult;

        const addressOptions = {
            abi: abi,
            contractAddress: shopAddress,
            functionName: "setMyAddress",
            params: {
               _myAddress: address,
            },
        }

        await runContractFunction({
            params: addressOptions,
            onSuccess: () => handleSuccess(),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function setMail(data) {
        const mail = data.data[0].inputResult

        const mailOptions = {
            abi: abi,
            contractAddress: shopAddress,
            functionName: "setMyMail",
            params: {
               _myMail: mail,
            },
        }

        await runContractFunction({
            params: mailOptions,
            onSuccess: () => handleSuccess(),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function setTelephone(data) {
        const telephone = data.data[0].inputResult

        const telephoneOptions = {
            abi: abi,
            contractAddress: shopAddress,
            functionName: "setMyTelephone",
            params: {
                _myTelephone: telephone,
            },
        }

        await runContractFunction({
            params: telephoneOptions,
            onSuccess: () => handleSuccess(),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    return (
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-3xl">Set your user info:</h1>
            {shopAddress ? (
                <>
                <div>
                <Form
                onSubmit={setAddress}
                data={[
                    {
                        name: "Address",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "userAddress",
                    },
                ]}
                title="Set your address:"
                id="Main Form"
                />
                </div>

                <div>
                <Form
                onSubmit={setMail}
                data={[
                    {
                        name: "Mail",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "userMail",
                    },
                ]}
                title="Set your mail:"
                id="Main Form"
                />
                </div>

                <div>
                <Form
                onSubmit={setTelephone}
                data={[
                    {
                        name: "Telephone",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "userTelephone",
                    },
                ]}
                title="Set your telephone:"
                id="Main Form"
                />
                </div>
                    
                    <div>Your address is {userAddress}</div>
                    <div>Your mail is {userMail}</div>
                    <div>Your telephone is {userTelephone}</div>
                    
                </>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    )
}
