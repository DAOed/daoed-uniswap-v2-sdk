import JSBI from 'jsbi'
/**
 * Computes the direction and magnitude of the profit-maximizing trade
 * @param truePriceTokenA The true price of token A
 * @param truePriceTokenB The true price of token B
 * @param reserveA Reserve of token A
 * @param reserveB Reserve of token B
 * @returns [aToB: boolean, amountIn: JSBI] - direction and amount for profit-maximizing trade
 */
export declare function computeProfitMaximizingTrade(
  truePriceTokenA: JSBI,
  truePriceTokenB: JSBI,
  reserveA: JSBI,
  reserveB: JSBI
): [boolean, JSBI]
/**
 * Gets the reserves after an arbitrage moves the price to the profit-maximizing ratio
 * @param reserveA Initial reserve of token A
 * @param reserveB Initial reserve of token B
 * @param truePriceTokenA The true price of token A
 * @param truePriceTokenB The true price of token B
 * @returns [reserveA: JSBI, reserveB: JSBI] - reserves after arbitrage
 */
export declare function getReservesAfterArbitrage(
  reserveA: JSBI,
  reserveB: JSBI,
  truePriceTokenA: JSBI,
  truePriceTokenB: JSBI
): [JSBI, JSBI]
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
export declare function computeLiquidityValue(
  reservesA: JSBI,
  reservesB: JSBI,
  totalSupply: JSBI,
  liquidityAmount: JSBI,
  feeOn: boolean,
  kLast: JSBI
): [JSBI, JSBI]
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
export declare function getLiquidityValue(pairReserves: PairReserves, liquidityAmount: JSBI): [JSBI, JSBI]
/**
 * Computes the value of liquidity tokens after arbitrage to true price
 * @param pairReserves Current reserves and metadata for the pair
 * @param truePriceTokenA The true price of token A
 * @param truePriceTokenB The true price of token B
 * @param liquidityAmount Amount of liquidity tokens to value
 * @returns [tokenAAmount: JSBI, tokenBAmount: JSBI] - underlying token amounts after arbitrage
 */
export declare function getLiquidityValueAfterArbitrageToPrice(
  pairReserves: PairReserves,
  truePriceTokenA: JSBI,
  truePriceTokenB: JSBI,
  liquidityAmount: JSBI
): [JSBI, JSBI]
