import { ENV } from './env'

// Contract addresses for different networks
export const FACTORY_ADDRESSES: { [chainId: number]: string } = {
  1: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // Mainnet
  3: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // Ropsten (for tests)
  11155111: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' // Sepolia
}

export const ROUTER_ADDRESSES: { [chainId: number]: string } = {
  1: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Mainnet
  3: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Ropsten (for tests)
  11155111: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' // Sepolia
}

// Initialize addresses from environment variables if available
if (ENV.FACTORY_ADDRESS && ENV.CHAIN_ID) {
  FACTORY_ADDRESSES[ENV.CHAIN_ID] = ENV.FACTORY_ADDRESS
}

if (ENV.ROUTER_ADDRESS && ENV.CHAIN_ID) {
  ROUTER_ADDRESSES[ENV.CHAIN_ID] = ENV.ROUTER_ADDRESS
}

// Helper functions to set addresses dynamically
export function setFactoryAddress(chainId: number, address: string): void {
  FACTORY_ADDRESSES[chainId] = address
}

export function setRouterAddress(chainId: number, address: string): void {
  ROUTER_ADDRESSES[chainId] = address
}

export function getFactoryAddress(chainId: number): string | undefined {
  return FACTORY_ADDRESSES[chainId]
}

export function getRouterAddress(chainId: number): string | undefined {
  return ROUTER_ADDRESSES[chainId]
}