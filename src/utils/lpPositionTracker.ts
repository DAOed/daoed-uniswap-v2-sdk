import JSBI from 'jsbi'
import invariant from 'tiny-invariant'
import { checkValidAddress } from './validateAndParseAddress'

/**
 * Represents an LP Position with detailed information
 */
export interface LPPosition {
  pool: string // Pool contract address
  tokenA: string // First token address
  tokenB: string // Second token address
  balance: JSBI // LP token balance
  reserveA: JSBI // Token A reserves in pool
  reserveB: JSBI // Token B reserves in pool
  totalSupply: JSBI // Total LP token supply
  sharePercentage: JSBI // User's share of the pool (in basis points, 10000 = 100%)
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
export class MockLPDataProvider implements LPDataProvider {
  private userPools: Map<string, Set<string>> = new Map()
  private userBalances: Map<string, Map<string, JSBI>> = new Map()
  private poolData: Map<
    string,
    {
      tokenA: string
      tokenB: string
      reserveA: JSBI
      reserveB: JSBI
      totalSupply: JSBI
    }
  > = new Map()

  /**
   * Add mock data for testing
   */
  addMockUserPosition(user: string, pool: string, balance: JSBI) {
    user = checkValidAddress(user)
    pool = checkValidAddress(pool)

    if (!this.userPools.has(user)) {
      this.userPools.set(user, new Set())
    }
    this.userPools.get(user)!.add(pool)

    if (!this.userBalances.has(user)) {
      this.userBalances.set(user, new Map())
    }
    this.userBalances.get(user)!.set(pool, balance)
  }

  /**
   * Add mock pool data
   */
  addMockPoolData(pool: string, tokenA: string, tokenB: string, reserveA: JSBI, reserveB: JSBI, totalSupply: JSBI) {
    this.poolData.set(checkValidAddress(pool), {
      tokenA: checkValidAddress(tokenA),
      tokenB: checkValidAddress(tokenB),
      reserveA,
      reserveB,
      totalSupply
    })
  }

  async getUserLPPoolCount(user: string): Promise<JSBI> {
    user = checkValidAddress(user)
    const pools = this.userPools.get(user)
    return JSBI.BigInt(pools ? pools.size : 0)
  }

  async getUserLPPools(user: string, offset: JSBI, limit: JSBI): Promise<LPPoolsResult> {
    user = checkValidAddress(user)
    const pools = this.userPools.get(user)

    if (!pools) {
      return { pools: [], hasMore: false }
    }

    const poolArray = Array.from(pools)
    const offsetNum = JSBI.toNumber(offset)
    const limitNum = JSBI.toNumber(limit)

    const sliced = poolArray.slice(offsetNum, offsetNum + limitNum)
    const hasMore = offsetNum + limitNum < poolArray.length

    return {
      pools: sliced,
      hasMore
    }
  }

  async getUserLPBalance(user: string, pool: string): Promise<JSBI> {
    user = checkValidAddress(user)
    pool = checkValidAddress(pool)

    const userBalances = this.userBalances.get(user)
    if (!userBalances) {
      return JSBI.BigInt(0)
    }

    return userBalances.get(pool) || JSBI.BigInt(0)
  }

  async getUserLPPositions(user: string, offset: JSBI, limit: JSBI): Promise<LPPositionsResult> {
    user = checkValidAddress(user)
    const poolsResult = await this.getUserLPPools(user, offset, limit)

    const positions: LPPosition[] = []

    for (const pool of poolsResult.pools) {
      const balance = await this.getUserLPBalance(user, pool)
      const poolInfo = await this.getPoolInfo(pool)

      // Calculate share percentage (balance / totalSupply * 10000)
      const sharePercentage = JSBI.equal(poolInfo.totalSupply, JSBI.BigInt(0))
        ? JSBI.BigInt(0)
        : JSBI.divide(JSBI.multiply(balance, JSBI.BigInt(10000)), poolInfo.totalSupply)

      positions.push({
        pool,
        tokenA: poolInfo.tokenA,
        tokenB: poolInfo.tokenB,
        balance,
        reserveA: poolInfo.reserveA,
        reserveB: poolInfo.reserveB,
        totalSupply: poolInfo.totalSupply,
        sharePercentage
      })
    }

    return {
      positions,
      hasMore: poolsResult.hasMore
    }
  }

  async hasLPPosition(user: string, pool: string): Promise<boolean> {
    const balance = await this.getUserLPBalance(user, pool)
    return JSBI.greaterThan(balance, JSBI.BigInt(0))
  }

  async getPoolInfo(
    pool: string
  ): Promise<{
    tokenA: string
    tokenB: string
    reserveA: JSBI
    reserveB: JSBI
    totalSupply: JSBI
  }> {
    pool = checkValidAddress(pool)
    const info = this.poolData.get(pool)

    if (!info) {
      throw new Error(`Pool data not found for ${pool}`)
    }

    return info
  }
}

/**
 * LP Position Tracker class that provides high-level functions
 */
export class LPPositionTracker {
  constructor(private dataProvider: LPDataProvider) {}

  /**
   * Get the number of LP pools a user has positions in
   */
  async getUserLPPoolCount(user: string): Promise<JSBI> {
    return this.dataProvider.getUserLPPoolCount(user)
  }

  /**
   * Get paginated list of LP pools where user has positions
   */
  async getUserLPPools(user: string, offset: JSBI, limit: JSBI): Promise<LPPoolsResult> {
    invariant(JSBI.greaterThanOrEqual(offset, JSBI.BigInt(0)), 'INVALID_OFFSET')
    invariant(JSBI.greaterThan(limit, JSBI.BigInt(0)), 'INVALID_LIMIT')

    return this.dataProvider.getUserLPPools(user, offset, limit)
  }

  /**
   * Get user's LP token balance in a specific pool
   */
  async getUserLPBalance(user: string, pool: string): Promise<JSBI> {
    return this.dataProvider.getUserLPBalance(user, pool)
  }

  /**
   * Get paginated list of user's LP positions with detailed information
   */
  async getUserLPPositions(user: string, offset: JSBI, limit: JSBI): Promise<LPPositionsResult> {
    invariant(JSBI.greaterThanOrEqual(offset, JSBI.BigInt(0)), 'INVALID_OFFSET')
    invariant(JSBI.greaterThan(limit, JSBI.BigInt(0)), 'INVALID_LIMIT')

    return this.dataProvider.getUserLPPositions(user, offset, limit)
  }

  /**
   * Check if user has any LP position in a specific pool
   */
  async hasLPPosition(user: string, pool: string): Promise<boolean> {
    return this.dataProvider.hasLPPosition(user, pool)
  }

  /**
   * Get all user's LP positions (no pagination)
   */
  async getAllUserLPPositions(user: string): Promise<LPPosition[]> {
    const positions: LPPosition[] = []
    let offset = JSBI.BigInt(0)
    const limit = JSBI.BigInt(50) // Reasonable batch size

    while (true) {
      const result = await this.getUserLPPositions(user, offset, limit)
      positions.push(...result.positions)

      if (!result.hasMore) {
        break
      }

      offset = JSBI.add(offset, limit)
    }

    return positions
  }

  /**
   * Get total value locked (TVL) by user across all positions
   */
  async getUserTotalLPValue(
    user: string
  ): Promise<{
    totalPositions: number
    totalPools: number
  }> {
    const positions = await this.getAllUserLPPositions(user)
    const pools = new Set(positions.map(p => p.pool))

    return {
      totalPositions: positions.length,
      totalPools: pools.size
    }
  }
}
