/**
 * JS 内置对象（不完整）
 */
export enum JsBuiltInObjects {

  /**
   * Value properties
   *
   * Object.prototype.toString.call(Infinity);         // [object Number]
   * Object.prototype.toString.call(NaN);              // [object Number]
   * Object.prototype.toString.call(undefined);        // [object Undefined]
   * Object.prototype.toString.call(globalThis);       // [object global]  |  [object Window]
   */
  Infinity = 'Infinity',
  NaN = 'NaN',
  Undefined = 'Undefined',
  global = 'global',
  Window = 'Window',

  /**
   * Fundamental objects
   *
   * Object.prototype.toString.call({});              // [object Object]
   * Object.prototype.toString.call(Function);        // [object Function]
   * Object.prototype.toString.call(true);            // [object Boolean]
   * Object.prototype.toString.call(Symbol(1));       // [object Symbol]
   */
  Object = 'Object',
  Function = 'Function',
  Boolean = 'Boolean',
  Symbol = 'Symbol',

  /**
   * Error objects
   *
   * Object.prototype.toString.call(new Error())           // [object Error]
   * Object.prototype.toString.call(new EvalError())       // [object Error]
   * Object.prototype.toString.call(new RangeError())      // [object Error]
   * Object.prototype.toString.call(new ReferenceError())  // [object Error]
   * Object.prototype.toString.call(new SyntaxError())     // [object Error]
   * Object.prototype.toString.call(new TypeError())       // [object Error]
   * Object.prototype.toString.call(new URIError())        // [object Error]
   */
  Error = 'Error',
  AggregateError = 'AggregateError',
  EvalError = 'EvalError',
  InternalError = 'InternalError',
  RangeError = 'RangeError',
  ReferenceError = 'ReferenceError',
  SyntaxError = 'SyntaxError',
  TypeError = 'TypeError',
  URIError = 'URIError',

  /**
   * Numbers and dates
   *
   * Object.prototype.toString.call(1);                    // [object Number]
   * Object.prototype.toString.call(BigInt(1));            // [object BigInt]
   * Object.prototype.toString.call(Math);                 // [object Math]
   * Object.prototype.toString.call(new Date());           // [object Date]
   */
  Number = 'Number',
  BigInt = 'BigInt',
  Math = 'Math',
  Date = 'Date',

  /**
   * Text processing
   *
   * Object.prototype.toString.call('')                       //[object String]
   * Object.prototype.toString.call(new RegExp());            //[object RegExp]
   */
  String = 'String',
  RegExp = 'RegExp',

  /**
   * Indexed collections
   *
   * Object.prototype.toString.call(new Array())               // [object Array]
   * Object.prototype.toString.call(new Int8Array(1))          // [object Int8Array]
   * Object.prototype.toString.call(new Uint8Array(1))         // [object Uint8Array]
   * Object.prototype.toString.call(new Uint8ClampedArray(1))  // [object Uint8ClampedArray]
   * Object.prototype.toString.call(new Int16Array(1))         // [object Int16Array]
   * Object.prototype.toString.call(new Int32Array(1))         // [object Int32Array]
   * Object.prototype.toString.call(new Uint32Array(1))        // [object Uint32Array]
   * Object.prototype.toString.call(new Float32Array(1))       // [object Float32Array]
   * Object.prototype.toString.call(new Float64Array(1))       // [object Float64Array]
   */
  Array = 'Array',
  Int8Array = 'Int8Array',
  Uint8Array = 'Uint8Array',
  Uint8ClampedArray = 'Uint8ClampedArray',
  Int16Array = 'Int16Array',
  Uint16Array = 'Uint16Array',
  Int32Array = 'Int32Array',
  Uint32Array = 'Uint32Array',
  Float32Array = 'Float32Array',
  Float64Array = 'Float64Array',
  BigInt64Array = 'BigInt64Array',
  BigUint64Array = 'BigUint64Array',

  /**
   * Keyed collections
   *
   * Object.prototype.toString.call(new Map())                 // [object Map]
   * Object.prototype.toString.call(new Set())                 // [object Set]
   * Object.prototype.toString.call(new WeakMap())             // [object WeakMap]
   * Object.prototype.toString.call(new WeakSet())             // [object WeakSet]
   */
  Map = 'Map',
  Set = 'Set',
  WeakMap = 'WeakMap',
  WeakSet = 'WeakSet',

  /**
   * Structured data
   *
   * Object.prototype.toString.call(new ArrayBuffer())                 // [object ArrayBuffer]
   * Object.prototype.toString.call(new SharedArrayBuffer())           // [object SharedArrayBuffer]
   * Object.prototype.toString.call(Atomics)                           // [object Atomics]
   * Object.prototype.toString.call(new DataView(new ArrayBuffer()))   // [object DataView]
   * Object.prototype.toString.call(JSON)                              // [object JSON]
   */
  ArrayBuffer = 'ArrayBuffer',
  SharedArrayBuffer = 'SharedArrayBuffer',
  Atomics = 'Atomics',
  DataView = 'DataView',
  JSON = 'JSON',

  /**
   * Control abstraction objects
   *
   * Object.prototype.toString.call(new Promise(() => {}))           // [object Promise]
   * Object.prototype.toString.call((function*(){})())               // [object Generator]
   * Object.prototype.toString.call(function* (){})                  // [object GeneratorFunction]
   * Object.prototype.toString.call(async () => {})                  // [object AsyncFunction]
   */
  Promise = 'Promise',
  Generator = 'Generator',
  GeneratorFunction = 'GeneratorFunction',
  AsyncFunction = 'AsyncFunction',

  /**
   * Reflection
   */
  Reflect = 'Reflect',
  Proxy = 'Proxy',

  /**
   * Internationalization
   *
   * Object.prototype.toString.call(new Intl.ListFormat())               // [object Intl.ListFormat]
   * Object.prototype.toString.call(new Intl.RelativeTimeFormat())       // [object Intl.RelativeTimeFormat]
   * Object.prototype.toString.call(new Intl.Locale('zh'))               // [object Intl.Locale]
   */
  Intl = 'Intl',
  'Intl.Collator' = 'Intl.Collator',
  'Intl.DateTimeFormat' = 'Intl.DateTimeFormat',
  'Intl.ListFormat' = 'Intl.ListFormat',
  'Intl.NumberFormat' = 'Intl.NumberFormat',
  'Intl.PluralRules' = 'Intl.PluralRules',
  'Intl.RelativeTimeFormat' = 'Intl.RelativeTimeFormat',
  'Intl.Locale' = 'Intl.Locale',

  /**
   * WebAssembly
   *
   * Object.prototype.toString.call(WebAssembly)               // [object WebAssembly]
   */
  WebAssembly = 'WebAssembly',
  'WebAssembly.Module' = 'WebAssembly.Module',
  'WebAssembly.Instance' = 'WebAssembly.Instance',
  'WebAssembly.Memory' = 'WebAssembly.Memory',
  'WebAssembly.Table' = 'WebAssembly.Table',
  'WebAssembly.CompileError' = 'WebAssembly.CompileError',
  'WebAssembly.LinkError (en-US)' = 'WebAssembly.LinkError (en-US)',
  'WebAssembly.RuntimeError' = 'WebAssembly.RuntimeError',

  /**
   * Other
   */
  Arguments = 'Arguments'
}
