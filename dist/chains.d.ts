export declare enum ChainId {
    MAINNET = 1,
    ROPSTEN = 3,
    SEPOLIA = 11155111,
    BASE = 8453
}
export declare const SUPPORTED_CHAINS: readonly [ChainId.MAINNET, ChainId.ROPSTEN, ChainId.SEPOLIA, ChainId.BASE];
export declare type SupportedChainsType = typeof SUPPORTED_CHAINS[number];
export declare enum NativeCurrencyName {
    ETHER = "ETH"
}
