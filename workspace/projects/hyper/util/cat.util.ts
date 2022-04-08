import { JsBuiltInObjects } from '../domain';

type CatType =
  | JsBuiltInObjects.String
  | JsBuiltInObjects.Number
  | JsBuiltInObjects.Undefined
  | JsBuiltInObjects.Function
  | JsBuiltInObjects.Date
  | JsBuiltInObjects.Array
  | JsBuiltInObjects.Object
  | JsBuiltInObjects.RegExp
  | JsBuiltInObjects.Error
  | JsBuiltInObjects.global
  | JsBuiltInObjects.Window
  | JsBuiltInObjects.Boolean
  | JsBuiltInObjects.Symbol
  | JsBuiltInObjects.Infinity
  | JsBuiltInObjects.NaN
  | JsBuiltInObjects.BigInt
  | JsBuiltInObjects.Math
  | JsBuiltInObjects.Map
  | JsBuiltInObjects.Set
  | JsBuiltInObjects.WeakMap
  | JsBuiltInObjects.WeakSet
  | JsBuiltInObjects.JSON
  | JsBuiltInObjects.Promise
  | JsBuiltInObjects.Generator
  | JsBuiltInObjects.GeneratorFunction
  | JsBuiltInObjects.AsyncFunction
  | JsBuiltInObjects.Arguments
  | JsBuiltInObjects.WebAssembly
  | 'Null';

export class Cat {

  private constructor() { }

  private static typeof(obj: any): CatType {
    return Object.prototype.toString.call(obj)
      .match(/[a-zA-Z]+/g)[1].toString();
  }

  static isNull(obj: any): boolean {
    return Cat.typeof(obj) === 'Null';
  }

  static isUndef(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Undefined;
  }

  static isNil(obj: any): boolean {
    return Cat.typeof(obj) === 'Null'
      || Cat.typeof(obj) === JsBuiltInObjects.Undefined;
  }

  static isStr(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.String;
  }

  static isNum(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Number;
  }

  static isBool(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Boolean;
  }

  static isObj(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Object;
  }

  static isArr(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Array;
  }

  static isEmpty(obj: [] | {}): boolean {
    return Object.keys(obj).length < 1;
  }

  static isFunc(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Function;
  }

  static isDate(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Date;
  }

  static isReg(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.RegExp;
  }

  static isNaN(obj: number): boolean {
    return isNaN(obj);
  }

  static isMap(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Map;
  }

  static isSet(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Set;
  }

  static isWeakMap(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.WeakMap;
  }

  static isWeakSet(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.WeakSet;
  }

  static isJSON(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.JSON;
  }

  static isPromise(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Promise;
  }

  static isGenerator(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Generator;
  }

  static isGeneratorFunc(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.GeneratorFunction;
  }

  static isAsyncFunc(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.AsyncFunction;
  }

  static isBigInt(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.BigInt;
  }

  static isInfinity(obj: number): boolean {
    return !isFinite(obj);
  }

  static isError(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Error;
  }

  static isArguments(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Arguments;
  }

  static isWebAssembly(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.WebAssembly;
  }

  static isGlobal(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.global;
  }

  static isWindow(obj: any): boolean {
    return Cat.typeof(obj) === JsBuiltInObjects.Window;
  }
}
