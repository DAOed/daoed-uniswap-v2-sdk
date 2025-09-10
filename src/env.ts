// Environment configuration
export const ENV = {
  SEPOLIA_FACTORY_ADDRESS: String(process.env.SEPOLIA_FACTORY_ADDRESS) as string,
  SEPOLIA_ROUTER_ADDRESS: String(process.env.SEPOLIA_ROUTER_ADDRESS) as string,
  SEPOLIA_CHAIN_ID: Number(process.env.SEPOLIA_CHAIN_ID) as 11155111
} as const

export type Environment = typeof ENV
