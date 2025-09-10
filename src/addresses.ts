
import { ChainId } from './chains'

export const SEPOLIA_ADDRESSES = {
  "FACTORY": "0x8F6e70BafAb970150435FF91c9478E564DD283B6",
  "WETH": "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
  "ROUTER02": "0x5e387eb2064f88dD6bCf8864D1532A7995Adee2D",
}

// Contract addresses for different networks
export const FACTORY_ADDRESSES: { [chainId: number]: string } = {
  [ChainId.SEPOLIA]: SEPOLIA_ADDRESSES.FACTORY
}

export const ROUTER_ADDRESSES: { [chainId: number]: string } = {
  [ChainId.SEPOLIA]: SEPOLIA_ADDRESSES.ROUTER02
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
