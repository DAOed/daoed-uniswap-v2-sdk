import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

/**
 * Returns sorted token addresses, used to handle return values from pairs sorted in this order
 */
export function sortTokens(tokenA: string, tokenB: string): [string, string] {
  invariant(tokenA !== tokenB, 'IDENTICAL_ADDRESSES')
  const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA]
  invariant(token0.toLowerCase() !== '0x0000000000000000000000000000000000000000', 'ZERO_ADDRESS')
  return [token0, token1]
}

/**
 * Calculates the CREATE2 address for a pair without making any external calls
 * Note: This is a simplified version for demonstration purposes
 */
export function pairFor(factory: string, tokenA: string, tokenB: string, initCodeHash: string): string {
  const [token0, token1] = sortTokens(tokenA, tokenB)

  // In a real implementation, this would calculate the CREATE2 address
  // For now, return a mock address that's deterministic based on inputs
  const combined = factory + token0 + token1 + initCodeHash
  const mockAddress = '0x' + combined.slice(-40).padStart(40, '0')

  return mockAddress
}

/**
 * Given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
 */
export function quote(amountA: JSBI, reserveA: JSBI, reserveB: JSBI): JSBI {
  invariant(JSBI.greaterThan(amountA, JSBI.BigInt(0)), 'INSUFFICIENT_AMOUNT')
  invariant(
    JSBI.greaterThan(reserveA, JSBI.BigInt(0)) && JSBI.greaterThan(reserveB, JSBI.BigInt(0)),
    'INSUFFICIENT_LIQUIDITY'
  )
  return JSBI.divide(JSBI.multiply(amountA, reserveB), reserveA)
}

/**
 * Given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
 */
export function getAmountOut(amountIn: JSBI, reserveIn: JSBI, reserveOut: JSBI): JSBI {
  invariant(JSBI.greaterThan(amountIn, JSBI.BigInt(0)), 'INSUFFICIENT_INPUT_AMOUNT')
  invariant(
    JSBI.greaterThan(reserveIn, JSBI.BigInt(0)) && JSBI.greaterThan(reserveOut, JSBI.BigInt(0)),
    'INSUFFICIENT_LIQUIDITY'
  )

  const amountInWithFee = JSBI.multiply(amountIn, JSBI.BigInt(997))
  const numerator = JSBI.multiply(amountInWithFee, reserveOut)
  const denominator = JSBI.add(JSBI.multiply(reserveIn, JSBI.BigInt(1000)), amountInWithFee)
  return JSBI.divide(numerator, denominator)
}

/**
 * Given an output amount of an asset and pair reserves, returns a required input amount of the other asset
 */
export function getAmountIn(amountOut: JSBI, reserveIn: JSBI, reserveOut: JSBI): JSBI {
  invariant(JSBI.greaterThan(amountOut, JSBI.BigInt(0)), 'INSUFFICIENT_OUTPUT_AMOUNT')
  invariant(
    JSBI.greaterThan(reserveIn, JSBI.BigInt(0)) && JSBI.greaterThan(reserveOut, JSBI.BigInt(0)),
    'INSUFFICIENT_LIQUIDITY'
  )

  const numerator = JSBI.multiply(JSBI.multiply(reserveIn, amountOut), JSBI.BigInt(1000))
  const denominator = JSBI.multiply(JSBI.subtract(reserveOut, amountOut), JSBI.BigInt(997))
  return JSBI.add(JSBI.divide(numerator, denominator), JSBI.BigInt(1))
}

/**
 * Performs chained getAmountOut calculations on any number of pairs
 */
export function getAmountsOut(amountIn: JSBI, reserves: Array<[JSBI, JSBI]>): JSBI[] {
  invariant(reserves.length >= 1, 'INVALID_PATH')
  const amounts: JSBI[] = new Array(reserves.length + 1)
  amounts[0] = amountIn
  for (let i = 0; i < reserves.length; i++) {
    amounts[i + 1] = getAmountOut(amounts[i], reserves[i][0], reserves[i][1])
  }
  return amounts
}

/**
 * Performs chained getAmountIn calculations on any number of pairs
 */
export function getAmountsIn(amountOut: JSBI, reserves: Array<[JSBI, JSBI]>): JSBI[] {
  invariant(reserves.length >= 1, 'INVALID_PATH')
  const amounts: JSBI[] = new Array(reserves.length + 1)
  amounts[amounts.length - 1] = amountOut
  for (let i = reserves.length - 1; i >= 0; i--) {
    amounts[i] = getAmountIn(amounts[i + 1], reserves[i][0], reserves[i][1])
  }
  return amounts
}
