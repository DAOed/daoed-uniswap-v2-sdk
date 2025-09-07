// Environment configuration
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  NETWORK: process.env.NETWORK || 'mainnet',
  FACTORY_ADDRESS: process.env.FACTORY_ADDRESS,
  ROUTER_ADDRESS: process.env.ROUTER_ADDRESS,
  CHAIN_ID: process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID) : 1,
} as const

export type Environment = typeof ENV