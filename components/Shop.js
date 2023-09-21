import { contractAddresses, abi } from "../constants"
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification, Form } from "web3uikit"
import { ethers } from "ethers"
import ListedItem from "./ListedItem"

export default function Shop() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const shopAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // State hooks
    // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables
    const [itemAmount, setItemAmount] = useState("")

    const dispatch = useNotification()
    const { runContractFunction } = useWeb3Contract()
    
    /* View Functions */

    const { runContractFunction: getListedItems,
            isLoading,
            isFetching, } = useWeb3Contract({
        abi: abi,
        contractAddress: shopAddress, // specify the networkId
        functionName: "getListedItems",
        params: {},
    })

    const { runContractFunction: getItemAmount} = useWeb3Contract({
    abi: abi,
    contractAddress: shopAddress, // specify the networkId
    functionName: "getItemAmount",
    params: {},
})

    async function updateUIValues() {
        // Another way we could make a contract call:
        // const options = { abi, contractAddress: raffleAddress }
        // const fee = await Moralis.executeFunction({
        //     functionName: "getEntranceFee",
        //     ...options,
        // })
        const itemAmountFromCall = (await getItemAmount()).toString()
        setItemAmount(itemAmountFromCall)
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
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    async function approveAndList(data) {
        console.log("Approving...")
        const itemName = data.data[0].inputResult
        const itemDescription = data.data[1].inputResult
        const itemPicture = data.data[2].inputResult
        const itemPrice = data.data[3].inputResult
        const price = ethers.utils.parseUnits(itemPrice, "ether").toString()

        const listOptions = {
            abi: abi,
            contractAddress: shopAddress,
            functionName: "listItem",
            params: {
                _name: itemName,
                _description: itemDescription,
                _picture: itemPicture,
                _price: price,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: () => console.log("Item was listed!"),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function cancelListing(data) {
        console.log("Cancelling...")
        const itemID = data.data[0].inputResult
        //const price = ethers.utils.parseUnits(data.data[3].inputResult, "ether").toString()

        const cancelOptions = {
            abi: abi,
            contractAddress: shopAddress,
            functionName: "cancelItem",
            params: {
                _id: itemID,
            },
        }

        await runContractFunction({
            params: cancelOptions,
            onSuccess: () => console.log("Item was cancelled!"),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    return (
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-3xl">Trade your items!</h1>
            {shopAddress ? (
                <>
                <div>
                <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "Item name",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "name",
                    },
                    {
                        name: "Item description",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "description",
                    },
                    {
                        name: "Item photo",
                        type: "text",
                        value: "",
                        key: "photo",
                    },
                    {
                        name: "Item price (in ETH)",
                        type: "number",
                        value: "",
                        key: "price",
                    },
                ]}
                title="List your item!"
                id="Main Form"
                />
                </div>

                <div>
                <Form
                onSubmit={cancelListing}
                data={[
                    
                    {
                        name: "Item ID",
                        type: "number",
                        value: "",
                        key: "id",
                    },
                ]}
                title="Remove your item from the list"
                id="Main Form"
                /> 
                </div>
                    
                    
                    <div>This is the amount of items in the shop at the moment: {itemAmount} </div>
                    <div>These are the most recently listed items:</div>
                    <ListedItem position={0}/>
                    <ListedItem position={1}/>
                    <ListedItem position={2}/>
                    <ListedItem position={3}/>
                    <ListedItem position={4}/>
                </>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    )
}
