import { contractAddresses, abi } from "../constants"
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification, Form } from "web3uikit"
import { ethers } from "ethers"

export default function ListedItem({position}) {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const shopAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // State hooks
    // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables
    const [itemName, setItemName] = useState("")
    const [itemDescription, setItemDescription] = useState("")
    const [itemPhoto, setItemPhoto] = useState("")
    const [itemPrice, setItemPrice] = useState("")

    const dispatch = useNotification()
    const { runContractFunction } = useWeb3Contract()
    
    /* View Functions */

    const { runContractFunction: getListedItem} = useWeb3Contract({
    abi: abi,
    contractAddress: shopAddress, // specify the networkId
    functionName: "getListedItem",
    params: {_position: position},
})

    async function updateUIValues() {
        // Another way we could make a contract call:
        // const options = { abi, contractAddress: raffleAddress }
        // const fee = await Moralis.executeFunction({
        //     functionName: "getEntranceFee",
        //     ...options,
        // })
        const listedItemsFromCall = await getListedItem()
        setItemName(listedItemsFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [])
 

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }
    

    return (
        <div className="p-5">
            {shopAddress ? (
                <>                    
                    <div>{itemName} </div>

                    
                </>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    )
}
