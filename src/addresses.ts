import { ENV } from './env'
import { ChainId } from './chains'

// Contract addresses for different networks
export const FACTORY_ADDRESSES: { [chainId: number]: string } = {
  [ChainId.SEPOLIA]: ENV.SEPOLIA_FACTORY_ADDRESS
}

export const ROUTER_ADDRESSES: { [chainId: number]: string } = {
  [ChainId.SEPOLIA]: ENV.SEPOLIA_ROUTER_ADDRESS
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
