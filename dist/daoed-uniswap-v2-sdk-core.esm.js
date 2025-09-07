import JSBI from 'jsbi';
import invariant from 'tiny-invariant';
import _Decimal from 'decimal.js-light';
import _Big from 'big.js';
import toFormat from 'toformat';
import { BigNumber } from '@ethersproject/bignumber';
import { getAddress, getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';

// Environment configuration
var ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  NETWORK: process.env.NETWORK || 'mainnet',
  FACTORY_ADDRESS: process.env.FACTORY_ADDRESS,
  ROUTER_ADDRESS: process.env.ROUTER_ADDRESS,
  CHAIN_ID: process.env.CHAIN_ID ? /*#__PURE__*/parseInt(process.env.CHAIN_ID) : 1
};

// Contract addresses for different networks
var FACTORY_ADDRESSES = {
  1: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  3: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  11155111: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' // Sepolia
};
var ROUTER_ADDRESSES = {
  1: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  3: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  11155111: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' // Sepolia
};
// Initialize addresses from environment variables if available
if (ENV.FACTORY_ADDRESS && ENV.CHAIN_ID) {
  FACTORY_ADDRESSES[ENV.CHAIN_ID] = ENV.FACTORY_ADDRESS;
}
if (ENV.ROUTER_ADDRESS && ENV.CHAIN_ID) {
  ROUTER_ADDRESSES[ENV.CHAIN_ID] = ENV.ROUTER_ADDRESS;
}
// Helper functions to set addresses dynamically
function setFactoryAddress(chainId, address) {
  FACTORY_ADDRESSES[chainId] = address;
}
function setRouterAddress(chainId, address) {
  ROUTER_ADDRESSES[chainId] = address;
}
function getFactoryAddress(chainId) {
  return FACTORY_ADDRESSES[chainId];
}
function getRouterAddress(chainId) {
  return ROUTER_ADDRESSES[chainId];
}

var TradeType;
(function (TradeType) {
  TradeType[TradeType["EXACT_INPUT"] = 0] = "EXACT_INPUT";
  TradeType[TradeType["EXACT_OUTPUT"] = 1] = "EXACT_OUTPUT";
})(TradeType || (TradeType = {}));
var Rounding;
(function (Rounding) {
  Rounding[Rounding["ROUND_DOWN"] = 0] = "ROUND_DOWN";
  Rounding[Rounding["ROUND_HALF_UP"] = 1] = "ROUND_HALF_UP";
  Rounding[Rounding["ROUND_UP"] = 2] = "ROUND_UP";
})(Rounding || (Rounding = {}));
var MaxUint256 = /*#__PURE__*/JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
var FACTORY_ADDRESS_MAP = FACTORY_ADDRESSES;
var INIT_CODE_HASH = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f';
var MINIMUM_LIQUIDITY = /*#__PURE__*/JSBI.BigInt(1000);
// exports for internal consumption
var ZERO = /*#__PURE__*/JSBI.BigInt(0);
var ONE = /*#__PURE__*/JSBI.BigInt(1);
var FIVE = /*#__PURE__*/JSBI.BigInt(5);
var _997 = /*#__PURE__*/JSBI.BigInt(997);
var _1000 = /*#__PURE__*/JSBI.BigInt(1000);
var BASIS_POINTS = /*#__PURE__*/JSBI.BigInt(10000);

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}
function _construct(t, e, r) {
  if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
  var o = [null];
  o.push.apply(o, e);
  var p = new (t.bind.apply(t, o))();
  return r && _setPrototypeOf(p, r.prototype), p;
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}
function _createForOfIteratorHelperLoose(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (t) return (t = t.call(r)).next.bind(t);
  if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
    t && (r = t);
    var o = 0;
    return function () {
      return o >= r.length ? {
        done: !0
      } : {
        done: !1,
        value: r[o++]
      };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, _getPrototypeOf(t);
}
function _inheritsLoose(t, o) {
  t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
}
function _isNativeFunction(t) {
  try {
    return -1 !== Function.toString.call(t).indexOf("[native code]");
  } catch (n) {
    return "function" == typeof t;
  }
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
  } catch (t) {}
  return (_isNativeReflectConstruct = function () {
    return !!t;
  })();
}
function _regenerator() {
  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
  var e,
    t,
    r = "function" == typeof Symbol ? Symbol : {},
    n = r.iterator || "@@iterator",
    o = r.toStringTag || "@@toStringTag";
  function i(r, n, o, i) {
    var c = n && n.prototype instanceof Generator ? n : Generator,
      u = Object.create(c.prototype);
    return _regeneratorDefine(u, "_invoke", function (r, n, o) {
      var i,
        c,
        u,
        f = 0,
        p = o || [],
        y = !1,
        G = {
          p: 0,
          n: 0,
          v: e,
          a: d,
          f: d.bind(e, 4),
          d: function (t, r) {
            return i = t, c = 0, u = e, G.n = r, a;
          }
        };
      function d(r, n) {
        for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
          var o,
            i = p[t],
            d = G.p,
            l = i[2];
          r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
        }
        if (o || r > 1) return a;
        throw y = !0, n;
      }
      return function (o, p, l) {
        if (f > 1) throw TypeError("Generator is already running");
        for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
          i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
          try {
            if (f = 2, i) {
              if (c || (o = "next"), t = i[o]) {
                if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                if (!t.done) return t;
                u = t.value, c < 2 && (c = 0);
              } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
              i = e;
            } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
          } catch (t) {
            i = e, c = 1, u = t;
          } finally {
            f = 1;
          }
        }
        return {
          value: t,
          done: y
        };
      };
    }(r, o, i), !0), u;
  }
  var a = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  t = Object.getPrototypeOf;
  var c = [][n] ? t(t([][n]())) : (_regeneratorDefine(t = {}, n, function () {
      return this;
    }), t),
    u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
  function f(e) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine(u), _regeneratorDefine(u, o, "Generator"), _regeneratorDefine(u, n, function () {
    return this;
  }), _regeneratorDefine(u, "toString", function () {
    return "[object Generator]";
  }), (_regenerator = function () {
    return {
      w: i,
      m: f
    };
  })();
}
function _regeneratorDefine(e, r, n, t) {
  var i = Object.defineProperty;
  try {
    i({}, "", {});
  } catch (e) {
    i = 0;
  }
  _regeneratorDefine = function (e, r, n, t) {
    function o(r, n) {
      _regeneratorDefine(e, r, function (e) {
        return this._invoke(r, n, e);
      });
    }
    r ? i ? i(e, r, {
      value: n,
      enumerable: !t,
      configurable: !t,
      writable: !t
    }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
  }, _regeneratorDefine(e, r, n, t);
}
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, _setPrototypeOf(t, e);
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _wrapNativeSuper(t) {
  var r = "function" == typeof Map ? new Map() : void 0;
  return _wrapNativeSuper = function (t) {
    if (null === t || !_isNativeFunction(t)) return t;
    if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function");
    if (void 0 !== r) {
      if (r.has(t)) return r.get(t);
      r.set(t, Wrapper);
    }
    function Wrapper() {
      return _construct(t, arguments, _getPrototypeOf(this).constructor);
    }
    return Wrapper.prototype = Object.create(t.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }), _setPrototypeOf(Wrapper, t);
  }, _wrapNativeSuper(t);
}

var _toSignificantRoundin, _toFixedRounding;
var Decimal = /*#__PURE__*/toFormat(_Decimal);
var Big = /*#__PURE__*/toFormat(_Big);
var toSignificantRounding = (_toSignificantRoundin = {}, _toSignificantRoundin[Rounding.ROUND_DOWN] = Decimal.ROUND_DOWN, _toSignificantRoundin[Rounding.ROUND_HALF_UP] = Decimal.ROUND_HALF_UP, _toSignificantRoundin[Rounding.ROUND_UP] = Decimal.ROUND_UP, _toSignificantRoundin);
var toFixedRounding = (_toFixedRounding = {}, _toFixedRounding[Rounding.ROUND_DOWN] = 0, _toFixedRounding[Rounding.ROUND_HALF_UP] = 1, _toFixedRounding[Rounding.ROUND_UP] = 3, _toFixedRounding);
var Fraction = /*#__PURE__*/function () {
  function Fraction(numerator, denominator) {
    if (denominator === void 0) {
      denominator = JSBI.BigInt(1);
    }
    this.numerator = JSBI.BigInt(numerator);
    this.denominator = JSBI.BigInt(denominator);
  }
  Fraction.tryParseFraction = function tryParseFraction(fractionish) {
    if (fractionish instanceof JSBI || typeof fractionish === 'number' || typeof fractionish === 'string') return new Fraction(fractionish);
    if ('numerator' in fractionish && 'denominator' in fractionish) return fractionish;
    throw new Error('Could not parse fraction');
  }
  // performs floor division
  ;
  var _proto = Fraction.prototype;
  _proto.invert = function invert() {
    return new Fraction(this.denominator, this.numerator);
  };
  _proto.add = function add(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.add(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(JSBI.add(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator)), JSBI.multiply(this.denominator, otherParsed.denominator));
  };
  _proto.subtract = function subtract(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.subtract(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(JSBI.subtract(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator)), JSBI.multiply(this.denominator, otherParsed.denominator));
  };
  _proto.lessThan = function lessThan(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return JSBI.lessThan(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };
  _proto.equalTo = function equalTo(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return JSBI.equal(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };
  _proto.greaterThan = function greaterThan(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return JSBI.greaterThan(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };
  _proto.multiply = function multiply(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(JSBI.multiply(this.numerator, otherParsed.numerator), JSBI.multiply(this.denominator, otherParsed.denominator));
  };
  _proto.divide = function divide(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(this.denominator, otherParsed.numerator));
  };
  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }
    if (rounding === void 0) {
      rounding = Rounding.ROUND_HALF_UP;
    }
    !Number.isInteger(significantDigits) ? process.env.NODE_ENV !== "production" ? invariant(false, significantDigits + " is not an integer.") : invariant(false) : void 0;
    !(significantDigits > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, significantDigits + " is not positive.") : invariant(false) : void 0;
    Decimal.set({
      precision: significantDigits + 1,
      rounding: toSignificantRounding[rounding]
    });
    var quotient = new Decimal(this.numerator.toString()).div(this.denominator.toString()).toSignificantDigits(significantDigits);
    return quotient.toFormat(quotient.decimalPlaces(), format);
  };
  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }
    if (rounding === void 0) {
      rounding = Rounding.ROUND_HALF_UP;
    }
    !Number.isInteger(decimalPlaces) ? process.env.NODE_ENV !== "production" ? invariant(false, decimalPlaces + " is not an integer.") : invariant(false) : void 0;
    !(decimalPlaces >= 0) ? process.env.NODE_ENV !== "production" ? invariant(false, decimalPlaces + " is negative.") : invariant(false) : void 0;
    Big.DP = decimalPlaces;
    Big.RM = toFixedRounding[rounding];
    return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(decimalPlaces, format);
  }
  /**
   * Helper method for converting any super class back to a fraction
   */;
  return _createClass(Fraction, [{
    key: "quotient",
    get: function get() {
      return JSBI.divide(this.numerator, this.denominator);
    }
    // remainder after floor division
  }, {
    key: "remainder",
    get: function get() {
      return new Fraction(JSBI.remainder(this.numerator, this.denominator), this.denominator);
    }
  }, {
    key: "asFraction",
    get: function get() {
      return new Fraction(this.numerator, this.denominator);
    }
  }]);
}();

var ONE_HUNDRED = /*#__PURE__*/new Fraction(/*#__PURE__*/JSBI.BigInt(100));
/**
 * Converts a fraction to a percent
 * @param fraction the fraction to convert
 */
function toPercent(fraction) {
  return new Percent(fraction.numerator, fraction.denominator);
}
var Percent = /*#__PURE__*/function (_Fraction) {
  function Percent() {
    var _this;
    _this = _Fraction.apply(this, arguments) || this;
    /**
     * This boolean prevents a fraction from being interpreted as a Percent
     */
    _this.isPercent = true;
    return _this;
  }
  _inheritsLoose(Percent, _Fraction);
  var _proto = Percent.prototype;
  _proto.add = function add(other) {
    return toPercent(_Fraction.prototype.add.call(this, other));
  };
  _proto.subtract = function subtract(other) {
    return toPercent(_Fraction.prototype.subtract.call(this, other));
  };
  _proto.multiply = function multiply(other) {
    return toPercent(_Fraction.prototype.multiply.call(this, other));
  };
  _proto.divide = function divide(other) {
    return toPercent(_Fraction.prototype.divide.call(this, other));
  };
  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 5;
    }
    return _Fraction.prototype.multiply.call(this, ONE_HUNDRED).toSignificant(significantDigits, format, rounding);
  };
  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = 2;
    }
    return _Fraction.prototype.multiply.call(this, ONE_HUNDRED).toFixed(decimalPlaces, format, rounding);
  };
  return Percent;
}(Fraction);
var ZERO_PERCENT = /*#__PURE__*/new Percent(ZERO);
var ONE_HUNDRED_PERCENT = /*#__PURE__*/new Percent(ONE);

var ChainId;
(function (ChainId) {
  ChainId[ChainId["MAINNET"] = 1] = "MAINNET";
  ChainId[ChainId["ROPSTEN"] = 3] = "ROPSTEN";
  ChainId[ChainId["SEPOLIA"] = 11155111] = "SEPOLIA";
  ChainId[ChainId["BASE"] = 8453] = "BASE";
})(ChainId || (ChainId = {}));
var SUPPORTED_CHAINS = [ChainId.MAINNET, ChainId.ROPSTEN, ChainId.SEPOLIA, ChainId.BASE];
var NativeCurrencyName;
(function (NativeCurrencyName) {
  // Strings match input for CLI
  NativeCurrencyName["ETHER"] = "ETH";
})(NativeCurrencyName || (NativeCurrencyName = {}));

var Big$1 = /*#__PURE__*/toFormat(_Big);
var CurrencyAmount = /*#__PURE__*/function (_Fraction) {
  function CurrencyAmount(currency, numerator, denominator) {
    var _this;
    _this = _Fraction.call(this, numerator, denominator) || this;
    !JSBI.lessThanOrEqual(_this.quotient, MaxUint256) ? process.env.NODE_ENV !== "production" ? invariant(false, 'AMOUNT') : invariant(false) : void 0;
    _this.currency = currency;
    _this.decimalScale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(currency.decimals));
    return _this;
  }
  /**
   * Returns a new currency amount instance from the unitless amount of token, i.e. the raw amount
   * @param currency the currency in the amount
   * @param rawAmount the raw token or ether amount
   */
  _inheritsLoose(CurrencyAmount, _Fraction);
  CurrencyAmount.fromRawAmount = function fromRawAmount(currency, rawAmount) {
    return new CurrencyAmount(currency, rawAmount);
  }
  /**
   * Construct a currency amount with a denominator that is not equal to 1
   * @param currency the currency
   * @param numerator the numerator of the fractional token amount
   * @param denominator the denominator of the fractional token amount
   */;
  CurrencyAmount.fromFractionalAmount = function fromFractionalAmount(currency, numerator, denominator) {
    return new CurrencyAmount(currency, numerator, denominator);
  };
  var _proto = CurrencyAmount.prototype;
  _proto.add = function add(other) {
    !this.currency.equals(other.currency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CURRENCY') : invariant(false) : void 0;
    var added = _Fraction.prototype.add.call(this, other);
    return CurrencyAmount.fromFractionalAmount(this.currency, added.numerator, added.denominator);
  };
  _proto.subtract = function subtract(other) {
    !this.currency.equals(other.currency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CURRENCY') : invariant(false) : void 0;
    var subtracted = _Fraction.prototype.subtract.call(this, other);
    return CurrencyAmount.fromFractionalAmount(this.currency, subtracted.numerator, subtracted.denominator);
  };
  _proto.multiply = function multiply(other) {
    var multiplied = _Fraction.prototype.multiply.call(this, other);
    return CurrencyAmount.fromFractionalAmount(this.currency, multiplied.numerator, multiplied.denominator);
  };
  _proto.divide = function divide(other) {
    var divided = _Fraction.prototype.divide.call(this, other);
    return CurrencyAmount.fromFractionalAmount(this.currency, divided.numerator, divided.denominator);
  };
  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 6;
    }
    if (rounding === void 0) {
      rounding = Rounding.ROUND_DOWN;
    }
    return _Fraction.prototype.divide.call(this, this.decimalScale).toSignificant(significantDigits, format, rounding);
  };
  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = this.currency.decimals;
    }
    if (rounding === void 0) {
      rounding = Rounding.ROUND_DOWN;
    }
    !(decimalPlaces <= this.currency.decimals) ? process.env.NODE_ENV !== "production" ? invariant(false, 'DECIMALS') : invariant(false) : void 0;
    return _Fraction.prototype.divide.call(this, this.decimalScale).toFixed(decimalPlaces, format, rounding);
  };
  _proto.toExact = function toExact(format) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }
    Big$1.DP = this.currency.decimals;
    return new Big$1(this.quotient.toString()).div(this.decimalScale.toString()).toFormat(format);
  };
  return _createClass(CurrencyAmount, [{
    key: "wrapped",
    get: function get() {
      if (this.currency.isToken) return this;
      return CurrencyAmount.fromFractionalAmount(this.currency.wrapped, this.numerator, this.denominator);
    }
  }]);
}(Fraction);

var Price = /*#__PURE__*/function (_Fraction) {
  /**
   * Construct a price, either with the base and quote currency amount, or the
   * @param args
   */
  function Price() {
    var _this;
    var baseCurrency, quoteCurrency, denominator, numerator;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length === 4) {
      baseCurrency = args[0];
      quoteCurrency = args[1];
      denominator = args[2];
      numerator = args[3];
    } else {
      var result = args[0].quoteAmount.divide(args[0].baseAmount);
      var _ref = [args[0].baseAmount.currency, args[0].quoteAmount.currency, result.denominator, result.numerator];
      baseCurrency = _ref[0];
      quoteCurrency = _ref[1];
      denominator = _ref[2];
      numerator = _ref[3];
    }
    _this = _Fraction.call(this, numerator, denominator) || this;
    _this.baseCurrency = baseCurrency;
    _this.quoteCurrency = quoteCurrency;
    _this.scalar = new Fraction(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(baseCurrency.decimals)), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(quoteCurrency.decimals)));
    return _this;
  }
  /**
   * Flip the price, switching the base and quote currency
   */
  _inheritsLoose(Price, _Fraction);
  var _proto = Price.prototype;
  _proto.invert = function invert() {
    return new Price(this.quoteCurrency, this.baseCurrency, this.numerator, this.denominator);
  }
  /**
   * Multiply the price by another price, returning a new price. The other price must have the same base currency as this price's quote currency
   * @param other the other price
   */;
  _proto.multiply = function multiply(other) {
    !this.quoteCurrency.equals(other.baseCurrency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    var fraction = _Fraction.prototype.multiply.call(this, other);
    return new Price(this.baseCurrency, other.quoteCurrency, fraction.denominator, fraction.numerator);
  }
  /**
   * Return the amount of quote currency corresponding to a given amount of the base currency
   * @param currencyAmount the amount of base currency to quote against the price
   */;
  _proto.quote = function quote(currencyAmount) {
    !currencyAmount.currency.equals(this.baseCurrency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    var result = _Fraction.prototype.multiply.call(this, currencyAmount);
    return CurrencyAmount.fromFractionalAmount(this.quoteCurrency, result.numerator, result.denominator);
  }
  /**
   * Get the value scaled by decimals for formatting
   * @private
   */;
  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 6;
    }
    return this.adjustedForDecimals.toSignificant(significantDigits, format, rounding);
  };
  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = 4;
    }
    return this.adjustedForDecimals.toFixed(decimalPlaces, format, rounding);
  };
  return _createClass(Price, [{
    key: "adjustedForDecimals",
    get: function get() {
      return _Fraction.prototype.multiply.call(this, this.scalar);
    }
  }]);
}(Fraction);

/**
 * A currency is any fungible financial instrument, including Ether, all ERC20 tokens, and other chain-native currencies
 */
var BaseCurrency =
/**
 * Constructs an instance of the base class `BaseCurrency`.
 * @param chainId the chain ID on which this currency resides
 * @param decimals decimals of the currency
 * @param symbol symbol of the currency
 * @param name of the currency
 */
function BaseCurrency(chainId, decimals, symbol, name) {
  !Number.isSafeInteger(chainId) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CHAIN_ID') : invariant(false) : void 0;
  !(decimals >= 0 && decimals < 255 && Number.isInteger(decimals)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'DECIMALS') : invariant(false) : void 0;
  this.chainId = chainId;
  this.decimals = decimals;
  this.symbol = symbol;
  this.name = name;
};

/**
 * Represents the native currency of the chain on which it resides, e.g.
 */
var NativeCurrency = /*#__PURE__*/function (_BaseCurrency) {
  function NativeCurrency() {
    var _this;
    _this = _BaseCurrency.apply(this, arguments) || this;
    _this.isNative = true;
    _this.isToken = false;
    return _this;
  }
  _inheritsLoose(NativeCurrency, _BaseCurrency);
  return NativeCurrency;
}(BaseCurrency);

/**
 * Validates an address and returns the parsed (checksummed) version of that address
 * @param address the unchecksummed hex address
 */
function validateAndParseAddress(address) {
  try {
    return getAddress(address);
  } catch (error) {
    throw new Error(address + " is not a valid address.");
  }
}
// Checks a string starts with 0x, is 42 characters long and contains only hex characters after 0x
var startsWith0xLen42HexRegex = /^0x[0-9a-fA-F]{40}$/;
/**
 * Checks if an address is valid by checking 0x prefix, length === 42 and hex encoding.
 * @param address the unchecksummed hex address
 */
function checkValidAddress(address) {
  if (startsWith0xLen42HexRegex.test(address)) {
    return address;
  }
  throw new Error(address + " is not a valid address.");
}

/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
var Token = /*#__PURE__*/function (_BaseCurrency) {
  /**
   *
   * @param chainId {@link BaseCurrency#chainId}
   * @param address The contract address on the chain on which this token lives
   * @param decimals {@link BaseCurrency#decimals}
   * @param symbol {@link BaseCurrency#symbol}
   * @param name {@link BaseCurrency#name}
   * @param bypassChecksum If true it only checks for length === 42, startsWith 0x and contains only hex characters
   * @param buyFeeBps Buy fee tax for FOT tokens, in basis points
   * @param sellFeeBps Sell fee tax for FOT tokens, in basis points
   */
  function Token(chainId, address, decimals, symbol, name, bypassChecksum, buyFeeBps, sellFeeBps) {
    var _this;
    _this = _BaseCurrency.call(this, chainId, decimals, symbol, name) || this;
    _this.isNative = false;
    _this.isToken = true;
    if (bypassChecksum) {
      _this.address = checkValidAddress(address);
    } else {
      _this.address = validateAndParseAddress(address);
    }
    if (buyFeeBps) {
      !buyFeeBps.gte(BigNumber.from(0)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'NON-NEGATIVE FOT FEES') : invariant(false) : void 0;
    }
    if (sellFeeBps) {
      !sellFeeBps.gte(BigNumber.from(0)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'NON-NEGATIVE FOT FEES') : invariant(false) : void 0;
    }
    _this.buyFeeBps = buyFeeBps;
    _this.sellFeeBps = sellFeeBps;
    return _this;
  }
  /**
   * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
   * @param other other token to compare
   */
  _inheritsLoose(Token, _BaseCurrency);
  var _proto = Token.prototype;
  _proto.equals = function equals(other) {
    return other.isToken && this.chainId === other.chainId && this.address.toLowerCase() === other.address.toLowerCase();
  }
  /**
   * Returns true if the address of this token sorts before the address of the other token
   * @param other other token to compare
   * @throws if the tokens have the same address
   * @throws if the tokens are on different chains
   */;
  _proto.sortsBefore = function sortsBefore(other) {
    !(this.chainId === other.chainId) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CHAIN_IDS') : invariant(false) : void 0;
    !(this.address.toLowerCase() !== other.address.toLowerCase()) ? process.env.NODE_ENV !== "production" ? invariant(false, 'ADDRESSES') : invariant(false) : void 0;
    return this.address.toLowerCase() < other.address.toLowerCase();
  }
  /**
   * Return this token, which does not need to be wrapped
   */;
  return _createClass(Token, [{
    key: "wrapped",
    get: function get() {
      return this;
    }
  }]);
}(BaseCurrency);

var _WETH;
/**
 * Known WETH9 implementation addresses, used in our implementation of Ether#wrapped
 */
var WETH9 = (_WETH = {}, _WETH[ChainId.MAINNET] = /*#__PURE__*/new Token(ChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'), _WETH[ChainId.ROPSTEN] = /*#__PURE__*/new Token(ChainId.ROPSTEN, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'), _WETH[ChainId.SEPOLIA] = /*#__PURE__*/new Token(ChainId.SEPOLIA, '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', 18, 'WETH', 'Wrapped Ether'), _WETH[ChainId.BASE] = /*#__PURE__*/new Token(ChainId.BASE, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'), _WETH);

/**
 * Ether is the main usage of a 'native' currency, i.e. for Ethereum mainnet and all testnets
 */
var Ether = /*#__PURE__*/function (_NativeCurrency) {
  function Ether(chainId) {
    return _NativeCurrency.call(this, chainId, 18, 'ETH', 'Ether') || this;
  }
  _inheritsLoose(Ether, _NativeCurrency);
  Ether.onChain = function onChain(chainId) {
    var _this$_etherCache$cha;
    return (_this$_etherCache$cha = this._etherCache[chainId]) != null ? _this$_etherCache$cha : this._etherCache[chainId] = new Ether(chainId);
  };
  var _proto = Ether.prototype;
  _proto.equals = function equals(other) {
    return other.isNative && other.chainId === this.chainId;
  };
  return _createClass(Ether, [{
    key: "wrapped",
    get: function get() {
      var weth9 = WETH9[this.chainId];
      !!!weth9 ? process.env.NODE_ENV !== "production" ? invariant(false, 'WRAPPED') : invariant(false) : void 0;
      return weth9;
    }
  }]);
}(NativeCurrency);
Ether._etherCache = {};

var MAX_SAFE_INTEGER = /*#__PURE__*/JSBI.BigInt(Number.MAX_SAFE_INTEGER);
var ZERO$1 = /*#__PURE__*/JSBI.BigInt(0);
var ONE$1 = /*#__PURE__*/JSBI.BigInt(1);
var TWO = /*#__PURE__*/JSBI.BigInt(2);
/**
 * Computes floor(sqrt(value))
 * @param value the value for which to compute the square root, rounded down
 */
function sqrt(value) {
  !JSBI.greaterThanOrEqual(value, ZERO$1) ? process.env.NODE_ENV !== "production" ? invariant(false, 'NEGATIVE') : invariant(false) : void 0;
  // rely on built in sqrt if possible
  if (JSBI.lessThan(value, MAX_SAFE_INTEGER)) {
    return JSBI.BigInt(Math.floor(Math.sqrt(JSBI.toNumber(value))));
  }
  var z;
  var x;
  z = value;
  x = JSBI.add(JSBI.divide(value, TWO), ONE$1);
  while (JSBI.lessThan(x, z)) {
    z = x;
    x = JSBI.divide(JSBI.add(JSBI.divide(value, x), x), TWO);
  }
  return z;
}

// see https://stackoverflow.com/a/41102306
var CAN_SET_PROTOTYPE = 'setPrototypeOf' in Object;
/**
 * Indicates that the pair has insufficient reserves for a desired output amount. I.e. the amount of output cannot be
 * obtained by sending any amount of input.
 */
var InsufficientReservesError = /*#__PURE__*/function (_Error) {
  function InsufficientReservesError() {
    var _this;
    _this = _Error.call(this) || this;
    _this.isInsufficientReservesError = true;
    _this.name = _this.constructor.name;
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(_this, (this instanceof InsufficientReservesError ? this.constructor : void 0).prototype);
    return _this;
  }
  _inheritsLoose(InsufficientReservesError, _Error);
  return InsufficientReservesError;
}(/*#__PURE__*/_wrapNativeSuper(Error));
/**
 * Indicates that the input amount is too small to produce any amount of output. I.e. the amount of input sent is less
 * than the price of a single unit of output after fees.
 */
var InsufficientInputAmountError = /*#__PURE__*/function (_Error2) {
  function InsufficientInputAmountError() {
    var _this2;
    _this2 = _Error2.call(this) || this;
    _this2.isInsufficientInputAmountError = true;
    _this2.name = _this2.constructor.name;
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(_this2, (this instanceof InsufficientInputAmountError ? this.constructor : void 0).prototype);
    return _this2;
  }
  _inheritsLoose(InsufficientInputAmountError, _Error2);
  return InsufficientInputAmountError;
}(/*#__PURE__*/_wrapNativeSuper(Error));

var computePairAddress = function computePairAddress(_ref) {
  var factoryAddress = _ref.factoryAddress,
    tokenA = _ref.tokenA,
    tokenB = _ref.tokenB;
  var _ref2 = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA],
    token0 = _ref2[0],
    token1 = _ref2[1]; // does safety checks
  return getCreate2Address(factoryAddress, keccak256(['bytes'], [pack(['address', 'address'], [token0.address, token1.address])]), INIT_CODE_HASH);
};
var Pair = /*#__PURE__*/function () {
  function Pair(currencyAmountA, tokenAmountB) {
    var tokenAmounts = currencyAmountA.currency.sortsBefore(tokenAmountB.currency) // does safety checks
    ? [currencyAmountA, tokenAmountB] : [tokenAmountB, currencyAmountA];
    this.liquidityToken = new Token(tokenAmounts[0].currency.chainId, Pair.getAddress(tokenAmounts[0].currency, tokenAmounts[1].currency), 18, 'UNI-V2', 'Uniswap V2');
    this.tokenAmounts = tokenAmounts;
  }
  Pair.getAddress = function getAddress(tokenA, tokenB) {
    var factoryAddress = FACTORY_ADDRESS_MAP[tokenA.chainId];
    !factoryAddress ? process.env.NODE_ENV !== "production" ? invariant(false, 'FACTORY_ADDRESS') : invariant(false) : void 0;
    return computePairAddress({
      factoryAddress: factoryAddress,
      tokenA: tokenA,
      tokenB: tokenB
    });
  }
  /**
   * Returns true if the token is either token0 or token1
   * @param token to check
   */;
  var _proto = Pair.prototype;
  _proto.involvesToken = function involvesToken(token) {
    return token.equals(this.token0) || token.equals(this.token1);
  }
  /**
   * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
   */;
  /**
   * Return the price of the given token in terms of the other token in the pair.
   * @param token token to return price of
   */
  _proto.priceOf = function priceOf(token) {
    !this.involvesToken(token) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    return token.equals(this.token0) ? this.token0Price : this.token1Price;
  }
  /**
   * Returns the chain ID of the tokens in the pair.
   */;
  _proto.reserveOf = function reserveOf(token) {
    !this.involvesToken(token) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    return token.equals(this.token0) ? this.reserve0 : this.reserve1;
  }
  /**
   * getAmountOut is the linear algebra of reserve ratio against amountIn:amountOut.
   * https://ethereum.stackexchange.com/questions/101629/what-is-math-for-uniswap-calculates-the-amountout-and-amountin-why-997-and-1000
   * has the math deduction for the reserve calculation without fee-on-transfer fees.
   *
   * With fee-on-transfer tax, intuitively it's just:
   * inputAmountWithFeeAndTax = 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn
   *                          = (1 - amountIn.sellFeesBips / 10000) * amountInWithFee
   * where amountInWithFee is the amountIn after taking out the LP fees
   * outputAmountWithTax = amountOut * (1 - amountOut.buyFeesBips / 10000)
   *
   * But we are illustrating the math deduction below to ensure that's the case.
   *
   * before swap A * B = K where A = reserveIn B = reserveOut
   *
   * after swap A' * B' = K where only k is a constant value
   *
   * getAmountOut
   *
   * A' = A + 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn # here 0.3% is deducted
   * B' = B - amountOut * (1 - amountOut.buyFeesBips / 10000)
   * amountOut = (B - B') / (1 - amountOut.buyFeesBips / 10000) # where A' * B' still is k
   *           = (B - K/(A + 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn))
   *             /
   *             (1 - amountOut.buyFeesBips / 10000)
   *           = (B - AB/(A + 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn))
   *             /
   *             (1 - amountOut.buyFeesBips / 10000)
   *           = ((BA + B * 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn - AB)/(A + 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn))
   *             /
   *             (1 - amountOut.buyFeesBips / 10000)
   *           = (B * 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn / (A + 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn)
   *             /
   *             (1 - amountOut.buyFeesBips / 10000)
   * amountOut * (1 - amountOut.buyFeesBips / 10000) = (B * 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn
   *                                                    /
   *                                                    (A + 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn)
   *
   * outputAmountWithTax = (B * 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn
   *                       /
   *                       (A + 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn)
   *                       = (B * 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn * 1000
   *                       /
   *                       ((A + 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn) * 1000)
   *                     = (B * (1 - amountIn.sellFeesBips / 10000) 997 * * amountIn
   *                       /
   *                       (1000 * A + (1 - amountIn.sellFeesBips / 10000) * 997 * amountIn)
   *                     = (B * (1 - amountIn.sellFeesBips / 10000) * inputAmountWithFee)
   *                       /
   *                       (1000 * A + (1 - amountIn.sellFeesBips / 10000) * inputAmountWithFee)
   *                     = (B * inputAmountWithFeeAndTax)
   *                       /
   *                       (1000 * A + inputAmountWithFeeAndTax)
   *
   * inputAmountWithFeeAndTax = (1 - amountIn.sellFeesBips / 10000) * inputAmountWithFee
   * outputAmountWithTax = amountOut * (1 - amountOut.buyFeesBips / 10000)
   *
   * @param inputAmount
   * @param calculateFotFees
   */;
  _proto.getOutputAmount = function getOutputAmount(inputAmount, calculateFotFees) {
    if (calculateFotFees === void 0) {
      calculateFotFees = true;
    }
    !this.involvesToken(inputAmount.currency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    if (JSBI.equal(this.reserve0.quotient, ZERO) || JSBI.equal(this.reserve1.quotient, ZERO)) {
      throw new InsufficientReservesError();
    }
    var inputReserve = this.reserveOf(inputAmount.currency);
    var outputReserve = this.reserveOf(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    var percentAfterSellFees = calculateFotFees ? this.derivePercentAfterSellFees(inputAmount) : ZERO_PERCENT;
    var inputAmountAfterTax = percentAfterSellFees.greaterThan(ZERO_PERCENT) ? CurrencyAmount.fromRawAmount(inputAmount.currency, percentAfterSellFees.multiply(inputAmount).quotient // fraction.quotient will round down by itself, which is desired
    ) : inputAmount;
    var inputAmountWithFeeAndAfterTax = JSBI.multiply(inputAmountAfterTax.quotient, _997);
    var numerator = JSBI.multiply(inputAmountWithFeeAndAfterTax, outputReserve.quotient);
    var denominator = JSBI.add(JSBI.multiply(inputReserve.quotient, _1000), inputAmountWithFeeAndAfterTax);
    var outputAmount = CurrencyAmount.fromRawAmount(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0, JSBI.divide(numerator, denominator) // JSBI.divide will round down by itself, which is desired
    );
    if (JSBI.equal(outputAmount.quotient, ZERO)) {
      throw new InsufficientInputAmountError();
    }
    var percentAfterBuyFees = calculateFotFees ? this.derivePercentAfterBuyFees(outputAmount) : ZERO_PERCENT;
    var outputAmountAfterTax = percentAfterBuyFees.greaterThan(ZERO_PERCENT) ? CurrencyAmount.fromRawAmount(outputAmount.currency, outputAmount.multiply(percentAfterBuyFees).quotient // fraction.quotient will round down by itself, which is desired
    ) : outputAmount;
    if (JSBI.equal(outputAmountAfterTax.quotient, ZERO)) {
      throw new InsufficientInputAmountError();
    }
    return [outputAmountAfterTax, new Pair(inputReserve.add(inputAmountAfterTax), outputReserve.subtract(outputAmountAfterTax))];
  }
  /**
   * getAmountIn is the linear algebra of reserve ratio against amountIn:amountOut.
   * https://ethereum.stackexchange.com/questions/101629/what-is-math-for-uniswap-calculates-the-amountout-and-amountin-why-997-and-1000
   * has the math deduction for the reserve calculation without fee-on-transfer fees.
   *
   * With fee-on-transfer fees, intuitively it's just:
   * outputAmountWithTax = amountOut / (1 - amountOut.buyFeesBips / 10000)
   * inputAmountWithTax = amountIn / (1 - amountIn.sellFeesBips / 10000) / 0.997
   *
   * But we are illustrating the math deduction below to ensure that's the case.
   *
   * before swap A * B = K where A = reserveIn B = reserveOut
   *
   * after swap A' * B' = K where only k is a constant value
   *
   * getAmountIn
   *
   * B' = B - amountOut * (1 - amountOut.buyFeesBips / 10000)
   * A' = A + 0.997 * (1 - amountIn.sellFeesBips / 10000) * amountIn # here 0.3% is deducted
   * amountIn = (A' - A) / (0.997 * (1 - amountIn.sellFeesBips / 10000))
   *          = (K / (B - amountOut / (1 - amountOut.buyFeesBips / 10000)) - A)
   *            /
   *            (0.997 * (1 - amountIn.sellFeesBips / 10000))
   *          = (AB / (B - amountOut / (1 - amountOut.buyFeesBips / 10000)) - A)
   *            /
   *            (0.997 * (1 - amountIn.sellFeesBips / 10000))
   *          = ((AB - AB + A * amountOut / (1 - amountOut.buyFeesBips / 10000)) / (B - amountOut / (1 - amountOut.buyFeesBips / 10000)))
   *            /
   *            (0.997 * (1 - amountIn.sellFeesBips / 10000))
   *          = ((A * amountOut / (1 - amountOut.buyFeesBips / 10000)) / (B - amountOut / (1 - amountOut.buyFeesBips / 10000)))
   *            /
   *            (0.997 * (1 - amountIn.sellFeesBips / 10000))
   *          = ((A * 1000 * amountOut / (1 - amountOut.buyFeesBips / 10000)) / (B - amountOut / (1 - amountOut.buyFeesBips / 10000)))
   *            /
   *            (997 * (1 - amountIn.sellFeesBips / 10000))
   *
   * outputAmountWithTax = amountOut / (1 - amountOut.buyFeesBips / 10000)
   * inputAmountWithTax = amountIn / (997 * (1 - amountIn.sellFeesBips / 10000))
   *                    = (A * outputAmountWithTax * 1000) / ((B - outputAmountWithTax) * 997)
   *
   * @param outputAmount
   */;
  _proto.getInputAmount = function getInputAmount(outputAmount, calculateFotFees) {
    if (calculateFotFees === void 0) {
      calculateFotFees = true;
    }
    !this.involvesToken(outputAmount.currency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    var percentAfterBuyFees = calculateFotFees ? this.derivePercentAfterBuyFees(outputAmount) : ZERO_PERCENT;
    var outputAmountBeforeTax = percentAfterBuyFees.greaterThan(ZERO_PERCENT) ? CurrencyAmount.fromRawAmount(outputAmount.currency, JSBI.add(outputAmount.divide(percentAfterBuyFees).quotient, ONE) // add 1 for rounding up
    ) : outputAmount;
    if (JSBI.equal(this.reserve0.quotient, ZERO) || JSBI.equal(this.reserve1.quotient, ZERO) || JSBI.greaterThanOrEqual(outputAmount.quotient, this.reserveOf(outputAmount.currency).quotient) || JSBI.greaterThanOrEqual(outputAmountBeforeTax.quotient, this.reserveOf(outputAmount.currency).quotient)) {
      throw new InsufficientReservesError();
    }
    var outputReserve = this.reserveOf(outputAmount.currency);
    var inputReserve = this.reserveOf(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    var numerator = JSBI.multiply(JSBI.multiply(inputReserve.quotient, outputAmountBeforeTax.quotient), _1000);
    var denominator = JSBI.multiply(JSBI.subtract(outputReserve.quotient, outputAmountBeforeTax.quotient), _997);
    var inputAmount = CurrencyAmount.fromRawAmount(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0, JSBI.add(JSBI.divide(numerator, denominator), ONE) // add 1 here is part of the formula, no rounding needed here, since there will not be decimal at this point
    );
    var percentAfterSellFees = calculateFotFees ? this.derivePercentAfterSellFees(inputAmount) : ZERO_PERCENT;
    var inputAmountBeforeTax = percentAfterSellFees.greaterThan(ZERO_PERCENT) ? CurrencyAmount.fromRawAmount(inputAmount.currency, JSBI.add(inputAmount.divide(percentAfterSellFees).quotient, ONE) // add 1 for rounding up
    ) : inputAmount;
    return [inputAmountBeforeTax, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
  };
  _proto.getLiquidityMinted = function getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB) {
    !totalSupply.currency.equals(this.liquidityToken) ? process.env.NODE_ENV !== "production" ? invariant(false, 'LIQUIDITY') : invariant(false) : void 0;
    var tokenAmounts = tokenAmountA.currency.sortsBefore(tokenAmountB.currency) // does safety checks
    ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    !(tokenAmounts[0].currency.equals(this.token0) && tokenAmounts[1].currency.equals(this.token1)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    var liquidity;
    if (JSBI.equal(totalSupply.quotient, ZERO)) {
      liquidity = JSBI.subtract(sqrt(JSBI.multiply(tokenAmounts[0].quotient, tokenAmounts[1].quotient)), MINIMUM_LIQUIDITY);
    } else {
      var amount0 = JSBI.divide(JSBI.multiply(tokenAmounts[0].quotient, totalSupply.quotient), this.reserve0.quotient);
      var amount1 = JSBI.divide(JSBI.multiply(tokenAmounts[1].quotient, totalSupply.quotient), this.reserve1.quotient);
      liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1;
    }
    if (!JSBI.greaterThan(liquidity, ZERO)) {
      throw new InsufficientInputAmountError();
    }
    return CurrencyAmount.fromRawAmount(this.liquidityToken, liquidity);
  };
  _proto.getLiquidityValue = function getLiquidityValue(token, totalSupply, liquidity, feeOn, kLast) {
    if (feeOn === void 0) {
      feeOn = false;
    }
    !this.involvesToken(token) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    !totalSupply.currency.equals(this.liquidityToken) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOTAL_SUPPLY') : invariant(false) : void 0;
    !liquidity.currency.equals(this.liquidityToken) ? process.env.NODE_ENV !== "production" ? invariant(false, 'LIQUIDITY') : invariant(false) : void 0;
    !JSBI.lessThanOrEqual(liquidity.quotient, totalSupply.quotient) ? process.env.NODE_ENV !== "production" ? invariant(false, 'LIQUIDITY') : invariant(false) : void 0;
    var totalSupplyAdjusted;
    if (!feeOn) {
      totalSupplyAdjusted = totalSupply;
    } else {
      !!!kLast ? process.env.NODE_ENV !== "production" ? invariant(false, 'K_LAST') : invariant(false) : void 0;
      var kLastParsed = JSBI.BigInt(kLast);
      if (!JSBI.equal(kLastParsed, ZERO)) {
        var rootK = sqrt(JSBI.multiply(this.reserve0.quotient, this.reserve1.quotient));
        var rootKLast = sqrt(kLastParsed);
        if (JSBI.greaterThan(rootK, rootKLast)) {
          var numerator = JSBI.multiply(totalSupply.quotient, JSBI.subtract(rootK, rootKLast));
          var denominator = JSBI.add(JSBI.multiply(rootK, FIVE), rootKLast);
          var feeLiquidity = JSBI.divide(numerator, denominator);
          totalSupplyAdjusted = totalSupply.add(CurrencyAmount.fromRawAmount(this.liquidityToken, feeLiquidity));
        } else {
          totalSupplyAdjusted = totalSupply;
        }
      } else {
        totalSupplyAdjusted = totalSupply;
      }
    }
    return CurrencyAmount.fromRawAmount(token, JSBI.divide(JSBI.multiply(liquidity.quotient, this.reserveOf(token).quotient), totalSupplyAdjusted.quotient));
  };
  _proto.derivePercentAfterSellFees = function derivePercentAfterSellFees(inputAmount) {
    var sellFeeBips = this.token0.wrapped.equals(inputAmount.wrapped.currency) ? this.token0.wrapped.sellFeeBps : this.token1.wrapped.sellFeeBps;
    if (sellFeeBips != null && sellFeeBips.gt(BigNumber.from(0))) {
      return ONE_HUNDRED_PERCENT.subtract(new Percent(JSBI.BigInt(sellFeeBips)).divide(BASIS_POINTS));
    } else {
      return ZERO_PERCENT;
    }
  };
  _proto.derivePercentAfterBuyFees = function derivePercentAfterBuyFees(outputAmount) {
    var buyFeeBps = this.token0.wrapped.equals(outputAmount.wrapped.currency) ? this.token0.wrapped.buyFeeBps : this.token1.wrapped.buyFeeBps;
    if (buyFeeBps != null && buyFeeBps.gt(BigNumber.from(0))) {
      return ONE_HUNDRED_PERCENT.subtract(new Percent(JSBI.BigInt(buyFeeBps)).divide(BASIS_POINTS));
    } else {
      return ZERO_PERCENT;
    }
  };
  return _createClass(Pair, [{
    key: "token0Price",
    get: function get() {
      var result = this.tokenAmounts[1].divide(this.tokenAmounts[0]);
      return new Price(this.token0, this.token1, result.denominator, result.numerator);
    }
    /**
     * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
     */
  }, {
    key: "token1Price",
    get: function get() {
      var result = this.tokenAmounts[0].divide(this.tokenAmounts[1]);
      return new Price(this.token1, this.token0, result.denominator, result.numerator);
    }
  }, {
    key: "chainId",
    get: function get() {
      return this.token0.chainId;
    }
  }, {
    key: "token0",
    get: function get() {
      return this.tokenAmounts[0].currency;
    }
  }, {
    key: "token1",
    get: function get() {
      return this.tokenAmounts[1].currency;
    }
  }, {
    key: "reserve0",
    get: function get() {
      return this.tokenAmounts[0];
    }
  }, {
    key: "reserve1",
    get: function get() {
      return this.tokenAmounts[1];
    }
  }]);
}();

var Route = /*#__PURE__*/function () {
  function Route(pairs, input, output) {
    this._midPrice = null;
    !(pairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'PAIRS') : invariant(false) : void 0;
    var chainId = pairs[0].chainId;
    !pairs.every(function (pair) {
      return pair.chainId === chainId;
    }) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CHAIN_IDS') : invariant(false) : void 0;
    var wrappedInput = input.wrapped;
    !pairs[0].involvesToken(wrappedInput) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INPUT') : invariant(false) : void 0;
    !(typeof output === 'undefined' || pairs[pairs.length - 1].involvesToken(output.wrapped)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'OUTPUT') : invariant(false) : void 0;
    var path = [wrappedInput];
    for (var _iterator = _createForOfIteratorHelperLoose(pairs.entries()), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
        i = _step$value[0],
        pair = _step$value[1];
      var currentInput = path[i];
      !(currentInput.equals(pair.token0) || currentInput.equals(pair.token1)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'PATH') : invariant(false) : void 0;
      var _output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0;
      path.push(_output);
    }
    this.pairs = pairs;
    this.path = path;
    this.input = input;
    this.output = output;
  }
  return _createClass(Route, [{
    key: "midPrice",
    get: function get() {
      if (this._midPrice !== null) return this._midPrice;
      var prices = [];
      for (var _iterator2 = _createForOfIteratorHelperLoose(this.pairs.entries()), _step2; !(_step2 = _iterator2()).done;) {
        var _step2$value = _step2.value,
          i = _step2$value[0],
          pair = _step2$value[1];
        prices.push(this.path[i].equals(pair.token0) ? new Price(pair.reserve0.currency, pair.reserve1.currency, pair.reserve0.quotient, pair.reserve1.quotient) : new Price(pair.reserve1.currency, pair.reserve0.currency, pair.reserve1.quotient, pair.reserve0.quotient));
      }
      var reduced = prices.slice(1).reduce(function (accumulator, currentValue) {
        return accumulator.multiply(currentValue);
      }, prices[0]);
      return this._midPrice = new Price(this.input, this.output, reduced.denominator, reduced.numerator);
    }
  }, {
    key: "chainId",
    get: function get() {
      return this.pairs[0].chainId;
    }
  }]);
}();

/**
 * Returns the percent difference between the mid price and the execution price, i.e. price impact.
 * @param midPrice mid price before the trade
 * @param inputAmount the input amount of the trade
 * @param outputAmount the output amount of the trade
 */
function computePriceImpact(midPrice, inputAmount, outputAmount) {
  var quotedOutputAmount = midPrice.quote(inputAmount);
  // calculate price impact := (exactQuote - outputAmount) / exactQuote
  var priceImpact = quotedOutputAmount.subtract(outputAmount).divide(quotedOutputAmount);
  return new Percent(priceImpact.numerator, priceImpact.denominator);
}

// given an array of items sorted by `comparator`, insert an item into its sort index and constrain the size to
// `maxSize` by removing the last item
function sortedInsert(items, add, maxSize, comparator) {
  !(maxSize > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MAX_SIZE_ZERO') : invariant(false) : void 0;
  // this is an invariant because the interface cannot return multiple removed items if items.length exceeds maxSize
  !(items.length <= maxSize) ? process.env.NODE_ENV !== "production" ? invariant(false, 'ITEMS_SIZE') : invariant(false) : void 0;
  // short circuit first item add
  if (items.length === 0) {
    items.push(add);
    return null;
  } else {
    var isFull = items.length === maxSize;
    // short circuit if full and the additional item does not come before the last item
    if (isFull && comparator(items[items.length - 1], add) <= 0) {
      return add;
    }
    var lo = 0,
      hi = items.length;
    while (lo < hi) {
      var mid = lo + hi >>> 1;
      if (comparator(items[mid], add) <= 0) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    items.splice(lo, 0, add);
    return isFull ? items.pop() : null;
  }
}

// comparator function that allows sorting trades by their output amounts, in decreasing order, and then input amounts
// in increasing order. i.e. the best trades have the most outputs for the least inputs and are sorted first
function inputOutputComparator(a, b) {
  // must have same input and output token for comparison
  !a.inputAmount.currency.equals(b.inputAmount.currency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INPUT_CURRENCY') : invariant(false) : void 0;
  !a.outputAmount.currency.equals(b.outputAmount.currency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'OUTPUT_CURRENCY') : invariant(false) : void 0;
  if (a.outputAmount.equalTo(b.outputAmount)) {
    if (a.inputAmount.equalTo(b.inputAmount)) {
      return 0;
    }
    // trade A requires less input than trade B, so A should come first
    if (a.inputAmount.lessThan(b.inputAmount)) {
      return -1;
    } else {
      return 1;
    }
  } else {
    // tradeA has less output than trade B, so should come second
    if (a.outputAmount.lessThan(b.outputAmount)) {
      return 1;
    } else {
      return -1;
    }
  }
}
// extension of the input output comparator that also considers other dimensions of the trade in ranking them
function tradeComparator(a, b) {
  var ioComp = inputOutputComparator(a, b);
  if (ioComp !== 0) {
    return ioComp;
  }
  // consider lowest slippage next, since these are less likely to fail
  if (a.priceImpact.lessThan(b.priceImpact)) {
    return -1;
  } else if (a.priceImpact.greaterThan(b.priceImpact)) {
    return 1;
  }
  // finally consider the number of hops since each hop costs gas
  return a.route.path.length - b.route.path.length;
}
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
var Trade = /*#__PURE__*/function () {
  function Trade(route, amount, tradeType) {
    this.route = route;
    this.tradeType = tradeType;
    var tokenAmounts = new Array(route.path.length);
    if (tradeType === TradeType.EXACT_INPUT) {
      !amount.currency.equals(route.input) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INPUT') : invariant(false) : void 0;
      tokenAmounts[0] = amount.wrapped;
      for (var i = 0; i < route.path.length - 1; i++) {
        var pair = route.pairs[i];
        var _pair$getOutputAmount = pair.getOutputAmount(tokenAmounts[i]),
          outputAmount = _pair$getOutputAmount[0];
        tokenAmounts[i + 1] = outputAmount;
      }
      this.inputAmount = CurrencyAmount.fromFractionalAmount(route.input, amount.numerator, amount.denominator);
      this.outputAmount = CurrencyAmount.fromFractionalAmount(route.output, tokenAmounts[tokenAmounts.length - 1].numerator, tokenAmounts[tokenAmounts.length - 1].denominator);
    } else {
      !amount.currency.equals(route.output) ? process.env.NODE_ENV !== "production" ? invariant(false, 'OUTPUT') : invariant(false) : void 0;
      tokenAmounts[tokenAmounts.length - 1] = amount.wrapped;
      for (var _i = route.path.length - 1; _i > 0; _i--) {
        var _pair = route.pairs[_i - 1];
        var _pair$getInputAmount = _pair.getInputAmount(tokenAmounts[_i]),
          inputAmount = _pair$getInputAmount[0];
        tokenAmounts[_i - 1] = inputAmount;
      }
      this.inputAmount = CurrencyAmount.fromFractionalAmount(route.input, tokenAmounts[0].numerator, tokenAmounts[0].denominator);
      this.outputAmount = CurrencyAmount.fromFractionalAmount(route.output, amount.numerator, amount.denominator);
    }
    this.executionPrice = new Price(this.inputAmount.currency, this.outputAmount.currency, this.inputAmount.quotient, this.outputAmount.quotient);
    this.priceImpact = computePriceImpact(route.midPrice, this.inputAmount, this.outputAmount);
  }
  /**
   * Constructs an exact in trade with the given amount in and route
   * @param route route of the exact in trade
   * @param amountIn the amount being passed in
   */
  Trade.exactIn = function exactIn(route, amountIn) {
    return new Trade(route, amountIn, TradeType.EXACT_INPUT);
  }
  /**
   * Constructs an exact out trade with the given amount out and route
   * @param route route of the exact out trade
   * @param amountOut the amount returned by the trade
   */;
  Trade.exactOut = function exactOut(route, amountOut) {
    return new Trade(route, amountOut, TradeType.EXACT_OUTPUT);
  }
  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */;
  var _proto = Trade.prototype;
  _proto.minimumAmountOut = function minimumAmountOut(slippageTolerance) {
    !!slippageTolerance.lessThan(ZERO) ? process.env.NODE_ENV !== "production" ? invariant(false, 'SLIPPAGE_TOLERANCE') : invariant(false) : void 0;
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount;
    } else {
      var slippageAdjustedAmountOut = new Fraction(ONE).add(slippageTolerance).invert().multiply(this.outputAmount.quotient).quotient;
      return CurrencyAmount.fromRawAmount(this.outputAmount.currency, slippageAdjustedAmountOut);
    }
  }
  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */;
  _proto.maximumAmountIn = function maximumAmountIn(slippageTolerance) {
    !!slippageTolerance.lessThan(ZERO) ? process.env.NODE_ENV !== "production" ? invariant(false, 'SLIPPAGE_TOLERANCE') : invariant(false) : void 0;
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount;
    } else {
      var slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(this.inputAmount.quotient).quotient;
      return CurrencyAmount.fromRawAmount(this.inputAmount.currency, slippageAdjustedAmountIn);
    }
  }
  /**
   * Given a list of pairs, and a fixed amount in, returns the top `maxNumResults` trades that go from an input token
   * amount to an output token, making at most `maxHops` hops.
   * Note this does not consider aggregation, as routes are linear. It's possible a better route exists by splitting
   * the amount in among multiple routes.
   * @param pairs the pairs to consider in finding the best trade
   * @param nextAmountIn exact amount of input currency to spend
   * @param currencyOut the desired currency out
   * @param maxNumResults maximum number of results to return
   * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
   * @param currentPairs used in recursion; the current list of pairs
   * @param currencyAmountIn used in recursion; the original value of the currencyAmountIn parameter
   * @param bestTrades used in recursion; the current list of best trades
   */;
  Trade.bestTradeExactIn = function bestTradeExactIn(pairs, currencyAmountIn, currencyOut, _temp,
  // used in recursion.
  currentPairs, nextAmountIn, bestTrades) {
    var _ref = _temp === void 0 ? {} : _temp,
      _ref$maxNumResults = _ref.maxNumResults,
      maxNumResults = _ref$maxNumResults === void 0 ? 3 : _ref$maxNumResults,
      _ref$maxHops = _ref.maxHops,
      maxHops = _ref$maxHops === void 0 ? 3 : _ref$maxHops;
    if (currentPairs === void 0) {
      currentPairs = [];
    }
    if (nextAmountIn === void 0) {
      nextAmountIn = currencyAmountIn;
    }
    if (bestTrades === void 0) {
      bestTrades = [];
    }
    !(pairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'PAIRS') : invariant(false) : void 0;
    !(maxHops > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MAX_HOPS') : invariant(false) : void 0;
    !(currencyAmountIn === nextAmountIn || currentPairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_RECURSION') : invariant(false) : void 0;
    var amountIn = nextAmountIn.wrapped;
    var tokenOut = currencyOut.wrapped;
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      // pair irrelevant
      if (!pair.token0.equals(amountIn.currency) && !pair.token1.equals(amountIn.currency)) continue;
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue;
      var amountOut = void 0;
      try {
        ;
        var _pair$getOutputAmount2 = pair.getOutputAmount(amountIn);
        amountOut = _pair$getOutputAmount2[0];
      } catch (error) {
        // input too low
        if (error.isInsufficientInputAmountError) {
          continue;
        }
        throw error;
      }
      // we have arrived at the output token, so this is the final trade of one of the paths
      if (amountOut.currency.equals(tokenOut)) {
        sortedInsert(bestTrades, new Trade(new Route([].concat(currentPairs, [pair]), currencyAmountIn.currency, currencyOut), currencyAmountIn, TradeType.EXACT_INPUT), maxNumResults, tradeComparator);
      } else if (maxHops > 1 && pairs.length > 1) {
        var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length));
        // otherwise, consider all the other paths that lead from this token as long as we have not exceeded maxHops
        Trade.bestTradeExactIn(pairsExcludingThisPair, currencyAmountIn, currencyOut, {
          maxNumResults: maxNumResults,
          maxHops: maxHops - 1
        }, [].concat(currentPairs, [pair]), amountOut, bestTrades);
      }
    }
    return bestTrades;
  }
  /**
   * Return the execution price after accounting for slippage tolerance
   * @param slippageTolerance the allowed tolerated slippage
   */;
  _proto.worstExecutionPrice = function worstExecutionPrice(slippageTolerance) {
    return new Price(this.inputAmount.currency, this.outputAmount.currency, this.maximumAmountIn(slippageTolerance).quotient, this.minimumAmountOut(slippageTolerance).quotient);
  }
  /**
   * similar to the above method but instead targets a fixed output amount
   * given a list of pairs, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
   * to an output token amount, making at most `maxHops` hops
   * note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
   * the amount in among multiple routes.
   * @param pairs the pairs to consider in finding the best trade
   * @param currencyIn the currency to spend
   * @param nextAmountOut the exact amount of currency out
   * @param maxNumResults maximum number of results to return
   * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
   * @param currentPairs used in recursion; the current list of pairs
   * @param currencyAmountOut used in recursion; the original value of the currencyAmountOut parameter
   * @param bestTrades used in recursion; the current list of best trades
   */;
  Trade.bestTradeExactOut = function bestTradeExactOut(pairs, currencyIn, currencyAmountOut, _temp2,
  // used in recursion.
  currentPairs, nextAmountOut, bestTrades) {
    var _ref2 = _temp2 === void 0 ? {} : _temp2,
      _ref2$maxNumResults = _ref2.maxNumResults,
      maxNumResults = _ref2$maxNumResults === void 0 ? 3 : _ref2$maxNumResults,
      _ref2$maxHops = _ref2.maxHops,
      maxHops = _ref2$maxHops === void 0 ? 3 : _ref2$maxHops;
    if (currentPairs === void 0) {
      currentPairs = [];
    }
    if (nextAmountOut === void 0) {
      nextAmountOut = currencyAmountOut;
    }
    if (bestTrades === void 0) {
      bestTrades = [];
    }
    !(pairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'PAIRS') : invariant(false) : void 0;
    !(maxHops > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MAX_HOPS') : invariant(false) : void 0;
    !(currencyAmountOut === nextAmountOut || currentPairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_RECURSION') : invariant(false) : void 0;
    var amountOut = nextAmountOut.wrapped;
    var tokenIn = currencyIn.wrapped;
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      // pair irrelevant
      if (!pair.token0.equals(amountOut.currency) && !pair.token1.equals(amountOut.currency)) continue;
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue;
      var amountIn = void 0;
      try {
        ;
        var _pair$getInputAmount2 = pair.getInputAmount(amountOut);
        amountIn = _pair$getInputAmount2[0];
      } catch (error) {
        // not enough liquidity in this pair
        if (error.isInsufficientReservesError) {
          continue;
        }
        throw error;
      }
      // we have arrived at the input token, so this is the first trade of one of the paths
      if (amountIn.currency.equals(tokenIn)) {
        sortedInsert(bestTrades, new Trade(new Route([pair].concat(currentPairs), currencyIn, currencyAmountOut.currency), currencyAmountOut, TradeType.EXACT_OUTPUT), maxNumResults, tradeComparator);
      } else if (maxHops > 1 && pairs.length > 1) {
        var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length));
        // otherwise, consider all the other paths that arrive at this token as long as we have not exceeded maxHops
        Trade.bestTradeExactOut(pairsExcludingThisPair, currencyIn, currencyAmountOut, {
          maxNumResults: maxNumResults,
          maxHops: maxHops - 1
        }, [pair].concat(currentPairs), amountIn, bestTrades);
      }
    }
    return bestTrades;
  };
  return Trade;
}();

/**
 * Returns sorted token addresses, used to handle return values from pairs sorted in this order
 */
function sortTokens(tokenA, tokenB) {
  !(tokenA !== tokenB) ? process.env.NODE_ENV !== "production" ? invariant(false, 'IDENTICAL_ADDRESSES') : invariant(false) : void 0;
  var _ref = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA],
    token0 = _ref[0],
    token1 = _ref[1];
  !(token0.toLowerCase() !== '0x0000000000000000000000000000000000000000') ? process.env.NODE_ENV !== "production" ? invariant(false, 'ZERO_ADDRESS') : invariant(false) : void 0;
  return [token0, token1];
}
/**
 * Calculates the CREATE2 address for a pair without making any external calls
 * Note: This is a simplified version for demonstration purposes
 */
function pairFor(factory, tokenA, tokenB, initCodeHash) {
  var _sortTokens = sortTokens(tokenA, tokenB),
    token0 = _sortTokens[0],
    token1 = _sortTokens[1];
  // In a real implementation, this would calculate the CREATE2 address
  // For now, return a mock address that's deterministic based on inputs
  var combined = factory + token0 + token1 + initCodeHash;
  var mockAddress = '0x' + combined.slice(-40).padStart(40, '0');
  return mockAddress;
}
/**
 * Given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
 */
function quote(amountA, reserveA, reserveB) {
  !JSBI.greaterThan(amountA, JSBI.BigInt(0)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INSUFFICIENT_AMOUNT') : invariant(false) : void 0;
  !(JSBI.greaterThan(reserveA, JSBI.BigInt(0)) && JSBI.greaterThan(reserveB, JSBI.BigInt(0))) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INSUFFICIENT_LIQUIDITY') : invariant(false) : void 0;
  return JSBI.divide(JSBI.multiply(amountA, reserveB), reserveA);
}
/**
 * Given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
 */
function getAmountOut(amountIn, reserveIn, reserveOut) {
  !JSBI.greaterThan(amountIn, JSBI.BigInt(0)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INSUFFICIENT_INPUT_AMOUNT') : invariant(false) : void 0;
  !(JSBI.greaterThan(reserveIn, JSBI.BigInt(0)) && JSBI.greaterThan(reserveOut, JSBI.BigInt(0))) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INSUFFICIENT_LIQUIDITY') : invariant(false) : void 0;
  var amountInWithFee = JSBI.multiply(amountIn, JSBI.BigInt(997));
  var numerator = JSBI.multiply(amountInWithFee, reserveOut);
  var denominator = JSBI.add(JSBI.multiply(reserveIn, JSBI.BigInt(1000)), amountInWithFee);
  return JSBI.divide(numerator, denominator);
}
/**
 * Given an output amount of an asset and pair reserves, returns a required input amount of the other asset
 */
function getAmountIn(amountOut, reserveIn, reserveOut) {
  !JSBI.greaterThan(amountOut, JSBI.BigInt(0)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INSUFFICIENT_OUTPUT_AMOUNT') : invariant(false) : void 0;
  !(JSBI.greaterThan(reserveIn, JSBI.BigInt(0)) && JSBI.greaterThan(reserveOut, JSBI.BigInt(0))) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INSUFFICIENT_LIQUIDITY') : invariant(false) : void 0;
  var numerator = JSBI.multiply(JSBI.multiply(reserveIn, amountOut), JSBI.BigInt(1000));
  var denominator = JSBI.multiply(JSBI.subtract(reserveOut, amountOut), JSBI.BigInt(997));
  return JSBI.add(JSBI.divide(numerator, denominator), JSBI.BigInt(1));
}
/**
 * Performs chained getAmountOut calculations on any number of pairs
 */
function getAmountsOut(amountIn, reserves) {
  !(reserves.length >= 1) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_PATH') : invariant(false) : void 0;
  var amounts = new Array(reserves.length + 1);
  amounts[0] = amountIn;
  for (var i = 0; i < reserves.length; i++) {
    amounts[i + 1] = getAmountOut(amounts[i], reserves[i][0], reserves[i][1]);
  }
  return amounts;
}
/**
 * Performs chained getAmountIn calculations on any number of pairs
 */
function getAmountsIn(amountOut, reserves) {
  !(reserves.length >= 1) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_PATH') : invariant(false) : void 0;
  var amounts = new Array(reserves.length + 1);
  amounts[amounts.length - 1] = amountOut;
  for (var i = reserves.length - 1; i >= 0; i--) {
    amounts[i] = getAmountIn(amounts[i + 1], reserves[i][0], reserves[i][1]);
  }
  return amounts;
}

/**
 * Computes the direction and magnitude of the profit-maximizing trade
 * @param truePriceTokenA The true price of token A
 * @param truePriceTokenB The true price of token B
 * @param reserveA Reserve of token A
 * @param reserveB Reserve of token B
 * @returns [aToB: boolean, amountIn: JSBI] - direction and amount for profit-maximizing trade
 */
function computeProfitMaximizingTrade(truePriceTokenA, truePriceTokenB, reserveA, reserveB) {
  !(JSBI.greaterThan(truePriceTokenA, JSBI.BigInt(0)) && JSBI.greaterThan(truePriceTokenB, JSBI.BigInt(0))) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_PRICES') : invariant(false) : void 0;
  !(JSBI.greaterThan(reserveA, JSBI.BigInt(0)) && JSBI.greaterThan(reserveB, JSBI.BigInt(0))) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INSUFFICIENT_RESERVES') : invariant(false) : void 0;
  // Current price in pool: reserveB / reserveA
  // True price ratio: truePriceTokenB / truePriceTokenA
  // If current price < true price, A is undervalued, sell B to buy A (aToB = false)
  // If current price > true price, A is overvalued, sell A to buy B (aToB = true)
  var currentPrice = JSBI.divide(JSBI.multiply(reserveB, truePriceTokenA), reserveA);
  var aToB = JSBI.greaterThan(currentPrice, truePriceTokenB);
  if (JSBI.equal(currentPrice, truePriceTokenB)) {
    return [false, JSBI.BigInt(0)];
  }
  var invariantValue = JSBI.multiply(reserveA, reserveB);
  try {
    var leftSide = sqrt(JSBI.divide(JSBI.multiply(JSBI.multiply(invariantValue, JSBI.BigInt(1000)), aToB ? truePriceTokenA : truePriceTokenB), JSBI.multiply(aToB ? truePriceTokenB : truePriceTokenA, JSBI.BigInt(997))));
    var rightSide = JSBI.divide(JSBI.multiply(aToB ? reserveA : reserveB, JSBI.BigInt(1000)), JSBI.BigInt(997));
    if (JSBI.lessThan(leftSide, rightSide)) {
      return [false, JSBI.BigInt(0)];
    }
    var amountIn = JSBI.subtract(leftSide, rightSide);
    return [aToB, amountIn];
  } catch (error) {
    return [false, JSBI.BigInt(0)];
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
function getReservesAfterArbitrage(reserveA, reserveB, truePriceTokenA, truePriceTokenB) {
  !(JSBI.greaterThan(reserveA, JSBI.BigInt(0)) && JSBI.greaterThan(reserveB, JSBI.BigInt(0))) ? process.env.NODE_ENV !== "production" ? invariant(false, 'ZERO_PAIR_RESERVES') : invariant(false) : void 0;
  var _computeProfitMaximiz = computeProfitMaximizingTrade(truePriceTokenA, truePriceTokenB, reserveA, reserveB),
    aToB = _computeProfitMaximiz[0],
    amountIn = _computeProfitMaximiz[1];
  if (JSBI.equal(amountIn, JSBI.BigInt(0))) {
    return [reserveA, reserveB];
  }
  if (aToB) {
    var amountOut = getAmountOut(amountIn, reserveA, reserveB);
    return [JSBI.add(reserveA, amountIn), JSBI.subtract(reserveB, amountOut)];
  } else {
    var _amountOut = getAmountOut(amountIn, reserveB, reserveA);
    return [JSBI.subtract(reserveA, _amountOut), JSBI.add(reserveB, amountIn)];
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
function computeLiquidityValue(reservesA, reservesB, totalSupply, liquidityAmount, feeOn, kLast) {
  var adjustedTotalSupply = totalSupply;
  if (feeOn && JSBI.greaterThan(kLast, JSBI.BigInt(0))) {
    var rootK = sqrt(JSBI.multiply(reservesA, reservesB));
    var rootKLast = sqrt(kLast);
    if (JSBI.greaterThan(rootK, rootKLast)) {
      var numerator1 = totalSupply;
      var numerator2 = JSBI.subtract(rootK, rootKLast);
      var denominator = JSBI.add(JSBI.multiply(rootK, JSBI.BigInt(5)), rootKLast);
      var feeLiquidity = JSBI.divide(JSBI.multiply(numerator1, numerator2), denominator);
      adjustedTotalSupply = JSBI.add(totalSupply, feeLiquidity);
    }
  }
  return [JSBI.divide(JSBI.multiply(reservesA, liquidityAmount), adjustedTotalSupply), JSBI.divide(JSBI.multiply(reservesB, liquidityAmount), adjustedTotalSupply)];
}
/**
 * Computes the value of liquidity tokens in terms of underlying tokens
 * @param pairReserves Current reserves and metadata for the pair
 * @param liquidityAmount Amount of liquidity tokens to value
 * @returns [tokenAAmount: JSBI, tokenBAmount: JSBI] - underlying token amounts
 */
function getLiquidityValue(pairReserves, liquidityAmount) {
  return computeLiquidityValue(pairReserves.reserveA, pairReserves.reserveB, pairReserves.totalSupply, liquidityAmount, pairReserves.feeOn, pairReserves.kLast);
}
/**
 * Computes the value of liquidity tokens after arbitrage to true price
 * @param pairReserves Current reserves and metadata for the pair
 * @param truePriceTokenA The true price of token A
 * @param truePriceTokenB The true price of token B
 * @param liquidityAmount Amount of liquidity tokens to value
 * @returns [tokenAAmount: JSBI, tokenBAmount: JSBI] - underlying token amounts after arbitrage
 */
function getLiquidityValueAfterArbitrageToPrice(pairReserves, truePriceTokenA, truePriceTokenB, liquidityAmount) {
  !(JSBI.greaterThanOrEqual(pairReserves.totalSupply, liquidityAmount) && JSBI.greaterThan(liquidityAmount, JSBI.BigInt(0))) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_LIQUIDITY_AMOUNT') : invariant(false) : void 0;
  var _getReservesAfterArbi = getReservesAfterArbitrage(pairReserves.reserveA, pairReserves.reserveB, truePriceTokenA, truePriceTokenB),
    reservesA = _getReservesAfterArbi[0],
    reservesB = _getReservesAfterArbi[1];
  return computeLiquidityValue(reservesA, reservesB, pairReserves.totalSupply, liquidityAmount, pairReserves.feeOn, pairReserves.kLast);
}

/**
 * Mock implementation of LP data provider for testing and demonstration
 */
var MockLPDataProvider = /*#__PURE__*/function () {
  function MockLPDataProvider() {
    this.userPools = new Map();
    this.userBalances = new Map();
    this.poolData = new Map();
  }
  /**
   * Add mock data for testing
   */
  var _proto = MockLPDataProvider.prototype;
  _proto.addMockUserPosition = function addMockUserPosition(user, pool, balance) {
    user = checkValidAddress(user);
    pool = checkValidAddress(pool);
    if (!this.userPools.has(user)) {
      this.userPools.set(user, new Set());
    }
    this.userPools.get(user).add(pool);
    if (!this.userBalances.has(user)) {
      this.userBalances.set(user, new Map());
    }
    this.userBalances.get(user).set(pool, balance);
  }
  /**
   * Add mock pool data
   */;
  _proto.addMockPoolData = function addMockPoolData(pool, tokenA, tokenB, reserveA, reserveB, totalSupply) {
    this.poolData.set(checkValidAddress(pool), {
      tokenA: checkValidAddress(tokenA),
      tokenB: checkValidAddress(tokenB),
      reserveA: reserveA,
      reserveB: reserveB,
      totalSupply: totalSupply
    });
  };
  _proto.getUserLPPoolCount = /*#__PURE__*/function () {
    var _getUserLPPoolCount = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(user) {
      var pools;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            user = checkValidAddress(user);
            pools = this.userPools.get(user);
            return _context.a(2, JSBI.BigInt(pools ? pools.size : 0));
        }
      }, _callee, this);
    }));
    function getUserLPPoolCount(_x) {
      return _getUserLPPoolCount.apply(this, arguments);
    }
    return getUserLPPoolCount;
  }();
  _proto.getUserLPPools = /*#__PURE__*/function () {
    var _getUserLPPools = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(user, offset, limit) {
      var pools, poolArray, offsetNum, limitNum, sliced, hasMore;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            user = checkValidAddress(user);
            pools = this.userPools.get(user);
            if (pools) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2, {
              pools: [],
              hasMore: false
            });
          case 1:
            poolArray = Array.from(pools);
            offsetNum = JSBI.toNumber(offset);
            limitNum = JSBI.toNumber(limit);
            sliced = poolArray.slice(offsetNum, offsetNum + limitNum);
            hasMore = offsetNum + limitNum < poolArray.length;
            return _context2.a(2, {
              pools: sliced,
              hasMore: hasMore
            });
        }
      }, _callee2, this);
    }));
    function getUserLPPools(_x2, _x3, _x4) {
      return _getUserLPPools.apply(this, arguments);
    }
    return getUserLPPools;
  }();
  _proto.getUserLPBalance = /*#__PURE__*/function () {
    var _getUserLPBalance = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(user, pool) {
      var userBalances;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.n) {
          case 0:
            user = checkValidAddress(user);
            pool = checkValidAddress(pool);
            userBalances = this.userBalances.get(user);
            if (userBalances) {
              _context3.n = 1;
              break;
            }
            return _context3.a(2, JSBI.BigInt(0));
          case 1:
            return _context3.a(2, userBalances.get(pool) || JSBI.BigInt(0));
        }
      }, _callee3, this);
    }));
    function getUserLPBalance(_x5, _x6) {
      return _getUserLPBalance.apply(this, arguments);
    }
    return getUserLPBalance;
  }();
  _proto.getUserLPPositions = /*#__PURE__*/function () {
    var _getUserLPPositions = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(user, offset, limit) {
      var poolsResult, positions, _iterator, _step, pool, balance, poolInfo, sharePercentage;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.n) {
          case 0:
            user = checkValidAddress(user);
            _context4.n = 1;
            return this.getUserLPPools(user, offset, limit);
          case 1:
            poolsResult = _context4.v;
            positions = [];
            _iterator = _createForOfIteratorHelperLoose(poolsResult.pools);
          case 2:
            if ((_step = _iterator()).done) {
              _context4.n = 6;
              break;
            }
            pool = _step.value;
            _context4.n = 3;
            return this.getUserLPBalance(user, pool);
          case 3:
            balance = _context4.v;
            _context4.n = 4;
            return this.getPoolInfo(pool);
          case 4:
            poolInfo = _context4.v;
            // Calculate share percentage (balance / totalSupply * 10000)
            sharePercentage = JSBI.equal(poolInfo.totalSupply, JSBI.BigInt(0)) ? JSBI.BigInt(0) : JSBI.divide(JSBI.multiply(balance, JSBI.BigInt(10000)), poolInfo.totalSupply);
            positions.push({
              pool: pool,
              tokenA: poolInfo.tokenA,
              tokenB: poolInfo.tokenB,
              balance: balance,
              reserveA: poolInfo.reserveA,
              reserveB: poolInfo.reserveB,
              totalSupply: poolInfo.totalSupply,
              sharePercentage: sharePercentage
            });
          case 5:
            _context4.n = 2;
            break;
          case 6:
            return _context4.a(2, {
              positions: positions,
              hasMore: poolsResult.hasMore
            });
        }
      }, _callee4, this);
    }));
    function getUserLPPositions(_x7, _x8, _x9) {
      return _getUserLPPositions.apply(this, arguments);
    }
    return getUserLPPositions;
  }();
  _proto.hasLPPosition = /*#__PURE__*/function () {
    var _hasLPPosition = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(user, pool) {
      var balance;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.n) {
          case 0:
            _context5.n = 1;
            return this.getUserLPBalance(user, pool);
          case 1:
            balance = _context5.v;
            return _context5.a(2, JSBI.greaterThan(balance, JSBI.BigInt(0)));
        }
      }, _callee5, this);
    }));
    function hasLPPosition(_x0, _x1) {
      return _hasLPPosition.apply(this, arguments);
    }
    return hasLPPosition;
  }();
  _proto.getPoolInfo = /*#__PURE__*/function () {
    var _getPoolInfo = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(pool) {
      var info;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.n) {
          case 0:
            pool = checkValidAddress(pool);
            info = this.poolData.get(pool);
            if (info) {
              _context6.n = 1;
              break;
            }
            throw new Error("Pool data not found for " + pool);
          case 1:
            return _context6.a(2, info);
        }
      }, _callee6, this);
    }));
    function getPoolInfo(_x10) {
      return _getPoolInfo.apply(this, arguments);
    }
    return getPoolInfo;
  }();
  return MockLPDataProvider;
}();
/**
 * LP Position Tracker class that provides high-level functions
 */
var LPPositionTracker = /*#__PURE__*/function () {
  function LPPositionTracker(dataProvider) {
    this.dataProvider = dataProvider;
  }
  /**
   * Get the number of LP pools a user has positions in
   */
  var _proto2 = LPPositionTracker.prototype;
  _proto2.getUserLPPoolCount =
  /*#__PURE__*/
  function () {
    var _getUserLPPoolCount2 = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(user) {
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.n) {
          case 0:
            return _context7.a(2, this.dataProvider.getUserLPPoolCount(user));
        }
      }, _callee7, this);
    }));
    function getUserLPPoolCount(_x11) {
      return _getUserLPPoolCount2.apply(this, arguments);
    }
    return getUserLPPoolCount;
  }()
  /**
   * Get paginated list of LP pools where user has positions
   */
  ;
  _proto2.getUserLPPools =
  /*#__PURE__*/
  function () {
    var _getUserLPPools2 = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(user, offset, limit) {
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.n) {
          case 0:
            !JSBI.greaterThanOrEqual(offset, JSBI.BigInt(0)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_OFFSET') : invariant(false) : void 0;
            !JSBI.greaterThan(limit, JSBI.BigInt(0)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_LIMIT') : invariant(false) : void 0;
            return _context8.a(2, this.dataProvider.getUserLPPools(user, offset, limit));
        }
      }, _callee8, this);
    }));
    function getUserLPPools(_x12, _x13, _x14) {
      return _getUserLPPools2.apply(this, arguments);
    }
    return getUserLPPools;
  }()
  /**
   * Get user's LP token balance in a specific pool
   */
  ;
  _proto2.getUserLPBalance =
  /*#__PURE__*/
  function () {
    var _getUserLPBalance2 = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(user, pool) {
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.n) {
          case 0:
            return _context9.a(2, this.dataProvider.getUserLPBalance(user, pool));
        }
      }, _callee9, this);
    }));
    function getUserLPBalance(_x15, _x16) {
      return _getUserLPBalance2.apply(this, arguments);
    }
    return getUserLPBalance;
  }()
  /**
   * Get paginated list of user's LP positions with detailed information
   */
  ;
  _proto2.getUserLPPositions =
  /*#__PURE__*/
  function () {
    var _getUserLPPositions2 = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(user, offset, limit) {
      return _regenerator().w(function (_context0) {
        while (1) switch (_context0.n) {
          case 0:
            !JSBI.greaterThanOrEqual(offset, JSBI.BigInt(0)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_OFFSET') : invariant(false) : void 0;
            !JSBI.greaterThan(limit, JSBI.BigInt(0)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_LIMIT') : invariant(false) : void 0;
            return _context0.a(2, this.dataProvider.getUserLPPositions(user, offset, limit));
        }
      }, _callee0, this);
    }));
    function getUserLPPositions(_x17, _x18, _x19) {
      return _getUserLPPositions2.apply(this, arguments);
    }
    return getUserLPPositions;
  }()
  /**
   * Check if user has any LP position in a specific pool
   */
  ;
  _proto2.hasLPPosition =
  /*#__PURE__*/
  function () {
    var _hasLPPosition2 = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(user, pool) {
      return _regenerator().w(function (_context1) {
        while (1) switch (_context1.n) {
          case 0:
            return _context1.a(2, this.dataProvider.hasLPPosition(user, pool));
        }
      }, _callee1, this);
    }));
    function hasLPPosition(_x20, _x21) {
      return _hasLPPosition2.apply(this, arguments);
    }
    return hasLPPosition;
  }()
  /**
   * Get all user's LP positions (no pagination)
   */
  ;
  _proto2.getAllUserLPPositions =
  /*#__PURE__*/
  function () {
    var _getAllUserLPPositions = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(user) {
      var positions, offset, limit, result;
      return _regenerator().w(function (_context10) {
        while (1) switch (_context10.n) {
          case 0:
            positions = [];
            offset = JSBI.BigInt(0);
            limit = JSBI.BigInt(50); // Reasonable batch size
          case 1:
            _context10.n = 2;
            return this.getUserLPPositions(user, offset, limit);
          case 2:
            result = _context10.v;
            positions.push.apply(positions, result.positions);
            if (result.hasMore) {
              _context10.n = 3;
              break;
            }
            return _context10.a(3, 4);
          case 3:
            offset = JSBI.add(offset, limit);
            _context10.n = 1;
            break;
          case 4:
            return _context10.a(2, positions);
        }
      }, _callee10, this);
    }));
    function getAllUserLPPositions(_x22) {
      return _getAllUserLPPositions.apply(this, arguments);
    }
    return getAllUserLPPositions;
  }()
  /**
   * Get total value locked (TVL) by user across all positions
   */
  ;
  _proto2.getUserTotalLPValue =
  /*#__PURE__*/
  function () {
    var _getUserTotalLPValue = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(user) {
      var positions, pools;
      return _regenerator().w(function (_context11) {
        while (1) switch (_context11.n) {
          case 0:
            _context11.n = 1;
            return this.getAllUserLPPositions(user);
          case 1:
            positions = _context11.v;
            pools = new Set(positions.map(function (p) {
              return p.pool;
            }));
            return _context11.a(2, {
              totalPositions: positions.length,
              totalPools: pools.size
            });
        }
      }, _callee11, this);
    }));
    function getUserTotalLPValue(_x23) {
      return _getUserTotalLPValue.apply(this, arguments);
    }
    return getUserTotalLPValue;
  }();
  return LPPositionTracker;
}();

function toHex(currencyAmount) {
  return "0x" + currencyAmount.quotient.toString(16);
}
var ZERO_HEX = '0x0';
/**
 * Represents the Uniswap V2 Router, and has static methods for helping execute trades.
 */
var Router = /*#__PURE__*/function () {
  /**
   * Cannot be constructed.
   */
  function Router() {}
  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trade to produce call parameters for
   * @param options options for the call parameters
   */
  Router.swapCallParameters = function swapCallParameters(trade, options) {
    var etherIn = trade.inputAmount.currency.isNative;
    var etherOut = trade.outputAmount.currency.isNative;
    // the router does not support both ether in and out
    !!(etherIn && etherOut) ? process.env.NODE_ENV !== "production" ? invariant(false, 'ETHER_IN_OUT') : invariant(false) : void 0;
    !(!('ttl' in options) || options.ttl > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TTL') : invariant(false) : void 0;
    var to = validateAndParseAddress(options.recipient);
    var amountIn = toHex(trade.maximumAmountIn(options.allowedSlippage));
    var amountOut = toHex(trade.minimumAmountOut(options.allowedSlippage));
    var path = trade.route.path.map(function (token) {
      return token.address;
    });
    var deadline = 'ttl' in options ? "0x" + (Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16) : "0x" + options.deadline.toString(16);
    var useFeeOnTransfer = Boolean(options.feeOnTransfer);
    var methodName;
    var args;
    var value;
    switch (trade.tradeType) {
      case TradeType.EXACT_INPUT:
        if (etherIn) {
          methodName = useFeeOnTransfer ? 'swapExactETHForTokensSupportingFeeOnTransferTokens' : 'swapExactETHForTokens';
          // (uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountOut, path, to, deadline];
          value = amountIn;
        } else if (etherOut) {
          methodName = useFeeOnTransfer ? 'swapExactTokensForETHSupportingFeeOnTransferTokens' : 'swapExactTokensForETH';
          // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountIn, amountOut, path, to, deadline];
          value = ZERO_HEX;
        } else {
          methodName = useFeeOnTransfer ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens' : 'swapExactTokensForTokens';
          // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountIn, amountOut, path, to, deadline];
          value = ZERO_HEX;
        }
        break;
      case TradeType.EXACT_OUTPUT:
        !!useFeeOnTransfer ? process.env.NODE_ENV !== "production" ? invariant(false, 'EXACT_OUT_FOT') : invariant(false) : void 0;
        if (etherIn) {
          methodName = 'swapETHForExactTokens';
          // (uint amountOut, address[] calldata path, address to, uint deadline)
          args = [amountOut, path, to, deadline];
          value = amountIn;
        } else if (etherOut) {
          methodName = 'swapTokensForExactETH';
          // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
          args = [amountOut, amountIn, path, to, deadline];
          value = ZERO_HEX;
        } else {
          methodName = 'swapTokensForExactTokens';
          // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
          args = [amountOut, amountIn, path, to, deadline];
          value = ZERO_HEX;
        }
        break;
    }
    return {
      methodName: methodName,
      args: args,
      value: value
    };
  };
  return Router;
}();

export { BASIS_POINTS, ChainId, CurrencyAmount, Ether, FACTORY_ADDRESSES, FACTORY_ADDRESS_MAP, FIVE, Fraction, INIT_CODE_HASH, InsufficientInputAmountError, InsufficientReservesError, LPPositionTracker, MINIMUM_LIQUIDITY, MaxUint256, MockLPDataProvider, NativeCurrency, NativeCurrencyName, ONE, ONE_HUNDRED_PERCENT, Pair, Percent, Price, ROUTER_ADDRESSES, Rounding, Route, Router, SUPPORTED_CHAINS, Token, Trade, TradeType, WETH9, ZERO, ZERO_PERCENT, _1000, _997, computeLiquidityValue, computePairAddress, computePriceImpact, computeProfitMaximizingTrade, getAmountIn, getAmountOut, getAmountsIn, getAmountsOut, getFactoryAddress, getLiquidityValue, getLiquidityValueAfterArbitrageToPrice, getReservesAfterArbitrage, getRouterAddress, inputOutputComparator, pairFor, quote, setFactoryAddress, setRouterAddress, sortTokens, sortedInsert, sqrt, tradeComparator, validateAndParseAddress };
//# sourceMappingURL=daoed-uniswap-v2-sdk-core.esm.js.map
