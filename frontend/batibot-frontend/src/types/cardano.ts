export interface CardanoWallet {
    name: string
    icon: string
    apiVersion: string
    enable: () => Promise<CardanoWalletAPI>
    isEnabled: () => Promise<boolean>
}

export interface CardanoWalletAPI {
    getNetworkId: () => Promise<number>
    getUtxos: () => Promise<string[]>
    getBalance: () => Promise<string>
    getUsedAddresses: () => Promise<string[]>
    getUnusedAddresses: () => Promise<string[]>
    getChangeAddress: () => Promise<string>
    getRewardAddresses: () => Promise<string[]>
    signTx: (tx: string, partialSign: boolean) => Promise<string>
    signData: (address: string, payload: string) => Promise<{ signature: string; key: string }>
    submitTx: (tx: string) => Promise<string>
}

export interface CardanoWalletContextType {
    walletApi: CardanoWalletAPI | null
    walletAddress: string | null
    walletBalance: string | null
    selectedWallet: string
    availableWallets: string[]
    isConnecting: boolean
    isConnected: boolean
    connectWallet: (walletName: string) => Promise<void>
    disconnectWallet: () => void
    refreshBalance: () => Promise<void>
}

export interface WindowCardano {
    [key: string]: CardanoWallet
}

declare global {
    interface Window {
        cardano?: WindowCardano
    }
}
