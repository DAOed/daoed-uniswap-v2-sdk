import JSBI from 'jsbi';
export declare type BigintIsh = JSBI | string | number;
export declare enum TradeType {
    EXACT_INPUT = 0,
    EXACT_OUTPUT = 1
}
export declare enum Rounding {
    ROUND_DOWN = 0,
    ROUND_HALF_UP = 1,
    ROUND_UP = 2
}
export declare const MaxUint256: JSBI;
export declare const FACTORY_ADDRESS_MAP: {
    [chainId: number]: string;
};
export declare const INIT_CODE_HASH = "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";
export declare const MINIMUM_LIQUIDITY: JSBI;
export declare const ZERO: JSBI;
export declare const ONE: JSBI;
export declare const FIVE: JSBI;
export declare const _997: JSBI;
export declare const _1000: JSBI;
export declare const BASIS_POINTS: JSBI;
