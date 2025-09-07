import { Token } from './token'

export const MAINNET_CHAIN_ID = 1
export const SEPOLIA_CHAIN_ID = 11155111

export const USDC = new Token(MAINNET_CHAIN_ID, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'USDC', 'USD Coin')
export const DAI = new Token(
  MAINNET_CHAIN_ID,
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  18,
  'DAI',
  'DAI Stablecoin'
)

export const USDC_SEPOLIA = new Token(
  SEPOLIA_CHAIN_ID,
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  6,
  'USDC',
  'USD//C'
)
export const DAI_SEPOLIA = new Token(
  SEPOLIA_CHAIN_ID,
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  18,
  'DAI',
  'DAI Stablecoin'
)
