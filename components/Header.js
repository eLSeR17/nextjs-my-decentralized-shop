import { ConnectButton } from "web3uikit"
import Link from "next/link"

export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex flex-row space-between">
            <h1 className="py-4 px-4 font-bold text-3xl"> Decentralized Web3 Shop</h1>
            
            <Link href="/">
                <a className="mr-4 p-6">Shop</a>
            </Link>
            <Link href="/user-info">
                <a className="mr-4 p-6">My info</a>
            </Link>
            <div className="ml-auto py-2 px-4">
                <ConnectButton moralisAuth={false}/>
            </div>
        </nav>
    )
}