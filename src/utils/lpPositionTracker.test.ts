import JSBI from 'jsbi'
import { LPPositionTracker, MockLPDataProvider } from './lpPositionTracker'

describe('LPPositionTracker', () => {
  let tracker: LPPositionTracker
  let mockProvider: MockLPDataProvider

  // Test addresses
  const USER_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // Vitalik's address
  const POOL_ADDRESS_1 = '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc' // USDC/WETH pool
  const POOL_ADDRESS_2 = '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852' // ETH/USDT pool
  const POOL_ADDRESS_3 = '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11' // DAI/WETH pool

  const TOKEN_USDC = '0xA0b86a33E6441e56Ce5F77e1d89Fb0CaE9D35b8B'
  const TOKEN_WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  const TOKEN_USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  const TOKEN_DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

  beforeEach(() => {
    mockProvider = new MockLPDataProvider()
    tracker = new LPPositionTracker(mockProvider)

    // Add mock pool data
    mockProvider.addMockPoolData(
      POOL_ADDRESS_1,
      TOKEN_USDC,
      TOKEN_WETH,
      JSBI.BigInt('1000000000000000000000'), // 1000 USDC
      JSBI.BigInt('500000000000000000'), // 0.5 WETH
      JSBI.BigInt('1000000000000000000000') // 1000 LP tokens
    )

    mockProvider.addMockPoolData(
      POOL_ADDRESS_2,
      TOKEN_WETH,
      TOKEN_USDT,
      JSBI.BigInt('2000000000000000000'), // 2 WETH
      JSBI.BigInt('4000000000'), // 4000 USDT (6 decimals)
      JSBI.BigInt('2000000000000000000000') // 2000 LP tokens
    )

    mockProvider.addMockPoolData(
      POOL_ADDRESS_3,
      TOKEN_DAI,
      TOKEN_WETH,
      JSBI.BigInt('3000000000000000000000'), // 3000 DAI
      JSBI.BigInt('1500000000000000000'), // 1.5 WETH
      JSBI.BigInt('1500000000000000000000') // 1500 LP tokens
    )

    // Add mock user positions
    mockProvider.addMockUserPosition(USER_ADDRESS, POOL_ADDRESS_1, JSBI.BigInt('100000000000000000000')) // 100 LP tokens
    mockProvider.addMockUserPosition(USER_ADDRESS, POOL_ADDRESS_2, JSBI.BigInt('200000000000000000000')) // 200 LP tokens
    mockProvider.addMockUserPosition(USER_ADDRESS, POOL_ADDRESS_3, JSBI.BigInt('150000000000000000000')) // 150 LP tokens
  })

  describe('#getUserLPPoolCount', () => {
    it('returns correct pool count for user with positions', async () => {
      const count = await tracker.getUserLPPoolCount(USER_ADDRESS)
      expect(JSBI.toNumber(count)).toBe(3)
    })

    it('returns zero for user with no positions', async () => {
      const nonExistentUser = '0x742d35Cc6634C0532925a3b8D6E432d26e002dC4'
      const count = await tracker.getUserLPPoolCount(nonExistentUser)
      expect(JSBI.toNumber(count)).toBe(0)
    })

    it('validates user address format', async () => {
      const invalidAddress = 'invalid-address'
      await expect(tracker.getUserLPPoolCount(invalidAddress)).rejects.toThrow()
    })
  })

  describe('#getUserLPPools', () => {
    it('returns all pools when limit is high enough', async () => {
      const result = await tracker.getUserLPPools(USER_ADDRESS, JSBI.BigInt(0), JSBI.BigInt(10))

      expect(result.pools.length).toBe(3)
      expect(result.hasMore).toBe(false)
      expect(result.pools).toContain(POOL_ADDRESS_1)
      expect(result.pools).toContain(POOL_ADDRESS_2)
      expect(result.pools).toContain(POOL_ADDRESS_3)
    })

    it('handles pagination correctly', async () => {
      const firstPage = await tracker.getUserLPPools(USER_ADDRESS, JSBI.BigInt(0), JSBI.BigInt(2))
      expect(firstPage.pools.length).toBe(2)
      expect(firstPage.hasMore).toBe(true)

      const secondPage = await tracker.getUserLPPools(USER_ADDRESS, JSBI.BigInt(2), JSBI.BigInt(2))
      expect(secondPage.pools.length).toBe(1)
      expect(secondPage.hasMore).toBe(false)
    })

    it('returns empty result for user with no positions', async () => {
      const nonExistentUser = '0x742d35Cc6634C0532925a3b8D6E432d26e002dC4'
      const result = await tracker.getUserLPPools(nonExistentUser, JSBI.BigInt(0), JSBI.BigInt(10))

      expect(result.pools.length).toBe(0)
      expect(result.hasMore).toBe(false)
    })

    it('handles offset beyond available data', async () => {
      const result = await tracker.getUserLPPools(USER_ADDRESS, JSBI.BigInt(10), JSBI.BigInt(5))
      expect(result.pools.length).toBe(0)
      expect(result.hasMore).toBe(false)
    })

    it('throws on invalid offset', async () => {
      await expect(tracker.getUserLPPools(USER_ADDRESS, JSBI.BigInt(-1), JSBI.BigInt(5))).rejects.toThrow(
        'INVALID_OFFSET'
      )
    })

    it('throws on invalid limit', async () => {
      await expect(tracker.getUserLPPools(USER_ADDRESS, JSBI.BigInt(0), JSBI.BigInt(0))).rejects.toThrow(
        'INVALID_LIMIT'
      )
    })
  })

  describe('#getUserLPBalance', () => {
    it('returns correct balance for existing position', async () => {
      const balance = await tracker.getUserLPBalance(USER_ADDRESS, POOL_ADDRESS_1)
      expect(JSBI.equal(balance, JSBI.BigInt('100000000000000000000'))).toBe(true)
    })

    it('returns zero for non-existent position', async () => {
      const nonExistentPool = '0x1111111111111111111111111111111111111111'
      const balance = await tracker.getUserLPBalance(USER_ADDRESS, nonExistentPool)
      expect(JSBI.equal(balance, JSBI.BigInt(0))).toBe(true)
    })

    it('returns zero for non-existent user', async () => {
      const nonExistentUser = '0x742d35Cc6634C0532925a3b8D6E432d26e002dC4'
      const balance = await tracker.getUserLPBalance(nonExistentUser, POOL_ADDRESS_1)
      expect(JSBI.equal(balance, JSBI.BigInt(0))).toBe(true)
    })

    it('validates addresses', async () => {
      await expect(tracker.getUserLPBalance('invalid-user', POOL_ADDRESS_1)).rejects.toThrow()

      await expect(tracker.getUserLPBalance(USER_ADDRESS, 'invalid-pool')).rejects.toThrow()
    })
  })

  describe('#getUserLPPositions', () => {
    it('returns detailed position information', async () => {
      const result = await tracker.getUserLPPositions(USER_ADDRESS, JSBI.BigInt(0), JSBI.BigInt(10))

      expect(result.positions.length).toBe(3)
      expect(result.hasMore).toBe(false)

      const position1 = result.positions.find(p => p.pool === POOL_ADDRESS_1)!
      expect(position1).toBeDefined()
      expect(position1.tokenA).toBe(TOKEN_USDC)
      expect(position1.tokenB).toBe(TOKEN_WETH)
      expect(JSBI.equal(position1.balance, JSBI.BigInt('100000000000000000000'))).toBe(true)
      expect(JSBI.equal(position1.reserveA, JSBI.BigInt('1000000000000000000000'))).toBe(true)
      expect(JSBI.equal(position1.reserveB, JSBI.BigInt('500000000000000000'))).toBe(true)
      expect(JSBI.equal(position1.totalSupply, JSBI.BigInt('1000000000000000000000'))).toBe(true)
      expect(JSBI.equal(position1.sharePercentage, JSBI.BigInt('1000'))).toBe(true) // 10% in basis points
    })

    it('handles pagination correctly', async () => {
      const firstPage = await tracker.getUserLPPositions(USER_ADDRESS, JSBI.BigInt(0), JSBI.BigInt(2))
      expect(firstPage.positions.length).toBe(2)
      expect(firstPage.hasMore).toBe(true)

      const secondPage = await tracker.getUserLPPositions(USER_ADDRESS, JSBI.BigInt(2), JSBI.BigInt(2))
      expect(secondPage.positions.length).toBe(1)
      expect(secondPage.hasMore).toBe(false)
    })

    it('calculates share percentage correctly', async () => {
      const result = await tracker.getUserLPPositions(USER_ADDRESS, JSBI.BigInt(0), JSBI.BigInt(1))
      const position = result.positions[0]

      // Share percentage = (balance / totalSupply) * 10000
      const expectedShare = JSBI.divide(JSBI.multiply(position.balance, JSBI.BigInt(10000)), position.totalSupply)
      expect(JSBI.equal(position.sharePercentage, expectedShare)).toBe(true)
    })

    it('returns empty result for user with no positions', async () => {
      const nonExistentUser = '0x742d35Cc6634C0532925a3b8D6E432d26e002dC4'
      const result = await tracker.getUserLPPositions(nonExistentUser, JSBI.BigInt(0), JSBI.BigInt(10))

      expect(result.positions.length).toBe(0)
      expect(result.hasMore).toBe(false)
    })
  })

  describe('#hasLPPosition', () => {
    it('returns true for existing position', async () => {
      const hasPosition = await tracker.hasLPPosition(USER_ADDRESS, POOL_ADDRESS_1)
      expect(hasPosition).toBe(true)
    })

    it('returns false for non-existent position', async () => {
      const nonExistentPool = '0x1111111111111111111111111111111111111111'
      const hasPosition = await tracker.hasLPPosition(USER_ADDRESS, nonExistentPool)
      expect(hasPosition).toBe(false)
    })

    it('returns false for non-existent user', async () => {
      const nonExistentUser = '0x742d35Cc6634C0532925a3b8D6E432d26e002dC4'
      const hasPosition = await tracker.hasLPPosition(nonExistentUser, POOL_ADDRESS_1)
      expect(hasPosition).toBe(false)
    })
  })

  describe('#getAllUserLPPositions', () => {
    it('returns all positions without pagination', async () => {
      const positions = await tracker.getAllUserLPPositions(USER_ADDRESS)
      expect(positions.length).toBe(3)

      const poolAddresses = positions.map(p => p.pool)
      expect(poolAddresses).toContain(POOL_ADDRESS_1)
      expect(poolAddresses).toContain(POOL_ADDRESS_2)
      expect(poolAddresses).toContain(POOL_ADDRESS_3)
    })

    it('handles large datasets by batching', async () => {
      // Add many more positions to test batching
      for (let i = 0; i < 100; i++) {
        const poolAddress = `0x${i.toString(16).padStart(40, '0')}`
        mockProvider.addMockPoolData(
          poolAddress,
          TOKEN_USDC,
          TOKEN_WETH,
          JSBI.BigInt('1000000000000000000'),
          JSBI.BigInt('500000000000000000'),
          JSBI.BigInt('1000000000000000000')
        )
        mockProvider.addMockUserPosition(USER_ADDRESS, poolAddress, JSBI.BigInt('10000000000000000'))
      }

      const positions = await tracker.getAllUserLPPositions(USER_ADDRESS)
      expect(positions.length).toBe(103) // 3 original + 100 new
    })
  })

  describe('#getUserTotalLPValue', () => {
    it('returns correct totals', async () => {
      const totals = await tracker.getUserTotalLPValue(USER_ADDRESS)
      expect(totals.totalPositions).toBe(3)
      expect(totals.totalPools).toBe(3)
    })

    it('handles user with no positions', async () => {
      const nonExistentUser = '0x742d35Cc6634C0532925a3b8D6E432d26e002dC4'
      const totals = await tracker.getUserTotalLPValue(nonExistentUser)
      expect(totals.totalPositions).toBe(0)
      expect(totals.totalPools).toBe(0)
    })
  })

  describe('MockLPDataProvider', () => {
    it('allows adding and retrieving mock data', () => {
      const provider = new MockLPDataProvider()
      const testUser = '0x742d35Cc6634C0532925a3b8D6E432d26e002dC4'
      const testPool = '0x1111111111111111111111111111111111111111'
      const testBalance = JSBI.BigInt('1000000000000000000')

      provider.addMockUserPosition(testUser, testPool, testBalance)

      // Test that data was added correctly
      expect(provider.getUserLPBalance(testUser, testPool)).resolves.toEqual(testBalance)
      expect(provider.hasLPPosition(testUser, testPool)).resolves.toBe(true)
    })

    it('validates addresses in mock methods', () => {
      const provider = new MockLPDataProvider()

      expect(() => {
        provider.addMockUserPosition('invalid-address', POOL_ADDRESS_1, JSBI.BigInt('100'))
      }).toThrow()

      expect(() => {
        provider.addMockPoolData(
          'invalid-pool',
          TOKEN_USDC,
          TOKEN_WETH,
          JSBI.BigInt('1000'),
          JSBI.BigInt('500'),
          JSBI.BigInt('1000')
        )
      }).toThrow()
    })

    it('throws error for non-existent pool data', async () => {
      const provider = new MockLPDataProvider()
      const nonExistentPool = '0x1111111111111111111111111111111111111111'

      await expect(provider.getPoolInfo(nonExistentPool)).rejects.toThrow('Pool data not found')
    })
  })

  describe('Edge cases and error handling', () => {
    it('handles zero total supply in share calculation', async () => {
      const zeroSupplyPool = '0x2222222222222222222222222222222222222222'
      mockProvider.addMockPoolData(
        zeroSupplyPool,
        TOKEN_USDC,
        TOKEN_WETH,
        JSBI.BigInt('0'),
        JSBI.BigInt('0'),
        JSBI.BigInt('0') // Zero total supply
      )
      mockProvider.addMockUserPosition(USER_ADDRESS, zeroSupplyPool, JSBI.BigInt('100'))

      const result = await tracker.getUserLPPositions(USER_ADDRESS, JSBI.BigInt(0), JSBI.BigInt(10))
      const zeroSupplyPosition = result.positions.find(p => p.pool === zeroSupplyPool)

      expect(zeroSupplyPosition).toBeDefined()
      expect(JSBI.equal(zeroSupplyPosition!.sharePercentage, JSBI.BigInt(0))).toBe(true)
    })

    it('handles very large numbers correctly', async () => {
      const largeBalance = JSBI.BigInt('999999999999999999999999999999')
      const largeSupply = JSBI.BigInt('1000000000000000000000000000000')

      const largePool = '0x3333333333333333333333333333333333333333'
      mockProvider.addMockPoolData(
        largePool,
        TOKEN_USDC,
        TOKEN_WETH,
        JSBI.BigInt('1000000000000000000'),
        JSBI.BigInt('500000000000000000'),
        largeSupply
      )
      mockProvider.addMockUserPosition(USER_ADDRESS, largePool, largeBalance)

      const balance = await tracker.getUserLPBalance(USER_ADDRESS, largePool)
      expect(JSBI.equal(balance, largeBalance)).toBe(true)

      const result = await tracker.getUserLPPositions(USER_ADDRESS, JSBI.BigInt(0), JSBI.BigInt(10))
      const largePosition = result.positions.find(p => p.pool === largePool)
      expect(largePosition).toBeDefined()
      expect(JSBI.greaterThan(largePosition!.sharePercentage, JSBI.BigInt(0))).toBe(true)
    })
  })
})
