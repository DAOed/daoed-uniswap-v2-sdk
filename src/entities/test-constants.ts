import { Token } from './token'

export const SEPOLIA_CHAIN_ID = 11155111

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
