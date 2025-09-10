import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount } from './fractions/currencyAmount'
import { Price } from './fractions/price'
import { Token } from './token'
import { FACTORY_ADDRESSES } from '../addresses'
import { WETH9 } from './weth9'
import { InsufficientInputAmountError } from '../errors'
import { computePairAddress, Pair } from './pair'
import { SEPOLIA_CHAIN_ID, USDC, DAI, USDC_SEPOLIA, DAI_SEPOLIA } from './test-constants'

describe('computePairAddress', () => {
  it('should correctly compute the pool address', () => {
    const result = computePairAddress({
      factoryAddress: FACTORY_ADDRESSES[SEPOLIA_CHAIN_ID],
      tokenA: USDC_SEPOLIA,
      tokenB: DAI_SEPOLIA
    })

    expect(result).toEqual('0xbd9dBc76ADCD34561f89C56be0547691ccD9AF32')
  })
  it('should give same result regardless of token order', () => {
    const resultA = computePairAddress({
      factoryAddress: FACTORY_ADDRESSES[SEPOLIA_CHAIN_ID],
      tokenA: USDC_SEPOLIA,
      tokenB: DAI_SEPOLIA
    })

    const resultB = computePairAddress({
      factoryAddress: FACTORY_ADDRESSES[SEPOLIA_CHAIN_ID],
      tokenA: DAI_SEPOLIA,
      tokenB: USDC_SEPOLIA
    })

    expect(resultA).toEqual(resultB)
  })
})

describe('Pair', () => {
  describe('constructor', () => {
    it('cannot be used for tokens on different chains', () => {
      // Create a token on a different chain for testing
      const differentChainToken = new Token(1, '0x1234567890123456789012345678901234567890', 18, 'TEST', 'Test Token')
      expect(
        () =>
          new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(differentChainToken, '100'))
      ).toThrow('CHAIN_IDS')
    })
  })

  describe('#getAddress', () => {
    it('returns the correct address', () => {
      expect(Pair.getAddress(USDC_SEPOLIA, DAI_SEPOLIA)).toEqual('0xbd9dBc76ADCD34561f89C56be0547691ccD9AF32')
    })

    it('returns the correct address on Sepolia', () => {
      expect(Pair.getAddress(USDC_SEPOLIA, DAI_SEPOLIA)).toEqual(
        computePairAddress({
          factoryAddress: FACTORY_ADDRESSES[SEPOLIA_CHAIN_ID],
          tokenA: USDC_SEPOLIA,
          tokenB: DAI_SEPOLIA
        })
      )
    })

    it('throws if factory address is not defined for chain id', () => {
      class TestToken extends Token {
        constructor(chainId: number) {
          super(chainId, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'USDC', 'USD Coin')
        }
      }
      const TESTNET_USDC = new TestToken(2)
      const TESTNET_DAI = new TestToken(2)
      expect(() => Pair.getAddress(TESTNET_USDC, TESTNET_DAI)).toThrow('FACTORY_ADDRESS')
    })
  })

  describe('#token0', () => {
    it('always is the token that sorts before', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(DAI, '100')).token0
      ).toEqual(USDC)
      expect(
        new Pair(CurrencyAmount.fromRawAmount(DAI, '100'), CurrencyAmount.fromRawAmount(USDC, '100')).token0
      ).toEqual(USDC)
    })
  })
  describe('#token1', () => {
    it('always is the token that sorts after', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(DAI, '100')).token1
      ).toEqual(DAI)
      expect(
        new Pair(CurrencyAmount.fromRawAmount(DAI, '100'), CurrencyAmount.fromRawAmount(USDC, '100')).token1
      ).toEqual(DAI)
    })
  })
  describe('#reserve0', () => {
    it('always comes from the token that sorts before', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(DAI, '101')).reserve0
      ).toEqual(CurrencyAmount.fromRawAmount(USDC, '100'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(DAI, '101'), CurrencyAmount.fromRawAmount(USDC, '100')).reserve0
      ).toEqual(CurrencyAmount.fromRawAmount(USDC, '100'))
    })
  })
  describe('#reserve1', () => {
    it('always comes from the token that sorts after', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(DAI, '101')).reserve1
      ).toEqual(CurrencyAmount.fromRawAmount(DAI, '101'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(DAI, '101'), CurrencyAmount.fromRawAmount(USDC, '100')).reserve1
      ).toEqual(CurrencyAmount.fromRawAmount(DAI, '101'))
    })
  })

  describe('#token0Price', () => {
    it('returns price of token0 in terms of token1', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '101'), CurrencyAmount.fromRawAmount(DAI, '100')).token0Price
      ).toEqual(new Price(USDC, DAI, '101', '100'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(DAI, '100'), CurrencyAmount.fromRawAmount(USDC, '101')).token0Price
      ).toEqual(new Price(USDC, DAI, '101', '100'))
    })
  })

  describe('#token1Price', () => {
    it('returns price of token1 in terms of token0', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '101'), CurrencyAmount.fromRawAmount(DAI, '100')).token1Price
      ).toEqual(new Price(DAI, USDC, '100', '101'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(DAI, '100'), CurrencyAmount.fromRawAmount(USDC, '101')).token1Price
      ).toEqual(new Price(DAI, USDC, '100', '101'))
    })
  })

  describe('#priceOf', () => {
    const pair = new Pair(CurrencyAmount.fromRawAmount(USDC, '101'), CurrencyAmount.fromRawAmount(DAI, '100'))
    it('returns price of token in terms of other token', () => {
      expect(pair.priceOf(USDC)).toEqual(pair.token0Price)
      expect(pair.priceOf(DAI)).toEqual(pair.token1Price)
    })

    it('throws if invalid token', () => {
      expect(() => pair.priceOf(WETH9[SEPOLIA_CHAIN_ID])).toThrow('TOKEN')
    })
  })

  describe('#reserveOf', () => {
    it('returns reserves of the given token', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(DAI, '101')).reserveOf(USDC)
      ).toEqual(CurrencyAmount.fromRawAmount(USDC, '100'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(DAI, '101'), CurrencyAmount.fromRawAmount(USDC, '100')).reserveOf(USDC)
      ).toEqual(CurrencyAmount.fromRawAmount(USDC, '100'))
    })

    it('throws if not in the pair', () => {
      expect(() =>
        new Pair(CurrencyAmount.fromRawAmount(DAI, '101'), CurrencyAmount.fromRawAmount(USDC, '100')).reserveOf(
          WETH9[SEPOLIA_CHAIN_ID]
        )
      ).toThrow('TOKEN')
    })
  })

  describe('#chainId', () => {
    it('returns the token0 chainId', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC_SEPOLIA, '100'), CurrencyAmount.fromRawAmount(DAI_SEPOLIA, '100'))
          .chainId
      ).toEqual(SEPOLIA_CHAIN_ID)
      expect(
        new Pair(CurrencyAmount.fromRawAmount(DAI_SEPOLIA, '100'), CurrencyAmount.fromRawAmount(USDC_SEPOLIA, '100'))
          .chainId
      ).toEqual(SEPOLIA_CHAIN_ID)
    })
  })
  describe('#involvesToken', () => {
    expect(
      new Pair(
        CurrencyAmount.fromRawAmount(USDC_SEPOLIA, '100'),
        CurrencyAmount.fromRawAmount(DAI_SEPOLIA, '100')
      ).involvesToken(USDC_SEPOLIA)
    ).toEqual(true)
    expect(
      new Pair(
        CurrencyAmount.fromRawAmount(USDC_SEPOLIA, '100'),
        CurrencyAmount.fromRawAmount(DAI_SEPOLIA, '100')
      ).involvesToken(DAI_SEPOLIA)
    ).toEqual(true)
    expect(
      new Pair(
        CurrencyAmount.fromRawAmount(USDC_SEPOLIA, '100'),
        CurrencyAmount.fromRawAmount(DAI_SEPOLIA, '100')
      ).involvesToken(WETH9[SEPOLIA_CHAIN_ID])
    ).toEqual(false)
  })
  describe('getInputAmount and getOutputAmount', () => {
    const BLASTBuyFeeBps = BigNumber.from(400)
    const BLASTSellFeeBps = BigNumber.from(10000)
    const BLAST = new Token(
      SEPOLIA_CHAIN_ID,
      '0x3ed643e9032230f01c6c36060e305ab53ad3b482',
      18,
      'BLAST',
      'BLAST',
      false,
      BLASTBuyFeeBps,
      BLASTSellFeeBps
    )
    const BLAST_WIHTOUT_TAX = new Token(
      SEPOLIA_CHAIN_ID,
      '0x3ed643e9032230f01c6c36060e305ab53ad3b482',
      18,
      'BLAST',
      'BLAST',
      false
    )
    const BLASTERSBuyFeeBps = BigNumber.from(300)
    const BLASTERSSellFeeBps = BigNumber.from(350)
    const BLASTERS = new Token(
      SEPOLIA_CHAIN_ID,
      '0xab98093C7232E98A47D7270CE0c1c2106f61C73b',
      9,
      'BLAST',
      'BLASTERS',
      false,
      BLASTERSBuyFeeBps,
      BLASTERSSellFeeBps
    )
    const BLASTERS_WITHOUT_TAX = new Token(
      SEPOLIA_CHAIN_ID,
      '0xab98093C7232E98A47D7270CE0c1c2106f61C73b',
      9,
      'BLAST',
      'BLASTERS',
      false
    )

    let calculateFotFees: boolean = false

    describe('when calculating FOT fees', () => {
      beforeEach(() => {
        calculateFotFees = true
      })

      describe('getOutputAmount', () => {
        it('getOutputAmount for input token BLASTERS and output token BLAST', () => {
          const reserveBlasterAmount = CurrencyAmount.fromRawAmount(BLASTERS, '10000')
          const reserveBlastAmount = CurrencyAmount.fromRawAmount(BLAST, '10000')

          const pair = new Pair(reserveBlasterAmount, reserveBlastAmount)

          const inputBlastersAmount = CurrencyAmount.fromRawAmount(BLASTERS_WITHOUT_TAX, '100')
          const [outputBlastAmount] = pair.getOutputAmount(inputBlastersAmount, calculateFotFees)

          // Theoretical amount out:
          // (10000 * 997 * 100 * (1 - 3.5%) / (10000 * 1000 + 997 * 100 * (1 - 3.5%))) * (1 - 4%)
          // = 91.48
          //
          // However in practice, we have round down of precisions in multiple steps
          // hence the amount out will be slightly less than 91.48:
          //
          // inputAmount = 100
          // percentAfterSellFeesInDecimal = fraction(9650, 10000)
          // inputAmountAfterTax = 100 * fraction(9650, 10000) = 96.5 = 96 (rounded down)
          // inputAmountWithFeeAndAfterTax = 96 * 997 = 95712
          // numerator = 95712 * 10000 = 957120000
          // denominator = 10000 * 1000 + 95712 = 10095712
          // outputAmount = 957120000 / 10095712 = 94.8046061536 = 94 (rounded down)
          // buyFeePercentInDecimal = fraction(400, 10000)
          // percentAfterBuyFeesInDecimal = fraction(9600, 10000)
          // outputAmountAfterTax = 94 * fraction(9600, 10000)
          //                     = 94 * 0.96
          //                     = 90.24
          //                     = 90 (rounded down)
          const expectedOutputBlastAmount = '0.00000000000000009'
          expect(outputBlastAmount.toExact()).toEqual(expectedOutputBlastAmount)
        })

        it('getInputAmount for input token BLASTERS and output token BLAST', () => {
          const reserveBlasterAmount = CurrencyAmount.fromRawAmount(BLASTERS, '10000')
          const reserveBlastAmount = CurrencyAmount.fromRawAmount(BLAST, '10000')

          const pair = new Pair(reserveBlasterAmount, reserveBlastAmount)

          const outputBlastAmount = CurrencyAmount.fromRawAmount(BLAST_WIHTOUT_TAX, '91')
          const [inputBlasterAmount] = pair.getInputAmount(outputBlastAmount, calculateFotFees)

          // Theoretical amount in:
          // 10000 * 100 * (1 - 4%) * 1000 / ((10000 - 100 * (1 - 4%)) * 997) / (1 - 3.5%)
          // = 100.7483934892
          //
          // However in practice, we have round up of precisions in multiple steps
          // hence the amount out will be slightly more than 100.7483934892:
          //
          // buyFeePercentInDecimal = fraction(400, 10000)
          // percentAfterBuyFeesInDecimal = 1 - fraction(400, 10000) = fraction(9600, 10000)
          // outputAmountBeforeTax = 91 / fraction(960000, 10000) + 1
          //                     = 91 / 0.96 + 1
          //                     = 94.7916666667 + 1
          //                     = 94 (rounded down) + 1
          //                     = 95 (rounded up)
          // numerator = 10000 * 95 * 1000 = 950000000
          // denominator = (10000 - 95) * 997 = 9875285
          // inputAmount = 950000000 / 9875285 + 1
          //             = 96.1997552476 + 1
          //             = 96 (rounded down) + 1
          //             = 97 (rounded up)
          // sellFeePercentInDecimal = fraction(350, 10000)
          // percentAfterSellFeesInDecimal = 1 - fraction(350, 10000) = fraction(9650, 10000)
          // inputAmountBeforeTax = (97 / fraction(9650, 10000)) + 1
          //                     = (97 / 0.965) + 1
          //                     = 100.518134715 + 1
          //                     = 100 (rounded down) + 1
          //                     = 101
          const expectedInputBlasterAmount = '0.000000101'
          expect(inputBlasterAmount.toExact()).toEqual(expectedInputBlasterAmount)
        })
      })
    })

    describe('when NOT calculating FOT fees', () => {
      beforeEach(() => {
        calculateFotFees = false
      })

      describe('getOutputAmount', () => {
        it('getOutputAmount for input token BLASTERS and output token BLAST', () => {
          const reserveBlasterAmount = CurrencyAmount.fromRawAmount(BLASTERS, '10000')
          const reserveBlastAmount = CurrencyAmount.fromRawAmount(BLAST, '10000')

          const pair = new Pair(reserveBlasterAmount, reserveBlastAmount)

          const inputBlastersAmount = CurrencyAmount.fromRawAmount(BLASTERS_WITHOUT_TAX, '100')
          const [outputBlastAmount] = pair.getOutputAmount(inputBlastersAmount, calculateFotFees)

          const expectedOutputBlastAmount = '0.000000000000000098'
          expect(outputBlastAmount.toExact()).toEqual(expectedOutputBlastAmount)
        })

        it('getInputAmount for input token BLASTERS and output token BLAST', () => {
          const reserveBlasterAmount = CurrencyAmount.fromRawAmount(BLASTERS, '10000')
          const reserveBlastAmount = CurrencyAmount.fromRawAmount(BLAST, '10000')

          const pair = new Pair(reserveBlasterAmount, reserveBlastAmount)

          const outputBlastAmount = CurrencyAmount.fromRawAmount(BLAST_WIHTOUT_TAX, '91')
          const [inputBlasterAmount] = pair.getInputAmount(outputBlastAmount, calculateFotFees)

          const expectedInputBlasterAmount = '0.000000093'
          expect(inputBlasterAmount.toExact()).toEqual(expectedInputBlasterAmount)
        })
      })
    })
  })
  describe('miscellaneous', () => {
    it('getLiquidityMinted:0', async () => {
      const tokenA = new Token(SEPOLIA_CHAIN_ID, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(SEPOLIA_CHAIN_ID, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, '0'), CurrencyAmount.fromRawAmount(tokenB, '0'))

      expect(() => {
        pair.getLiquidityMinted(
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '0'),
          CurrencyAmount.fromRawAmount(tokenA, '1000'),
          CurrencyAmount.fromRawAmount(tokenB, '1000')
        )
      }).toThrow(InsufficientInputAmountError)

      expect(() => {
        pair.getLiquidityMinted(
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '0'),
          CurrencyAmount.fromRawAmount(tokenA, '1000000'),
          CurrencyAmount.fromRawAmount(tokenB, '1')
        )
      }).toThrow(InsufficientInputAmountError)

      const liquidity = pair.getLiquidityMinted(
        CurrencyAmount.fromRawAmount(pair.liquidityToken, '0'),
        CurrencyAmount.fromRawAmount(tokenA, '1001'),
        CurrencyAmount.fromRawAmount(tokenB, '1001')
      )

      expect(liquidity.quotient.toString()).toEqual('1')
    })

    it('getLiquidityMinted:!0', async () => {
      const tokenA = new Token(SEPOLIA_CHAIN_ID, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(SEPOLIA_CHAIN_ID, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(
        CurrencyAmount.fromRawAmount(tokenA, '10000'),
        CurrencyAmount.fromRawAmount(tokenB, '10000')
      )

      expect(
        pair
          .getLiquidityMinted(
            CurrencyAmount.fromRawAmount(pair.liquidityToken, '10000'),
            CurrencyAmount.fromRawAmount(tokenA, '2000'),
            CurrencyAmount.fromRawAmount(tokenB, '2000')
          )
          .quotient.toString()
      ).toEqual('2000')
    })

    it('getLiquidityValue:!feeOn', async () => {
      const tokenA = new Token(SEPOLIA_CHAIN_ID, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(SEPOLIA_CHAIN_ID, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, '1000'), CurrencyAmount.fromRawAmount(tokenB, '1000'))

      {
        const liquidityValue = pair.getLiquidityValue(
          tokenA,
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          false
        )
        expect(liquidityValue.currency.equals(tokenA)).toBe(true)
        expect(liquidityValue.quotient.toString()).toBe('1000')
      }

      // 500
      {
        const liquidityValue = pair.getLiquidityValue(
          tokenA,
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '500'),
          false
        )
        expect(liquidityValue.currency.equals(tokenA)).toBe(true)
        expect(liquidityValue.quotient.toString()).toBe('500')
      }

      // tokenB
      {
        const liquidityValue = pair.getLiquidityValue(
          tokenB,
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          false
        )
        expect(liquidityValue.currency.equals(tokenB)).toBe(true)
        expect(liquidityValue.quotient.toString()).toBe('1000')
      }
    })

    it('getLiquidityValue:feeOn', async () => {
      const tokenA = new Token(SEPOLIA_CHAIN_ID, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(SEPOLIA_CHAIN_ID, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, '1000'), CurrencyAmount.fromRawAmount(tokenB, '1000'))

      const liquidityValue = pair.getLiquidityValue(
        tokenA,
        CurrencyAmount.fromRawAmount(pair.liquidityToken, '500'),
        CurrencyAmount.fromRawAmount(pair.liquidityToken, '500'),
        true,
        '250000' // 500 ** 2
      )
      expect(liquidityValue.currency.equals(tokenA)).toBe(true)
      expect(liquidityValue.quotient.toString()).toBe('917') // ceiling(1000 - (500 * (1 / 6)))
    })
  })
})
