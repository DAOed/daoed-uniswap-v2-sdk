export declare const FACTORY_ADDRESSES: {
    [chainId: number]: string;
};
export declare const ROUTER_ADDRESSES: {
    [chainId: number]: string;
};
export declare function setFactoryAddress(chainId: number, address: string): void;
export declare function setRouterAddress(chainId: number, address: string): void;
export declare function getFactoryAddress(chainId: number): string | undefined;
export declare function getRouterAddress(chainId: number): string | undefined;
