export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3, // For tests
  SEPOLIA = 11155111,
  BASE = 8453
}

export const SUPPORTED_CHAINS = [ChainId.MAINNET, ChainId.ROPSTEN, ChainId.SEPOLIA, ChainId.BASE] as const
export type SupportedChainsType = typeof SUPPORTED_CHAINS[number]

export enum NativeCurrencyName {
  // Strings match input for CLI
  ETHER = 'ETH'
}
