export enum ChainId {
  SEPOLIA = 11155111
}

export const SUPPORTED_CHAINS = [ChainId.SEPOLIA] as const
export type SupportedChainsType = typeof SUPPORTED_CHAINS[number]

export enum NativeCurrencyName {
  // Strings match input for CLI
  ETHER = 'ETH'
}
