import { Token } from './token'
import { ChainId } from '../chains'

// Define chain IDs for testing - only using Sepolia as requested
export const SEPOLIA_CHAIN_ID = ChainId.SEPOLIA
// Note: MAINNET_CHAIN_ID is not used in tests as per user request to only use Sepolia

export const USDC = new Token(
  SEPOLIA_CHAIN_ID,
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  6,
  'USDC',
  'USD//C'
)

export const DAI = new Token(
  SEPOLIA_CHAIN_ID,
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
