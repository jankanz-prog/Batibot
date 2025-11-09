import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CardanoWalletAPI, CardanoWalletContextType } from "../types/cardano"
import { Core } from '@blaze-cardano/sdk'

const CardanoWalletContext = createContext<CardanoWalletContextType | undefined>(undefined)

export const useCardanoWallet = () => {
    const context = useContext(CardanoWalletContext)
    if (context === undefined) {
        throw new Error("useCardanoWallet must be used within a CardanoWalletProvider")
    }
    return context
}

interface CardanoWalletProviderProps {
    children: ReactNode
}

export const CardanoWalletProvider: React.FC<CardanoWalletProviderProps> = ({ children }) => {
    const [walletApi, setWalletApi] = useState<CardanoWalletAPI | null>(null)
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const [walletBalance, setWalletBalance] = useState<string | null>(null)
    const [selectedWallet, setSelectedWallet] = useState<string>("")
    const [availableWallets, setAvailableWallets] = useState<string[]>([])
    const [isConnecting, setIsConnecting] = useState(false)

    // Detect available wallets on mount
    useEffect(() => {
        if (window.cardano) {
            const wallets = Object.keys(window.cardano)
            setAvailableWallets(wallets)
        }
    }, [])

    const connectWallet = async (walletName: string) => {
        if (!window.cardano || !window.cardano[walletName]) {
            throw new Error(`Wallet ${walletName} not found`)
        }

        try {
            setIsConnecting(true)
            const api = await window.cardano[walletName].enable()
            setWalletApi(api)
            setSelectedWallet(walletName)

            // Get wallet address
            const changeAddress = await api.getChangeAddress()
            setWalletAddress(changeAddress)

            // Get balance
            await refreshBalanceInternal(api)
        } catch (error) {
            console.error("Error connecting to wallet:", error)
            throw error
        } finally {
            setIsConnecting(false)
        }
    }

    const refreshBalanceInternal = async (api: CardanoWalletAPI) => {
        try {
            const balanceCbor = await api.getBalance()
            
            // Decode CBOR hex string to get the Value object
            const value = Core.Value.fromCbor(balanceCbor as any)
            
            // Get ADA amount (coin) in lovelace
            const lovelace = value.coin()
            
            // Convert to ADA (1 ADA = 1,000,000 lovelace)
            const balanceAda = Number(lovelace) / 1_000_000
            
            console.log('Wallet balance fetched:', balanceAda, 'ADA')
            setWalletBalance(balanceAda.toFixed(2))
        } catch (error) {
            console.error("Error fetching balance:", error)
            console.error("Balance CBOR:", error)
            setWalletBalance("0")
        }
    }

    const refreshBalance = async () => {
        if (walletApi) {
            await refreshBalanceInternal(walletApi)
        }
    }

    const disconnectWallet = () => {
        setWalletApi(null)
        setWalletAddress(null)
        setWalletBalance(null)
        setSelectedWallet("")
    }

    const value: CardanoWalletContextType = {
        walletApi,
        walletAddress,
        walletBalance,
        selectedWallet,
        availableWallets,
        isConnecting,
        isConnected: !!walletApi,
        connectWallet,
        disconnectWallet,
        refreshBalance,
    }

    return <CardanoWalletContext.Provider value={value}>{children}</CardanoWalletContext.Provider>
}
