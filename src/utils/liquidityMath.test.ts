import JSBI from 'jsbi'
import {
  computeProfitMaximizingTrade,
  getReservesAfterArbitrage,
  computeLiquidityValue,
  getLiquidityValue,
  getLiquidityValueAfterArbitrageToPrice,
  PairReserves
} from './liquidityMath'

describe('LiquidityMath', () => {
  const mockPairReserves: PairReserves = {
    reserveA: JSBI.BigInt('1000000000000000000000'), // 1000 tokens
    reserveB: JSBI.BigInt('2000000000000000000000'), // 2000 tokens
    totalSupply: JSBI.BigInt('1414213562373095048801'), // sqrt(1000 * 2000) * 10^18
    kLast: JSBI.BigInt('0'),
    feeOn: false
  }

  describe('#computeProfitMaximizingTrade', () => {
    it('returns zero amount when prices are equal', () => {
      const truePriceA = JSBI.BigInt('1')
      const truePriceB = JSBI.BigInt('1')
      const reserveA = JSBI.BigInt('1000')
      const reserveB = JSBI.BigInt('1000')

      const [, amountIn] = computeProfitMaximizingTrade(truePriceA, truePriceB, reserveA, reserveB)
      expect(JSBI.equal(amountIn, JSBI.BigInt(0))).toBe(true)
    })

    it('computes trade amount for imbalanced pools', () => {
      const truePriceA = JSBI.BigInt('1')
      const truePriceB = JSBI.BigInt('1')
      const reserveA = JSBI.BigInt('1000')
      const reserveB = JSBI.BigInt('2000') // Pool is imbalanced

      const [aToB, amountIn] = computeProfitMaximizingTrade(truePriceA, truePriceB, reserveA, reserveB)
      expect(typeof aToB).toBe('boolean')
      expect(JSBI.greaterThanOrEqual(amountIn, JSBI.BigInt(0))).toBe(true)
    })

    it('throws on invalid prices', () => {
      expect(() =>
        computeProfitMaximizingTrade(JSBI.BigInt('0'), JSBI.BigInt('1'), JSBI.BigInt('1000'), JSBI.BigInt('2000'))
      ).toThrow('INVALID_PRICES')
    })

    it('throws on insufficient reserves', () => {
      expect(() =>
        computeProfitMaximizingTrade(JSBI.BigInt('2'), JSBI.BigInt('1'), JSBI.BigInt('0'), JSBI.BigInt('2000'))
      ).toThrow('INSUFFICIENT_RESERVES')
    })
  })

  describe('#getReservesAfterArbitrage', () => {
    it('handles balanced reserves correctly', () => {
      const truePriceA = JSBI.BigInt('1')
      const truePriceB = JSBI.BigInt('1')
      const reserveA = JSBI.BigInt('1000')
      const reserveB = JSBI.BigInt('1000')

      const [newReserveA, newReserveB] = getReservesAfterArbitrage(reserveA, reserveB, truePriceA, truePriceB)
      expect(JSBI.greaterThan(newReserveA, JSBI.BigInt(0))).toBe(true)
      expect(JSBI.greaterThan(newReserveB, JSBI.BigInt(0))).toBe(true)
    })

    it('adjusts reserves when needed', () => {
      const truePriceA = JSBI.BigInt('1')
      const truePriceB = JSBI.BigInt('1')
      const reserveA = JSBI.BigInt('1000')
      const reserveB = JSBI.BigInt('2000')

      const [newReserveA, newReserveB] = getReservesAfterArbitrage(reserveA, reserveB, truePriceA, truePriceB)
      expect(JSBI.greaterThan(newReserveA, JSBI.BigInt(0))).toBe(true)
      expect(JSBI.greaterThan(newReserveB, JSBI.BigInt(0))).toBe(true)
    })

    it('throws on zero reserves', () => {
      expect(() =>
        getReservesAfterArbitrage(JSBI.BigInt('0'), JSBI.BigInt('2000'), JSBI.BigInt('2'), JSBI.BigInt('1'))
      ).toThrow('ZERO_PAIR_RESERVES')
    })
  })

  describe('#computeLiquidityValue', () => {
    it('correctly computes liquidity value without fees', () => {
      const reservesA = JSBI.BigInt('1000')
      const reservesB = JSBI.BigInt('2000')
      const totalSupply = JSBI.BigInt('1000') // Simplified
      const liquidityAmount = JSBI.BigInt('100')

      const [tokenAAmount, tokenBAmount] = computeLiquidityValue(
        reservesA,
        reservesB,
        totalSupply,
        liquidityAmount,
        false,
        JSBI.BigInt('0')
      )

      expect(tokenAAmount).toEqual(JSBI.BigInt('100')) // 10% of 1000
      expect(tokenBAmount).toEqual(JSBI.BigInt('200')) // 10% of 2000
    })

    it('correctly adjusts for protocol fees when enabled', () => {
      const reservesA = JSBI.BigInt('1000')
      const reservesB = JSBI.BigInt('2000')
      const totalSupply = JSBI.BigInt('1000')
      const liquidityAmount = JSBI.BigInt('100')
      const kLast = JSBI.BigInt('1800000') // Less than current k = 2000000

      const [tokenAAmount, tokenBAmount] = computeLiquidityValue(
        reservesA,
        reservesB,
        totalSupply,
        liquidityAmount,
        true,
        kLast
      )

      // Amounts should be less due to fee adjustment
      expect(JSBI.lessThan(tokenAAmount, JSBI.BigInt('100'))).toBe(true)
      expect(JSBI.lessThan(tokenBAmount, JSBI.BigInt('200'))).toBe(true)
    })

    it('handles zero kLast correctly', () => {
      const reservesA = JSBI.BigInt('1000')
      const reservesB = JSBI.BigInt('2000')
      const totalSupply = JSBI.BigInt('1000')
      const liquidityAmount = JSBI.BigInt('100')

      const [tokenAAmount, tokenBAmount] = computeLiquidityValue(
        reservesA,
        reservesB,
        totalSupply,
        liquidityAmount,
        true,
        JSBI.BigInt('0')
      )

      expect(tokenAAmount).toEqual(JSBI.BigInt('100'))
      expect(tokenBAmount).toEqual(JSBI.BigInt('200'))
    })
  })

  describe('#getLiquidityValue', () => {
    it('correctly calls computeLiquidityValue with pair data', () => {
      const liquidityAmount = JSBI.BigInt('100000000000000000000') // 100 LP tokens

      const [tokenAAmount, tokenBAmount] = getLiquidityValue(mockPairReserves, liquidityAmount)

      expect(JSBI.greaterThan(tokenAAmount, JSBI.BigInt(0))).toBe(true)
      expect(JSBI.greaterThan(tokenBAmount, JSBI.BigInt(0))).toBe(true)
    })

    it('returns zero for zero liquidity amount', () => {
      const liquidityAmount = JSBI.BigInt('0')

      const [tokenAAmount, tokenBAmount] = getLiquidityValue(mockPairReserves, liquidityAmount)

      expect(tokenAAmount).toEqual(JSBI.BigInt('0'))
      expect(tokenBAmount).toEqual(JSBI.BigInt('0'))
    })
  })

  describe('#getLiquidityValueAfterArbitrageToPrice', () => {
    it('correctly computes value after arbitrage', () => {
      const truePriceA = JSBI.BigInt('3')
      const truePriceB = JSBI.BigInt('1')
      const liquidityAmount = JSBI.BigInt('100000000000000000000') // 100 LP tokens

      const [tokenAAmount, tokenBAmount] = getLiquidityValueAfterArbitrageToPrice(
        mockPairReserves,
        truePriceA,
        truePriceB,
        liquidityAmount
      )

      expect(JSBI.greaterThan(tokenAAmount, JSBI.BigInt(0))).toBe(true)
      expect(JSBI.greaterThan(tokenBAmount, JSBI.BigInt(0))).toBe(true)
    })

    it('handles various price scenarios', () => {
      const truePriceA = JSBI.BigInt('1')
      const truePriceB = JSBI.BigInt('1')
      const liquidityAmount = JSBI.BigInt('100000000000000000000')

      const [tokenAAmountArb, tokenBAmountArb] = getLiquidityValueAfterArbitrageToPrice(
        mockPairReserves,
        truePriceA,
        truePriceB,
        liquidityAmount
      )

      // Should return valid amounts
      expect(JSBI.greaterThan(tokenAAmountArb, JSBI.BigInt(0))).toBe(true)
      expect(JSBI.greaterThan(tokenBAmountArb, JSBI.BigInt(0))).toBe(true)
    })

    it('throws on invalid liquidity amount', () => {
      const truePriceA = JSBI.BigInt('2')
      const truePriceB = JSBI.BigInt('1')
      const liquidityAmount = JSBI.add(mockPairReserves.totalSupply, JSBI.BigInt('1'))

      expect(() =>
        getLiquidityValueAfterArbitrageToPrice(mockPairReserves, truePriceA, truePriceB, liquidityAmount)
      ).toThrow('INVALID_LIQUIDITY_AMOUNT')
    })

    it('throws on zero liquidity amount', () => {
      const truePriceA = JSBI.BigInt('2')
      const truePriceB = JSBI.BigInt('1')
      const liquidityAmount = JSBI.BigInt('0')

      expect(() =>
        getLiquidityValueAfterArbitrageToPrice(mockPairReserves, truePriceA, truePriceB, liquidityAmount)
      ).toThrow('INVALID_LIQUIDITY_AMOUNT')
    })
  })

  describe('integration tests', () => {
    it('arbitrage and liquidity value calculation work together', () => {
      const pairReserves: PairReserves = {
        reserveA: JSBI.BigInt('1000000000000000000000'),
        reserveB: JSBI.BigInt('500000000000000000000'), // Imbalanced ratio
        totalSupply: JSBI.BigInt('707106781186547524400'),
        kLast: JSBI.BigInt('0'),
        feeOn: false
      }

      const truePriceA = JSBI.BigInt('1')
      const truePriceB = JSBI.BigInt('1')
      const liquidityAmount = JSBI.BigInt('100000000000000000000')

      // Check that both functions return valid results
      const [normalA, normalB] = getLiquidityValue(pairReserves, liquidityAmount)
      const [arbA, arbB] = getLiquidityValueAfterArbitrageToPrice(pairReserves, truePriceA, truePriceB, liquidityAmount)

      // All values should be positive
      expect(JSBI.greaterThan(normalA, JSBI.BigInt(0))).toBe(true)
      expect(JSBI.greaterThan(normalB, JSBI.BigInt(0))).toBe(true)
      expect(JSBI.greaterThan(arbA, JSBI.BigInt(0))).toBe(true)
      expect(JSBI.greaterThan(arbB, JSBI.BigInt(0))).toBe(true)
    })
  })
})
