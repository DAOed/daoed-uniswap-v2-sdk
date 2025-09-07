import JSBI from 'jsbi'
import invariant from 'tiny-invariant'
import { sqrt } from './sqrt'
import { getAmountOut } from './uniswapV2Library'

/**
 * Computes the direction and magnitude of the profit-maximizing trade
 * @param truePriceTokenA The true price of token A
 * @param truePriceTokenB The true price of token B
 * @param reserveA Reserve of token A
 * @param reserveB Reserve of token B
 * @returns [aToB: boolean, amountIn: JSBI] - direction and amount for profit-maximizing trade
 */
export function computeProfitMaximizingTrade(
  truePriceTokenA: JSBI,
  truePriceTokenB: JSBI,
  reserveA: JSBI,
  reserveB: JSBI
): [boolean, JSBI] {
  invariant(
    JSBI.greaterThan(truePriceTokenA, JSBI.BigInt(0)) && JSBI.greaterThan(truePriceTokenB, JSBI.BigInt(0)),
    'INVALID_PRICES'
  )
  invariant(
    JSBI.greaterThan(reserveA, JSBI.BigInt(0)) && JSBI.greaterThan(reserveB, JSBI.BigInt(0)),
    'INSUFFICIENT_RESERVES'
  )

  // Current price in pool: reserveB / reserveA
  // True price ratio: truePriceTokenB / truePriceTokenA
  // If current price < true price, A is undervalued, sell B to buy A (aToB = false)
  // If current price > true price, A is overvalued, sell A to buy B (aToB = true)

  const currentPrice = JSBI.divide(JSBI.multiply(reserveB, truePriceTokenA), reserveA)
  const aToB = JSBI.greaterThan(currentPrice, truePriceTokenB)

  if (JSBI.equal(currentPrice, truePriceTokenB)) {
    return [false, JSBI.BigInt(0)]
  }

  const invariantValue = JSBI.multiply(reserveA, reserveB)

  try {
    const leftSide = sqrt(
      JSBI.divide(
        JSBI.multiply(JSBI.multiply(invariantValue, JSBI.BigInt(1000)), aToB ? truePriceTokenA : truePriceTokenB),
        JSBI.multiply(aToB ? truePriceTokenB : truePriceTokenA, JSBI.BigInt(997))
      )
    )

    const rightSide = JSBI.divide(JSBI.multiply(aToB ? reserveA : reserveB, JSBI.BigInt(1000)), JSBI.BigInt(997))

    if (JSBI.lessThan(leftSide, rightSide)) {
      return [false, JSBI.BigInt(0)]
    }

    const amountIn = JSBI.subtract(leftSide, rightSide)
    return [aToB, amountIn]
  } catch (error) {
    return [false, JSBI.BigInt(0)]
  }
}

/**
 * Gets the reserves after an arbitrage moves the price to the profit-maximizing ratio
 * @param reserveA Initial reserve of token A
 * @param reserveB Initial reserve of token B
 * @param truePriceTokenA The true price of token A
 * @param truePriceTokenB The true price of token B
 * @returns [reserveA: JSBI, reserveB: JSBI] - reserves after arbitrage
 */
export function getReservesAfterArbitrage(
  reserveA: JSBI,
  reserveB: JSBI,
  truePriceTokenA: JSBI,
  truePriceTokenB: JSBI
): [JSBI, JSBI] {
  invariant(
    JSBI.greaterThan(reserveA, JSBI.BigInt(0)) && JSBI.greaterThan(reserveB, JSBI.BigInt(0)),
    'ZERO_PAIR_RESERVES'
  )

  const [aToB, amountIn] = computeProfitMaximizingTrade(truePriceTokenA, truePriceTokenB, reserveA, reserveB)

  if (JSBI.equal(amountIn, JSBI.BigInt(0))) {
    return [reserveA, reserveB]
  }

  if (aToB) {
    const amountOut = getAmountOut(amountIn, reserveA, reserveB)
    return [JSBI.add(reserveA, amountIn), JSBI.subtract(reserveB, amountOut)]
  } else {
    const amountOut = getAmountOut(amountIn, reserveB, reserveA)
    return [JSBI.subtract(reserveA, amountOut), JSBI.add(reserveB, amountIn)]
  }
}

/**
 * Computes liquidity value given all the parameters of the pair
 * @param reservesA Reserve of token A
 * @param reservesB Reserve of token B
 * @param totalSupply Total supply of liquidity tokens
 * @param liquidityAmount Amount of liquidity tokens
 * @param feeOn Whether protocol fee is on
 * @param kLast Last invariant value (for fee calculation)
 * @returns [tokenAAmount: JSBI, tokenBAmount: JSBI] - amounts of token A and B
 */
export function computeLiquidityValue(
  reservesA: JSBI,
  reservesB: JSBI,
  totalSupply: JSBI,
  liquidityAmount: JSBI,
  feeOn: boolean,
  kLast: JSBI
): [JSBI, JSBI] {
  let adjustedTotalSupply = totalSupply

  if (feeOn && JSBI.greaterThan(kLast, JSBI.BigInt(0))) {
    const rootK = sqrt(JSBI.multiply(reservesA, reservesB))
    const rootKLast = sqrt(kLast)

    if (JSBI.greaterThan(rootK, rootKLast)) {
      const numerator1 = totalSupply
      const numerator2 = JSBI.subtract(rootK, rootKLast)
      const denominator = JSBI.add(JSBI.multiply(rootK, JSBI.BigInt(5)), rootKLast)
      const feeLiquidity = JSBI.divide(JSBI.multiply(numerator1, numerator2), denominator)
      adjustedTotalSupply = JSBI.add(totalSupply, feeLiquidity)
    }
  }

  return [
    JSBI.divide(JSBI.multiply(reservesA, liquidityAmount), adjustedTotalSupply),
    JSBI.divide(JSBI.multiply(reservesB, liquidityAmount), adjustedTotalSupply)
  ]
}

/**
 * Interface for pair information needed for liquidity calculations
 */
export interface PairReserves {
  reserveA: JSBI
  reserveB: JSBI
  totalSupply: JSBI
  kLast: JSBI
  feeOn: boolean
}

/**
 * Computes the value of liquidity tokens in terms of underlying tokens
 * @param pairReserves Current reserves and metadata for the pair
 * @param liquidityAmount Amount of liquidity tokens to value
 * @returns [tokenAAmount: JSBI, tokenBAmount: JSBI] - underlying token amounts
 */
export function getLiquidityValue(pairReserves: PairReserves, liquidityAmount: JSBI): [JSBI, JSBI] {
  return computeLiquidityValue(
    pairReserves.reserveA,
    pairReserves.reserveB,
    pairReserves.totalSupply,
    liquidityAmount,
    pairReserves.feeOn,
    pairReserves.kLast
  )
}

/**
 * Computes the value of liquidity tokens after arbitrage to true price
 * @param pairReserves Current reserves and metadata for the pair
 * @param truePriceTokenA The true price of token A
 * @param truePriceTokenB The true price of token B
 * @param liquidityAmount Amount of liquidity tokens to value
 * @returns [tokenAAmount: JSBI, tokenBAmount: JSBI] - underlying token amounts after arbitrage
 */
export function getLiquidityValueAfterArbitrageToPrice(
  pairReserves: PairReserves,
  truePriceTokenA: JSBI,
  truePriceTokenB: JSBI,
  liquidityAmount: JSBI
): [JSBI, JSBI] {
  invariant(
    JSBI.greaterThanOrEqual(pairReserves.totalSupply, liquidityAmount) &&
      JSBI.greaterThan(liquidityAmount, JSBI.BigInt(0)),
    'INVALID_LIQUIDITY_AMOUNT'
  )

  const [reservesA, reservesB] = getReservesAfterArbitrage(
    pairReserves.reserveA,
    pairReserves.reserveB,
    truePriceTokenA,
    truePriceTokenB
  )

  return computeLiquidityValue(
    reservesA,
    reservesB,
    pairReserves.totalSupply,
    liquidityAmount,
    pairReserves.feeOn,
    pairReserves.kLast
  )
}
