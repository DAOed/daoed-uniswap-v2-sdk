import JSBI from 'jsbi'
/**
 * Represents an LP Position with detailed information
 */
export interface LPPosition {
  pool: string
  tokenA: string
  tokenB: string
  balance: JSBI
  reserveA: JSBI
  reserveB: JSBI
  totalSupply: JSBI
  sharePercentage: JSBI
}
/**
 * Paginated result for LP pools
 */
export interface LPPoolsResult {
  pools: string[]
  hasMore: boolean
}
/**
 * Paginated result for LP positions
 */
export interface LPPositionsResult {
  positions: LPPosition[]
  hasMore: boolean
}
/**
 * Interface for LP position data provider
 * This would typically be implemented by a class that interacts with blockchain data
 */
export interface LPDataProvider {
  getUserLPPoolCount(user: string): Promise<JSBI>
  getUserLPPools(user: string, offset: JSBI, limit: JSBI): Promise<LPPoolsResult>
  getUserLPBalance(user: string, pool: string): Promise<JSBI>
  getUserLPPositions(user: string, offset: JSBI, limit: JSBI): Promise<LPPositionsResult>
  hasLPPosition(user: string, pool: string): Promise<boolean>
  getPoolInfo(
    pool: string
  ): Promise<{
    tokenA: string
    tokenB: string
    reserveA: JSBI
    reserveB: JSBI
    totalSupply: JSBI
  }>
}
/**
 * Mock implementation of LP data provider for testing and demonstration
 */
export declare class MockLPDataProvider implements LPDataProvider {
  private userPools
  private userBalances
  private poolData
  /**
   * Add mock data for testing
   */
  addMockUserPosition(user: string, pool: string, balance: JSBI): void
  /**
   * Add mock pool data
   */
  addMockPoolData(pool: string, tokenA: string, tokenB: string, reserveA: JSBI, reserveB: JSBI, totalSupply: JSBI): void
  getUserLPPoolCount(user: string): Promise<JSBI>
  getUserLPPools(user: string, offset: JSBI, limit: JSBI): Promise<LPPoolsResult>
  getUserLPBalance(user: string, pool: string): Promise<JSBI>
  getUserLPPositions(user: string, offset: JSBI, limit: JSBI): Promise<LPPositionsResult>
  hasLPPosition(user: string, pool: string): Promise<boolean>
  getPoolInfo(
    pool: string
  ): Promise<{
    tokenA: string
    tokenB: string
    reserveA: JSBI
    reserveB: JSBI
    totalSupply: JSBI
  }>
}
/**
 * LP Position Tracker class that provides high-level functions
 */
export declare class LPPositionTracker {
  private dataProvider
  constructor(dataProvider: LPDataProvider)
  /**
   * Get the number of LP pools a user has positions in
   */
  getUserLPPoolCount(user: string): Promise<JSBI>
  /**
   * Get paginated list of LP pools where user has positions
   */
  getUserLPPools(user: string, offset: JSBI, limit: JSBI): Promise<LPPoolsResult>
  /**
   * Get user's LP token balance in a specific pool
   */
  getUserLPBalance(user: string, pool: string): Promise<JSBI>
  /**
   * Get paginated list of user's LP positions with detailed information
   */
  getUserLPPositions(user: string, offset: JSBI, limit: JSBI): Promise<LPPositionsResult>
  /**
   * Check if user has any LP position in a specific pool
   */
  hasLPPosition(user: string, pool: string): Promise<boolean>
  /**
   * Get all user's LP positions (no pagination)
   */
  getAllUserLPPositions(user: string): Promise<LPPosition[]>
  /**
   * Get total value locked (TVL) by user across all positions
   */
  getUserTotalLPValue(
    user: string
  ): Promise<{
    totalPositions: number
    totalPools: number
  }>
}
