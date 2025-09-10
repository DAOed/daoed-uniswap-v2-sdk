import JSBI from 'jsbi'
/**
 * Returns sorted token addresses, used to handle return values from pairs sorted in this order
 */
export declare function sortTokens(tokenA: string, tokenB: string): [string, string]
/**
 * Calculates the CREATE2 address for a pair without making any external calls
 * Note: This is a simplified version for demonstration purposes
 */
export declare function pairFor(factory: string, tokenA: string, tokenB: string, initCodeHash: string): string
/**
 * Given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
 */
export declare function quote(amountA: JSBI, reserveA: JSBI, reserveB: JSBI): JSBI
/**
 * Given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
 */
export declare function getAmountOut(amountIn: JSBI, reserveIn: JSBI, reserveOut: JSBI): JSBI
/**
 * Given an output amount of an asset and pair reserves, returns a required input amount of the other asset
 */
export declare function getAmountIn(amountOut: JSBI, reserveIn: JSBI, reserveOut: JSBI): JSBI
/**
 * Performs chained getAmountOut calculations on any number of pairs
 */
export declare function getAmountsOut(amountIn: JSBI, reserves: Array<[JSBI, JSBI]>): JSBI[]
/**
 * Performs chained getAmountIn calculations on any number of pairs
 */
export declare function getAmountsIn(amountOut: JSBI, reserves: Array<[JSBI, JSBI]>): JSBI[]
