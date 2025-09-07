import JSBI from 'jsbi'
import { sortTokens, pairFor, quote, getAmountOut, getAmountIn, getAmountsOut, getAmountsIn } from './uniswapV2Library'

describe('UniswapV2Library', () => {
  const FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
  const INIT_CODE_HASH = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'
  const TOKEN_A = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
  const TOKEN_B = '0xA0b86a33E6441e56Ce5F77e1d89Fb0CaE9D35b8B' // GTC

  describe('#sortTokens', () => {
    it('sorts tokens correctly', () => {
      const [token0, token1] = sortTokens(TOKEN_A, TOKEN_B)
      expect(token0.toLowerCase() < token1.toLowerCase()).toBe(true)
    })

    it('returns identical tokens when order is swapped', () => {
      const [token0_A, token1_A] = sortTokens(TOKEN_A, TOKEN_B)
      const [token0_B, token1_B] = sortTokens(TOKEN_B, TOKEN_A)
      expect(token0_A).toEqual(token0_B)
      expect(token1_A).toEqual(token1_B)
    })

    it('throws on identical addresses', () => {
      expect(() => sortTokens(TOKEN_A, TOKEN_A)).toThrow('IDENTICAL_ADDRESSES')
    })

    it('throws on zero address', () => {
      expect(() => sortTokens('0x0000000000000000000000000000000000000000', TOKEN_A)).toThrow('ZERO_ADDRESS')
    })
  })

  describe('#pairFor', () => {
    it('returns correct pair address', () => {
      const pair = pairFor(FACTORY_ADDRESS, TOKEN_A, TOKEN_B, INIT_CODE_HASH)
      expect(typeof pair).toBe('string')
      expect(pair.length).toBe(42)
      expect(pair.startsWith('0x')).toBe(true)
    })

    it('returns same address regardless of token order', () => {
      const pairAB = pairFor(FACTORY_ADDRESS, TOKEN_A, TOKEN_B, INIT_CODE_HASH)
      const pairBA = pairFor(FACTORY_ADDRESS, TOKEN_B, TOKEN_A, INIT_CODE_HASH)
      expect(pairAB).toEqual(pairBA)
    })
  })

  describe('#quote', () => {
    it('returns correct quote', () => {
      const amountA = JSBI.BigInt('100')
      const reserveA = JSBI.BigInt('1000')
      const reserveB = JSBI.BigInt('2000')
      const amountB = quote(amountA, reserveA, reserveB)
      expect(amountB).toEqual(JSBI.BigInt('200'))
    })

    it('handles edge case correctly', () => {
      const amountA = JSBI.BigInt('1')
      const reserveA = JSBI.BigInt('3')
      const reserveB = JSBI.BigInt('7')
      const amountB = quote(amountA, reserveA, reserveB)
      expect(amountB).toEqual(JSBI.BigInt('2'))
    })

    it('throws on insufficient amount', () => {
      expect(() => quote(JSBI.BigInt('0'), JSBI.BigInt('1000'), JSBI.BigInt('2000'))).toThrow('INSUFFICIENT_AMOUNT')
    })

    it('throws on insufficient liquidity', () => {
      expect(() => quote(JSBI.BigInt('100'), JSBI.BigInt('0'), JSBI.BigInt('2000'))).toThrow('INSUFFICIENT_LIQUIDITY')
      expect(() => quote(JSBI.BigInt('100'), JSBI.BigInt('1000'), JSBI.BigInt('0'))).toThrow('INSUFFICIENT_LIQUIDITY')
    })
  })

  describe('#getAmountOut', () => {
    it('returns correct amount out', () => {
      const amountIn = JSBI.BigInt('100')
      const reserveIn = JSBI.BigInt('1000')
      const reserveOut = JSBI.BigInt('2000')
      const amountOut = getAmountOut(amountIn, reserveIn, reserveOut)
      // (100 * 997 * 2000) / (1000 * 1000 + 100 * 997) = 181.639344262295
      expect(JSBI.toNumber(amountOut)).toBe(181)
    })

    it('handles large numbers correctly', () => {
      const amountIn = JSBI.BigInt('1000000000000000000') // 1 ETH
      const reserveIn = JSBI.BigInt('10000000000000000000') // 10 ETH
      const reserveOut = JSBI.BigInt('20000000000000000000') // 20 ETH
      const amountOut = getAmountOut(amountIn, reserveIn, reserveOut)
      expect(JSBI.greaterThan(amountOut, JSBI.BigInt(0))).toBe(true)
    })

    it('throws on insufficient input amount', () => {
      expect(() => getAmountOut(JSBI.BigInt('0'), JSBI.BigInt('1000'), JSBI.BigInt('2000'))).toThrow(
        'INSUFFICIENT_INPUT_AMOUNT'
      )
    })

    it('throws on insufficient liquidity', () => {
      expect(() => getAmountOut(JSBI.BigInt('100'), JSBI.BigInt('0'), JSBI.BigInt('2000'))).toThrow(
        'INSUFFICIENT_LIQUIDITY'
      )
    })
  })

  describe('#getAmountIn', () => {
    it('returns correct amount in', () => {
      const amountOut = JSBI.BigInt('100')
      const reserveIn = JSBI.BigInt('1000')
      const reserveOut = JSBI.BigInt('2000')
      const amountIn = getAmountIn(amountOut, reserveIn, reserveOut)
      // (1000 * 100 * 1000) / ((2000 - 100) * 997) + 1 = 52.89...
      expect(JSBI.toNumber(amountIn)).toBe(53)
    })

    it('throws on insufficient output amount', () => {
      expect(() => getAmountIn(JSBI.BigInt('0'), JSBI.BigInt('1000'), JSBI.BigInt('2000'))).toThrow(
        'INSUFFICIENT_OUTPUT_AMOUNT'
      )
    })

    it('throws on insufficient liquidity', () => {
      expect(() => getAmountIn(JSBI.BigInt('100'), JSBI.BigInt('0'), JSBI.BigInt('2000'))).toThrow(
        'INSUFFICIENT_LIQUIDITY'
      )
    })
  })

  describe('#getAmountsOut', () => {
    it('returns correct amounts for single hop', () => {
      const amountIn = JSBI.BigInt('100')
      const reserves: Array<[JSBI, JSBI]> = [[JSBI.BigInt('1000'), JSBI.BigInt('2000')]]
      const amounts = getAmountsOut(amountIn, reserves)
      expect(amounts.length).toBe(2)
      expect(amounts[0]).toEqual(amountIn)
      expect(JSBI.greaterThan(amounts[1], JSBI.BigInt(0))).toBe(true)
    })

    it('returns correct amounts for multi-hop', () => {
      const amountIn = JSBI.BigInt('100')
      const reserves: Array<[JSBI, JSBI]> = [
        [JSBI.BigInt('1000'), JSBI.BigInt('2000')],
        [JSBI.BigInt('1500'), JSBI.BigInt('3000')]
      ]
      const amounts = getAmountsOut(amountIn, reserves)
      expect(amounts.length).toBe(3)
      expect(amounts[0]).toEqual(amountIn)
      expect(JSBI.greaterThan(amounts[1], JSBI.BigInt(0))).toBe(true)
      expect(JSBI.greaterThan(amounts[2], JSBI.BigInt(0))).toBe(true)
    })

    it('throws on invalid path', () => {
      expect(() => getAmountsOut(JSBI.BigInt('100'), [])).toThrow('INVALID_PATH')
    })
  })

  describe('#getAmountsIn', () => {
    it('returns correct amounts for single hop', () => {
      const amountOut = JSBI.BigInt('100')
      const reserves: Array<[JSBI, JSBI]> = [[JSBI.BigInt('1000'), JSBI.BigInt('2000')]]
      const amounts = getAmountsIn(amountOut, reserves)
      expect(amounts.length).toBe(2)
      expect(amounts[1]).toEqual(amountOut)
      expect(JSBI.greaterThan(amounts[0], JSBI.BigInt(0))).toBe(true)
    })

    it('returns correct amounts for multi-hop', () => {
      const amountOut = JSBI.BigInt('100')
      const reserves: Array<[JSBI, JSBI]> = [
        [JSBI.BigInt('1000'), JSBI.BigInt('2000')],
        [JSBI.BigInt('1500'), JSBI.BigInt('3000')]
      ]
      const amounts = getAmountsIn(amountOut, reserves)
      expect(amounts.length).toBe(3)
      expect(amounts[2]).toEqual(amountOut)
      expect(JSBI.greaterThan(amounts[0], JSBI.BigInt(0))).toBe(true)
      expect(JSBI.greaterThan(amounts[1], JSBI.BigInt(0))).toBe(true)
    })

    it('throws on invalid path', () => {
      expect(() => getAmountsIn(JSBI.BigInt('100'), [])).toThrow('INVALID_PATH')
    })
  })
})
