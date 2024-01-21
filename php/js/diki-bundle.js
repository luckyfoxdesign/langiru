var __extends = this && this.__extends || function() {
var extendStatics = function(d, b) {
extendStatics = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(d, b) {
d.__proto__ = b;
} || function(d, b) {
for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
};
return extendStatics(d, b);
};
return function(d, b) {
extendStatics(d, b);
function __() {
this.constructor = d;
}
d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
}();

/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.4+314e4831
 */
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.4+314e4831
 */
(function(global, factory) {
typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global.ES6Promise = factory();
})(this, function() {
"use strict";
function objectOrFunction(x) {
var type = typeof x;
return x !== null && (type === "object" || type === "function");
}
function isFunction(x) {
return typeof x === "function";
}
var _isArray = void 0;
if (Array.isArray) {
_isArray = Array.isArray;
} else {
_isArray = function(x) {
return Object.prototype.toString.call(x) === "[object Array]";
};
}
var isArray = _isArray;
var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;
var asap = function asap(callback, arg) {
queue[len] = callback;
queue[len + 1] = arg;
len += 2;
if (len === 2) {
if (customSchedulerFn) {
customSchedulerFn(flush);
} else {
scheduleFlush();
}
}
};
function setScheduler(scheduleFn) {
customSchedulerFn = scheduleFn;
}
function setAsap(asapFn) {
asap = asapFn;
}
var browserWindow = typeof window !== "undefined" ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === "undefined" && typeof process !== "undefined" && {}.toString.call(process) === "[object process]";
var isWorker = typeof Uint8ClampedArray !== "undefined" && typeof importScripts !== "undefined" && typeof MessageChannel !== "undefined";
function useNextTick() {
return function() {
return process.nextTick(flush);
};
}
function useVertxTimer() {
if (typeof vertxNext !== "undefined") {
return function() {
vertxNext(flush);
};
}
return useSetTimeout();
}
function useMutationObserver() {
var iterations = 0;
var observer = new BrowserMutationObserver(flush);
var node = document.createTextNode("");
observer.observe(node, {
characterData: true
});
return function() {
node.data = iterations = ++iterations % 2;
};
}
function useMessageChannel() {
var channel = new MessageChannel();
channel.port1.onmessage = flush;
return function() {
return channel.port2.postMessage(0);
};
}
function useSetTimeout() {
var globalSetTimeout = setTimeout;
return function() {
return globalSetTimeout(flush, 1);
};
}
var queue = new Array(1e3);
function flush() {
for (var i = 0; i < len; i += 2) {
var callback = queue[i];
var arg = queue[i + 1];
callback(arg);
queue[i] = undefined;
queue[i + 1] = undefined;
}
len = 0;
}
function attemptVertx() {
try {
var vertx = Function("return this")().require("vertx");
vertxNext = vertx.runOnLoop || vertx.runOnContext;
return useVertxTimer();
} catch (e) {
return useSetTimeout();
}
}
var scheduleFlush = void 0;
if (isNode) {
scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
scheduleFlush = useMutationObserver();
} else if (isWorker) {
scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === "function") {
scheduleFlush = attemptVertx();
} else {
scheduleFlush = useSetTimeout();
}
function then(onFulfillment, onRejection) {
var parent = this;
var child = new this.constructor(noop);
if (child[PROMISE_ID] === undefined) {
makePromise(child);
}
var _state = parent._state;
if (_state) {
var callback = arguments[_state - 1];
asap(function() {
return invokeCallback(_state, child, callback, parent._result);
});
} else {
subscribe(parent, child, onFulfillment, onRejection);
}
return child;
}
function resolve$1(object) {
var Constructor = this;
if (object && typeof object === "object" && object.constructor === Constructor) {
return object;
}
var promise = new Constructor(noop);
resolve(promise, object);
return promise;
}
var PROMISE_ID = Math.random().toString(36).substring(2);
function noop() {}
var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;
var TRY_CATCH_ERROR = {
error: null
};
function selfFulfillment() {
return new TypeError("You cannot resolve a promise with itself");
}
function cannotReturnOwn() {
return new TypeError("A promises callback cannot return that same promise.");
}
function getThen(promise) {
try {
return promise.then;
} catch (error) {
TRY_CATCH_ERROR.error = error;
return TRY_CATCH_ERROR;
}
}
function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
try {
then$$1.call(value, fulfillmentHandler, rejectionHandler);
} catch (e) {
return e;
}
}
function handleForeignThenable(promise, thenable, then$$1) {
asap(function(promise) {
var sealed = false;
var error = tryThen(then$$1, thenable, function(value) {
if (sealed) {
return;
}
sealed = true;
if (thenable !== value) {
resolve(promise, value);
} else {
fulfill(promise, value);
}
}, function(reason) {
if (sealed) {
return;
}
sealed = true;
reject(promise, reason);
}, "Settle: " + (promise._label || " unknown promise"));
if (!sealed && error) {
sealed = true;
reject(promise, error);
}
}, promise);
}
function handleOwnThenable(promise, thenable) {
if (thenable._state === FULFILLED) {
fulfill(promise, thenable._result);
} else if (thenable._state === REJECTED) {
reject(promise, thenable._result);
} else {
subscribe(thenable, undefined, function(value) {
return resolve(promise, value);
}, function(reason) {
return reject(promise, reason);
});
}
}
function handleMaybeThenable(promise, maybeThenable, then$$1) {
if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
handleOwnThenable(promise, maybeThenable);
} else {
if (then$$1 === TRY_CATCH_ERROR) {
reject(promise, TRY_CATCH_ERROR.error);
TRY_CATCH_ERROR.error = null;
} else if (then$$1 === undefined) {
fulfill(promise, maybeThenable);
} else if (isFunction(then$$1)) {
handleForeignThenable(promise, maybeThenable, then$$1);
} else {
fulfill(promise, maybeThenable);
}
}
}
function resolve(promise, value) {
if (promise === value) {
reject(promise, selfFulfillment());
} else if (objectOrFunction(value)) {
handleMaybeThenable(promise, value, getThen(value));
} else {
fulfill(promise, value);
}
}
function publishRejection(promise) {
if (promise._onerror) {
promise._onerror(promise._result);
}
publish(promise);
}
function fulfill(promise, value) {
if (promise._state !== PENDING) {
return;
}
promise._result = value;
promise._state = FULFILLED;
if (promise._subscribers.length !== 0) {
asap(publish, promise);
}
}
function reject(promise, reason) {
if (promise._state !== PENDING) {
return;
}
promise._state = REJECTED;
promise._result = reason;
asap(publishRejection, promise);
}
function subscribe(parent, child, onFulfillment, onRejection) {
var _subscribers = parent._subscribers;
var length = _subscribers.length;
parent._onerror = null;
_subscribers[length] = child;
_subscribers[length + FULFILLED] = onFulfillment;
_subscribers[length + REJECTED] = onRejection;
if (length === 0 && parent._state) {
asap(publish, parent);
}
}
function publish(promise) {
var subscribers = promise._subscribers;
var settled = promise._state;
if (subscribers.length === 0) {
return;
}
var child = void 0, callback = void 0, detail = promise._result;
for (var i = 0; i < subscribers.length; i += 3) {
child = subscribers[i];
callback = subscribers[i + settled];
if (child) {
invokeCallback(settled, child, callback, detail);
} else {
callback(detail);
}
}
promise._subscribers.length = 0;
}
function tryCatch(callback, detail) {
try {
return callback(detail);
} catch (e) {
TRY_CATCH_ERROR.error = e;
return TRY_CATCH_ERROR;
}
}
function invokeCallback(settled, promise, callback, detail) {
var hasCallback = isFunction(callback), value = void 0, error = void 0, succeeded = void 0, failed = void 0;
if (hasCallback) {
value = tryCatch(callback, detail);
if (value === TRY_CATCH_ERROR) {
failed = true;
error = value.error;
value.error = null;
} else {
succeeded = true;
}
if (promise === value) {
reject(promise, cannotReturnOwn());
return;
}
} else {
value = detail;
succeeded = true;
}
if (promise._state !== PENDING) {} else if (hasCallback && succeeded) {
resolve(promise, value);
} else if (failed) {
reject(promise, error);
} else if (settled === FULFILLED) {
fulfill(promise, value);
} else if (settled === REJECTED) {
reject(promise, value);
}
}
function initializePromise(promise, resolver) {
try {
resolver(function resolvePromise(value) {
resolve(promise, value);
}, function rejectPromise(reason) {
reject(promise, reason);
});
} catch (e) {
reject(promise, e);
}
}
var id = 0;
function nextId() {
return id++;
}
function makePromise(promise) {
promise[PROMISE_ID] = id++;
promise._state = undefined;
promise._result = undefined;
promise._subscribers = [];
}
function validationError() {
return new Error("Array Methods must be provided an Array");
}
var Enumerator = function() {
function Enumerator(Constructor, input) {
this._instanceConstructor = Constructor;
this.promise = new Constructor(noop);
if (!this.promise[PROMISE_ID]) {
makePromise(this.promise);
}
if (isArray(input)) {
this.length = input.length;
this._remaining = input.length;
this._result = new Array(this.length);
if (this.length === 0) {
fulfill(this.promise, this._result);
} else {
this.length = this.length || 0;
this._enumerate(input);
if (this._remaining === 0) {
fulfill(this.promise, this._result);
}
}
} else {
reject(this.promise, validationError());
}
}
Enumerator.prototype._enumerate = function _enumerate(input) {
for (var i = 0; this._state === PENDING && i < input.length; i++) {
this._eachEntry(input[i], i);
}
};
Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
var c = this._instanceConstructor;
var resolve$$1 = c.resolve;
if (resolve$$1 === resolve$1) {
var _then = getThen(entry);
if (_then === then && entry._state !== PENDING) {
this._settledAt(entry._state, i, entry._result);
} else if (typeof _then !== "function") {
this._remaining--;
this._result[i] = entry;
} else if (c === Promise$2) {
var promise = new c(noop);
handleMaybeThenable(promise, entry, _then);
this._willSettleAt(promise, i);
} else {
this._willSettleAt(new c(function(resolve$$1) {
return resolve$$1(entry);
}), i);
}
} else {
this._willSettleAt(resolve$$1(entry), i);
}
};
Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
var promise = this.promise;
if (promise._state === PENDING) {
this._remaining--;
if (state === REJECTED) {
reject(promise, value);
} else {
this._result[i] = value;
}
}
if (this._remaining === 0) {
fulfill(promise, this._result);
}
};
Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
var enumerator = this;
subscribe(promise, undefined, function(value) {
return enumerator._settledAt(FULFILLED, i, value);
}, function(reason) {
return enumerator._settledAt(REJECTED, i, reason);
});
};
return Enumerator;
}();
function all(entries) {
return new Enumerator(this, entries).promise;
}
function race(entries) {
var Constructor = this;
if (!isArray(entries)) {
return new Constructor(function(_, reject) {
return reject(new TypeError("You must pass an array to race."));
});
} else {
return new Constructor(function(resolve, reject) {
var length = entries.length;
for (var i = 0; i < length; i++) {
Constructor.resolve(entries[i]).then(resolve, reject);
}
});
}
}
function reject$1(reason) {
var Constructor = this;
var promise = new Constructor(noop);
reject(promise, reason);
return promise;
}
function needsResolver() {
throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");
}
function needsNew() {
throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}
var Promise$2 = function() {
function Promise(resolver) {
this[PROMISE_ID] = nextId();
this._result = this._state = undefined;
this._subscribers = [];
if (noop !== resolver) {
typeof resolver !== "function" && needsResolver();
this instanceof Promise ? initializePromise(this, resolver) : needsNew();
}
}
Promise.prototype.catch = function _catch(onRejection) {
return this.then(null, onRejection);
};
Promise.prototype.finally = function _finally(callback) {
var promise = this;
var constructor = promise.constructor;
return promise.then(function(value) {
return constructor.resolve(callback()).then(function() {
return value;
});
}, function(reason) {
return constructor.resolve(callback()).then(function() {
throw reason;
});
});
};
return Promise;
}();
Promise$2.prototype.then = then;
Promise$2.all = all;
Promise$2.race = race;
Promise$2.resolve = resolve$1;
Promise$2.reject = reject$1;
Promise$2._setScheduler = setScheduler;
Promise$2._setAsap = setAsap;
Promise$2._asap = asap;
function polyfill() {
var local = void 0;
if (typeof global !== "undefined") {
local = global;
} else if (typeof self !== "undefined") {
local = self;
} else {
try {
local = Function("return this")();
} catch (e) {
throw new Error("polyfill failed because global object is unavailable in this environment");
}
}
var P = local.Promise;
if (P) {
var promiseToString = null;
try {
promiseToString = Object.prototype.toString.call(P.resolve());
} catch (e) {}
if (promiseToString === "[object Promise]" && !P.cast) {
return;
}
}
local.Promise = Promise$2;
}
Promise$2.polyfill = polyfill;
Promise$2.Promise = Promise$2;
Promise$2.polyfill();
return Promise$2;
});

/*! jQuery v3.4.1 | (c) JS Foundation and other contributors | jquery.org/license */ !function(e, t) {
"use strict";
"object" == typeof module && "object" == typeof module.exports ? module.exports = e.document ? t(e, !0) : function(e) {
if (!e.document) throw new Error("jQuery requires a window with a document");
return t(e);
} : t(e);
}("undefined" != typeof window ? window : this, function(C, e) {
"use strict";
var t = [], E = C.document, r = Object.getPrototypeOf, s = t.slice, g = t.concat, u = t.push, i = t.indexOf, n = {}, o = n.toString, v = n.hasOwnProperty, a = v.toString, l = a.call(Object), y = {}, m = function(e) {
return "function" == typeof e && "number" != typeof e.nodeType;
}, x = function(e) {
return null != e && e === e.window;
}, c = {
type: !0,
src: !0,
nonce: !0,
noModule: !0
};
function b(e, t, n) {
var r, i, o = (n = n || E).createElement("script");
if (o.text = e, t) for (r in c) (i = t[r] || t.getAttribute && t.getAttribute(r)) && o.setAttribute(r, i);
n.head.appendChild(o).parentNode.removeChild(o);
}
function w(e) {
return null == e ? e + "" : "object" == typeof e || "function" == typeof e ? n[o.call(e)] || "object" : typeof e;
}
var f = "3.4.1", k = function(e, t) {
return new k.fn.init(e, t);
}, p = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
function d(e) {
var t = !!e && "length" in e && e.length, n = w(e);
return !m(e) && !x(e) && ("array" === n || 0 === t || "number" == typeof t && 0 < t && t - 1 in e);
}
k.fn = k.prototype = {
jquery: f,
constructor: k,
length: 0,
toArray: function() {
return s.call(this);
},
get: function(e) {
return null == e ? s.call(this) : e < 0 ? this[e + this.length] : this[e];
},
pushStack: function(e) {
var t = k.merge(this.constructor(), e);
return t.prevObject = this, t;
},
each: function(e) {
return k.each(this, e);
},
map: function(n) {
return this.pushStack(k.map(this, function(e, t) {
return n.call(e, t, e);
}));
},
slice: function() {
return this.pushStack(s.apply(this, arguments));
},
first: function() {
return this.eq(0);
},
last: function() {
return this.eq(-1);
},
eq: function(e) {
var t = this.length, n = +e + (e < 0 ? t : 0);
return this.pushStack(0 <= n && n < t ? [ this[n] ] : []);
},
end: function() {
return this.prevObject || this.constructor();
},
push: u,
sort: t.sort,
splice: t.splice
}, k.extend = k.fn.extend = function() {
var e, t, n, r, i, o, a = arguments[0] || {}, s = 1, u = arguments.length, l = !1;
for ("boolean" == typeof a && (l = a, a = arguments[s] || {}, s++), "object" == typeof a || m(a) || (a = {}), 
s === u && (a = this, s--); s < u; s++) if (null != (e = arguments[s])) for (t in e) r = e[t], 
"__proto__" !== t && a !== r && (l && r && (k.isPlainObject(r) || (i = Array.isArray(r))) ? (n = a[t], 
o = i && !Array.isArray(n) ? [] : i || k.isPlainObject(n) ? n : {}, i = !1, a[t] = k.extend(l, o, r)) : void 0 !== r && (a[t] = r));
return a;
}, k.extend({
expando: "jQuery" + (f + Math.random()).replace(/\D/g, ""),
isReady: !0,
error: function(e) {
throw new Error(e);
},
noop: function() {},
isPlainObject: function(e) {
var t, n;
return !(!e || "[object Object]" !== o.call(e)) && (!(t = r(e)) || "function" == typeof (n = v.call(t, "constructor") && t.constructor) && a.call(n) === l);
},
isEmptyObject: function(e) {
var t;
for (t in e) return !1;
return !0;
},
globalEval: function(e, t) {
b(e, {
nonce: t && t.nonce
});
},
each: function(e, t) {
var n, r = 0;
if (d(e)) {
for (n = e.length; r < n; r++) if (!1 === t.call(e[r], r, e[r])) break;
} else for (r in e) if (!1 === t.call(e[r], r, e[r])) break;
return e;
},
trim: function(e) {
return null == e ? "" : (e + "").replace(p, "");
},
makeArray: function(e, t) {
var n = t || [];
return null != e && (d(Object(e)) ? k.merge(n, "string" == typeof e ? [ e ] : e) : u.call(n, e)), 
n;
},
inArray: function(e, t, n) {
return null == t ? -1 : i.call(t, e, n);
},
merge: function(e, t) {
for (var n = +t.length, r = 0, i = e.length; r < n; r++) e[i++] = t[r];
return e.length = i, e;
},
grep: function(e, t, n) {
for (var r = [], i = 0, o = e.length, a = !n; i < o; i++) !t(e[i], i) !== a && r.push(e[i]);
return r;
},
map: function(e, t, n) {
var r, i, o = 0, a = [];
if (d(e)) for (r = e.length; o < r; o++) null != (i = t(e[o], o, n)) && a.push(i); else for (o in e) null != (i = t(e[o], o, n)) && a.push(i);
return g.apply([], a);
},
guid: 1,
support: y
}), "function" == typeof Symbol && (k.fn[Symbol.iterator] = t[Symbol.iterator]), 
k.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(e, t) {
n["[object " + t + "]"] = t.toLowerCase();
});
var h = function(n) {
var e, d, b, o, i, h, f, g, w, u, l, T, C, a, E, v, s, c, y, k = "sizzle" + 1 * new Date(), m = n.document, S = 0, r = 0, p = ue(), x = ue(), N = ue(), A = ue(), D = function(e, t) {
return e === t && (l = !0), 0;
}, j = {}.hasOwnProperty, t = [], q = t.pop, L = t.push, H = t.push, O = t.slice, P = function(e, t) {
for (var n = 0, r = e.length; n < r; n++) if (e[n] === t) return n;
return -1;
}, R = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", M = "[\\x20\\t\\r\\n\\f]", I = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+", W = "\\[" + M + "*(" + I + ")(?:" + M + "*([*^$|!~]?=)" + M + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + I + "))|)" + M + "*\\]", $ = ":(" + I + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + W + ")*)|.*)\\)|)", F = new RegExp(M + "+", "g"), B = new RegExp("^" + M + "+|((?:^|[^\\\\])(?:\\\\.)*)" + M + "+$", "g"), _ = new RegExp("^" + M + "*," + M + "*"), z = new RegExp("^" + M + "*([>+~]|" + M + ")" + M + "*"), U = new RegExp(M + "|>"), X = new RegExp($), V = new RegExp("^" + I + "$"), G = {
ID: new RegExp("^#(" + I + ")"),
CLASS: new RegExp("^\\.(" + I + ")"),
TAG: new RegExp("^(" + I + "|[*])"),
ATTR: new RegExp("^" + W),
PSEUDO: new RegExp("^" + $),
CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + M + "*(even|odd|(([+-]|)(\\d*)n|)" + M + "*(?:([+-]|)" + M + "*(\\d+)|))" + M + "*\\)|)", "i"),
bool: new RegExp("^(?:" + R + ")$", "i"),
needsContext: new RegExp("^" + M + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + M + "*((?:-\\d)?\\d*)" + M + "*\\)|)(?=[^-]|$)", "i")
}, Y = /HTML$/i, Q = /^(?:input|select|textarea|button)$/i, J = /^h\d$/i, K = /^[^{]+\{\s*\[native \w/, Z = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, ee = /[+~]/, te = new RegExp("\\\\([\\da-f]{1,6}" + M + "?|(" + M + ")|.)", "ig"), ne = function(e, t, n) {
var r = "0x" + t - 65536;
return r != r || n ? t : r < 0 ? String.fromCharCode(r + 65536) : String.fromCharCode(r >> 10 | 55296, 1023 & r | 56320);
}, re = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g, ie = function(e, t) {
return t ? "\0" === e ? "�" : e.slice(0, -1) + "\\" + e.charCodeAt(e.length - 1).toString(16) + " " : "\\" + e;
}, oe = function() {
T();
}, ae = be(function(e) {
return !0 === e.disabled && "fieldset" === e.nodeName.toLowerCase();
}, {
dir: "parentNode",
next: "legend"
});
try {
H.apply(t = O.call(m.childNodes), m.childNodes), t[m.childNodes.length].nodeType;
} catch (e) {
H = {
apply: t.length ? function(e, t) {
L.apply(e, O.call(t));
} : function(e, t) {
var n = e.length, r = 0;
while (e[n++] = t[r++]) ;
e.length = n - 1;
}
};
}
function se(t, e, n, r) {
var i, o, a, s, u, l, c, f = e && e.ownerDocument, p = e ? e.nodeType : 9;
if (n = n || [], "string" != typeof t || !t || 1 !== p && 9 !== p && 11 !== p) return n;
if (!r && ((e ? e.ownerDocument || e : m) !== C && T(e), e = e || C, E)) {
if (11 !== p && (u = Z.exec(t))) if (i = u[1]) {
if (9 === p) {
if (!(a = e.getElementById(i))) return n;
if (a.id === i) return n.push(a), n;
} else if (f && (a = f.getElementById(i)) && y(e, a) && a.id === i) return n.push(a), 
n;
} else {
if (u[2]) return H.apply(n, e.getElementsByTagName(t)), n;
if ((i = u[3]) && d.getElementsByClassName && e.getElementsByClassName) return H.apply(n, e.getElementsByClassName(i)), 
n;
}
if (d.qsa && !A[t + " "] && (!v || !v.test(t)) && (1 !== p || "object" !== e.nodeName.toLowerCase())) {
if (c = t, f = e, 1 === p && U.test(t)) {
(s = e.getAttribute("id")) ? s = s.replace(re, ie) : e.setAttribute("id", s = k), 
o = (l = h(t)).length;
while (o--) l[o] = "#" + s + " " + xe(l[o]);
c = l.join(","), f = ee.test(t) && ye(e.parentNode) || e;
}
try {
return H.apply(n, f.querySelectorAll(c)), n;
} catch (e) {
A(t, !0);
} finally {
s === k && e.removeAttribute("id");
}
}
}
return g(t.replace(B, "$1"), e, n, r);
}
function ue() {
var r = [];
return function e(t, n) {
return r.push(t + " ") > b.cacheLength && delete e[r.shift()], e[t + " "] = n;
};
}
function le(e) {
return e[k] = !0, e;
}
function ce(e) {
var t = C.createElement("fieldset");
try {
return !!e(t);
} catch (e) {
return !1;
} finally {
t.parentNode && t.parentNode.removeChild(t), t = null;
}
}
function fe(e, t) {
var n = e.split("|"), r = n.length;
while (r--) b.attrHandle[n[r]] = t;
}
function pe(e, t) {
var n = t && e, r = n && 1 === e.nodeType && 1 === t.nodeType && e.sourceIndex - t.sourceIndex;
if (r) return r;
if (n) while (n = n.nextSibling) if (n === t) return -1;
return e ? 1 : -1;
}
function de(t) {
return function(e) {
return "input" === e.nodeName.toLowerCase() && e.type === t;
};
}
function he(n) {
return function(e) {
var t = e.nodeName.toLowerCase();
return ("input" === t || "button" === t) && e.type === n;
};
}
function ge(t) {
return function(e) {
return "form" in e ? e.parentNode && !1 === e.disabled ? "label" in e ? "label" in e.parentNode ? e.parentNode.disabled === t : e.disabled === t : e.isDisabled === t || e.isDisabled !== !t && ae(e) === t : e.disabled === t : "label" in e && e.disabled === t;
};
}
function ve(a) {
return le(function(o) {
return o = +o, le(function(e, t) {
var n, r = a([], e.length, o), i = r.length;
while (i--) e[n = r[i]] && (e[n] = !(t[n] = e[n]));
});
});
}
function ye(e) {
return e && "undefined" != typeof e.getElementsByTagName && e;
}
for (e in d = se.support = {}, i = se.isXML = function(e) {
var t = e.namespaceURI, n = (e.ownerDocument || e).documentElement;
return !Y.test(t || n && n.nodeName || "HTML");
}, T = se.setDocument = function(e) {
var t, n, r = e ? e.ownerDocument || e : m;
return r !== C && 9 === r.nodeType && r.documentElement && (a = (C = r).documentElement, 
E = !i(C), m !== C && (n = C.defaultView) && n.top !== n && (n.addEventListener ? n.addEventListener("unload", oe, !1) : n.attachEvent && n.attachEvent("onunload", oe)), 
d.attributes = ce(function(e) {
return e.className = "i", !e.getAttribute("className");
}), d.getElementsByTagName = ce(function(e) {
return e.appendChild(C.createComment("")), !e.getElementsByTagName("*").length;
}), d.getElementsByClassName = K.test(C.getElementsByClassName), d.getById = ce(function(e) {
return a.appendChild(e).id = k, !C.getElementsByName || !C.getElementsByName(k).length;
}), d.getById ? (b.filter.ID = function(e) {
var t = e.replace(te, ne);
return function(e) {
return e.getAttribute("id") === t;
};
}, b.find.ID = function(e, t) {
if ("undefined" != typeof t.getElementById && E) {
var n = t.getElementById(e);
return n ? [ n ] : [];
}
}) : (b.filter.ID = function(e) {
var n = e.replace(te, ne);
return function(e) {
var t = "undefined" != typeof e.getAttributeNode && e.getAttributeNode("id");
return t && t.value === n;
};
}, b.find.ID = function(e, t) {
if ("undefined" != typeof t.getElementById && E) {
var n, r, i, o = t.getElementById(e);
if (o) {
if ((n = o.getAttributeNode("id")) && n.value === e) return [ o ];
i = t.getElementsByName(e), r = 0;
while (o = i[r++]) if ((n = o.getAttributeNode("id")) && n.value === e) return [ o ];
}
return [];
}
}), b.find.TAG = d.getElementsByTagName ? function(e, t) {
return "undefined" != typeof t.getElementsByTagName ? t.getElementsByTagName(e) : d.qsa ? t.querySelectorAll(e) : void 0;
} : function(e, t) {
var n, r = [], i = 0, o = t.getElementsByTagName(e);
if ("*" === e) {
while (n = o[i++]) 1 === n.nodeType && r.push(n);
return r;
}
return o;
}, b.find.CLASS = d.getElementsByClassName && function(e, t) {
if ("undefined" != typeof t.getElementsByClassName && E) return t.getElementsByClassName(e);
}, s = [], v = [], (d.qsa = K.test(C.querySelectorAll)) && (ce(function(e) {
a.appendChild(e).innerHTML = "<a id='" + k + "'></a><select id='" + k + "-\r\\' msallowcapture=''><option selected=''></option></select>", 
e.querySelectorAll("[msallowcapture^='']").length && v.push("[*^$]=" + M + "*(?:''|\"\")"), 
e.querySelectorAll("[selected]").length || v.push("\\[" + M + "*(?:value|" + R + ")"), 
e.querySelectorAll("[id~=" + k + "-]").length || v.push("~="), e.querySelectorAll(":checked").length || v.push(":checked"), 
e.querySelectorAll("a#" + k + "+*").length || v.push(".#.+[+~]");
}), ce(function(e) {
e.innerHTML = "<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";
var t = C.createElement("input");
t.setAttribute("type", "hidden"), e.appendChild(t).setAttribute("name", "D"), e.querySelectorAll("[name=d]").length && v.push("name" + M + "*[*^$|!~]?="), 
2 !== e.querySelectorAll(":enabled").length && v.push(":enabled", ":disabled"), 
a.appendChild(e).disabled = !0, 2 !== e.querySelectorAll(":disabled").length && v.push(":enabled", ":disabled"), 
e.querySelectorAll("*,:x"), v.push(",.*:");
})), (d.matchesSelector = K.test(c = a.matches || a.webkitMatchesSelector || a.mozMatchesSelector || a.oMatchesSelector || a.msMatchesSelector)) && ce(function(e) {
d.disconnectedMatch = c.call(e, "*"), c.call(e, "[s!='']:x"), s.push("!=", $);
}), v = v.length && new RegExp(v.join("|")), s = s.length && new RegExp(s.join("|")), 
t = K.test(a.compareDocumentPosition), y = t || K.test(a.contains) ? function(e, t) {
var n = 9 === e.nodeType ? e.documentElement : e, r = t && t.parentNode;
return e === r || !(!r || 1 !== r.nodeType || !(n.contains ? n.contains(r) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(r)));
} : function(e, t) {
if (t) while (t = t.parentNode) if (t === e) return !0;
return !1;
}, D = t ? function(e, t) {
if (e === t) return l = !0, 0;
var n = !e.compareDocumentPosition - !t.compareDocumentPosition;
return n || (1 & (n = (e.ownerDocument || e) === (t.ownerDocument || t) ? e.compareDocumentPosition(t) : 1) || !d.sortDetached && t.compareDocumentPosition(e) === n ? e === C || e.ownerDocument === m && y(m, e) ? -1 : t === C || t.ownerDocument === m && y(m, t) ? 1 : u ? P(u, e) - P(u, t) : 0 : 4 & n ? -1 : 1);
} : function(e, t) {
if (e === t) return l = !0, 0;
var n, r = 0, i = e.parentNode, o = t.parentNode, a = [ e ], s = [ t ];
if (!i || !o) return e === C ? -1 : t === C ? 1 : i ? -1 : o ? 1 : u ? P(u, e) - P(u, t) : 0;
if (i === o) return pe(e, t);
n = e;
while (n = n.parentNode) a.unshift(n);
n = t;
while (n = n.parentNode) s.unshift(n);
while (a[r] === s[r]) r++;
return r ? pe(a[r], s[r]) : a[r] === m ? -1 : s[r] === m ? 1 : 0;
}), C;
}, se.matches = function(e, t) {
return se(e, null, null, t);
}, se.matchesSelector = function(e, t) {
if ((e.ownerDocument || e) !== C && T(e), d.matchesSelector && E && !A[t + " "] && (!s || !s.test(t)) && (!v || !v.test(t))) try {
var n = c.call(e, t);
if (n || d.disconnectedMatch || e.document && 11 !== e.document.nodeType) return n;
} catch (e) {
A(t, !0);
}
return 0 < se(t, C, null, [ e ]).length;
}, se.contains = function(e, t) {
return (e.ownerDocument || e) !== C && T(e), y(e, t);
}, se.attr = function(e, t) {
(e.ownerDocument || e) !== C && T(e);
var n = b.attrHandle[t.toLowerCase()], r = n && j.call(b.attrHandle, t.toLowerCase()) ? n(e, t, !E) : void 0;
return void 0 !== r ? r : d.attributes || !E ? e.getAttribute(t) : (r = e.getAttributeNode(t)) && r.specified ? r.value : null;
}, se.escape = function(e) {
return (e + "").replace(re, ie);
}, se.error = function(e) {
throw new Error("Syntax error, unrecognized expression: " + e);
}, se.uniqueSort = function(e) {
var t, n = [], r = 0, i = 0;
if (l = !d.detectDuplicates, u = !d.sortStable && e.slice(0), e.sort(D), l) {
while (t = e[i++]) t === e[i] && (r = n.push(i));
while (r--) e.splice(n[r], 1);
}
return u = null, e;
}, o = se.getText = function(e) {
var t, n = "", r = 0, i = e.nodeType;
if (i) {
if (1 === i || 9 === i || 11 === i) {
if ("string" == typeof e.textContent) return e.textContent;
for (e = e.firstChild; e; e = e.nextSibling) n += o(e);
} else if (3 === i || 4 === i) return e.nodeValue;
} else while (t = e[r++]) n += o(t);
return n;
}, (b = se.selectors = {
cacheLength: 50,
createPseudo: le,
match: G,
attrHandle: {},
find: {},
relative: {
">": {
dir: "parentNode",
first: !0
},
" ": {
dir: "parentNode"
},
"+": {
dir: "previousSibling",
first: !0
},
"~": {
dir: "previousSibling"
}
},
preFilter: {
ATTR: function(e) {
return e[1] = e[1].replace(te, ne), e[3] = (e[3] || e[4] || e[5] || "").replace(te, ne), 
"~=" === e[2] && (e[3] = " " + e[3] + " "), e.slice(0, 4);
},
CHILD: function(e) {
return e[1] = e[1].toLowerCase(), "nth" === e[1].slice(0, 3) ? (e[3] || se.error(e[0]), 
e[4] = +(e[4] ? e[5] + (e[6] || 1) : 2 * ("even" === e[3] || "odd" === e[3])), e[5] = +(e[7] + e[8] || "odd" === e[3])) : e[3] && se.error(e[0]), 
e;
},
PSEUDO: function(e) {
var t, n = !e[6] && e[2];
return G.CHILD.test(e[0]) ? null : (e[3] ? e[2] = e[4] || e[5] || "" : n && X.test(n) && (t = h(n, !0)) && (t = n.indexOf(")", n.length - t) - n.length) && (e[0] = e[0].slice(0, t), 
e[2] = n.slice(0, t)), e.slice(0, 3));
}
},
filter: {
TAG: function(e) {
var t = e.replace(te, ne).toLowerCase();
return "*" === e ? function() {
return !0;
} : function(e) {
return e.nodeName && e.nodeName.toLowerCase() === t;
};
},
CLASS: function(e) {
var t = p[e + " "];
return t || (t = new RegExp("(^|" + M + ")" + e + "(" + M + "|$)")) && p(e, function(e) {
return t.test("string" == typeof e.className && e.className || "undefined" != typeof e.getAttribute && e.getAttribute("class") || "");
});
},
ATTR: function(n, r, i) {
return function(e) {
var t = se.attr(e, n);
return null == t ? "!=" === r : !r || (t += "", "=" === r ? t === i : "!=" === r ? t !== i : "^=" === r ? i && 0 === t.indexOf(i) : "*=" === r ? i && -1 < t.indexOf(i) : "$=" === r ? i && t.slice(-i.length) === i : "~=" === r ? -1 < (" " + t.replace(F, " ") + " ").indexOf(i) : "|=" === r && (t === i || t.slice(0, i.length + 1) === i + "-"));
};
},
CHILD: function(h, e, t, g, v) {
var y = "nth" !== h.slice(0, 3), m = "last" !== h.slice(-4), x = "of-type" === e;
return 1 === g && 0 === v ? function(e) {
return !!e.parentNode;
} : function(e, t, n) {
var r, i, o, a, s, u, l = y !== m ? "nextSibling" : "previousSibling", c = e.parentNode, f = x && e.nodeName.toLowerCase(), p = !n && !x, d = !1;
if (c) {
if (y) {
while (l) {
a = e;
while (a = a[l]) if (x ? a.nodeName.toLowerCase() === f : 1 === a.nodeType) return !1;
u = l = "only" === h && !u && "nextSibling";
}
return !0;
}
if (u = [ m ? c.firstChild : c.lastChild ], m && p) {
d = (s = (r = (i = (o = (a = c)[k] || (a[k] = {}))[a.uniqueID] || (o[a.uniqueID] = {}))[h] || [])[0] === S && r[1]) && r[2], 
a = s && c.childNodes[s];
while (a = ++s && a && a[l] || (d = s = 0) || u.pop()) if (1 === a.nodeType && ++d && a === e) {
i[h] = [ S, s, d ];
break;
}
} else if (p && (d = s = (r = (i = (o = (a = e)[k] || (a[k] = {}))[a.uniqueID] || (o[a.uniqueID] = {}))[h] || [])[0] === S && r[1]), 
!1 === d) while (a = ++s && a && a[l] || (d = s = 0) || u.pop()) if ((x ? a.nodeName.toLowerCase() === f : 1 === a.nodeType) && ++d && (p && ((i = (o = a[k] || (a[k] = {}))[a.uniqueID] || (o[a.uniqueID] = {}))[h] = [ S, d ]), 
a === e)) break;
return (d -= v) === g || d % g == 0 && 0 <= d / g;
}
};
},
PSEUDO: function(e, o) {
var t, a = b.pseudos[e] || b.setFilters[e.toLowerCase()] || se.error("unsupported pseudo: " + e);
return a[k] ? a(o) : 1 < a.length ? (t = [ e, e, "", o ], b.setFilters.hasOwnProperty(e.toLowerCase()) ? le(function(e, t) {
var n, r = a(e, o), i = r.length;
while (i--) e[n = P(e, r[i])] = !(t[n] = r[i]);
}) : function(e) {
return a(e, 0, t);
}) : a;
}
},
pseudos: {
not: le(function(e) {
var r = [], i = [], s = f(e.replace(B, "$1"));
return s[k] ? le(function(e, t, n, r) {
var i, o = s(e, null, r, []), a = e.length;
while (a--) (i = o[a]) && (e[a] = !(t[a] = i));
}) : function(e, t, n) {
return r[0] = e, s(r, null, n, i), r[0] = null, !i.pop();
};
}),
has: le(function(t) {
return function(e) {
return 0 < se(t, e).length;
};
}),
contains: le(function(t) {
return t = t.replace(te, ne), function(e) {
return -1 < (e.textContent || o(e)).indexOf(t);
};
}),
lang: le(function(n) {
return V.test(n || "") || se.error("unsupported lang: " + n), n = n.replace(te, ne).toLowerCase(), 
function(e) {
var t;
do {
if (t = E ? e.lang : e.getAttribute("xml:lang") || e.getAttribute("lang")) return (t = t.toLowerCase()) === n || 0 === t.indexOf(n + "-");
} while ((e = e.parentNode) && 1 === e.nodeType);
return !1;
};
}),
target: function(e) {
var t = n.location && n.location.hash;
return t && t.slice(1) === e.id;
},
root: function(e) {
return e === a;
},
focus: function(e) {
return e === C.activeElement && (!C.hasFocus || C.hasFocus()) && !!(e.type || e.href || ~e.tabIndex);
},
enabled: ge(!1),
disabled: ge(!0),
checked: function(e) {
var t = e.nodeName.toLowerCase();
return "input" === t && !!e.checked || "option" === t && !!e.selected;
},
selected: function(e) {
return e.parentNode && e.parentNode.selectedIndex, !0 === e.selected;
},
empty: function(e) {
for (e = e.firstChild; e; e = e.nextSibling) if (e.nodeType < 6) return !1;
return !0;
},
parent: function(e) {
return !b.pseudos.empty(e);
},
header: function(e) {
return J.test(e.nodeName);
},
input: function(e) {
return Q.test(e.nodeName);
},
button: function(e) {
var t = e.nodeName.toLowerCase();
return "input" === t && "button" === e.type || "button" === t;
},
text: function(e) {
var t;
return "input" === e.nodeName.toLowerCase() && "text" === e.type && (null == (t = e.getAttribute("type")) || "text" === t.toLowerCase());
},
first: ve(function() {
return [ 0 ];
}),
last: ve(function(e, t) {
return [ t - 1 ];
}),
eq: ve(function(e, t, n) {
return [ n < 0 ? n + t : n ];
}),
even: ve(function(e, t) {
for (var n = 0; n < t; n += 2) e.push(n);
return e;
}),
odd: ve(function(e, t) {
for (var n = 1; n < t; n += 2) e.push(n);
return e;
}),
lt: ve(function(e, t, n) {
for (var r = n < 0 ? n + t : t < n ? t : n; 0 <= --r; ) e.push(r);
return e;
}),
gt: ve(function(e, t, n) {
for (var r = n < 0 ? n + t : n; ++r < t; ) e.push(r);
return e;
})
}
}).pseudos.nth = b.pseudos.eq, {
radio: !0,
checkbox: !0,
file: !0,
password: !0,
image: !0
}) b.pseudos[e] = de(e);
for (e in {
submit: !0,
reset: !0
}) b.pseudos[e] = he(e);
function me() {}
function xe(e) {
for (var t = 0, n = e.length, r = ""; t < n; t++) r += e[t].value;
return r;
}
function be(s, e, t) {
var u = e.dir, l = e.next, c = l || u, f = t && "parentNode" === c, p = r++;
return e.first ? function(e, t, n) {
while (e = e[u]) if (1 === e.nodeType || f) return s(e, t, n);
return !1;
} : function(e, t, n) {
var r, i, o, a = [ S, p ];
if (n) {
while (e = e[u]) if ((1 === e.nodeType || f) && s(e, t, n)) return !0;
} else while (e = e[u]) if (1 === e.nodeType || f) if (i = (o = e[k] || (e[k] = {}))[e.uniqueID] || (o[e.uniqueID] = {}), 
l && l === e.nodeName.toLowerCase()) e = e[u] || e; else {
if ((r = i[c]) && r[0] === S && r[1] === p) return a[2] = r[2];
if ((i[c] = a)[2] = s(e, t, n)) return !0;
}
return !1;
};
}
function we(i) {
return 1 < i.length ? function(e, t, n) {
var r = i.length;
while (r--) if (!i[r](e, t, n)) return !1;
return !0;
} : i[0];
}
function Te(e, t, n, r, i) {
for (var o, a = [], s = 0, u = e.length, l = null != t; s < u; s++) (o = e[s]) && (n && !n(o, r, i) || (a.push(o), 
l && t.push(s)));
return a;
}
function Ce(d, h, g, v, y, e) {
return v && !v[k] && (v = Ce(v)), y && !y[k] && (y = Ce(y, e)), le(function(e, t, n, r) {
var i, o, a, s = [], u = [], l = t.length, c = e || function(e, t, n) {
for (var r = 0, i = t.length; r < i; r++) se(e, t[r], n);
return n;
}(h || "*", n.nodeType ? [ n ] : n, []), f = !d || !e && h ? c : Te(c, s, d, n, r), p = g ? y || (e ? d : l || v) ? [] : t : f;
if (g && g(f, p, n, r), v) {
i = Te(p, u), v(i, [], n, r), o = i.length;
while (o--) (a = i[o]) && (p[u[o]] = !(f[u[o]] = a));
}
if (e) {
if (y || d) {
if (y) {
i = [], o = p.length;
while (o--) (a = p[o]) && i.push(f[o] = a);
y(null, p = [], i, r);
}
o = p.length;
while (o--) (a = p[o]) && -1 < (i = y ? P(e, a) : s[o]) && (e[i] = !(t[i] = a));
}
} else p = Te(p === t ? p.splice(l, p.length) : p), y ? y(null, t, p, r) : H.apply(t, p);
});
}
function Ee(e) {
for (var i, t, n, r = e.length, o = b.relative[e[0].type], a = o || b.relative[" "], s = o ? 1 : 0, u = be(function(e) {
return e === i;
}, a, !0), l = be(function(e) {
return -1 < P(i, e);
}, a, !0), c = [ function(e, t, n) {
var r = !o && (n || t !== w) || ((i = t).nodeType ? u(e, t, n) : l(e, t, n));
return i = null, r;
} ]; s < r; s++) if (t = b.relative[e[s].type]) c = [ be(we(c), t) ]; else {
if ((t = b.filter[e[s].type].apply(null, e[s].matches))[k]) {
for (n = ++s; n < r; n++) if (b.relative[e[n].type]) break;
return Ce(1 < s && we(c), 1 < s && xe(e.slice(0, s - 1).concat({
value: " " === e[s - 2].type ? "*" : ""
})).replace(B, "$1"), t, s < n && Ee(e.slice(s, n)), n < r && Ee(e = e.slice(n)), n < r && xe(e));
}
c.push(t);
}
return we(c);
}
return me.prototype = b.filters = b.pseudos, b.setFilters = new me(), h = se.tokenize = function(e, t) {
var n, r, i, o, a, s, u, l = x[e + " "];
if (l) return t ? 0 : l.slice(0);
a = e, s = [], u = b.preFilter;
while (a) {
for (o in n && !(r = _.exec(a)) || (r && (a = a.slice(r[0].length) || a), s.push(i = [])), 
n = !1, (r = z.exec(a)) && (n = r.shift(), i.push({
value: n,
type: r[0].replace(B, " ")
}), a = a.slice(n.length)), b.filter) !(r = G[o].exec(a)) || u[o] && !(r = u[o](r)) || (n = r.shift(), 
i.push({
value: n,
type: o,
matches: r
}), a = a.slice(n.length));
if (!n) break;
}
return t ? a.length : a ? se.error(e) : x(e, s).slice(0);
}, f = se.compile = function(e, t) {
var n, v, y, m, x, r, i = [], o = [], a = N[e + " "];
if (!a) {
t || (t = h(e)), n = t.length;
while (n--) (a = Ee(t[n]))[k] ? i.push(a) : o.push(a);
(a = N(e, (v = o, m = 0 < (y = i).length, x = 0 < v.length, r = function(e, t, n, r, i) {
var o, a, s, u = 0, l = "0", c = e && [], f = [], p = w, d = e || x && b.find.TAG("*", i), h = S += null == p ? 1 : Math.random() || .1, g = d.length;
for (i && (w = t === C || t || i); l !== g && null != (o = d[l]); l++) {
if (x && o) {
a = 0, t || o.ownerDocument === C || (T(o), n = !E);
while (s = v[a++]) if (s(o, t || C, n)) {
r.push(o);
break;
}
i && (S = h);
}
m && ((o = !s && o) && u--, e && c.push(o));
}
if (u += l, m && l !== u) {
a = 0;
while (s = y[a++]) s(c, f, t, n);
if (e) {
if (0 < u) while (l--) c[l] || f[l] || (f[l] = q.call(r));
f = Te(f);
}
H.apply(r, f), i && !e && 0 < f.length && 1 < u + y.length && se.uniqueSort(r);
}
return i && (S = h, w = p), c;
}, m ? le(r) : r))).selector = e;
}
return a;
}, g = se.select = function(e, t, n, r) {
var i, o, a, s, u, l = "function" == typeof e && e, c = !r && h(e = l.selector || e);
if (n = n || [], 1 === c.length) {
if (2 < (o = c[0] = c[0].slice(0)).length && "ID" === (a = o[0]).type && 9 === t.nodeType && E && b.relative[o[1].type]) {
if (!(t = (b.find.ID(a.matches[0].replace(te, ne), t) || [])[0])) return n;
l && (t = t.parentNode), e = e.slice(o.shift().value.length);
}
i = G.needsContext.test(e) ? 0 : o.length;
while (i--) {
if (a = o[i], b.relative[s = a.type]) break;
if ((u = b.find[s]) && (r = u(a.matches[0].replace(te, ne), ee.test(o[0].type) && ye(t.parentNode) || t))) {
if (o.splice(i, 1), !(e = r.length && xe(o))) return H.apply(n, r), n;
break;
}
}
}
return (l || f(e, c))(r, t, !E, n, !t || ee.test(e) && ye(t.parentNode) || t), n;
}, d.sortStable = k.split("").sort(D).join("") === k, d.detectDuplicates = !!l, 
T(), d.sortDetached = ce(function(e) {
return 1 & e.compareDocumentPosition(C.createElement("fieldset"));
}), ce(function(e) {
return e.innerHTML = "<a href='#'></a>", "#" === e.firstChild.getAttribute("href");
}) || fe("type|href|height|width", function(e, t, n) {
if (!n) return e.getAttribute(t, "type" === t.toLowerCase() ? 1 : 2);
}), d.attributes && ce(function(e) {
return e.innerHTML = "<input/>", e.firstChild.setAttribute("value", ""), "" === e.firstChild.getAttribute("value");
}) || fe("value", function(e, t, n) {
if (!n && "input" === e.nodeName.toLowerCase()) return e.defaultValue;
}), ce(function(e) {
return null == e.getAttribute("disabled");
}) || fe(R, function(e, t, n) {
var r;
if (!n) return !0 === e[t] ? t.toLowerCase() : (r = e.getAttributeNode(t)) && r.specified ? r.value : null;
}), se;
}(C);
k.find = h, k.expr = h.selectors, k.expr[":"] = k.expr.pseudos, k.uniqueSort = k.unique = h.uniqueSort, 
k.text = h.getText, k.isXMLDoc = h.isXML, k.contains = h.contains, k.escapeSelector = h.escape;
var T = function(e, t, n) {
var r = [], i = void 0 !== n;
while ((e = e[t]) && 9 !== e.nodeType) if (1 === e.nodeType) {
if (i && k(e).is(n)) break;
r.push(e);
}
return r;
}, S = function(e, t) {
for (var n = []; e; e = e.nextSibling) 1 === e.nodeType && e !== t && n.push(e);
return n;
}, N = k.expr.match.needsContext;
function A(e, t) {
return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase();
}
var D = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
function j(e, n, r) {
return m(n) ? k.grep(e, function(e, t) {
return !!n.call(e, t, e) !== r;
}) : n.nodeType ? k.grep(e, function(e) {
return e === n !== r;
}) : "string" != typeof n ? k.grep(e, function(e) {
return -1 < i.call(n, e) !== r;
}) : k.filter(n, e, r);
}
k.filter = function(e, t, n) {
var r = t[0];
return n && (e = ":not(" + e + ")"), 1 === t.length && 1 === r.nodeType ? k.find.matchesSelector(r, e) ? [ r ] : [] : k.find.matches(e, k.grep(t, function(e) {
return 1 === e.nodeType;
}));
}, k.fn.extend({
find: function(e) {
var t, n, r = this.length, i = this;
if ("string" != typeof e) return this.pushStack(k(e).filter(function() {
for (t = 0; t < r; t++) if (k.contains(i[t], this)) return !0;
}));
for (n = this.pushStack([]), t = 0; t < r; t++) k.find(e, i[t], n);
return 1 < r ? k.uniqueSort(n) : n;
},
filter: function(e) {
return this.pushStack(j(this, e || [], !1));
},
not: function(e) {
return this.pushStack(j(this, e || [], !0));
},
is: function(e) {
return !!j(this, "string" == typeof e && N.test(e) ? k(e) : e || [], !1).length;
}
});
var q, L = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
(k.fn.init = function(e, t, n) {
var r, i;
if (!e) return this;
if (n = n || q, "string" == typeof e) {
if (!(r = "<" === e[0] && ">" === e[e.length - 1] && 3 <= e.length ? [ null, e, null ] : L.exec(e)) || !r[1] && t) return !t || t.jquery ? (t || n).find(e) : this.constructor(t).find(e);
if (r[1]) {
if (t = t instanceof k ? t[0] : t, k.merge(this, k.parseHTML(r[1], t && t.nodeType ? t.ownerDocument || t : E, !0)), 
D.test(r[1]) && k.isPlainObject(t)) for (r in t) m(this[r]) ? this[r](t[r]) : this.attr(r, t[r]);
return this;
}
return (i = E.getElementById(r[2])) && (this[0] = i, this.length = 1), this;
}
return e.nodeType ? (this[0] = e, this.length = 1, this) : m(e) ? void 0 !== n.ready ? n.ready(e) : e(k) : k.makeArray(e, this);
}).prototype = k.fn, q = k(E);
var H = /^(?:parents|prev(?:Until|All))/, O = {
children: !0,
contents: !0,
next: !0,
prev: !0
};
function P(e, t) {
while ((e = e[t]) && 1 !== e.nodeType) ;
return e;
}
k.fn.extend({
has: function(e) {
var t = k(e, this), n = t.length;
return this.filter(function() {
for (var e = 0; e < n; e++) if (k.contains(this, t[e])) return !0;
});
},
closest: function(e, t) {
var n, r = 0, i = this.length, o = [], a = "string" != typeof e && k(e);
if (!N.test(e)) for (;r < i; r++) for (n = this[r]; n && n !== t; n = n.parentNode) if (n.nodeType < 11 && (a ? -1 < a.index(n) : 1 === n.nodeType && k.find.matchesSelector(n, e))) {
o.push(n);
break;
}
return this.pushStack(1 < o.length ? k.uniqueSort(o) : o);
},
index: function(e) {
return e ? "string" == typeof e ? i.call(k(e), this[0]) : i.call(this, e.jquery ? e[0] : e) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
},
add: function(e, t) {
return this.pushStack(k.uniqueSort(k.merge(this.get(), k(e, t))));
},
addBack: function(e) {
return this.add(null == e ? this.prevObject : this.prevObject.filter(e));
}
}), k.each({
parent: function(e) {
var t = e.parentNode;
return t && 11 !== t.nodeType ? t : null;
},
parents: function(e) {
return T(e, "parentNode");
},
parentsUntil: function(e, t, n) {
return T(e, "parentNode", n);
},
next: function(e) {
return P(e, "nextSibling");
},
prev: function(e) {
return P(e, "previousSibling");
},
nextAll: function(e) {
return T(e, "nextSibling");
},
prevAll: function(e) {
return T(e, "previousSibling");
},
nextUntil: function(e, t, n) {
return T(e, "nextSibling", n);
},
prevUntil: function(e, t, n) {
return T(e, "previousSibling", n);
},
siblings: function(e) {
return S((e.parentNode || {}).firstChild, e);
},
children: function(e) {
return S(e.firstChild);
},
contents: function(e) {
return "undefined" != typeof e.contentDocument ? e.contentDocument : (A(e, "template") && (e = e.content || e), 
k.merge([], e.childNodes));
}
}, function(r, i) {
k.fn[r] = function(e, t) {
var n = k.map(this, i, e);
return "Until" !== r.slice(-5) && (t = e), t && "string" == typeof t && (n = k.filter(t, n)), 
1 < this.length && (O[r] || k.uniqueSort(n), H.test(r) && n.reverse()), this.pushStack(n);
};
});
var R = /[^\x20\t\r\n\f]+/g;
function M(e) {
return e;
}
function I(e) {
throw e;
}
function W(e, t, n, r) {
var i;
try {
e && m(i = e.promise) ? i.call(e).done(t).fail(n) : e && m(i = e.then) ? i.call(e, t, n) : t.apply(void 0, [ e ].slice(r));
} catch (e) {
n.apply(void 0, [ e ]);
}
}
k.Callbacks = function(r) {
var e, n;
r = "string" == typeof r ? (e = r, n = {}, k.each(e.match(R) || [], function(e, t) {
n[t] = !0;
}), n) : k.extend({}, r);
var i, t, o, a, s = [], u = [], l = -1, c = function() {
for (a = a || r.once, o = i = !0; u.length; l = -1) {
t = u.shift();
while (++l < s.length) !1 === s[l].apply(t[0], t[1]) && r.stopOnFalse && (l = s.length, 
t = !1);
}
r.memory || (t = !1), i = !1, a && (s = t ? [] : "");
}, f = {
add: function() {
return s && (t && !i && (l = s.length - 1, u.push(t)), function n(e) {
k.each(e, function(e, t) {
m(t) ? r.unique && f.has(t) || s.push(t) : t && t.length && "string" !== w(t) && n(t);
});
}(arguments), t && !i && c()), this;
},
remove: function() {
return k.each(arguments, function(e, t) {
var n;
while (-1 < (n = k.inArray(t, s, n))) s.splice(n, 1), n <= l && l--;
}), this;
},
has: function(e) {
return e ? -1 < k.inArray(e, s) : 0 < s.length;
},
empty: function() {
return s && (s = []), this;
},
disable: function() {
return a = u = [], s = t = "", this;
},
disabled: function() {
return !s;
},
lock: function() {
return a = u = [], t || i || (s = t = ""), this;
},
locked: function() {
return !!a;
},
fireWith: function(e, t) {
return a || (t = [ e, (t = t || []).slice ? t.slice() : t ], u.push(t), i || c()), 
this;
},
fire: function() {
return f.fireWith(this, arguments), this;
},
fired: function() {
return !!o;
}
};
return f;
}, k.extend({
Deferred: function(e) {
var o = [ [ "notify", "progress", k.Callbacks("memory"), k.Callbacks("memory"), 2 ], [ "resolve", "done", k.Callbacks("once memory"), k.Callbacks("once memory"), 0, "resolved" ], [ "reject", "fail", k.Callbacks("once memory"), k.Callbacks("once memory"), 1, "rejected" ] ], i = "pending", a = {
state: function() {
return i;
},
always: function() {
return s.done(arguments).fail(arguments), this;
},
catch: function(e) {
return a.then(null, e);
},
pipe: function() {
var i = arguments;
return k.Deferred(function(r) {
k.each(o, function(e, t) {
var n = m(i[t[4]]) && i[t[4]];
s[t[1]](function() {
var e = n && n.apply(this, arguments);
e && m(e.promise) ? e.promise().progress(r.notify).done(r.resolve).fail(r.reject) : r[t[0] + "With"](this, n ? [ e ] : arguments);
});
}), i = null;
}).promise();
},
then: function(t, n, r) {
var u = 0;
function l(i, o, a, s) {
return function() {
var n = this, r = arguments, e = function() {
var e, t;
if (!(i < u)) {
if ((e = a.apply(n, r)) === o.promise()) throw new TypeError("Thenable self-resolution");
t = e && ("object" == typeof e || "function" == typeof e) && e.then, m(t) ? s ? t.call(e, l(u, o, M, s), l(u, o, I, s)) : (u++, 
t.call(e, l(u, o, M, s), l(u, o, I, s), l(u, o, M, o.notifyWith))) : (a !== M && (n = void 0, 
r = [ e ]), (s || o.resolveWith)(n, r));
}
}, t = s ? e : function() {
try {
e();
} catch (e) {
k.Deferred.exceptionHook && k.Deferred.exceptionHook(e, t.stackTrace), u <= i + 1 && (a !== I && (n = void 0, 
r = [ e ]), o.rejectWith(n, r));
}
};
i ? t() : (k.Deferred.getStackHook && (t.stackTrace = k.Deferred.getStackHook()), 
C.setTimeout(t));
};
}
return k.Deferred(function(e) {
o[0][3].add(l(0, e, m(r) ? r : M, e.notifyWith)), o[1][3].add(l(0, e, m(t) ? t : M)), 
o[2][3].add(l(0, e, m(n) ? n : I));
}).promise();
},
promise: function(e) {
return null != e ? k.extend(e, a) : a;
}
}, s = {};
return k.each(o, function(e, t) {
var n = t[2], r = t[5];
a[t[1]] = n.add, r && n.add(function() {
i = r;
}, o[3 - e][2].disable, o[3 - e][3].disable, o[0][2].lock, o[0][3].lock), n.add(t[3].fire), 
s[t[0]] = function() {
return s[t[0] + "With"](this === s ? void 0 : this, arguments), this;
}, s[t[0] + "With"] = n.fireWith;
}), a.promise(s), e && e.call(s, s), s;
},
when: function(e) {
var n = arguments.length, t = n, r = Array(t), i = s.call(arguments), o = k.Deferred(), a = function(t) {
return function(e) {
r[t] = this, i[t] = 1 < arguments.length ? s.call(arguments) : e, --n || o.resolveWith(r, i);
};
};
if (n <= 1 && (W(e, o.done(a(t)).resolve, o.reject, !n), "pending" === o.state() || m(i[t] && i[t].then))) return o.then();
while (t--) W(i[t], a(t), o.reject);
return o.promise();
}
});
var $ = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
k.Deferred.exceptionHook = function(e, t) {
C.console && C.console.warn && e && $.test(e.name) && C.console.warn("jQuery.Deferred exception: " + e.message, e.stack, t);
}, k.readyException = function(e) {
C.setTimeout(function() {
throw e;
});
};
var F = k.Deferred();
function B() {
E.removeEventListener("DOMContentLoaded", B), C.removeEventListener("load", B), 
k.ready();
}
k.fn.ready = function(e) {
return F.then(e)["catch"](function(e) {
k.readyException(e);
}), this;
}, k.extend({
isReady: !1,
readyWait: 1,
ready: function(e) {
(!0 === e ? --k.readyWait : k.isReady) || (k.isReady = !0) !== e && 0 < --k.readyWait || F.resolveWith(E, [ k ]);
}
}), k.ready.then = F.then, "complete" === E.readyState || "loading" !== E.readyState && !E.documentElement.doScroll ? C.setTimeout(k.ready) : (E.addEventListener("DOMContentLoaded", B), 
C.addEventListener("load", B));
var _ = function(e, t, n, r, i, o, a) {
var s = 0, u = e.length, l = null == n;
if ("object" === w(n)) for (s in i = !0, n) _(e, t, s, n[s], !0, o, a); else if (void 0 !== r && (i = !0, 
m(r) || (a = !0), l && (a ? (t.call(e, r), t = null) : (l = t, t = function(e, t, n) {
return l.call(k(e), n);
})), t)) for (;s < u; s++) t(e[s], n, a ? r : r.call(e[s], s, t(e[s], n)));
return i ? e : l ? t.call(e) : u ? t(e[0], n) : o;
}, z = /^-ms-/, U = /-([a-z])/g;
function X(e, t) {
return t.toUpperCase();
}
function V(e) {
return e.replace(z, "ms-").replace(U, X);
}
var G = function(e) {
return 1 === e.nodeType || 9 === e.nodeType || !+e.nodeType;
};
function Y() {
this.expando = k.expando + Y.uid++;
}
Y.uid = 1, Y.prototype = {
cache: function(e) {
var t = e[this.expando];
return t || (t = {}, G(e) && (e.nodeType ? e[this.expando] = t : Object.defineProperty(e, this.expando, {
value: t,
configurable: !0
}))), t;
},
set: function(e, t, n) {
var r, i = this.cache(e);
if ("string" == typeof t) i[V(t)] = n; else for (r in t) i[V(r)] = t[r];
return i;
},
get: function(e, t) {
return void 0 === t ? this.cache(e) : e[this.expando] && e[this.expando][V(t)];
},
access: function(e, t, n) {
return void 0 === t || t && "string" == typeof t && void 0 === n ? this.get(e, t) : (this.set(e, t, n), 
void 0 !== n ? n : t);
},
remove: function(e, t) {
var n, r = e[this.expando];
if (void 0 !== r) {
if (void 0 !== t) {
n = (t = Array.isArray(t) ? t.map(V) : (t = V(t)) in r ? [ t ] : t.match(R) || []).length;
while (n--) delete r[t[n]];
}
(void 0 === t || k.isEmptyObject(r)) && (e.nodeType ? e[this.expando] = void 0 : delete e[this.expando]);
}
},
hasData: function(e) {
var t = e[this.expando];
return void 0 !== t && !k.isEmptyObject(t);
}
};
var Q = new Y(), J = new Y(), K = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, Z = /[A-Z]/g;
function ee(e, t, n) {
var r, i;
if (void 0 === n && 1 === e.nodeType) if (r = "data-" + t.replace(Z, "-$&").toLowerCase(), 
"string" == typeof (n = e.getAttribute(r))) {
try {
n = "true" === (i = n) || "false" !== i && ("null" === i ? null : i === +i + "" ? +i : K.test(i) ? JSON.parse(i) : i);
} catch (e) {}
J.set(e, t, n);
} else n = void 0;
return n;
}
k.extend({
hasData: function(e) {
return J.hasData(e) || Q.hasData(e);
},
data: function(e, t, n) {
return J.access(e, t, n);
},
removeData: function(e, t) {
J.remove(e, t);
},
_data: function(e, t, n) {
return Q.access(e, t, n);
},
_removeData: function(e, t) {
Q.remove(e, t);
}
}), k.fn.extend({
data: function(n, e) {
var t, r, i, o = this[0], a = o && o.attributes;
if (void 0 === n) {
if (this.length && (i = J.get(o), 1 === o.nodeType && !Q.get(o, "hasDataAttrs"))) {
t = a.length;
while (t--) a[t] && 0 === (r = a[t].name).indexOf("data-") && (r = V(r.slice(5)), 
ee(o, r, i[r]));
Q.set(o, "hasDataAttrs", !0);
}
return i;
}
return "object" == typeof n ? this.each(function() {
J.set(this, n);
}) : _(this, function(e) {
var t;
if (o && void 0 === e) return void 0 !== (t = J.get(o, n)) ? t : void 0 !== (t = ee(o, n)) ? t : void 0;
this.each(function() {
J.set(this, n, e);
});
}, null, e, 1 < arguments.length, null, !0);
},
removeData: function(e) {
return this.each(function() {
J.remove(this, e);
});
}
}), k.extend({
queue: function(e, t, n) {
var r;
if (e) return t = (t || "fx") + "queue", r = Q.get(e, t), n && (!r || Array.isArray(n) ? r = Q.access(e, t, k.makeArray(n)) : r.push(n)), 
r || [];
},
dequeue: function(e, t) {
t = t || "fx";
var n = k.queue(e, t), r = n.length, i = n.shift(), o = k._queueHooks(e, t);
"inprogress" === i && (i = n.shift(), r--), i && ("fx" === t && n.unshift("inprogress"), 
delete o.stop, i.call(e, function() {
k.dequeue(e, t);
}, o)), !r && o && o.empty.fire();
},
_queueHooks: function(e, t) {
var n = t + "queueHooks";
return Q.get(e, n) || Q.access(e, n, {
empty: k.Callbacks("once memory").add(function() {
Q.remove(e, [ t + "queue", n ]);
})
});
}
}), k.fn.extend({
queue: function(t, n) {
var e = 2;
return "string" != typeof t && (n = t, t = "fx", e--), arguments.length < e ? k.queue(this[0], t) : void 0 === n ? this : this.each(function() {
var e = k.queue(this, t, n);
k._queueHooks(this, t), "fx" === t && "inprogress" !== e[0] && k.dequeue(this, t);
});
},
dequeue: function(e) {
return this.each(function() {
k.dequeue(this, e);
});
},
clearQueue: function(e) {
return this.queue(e || "fx", []);
},
promise: function(e, t) {
var n, r = 1, i = k.Deferred(), o = this, a = this.length, s = function() {
--r || i.resolveWith(o, [ o ]);
};
"string" != typeof e && (t = e, e = void 0), e = e || "fx";
while (a--) (n = Q.get(o[a], e + "queueHooks")) && n.empty && (r++, n.empty.add(s));
return s(), i.promise(t);
}
});
var te = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, ne = new RegExp("^(?:([+-])=|)(" + te + ")([a-z%]*)$", "i"), re = [ "Top", "Right", "Bottom", "Left" ], ie = E.documentElement, oe = function(e) {
return k.contains(e.ownerDocument, e);
}, ae = {
composed: !0
};
ie.getRootNode && (oe = function(e) {
return k.contains(e.ownerDocument, e) || e.getRootNode(ae) === e.ownerDocument;
});
var se = function(e, t) {
return "none" === (e = t || e).style.display || "" === e.style.display && oe(e) && "none" === k.css(e, "display");
}, ue = function(e, t, n, r) {
var i, o, a = {};
for (o in t) a[o] = e.style[o], e.style[o] = t[o];
for (o in i = n.apply(e, r || []), t) e.style[o] = a[o];
return i;
};
function le(e, t, n, r) {
var i, o, a = 20, s = r ? function() {
return r.cur();
} : function() {
return k.css(e, t, "");
}, u = s(), l = n && n[3] || (k.cssNumber[t] ? "" : "px"), c = e.nodeType && (k.cssNumber[t] || "px" !== l && +u) && ne.exec(k.css(e, t));
if (c && c[3] !== l) {
u /= 2, l = l || c[3], c = +u || 1;
while (a--) k.style(e, t, c + l), (1 - o) * (1 - (o = s() / u || .5)) <= 0 && (a = 0), 
c /= o;
c *= 2, k.style(e, t, c + l), n = n || [];
}
return n && (c = +c || +u || 0, i = n[1] ? c + (n[1] + 1) * n[2] : +n[2], r && (r.unit = l, 
r.start = c, r.end = i)), i;
}
var ce = {};
function fe(e, t) {
for (var n, r, i, o, a, s, u, l = [], c = 0, f = e.length; c < f; c++) (r = e[c]).style && (n = r.style.display, 
t ? ("none" === n && (l[c] = Q.get(r, "display") || null, l[c] || (r.style.display = "")), 
"" === r.style.display && se(r) && (l[c] = (u = a = o = void 0, a = (i = r).ownerDocument, 
s = i.nodeName, (u = ce[s]) || (o = a.body.appendChild(a.createElement(s)), u = k.css(o, "display"), 
o.parentNode.removeChild(o), "none" === u && (u = "block"), ce[s] = u)))) : "none" !== n && (l[c] = "none", 
Q.set(r, "display", n)));
for (c = 0; c < f; c++) null != l[c] && (e[c].style.display = l[c]);
return e;
}
k.fn.extend({
show: function() {
return fe(this, !0);
},
hide: function() {
return fe(this);
},
toggle: function(e) {
return "boolean" == typeof e ? e ? this.show() : this.hide() : this.each(function() {
se(this) ? k(this).show() : k(this).hide();
});
}
});
var pe = /^(?:checkbox|radio)$/i, de = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i, he = /^$|^module$|\/(?:java|ecma)script/i, ge = {
option: [ 1, "<select multiple='multiple'>", "</select>" ],
thead: [ 1, "<table>", "</table>" ],
col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
tr: [ 2, "<table><tbody>", "</tbody></table>" ],
td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
_default: [ 0, "", "" ]
};
function ve(e, t) {
var n;
return n = "undefined" != typeof e.getElementsByTagName ? e.getElementsByTagName(t || "*") : "undefined" != typeof e.querySelectorAll ? e.querySelectorAll(t || "*") : [], 
void 0 === t || t && A(e, t) ? k.merge([ e ], n) : n;
}
function ye(e, t) {
for (var n = 0, r = e.length; n < r; n++) Q.set(e[n], "globalEval", !t || Q.get(t[n], "globalEval"));
}
ge.optgroup = ge.option, ge.tbody = ge.tfoot = ge.colgroup = ge.caption = ge.thead, 
ge.th = ge.td;
var me, xe, be = /<|&#?\w+;/;
function we(e, t, n, r, i) {
for (var o, a, s, u, l, c, f = t.createDocumentFragment(), p = [], d = 0, h = e.length; d < h; d++) if ((o = e[d]) || 0 === o) if ("object" === w(o)) k.merge(p, o.nodeType ? [ o ] : o); else if (be.test(o)) {
a = a || f.appendChild(t.createElement("div")), s = (de.exec(o) || [ "", "" ])[1].toLowerCase(), 
u = ge[s] || ge._default, a.innerHTML = u[1] + k.htmlPrefilter(o) + u[2], c = u[0];
while (c--) a = a.lastChild;
k.merge(p, a.childNodes), (a = f.firstChild).textContent = "";
} else p.push(t.createTextNode(o));
f.textContent = "", d = 0;
while (o = p[d++]) if (r && -1 < k.inArray(o, r)) i && i.push(o); else if (l = oe(o), 
a = ve(f.appendChild(o), "script"), l && ye(a), n) {
c = 0;
while (o = a[c++]) he.test(o.type || "") && n.push(o);
}
return f;
}
me = E.createDocumentFragment().appendChild(E.createElement("div")), (xe = E.createElement("input")).setAttribute("type", "radio"), 
xe.setAttribute("checked", "checked"), xe.setAttribute("name", "t"), me.appendChild(xe), 
y.checkClone = me.cloneNode(!0).cloneNode(!0).lastChild.checked, me.innerHTML = "<textarea>x</textarea>", 
y.noCloneChecked = !!me.cloneNode(!0).lastChild.defaultValue;
var Te = /^key/, Ce = /^(?:mouse|pointer|contextmenu|drag|drop)|click/, Ee = /^([^.]*)(?:\.(.+)|)/;
function ke() {
return !0;
}
function Se() {
return !1;
}
function Ne(e, t) {
return e === function() {
try {
return E.activeElement;
} catch (e) {}
}() == ("focus" === t);
}
function Ae(e, t, n, r, i, o) {
var a, s;
if ("object" == typeof t) {
for (s in "string" != typeof n && (r = r || n, n = void 0), t) Ae(e, s, n, r, t[s], o);
return e;
}
if (null == r && null == i ? (i = n, r = n = void 0) : null == i && ("string" == typeof n ? (i = r, 
r = void 0) : (i = r, r = n, n = void 0)), !1 === i) i = Se; else if (!i) return e;
return 1 === o && (a = i, (i = function(e) {
return k().off(e), a.apply(this, arguments);
}).guid = a.guid || (a.guid = k.guid++)), e.each(function() {
k.event.add(this, t, i, r, n);
});
}
function De(e, i, o) {
o ? (Q.set(e, i, !1), k.event.add(e, i, {
namespace: !1,
handler: function(e) {
var t, n, r = Q.get(this, i);
if (1 & e.isTrigger && this[i]) {
if (r.length) (k.event.special[i] || {}).delegateType && e.stopPropagation(); else if (r = s.call(arguments), 
Q.set(this, i, r), t = o(this, i), this[i](), r !== (n = Q.get(this, i)) || t ? Q.set(this, i, !1) : n = {}, 
r !== n) return e.stopImmediatePropagation(), e.preventDefault(), n.value;
} else r.length && (Q.set(this, i, {
value: k.event.trigger(k.extend(r[0], k.Event.prototype), r.slice(1), this)
}), e.stopImmediatePropagation());
}
})) : void 0 === Q.get(e, i) && k.event.add(e, i, ke);
}
k.event = {
global: {},
add: function(t, e, n, r, i) {
var o, a, s, u, l, c, f, p, d, h, g, v = Q.get(t);
if (v) {
n.handler && (n = (o = n).handler, i = o.selector), i && k.find.matchesSelector(ie, i), 
n.guid || (n.guid = k.guid++), (u = v.events) || (u = v.events = {}), (a = v.handle) || (a = v.handle = function(e) {
return "undefined" != typeof k && k.event.triggered !== e.type ? k.event.dispatch.apply(t, arguments) : void 0;
}), l = (e = (e || "").match(R) || [ "" ]).length;
while (l--) d = g = (s = Ee.exec(e[l]) || [])[1], h = (s[2] || "").split(".").sort(), 
d && (f = k.event.special[d] || {}, d = (i ? f.delegateType : f.bindType) || d, 
f = k.event.special[d] || {}, c = k.extend({
type: d,
origType: g,
data: r,
handler: n,
guid: n.guid,
selector: i,
needsContext: i && k.expr.match.needsContext.test(i),
namespace: h.join(".")
}, o), (p = u[d]) || ((p = u[d] = []).delegateCount = 0, f.setup && !1 !== f.setup.call(t, r, h, a) || t.addEventListener && t.addEventListener(d, a)), 
f.add && (f.add.call(t, c), c.handler.guid || (c.handler.guid = n.guid)), i ? p.splice(p.delegateCount++, 0, c) : p.push(c), 
k.event.global[d] = !0);
}
},
remove: function(e, t, n, r, i) {
var o, a, s, u, l, c, f, p, d, h, g, v = Q.hasData(e) && Q.get(e);
if (v && (u = v.events)) {
l = (t = (t || "").match(R) || [ "" ]).length;
while (l--) if (d = g = (s = Ee.exec(t[l]) || [])[1], h = (s[2] || "").split(".").sort(), 
d) {
f = k.event.special[d] || {}, p = u[d = (r ? f.delegateType : f.bindType) || d] || [], 
s = s[2] && new RegExp("(^|\\.)" + h.join("\\.(?:.*\\.|)") + "(\\.|$)"), a = o = p.length;
while (o--) c = p[o], !i && g !== c.origType || n && n.guid !== c.guid || s && !s.test(c.namespace) || r && r !== c.selector && ("**" !== r || !c.selector) || (p.splice(o, 1), 
c.selector && p.delegateCount--, f.remove && f.remove.call(e, c));
a && !p.length && (f.teardown && !1 !== f.teardown.call(e, h, v.handle) || k.removeEvent(e, d, v.handle), 
delete u[d]);
} else for (d in u) k.event.remove(e, d + t[l], n, r, !0);
k.isEmptyObject(u) && Q.remove(e, "handle events");
}
},
dispatch: function(e) {
var t, n, r, i, o, a, s = k.event.fix(e), u = new Array(arguments.length), l = (Q.get(this, "events") || {})[s.type] || [], c = k.event.special[s.type] || {};
for (u[0] = s, t = 1; t < arguments.length; t++) u[t] = arguments[t];
if (s.delegateTarget = this, !c.preDispatch || !1 !== c.preDispatch.call(this, s)) {
a = k.event.handlers.call(this, s, l), t = 0;
while ((i = a[t++]) && !s.isPropagationStopped()) {
s.currentTarget = i.elem, n = 0;
while ((o = i.handlers[n++]) && !s.isImmediatePropagationStopped()) s.rnamespace && !1 !== o.namespace && !s.rnamespace.test(o.namespace) || (s.handleObj = o, 
s.data = o.data, void 0 !== (r = ((k.event.special[o.origType] || {}).handle || o.handler).apply(i.elem, u)) && !1 === (s.result = r) && (s.preventDefault(), 
s.stopPropagation()));
}
return c.postDispatch && c.postDispatch.call(this, s), s.result;
}
},
handlers: function(e, t) {
var n, r, i, o, a, s = [], u = t.delegateCount, l = e.target;
if (u && l.nodeType && !("click" === e.type && 1 <= e.button)) for (;l !== this; l = l.parentNode || this) if (1 === l.nodeType && ("click" !== e.type || !0 !== l.disabled)) {
for (o = [], a = {}, n = 0; n < u; n++) void 0 === a[i = (r = t[n]).selector + " "] && (a[i] = r.needsContext ? -1 < k(i, this).index(l) : k.find(i, this, null, [ l ]).length), 
a[i] && o.push(r);
o.length && s.push({
elem: l,
handlers: o
});
}
return l = this, u < t.length && s.push({
elem: l,
handlers: t.slice(u)
}), s;
},
addProp: function(t, e) {
Object.defineProperty(k.Event.prototype, t, {
enumerable: !0,
configurable: !0,
get: m(e) ? function() {
if (this.originalEvent) return e(this.originalEvent);
} : function() {
if (this.originalEvent) return this.originalEvent[t];
},
set: function(e) {
Object.defineProperty(this, t, {
enumerable: !0,
configurable: !0,
writable: !0,
value: e
});
}
});
},
fix: function(e) {
return e[k.expando] ? e : new k.Event(e);
},
special: {
load: {
noBubble: !0
},
click: {
setup: function(e) {
var t = this || e;
return pe.test(t.type) && t.click && A(t, "input") && De(t, "click", ke), !1;
},
trigger: function(e) {
var t = this || e;
return pe.test(t.type) && t.click && A(t, "input") && De(t, "click"), !0;
},
_default: function(e) {
var t = e.target;
return pe.test(t.type) && t.click && A(t, "input") && Q.get(t, "click") || A(t, "a");
}
},
beforeunload: {
postDispatch: function(e) {
void 0 !== e.result && e.originalEvent && (e.originalEvent.returnValue = e.result);
}
}
}
}, k.removeEvent = function(e, t, n) {
e.removeEventListener && e.removeEventListener(t, n);
}, k.Event = function(e, t) {
if (!(this instanceof k.Event)) return new k.Event(e, t);
e && e.type ? (this.originalEvent = e, this.type = e.type, this.isDefaultPrevented = e.defaultPrevented || void 0 === e.defaultPrevented && !1 === e.returnValue ? ke : Se, 
this.target = e.target && 3 === e.target.nodeType ? e.target.parentNode : e.target, 
this.currentTarget = e.currentTarget, this.relatedTarget = e.relatedTarget) : this.type = e, 
t && k.extend(this, t), this.timeStamp = e && e.timeStamp || Date.now(), this[k.expando] = !0;
}, k.Event.prototype = {
constructor: k.Event,
isDefaultPrevented: Se,
isPropagationStopped: Se,
isImmediatePropagationStopped: Se,
isSimulated: !1,
preventDefault: function() {
var e = this.originalEvent;
this.isDefaultPrevented = ke, e && !this.isSimulated && e.preventDefault();
},
stopPropagation: function() {
var e = this.originalEvent;
this.isPropagationStopped = ke, e && !this.isSimulated && e.stopPropagation();
},
stopImmediatePropagation: function() {
var e = this.originalEvent;
this.isImmediatePropagationStopped = ke, e && !this.isSimulated && e.stopImmediatePropagation(), 
this.stopPropagation();
}
}, k.each({
altKey: !0,
bubbles: !0,
cancelable: !0,
changedTouches: !0,
ctrlKey: !0,
detail: !0,
eventPhase: !0,
metaKey: !0,
pageX: !0,
pageY: !0,
shiftKey: !0,
view: !0,
char: !0,
code: !0,
charCode: !0,
key: !0,
keyCode: !0,
button: !0,
buttons: !0,
clientX: !0,
clientY: !0,
offsetX: !0,
offsetY: !0,
pointerId: !0,
pointerType: !0,
screenX: !0,
screenY: !0,
targetTouches: !0,
toElement: !0,
touches: !0,
which: function(e) {
var t = e.button;
return null == e.which && Te.test(e.type) ? null != e.charCode ? e.charCode : e.keyCode : !e.which && void 0 !== t && Ce.test(e.type) ? 1 & t ? 1 : 2 & t ? 3 : 4 & t ? 2 : 0 : e.which;
}
}, k.event.addProp), k.each({
focus: "focusin",
blur: "focusout"
}, function(e, t) {
k.event.special[e] = {
setup: function() {
return De(this, e, Ne), !1;
},
trigger: function() {
return De(this, e), !0;
},
delegateType: t
};
}), k.each({
mouseenter: "mouseover",
mouseleave: "mouseout",
pointerenter: "pointerover",
pointerleave: "pointerout"
}, function(e, i) {
k.event.special[e] = {
delegateType: i,
bindType: i,
handle: function(e) {
var t, n = e.relatedTarget, r = e.handleObj;
return n && (n === this || k.contains(this, n)) || (e.type = r.origType, t = r.handler.apply(this, arguments), 
e.type = i), t;
}
};
}), k.fn.extend({
on: function(e, t, n, r) {
return Ae(this, e, t, n, r);
},
one: function(e, t, n, r) {
return Ae(this, e, t, n, r, 1);
},
off: function(e, t, n) {
var r, i;
if (e && e.preventDefault && e.handleObj) return r = e.handleObj, k(e.delegateTarget).off(r.namespace ? r.origType + "." + r.namespace : r.origType, r.selector, r.handler), 
this;
if ("object" == typeof e) {
for (i in e) this.off(i, t, e[i]);
return this;
}
return !1 !== t && "function" != typeof t || (n = t, t = void 0), !1 === n && (n = Se), 
this.each(function() {
k.event.remove(this, e, n, t);
});
}
});
var je = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi, qe = /<script|<style|<link/i, Le = /checked\s*(?:[^=]|=\s*.checked.)/i, He = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
function Oe(e, t) {
return A(e, "table") && A(11 !== t.nodeType ? t : t.firstChild, "tr") && k(e).children("tbody")[0] || e;
}
function Pe(e) {
return e.type = (null !== e.getAttribute("type")) + "/" + e.type, e;
}
function Re(e) {
return "true/" === (e.type || "").slice(0, 5) ? e.type = e.type.slice(5) : e.removeAttribute("type"), 
e;
}
function Me(e, t) {
var n, r, i, o, a, s, u, l;
if (1 === t.nodeType) {
if (Q.hasData(e) && (o = Q.access(e), a = Q.set(t, o), l = o.events)) for (i in delete a.handle, 
a.events = {}, l) for (n = 0, r = l[i].length; n < r; n++) k.event.add(t, i, l[i][n]);
J.hasData(e) && (s = J.access(e), u = k.extend({}, s), J.set(t, u));
}
}
function Ie(n, r, i, o) {
r = g.apply([], r);
var e, t, a, s, u, l, c = 0, f = n.length, p = f - 1, d = r[0], h = m(d);
if (h || 1 < f && "string" == typeof d && !y.checkClone && Le.test(d)) return n.each(function(e) {
var t = n.eq(e);
h && (r[0] = d.call(this, e, t.html())), Ie(t, r, i, o);
});
if (f && (t = (e = we(r, n[0].ownerDocument, !1, n, o)).firstChild, 1 === e.childNodes.length && (e = t), 
t || o)) {
for (s = (a = k.map(ve(e, "script"), Pe)).length; c < f; c++) u = e, c !== p && (u = k.clone(u, !0, !0), 
s && k.merge(a, ve(u, "script"))), i.call(n[c], u, c);
if (s) for (l = a[a.length - 1].ownerDocument, k.map(a, Re), c = 0; c < s; c++) u = a[c], 
he.test(u.type || "") && !Q.access(u, "globalEval") && k.contains(l, u) && (u.src && "module" !== (u.type || "").toLowerCase() ? k._evalUrl && !u.noModule && k._evalUrl(u.src, {
nonce: u.nonce || u.getAttribute("nonce")
}) : b(u.textContent.replace(He, ""), u, l));
}
return n;
}
function We(e, t, n) {
for (var r, i = t ? k.filter(t, e) : e, o = 0; null != (r = i[o]); o++) n || 1 !== r.nodeType || k.cleanData(ve(r)), 
r.parentNode && (n && oe(r) && ye(ve(r, "script")), r.parentNode.removeChild(r));
return e;
}
k.extend({
htmlPrefilter: function(e) {
return e.replace(je, "<$1></$2>");
},
clone: function(e, t, n) {
var r, i, o, a, s, u, l, c = e.cloneNode(!0), f = oe(e);
if (!(y.noCloneChecked || 1 !== e.nodeType && 11 !== e.nodeType || k.isXMLDoc(e))) for (a = ve(c), 
r = 0, i = (o = ve(e)).length; r < i; r++) s = o[r], u = a[r], void 0, "input" === (l = u.nodeName.toLowerCase()) && pe.test(s.type) ? u.checked = s.checked : "input" !== l && "textarea" !== l || (u.defaultValue = s.defaultValue);
if (t) if (n) for (o = o || ve(e), a = a || ve(c), r = 0, i = o.length; r < i; r++) Me(o[r], a[r]); else Me(e, c);
return 0 < (a = ve(c, "script")).length && ye(a, !f && ve(e, "script")), c;
},
cleanData: function(e) {
for (var t, n, r, i = k.event.special, o = 0; void 0 !== (n = e[o]); o++) if (G(n)) {
if (t = n[Q.expando]) {
if (t.events) for (r in t.events) i[r] ? k.event.remove(n, r) : k.removeEvent(n, r, t.handle);
n[Q.expando] = void 0;
}
n[J.expando] && (n[J.expando] = void 0);
}
}
}), k.fn.extend({
detach: function(e) {
return We(this, e, !0);
},
remove: function(e) {
return We(this, e);
},
text: function(e) {
return _(this, function(e) {
return void 0 === e ? k.text(this) : this.empty().each(function() {
1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType || (this.textContent = e);
});
}, null, e, arguments.length);
},
append: function() {
return Ie(this, arguments, function(e) {
1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType || Oe(this, e).appendChild(e);
});
},
prepend: function() {
return Ie(this, arguments, function(e) {
if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
var t = Oe(this, e);
t.insertBefore(e, t.firstChild);
}
});
},
before: function() {
return Ie(this, arguments, function(e) {
this.parentNode && this.parentNode.insertBefore(e, this);
});
},
after: function() {
return Ie(this, arguments, function(e) {
this.parentNode && this.parentNode.insertBefore(e, this.nextSibling);
});
},
empty: function() {
for (var e, t = 0; null != (e = this[t]); t++) 1 === e.nodeType && (k.cleanData(ve(e, !1)), 
e.textContent = "");
return this;
},
clone: function(e, t) {
return e = null != e && e, t = null == t ? e : t, this.map(function() {
return k.clone(this, e, t);
});
},
html: function(e) {
return _(this, function(e) {
var t = this[0] || {}, n = 0, r = this.length;
if (void 0 === e && 1 === t.nodeType) return t.innerHTML;
if ("string" == typeof e && !qe.test(e) && !ge[(de.exec(e) || [ "", "" ])[1].toLowerCase()]) {
e = k.htmlPrefilter(e);
try {
for (;n < r; n++) 1 === (t = this[n] || {}).nodeType && (k.cleanData(ve(t, !1)), 
t.innerHTML = e);
t = 0;
} catch (e) {}
}
t && this.empty().append(e);
}, null, e, arguments.length);
},
replaceWith: function() {
var n = [];
return Ie(this, arguments, function(e) {
var t = this.parentNode;
k.inArray(this, n) < 0 && (k.cleanData(ve(this)), t && t.replaceChild(e, this));
}, n);
}
}), k.each({
appendTo: "append",
prependTo: "prepend",
insertBefore: "before",
insertAfter: "after",
replaceAll: "replaceWith"
}, function(e, a) {
k.fn[e] = function(e) {
for (var t, n = [], r = k(e), i = r.length - 1, o = 0; o <= i; o++) t = o === i ? this : this.clone(!0), 
k(r[o])[a](t), u.apply(n, t.get());
return this.pushStack(n);
};
});
var $e = new RegExp("^(" + te + ")(?!px)[a-z%]+$", "i"), Fe = function(e) {
var t = e.ownerDocument.defaultView;
return t && t.opener || (t = C), t.getComputedStyle(e);
}, Be = new RegExp(re.join("|"), "i");
function _e(e, t, n) {
var r, i, o, a, s = e.style;
return (n = n || Fe(e)) && ("" !== (a = n.getPropertyValue(t) || n[t]) || oe(e) || (a = k.style(e, t)), 
!y.pixelBoxStyles() && $e.test(a) && Be.test(t) && (r = s.width, i = s.minWidth, 
o = s.maxWidth, s.minWidth = s.maxWidth = s.width = a, a = n.width, s.width = r, 
s.minWidth = i, s.maxWidth = o)), void 0 !== a ? a + "" : a;
}
function ze(e, t) {
return {
get: function() {
if (!e()) return (this.get = t).apply(this, arguments);
delete this.get;
}
};
}
!function() {
function e() {
if (u) {
s.style.cssText = "position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0", 
u.style.cssText = "position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%", 
ie.appendChild(s).appendChild(u);
var e = C.getComputedStyle(u);
n = "1%" !== e.top, a = 12 === t(e.marginLeft), u.style.right = "60%", o = 36 === t(e.right), 
r = 36 === t(e.width), u.style.position = "absolute", i = 12 === t(u.offsetWidth / 3), 
ie.removeChild(s), u = null;
}
}
function t(e) {
return Math.round(parseFloat(e));
}
var n, r, i, o, a, s = E.createElement("div"), u = E.createElement("div");
u.style && (u.style.backgroundClip = "content-box", u.cloneNode(!0).style.backgroundClip = "", 
y.clearCloneStyle = "content-box" === u.style.backgroundClip, k.extend(y, {
boxSizingReliable: function() {
return e(), r;
},
pixelBoxStyles: function() {
return e(), o;
},
pixelPosition: function() {
return e(), n;
},
reliableMarginLeft: function() {
return e(), a;
},
scrollboxSize: function() {
return e(), i;
}
}));
}();
var Ue = [ "Webkit", "Moz", "ms" ], Xe = E.createElement("div").style, Ve = {};
function Ge(e) {
var t = k.cssProps[e] || Ve[e];
return t || (e in Xe ? e : Ve[e] = function(e) {
var t = e[0].toUpperCase() + e.slice(1), n = Ue.length;
while (n--) if ((e = Ue[n] + t) in Xe) return e;
}(e) || e);
}
var Ye = /^(none|table(?!-c[ea]).+)/, Qe = /^--/, Je = {
position: "absolute",
visibility: "hidden",
display: "block"
}, Ke = {
letterSpacing: "0",
fontWeight: "400"
};
function Ze(e, t, n) {
var r = ne.exec(t);
return r ? Math.max(0, r[2] - (n || 0)) + (r[3] || "px") : t;
}
function et(e, t, n, r, i, o) {
var a = "width" === t ? 1 : 0, s = 0, u = 0;
if (n === (r ? "border" : "content")) return 0;
for (;a < 4; a += 2) "margin" === n && (u += k.css(e, n + re[a], !0, i)), r ? ("content" === n && (u -= k.css(e, "padding" + re[a], !0, i)), 
"margin" !== n && (u -= k.css(e, "border" + re[a] + "Width", !0, i))) : (u += k.css(e, "padding" + re[a], !0, i), 
"padding" !== n ? u += k.css(e, "border" + re[a] + "Width", !0, i) : s += k.css(e, "border" + re[a] + "Width", !0, i));
return !r && 0 <= o && (u += Math.max(0, Math.ceil(e["offset" + t[0].toUpperCase() + t.slice(1)] - o - u - s - .5)) || 0), 
u;
}
function tt(e, t, n) {
var r = Fe(e), i = (!y.boxSizingReliable() || n) && "border-box" === k.css(e, "boxSizing", !1, r), o = i, a = _e(e, t, r), s = "offset" + t[0].toUpperCase() + t.slice(1);
if ($e.test(a)) {
if (!n) return a;
a = "auto";
}
return (!y.boxSizingReliable() && i || "auto" === a || !parseFloat(a) && "inline" === k.css(e, "display", !1, r)) && e.getClientRects().length && (i = "border-box" === k.css(e, "boxSizing", !1, r), 
(o = s in e) && (a = e[s])), (a = parseFloat(a) || 0) + et(e, t, n || (i ? "border" : "content"), o, r, a) + "px";
}
function nt(e, t, n, r, i) {
return new nt.prototype.init(e, t, n, r, i);
}
k.extend({
cssHooks: {
opacity: {
get: function(e, t) {
if (t) {
var n = _e(e, "opacity");
return "" === n ? "1" : n;
}
}
}
},
cssNumber: {
animationIterationCount: !0,
columnCount: !0,
fillOpacity: !0,
flexGrow: !0,
flexShrink: !0,
fontWeight: !0,
gridArea: !0,
gridColumn: !0,
gridColumnEnd: !0,
gridColumnStart: !0,
gridRow: !0,
gridRowEnd: !0,
gridRowStart: !0,
lineHeight: !0,
opacity: !0,
order: !0,
orphans: !0,
widows: !0,
zIndex: !0,
zoom: !0
},
cssProps: {},
style: function(e, t, n, r) {
if (e && 3 !== e.nodeType && 8 !== e.nodeType && e.style) {
var i, o, a, s = V(t), u = Qe.test(t), l = e.style;
if (u || (t = Ge(s)), a = k.cssHooks[t] || k.cssHooks[s], void 0 === n) return a && "get" in a && void 0 !== (i = a.get(e, !1, r)) ? i : l[t];
"string" === (o = typeof n) && (i = ne.exec(n)) && i[1] && (n = le(e, t, i), o = "number"), 
null != n && n == n && ("number" !== o || u || (n += i && i[3] || (k.cssNumber[s] ? "" : "px")), 
y.clearCloneStyle || "" !== n || 0 !== t.indexOf("background") || (l[t] = "inherit"), 
a && "set" in a && void 0 === (n = a.set(e, n, r)) || (u ? l.setProperty(t, n) : l[t] = n));
}
},
css: function(e, t, n, r) {
var i, o, a, s = V(t);
return Qe.test(t) || (t = Ge(s)), (a = k.cssHooks[t] || k.cssHooks[s]) && "get" in a && (i = a.get(e, !0, n)), 
void 0 === i && (i = _e(e, t, r)), "normal" === i && t in Ke && (i = Ke[t]), "" === n || n ? (o = parseFloat(i), 
!0 === n || isFinite(o) ? o || 0 : i) : i;
}
}), k.each([ "height", "width" ], function(e, u) {
k.cssHooks[u] = {
get: function(e, t, n) {
if (t) return !Ye.test(k.css(e, "display")) || e.getClientRects().length && e.getBoundingClientRect().width ? tt(e, u, n) : ue(e, Je, function() {
return tt(e, u, n);
});
},
set: function(e, t, n) {
var r, i = Fe(e), o = !y.scrollboxSize() && "absolute" === i.position, a = (o || n) && "border-box" === k.css(e, "boxSizing", !1, i), s = n ? et(e, u, n, a, i) : 0;
return a && o && (s -= Math.ceil(e["offset" + u[0].toUpperCase() + u.slice(1)] - parseFloat(i[u]) - et(e, u, "border", !1, i) - .5)), 
s && (r = ne.exec(t)) && "px" !== (r[3] || "px") && (e.style[u] = t, t = k.css(e, u)), 
Ze(0, t, s);
}
};
}), k.cssHooks.marginLeft = ze(y.reliableMarginLeft, function(e, t) {
if (t) return (parseFloat(_e(e, "marginLeft")) || e.getBoundingClientRect().left - ue(e, {
marginLeft: 0
}, function() {
return e.getBoundingClientRect().left;
})) + "px";
}), k.each({
margin: "",
padding: "",
border: "Width"
}, function(i, o) {
k.cssHooks[i + o] = {
expand: function(e) {
for (var t = 0, n = {}, r = "string" == typeof e ? e.split(" ") : [ e ]; t < 4; t++) n[i + re[t] + o] = r[t] || r[t - 2] || r[0];
return n;
}
}, "margin" !== i && (k.cssHooks[i + o].set = Ze);
}), k.fn.extend({
css: function(e, t) {
return _(this, function(e, t, n) {
var r, i, o = {}, a = 0;
if (Array.isArray(t)) {
for (r = Fe(e), i = t.length; a < i; a++) o[t[a]] = k.css(e, t[a], !1, r);
return o;
}
return void 0 !== n ? k.style(e, t, n) : k.css(e, t);
}, e, t, 1 < arguments.length);
}
}), ((k.Tween = nt).prototype = {
constructor: nt,
init: function(e, t, n, r, i, o) {
this.elem = e, this.prop = n, this.easing = i || k.easing._default, this.options = t, 
this.start = this.now = this.cur(), this.end = r, this.unit = o || (k.cssNumber[n] ? "" : "px");
},
cur: function() {
var e = nt.propHooks[this.prop];
return e && e.get ? e.get(this) : nt.propHooks._default.get(this);
},
run: function(e) {
var t, n = nt.propHooks[this.prop];
return this.options.duration ? this.pos = t = k.easing[this.easing](e, this.options.duration * e, 0, 1, this.options.duration) : this.pos = t = e, 
this.now = (this.end - this.start) * t + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), 
n && n.set ? n.set(this) : nt.propHooks._default.set(this), this;
}
}).init.prototype = nt.prototype, (nt.propHooks = {
_default: {
get: function(e) {
var t;
return 1 !== e.elem.nodeType || null != e.elem[e.prop] && null == e.elem.style[e.prop] ? e.elem[e.prop] : (t = k.css(e.elem, e.prop, "")) && "auto" !== t ? t : 0;
},
set: function(e) {
k.fx.step[e.prop] ? k.fx.step[e.prop](e) : 1 !== e.elem.nodeType || !k.cssHooks[e.prop] && null == e.elem.style[Ge(e.prop)] ? e.elem[e.prop] = e.now : k.style(e.elem, e.prop, e.now + e.unit);
}
}
}).scrollTop = nt.propHooks.scrollLeft = {
set: function(e) {
e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now);
}
}, k.easing = {
linear: function(e) {
return e;
},
swing: function(e) {
return .5 - Math.cos(e * Math.PI) / 2;
},
_default: "swing"
}, k.fx = nt.prototype.init, k.fx.step = {};
var rt, it, ot, at, st = /^(?:toggle|show|hide)$/, ut = /queueHooks$/;
function lt() {
it && (!1 === E.hidden && C.requestAnimationFrame ? C.requestAnimationFrame(lt) : C.setTimeout(lt, k.fx.interval), 
k.fx.tick());
}
function ct() {
return C.setTimeout(function() {
rt = void 0;
}), rt = Date.now();
}
function ft(e, t) {
var n, r = 0, i = {
height: e
};
for (t = t ? 1 : 0; r < 4; r += 2 - t) i["margin" + (n = re[r])] = i["padding" + n] = e;
return t && (i.opacity = i.width = e), i;
}
function pt(e, t, n) {
for (var r, i = (dt.tweeners[t] || []).concat(dt.tweeners["*"]), o = 0, a = i.length; o < a; o++) if (r = i[o].call(n, t, e)) return r;
}
function dt(o, e, t) {
var n, a, r = 0, i = dt.prefilters.length, s = k.Deferred().always(function() {
delete u.elem;
}), u = function() {
if (a) return !1;
for (var e = rt || ct(), t = Math.max(0, l.startTime + l.duration - e), n = 1 - (t / l.duration || 0), r = 0, i = l.tweens.length; r < i; r++) l.tweens[r].run(n);
return s.notifyWith(o, [ l, n, t ]), n < 1 && i ? t : (i || s.notifyWith(o, [ l, 1, 0 ]), 
s.resolveWith(o, [ l ]), !1);
}, l = s.promise({
elem: o,
props: k.extend({}, e),
opts: k.extend(!0, {
specialEasing: {},
easing: k.easing._default
}, t),
originalProperties: e,
originalOptions: t,
startTime: rt || ct(),
duration: t.duration,
tweens: [],
createTween: function(e, t) {
var n = k.Tween(o, l.opts, e, t, l.opts.specialEasing[e] || l.opts.easing);
return l.tweens.push(n), n;
},
stop: function(e) {
var t = 0, n = e ? l.tweens.length : 0;
if (a) return this;
for (a = !0; t < n; t++) l.tweens[t].run(1);
return e ? (s.notifyWith(o, [ l, 1, 0 ]), s.resolveWith(o, [ l, e ])) : s.rejectWith(o, [ l, e ]), 
this;
}
}), c = l.props;
for (!function(e, t) {
var n, r, i, o, a;
for (n in e) if (i = t[r = V(n)], o = e[n], Array.isArray(o) && (i = o[1], o = e[n] = o[0]), 
n !== r && (e[r] = o, delete e[n]), (a = k.cssHooks[r]) && "expand" in a) for (n in o = a.expand(o), 
delete e[r], o) n in e || (e[n] = o[n], t[n] = i); else t[r] = i;
}(c, l.opts.specialEasing); r < i; r++) if (n = dt.prefilters[r].call(l, o, c, l.opts)) return m(n.stop) && (k._queueHooks(l.elem, l.opts.queue).stop = n.stop.bind(n)), 
n;
return k.map(c, pt, l), m(l.opts.start) && l.opts.start.call(o, l), l.progress(l.opts.progress).done(l.opts.done, l.opts.complete).fail(l.opts.fail).always(l.opts.always), 
k.fx.timer(k.extend(u, {
elem: o,
anim: l,
queue: l.opts.queue
})), l;
}
k.Animation = k.extend(dt, {
tweeners: {
"*": [ function(e, t) {
var n = this.createTween(e, t);
return le(n.elem, e, ne.exec(t), n), n;
} ]
},
tweener: function(e, t) {
m(e) ? (t = e, e = [ "*" ]) : e = e.match(R);
for (var n, r = 0, i = e.length; r < i; r++) n = e[r], dt.tweeners[n] = dt.tweeners[n] || [], 
dt.tweeners[n].unshift(t);
},
prefilters: [ function(e, t, n) {
var r, i, o, a, s, u, l, c, f = "width" in t || "height" in t, p = this, d = {}, h = e.style, g = e.nodeType && se(e), v = Q.get(e, "fxshow");
for (r in n.queue || (null == (a = k._queueHooks(e, "fx")).unqueued && (a.unqueued = 0, 
s = a.empty.fire, a.empty.fire = function() {
a.unqueued || s();
}), a.unqueued++, p.always(function() {
p.always(function() {
a.unqueued--, k.queue(e, "fx").length || a.empty.fire();
});
})), t) if (i = t[r], st.test(i)) {
if (delete t[r], o = o || "toggle" === i, i === (g ? "hide" : "show")) {
if ("show" !== i || !v || void 0 === v[r]) continue;
g = !0;
}
d[r] = v && v[r] || k.style(e, r);
}
if ((u = !k.isEmptyObject(t)) || !k.isEmptyObject(d)) for (r in f && 1 === e.nodeType && (n.overflow = [ h.overflow, h.overflowX, h.overflowY ], 
null == (l = v && v.display) && (l = Q.get(e, "display")), "none" === (c = k.css(e, "display")) && (l ? c = l : (fe([ e ], !0), 
l = e.style.display || l, c = k.css(e, "display"), fe([ e ]))), ("inline" === c || "inline-block" === c && null != l) && "none" === k.css(e, "float") && (u || (p.done(function() {
h.display = l;
}), null == l && (c = h.display, l = "none" === c ? "" : c)), h.display = "inline-block")), 
n.overflow && (h.overflow = "hidden", p.always(function() {
h.overflow = n.overflow[0], h.overflowX = n.overflow[1], h.overflowY = n.overflow[2];
})), u = !1, d) u || (v ? "hidden" in v && (g = v.hidden) : v = Q.access(e, "fxshow", {
display: l
}), o && (v.hidden = !g), g && fe([ e ], !0), p.done(function() {
for (r in g || fe([ e ]), Q.remove(e, "fxshow"), d) k.style(e, r, d[r]);
})), u = pt(g ? v[r] : 0, r, p), r in v || (v[r] = u.start, g && (u.end = u.start, 
u.start = 0));
} ],
prefilter: function(e, t) {
t ? dt.prefilters.unshift(e) : dt.prefilters.push(e);
}
}), k.speed = function(e, t, n) {
var r = e && "object" == typeof e ? k.extend({}, e) : {
complete: n || !n && t || m(e) && e,
duration: e,
easing: n && t || t && !m(t) && t
};
return k.fx.off ? r.duration = 0 : "number" != typeof r.duration && (r.duration in k.fx.speeds ? r.duration = k.fx.speeds[r.duration] : r.duration = k.fx.speeds._default), 
null != r.queue && !0 !== r.queue || (r.queue = "fx"), r.old = r.complete, r.complete = function() {
m(r.old) && r.old.call(this), r.queue && k.dequeue(this, r.queue);
}, r;
}, k.fn.extend({
fadeTo: function(e, t, n, r) {
return this.filter(se).css("opacity", 0).show().end().animate({
opacity: t
}, e, n, r);
},
animate: function(t, e, n, r) {
var i = k.isEmptyObject(t), o = k.speed(e, n, r), a = function() {
var e = dt(this, k.extend({}, t), o);
(i || Q.get(this, "finish")) && e.stop(!0);
};
return a.finish = a, i || !1 === o.queue ? this.each(a) : this.queue(o.queue, a);
},
stop: function(i, e, o) {
var a = function(e) {
var t = e.stop;
delete e.stop, t(o);
};
return "string" != typeof i && (o = e, e = i, i = void 0), e && !1 !== i && this.queue(i || "fx", []), 
this.each(function() {
var e = !0, t = null != i && i + "queueHooks", n = k.timers, r = Q.get(this);
if (t) r[t] && r[t].stop && a(r[t]); else for (t in r) r[t] && r[t].stop && ut.test(t) && a(r[t]);
for (t = n.length; t--; ) n[t].elem !== this || null != i && n[t].queue !== i || (n[t].anim.stop(o), 
e = !1, n.splice(t, 1));
!e && o || k.dequeue(this, i);
});
},
finish: function(a) {
return !1 !== a && (a = a || "fx"), this.each(function() {
var e, t = Q.get(this), n = t[a + "queue"], r = t[a + "queueHooks"], i = k.timers, o = n ? n.length : 0;
for (t.finish = !0, k.queue(this, a, []), r && r.stop && r.stop.call(this, !0), 
e = i.length; e--; ) i[e].elem === this && i[e].queue === a && (i[e].anim.stop(!0), 
i.splice(e, 1));
for (e = 0; e < o; e++) n[e] && n[e].finish && n[e].finish.call(this);
delete t.finish;
});
}
}), k.each([ "toggle", "show", "hide" ], function(e, r) {
var i = k.fn[r];
k.fn[r] = function(e, t, n) {
return null == e || "boolean" == typeof e ? i.apply(this, arguments) : this.animate(ft(r, !0), e, t, n);
};
}), k.each({
slideDown: ft("show"),
slideUp: ft("hide"),
slideToggle: ft("toggle"),
fadeIn: {
opacity: "show"
},
fadeOut: {
opacity: "hide"
},
fadeToggle: {
opacity: "toggle"
}
}, function(e, r) {
k.fn[e] = function(e, t, n) {
return this.animate(r, e, t, n);
};
}), k.timers = [], k.fx.tick = function() {
var e, t = 0, n = k.timers;
for (rt = Date.now(); t < n.length; t++) (e = n[t])() || n[t] !== e || n.splice(t--, 1);
n.length || k.fx.stop(), rt = void 0;
}, k.fx.timer = function(e) {
k.timers.push(e), k.fx.start();
}, k.fx.interval = 13, k.fx.start = function() {
it || (it = !0, lt());
}, k.fx.stop = function() {
it = null;
}, k.fx.speeds = {
slow: 600,
fast: 200,
_default: 400
}, k.fn.delay = function(r, e) {
return r = k.fx && k.fx.speeds[r] || r, e = e || "fx", this.queue(e, function(e, t) {
var n = C.setTimeout(e, r);
t.stop = function() {
C.clearTimeout(n);
};
});
}, ot = E.createElement("input"), at = E.createElement("select").appendChild(E.createElement("option")), 
ot.type = "checkbox", y.checkOn = "" !== ot.value, y.optSelected = at.selected, 
(ot = E.createElement("input")).value = "t", ot.type = "radio", y.radioValue = "t" === ot.value;
var ht, gt = k.expr.attrHandle;
k.fn.extend({
attr: function(e, t) {
return _(this, k.attr, e, t, 1 < arguments.length);
},
removeAttr: function(e) {
return this.each(function() {
k.removeAttr(this, e);
});
}
}), k.extend({
attr: function(e, t, n) {
var r, i, o = e.nodeType;
if (3 !== o && 8 !== o && 2 !== o) return "undefined" == typeof e.getAttribute ? k.prop(e, t, n) : (1 === o && k.isXMLDoc(e) || (i = k.attrHooks[t.toLowerCase()] || (k.expr.match.bool.test(t) ? ht : void 0)), 
void 0 !== n ? null === n ? void k.removeAttr(e, t) : i && "set" in i && void 0 !== (r = i.set(e, n, t)) ? r : (e.setAttribute(t, n + ""), 
n) : i && "get" in i && null !== (r = i.get(e, t)) ? r : null == (r = k.find.attr(e, t)) ? void 0 : r);
},
attrHooks: {
type: {
set: function(e, t) {
if (!y.radioValue && "radio" === t && A(e, "input")) {
var n = e.value;
return e.setAttribute("type", t), n && (e.value = n), t;
}
}
}
},
removeAttr: function(e, t) {
var n, r = 0, i = t && t.match(R);
if (i && 1 === e.nodeType) while (n = i[r++]) e.removeAttribute(n);
}
}), ht = {
set: function(e, t, n) {
return !1 === t ? k.removeAttr(e, n) : e.setAttribute(n, n), n;
}
}, k.each(k.expr.match.bool.source.match(/\w+/g), function(e, t) {
var a = gt[t] || k.find.attr;
gt[t] = function(e, t, n) {
var r, i, o = t.toLowerCase();
return n || (i = gt[o], gt[o] = r, r = null != a(e, t, n) ? o : null, gt[o] = i), 
r;
};
});
var vt = /^(?:input|select|textarea|button)$/i, yt = /^(?:a|area)$/i;
function mt(e) {
return (e.match(R) || []).join(" ");
}
function xt(e) {
return e.getAttribute && e.getAttribute("class") || "";
}
function bt(e) {
return Array.isArray(e) ? e : "string" == typeof e && e.match(R) || [];
}
k.fn.extend({
prop: function(e, t) {
return _(this, k.prop, e, t, 1 < arguments.length);
},
removeProp: function(e) {
return this.each(function() {
delete this[k.propFix[e] || e];
});
}
}), k.extend({
prop: function(e, t, n) {
var r, i, o = e.nodeType;
if (3 !== o && 8 !== o && 2 !== o) return 1 === o && k.isXMLDoc(e) || (t = k.propFix[t] || t, 
i = k.propHooks[t]), void 0 !== n ? i && "set" in i && void 0 !== (r = i.set(e, n, t)) ? r : e[t] = n : i && "get" in i && null !== (r = i.get(e, t)) ? r : e[t];
},
propHooks: {
tabIndex: {
get: function(e) {
var t = k.find.attr(e, "tabindex");
return t ? parseInt(t, 10) : vt.test(e.nodeName) || yt.test(e.nodeName) && e.href ? 0 : -1;
}
}
},
propFix: {
for: "htmlFor",
class: "className"
}
}), y.optSelected || (k.propHooks.selected = {
get: function(e) {
var t = e.parentNode;
return t && t.parentNode && t.parentNode.selectedIndex, null;
},
set: function(e) {
var t = e.parentNode;
t && (t.selectedIndex, t.parentNode && t.parentNode.selectedIndex);
}
}), k.each([ "tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable" ], function() {
k.propFix[this.toLowerCase()] = this;
}), k.fn.extend({
addClass: function(t) {
var e, n, r, i, o, a, s, u = 0;
if (m(t)) return this.each(function(e) {
k(this).addClass(t.call(this, e, xt(this)));
});
if ((e = bt(t)).length) while (n = this[u++]) if (i = xt(n), r = 1 === n.nodeType && " " + mt(i) + " ") {
a = 0;
while (o = e[a++]) r.indexOf(" " + o + " ") < 0 && (r += o + " ");
i !== (s = mt(r)) && n.setAttribute("class", s);
}
return this;
},
removeClass: function(t) {
var e, n, r, i, o, a, s, u = 0;
if (m(t)) return this.each(function(e) {
k(this).removeClass(t.call(this, e, xt(this)));
});
if (!arguments.length) return this.attr("class", "");
if ((e = bt(t)).length) while (n = this[u++]) if (i = xt(n), r = 1 === n.nodeType && " " + mt(i) + " ") {
a = 0;
while (o = e[a++]) while (-1 < r.indexOf(" " + o + " ")) r = r.replace(" " + o + " ", " ");
i !== (s = mt(r)) && n.setAttribute("class", s);
}
return this;
},
toggleClass: function(i, t) {
var o = typeof i, a = "string" === o || Array.isArray(i);
return "boolean" == typeof t && a ? t ? this.addClass(i) : this.removeClass(i) : m(i) ? this.each(function(e) {
k(this).toggleClass(i.call(this, e, xt(this), t), t);
}) : this.each(function() {
var e, t, n, r;
if (a) {
t = 0, n = k(this), r = bt(i);
while (e = r[t++]) n.hasClass(e) ? n.removeClass(e) : n.addClass(e);
} else void 0 !== i && "boolean" !== o || ((e = xt(this)) && Q.set(this, "__className__", e), 
this.setAttribute && this.setAttribute("class", e || !1 === i ? "" : Q.get(this, "__className__") || ""));
});
},
hasClass: function(e) {
var t, n, r = 0;
t = " " + e + " ";
while (n = this[r++]) if (1 === n.nodeType && -1 < (" " + mt(xt(n)) + " ").indexOf(t)) return !0;
return !1;
}
});
var wt = /\r/g;
k.fn.extend({
val: function(n) {
var r, e, i, t = this[0];
return arguments.length ? (i = m(n), this.each(function(e) {
var t;
1 === this.nodeType && (null == (t = i ? n.call(this, e, k(this).val()) : n) ? t = "" : "number" == typeof t ? t += "" : Array.isArray(t) && (t = k.map(t, function(e) {
return null == e ? "" : e + "";
})), (r = k.valHooks[this.type] || k.valHooks[this.nodeName.toLowerCase()]) && "set" in r && void 0 !== r.set(this, t, "value") || (this.value = t));
})) : t ? (r = k.valHooks[t.type] || k.valHooks[t.nodeName.toLowerCase()]) && "get" in r && void 0 !== (e = r.get(t, "value")) ? e : "string" == typeof (e = t.value) ? e.replace(wt, "") : null == e ? "" : e : void 0;
}
}), k.extend({
valHooks: {
option: {
get: function(e) {
var t = k.find.attr(e, "value");
return null != t ? t : mt(k.text(e));
}
},
select: {
get: function(e) {
var t, n, r, i = e.options, o = e.selectedIndex, a = "select-one" === e.type, s = a ? null : [], u = a ? o + 1 : i.length;
for (r = o < 0 ? u : a ? o : 0; r < u; r++) if (((n = i[r]).selected || r === o) && !n.disabled && (!n.parentNode.disabled || !A(n.parentNode, "optgroup"))) {
if (t = k(n).val(), a) return t;
s.push(t);
}
return s;
},
set: function(e, t) {
var n, r, i = e.options, o = k.makeArray(t), a = i.length;
while (a--) ((r = i[a]).selected = -1 < k.inArray(k.valHooks.option.get(r), o)) && (n = !0);
return n || (e.selectedIndex = -1), o;
}
}
}
}), k.each([ "radio", "checkbox" ], function() {
k.valHooks[this] = {
set: function(e, t) {
if (Array.isArray(t)) return e.checked = -1 < k.inArray(k(e).val(), t);
}
}, y.checkOn || (k.valHooks[this].get = function(e) {
return null === e.getAttribute("value") ? "on" : e.value;
});
}), y.focusin = "onfocusin" in C;
var Tt = /^(?:focusinfocus|focusoutblur)$/, Ct = function(e) {
e.stopPropagation();
};
k.extend(k.event, {
trigger: function(e, t, n, r) {
var i, o, a, s, u, l, c, f, p = [ n || E ], d = v.call(e, "type") ? e.type : e, h = v.call(e, "namespace") ? e.namespace.split(".") : [];
if (o = f = a = n = n || E, 3 !== n.nodeType && 8 !== n.nodeType && !Tt.test(d + k.event.triggered) && (-1 < d.indexOf(".") && (d = (h = d.split(".")).shift(), 
h.sort()), u = d.indexOf(":") < 0 && "on" + d, (e = e[k.expando] ? e : new k.Event(d, "object" == typeof e && e)).isTrigger = r ? 2 : 3, 
e.namespace = h.join("."), e.rnamespace = e.namespace ? new RegExp("(^|\\.)" + h.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, 
e.result = void 0, e.target || (e.target = n), t = null == t ? [ e ] : k.makeArray(t, [ e ]), 
c = k.event.special[d] || {}, r || !c.trigger || !1 !== c.trigger.apply(n, t))) {
if (!r && !c.noBubble && !x(n)) {
for (s = c.delegateType || d, Tt.test(s + d) || (o = o.parentNode); o; o = o.parentNode) p.push(o), 
a = o;
a === (n.ownerDocument || E) && p.push(a.defaultView || a.parentWindow || C);
}
i = 0;
while ((o = p[i++]) && !e.isPropagationStopped()) f = o, e.type = 1 < i ? s : c.bindType || d, 
(l = (Q.get(o, "events") || {})[e.type] && Q.get(o, "handle")) && l.apply(o, t), 
(l = u && o[u]) && l.apply && G(o) && (e.result = l.apply(o, t), !1 === e.result && e.preventDefault());
return e.type = d, r || e.isDefaultPrevented() || c._default && !1 !== c._default.apply(p.pop(), t) || !G(n) || u && m(n[d]) && !x(n) && ((a = n[u]) && (n[u] = null), 
k.event.triggered = d, e.isPropagationStopped() && f.addEventListener(d, Ct), n[d](), 
e.isPropagationStopped() && f.removeEventListener(d, Ct), k.event.triggered = void 0, 
a && (n[u] = a)), e.result;
}
},
simulate: function(e, t, n) {
var r = k.extend(new k.Event(), n, {
type: e,
isSimulated: !0
});
k.event.trigger(r, null, t);
}
}), k.fn.extend({
trigger: function(e, t) {
return this.each(function() {
k.event.trigger(e, t, this);
});
},
triggerHandler: function(e, t) {
var n = this[0];
if (n) return k.event.trigger(e, t, n, !0);
}
}), y.focusin || k.each({
focus: "focusin",
blur: "focusout"
}, function(n, r) {
var i = function(e) {
k.event.simulate(r, e.target, k.event.fix(e));
};
k.event.special[r] = {
setup: function() {
var e = this.ownerDocument || this, t = Q.access(e, r);
t || e.addEventListener(n, i, !0), Q.access(e, r, (t || 0) + 1);
},
teardown: function() {
var e = this.ownerDocument || this, t = Q.access(e, r) - 1;
t ? Q.access(e, r, t) : (e.removeEventListener(n, i, !0), Q.remove(e, r));
}
};
});
var Et = C.location, kt = Date.now(), St = /\?/;
k.parseXML = function(e) {
var t;
if (!e || "string" != typeof e) return null;
try {
t = new C.DOMParser().parseFromString(e, "text/xml");
} catch (e) {
t = void 0;
}
return t && !t.getElementsByTagName("parsererror").length || k.error("Invalid XML: " + e), 
t;
};
var Nt = /\[\]$/, At = /\r?\n/g, Dt = /^(?:submit|button|image|reset|file)$/i, jt = /^(?:input|select|textarea|keygen)/i;
function qt(n, e, r, i) {
var t;
if (Array.isArray(e)) k.each(e, function(e, t) {
r || Nt.test(n) ? i(n, t) : qt(n + "[" + ("object" == typeof t && null != t ? e : "") + "]", t, r, i);
}); else if (r || "object" !== w(e)) i(n, e); else for (t in e) qt(n + "[" + t + "]", e[t], r, i);
}
k.param = function(e, t) {
var n, r = [], i = function(e, t) {
var n = m(t) ? t() : t;
r[r.length] = encodeURIComponent(e) + "=" + encodeURIComponent(null == n ? "" : n);
};
if (null == e) return "";
if (Array.isArray(e) || e.jquery && !k.isPlainObject(e)) k.each(e, function() {
i(this.name, this.value);
}); else for (n in e) qt(n, e[n], t, i);
return r.join("&");
}, k.fn.extend({
serialize: function() {
return k.param(this.serializeArray());
},
serializeArray: function() {
return this.map(function() {
var e = k.prop(this, "elements");
return e ? k.makeArray(e) : this;
}).filter(function() {
var e = this.type;
return this.name && !k(this).is(":disabled") && jt.test(this.nodeName) && !Dt.test(e) && (this.checked || !pe.test(e));
}).map(function(e, t) {
var n = k(this).val();
return null == n ? null : Array.isArray(n) ? k.map(n, function(e) {
return {
name: t.name,
value: e.replace(At, "\r\n")
};
}) : {
name: t.name,
value: n.replace(At, "\r\n")
};
}).get();
}
});
var Lt = /%20/g, Ht = /#.*$/, Ot = /([?&])_=[^&]*/, Pt = /^(.*?):[ \t]*([^\r\n]*)$/gm, Rt = /^(?:GET|HEAD)$/, Mt = /^\/\//, It = {}, Wt = {}, $t = "*/".concat("*"), Ft = E.createElement("a");
function Bt(o) {
return function(e, t) {
"string" != typeof e && (t = e, e = "*");
var n, r = 0, i = e.toLowerCase().match(R) || [];
if (m(t)) while (n = i[r++]) "+" === n[0] ? (n = n.slice(1) || "*", (o[n] = o[n] || []).unshift(t)) : (o[n] = o[n] || []).push(t);
};
}
function _t(t, i, o, a) {
var s = {}, u = t === Wt;
function l(e) {
var r;
return s[e] = !0, k.each(t[e] || [], function(e, t) {
var n = t(i, o, a);
return "string" != typeof n || u || s[n] ? u ? !(r = n) : void 0 : (i.dataTypes.unshift(n), 
l(n), !1);
}), r;
}
return l(i.dataTypes[0]) || !s["*"] && l("*");
}
function zt(e, t) {
var n, r, i = k.ajaxSettings.flatOptions || {};
for (n in t) void 0 !== t[n] && ((i[n] ? e : r || (r = {}))[n] = t[n]);
return r && k.extend(!0, e, r), e;
}
Ft.href = Et.href, k.extend({
active: 0,
lastModified: {},
etag: {},
ajaxSettings: {
url: Et.href,
type: "GET",
isLocal: /^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(Et.protocol),
global: !0,
processData: !0,
async: !0,
contentType: "application/x-www-form-urlencoded; charset=UTF-8",
accepts: {
"*": $t,
text: "text/plain",
html: "text/html",
xml: "application/xml, text/xml",
json: "application/json, text/javascript"
},
contents: {
xml: /\bxml\b/,
html: /\bhtml/,
json: /\bjson\b/
},
responseFields: {
xml: "responseXML",
text: "responseText",
json: "responseJSON"
},
converters: {
"* text": String,
"text html": !0,
"text json": JSON.parse,
"text xml": k.parseXML
},
flatOptions: {
url: !0,
context: !0
}
},
ajaxSetup: function(e, t) {
return t ? zt(zt(e, k.ajaxSettings), t) : zt(k.ajaxSettings, e);
},
ajaxPrefilter: Bt(It),
ajaxTransport: Bt(Wt),
ajax: function(e, t) {
"object" == typeof e && (t = e, e = void 0), t = t || {};
var c, f, p, n, d, r, h, g, i, o, v = k.ajaxSetup({}, t), y = v.context || v, m = v.context && (y.nodeType || y.jquery) ? k(y) : k.event, x = k.Deferred(), b = k.Callbacks("once memory"), w = v.statusCode || {}, a = {}, s = {}, u = "canceled", T = {
readyState: 0,
getResponseHeader: function(e) {
var t;
if (h) {
if (!n) {
n = {};
while (t = Pt.exec(p)) n[t[1].toLowerCase() + " "] = (n[t[1].toLowerCase() + " "] || []).concat(t[2]);
}
t = n[e.toLowerCase() + " "];
}
return null == t ? null : t.join(", ");
},
getAllResponseHeaders: function() {
return h ? p : null;
},
setRequestHeader: function(e, t) {
return null == h && (e = s[e.toLowerCase()] = s[e.toLowerCase()] || e, a[e] = t), 
this;
},
overrideMimeType: function(e) {
return null == h && (v.mimeType = e), this;
},
statusCode: function(e) {
var t;
if (e) if (h) T.always(e[T.status]); else for (t in e) w[t] = [ w[t], e[t] ];
return this;
},
abort: function(e) {
var t = e || u;
return c && c.abort(t), l(0, t), this;
}
};
if (x.promise(T), v.url = ((e || v.url || Et.href) + "").replace(Mt, Et.protocol + "//"), 
v.type = t.method || t.type || v.method || v.type, v.dataTypes = (v.dataType || "*").toLowerCase().match(R) || [ "" ], 
null == v.crossDomain) {
r = E.createElement("a");
try {
r.href = v.url, r.href = r.href, v.crossDomain = Ft.protocol + "//" + Ft.host != r.protocol + "//" + r.host;
} catch (e) {
v.crossDomain = !0;
}
}
if (v.data && v.processData && "string" != typeof v.data && (v.data = k.param(v.data, v.traditional)), 
_t(It, v, t, T), h) return T;
for (i in (g = k.event && v.global) && 0 == k.active++ && k.event.trigger("ajaxStart"), 
v.type = v.type.toUpperCase(), v.hasContent = !Rt.test(v.type), f = v.url.replace(Ht, ""), 
v.hasContent ? v.data && v.processData && 0 === (v.contentType || "").indexOf("application/x-www-form-urlencoded") && (v.data = v.data.replace(Lt, "+")) : (o = v.url.slice(f.length), 
v.data && (v.processData || "string" == typeof v.data) && (f += (St.test(f) ? "&" : "?") + v.data, 
delete v.data), !1 === v.cache && (f = f.replace(Ot, "$1"), o = (St.test(f) ? "&" : "?") + "_=" + kt++ + o), 
v.url = f + o), v.ifModified && (k.lastModified[f] && T.setRequestHeader("If-Modified-Since", k.lastModified[f]), 
k.etag[f] && T.setRequestHeader("If-None-Match", k.etag[f])), (v.data && v.hasContent && !1 !== v.contentType || t.contentType) && T.setRequestHeader("Content-Type", v.contentType), 
T.setRequestHeader("Accept", v.dataTypes[0] && v.accepts[v.dataTypes[0]] ? v.accepts[v.dataTypes[0]] + ("*" !== v.dataTypes[0] ? ", " + $t + "; q=0.01" : "") : v.accepts["*"]), 
v.headers) T.setRequestHeader(i, v.headers[i]);
if (v.beforeSend && (!1 === v.beforeSend.call(y, T, v) || h)) return T.abort();
if (u = "abort", b.add(v.complete), T.done(v.success), T.fail(v.error), c = _t(Wt, v, t, T)) {
if (T.readyState = 1, g && m.trigger("ajaxSend", [ T, v ]), h) return T;
v.async && 0 < v.timeout && (d = C.setTimeout(function() {
T.abort("timeout");
}, v.timeout));
try {
h = !1, c.send(a, l);
} catch (e) {
if (h) throw e;
l(-1, e);
}
} else l(-1, "No Transport");
function l(e, t, n, r) {
var i, o, a, s, u, l = t;
h || (h = !0, d && C.clearTimeout(d), c = void 0, p = r || "", T.readyState = 0 < e ? 4 : 0, 
i = 200 <= e && e < 300 || 304 === e, n && (s = function(e, t, n) {
var r, i, o, a, s = e.contents, u = e.dataTypes;
while ("*" === u[0]) u.shift(), void 0 === r && (r = e.mimeType || t.getResponseHeader("Content-Type"));
if (r) for (i in s) if (s[i] && s[i].test(r)) {
u.unshift(i);
break;
}
if (u[0] in n) o = u[0]; else {
for (i in n) {
if (!u[0] || e.converters[i + " " + u[0]]) {
o = i;
break;
}
a || (a = i);
}
o = o || a;
}
if (o) return o !== u[0] && u.unshift(o), n[o];
}(v, T, n)), s = function(e, t, n, r) {
var i, o, a, s, u, l = {}, c = e.dataTypes.slice();
if (c[1]) for (a in e.converters) l[a.toLowerCase()] = e.converters[a];
o = c.shift();
while (o) if (e.responseFields[o] && (n[e.responseFields[o]] = t), !u && r && e.dataFilter && (t = e.dataFilter(t, e.dataType)), 
u = o, o = c.shift()) if ("*" === o) o = u; else if ("*" !== u && u !== o) {
if (!(a = l[u + " " + o] || l["* " + o])) for (i in l) if ((s = i.split(" "))[1] === o && (a = l[u + " " + s[0]] || l["* " + s[0]])) {
!0 === a ? a = l[i] : !0 !== l[i] && (o = s[0], c.unshift(s[1]));
break;
}
if (!0 !== a) if (a && e["throws"]) t = a(t); else try {
t = a(t);
} catch (e) {
return {
state: "parsererror",
error: a ? e : "No conversion from " + u + " to " + o
};
}
}
return {
state: "success",
data: t
};
}(v, s, T, i), i ? (v.ifModified && ((u = T.getResponseHeader("Last-Modified")) && (k.lastModified[f] = u), 
(u = T.getResponseHeader("etag")) && (k.etag[f] = u)), 204 === e || "HEAD" === v.type ? l = "nocontent" : 304 === e ? l = "notmodified" : (l = s.state, 
o = s.data, i = !(a = s.error))) : (a = l, !e && l || (l = "error", e < 0 && (e = 0))), 
T.status = e, T.statusText = (t || l) + "", i ? x.resolveWith(y, [ o, l, T ]) : x.rejectWith(y, [ T, l, a ]), 
T.statusCode(w), w = void 0, g && m.trigger(i ? "ajaxSuccess" : "ajaxError", [ T, v, i ? o : a ]), 
b.fireWith(y, [ T, l ]), g && (m.trigger("ajaxComplete", [ T, v ]), --k.active || k.event.trigger("ajaxStop")));
}
return T;
},
getJSON: function(e, t, n) {
return k.get(e, t, n, "json");
},
getScript: function(e, t) {
return k.get(e, void 0, t, "script");
}
}), k.each([ "get", "post" ], function(e, i) {
k[i] = function(e, t, n, r) {
return m(t) && (r = r || n, n = t, t = void 0), k.ajax(k.extend({
url: e,
type: i,
dataType: r,
data: t,
success: n
}, k.isPlainObject(e) && e));
};
}), k._evalUrl = function(e, t) {
return k.ajax({
url: e,
type: "GET",
dataType: "script",
cache: !0,
async: !1,
global: !1,
converters: {
"text script": function() {}
},
dataFilter: function(e) {
k.globalEval(e, t);
}
});
}, k.fn.extend({
wrapAll: function(e) {
var t;
return this[0] && (m(e) && (e = e.call(this[0])), t = k(e, this[0].ownerDocument).eq(0).clone(!0), 
this[0].parentNode && t.insertBefore(this[0]), t.map(function() {
var e = this;
while (e.firstElementChild) e = e.firstElementChild;
return e;
}).append(this)), this;
},
wrapInner: function(n) {
return m(n) ? this.each(function(e) {
k(this).wrapInner(n.call(this, e));
}) : this.each(function() {
var e = k(this), t = e.contents();
t.length ? t.wrapAll(n) : e.append(n);
});
},
wrap: function(t) {
var n = m(t);
return this.each(function(e) {
k(this).wrapAll(n ? t.call(this, e) : t);
});
},
unwrap: function(e) {
return this.parent(e).not("body").each(function() {
k(this).replaceWith(this.childNodes);
}), this;
}
}), k.expr.pseudos.hidden = function(e) {
return !k.expr.pseudos.visible(e);
}, k.expr.pseudos.visible = function(e) {
return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
}, k.ajaxSettings.xhr = function() {
try {
return new C.XMLHttpRequest();
} catch (e) {}
};
var Ut = {
0: 200,
1223: 204
}, Xt = k.ajaxSettings.xhr();
y.cors = !!Xt && "withCredentials" in Xt, y.ajax = Xt = !!Xt, k.ajaxTransport(function(i) {
var o, a;
if (y.cors || Xt && !i.crossDomain) return {
send: function(e, t) {
var n, r = i.xhr();
if (r.open(i.type, i.url, i.async, i.username, i.password), i.xhrFields) for (n in i.xhrFields) r[n] = i.xhrFields[n];
for (n in i.mimeType && r.overrideMimeType && r.overrideMimeType(i.mimeType), i.crossDomain || e["X-Requested-With"] || (e["X-Requested-With"] = "XMLHttpRequest"), 
e) r.setRequestHeader(n, e[n]);
o = function(e) {
return function() {
o && (o = a = r.onload = r.onerror = r.onabort = r.ontimeout = r.onreadystatechange = null, 
"abort" === e ? r.abort() : "error" === e ? "number" != typeof r.status ? t(0, "error") : t(r.status, r.statusText) : t(Ut[r.status] || r.status, r.statusText, "text" !== (r.responseType || "text") || "string" != typeof r.responseText ? {
binary: r.response
} : {
text: r.responseText
}, r.getAllResponseHeaders()));
};
}, r.onload = o(), a = r.onerror = r.ontimeout = o("error"), void 0 !== r.onabort ? r.onabort = a : r.onreadystatechange = function() {
4 === r.readyState && C.setTimeout(function() {
o && a();
});
}, o = o("abort");
try {
r.send(i.hasContent && i.data || null);
} catch (e) {
if (o) throw e;
}
},
abort: function() {
o && o();
}
};
}), k.ajaxPrefilter(function(e) {
e.crossDomain && (e.contents.script = !1);
}), k.ajaxSetup({
accepts: {
script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
},
contents: {
script: /\b(?:java|ecma)script\b/
},
converters: {
"text script": function(e) {
return k.globalEval(e), e;
}
}
}), k.ajaxPrefilter("script", function(e) {
void 0 === e.cache && (e.cache = !1), e.crossDomain && (e.type = "GET");
}), k.ajaxTransport("script", function(n) {
var r, i;
if (n.crossDomain || n.scriptAttrs) return {
send: function(e, t) {
r = k("<script>").attr(n.scriptAttrs || {}).prop({
charset: n.scriptCharset,
src: n.url
}).on("load error", i = function(e) {
r.remove(), i = null, e && t("error" === e.type ? 404 : 200, e.type);
}), E.head.appendChild(r[0]);
},
abort: function() {
i && i();
}
};
});
var Vt, Gt = [], Yt = /(=)\?(?=&|$)|\?\?/;
k.ajaxSetup({
jsonp: "callback",
jsonpCallback: function() {
var e = Gt.pop() || k.expando + "_" + kt++;
return this[e] = !0, e;
}
}), k.ajaxPrefilter("json jsonp", function(e, t, n) {
var r, i, o, a = !1 !== e.jsonp && (Yt.test(e.url) ? "url" : "string" == typeof e.data && 0 === (e.contentType || "").indexOf("application/x-www-form-urlencoded") && Yt.test(e.data) && "data");
if (a || "jsonp" === e.dataTypes[0]) return r = e.jsonpCallback = m(e.jsonpCallback) ? e.jsonpCallback() : e.jsonpCallback, 
a ? e[a] = e[a].replace(Yt, "$1" + r) : !1 !== e.jsonp && (e.url += (St.test(e.url) ? "&" : "?") + e.jsonp + "=" + r), 
e.converters["script json"] = function() {
return o || k.error(r + " was not called"), o[0];
}, e.dataTypes[0] = "json", i = C[r], C[r] = function() {
o = arguments;
}, n.always(function() {
void 0 === i ? k(C).removeProp(r) : C[r] = i, e[r] && (e.jsonpCallback = t.jsonpCallback, 
Gt.push(r)), o && m(i) && i(o[0]), o = i = void 0;
}), "script";
}), y.createHTMLDocument = ((Vt = E.implementation.createHTMLDocument("").body).innerHTML = "<form></form><form></form>", 
2 === Vt.childNodes.length), k.parseHTML = function(e, t, n) {
return "string" != typeof e ? [] : ("boolean" == typeof t && (n = t, t = !1), t || (y.createHTMLDocument ? ((r = (t = E.implementation.createHTMLDocument("")).createElement("base")).href = E.location.href, 
t.head.appendChild(r)) : t = E), o = !n && [], (i = D.exec(e)) ? [ t.createElement(i[1]) ] : (i = we([ e ], t, o), 
o && o.length && k(o).remove(), k.merge([], i.childNodes)));
var r, i, o;
}, k.fn.load = function(e, t, n) {
var r, i, o, a = this, s = e.indexOf(" ");
return -1 < s && (r = mt(e.slice(s)), e = e.slice(0, s)), m(t) ? (n = t, t = void 0) : t && "object" == typeof t && (i = "POST"), 
0 < a.length && k.ajax({
url: e,
type: i || "GET",
dataType: "html",
data: t
}).done(function(e) {
o = arguments, a.html(r ? k("<div>").append(k.parseHTML(e)).find(r) : e);
}).always(n && function(e, t) {
a.each(function() {
n.apply(this, o || [ e.responseText, t, e ]);
});
}), this;
}, k.each([ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function(e, t) {
k.fn[t] = function(e) {
return this.on(t, e);
};
}), k.expr.pseudos.animated = function(t) {
return k.grep(k.timers, function(e) {
return t === e.elem;
}).length;
}, k.offset = {
setOffset: function(e, t, n) {
var r, i, o, a, s, u, l = k.css(e, "position"), c = k(e), f = {};
"static" === l && (e.style.position = "relative"), s = c.offset(), o = k.css(e, "top"), 
u = k.css(e, "left"), ("absolute" === l || "fixed" === l) && -1 < (o + u).indexOf("auto") ? (a = (r = c.position()).top, 
i = r.left) : (a = parseFloat(o) || 0, i = parseFloat(u) || 0), m(t) && (t = t.call(e, n, k.extend({}, s))), 
null != t.top && (f.top = t.top - s.top + a), null != t.left && (f.left = t.left - s.left + i), 
"using" in t ? t.using.call(e, f) : c.css(f);
}
}, k.fn.extend({
offset: function(t) {
if (arguments.length) return void 0 === t ? this : this.each(function(e) {
k.offset.setOffset(this, t, e);
});
var e, n, r = this[0];
return r ? r.getClientRects().length ? (e = r.getBoundingClientRect(), n = r.ownerDocument.defaultView, 
{
top: e.top + n.pageYOffset,
left: e.left + n.pageXOffset
}) : {
top: 0,
left: 0
} : void 0;
},
position: function() {
if (this[0]) {
var e, t, n, r = this[0], i = {
top: 0,
left: 0
};
if ("fixed" === k.css(r, "position")) t = r.getBoundingClientRect(); else {
t = this.offset(), n = r.ownerDocument, e = r.offsetParent || n.documentElement;
while (e && (e === n.body || e === n.documentElement) && "static" === k.css(e, "position")) e = e.parentNode;
e && e !== r && 1 === e.nodeType && ((i = k(e).offset()).top += k.css(e, "borderTopWidth", !0), 
i.left += k.css(e, "borderLeftWidth", !0));
}
return {
top: t.top - i.top - k.css(r, "marginTop", !0),
left: t.left - i.left - k.css(r, "marginLeft", !0)
};
}
},
offsetParent: function() {
return this.map(function() {
var e = this.offsetParent;
while (e && "static" === k.css(e, "position")) e = e.offsetParent;
return e || ie;
});
}
}), k.each({
scrollLeft: "pageXOffset",
scrollTop: "pageYOffset"
}, function(t, i) {
var o = "pageYOffset" === i;
k.fn[t] = function(e) {
return _(this, function(e, t, n) {
var r;
if (x(e) ? r = e : 9 === e.nodeType && (r = e.defaultView), void 0 === n) return r ? r[i] : e[t];
r ? r.scrollTo(o ? r.pageXOffset : n, o ? n : r.pageYOffset) : e[t] = n;
}, t, e, arguments.length);
};
}), k.each([ "top", "left" ], function(e, n) {
k.cssHooks[n] = ze(y.pixelPosition, function(e, t) {
if (t) return t = _e(e, n), $e.test(t) ? k(e).position()[n] + "px" : t;
});
}), k.each({
Height: "height",
Width: "width"
}, function(a, s) {
k.each({
padding: "inner" + a,
content: s,
"": "outer" + a
}, function(r, o) {
k.fn[o] = function(e, t) {
var n = arguments.length && (r || "boolean" != typeof e), i = r || (!0 === e || !0 === t ? "margin" : "border");
return _(this, function(e, t, n) {
var r;
return x(e) ? 0 === o.indexOf("outer") ? e["inner" + a] : e.document.documentElement["client" + a] : 9 === e.nodeType ? (r = e.documentElement, 
Math.max(e.body["scroll" + a], r["scroll" + a], e.body["offset" + a], r["offset" + a], r["client" + a])) : void 0 === n ? k.css(e, t, i) : k.style(e, t, n, i);
}, s, n ? e : void 0, n);
};
});
}), k.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "), function(e, n) {
k.fn[n] = function(e, t) {
return 0 < arguments.length ? this.on(n, null, e, t) : this.trigger(n);
};
}), k.fn.extend({
hover: function(e, t) {
return this.mouseenter(e).mouseleave(t || e);
}
}), k.fn.extend({
bind: function(e, t, n) {
return this.on(e, null, t, n);
},
unbind: function(e, t) {
return this.off(e, null, t);
},
delegate: function(e, t, n, r) {
return this.on(t, e, n, r);
},
undelegate: function(e, t, n) {
return 1 === arguments.length ? this.off(e, "**") : this.off(t, e || "**", n);
}
}), k.proxy = function(e, t) {
var n, r, i;
if ("string" == typeof t && (n = e[t], t = e, e = n), m(e)) return r = s.call(arguments, 2), 
(i = function() {
return e.apply(t || this, r.concat(s.call(arguments)));
}).guid = e.guid = e.guid || k.guid++, i;
}, k.holdReady = function(e) {
e ? k.readyWait++ : k.ready(!0);
}, k.isArray = Array.isArray, k.parseJSON = JSON.parse, k.nodeName = A, k.isFunction = m, 
k.isWindow = x, k.camelCase = V, k.type = w, k.now = Date.now, k.isNumeric = function(e) {
var t = k.type(e);
return ("number" === t || "string" === t) && !isNaN(e - parseFloat(e));
}, "function" == typeof define && define.amd && define("jquery", [], function() {
return k;
});
var Qt = C.jQuery, Jt = C.$;
return k.noConflict = function(e) {
return C.$ === k && (C.$ = Jt), e && C.jQuery === k && (C.jQuery = Qt), k;
}, e || (C.jQuery = C.$ = k), k;
});

jQuery.fn.reverse = [].reverse;

$.fn.shuffle = function(selector) {
$(this).each(function() {
var $children = selector ? $(this).children(selector) : $(this).children();
$children.sort(function() {
return Math.round(Math.random()) - .5;
}).detach().appendTo(this);
});
return this;
};

(function($) {
$.fn.averageColor = function() {
var blockSize = 5, defaultRGB = {
r: 0,
g: 0,
b: 0
}, canvas = document.createElement("canvas"), context = canvas.getContext && canvas.getContext("2d"), data, width, height, i = -4, length, rgb = {
r: 0,
g: 0,
b: 0
}, count = 0;
if (!context) {
Logger.logErrorMessage("Canvas not supported");
return defaultRGB;
}
height = canvas.height = $(this).naturalHeight();
width = canvas.width = $(this).naturalWidth();
context.drawImage(this[0], 0, 0);
try {
data = context.getImageData(0, 0, width, height);
} catch (e) {
return defaultRGB;
}
length = data.data.length;
while ((i += blockSize * 4) < length) {
count += 1;
rgb.r += data.data[i];
rgb.g += data.data[i + 1];
rgb.b += data.data[i + 2];
}
rgb.r = ~~(rgb.r / count);
rgb.g = ~~(rgb.g / count);
rgb.b = ~~(rgb.b / count);
return rgb;
};
})(window.jQuery);

(function($) {
function img(url) {
var i = new Image();
i.src = url;
return i;
}
if ("naturalWidth" in new Image()) {
$.fn.naturalWidth = function() {
return this[0].naturalWidth;
};
$.fn.naturalHeight = function() {
return this[0].naturalHeight;
};
return;
}
$.fn.naturalWidth = function() {
return img(this.src).width;
};
$.fn.naturalHeight = function() {
return img(this.src).height;
};
})(jQuery);

(function(t) {
"function" == typeof define && define.amd ? define([ "jquery" ], t) : t(jQuery);
})(function(t) {
t.ui = t.ui || {}, t.ui.version = "1.12.1";
var e = 0, i = Array.prototype.slice;
t.cleanData = function(e) {
return function(i) {
var s, n, o;
for (o = 0; null != (n = i[o]); o++) try {
s = t._data(n, "events"), s && s.remove && t(n).triggerHandler("remove");
} catch (a) {}
e(i);
};
}(t.cleanData), t.widget = function(e, i, s) {
var n, o, a, r = {}, l = e.split(".")[0];
e = e.split(".")[1];
var h = l + "-" + e;
return s || (s = i, i = t.Widget), t.isArray(s) && (s = t.extend.apply(null, [ {} ].concat(s))), 
t.expr[":"][h.toLowerCase()] = function(e) {
return !!t.data(e, h);
}, t[l] = t[l] || {}, n = t[l][e], o = t[l][e] = function(t, e) {
return this._createWidget ? (arguments.length && this._createWidget(t, e), void 0) : new o(t, e);
}, t.extend(o, n, {
version: s.version,
_proto: t.extend({}, s),
_childConstructors: []
}), a = new i(), a.options = t.widget.extend({}, a.options), t.each(s, function(e, s) {
return t.isFunction(s) ? (r[e] = function() {
function t() {
return i.prototype[e].apply(this, arguments);
}
function n(t) {
return i.prototype[e].apply(this, t);
}
return function() {
var e, i = this._super, o = this._superApply;
return this._super = t, this._superApply = n, e = s.apply(this, arguments), this._super = i, 
this._superApply = o, e;
};
}(), void 0) : (r[e] = s, void 0);
}), o.prototype = t.widget.extend(a, {
widgetEventPrefix: n ? a.widgetEventPrefix || e : e
}, r, {
constructor: o,
namespace: l,
widgetName: e,
widgetFullName: h
}), n ? (t.each(n._childConstructors, function(e, i) {
var s = i.prototype;
t.widget(s.namespace + "." + s.widgetName, o, i._proto);
}), delete n._childConstructors) : i._childConstructors.push(o), t.widget.bridge(e, o), 
o;
}, t.widget.extend = function(e) {
for (var s, n, o = i.call(arguments, 1), a = 0, r = o.length; r > a; a++) for (s in o[a]) n = o[a][s], 
o[a].hasOwnProperty(s) && void 0 !== n && (e[s] = t.isPlainObject(n) ? t.isPlainObject(e[s]) ? t.widget.extend({}, e[s], n) : t.widget.extend({}, n) : n);
return e;
}, t.widget.bridge = function(e, s) {
var n = s.prototype.widgetFullName || e;
t.fn[e] = function(o) {
var a = "string" == typeof o, r = i.call(arguments, 1), l = this;
return a ? this.length || "instance" !== o ? this.each(function() {
var i, s = t.data(this, n);
return "instance" === o ? (l = s, !1) : s ? t.isFunction(s[o]) && "_" !== o.charAt(0) ? (i = s[o].apply(s, r), 
i !== s && void 0 !== i ? (l = i && i.jquery ? l.pushStack(i.get()) : i, !1) : void 0) : t.error("no such method '" + o + "' for " + e + " widget instance") : t.error("cannot call methods on " + e + " prior to initialization; " + "attempted to call method '" + o + "'");
}) : l = void 0 : (r.length && (o = t.widget.extend.apply(null, [ o ].concat(r))), 
this.each(function() {
var e = t.data(this, n);
e ? (e.option(o || {}), e._init && e._init()) : t.data(this, n, new s(o, this));
})), l;
};
}, t.Widget = function() {}, t.Widget._childConstructors = [], t.Widget.prototype = {
widgetName: "widget",
widgetEventPrefix: "",
defaultElement: "<div>",
options: {
classes: {},
disabled: !1,
create: null
},
_createWidget: function(i, s) {
s = t(s || this.defaultElement || this)[0], this.element = t(s), this.uuid = e++, 
this.eventNamespace = "." + this.widgetName + this.uuid, this.bindings = t(), this.hoverable = t(), 
this.focusable = t(), this.classesElementLookup = {}, s !== this && (t.data(s, this.widgetFullName, this), 
this._on(!0, this.element, {
remove: function(t) {
t.target === s && this.destroy();
}
}), this.document = t(s.style ? s.ownerDocument : s.document || s), this.window = t(this.document[0].defaultView || this.document[0].parentWindow)), 
this.options = t.widget.extend({}, this.options, this._getCreateOptions(), i), this._create(), 
this.options.disabled && this._setOptionDisabled(this.options.disabled), this._trigger("create", null, this._getCreateEventData()), 
this._init();
},
_getCreateOptions: function() {
return {};
},
_getCreateEventData: t.noop,
_create: t.noop,
_init: t.noop,
destroy: function() {
var e = this;
this._destroy(), t.each(this.classesElementLookup, function(t, i) {
e._removeClass(i, t);
}), this.element.off(this.eventNamespace).removeData(this.widgetFullName), this.widget().off(this.eventNamespace).removeAttr("aria-disabled"), 
this.bindings.off(this.eventNamespace);
},
_destroy: t.noop,
widget: function() {
return this.element;
},
option: function(e, i) {
var s, n, o, a = e;
if (0 === arguments.length) return t.widget.extend({}, this.options);
if ("string" == typeof e) if (a = {}, s = e.split("."), e = s.shift(), s.length) {
for (n = a[e] = t.widget.extend({}, this.options[e]), o = 0; s.length - 1 > o; o++) n[s[o]] = n[s[o]] || {}, 
n = n[s[o]];
if (e = s.pop(), 1 === arguments.length) return void 0 === n[e] ? null : n[e];
n[e] = i;
} else {
if (1 === arguments.length) return void 0 === this.options[e] ? null : this.options[e];
a[e] = i;
}
return this._setOptions(a), this;
},
_setOptions: function(t) {
var e;
for (e in t) this._setOption(e, t[e]);
return this;
},
_setOption: function(t, e) {
return "classes" === t && this._setOptionClasses(e), this.options[t] = e, "disabled" === t && this._setOptionDisabled(e), 
this;
},
_setOptionClasses: function(e) {
var i, s, n;
for (i in e) n = this.classesElementLookup[i], e[i] !== this.options.classes[i] && n && n.length && (s = t(n.get()), 
this._removeClass(n, i), s.addClass(this._classes({
element: s,
keys: i,
classes: e,
add: !0
})));
},
_setOptionDisabled: function(t) {
this._toggleClass(this.widget(), this.widgetFullName + "-disabled", null, !!t), 
t && (this._removeClass(this.hoverable, null, "ui-state-hover"), this._removeClass(this.focusable, null, "ui-state-focus"));
},
enable: function() {
return this._setOptions({
disabled: !1
});
},
disable: function() {
return this._setOptions({
disabled: !0
});
},
_classes: function(e) {
function i(i, o) {
var a, r;
for (r = 0; i.length > r; r++) a = n.classesElementLookup[i[r]] || t(), a = e.add ? t(t.unique(a.get().concat(e.element.get()))) : t(a.not(e.element).get()), 
n.classesElementLookup[i[r]] = a, s.push(i[r]), o && e.classes[i[r]] && s.push(e.classes[i[r]]);
}
var s = [], n = this;
return e = t.extend({
element: this.element,
classes: this.options.classes || {}
}, e), this._on(e.element, {
remove: "_untrackClassesElement"
}), e.keys && i(e.keys.match(/\S+/g) || [], !0), e.extra && i(e.extra.match(/\S+/g) || []), 
s.join(" ");
},
_untrackClassesElement: function(e) {
var i = this;
t.each(i.classesElementLookup, function(s, n) {
-1 !== t.inArray(e.target, n) && (i.classesElementLookup[s] = t(n.not(e.target).get()));
});
},
_removeClass: function(t, e, i) {
return this._toggleClass(t, e, i, !1);
},
_addClass: function(t, e, i) {
return this._toggleClass(t, e, i, !0);
},
_toggleClass: function(t, e, i, s) {
s = "boolean" == typeof s ? s : i;
var n = "string" == typeof t || null === t, o = {
extra: n ? e : i,
keys: n ? t : e,
element: n ? this.element : t,
add: s
};
return o.element.toggleClass(this._classes(o), s), this;
},
_on: function(e, i, s) {
var n, o = this;
"boolean" != typeof e && (s = i, i = e, e = !1), s ? (i = n = t(i), this.bindings = this.bindings.add(i)) : (s = i, 
i = this.element, n = this.widget()), t.each(s, function(s, a) {
function r() {
return e || o.options.disabled !== !0 && !t(this).hasClass("ui-state-disabled") ? ("string" == typeof a ? o[a] : a).apply(o, arguments) : void 0;
}
"string" != typeof a && (r.guid = a.guid = a.guid || r.guid || t.guid++);
var l = s.match(/^([\w:-]*)\s*(.*)$/), h = l[1] + o.eventNamespace, c = l[2];
c ? n.on(h, c, r) : i.on(h, r);
});
},
_off: function(e, i) {
i = (i || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace, 
e.off(i).off(i), this.bindings = t(this.bindings.not(e).get()), this.focusable = t(this.focusable.not(e).get()), 
this.hoverable = t(this.hoverable.not(e).get());
},
_delay: function(t, e) {
function i() {
return ("string" == typeof t ? s[t] : t).apply(s, arguments);
}
var s = this;
return setTimeout(i, e || 0);
},
_hoverable: function(e) {
this.hoverable = this.hoverable.add(e), this._on(e, {
mouseenter: function(e) {
this._addClass(t(e.currentTarget), null, "ui-state-hover");
},
mouseleave: function(e) {
this._removeClass(t(e.currentTarget), null, "ui-state-hover");
}
});
},
_focusable: function(e) {
this.focusable = this.focusable.add(e), this._on(e, {
focusin: function(e) {
this._addClass(t(e.currentTarget), null, "ui-state-focus");
},
focusout: function(e) {
this._removeClass(t(e.currentTarget), null, "ui-state-focus");
}
});
},
_trigger: function(e, i, s) {
var n, o, a = this.options[e];
if (s = s || {}, i = t.Event(i), i.type = (e === this.widgetEventPrefix ? e : this.widgetEventPrefix + e).toLowerCase(), 
i.target = this.element[0], o = i.originalEvent) for (n in o) n in i || (i[n] = o[n]);
return this.element.trigger(i, s), !(t.isFunction(a) && a.apply(this.element[0], [ i ].concat(s)) === !1 || i.isDefaultPrevented());
}
}, t.each({
show: "fadeIn",
hide: "fadeOut"
}, function(e, i) {
t.Widget.prototype["_" + e] = function(s, n, o) {
"string" == typeof n && (n = {
effect: n
});
var a, r = n ? n === !0 || "number" == typeof n ? i : n.effect || i : e;
n = n || {}, "number" == typeof n && (n = {
duration: n
}), a = !t.isEmptyObject(n), n.complete = o, n.delay && s.delay(n.delay), a && t.effects && t.effects.effect[r] ? s[e](n) : r !== e && s[r] ? s[r](n.duration, n.easing, o) : s.queue(function(i) {
t(this)[e](), o && o.call(s[0]), i();
});
};
}), t.widget, function() {
function e(t, e, i) {
return [ parseFloat(t[0]) * (u.test(t[0]) ? e / 100 : 1), parseFloat(t[1]) * (u.test(t[1]) ? i / 100 : 1) ];
}
function i(e, i) {
return parseInt(t.css(e, i), 10) || 0;
}
function s(e) {
var i = e[0];
return 9 === i.nodeType ? {
width: e.width(),
height: e.height(),
offset: {
top: 0,
left: 0
}
} : t.isWindow(i) ? {
width: e.width(),
height: e.height(),
offset: {
top: e.scrollTop(),
left: e.scrollLeft()
}
} : i.preventDefault ? {
width: 0,
height: 0,
offset: {
top: i.pageY,
left: i.pageX
}
} : {
width: e.outerWidth(),
height: e.outerHeight(),
offset: e.offset()
};
}
var n, o = Math.max, a = Math.abs, r = /left|center|right/, l = /top|center|bottom/, h = /[\+\-]\d+(\.[\d]+)?%?/, c = /^\w+/, u = /%$/, d = t.fn.position;
t.position = {
scrollbarWidth: function() {
if (void 0 !== n) return n;
var e, i, s = t("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"), o = s.children()[0];
return t("body").append(s), e = o.offsetWidth, s.css("overflow", "scroll"), i = o.offsetWidth, 
e === i && (i = s[0].clientWidth), s.remove(), n = e - i;
},
getScrollInfo: function(e) {
var i = e.isWindow || e.isDocument ? "" : e.element.css("overflow-x"), s = e.isWindow || e.isDocument ? "" : e.element.css("overflow-y"), n = "scroll" === i || "auto" === i && e.width < e.element[0].scrollWidth, o = "scroll" === s || "auto" === s && e.height < e.element[0].scrollHeight;
return {
width: o ? t.position.scrollbarWidth() : 0,
height: n ? t.position.scrollbarWidth() : 0
};
},
getWithinInfo: function(e) {
var i = t(e || window), s = t.isWindow(i[0]), n = !!i[0] && 9 === i[0].nodeType, o = !s && !n;
return {
element: i,
isWindow: s,
isDocument: n,
offset: o ? t(e).offset() : {
left: 0,
top: 0
},
scrollLeft: i.scrollLeft(),
scrollTop: i.scrollTop(),
width: i.outerWidth(),
height: i.outerHeight()
};
}
}, t.fn.position = function(n) {
if (!n || !n.of) return d.apply(this, arguments);
n = t.extend({}, n);
var u, p, f, g, m, _, v = t(n.of), b = t.position.getWithinInfo(n.within), y = t.position.getScrollInfo(b), w = (n.collision || "flip").split(" "), k = {};
return _ = s(v), v[0].preventDefault && (n.at = "left top"), p = _.width, f = _.height, 
g = _.offset, m = t.extend({}, g), t.each([ "my", "at" ], function() {
var t, e, i = (n[this] || "").split(" ");
1 === i.length && (i = r.test(i[0]) ? i.concat([ "center" ]) : l.test(i[0]) ? [ "center" ].concat(i) : [ "center", "center" ]), 
i[0] = r.test(i[0]) ? i[0] : "center", i[1] = l.test(i[1]) ? i[1] : "center", t = h.exec(i[0]), 
e = h.exec(i[1]), k[this] = [ t ? t[0] : 0, e ? e[0] : 0 ], n[this] = [ c.exec(i[0])[0], c.exec(i[1])[0] ];
}), 1 === w.length && (w[1] = w[0]), "right" === n.at[0] ? m.left += p : "center" === n.at[0] && (m.left += p / 2), 
"bottom" === n.at[1] ? m.top += f : "center" === n.at[1] && (m.top += f / 2), u = e(k.at, p, f), 
m.left += u[0], m.top += u[1], this.each(function() {
var s, r, l = t(this), h = l.outerWidth(), c = l.outerHeight(), d = i(this, "marginLeft"), _ = i(this, "marginTop"), x = h + d + i(this, "marginRight") + y.width, C = c + _ + i(this, "marginBottom") + y.height, D = t.extend({}, m), T = e(k.my, l.outerWidth(), l.outerHeight());
"right" === n.my[0] ? D.left -= h : "center" === n.my[0] && (D.left -= h / 2), "bottom" === n.my[1] ? D.top -= c : "center" === n.my[1] && (D.top -= c / 2), 
D.left += T[0], D.top += T[1], s = {
marginLeft: d,
marginTop: _
}, t.each([ "left", "top" ], function(e, i) {
t.ui.position[w[e]] && t.ui.position[w[e]][i](D, {
targetWidth: p,
targetHeight: f,
elemWidth: h,
elemHeight: c,
collisionPosition: s,
collisionWidth: x,
collisionHeight: C,
offset: [ u[0] + T[0], u[1] + T[1] ],
my: n.my,
at: n.at,
within: b,
elem: l
});
}), n.using && (r = function(t) {
var e = g.left - D.left, i = e + p - h, s = g.top - D.top, r = s + f - c, u = {
target: {
element: v,
left: g.left,
top: g.top,
width: p,
height: f
},
element: {
element: l,
left: D.left,
top: D.top,
width: h,
height: c
},
horizontal: 0 > i ? "left" : e > 0 ? "right" : "center",
vertical: 0 > r ? "top" : s > 0 ? "bottom" : "middle"
};
h > p && p > a(e + i) && (u.horizontal = "center"), c > f && f > a(s + r) && (u.vertical = "middle"), 
u.important = o(a(e), a(i)) > o(a(s), a(r)) ? "horizontal" : "vertical", n.using.call(this, t, u);
}), l.offset(t.extend(D, {
using: r
}));
});
}, t.ui.position = {
fit: {
left: function(t, e) {
var i, s = e.within, n = s.isWindow ? s.scrollLeft : s.offset.left, a = s.width, r = t.left - e.collisionPosition.marginLeft, l = n - r, h = r + e.collisionWidth - a - n;
e.collisionWidth > a ? l > 0 && 0 >= h ? (i = t.left + l + e.collisionWidth - a - n, 
t.left += l - i) : t.left = h > 0 && 0 >= l ? n : l > h ? n + a - e.collisionWidth : n : l > 0 ? t.left += l : h > 0 ? t.left -= h : t.left = o(t.left - r, t.left);
},
top: function(t, e) {
var i, s = e.within, n = s.isWindow ? s.scrollTop : s.offset.top, a = e.within.height, r = t.top - e.collisionPosition.marginTop, l = n - r, h = r + e.collisionHeight - a - n;
e.collisionHeight > a ? l > 0 && 0 >= h ? (i = t.top + l + e.collisionHeight - a - n, 
t.top += l - i) : t.top = h > 0 && 0 >= l ? n : l > h ? n + a - e.collisionHeight : n : l > 0 ? t.top += l : h > 0 ? t.top -= h : t.top = o(t.top - r, t.top);
}
},
flip: {
left: function(t, e) {
var i, s, n = e.within, o = n.offset.left + n.scrollLeft, r = n.width, l = n.isWindow ? n.scrollLeft : n.offset.left, h = t.left - e.collisionPosition.marginLeft, c = h - l, u = h + e.collisionWidth - r - l, d = "left" === e.my[0] ? -e.elemWidth : "right" === e.my[0] ? e.elemWidth : 0, p = "left" === e.at[0] ? e.targetWidth : "right" === e.at[0] ? -e.targetWidth : 0, f = -2 * e.offset[0];
0 > c ? (i = t.left + d + p + f + e.collisionWidth - r - o, (0 > i || a(c) > i) && (t.left += d + p + f)) : u > 0 && (s = t.left - e.collisionPosition.marginLeft + d + p + f - l, 
(s > 0 || u > a(s)) && (t.left += d + p + f));
},
top: function(t, e) {
var i, s, n = e.within, o = n.offset.top + n.scrollTop, r = n.height, l = n.isWindow ? n.scrollTop : n.offset.top, h = t.top - e.collisionPosition.marginTop, c = h - l, u = h + e.collisionHeight - r - l, d = "top" === e.my[1], p = d ? -e.elemHeight : "bottom" === e.my[1] ? e.elemHeight : 0, f = "top" === e.at[1] ? e.targetHeight : "bottom" === e.at[1] ? -e.targetHeight : 0, g = -2 * e.offset[1];
0 > c ? (s = t.top + p + f + g + e.collisionHeight - r - o, (0 > s || a(c) > s) && (t.top += p + f + g)) : u > 0 && (i = t.top - e.collisionPosition.marginTop + p + f + g - l, 
(i > 0 || u > a(i)) && (t.top += p + f + g));
}
},
flipfit: {
left: function() {
t.ui.position.flip.left.apply(this, arguments), t.ui.position.fit.left.apply(this, arguments);
},
top: function() {
t.ui.position.flip.top.apply(this, arguments), t.ui.position.fit.top.apply(this, arguments);
}
}
};
}(), t.ui.position, t.ui.keyCode = {
BACKSPACE: 8,
COMMA: 188,
DELETE: 46,
DOWN: 40,
END: 35,
ENTER: 13,
ESCAPE: 27,
HOME: 36,
LEFT: 37,
PAGE_DOWN: 34,
PAGE_UP: 33,
PERIOD: 190,
RIGHT: 39,
SPACE: 32,
TAB: 9,
UP: 38
}, t.fn.extend({
uniqueId: function() {
var t = 0;
return function() {
return this.each(function() {
this.id || (this.id = "ui-id-" + ++t);
});
};
}(),
removeUniqueId: function() {
return this.each(function() {
/^ui-id-\d+$/.test(this.id) && t(this).removeAttr("id");
});
}
}), t.ui.safeActiveElement = function(t) {
var e;
try {
e = t.activeElement;
} catch (i) {
e = t.body;
}
return e || (e = t.body), e.nodeName || (e = t.body), e;
}, t.widget("ui.menu", {
version: "1.12.1",
defaultElement: "<ul>",
delay: 300,
options: {
icons: {
submenu: "ui-icon-caret-1-e"
},
items: "> *",
menus: "ul",
position: {
my: "left top",
at: "right top"
},
role: "menu",
blur: null,
focus: null,
select: null
},
_create: function() {
this.activeMenu = this.element, this.mouseHandled = !1, this.element.uniqueId().attr({
role: this.options.role,
tabIndex: 0
}), this._addClass("ui-menu", "ui-widget ui-widget-content"), this._on({
"mousedown .ui-menu-item": function(t) {
t.preventDefault();
},
"click .ui-menu-item": function(e) {
var i = t(e.target), s = t(t.ui.safeActiveElement(this.document[0]));
!this.mouseHandled && i.not(".ui-state-disabled").length && (this.select(e), e.isPropagationStopped() || (this.mouseHandled = !0), 
i.has(".ui-menu").length ? this.expand(e) : !this.element.is(":focus") && s.closest(".ui-menu").length && (this.element.trigger("focus", [ !0 ]), 
this.active && 1 === this.active.parents(".ui-menu").length && clearTimeout(this.timer)));
},
"mouseenter .ui-menu-item": function(e) {
if (!this.previousFilter) {
var i = t(e.target).closest(".ui-menu-item"), s = t(e.currentTarget);
i[0] === s[0] && (this._removeClass(s.siblings().children(".ui-state-active"), null, "ui-state-active"), 
this.focus(e, s));
}
},
mouseleave: "collapseAll",
"mouseleave .ui-menu": "collapseAll",
focus: function(t, e) {
var i = this.active || this.element.find(this.options.items).eq(0);
e || this.focus(t, i);
},
blur: function(e) {
this._delay(function() {
var i = !t.contains(this.element[0], t.ui.safeActiveElement(this.document[0]));
i && this.collapseAll(e);
});
},
keydown: "_keydown"
}), this.refresh(), this._on(this.document, {
click: function(t) {
this._closeOnDocumentClick(t) && this.collapseAll(t), this.mouseHandled = !1;
}
});
},
_destroy: function() {
var e = this.element.find(".ui-menu-item").removeAttr("role aria-disabled"), i = e.children(".ui-menu-item-wrapper").removeUniqueId().removeAttr("tabIndex role aria-haspopup");
this.element.removeAttr("aria-activedescendant").find(".ui-menu").addBack().removeAttr("role aria-labelledby aria-expanded aria-hidden aria-disabled tabIndex").removeUniqueId().show(), 
i.children().each(function() {
var e = t(this);
e.data("ui-menu-submenu-caret") && e.remove();
});
},
_keydown: function(e) {
var i, s, n, o, a = !0;
switch (e.keyCode) {
case t.ui.keyCode.PAGE_UP:
this.previousPage(e);
break;

case t.ui.keyCode.PAGE_DOWN:
this.nextPage(e);
break;

case t.ui.keyCode.HOME:
this._move("first", "first", e);
break;

case t.ui.keyCode.END:
this._move("last", "last", e);
break;

case t.ui.keyCode.UP:
this.previous(e);
break;

case t.ui.keyCode.DOWN:
this.next(e);
break;

case t.ui.keyCode.LEFT:
this.collapse(e);
break;

case t.ui.keyCode.RIGHT:
this.active && !this.active.is(".ui-state-disabled") && this.expand(e);
break;

case t.ui.keyCode.ENTER:
case t.ui.keyCode.SPACE:
this._activate(e);
break;

case t.ui.keyCode.ESCAPE:
this.collapse(e);
break;

default:
a = !1, s = this.previousFilter || "", o = !1, n = e.keyCode >= 96 && 105 >= e.keyCode ? "" + (e.keyCode - 96) : String.fromCharCode(e.keyCode), 
clearTimeout(this.filterTimer), n === s ? o = !0 : n = s + n, i = this._filterMenuItems(n), 
i = o && -1 !== i.index(this.active.next()) ? this.active.nextAll(".ui-menu-item") : i, 
i.length || (n = String.fromCharCode(e.keyCode), i = this._filterMenuItems(n)), 
i.length ? (this.focus(e, i), this.previousFilter = n, this.filterTimer = this._delay(function() {
delete this.previousFilter;
}, 1e3)) : delete this.previousFilter;
}
a && e.preventDefault();
},
_activate: function(t) {
this.active && !this.active.is(".ui-state-disabled") && (this.active.children("[aria-haspopup='true']").length ? this.expand(t) : this.select(t));
},
refresh: function() {
var e, i, s, n, o, a = this, r = this.options.icons.submenu, l = this.element.find(this.options.menus);
this._toggleClass("ui-menu-icons", null, !!this.element.find(".ui-icon").length), 
s = l.filter(":not(.ui-menu)").hide().attr({
role: this.options.role,
"aria-hidden": "true",
"aria-expanded": "false"
}).each(function() {
var e = t(this), i = e.prev(), s = t("<span>").data("ui-menu-submenu-caret", !0);
a._addClass(s, "ui-menu-icon", "ui-icon " + r), i.attr("aria-haspopup", "true").prepend(s), 
e.attr("aria-labelledby", i.attr("id"));
}), this._addClass(s, "ui-menu", "ui-widget ui-widget-content ui-front"), e = l.add(this.element), 
i = e.find(this.options.items), i.not(".ui-menu-item").each(function() {
var e = t(this);
a._isDivider(e) && a._addClass(e, "ui-menu-divider", "ui-widget-content");
}), n = i.not(".ui-menu-item, .ui-menu-divider"), o = n.children().not(".ui-menu").uniqueId().attr({
tabIndex: -1,
role: this._itemRole()
}), this._addClass(n, "ui-menu-item")._addClass(o, "ui-menu-item-wrapper"), i.filter(".ui-state-disabled").attr("aria-disabled", "true"), 
this.active && !t.contains(this.element[0], this.active[0]) && this.blur();
},
_itemRole: function() {
return {
menu: "menuitem",
listbox: "option"
}[this.options.role];
},
_setOption: function(t, e) {
if ("icons" === t) {
var i = this.element.find(".ui-menu-icon");
this._removeClass(i, null, this.options.icons.submenu)._addClass(i, null, e.submenu);
}
this._super(t, e);
},
_setOptionDisabled: function(t) {
this._super(t), this.element.attr("aria-disabled", t + ""), this._toggleClass(null, "ui-state-disabled", !!t);
},
focus: function(t, e) {
var i, s, n;
this.blur(t, t && "focus" === t.type), this._scrollIntoView(e), this.active = e.first(), 
s = this.active.children(".ui-menu-item-wrapper"), this._addClass(s, null, "ui-state-active"), 
this.options.role && this.element.attr("aria-activedescendant", s.attr("id")), n = this.active.parent().closest(".ui-menu-item").children(".ui-menu-item-wrapper"), 
this._addClass(n, null, "ui-state-active"), t && "keydown" === t.type ? this._close() : this.timer = this._delay(function() {
this._close();
}, this.delay), i = e.children(".ui-menu"), i.length && t && /^mouse/.test(t.type) && this._startOpening(i), 
this.activeMenu = e.parent(), this._trigger("focus", t, {
item: e
});
},
_scrollIntoView: function(e) {
var i, s, n, o, a, r;
this._hasScroll() && (i = parseFloat(t.css(this.activeMenu[0], "borderTopWidth")) || 0, 
s = parseFloat(t.css(this.activeMenu[0], "paddingTop")) || 0, n = e.offset().top - this.activeMenu.offset().top - i - s, 
o = this.activeMenu.scrollTop(), a = this.activeMenu.height(), r = e.outerHeight(), 
0 > n ? this.activeMenu.scrollTop(o + n) : n + r > a && this.activeMenu.scrollTop(o + n - a + r));
},
blur: function(t, e) {
e || clearTimeout(this.timer), this.active && (this._removeClass(this.active.children(".ui-menu-item-wrapper"), null, "ui-state-active"), 
this._trigger("blur", t, {
item: this.active
}), this.active = null);
},
_startOpening: function(t) {
clearTimeout(this.timer), "true" === t.attr("aria-hidden") && (this.timer = this._delay(function() {
this._close(), this._open(t);
}, this.delay));
},
_open: function(e) {
var i = t.extend({
of: this.active
}, this.options.position);
clearTimeout(this.timer), this.element.find(".ui-menu").not(e.parents(".ui-menu")).hide().attr("aria-hidden", "true"), 
e.show().removeAttr("aria-hidden").attr("aria-expanded", "true").position(i);
},
collapseAll: function(e, i) {
clearTimeout(this.timer), this.timer = this._delay(function() {
var s = i ? this.element : t(e && e.target).closest(this.element.find(".ui-menu"));
s.length || (s = this.element), this._close(s), this.blur(e), this._removeClass(s.find(".ui-state-active"), null, "ui-state-active"), 
this.activeMenu = s;
}, this.delay);
},
_close: function(t) {
t || (t = this.active ? this.active.parent() : this.element), t.find(".ui-menu").hide().attr("aria-hidden", "true").attr("aria-expanded", "false");
},
_closeOnDocumentClick: function(e) {
return !t(e.target).closest(".ui-menu").length;
},
_isDivider: function(t) {
return !/[^\-\u2014\u2013\s]/.test(t.text());
},
collapse: function(t) {
var e = this.active && this.active.parent().closest(".ui-menu-item", this.element);
e && e.length && (this._close(), this.focus(t, e));
},
expand: function(t) {
var e = this.active && this.active.children(".ui-menu ").find(this.options.items).first();
e && e.length && (this._open(e.parent()), this._delay(function() {
this.focus(t, e);
}));
},
next: function(t) {
this._move("next", "first", t);
},
previous: function(t) {
this._move("prev", "last", t);
},
isFirstItem: function() {
return this.active && !this.active.prevAll(".ui-menu-item").length;
},
isLastItem: function() {
return this.active && !this.active.nextAll(".ui-menu-item").length;
},
_move: function(t, e, i) {
var s;
this.active && (s = "first" === t || "last" === t ? this.active["first" === t ? "prevAll" : "nextAll"](".ui-menu-item").eq(-1) : this.active[t + "All"](".ui-menu-item").eq(0)), 
s && s.length && this.active || (s = this.activeMenu.find(this.options.items)[e]()), 
this.focus(i, s);
},
nextPage: function(e) {
var i, s, n;
return this.active ? (this.isLastItem() || (this._hasScroll() ? (s = this.active.offset().top, 
n = this.element.height(), this.active.nextAll(".ui-menu-item").each(function() {
return i = t(this), 0 > i.offset().top - s - n;
}), this.focus(e, i)) : this.focus(e, this.activeMenu.find(this.options.items)[this.active ? "last" : "first"]())), 
void 0) : (this.next(e), void 0);
},
previousPage: function(e) {
var i, s, n;
return this.active ? (this.isFirstItem() || (this._hasScroll() ? (s = this.active.offset().top, 
n = this.element.height(), this.active.prevAll(".ui-menu-item").each(function() {
return i = t(this), i.offset().top - s + n > 0;
}), this.focus(e, i)) : this.focus(e, this.activeMenu.find(this.options.items).first())), 
void 0) : (this.next(e), void 0);
},
_hasScroll: function() {
return this.element.outerHeight() < this.element.prop("scrollHeight");
},
select: function(e) {
this.active = this.active || t(e.target).closest(".ui-menu-item");
var i = {
item: this.active
};
this.active.has(".ui-menu").length || this.collapseAll(e, !0), this._trigger("select", e, i);
},
_filterMenuItems: function(e) {
var i = e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"), s = RegExp("^" + i, "i");
return this.activeMenu.find(this.options.items).filter(".ui-menu-item").filter(function() {
return s.test(t.trim(t(this).children(".ui-menu-item-wrapper").text()));
});
}
}), t.widget("ui.autocomplete", {
version: "1.12.1",
defaultElement: "<input>",
options: {
appendTo: null,
autoFocus: !1,
delay: 300,
minLength: 1,
position: {
my: "left top",
at: "left bottom",
collision: "none"
},
source: null,
change: null,
close: null,
focus: null,
open: null,
response: null,
search: null,
select: null
},
requestIndex: 0,
pending: 0,
_create: function() {
var e, i, s, n = this.element[0].nodeName.toLowerCase(), o = "textarea" === n, a = "input" === n;
this.isMultiLine = o || !a && this._isContentEditable(this.element), this.valueMethod = this.element[o || a ? "val" : "text"], 
this.isNewMenu = !0, this._addClass("ui-autocomplete-input"), this.element.attr("autocomplete", "off"), 
this._on(this.element, {
keydown: function(n) {
if (this.element.prop("readOnly")) return e = !0, s = !0, i = !0, void 0;
e = !1, s = !1, i = !1;
var o = t.ui.keyCode;
switch (n.keyCode) {
case o.PAGE_UP:
e = !0, this._move("previousPage", n);
break;

case o.PAGE_DOWN:
e = !0, this._move("nextPage", n);
break;

case o.UP:
e = !0, this._keyEvent("previous", n);
break;

case o.DOWN:
e = !0, this._keyEvent("next", n);
break;

case o.ENTER:
this.menu.active && (e = !0, n.preventDefault(), this.menu.select(n));
break;

case o.TAB:
this.menu.active && this.menu.select(n);
break;

case o.ESCAPE:
this.menu.element.is(":visible") && (this.isMultiLine || this._value(this.term), 
this.close(n), n.preventDefault());
break;

default:
i = !0, this._searchTimeout(n);
}
},
keypress: function(s) {
if (e) return e = !1, (!this.isMultiLine || this.menu.element.is(":visible")) && s.preventDefault(), 
void 0;
if (!i) {
var n = t.ui.keyCode;
switch (s.keyCode) {
case n.PAGE_UP:
this._move("previousPage", s);
break;

case n.PAGE_DOWN:
this._move("nextPage", s);
break;

case n.UP:
this._keyEvent("previous", s);
break;

case n.DOWN:
this._keyEvent("next", s);
}
}
},
input: function(t) {
return s ? (s = !1, t.preventDefault(), void 0) : (this._searchTimeout(t), void 0);
},
focus: function() {
this.selectedItem = null, this.previous = this._value();
},
blur: function(t) {
return this.cancelBlur ? (delete this.cancelBlur, void 0) : (clearTimeout(this.searching), 
this.close(t), this._change(t), void 0);
}
}), this._initSource(), this.menu = t("<ul>").appendTo(this._appendTo()).menu({
role: null
}).hide().menu("instance"), this._addClass(this.menu.element, "ui-autocomplete", "ui-front"), 
this._on(this.menu.element, {
mousedown: function(e) {
e.preventDefault(), this.cancelBlur = !0, this._delay(function() {
delete this.cancelBlur, this.element[0] !== t.ui.safeActiveElement(this.document[0]) && this.element.trigger("focus");
});
},
menufocus: function(e, i) {
var s, n;
return this.isNewMenu && (this.isNewMenu = !1, e.originalEvent && /^mouse/.test(e.originalEvent.type)) ? (this.menu.blur(), 
this.document.one("mousemove", function() {
t(e.target).trigger(e.originalEvent);
}), void 0) : (n = i.item.data("ui-autocomplete-item"), !1 !== this._trigger("focus", e, {
item: n
}) && e.originalEvent && /^key/.test(e.originalEvent.type) && this._value(n.value), 
s = i.item.attr("aria-label") || n.value, s && t.trim(s).length && (this.liveRegion.children().hide(), 
t("<div>").text(s).appendTo(this.liveRegion)), void 0);
},
menuselect: function(e, i) {
var s = i.item.data("ui-autocomplete-item"), n = this.previous;
this.element[0] !== t.ui.safeActiveElement(this.document[0]) && (this.element.trigger("focus"), 
this.previous = n, this._delay(function() {
this.previous = n, this.selectedItem = s;
})), !1 !== this._trigger("select", e, {
item: s
}) && this._value(s.value), this.term = this._value(), this.close(e), this.selectedItem = s;
}
}), this.liveRegion = t("<div>", {
role: "status",
"aria-live": "assertive",
"aria-relevant": "additions"
}).appendTo(this.document[0].body), this._addClass(this.liveRegion, null, "ui-helper-hidden-accessible"), 
this._on(this.window, {
beforeunload: function() {
this.element.removeAttr("autocomplete");
}
});
},
_destroy: function() {
clearTimeout(this.searching), this.element.removeAttr("autocomplete"), this.menu.element.remove(), 
this.liveRegion.remove();
},
_setOption: function(t, e) {
this._super(t, e), "source" === t && this._initSource(), "appendTo" === t && this.menu.element.appendTo(this._appendTo()), 
"disabled" === t && e && this.xhr && this.xhr.abort();
},
_isEventTargetInWidget: function(e) {
var i = this.menu.element[0];
return e.target === this.element[0] || e.target === i || t.contains(i, e.target);
},
_closeOnClickOutside: function(t) {
this._isEventTargetInWidget(t) || this.close();
},
_appendTo: function() {
var e = this.options.appendTo;
return e && (e = e.jquery || e.nodeType ? t(e) : this.document.find(e).eq(0)), e && e[0] || (e = this.element.closest(".ui-front, dialog")), 
e.length || (e = this.document[0].body), e;
},
_initSource: function() {
var e, i, s = this;
t.isArray(this.options.source) ? (e = this.options.source, this.source = function(i, s) {
s(t.ui.autocomplete.filter(e, i.term));
}) : "string" == typeof this.options.source ? (i = this.options.source, this.source = function(e, n) {
s.xhr && s.xhr.abort(), s.xhr = t.ajax({
url: i,
data: e,
dataType: "json",
success: function(t) {
n(t);
},
error: function() {
n([]);
}
});
}) : this.source = this.options.source;
},
_searchTimeout: function(t) {
clearTimeout(this.searching), this.searching = this._delay(function() {
var e = this.term === this._value(), i = this.menu.element.is(":visible"), s = t.altKey || t.ctrlKey || t.metaKey || t.shiftKey;
(!e || e && !i && !s) && (this.selectedItem = null, this.search(null, t));
}, this.options.delay);
},
search: function(t, e) {
return t = null != t ? t : this._value(), this.term = this._value(), t.length < this.options.minLength ? this.close(e) : this._trigger("search", e) !== !1 ? this._search(t) : void 0;
},
_search: function(t) {
this.pending++, this._addClass("ui-autocomplete-loading"), this.cancelSearch = !1, 
this.source({
term: t
}, this._response());
},
_response: function() {
var e = ++this.requestIndex;
return t.proxy(function(t) {
e === this.requestIndex && this.__response(t), this.pending--, this.pending || this._removeClass("ui-autocomplete-loading");
}, this);
},
__response: function(t) {
t && (t = this._normalize(t)), this._trigger("response", null, {
content: t
}), !this.options.disabled && t && t.length && !this.cancelSearch ? (this._suggest(t), 
this._trigger("open")) : this._close();
},
close: function(t) {
this.cancelSearch = !0, this._close(t);
},
_close: function(t) {
this._off(this.document, "mousedown"), this.menu.element.is(":visible") && (this.menu.element.hide(), 
this.menu.blur(), this.isNewMenu = !0, this._trigger("close", t));
},
_change: function(t) {
this.previous !== this._value() && this._trigger("change", t, {
item: this.selectedItem
});
},
_normalize: function(e) {
return e.length && e[0].label && e[0].value ? e : t.map(e, function(e) {
return "string" == typeof e ? {
label: e,
value: e
} : t.extend({}, e, {
label: e.label || e.value,
value: e.value || e.label
});
});
},
_suggest: function(e) {
var i = this.menu.element.empty();
this._renderMenu(i, e), this.isNewMenu = !0, this.menu.refresh(), i.show(), this._resizeMenu(), 
i.position(t.extend({
of: this.element
}, this.options.position)), this.options.autoFocus && this.menu.next(), this._on(this.document, {
mousedown: "_closeOnClickOutside"
});
},
_resizeMenu: function() {
var t = this.menu.element;
t.outerWidth(Math.max(t.width("").outerWidth() + 1, this.element.outerWidth()));
},
_renderMenu: function(e, i) {
var s = this;
t.each(i, function(t, i) {
s._renderItemData(e, i);
});
},
_renderItemData: function(t, e) {
return this._renderItem(t, e).data("ui-autocomplete-item", e);
},
_renderItem: function(e, i) {
return t("<li>").append(t("<div>").text(i.label)).appendTo(e);
},
_move: function(t, e) {
return this.menu.element.is(":visible") ? this.menu.isFirstItem() && /^previous/.test(t) || this.menu.isLastItem() && /^next/.test(t) ? (this.isMultiLine || this._value(this.term), 
this.menu.blur(), void 0) : (this.menu[t](e), void 0) : (this.search(null, e), void 0);
},
widget: function() {
return this.menu.element;
},
_value: function() {
return this.valueMethod.apply(this.element, arguments);
},
_keyEvent: function(t, e) {
(!this.isMultiLine || this.menu.element.is(":visible")) && (this._move(t, e), e.preventDefault());
},
_isContentEditable: function(t) {
if (!t.length) return !1;
var e = t.prop("contentEditable");
return "inherit" === e ? this._isContentEditable(t.parent()) : "true" === e;
}
}), t.extend(t.ui.autocomplete, {
escapeRegex: function(t) {
return t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
},
filter: function(e, i) {
var s = RegExp(t.ui.autocomplete.escapeRegex(i), "i");
return t.grep(e, function(t) {
return s.test(t.label || t.value || t);
});
}
}), t.widget("ui.autocomplete", t.ui.autocomplete, {
options: {
messages: {
noResults: "No search results.",
results: function(t) {
return t + (t > 1 ? " results are" : " result is") + " available, use up and down arrow keys to navigate.";
}
}
},
__response: function(e) {
var i;
this._superApply(arguments), this.options.disabled || this.cancelSearch || (i = e && e.length ? this.options.messages.results(e.length) : this.options.messages.noResults, 
this.liveRegion.children().hide(), t("<div>").text(i).appendTo(this.liveRegion));
}
}), t.ui.autocomplete;
});

/*!
 * jQuery.selection - jQuery Plugin
 *
 * Copyright (c) 2010-2014 IWASAKI Koji (@madapaja).
 * http://blog.madapaja.net/
 * Under The MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/*!
 * jQuery.selection - jQuery Plugin
 *
 * Copyright (c) 2010-2014 IWASAKI Koji (@madapaja).
 * http://blog.madapaja.net/
 * Under The MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function($, win, doc) {
var _getCaretInfo = function(element) {
var res = {
text: "",
start: 0,
end: 0
};
if (!element.value) {
return res;
}
try {
if (win.getSelection) {
res.start = element.selectionStart;
res.end = element.selectionEnd;
res.text = element.value.slice(res.start, res.end);
} else if (doc.selection) {
element.focus();
var range = doc.selection.createRange(), range2 = doc.body.createTextRange();
res.text = range.text;
try {
range2.moveToElementText(element);
range2.setEndPoint("StartToStart", range);
} catch (e) {
range2 = element.createTextRange();
range2.setEndPoint("StartToStart", range);
}
res.start = element.value.length - range2.text.length;
res.end = res.start + range.text.length;
}
} catch (e) {}
return res;
};
var _CaretOperation = {
getPos: function(element) {
var tmp = _getCaretInfo(element);
return {
start: tmp.start,
end: tmp.end
};
},
setPos: function(element, toRange, caret) {
caret = this._caretMode(caret);
if (caret === "start") {
toRange.end = toRange.start;
} else if (caret === "end") {
toRange.start = toRange.end;
}
element.focus();
try {
if (element.createTextRange) {
var range = element.createTextRange();
if (win.navigator.userAgent.toLowerCase().indexOf("msie") >= 0) {
toRange.start = element.value.substr(0, toRange.start).replace(/\r/g, "").length;
toRange.end = element.value.substr(0, toRange.end).replace(/\r/g, "").length;
}
range.collapse(true);
range.moveStart("character", toRange.start);
range.moveEnd("character", toRange.end - toRange.start);
range.select();
} else if (element.setSelectionRange) {
element.setSelectionRange(toRange.start, toRange.end);
}
} catch (e) {}
},
getText: function(element) {
return _getCaretInfo(element).text;
},
_caretMode: function(caret) {
caret = caret || "keep";
if (caret === false) {
caret = "end";
}
switch (caret) {
case "keep":
case "start":
case "end":
break;

default:
caret = "keep";
}
return caret;
},
replace: function(element, text, caret) {
var tmp = _getCaretInfo(element), orig = element.value, pos = $(element).scrollTop(), range = {
start: tmp.start,
end: tmp.start + text.length
};
element.value = orig.substr(0, tmp.start) + text + orig.substr(tmp.end);
$(element).scrollTop(pos);
this.setPos(element, range, caret);
},
insertBefore: function(element, text, caret) {
var tmp = _getCaretInfo(element), orig = element.value, pos = $(element).scrollTop(), range = {
start: tmp.start + text.length,
end: tmp.end + text.length
};
element.value = orig.substr(0, tmp.start) + text + orig.substr(tmp.start);
$(element).scrollTop(pos);
this.setPos(element, range, caret);
},
insertAfter: function(element, text, caret) {
var tmp = _getCaretInfo(element), orig = element.value, pos = $(element).scrollTop(), range = {
start: tmp.start,
end: tmp.end
};
element.value = orig.substr(0, tmp.end) + text + orig.substr(tmp.end);
$(element).scrollTop(pos);
this.setPos(element, range, caret);
}
};
$.extend({
selection: function(mode) {
var getText = (mode || "text").toLowerCase() === "text";
try {
if (win.getSelection) {
if (getText) {
return win.getSelection().toString();
} else {
var sel = win.getSelection(), range;
if (sel.getRangeAt) {
range = sel.getRangeAt(0);
} else {
range = doc.createRange();
range.setStart(sel.anchorNode, sel.anchorOffset);
range.setEnd(sel.focusNode, sel.focusOffset);
}
return $("<div></div>").append(range.cloneContents()).html();
}
} else if (doc.selection) {
if (getText) {
return doc.selection.createRange().text;
} else {
return doc.selection.createRange().htmlText;
}
}
} catch (e) {}
return "";
}
});
$.fn.extend({
selection: function(mode, opts) {
opts = opts || {};
switch (mode) {
case "getPos":
return _CaretOperation.getPos(this[0]);

case "setPos":
return this.each(function() {
_CaretOperation.setPos(this, opts);
});

case "replace":
return this.each(function() {
_CaretOperation.replace(this, opts.text, opts.caret);
});

case "insert":
return this.each(function() {
if (opts.mode === "before") {
_CaretOperation.insertBefore(this, opts.text, opts.caret);
} else {
_CaretOperation.insertAfter(this, opts.text, opts.caret);
}
});

case "get":
default:
return _CaretOperation.getText(this[0]);
}
return this;
}
});
})(jQuery, window, window.document);

(function(f) {
"use strict";
"function" === typeof define && define.amd ? define([ "jquery" ], f) : "undefined" !== typeof module && module.exports ? module.exports = f(require("jquery")) : f(jQuery);
})(function($) {
"use strict";
function n(a) {
return !a.nodeName || -1 !== $.inArray(a.nodeName.toLowerCase(), [ "iframe", "#document", "html", "body" ]);
}
function h(a) {
return $.isFunction(a) || $.isPlainObject(a) ? a : {
top: a,
left: a
};
}
var p = $.scrollTo = function(a, d, b) {
return $(window).scrollTo(a, d, b);
};
p.defaults = {
axis: "xy",
duration: 0,
limit: !0
};
$.fn.scrollTo = function(a, d, b) {
"object" === typeof d && (b = d, d = 0);
"function" === typeof b && (b = {
onAfter: b
});
"max" === a && (a = 9e9);
b = $.extend({}, p.defaults, b);
d = d || b.duration;
var u = b.queue && 1 < b.axis.length;
u && (d /= 2);
b.offset = h(b.offset);
b.over = h(b.over);
return this.each(function() {
function k(a) {
var k = $.extend({}, b, {
queue: !0,
duration: d,
complete: a && function() {
a.call(q, e, b);
}
});
r.animate(f, k);
}
if (null !== a) {
var l = n(this), q = l ? this.contentWindow || window : this, r = $(q), e = a, f = {}, t;
switch (typeof e) {
case "number":
case "string":
if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(e)) {
e = h(e);
break;
}
e = l ? $(e) : $(e, q);

case "object":
if (e.length === 0) return;
if (e.is || e.style) t = (e = $(e)).offset();
}
var v = $.isFunction(b.offset) && b.offset(q, e) || b.offset;
$.each(b.axis.split(""), function(a, c) {
var d = "x" === c ? "Left" : "Top", m = d.toLowerCase(), g = "scroll" + d, h = r[g](), n = p.max(q, c);
t ? (f[g] = t[m] + (l ? 0 : h - r.offset()[m]), b.margin && (f[g] -= parseInt(e.css("margin" + d), 10) || 0, 
f[g] -= parseInt(e.css("border" + d + "Width"), 10) || 0), f[g] += v[m] || 0, b.over[m] && (f[g] += e["x" === c ? "width" : "height"]() * b.over[m])) : (d = e[m], 
f[g] = d.slice && "%" === d.slice(-1) ? parseFloat(d) / 100 * n : d);
b.limit && /^\d+$/.test(f[g]) && (f[g] = 0 >= f[g] ? 0 : Math.min(f[g], n));
!a && 1 < b.axis.length && (h === f[g] ? f = {} : u && (k(b.onAfterFirst), f = {}));
});
k(b.onAfter);
}
});
};
p.max = function(a, d) {
var b = "x" === d ? "Width" : "Height", h = "scroll" + b;
if (!n(a)) return a[h] - $(a)[b.toLowerCase()]();
var b = "client" + b, k = a.ownerDocument || a.document, l = k.documentElement, k = k.body;
return Math.max(l[h], k[h]) - Math.min(l[b], k[b]);
};
$.Tween.propHooks.scrollLeft = $.Tween.propHooks.scrollTop = {
get: function(a) {
return $(a.elem)[a.prop]();
},
set: function(a) {
var d = this.get(a);
if (a.options.interrupt && a._last && a._last !== d) return $(a.elem).stop();
var b = Math.round(a.now);
d !== b && ($(a.elem)[a.prop](b), a._last = this.get(a));
}
};
return p;
});

/*!
 * perfect-scrollbar v1.4.0
 * (c) 2018 Hyunje Jun
 * @license MIT
 */ !function(t, e) {
"object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : t.PerfectScrollbar = e();
}(this, function() {
"use strict";
function t(t) {
return getComputedStyle(t);
}
function e(t, e) {
for (var i in e) {
var r = e[i];
"number" == typeof r && (r += "px"), t.style[i] = r;
}
return t;
}
function i(t) {
var e = document.createElement("div");
return e.className = t, e;
}
function r(t, e) {
if (!v) throw new Error("No element matching method supported");
return v.call(t, e);
}
function l(t) {
t.remove ? t.remove() : t.parentNode && t.parentNode.removeChild(t);
}
function n(t, e) {
return Array.prototype.filter.call(t.children, function(t) {
return r(t, e);
});
}
function o(t, e) {
var i = t.element.classList, r = m.state.scrolling(e);
i.contains(r) ? clearTimeout(Y[e]) : i.add(r);
}
function s(t, e) {
Y[e] = setTimeout(function() {
return t.isAlive && t.element.classList.remove(m.state.scrolling(e));
}, t.settings.scrollingThreshold);
}
function a(t, e) {
o(t, e), s(t, e);
}
function c(t) {
if ("function" == typeof window.CustomEvent) return new CustomEvent(t);
var e = document.createEvent("CustomEvent");
return e.initCustomEvent(t, !1, !1, void 0), e;
}
function h(t, e, i, r, l) {
var n = i[0], o = i[1], s = i[2], h = i[3], u = i[4], d = i[5];
void 0 === r && (r = !0), void 0 === l && (l = !1);
var f = t.element;
t.reach[h] = null, f[s] < 1 && (t.reach[h] = "start"), f[s] > t[n] - t[o] - 1 && (t.reach[h] = "end"), 
e && (f.dispatchEvent(c("ps-scroll-" + h)), e < 0 ? f.dispatchEvent(c("ps-scroll-" + u)) : e > 0 && f.dispatchEvent(c("ps-scroll-" + d)), 
r && a(t, h)), t.reach[h] && (e || l) && f.dispatchEvent(c("ps-" + h + "-reach-" + t.reach[h]));
}
function u(t) {
return parseInt(t, 10) || 0;
}
function d(t) {
return r(t, "input,[contenteditable]") || r(t, "select,[contenteditable]") || r(t, "textarea,[contenteditable]") || r(t, "button,[contenteditable]");
}
function f(e) {
var i = t(e);
return u(i.width) + u(i.paddingLeft) + u(i.paddingRight) + u(i.borderLeftWidth) + u(i.borderRightWidth);
}
function p(t, e) {
return t.settings.minScrollbarLength && (e = Math.max(e, t.settings.minScrollbarLength)), 
t.settings.maxScrollbarLength && (e = Math.min(e, t.settings.maxScrollbarLength)), 
e;
}
function b(t, i) {
var r = {
width: i.railXWidth
}, l = Math.floor(t.scrollTop);
i.isRtl ? r.left = i.negativeScrollAdjustment + t.scrollLeft + i.containerWidth - i.contentWidth : r.left = t.scrollLeft, 
i.isScrollbarXUsingBottom ? r.bottom = i.scrollbarXBottom - l : r.top = i.scrollbarXTop + l, 
e(i.scrollbarXRail, r);
var n = {
top: l,
height: i.railYHeight
};
i.isScrollbarYUsingRight ? i.isRtl ? n.right = i.contentWidth - (i.negativeScrollAdjustment + t.scrollLeft) - i.scrollbarYRight - i.scrollbarYOuterWidth : n.right = i.scrollbarYRight - t.scrollLeft : i.isRtl ? n.left = i.negativeScrollAdjustment + t.scrollLeft + 2 * i.containerWidth - i.contentWidth - i.scrollbarYLeft - i.scrollbarYOuterWidth : n.left = i.scrollbarYLeft + t.scrollLeft, 
e(i.scrollbarYRail, n), e(i.scrollbarX, {
left: i.scrollbarXLeft,
width: i.scrollbarXWidth - i.railBorderXWidth
}), e(i.scrollbarY, {
top: i.scrollbarYTop,
height: i.scrollbarYHeight - i.railBorderYWidth
});
}
function g(t, e) {
function i(e) {
b[d] = g + Y * (e[a] - v), o(t, f), R(t), e.stopPropagation(), e.preventDefault();
}
function r() {
s(t, f), t[p].classList.remove(m.state.clicking), t.event.unbind(t.ownerDocument, "mousemove", i);
}
var l = e[0], n = e[1], a = e[2], c = e[3], h = e[4], u = e[5], d = e[6], f = e[7], p = e[8], b = t.element, g = null, v = null, Y = null;
t.event.bind(t[h], "mousedown", function(e) {
g = b[d], v = e[a], Y = (t[n] - t[l]) / (t[c] - t[u]), t.event.bind(t.ownerDocument, "mousemove", i), 
t.event.once(t.ownerDocument, "mouseup", r), t[p].classList.add(m.state.clicking), 
e.stopPropagation(), e.preventDefault();
});
}
var v = "undefined" != typeof Element && (Element.prototype.matches || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector), m = {
main: "ps",
element: {
thumb: function(t) {
return "ps__thumb-" + t;
},
rail: function(t) {
return "ps__rail-" + t;
},
consuming: "ps__child--consume"
},
state: {
focus: "ps--focus",
clicking: "ps--clicking",
active: function(t) {
return "ps--active-" + t;
},
scrolling: function(t) {
return "ps--scrolling-" + t;
}
}
}, Y = {
x: null,
y: null
}, X = function(t) {
this.element = t, this.handlers = {};
}, w = {
isEmpty: {
configurable: !0
}
};
X.prototype.bind = function(t, e) {
void 0 === this.handlers[t] && (this.handlers[t] = []), this.handlers[t].push(e), 
this.element.addEventListener(t, e, !1);
}, X.prototype.unbind = function(t, e) {
var i = this;
this.handlers[t] = this.handlers[t].filter(function(r) {
return !(!e || r === e) || (i.element.removeEventListener(t, r, !1), !1);
});
}, X.prototype.unbindAll = function() {
var t = this;
for (var e in t.handlers) t.unbind(e);
}, w.isEmpty.get = function() {
var t = this;
return Object.keys(this.handlers).every(function(e) {
return 0 === t.handlers[e].length;
});
}, Object.defineProperties(X.prototype, w);
var y = function() {
this.eventElements = [];
};
y.prototype.eventElement = function(t) {
var e = this.eventElements.filter(function(e) {
return e.element === t;
})[0];
return e || (e = new X(t), this.eventElements.push(e)), e;
}, y.prototype.bind = function(t, e, i) {
this.eventElement(t).bind(e, i);
}, y.prototype.unbind = function(t, e, i) {
var r = this.eventElement(t);
r.unbind(e, i), r.isEmpty && this.eventElements.splice(this.eventElements.indexOf(r), 1);
}, y.prototype.unbindAll = function() {
this.eventElements.forEach(function(t) {
return t.unbindAll();
}), this.eventElements = [];
}, y.prototype.once = function(t, e, i) {
var r = this.eventElement(t), l = function(t) {
r.unbind(e, l), i(t);
};
r.bind(e, l);
};
var W = function(t, e, i, r, l) {
void 0 === r && (r = !0), void 0 === l && (l = !1);
var n;
if ("top" === e) n = [ "contentHeight", "containerHeight", "scrollTop", "y", "up", "down" ]; else {
if ("left" !== e) throw new Error("A proper axis should be provided");
n = [ "contentWidth", "containerWidth", "scrollLeft", "x", "left", "right" ];
}
h(t, i, n, r, l);
}, L = {
isWebKit: "undefined" != typeof document && "WebkitAppearance" in document.documentElement.style,
supportsTouch: "undefined" != typeof window && ("ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch),
supportsIePointer: "undefined" != typeof navigator && navigator.msMaxTouchPoints,
isChrome: "undefined" != typeof navigator && /Chrome/i.test(navigator && navigator.userAgent)
}, R = function(t) {
var e = t.element, i = Math.floor(e.scrollTop);
t.containerWidth = e.clientWidth, t.containerHeight = e.clientHeight, t.contentWidth = e.scrollWidth, 
t.contentHeight = e.scrollHeight, e.contains(t.scrollbarXRail) || (n(e, m.element.rail("x")).forEach(function(t) {
return l(t);
}), e.appendChild(t.scrollbarXRail)), e.contains(t.scrollbarYRail) || (n(e, m.element.rail("y")).forEach(function(t) {
return l(t);
}), e.appendChild(t.scrollbarYRail)), !t.settings.suppressScrollX && t.containerWidth + t.settings.scrollXMarginOffset < t.contentWidth ? (t.scrollbarXActive = !0, 
t.railXWidth = t.containerWidth - t.railXMarginWidth, t.railXRatio = t.containerWidth / t.railXWidth, 
t.scrollbarXWidth = p(t, u(t.railXWidth * t.containerWidth / t.contentWidth)), t.scrollbarXLeft = u((t.negativeScrollAdjustment + e.scrollLeft) * (t.railXWidth - t.scrollbarXWidth) / (t.contentWidth - t.containerWidth))) : t.scrollbarXActive = !1, 
!t.settings.suppressScrollY && t.containerHeight + t.settings.scrollYMarginOffset < t.contentHeight ? (t.scrollbarYActive = !0, 
t.railYHeight = t.containerHeight - t.railYMarginHeight, t.railYRatio = t.containerHeight / t.railYHeight, 
t.scrollbarYHeight = p(t, u(t.railYHeight * t.containerHeight / t.contentHeight)), 
t.scrollbarYTop = u(i * (t.railYHeight - t.scrollbarYHeight) / (t.contentHeight - t.containerHeight))) : t.scrollbarYActive = !1, 
t.scrollbarXLeft >= t.railXWidth - t.scrollbarXWidth && (t.scrollbarXLeft = t.railXWidth - t.scrollbarXWidth), 
t.scrollbarYTop >= t.railYHeight - t.scrollbarYHeight && (t.scrollbarYTop = t.railYHeight - t.scrollbarYHeight), 
b(e, t), t.scrollbarXActive ? e.classList.add(m.state.active("x")) : (e.classList.remove(m.state.active("x")), 
t.scrollbarXWidth = 0, t.scrollbarXLeft = 0, e.scrollLeft = 0), t.scrollbarYActive ? e.classList.add(m.state.active("y")) : (e.classList.remove(m.state.active("y")), 
t.scrollbarYHeight = 0, t.scrollbarYTop = 0, e.scrollTop = 0);
}, T = {
"click-rail": function(t) {
t.event.bind(t.scrollbarY, "mousedown", function(t) {
return t.stopPropagation();
}), t.event.bind(t.scrollbarYRail, "mousedown", function(e) {
var i = e.pageY - window.pageYOffset - t.scrollbarYRail.getBoundingClientRect().top > t.scrollbarYTop ? 1 : -1;
t.element.scrollTop += i * t.containerHeight, R(t), e.stopPropagation();
}), t.event.bind(t.scrollbarX, "mousedown", function(t) {
return t.stopPropagation();
}), t.event.bind(t.scrollbarXRail, "mousedown", function(e) {
var i = e.pageX - window.pageXOffset - t.scrollbarXRail.getBoundingClientRect().left > t.scrollbarXLeft ? 1 : -1;
t.element.scrollLeft += i * t.containerWidth, R(t), e.stopPropagation();
});
},
"drag-thumb": function(t) {
g(t, [ "containerWidth", "contentWidth", "pageX", "railXWidth", "scrollbarX", "scrollbarXWidth", "scrollLeft", "x", "scrollbarXRail" ]), 
g(t, [ "containerHeight", "contentHeight", "pageY", "railYHeight", "scrollbarY", "scrollbarYHeight", "scrollTop", "y", "scrollbarYRail" ]);
},
keyboard: function(t) {
function e(e, r) {
var l = Math.floor(i.scrollTop);
if (0 === e) {
if (!t.scrollbarYActive) return !1;
if (0 === l && r > 0 || l >= t.contentHeight - t.containerHeight && r < 0) return !t.settings.wheelPropagation;
}
var n = i.scrollLeft;
if (0 === r) {
if (!t.scrollbarXActive) return !1;
if (0 === n && e < 0 || n >= t.contentWidth - t.containerWidth && e > 0) return !t.settings.wheelPropagation;
}
return !0;
}
var i = t.element, l = function() {
return r(i, ":hover");
}, n = function() {
return r(t.scrollbarX, ":focus") || r(t.scrollbarY, ":focus");
};
t.event.bind(t.ownerDocument, "keydown", function(r) {
if (!(r.isDefaultPrevented && r.isDefaultPrevented() || r.defaultPrevented) && (l() || n())) {
var o = document.activeElement ? document.activeElement : t.ownerDocument.activeElement;
if (o) {
if ("IFRAME" === o.tagName) o = o.contentDocument.activeElement; else for (;o.shadowRoot; ) o = o.shadowRoot.activeElement;
if (d(o)) return;
}
var s = 0, a = 0;
switch (r.which) {
case 37:
s = r.metaKey ? -t.contentWidth : r.altKey ? -t.containerWidth : -30;
break;

case 38:
a = r.metaKey ? t.contentHeight : r.altKey ? t.containerHeight : 30;
break;

case 39:
s = r.metaKey ? t.contentWidth : r.altKey ? t.containerWidth : 30;
break;

case 40:
a = r.metaKey ? -t.contentHeight : r.altKey ? -t.containerHeight : -30;
break;

case 32:
a = r.shiftKey ? t.containerHeight : -t.containerHeight;
break;

case 33:
a = t.containerHeight;
break;

case 34:
a = -t.containerHeight;
break;

case 36:
a = t.contentHeight;
break;

case 35:
a = -t.contentHeight;
break;

default:
return;
}
t.settings.suppressScrollX && 0 !== s || t.settings.suppressScrollY && 0 !== a || (i.scrollTop -= a, 
i.scrollLeft += s, R(t), e(s, a) && r.preventDefault());
}
});
},
wheel: function(e) {
function i(t, i) {
var r = Math.floor(o.scrollTop), l = 0 === o.scrollTop, n = r + o.offsetHeight === o.scrollHeight, s = 0 === o.scrollLeft, a = o.scrollLeft + o.offsetWidth === o.scrollWidth;
return !(Math.abs(i) > Math.abs(t) ? l || n : s || a) || !e.settings.wheelPropagation;
}
function r(t) {
var e = t.deltaX, i = -1 * t.deltaY;
return void 0 !== e && void 0 !== i || (e = -1 * t.wheelDeltaX / 6, i = t.wheelDeltaY / 6), 
t.deltaMode && 1 === t.deltaMode && (e *= 10, i *= 10), e !== e && i !== i && (e = 0, 
i = t.wheelDelta), t.shiftKey ? [ -i, -e ] : [ e, i ];
}
function l(e, i, r) {
if (!L.isWebKit && o.querySelector("select:focus")) return !0;
if (!o.contains(e)) return !1;
for (var l = e; l && l !== o; ) {
if (l.classList.contains(m.element.consuming)) return !0;
var n = t(l);
if ([ n.overflow, n.overflowX, n.overflowY ].join("").match(/(scroll|auto)/)) {
var s = l.scrollHeight - l.clientHeight;
if (s > 0 && !(0 === l.scrollTop && r > 0 || l.scrollTop === s && r < 0)) return !0;
var a = l.scrollWidth - l.clientWidth;
if (a > 0 && !(0 === l.scrollLeft && i < 0 || l.scrollLeft === a && i > 0)) return !0;
}
l = l.parentNode;
}
return !1;
}
function n(t) {
var n = r(t), s = n[0], a = n[1];
if (!l(t.target, s, a)) {
var c = !1;
e.settings.useBothWheelAxes ? e.scrollbarYActive && !e.scrollbarXActive ? (a ? o.scrollTop -= a * e.settings.wheelSpeed : o.scrollTop += s * e.settings.wheelSpeed, 
c = !0) : e.scrollbarXActive && !e.scrollbarYActive && (s ? o.scrollLeft += s * e.settings.wheelSpeed : o.scrollLeft -= a * e.settings.wheelSpeed, 
c = !0) : (o.scrollTop -= a * e.settings.wheelSpeed, o.scrollLeft += s * e.settings.wheelSpeed), 
R(e), (c = c || i(s, a)) && !t.ctrlKey && (t.stopPropagation(), t.preventDefault());
}
}
var o = e.element;
void 0 !== window.onwheel ? e.event.bind(o, "wheel", n) : void 0 !== window.onmousewheel && e.event.bind(o, "mousewheel", n);
},
touch: function(e) {
function i(t, i) {
var r = Math.floor(h.scrollTop), l = h.scrollLeft, n = Math.abs(t), o = Math.abs(i);
if (o > n) {
if (i < 0 && r === e.contentHeight - e.containerHeight || i > 0 && 0 === r) return 0 === window.scrollY && i > 0 && L.isChrome;
} else if (n > o && (t < 0 && l === e.contentWidth - e.containerWidth || t > 0 && 0 === l)) return !0;
return !0;
}
function r(t, i) {
h.scrollTop -= i, h.scrollLeft -= t, R(e);
}
function l(t) {
return t.targetTouches ? t.targetTouches[0] : t;
}
function n(t) {
return !(t.pointerType && "pen" === t.pointerType && 0 === t.buttons || (!t.targetTouches || 1 !== t.targetTouches.length) && (!t.pointerType || "mouse" === t.pointerType || t.pointerType === t.MSPOINTER_TYPE_MOUSE));
}
function o(t) {
if (n(t)) {
var e = l(t);
u.pageX = e.pageX, u.pageY = e.pageY, d = new Date().getTime(), null !== p && clearInterval(p);
}
}
function s(e, i, r) {
if (!h.contains(e)) return !1;
for (var l = e; l && l !== h; ) {
if (l.classList.contains(m.element.consuming)) return !0;
var n = t(l);
if ([ n.overflow, n.overflowX, n.overflowY ].join("").match(/(scroll|auto)/)) {
var o = l.scrollHeight - l.clientHeight;
if (o > 0 && !(0 === l.scrollTop && r > 0 || l.scrollTop === o && r < 0)) return !0;
var s = l.scrollLeft - l.clientWidth;
if (s > 0 && !(0 === l.scrollLeft && i < 0 || l.scrollLeft === s && i > 0)) return !0;
}
l = l.parentNode;
}
return !1;
}
function a(t) {
if (n(t)) {
var e = l(t), o = {
pageX: e.pageX,
pageY: e.pageY
}, a = o.pageX - u.pageX, c = o.pageY - u.pageY;
if (s(t.target, a, c)) return;
r(a, c), u = o;
var h = new Date().getTime(), p = h - d;
p > 0 && (f.x = a / p, f.y = c / p, d = h), i(a, c) && t.preventDefault();
}
}
function c() {
e.settings.swipeEasing && (clearInterval(p), p = setInterval(function() {
e.isInitialized ? clearInterval(p) : f.x || f.y ? Math.abs(f.x) < .01 && Math.abs(f.y) < .01 ? clearInterval(p) : (r(30 * f.x, 30 * f.y), 
f.x *= .8, f.y *= .8) : clearInterval(p);
}, 10));
}
if (L.supportsTouch || L.supportsIePointer) {
var h = e.element, u = {}, d = 0, f = {}, p = null;
L.supportsTouch ? (e.event.bind(h, "touchstart", o), e.event.bind(h, "touchmove", a), 
e.event.bind(h, "touchend", c)) : L.supportsIePointer && (window.PointerEvent ? (e.event.bind(h, "pointerdown", o), 
e.event.bind(h, "pointermove", a), e.event.bind(h, "pointerup", c)) : window.MSPointerEvent && (e.event.bind(h, "MSPointerDown", o), 
e.event.bind(h, "MSPointerMove", a), e.event.bind(h, "MSPointerUp", c)));
}
}
}, H = function(r, l) {
var n = this;
if (void 0 === l && (l = {}), "string" == typeof r && (r = document.querySelector(r)), 
!r || !r.nodeName) throw new Error("no element is specified to initialize PerfectScrollbar");
this.element = r, r.classList.add(m.main), this.settings = {
handlers: [ "click-rail", "drag-thumb", "keyboard", "wheel", "touch" ],
maxScrollbarLength: null,
minScrollbarLength: null,
scrollingThreshold: 1e3,
scrollXMarginOffset: 0,
scrollYMarginOffset: 0,
suppressScrollX: !1,
suppressScrollY: !1,
swipeEasing: !0,
useBothWheelAxes: !1,
wheelPropagation: !0,
wheelSpeed: 1
};
for (var o in l) n.settings[o] = l[o];
this.containerWidth = null, this.containerHeight = null, this.contentWidth = null, 
this.contentHeight = null;
var s = function() {
return r.classList.add(m.state.focus);
}, a = function() {
return r.classList.remove(m.state.focus);
};
this.isRtl = "rtl" === t(r).direction, this.isNegativeScroll = function() {
var t = r.scrollLeft, e = null;
return r.scrollLeft = -1, e = r.scrollLeft < 0, r.scrollLeft = t, e;
}(), this.negativeScrollAdjustment = this.isNegativeScroll ? r.scrollWidth - r.clientWidth : 0, 
this.event = new y(), this.ownerDocument = r.ownerDocument || document, this.scrollbarXRail = i(m.element.rail("x")), 
r.appendChild(this.scrollbarXRail), this.scrollbarX = i(m.element.thumb("x")), this.scrollbarXRail.appendChild(this.scrollbarX), 
this.scrollbarX.setAttribute("tabindex", 0), this.event.bind(this.scrollbarX, "focus", s), 
this.event.bind(this.scrollbarX, "blur", a), this.scrollbarXActive = null, this.scrollbarXWidth = null, 
this.scrollbarXLeft = null;
var c = t(this.scrollbarXRail);
this.scrollbarXBottom = parseInt(c.bottom, 10), isNaN(this.scrollbarXBottom) ? (this.isScrollbarXUsingBottom = !1, 
this.scrollbarXTop = u(c.top)) : this.isScrollbarXUsingBottom = !0, this.railBorderXWidth = u(c.borderLeftWidth) + u(c.borderRightWidth), 
e(this.scrollbarXRail, {
display: "block"
}), this.railXMarginWidth = u(c.marginLeft) + u(c.marginRight), e(this.scrollbarXRail, {
display: ""
}), this.railXWidth = null, this.railXRatio = null, this.scrollbarYRail = i(m.element.rail("y")), 
r.appendChild(this.scrollbarYRail), this.scrollbarY = i(m.element.thumb("y")), this.scrollbarYRail.appendChild(this.scrollbarY), 
this.scrollbarY.setAttribute("tabindex", 0), this.event.bind(this.scrollbarY, "focus", s), 
this.event.bind(this.scrollbarY, "blur", a), this.scrollbarYActive = null, this.scrollbarYHeight = null, 
this.scrollbarYTop = null;
var h = t(this.scrollbarYRail);
this.scrollbarYRight = parseInt(h.right, 10), isNaN(this.scrollbarYRight) ? (this.isScrollbarYUsingRight = !1, 
this.scrollbarYLeft = u(h.left)) : this.isScrollbarYUsingRight = !0, this.scrollbarYOuterWidth = this.isRtl ? f(this.scrollbarY) : null, 
this.railBorderYWidth = u(h.borderTopWidth) + u(h.borderBottomWidth), e(this.scrollbarYRail, {
display: "block"
}), this.railYMarginHeight = u(h.marginTop) + u(h.marginBottom), e(this.scrollbarYRail, {
display: ""
}), this.railYHeight = null, this.railYRatio = null, this.reach = {
x: r.scrollLeft <= 0 ? "start" : r.scrollLeft >= this.contentWidth - this.containerWidth ? "end" : null,
y: r.scrollTop <= 0 ? "start" : r.scrollTop >= this.contentHeight - this.containerHeight ? "end" : null
}, this.isAlive = !0, this.settings.handlers.forEach(function(t) {
return T[t](n);
}), this.lastScrollTop = Math.floor(r.scrollTop), this.lastScrollLeft = r.scrollLeft, 
this.event.bind(this.element, "scroll", function(t) {
return n.onScroll(t);
}), R(this);
};
return H.prototype.update = function() {
this.isAlive && (this.negativeScrollAdjustment = this.isNegativeScroll ? this.element.scrollWidth - this.element.clientWidth : 0, 
e(this.scrollbarXRail, {
display: "block"
}), e(this.scrollbarYRail, {
display: "block"
}), this.railXMarginWidth = u(t(this.scrollbarXRail).marginLeft) + u(t(this.scrollbarXRail).marginRight), 
this.railYMarginHeight = u(t(this.scrollbarYRail).marginTop) + u(t(this.scrollbarYRail).marginBottom), 
e(this.scrollbarXRail, {
display: "none"
}), e(this.scrollbarYRail, {
display: "none"
}), R(this), W(this, "top", 0, !1, !0), W(this, "left", 0, !1, !0), e(this.scrollbarXRail, {
display: ""
}), e(this.scrollbarYRail, {
display: ""
}));
}, H.prototype.onScroll = function(t) {
this.isAlive && (R(this), W(this, "top", this.element.scrollTop - this.lastScrollTop), 
W(this, "left", this.element.scrollLeft - this.lastScrollLeft), this.lastScrollTop = Math.floor(this.element.scrollTop), 
this.lastScrollLeft = this.element.scrollLeft);
}, H.prototype.destroy = function() {
this.isAlive && (this.event.unbindAll(), l(this.scrollbarX), l(this.scrollbarY), 
l(this.scrollbarXRail), l(this.scrollbarYRail), this.removePsClasses(), this.element = null, 
this.scrollbarX = null, this.scrollbarY = null, this.scrollbarXRail = null, this.scrollbarYRail = null, 
this.isAlive = !1);
}, H.prototype.removePsClasses = function() {
this.element.className = this.element.className.split(" ").filter(function(t) {
return !t.match(/^ps([-_].+|)$/);
}).join(" ");
}, H;
});

!function(e) {
var n = !1;
if ("function" == typeof define && define.amd && (define(e), n = !0), "object" == typeof exports && (module.exports = e(), 
n = !0), !n) {
var o = window.Cookies, t = window.Cookies = e();
t.noConflict = function() {
return window.Cookies = o, t;
};
}
}(function() {
function e() {
for (var e = 0, n = {}; e < arguments.length; e++) {
var o = arguments[e];
for (var t in o) n[t] = o[t];
}
return n;
}
function n(o) {
function t(n, r, i) {
var c;
if ("undefined" != typeof document) {
if (arguments.length > 1) {
if ("number" == typeof (i = e({
path: "/"
}, t.defaults, i)).expires) {
var a = new Date();
a.setMilliseconds(a.getMilliseconds() + 864e5 * i.expires), i.expires = a;
}
i.expires = i.expires ? i.expires.toUTCString() : "";
try {
c = JSON.stringify(r), /^[\{\[]/.test(c) && (r = c);
} catch (e) {}
r = o.write ? o.write(r, n) : encodeURIComponent(r + "").replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent), 
n = (n = (n = encodeURIComponent(n + "")).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)).replace(/[\(\)]/g, escape);
var s = "";
for (var f in i) i[f] && (s += "; " + f, !0 !== i[f] && (s += "=" + i[f]));
return document.cookie = n + "=" + r + s;
}
n || (c = {});
for (var p = document.cookie ? document.cookie.split("; ") : [], d = /(%[0-9A-Z]{2})+/g, u = 0; u < p.length; u++) {
var l = p[u].split("="), C = l.slice(1).join("=");
this.json || '"' !== C.charAt(0) || (C = C.slice(1, -1));
try {
var m = l[0].replace(d, decodeURIComponent);
if (C = o.read ? o.read(C, m) : o(C, m) || C.replace(d, decodeURIComponent), this.json) try {
C = JSON.parse(C);
} catch (e) {}
if (n === m) {
c = C;
break;
}
n || (c[m] = C);
} catch (e) {}
}
return c;
}
}
return t.set = t, t.get = function(e) {
return t.call(t, e);
}, t.getJSON = function() {
return t.apply({
json: !0
}, [].slice.call(arguments));
}, t.defaults = {}, t.remove = function(n, o) {
t(n, "", e(o, {
expires: -1
}));
}, t.withConverter = n, t;
}
return n(function() {});
});

//     Underscore may be freely distributed under the MIT license.
!function() {
var n = "object" == typeof self && self.self === self && self || "object" == typeof global && global.global === global && global || this || {}, r = n._, e = Array.prototype, o = Object.prototype, s = "undefined" != typeof Symbol ? Symbol.prototype : null, u = e.push, c = e.slice, p = o.toString, i = o.hasOwnProperty, t = Array.isArray, a = Object.keys, l = Object.create, f = function() {}, h = function(n) {
return n instanceof h ? n : this instanceof h ? void (this._wrapped = n) : new h(n);
};
"undefined" == typeof exports || exports.nodeType ? n._ = h : ("undefined" != typeof module && !module.nodeType && module.exports && (exports = module.exports = h), 
exports._ = h), h.VERSION = "1.9.1";
var v, y = function(u, i, n) {
if (void 0 === i) return u;
switch (null == n ? 3 : n) {
case 1:
return function(n) {
return u.call(i, n);
};

case 3:
return function(n, r, t) {
return u.call(i, n, r, t);
};

case 4:
return function(n, r, t, e) {
return u.call(i, n, r, t, e);
};
}
return function() {
return u.apply(i, arguments);
};
}, d = function(n, r, t) {
return h.iteratee !== v ? h.iteratee(n, r) : null == n ? h.identity : h.isFunction(n) ? y(n, r, t) : h.isObject(n) && !h.isArray(n) ? h.matcher(n) : h.property(n);
};
h.iteratee = v = function(n, r) {
return d(n, r, 1 / 0);
};
var g = function(u, i) {
return i = null == i ? u.length - 1 : +i, function() {
for (var n = Math.max(arguments.length - i, 0), r = Array(n), t = 0; t < n; t++) r[t] = arguments[t + i];
switch (i) {
case 0:
return u.call(this, r);

case 1:
return u.call(this, arguments[0], r);

case 2:
return u.call(this, arguments[0], arguments[1], r);
}
var e = Array(i + 1);
for (t = 0; t < i; t++) e[t] = arguments[t];
return e[i] = r, u.apply(this, e);
};
}, m = function(n) {
if (!h.isObject(n)) return {};
if (l) return l(n);
f.prototype = n;
var r = new f();
return f.prototype = null, r;
}, b = function(r) {
return function(n) {
return null == n ? void 0 : n[r];
};
}, j = function(n, r) {
return null != n && i.call(n, r);
}, x = function(n, r) {
for (var t = r.length, e = 0; e < t; e++) {
if (null == n) return;
n = n[r[e]];
}
return t ? n : void 0;
}, _ = Math.pow(2, 53) - 1, A = b("length"), w = function(n) {
var r = A(n);
return "number" == typeof r && 0 <= r && r <= _;
};
h.each = h.forEach = function(n, r, t) {
var e, u;
if (r = y(r, t), w(n)) for (e = 0, u = n.length; e < u; e++) r(n[e], e, n); else {
var i = h.keys(n);
for (e = 0, u = i.length; e < u; e++) r(n[i[e]], i[e], n);
}
return n;
}, h.map = h.collect = function(n, r, t) {
r = d(r, t);
for (var e = !w(n) && h.keys(n), u = (e || n).length, i = Array(u), o = 0; o < u; o++) {
var a = e ? e[o] : o;
i[o] = r(n[a], a, n);
}
return i;
};
var O = function(c) {
return function(n, r, t, e) {
var u = 3 <= arguments.length;
return function(n, r, t, e) {
var u = !w(n) && h.keys(n), i = (u || n).length, o = 0 < c ? 0 : i - 1;
for (e || (t = n[u ? u[o] : o], o += c); 0 <= o && o < i; o += c) {
var a = u ? u[o] : o;
t = r(t, n[a], a, n);
}
return t;
}(n, y(r, e, 4), t, u);
};
};
h.reduce = h.foldl = h.inject = O(1), h.reduceRight = h.foldr = O(-1), h.find = h.detect = function(n, r, t) {
var e = (w(n) ? h.findIndex : h.findKey)(n, r, t);
if (void 0 !== e && -1 !== e) return n[e];
}, h.filter = h.select = function(n, e, r) {
var u = [];
return e = d(e, r), h.each(n, function(n, r, t) {
e(n, r, t) && u.push(n);
}), u;
}, h.reject = function(n, r, t) {
return h.filter(n, h.negate(d(r)), t);
}, h.every = h.all = function(n, r, t) {
r = d(r, t);
for (var e = !w(n) && h.keys(n), u = (e || n).length, i = 0; i < u; i++) {
var o = e ? e[i] : i;
if (!r(n[o], o, n)) return !1;
}
return !0;
}, h.some = h.any = function(n, r, t) {
r = d(r, t);
for (var e = !w(n) && h.keys(n), u = (e || n).length, i = 0; i < u; i++) {
var o = e ? e[i] : i;
if (r(n[o], o, n)) return !0;
}
return !1;
}, h.contains = h.includes = h.include = function(n, r, t, e) {
return w(n) || (n = h.values(n)), ("number" != typeof t || e) && (t = 0), 0 <= h.indexOf(n, r, t);
}, h.invoke = g(function(n, t, e) {
var u, i;
return h.isFunction(t) ? i = t : h.isArray(t) && (u = t.slice(0, -1), t = t[t.length - 1]), 
h.map(n, function(n) {
var r = i;
if (!r) {
if (u && u.length && (n = x(n, u)), null == n) return;
r = n[t];
}
return null == r ? r : r.apply(n, e);
});
}), h.pluck = function(n, r) {
return h.map(n, h.property(r));
}, h.where = function(n, r) {
return h.filter(n, h.matcher(r));
}, h.findWhere = function(n, r) {
return h.find(n, h.matcher(r));
}, h.max = function(n, e, r) {
var t, u, i = -1 / 0, o = -1 / 0;
if (null == e || "number" == typeof e && "object" != typeof n[0] && null != n) for (var a = 0, c = (n = w(n) ? n : h.values(n)).length; a < c; a++) null != (t = n[a]) && i < t && (i = t); else e = d(e, r), 
h.each(n, function(n, r, t) {
u = e(n, r, t), (o < u || u === -1 / 0 && i === -1 / 0) && (i = n, o = u);
});
return i;
}, h.min = function(n, e, r) {
var t, u, i = 1 / 0, o = 1 / 0;
if (null == e || "number" == typeof e && "object" != typeof n[0] && null != n) for (var a = 0, c = (n = w(n) ? n : h.values(n)).length; a < c; a++) null != (t = n[a]) && t < i && (i = t); else e = d(e, r), 
h.each(n, function(n, r, t) {
((u = e(n, r, t)) < o || u === 1 / 0 && i === 1 / 0) && (i = n, o = u);
});
return i;
}, h.shuffle = function(n) {
return h.sample(n, 1 / 0);
}, h.sample = function(n, r, t) {
if (null == r || t) return w(n) || (n = h.values(n)), n[h.random(n.length - 1)];
var e = w(n) ? h.clone(n) : h.values(n), u = A(e);
r = Math.max(Math.min(r, u), 0);
for (var i = u - 1, o = 0; o < r; o++) {
var a = h.random(o, i), c = e[o];
e[o] = e[a], e[a] = c;
}
return e.slice(0, r);
}, h.sortBy = function(n, e, r) {
var u = 0;
return e = d(e, r), h.pluck(h.map(n, function(n, r, t) {
return {
value: n,
index: u++,
criteria: e(n, r, t)
};
}).sort(function(n, r) {
var t = n.criteria, e = r.criteria;
if (t !== e) {
if (e < t || void 0 === t) return 1;
if (t < e || void 0 === e) return -1;
}
return n.index - r.index;
}), "value");
};
var k = function(o, r) {
return function(e, u, n) {
var i = r ? [ [], [] ] : {};
return u = d(u, n), h.each(e, function(n, r) {
var t = u(n, r, e);
o(i, n, t);
}), i;
};
};
h.groupBy = k(function(n, r, t) {
j(n, t) ? n[t].push(r) : n[t] = [ r ];
}), h.indexBy = k(function(n, r, t) {
n[t] = r;
}), h.countBy = k(function(n, r, t) {
j(n, t) ? n[t]++ : n[t] = 1;
});
var S = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
h.toArray = function(n) {
return n ? h.isArray(n) ? c.call(n) : h.isString(n) ? n.match(S) : w(n) ? h.map(n, h.identity) : h.values(n) : [];
}, h.size = function(n) {
return null == n ? 0 : w(n) ? n.length : h.keys(n).length;
}, h.partition = k(function(n, r, t) {
n[t ? 0 : 1].push(r);
}, !0), h.first = h.head = h.take = function(n, r, t) {
return null == n || n.length < 1 ? null == r ? void 0 : [] : null == r || t ? n[0] : h.initial(n, n.length - r);
}, h.initial = function(n, r, t) {
return c.call(n, 0, Math.max(0, n.length - (null == r || t ? 1 : r)));
}, h.last = function(n, r, t) {
return null == n || n.length < 1 ? null == r ? void 0 : [] : null == r || t ? n[n.length - 1] : h.rest(n, Math.max(0, n.length - r));
}, h.rest = h.tail = h.drop = function(n, r, t) {
return c.call(n, null == r || t ? 1 : r);
}, h.compact = function(n) {
return h.filter(n, Boolean);
};
var M = function(n, r, t, e) {
for (var u = (e = e || []).length, i = 0, o = A(n); i < o; i++) {
var a = n[i];
if (w(a) && (h.isArray(a) || h.isArguments(a))) if (r) for (var c = 0, l = a.length; c < l; ) e[u++] = a[c++]; else M(a, r, t, e), 
u = e.length; else t || (e[u++] = a);
}
return e;
};
h.flatten = function(n, r) {
return M(n, r, !1);
}, h.without = g(function(n, r) {
return h.difference(n, r);
}), h.uniq = h.unique = function(n, r, t, e) {
h.isBoolean(r) || (e = t, t = r, r = !1), null != t && (t = d(t, e));
for (var u = [], i = [], o = 0, a = A(n); o < a; o++) {
var c = n[o], l = t ? t(c, o, n) : c;
r && !t ? (o && i === l || u.push(c), i = l) : t ? h.contains(i, l) || (i.push(l), 
u.push(c)) : h.contains(u, c) || u.push(c);
}
return u;
}, h.union = g(function(n) {
return h.uniq(M(n, !0, !0));
}), h.intersection = function(n) {
for (var r = [], t = arguments.length, e = 0, u = A(n); e < u; e++) {
var i = n[e];
if (!h.contains(r, i)) {
var o;
for (o = 1; o < t && h.contains(arguments[o], i); o++) ;
o === t && r.push(i);
}
}
return r;
}, h.difference = g(function(n, r) {
return r = M(r, !0, !0), h.filter(n, function(n) {
return !h.contains(r, n);
});
}), h.unzip = function(n) {
for (var r = n && h.max(n, A).length || 0, t = Array(r), e = 0; e < r; e++) t[e] = h.pluck(n, e);
return t;
}, h.zip = g(h.unzip), h.object = function(n, r) {
for (var t = {}, e = 0, u = A(n); e < u; e++) r ? t[n[e]] = r[e] : t[n[e][0]] = n[e][1];
return t;
};
var F = function(i) {
return function(n, r, t) {
r = d(r, t);
for (var e = A(n), u = 0 < i ? 0 : e - 1; 0 <= u && u < e; u += i) if (r(n[u], u, n)) return u;
return -1;
};
};
h.findIndex = F(1), h.findLastIndex = F(-1), h.sortedIndex = function(n, r, t, e) {
for (var u = (t = d(t, e, 1))(r), i = 0, o = A(n); i < o; ) {
var a = Math.floor((i + o) / 2);
t(n[a]) < u ? i = a + 1 : o = a;
}
return i;
};
var E = function(i, o, a) {
return function(n, r, t) {
var e = 0, u = A(n);
if ("number" == typeof t) 0 < i ? e = 0 <= t ? t : Math.max(t + u, e) : u = 0 <= t ? Math.min(t + 1, u) : t + u + 1; else if (a && t && u) return n[t = a(n, r)] === r ? t : -1;
if (r != r) return 0 <= (t = o(c.call(n, e, u), h.isNaN)) ? t + e : -1;
for (t = 0 < i ? e : u - 1; 0 <= t && t < u; t += i) if (n[t] === r) return t;
return -1;
};
};
h.indexOf = E(1, h.findIndex, h.sortedIndex), h.lastIndexOf = E(-1, h.findLastIndex), 
h.range = function(n, r, t) {
null == r && (r = n || 0, n = 0), t || (t = r < n ? -1 : 1);
for (var e = Math.max(Math.ceil((r - n) / t), 0), u = Array(e), i = 0; i < e; i++, 
n += t) u[i] = n;
return u;
}, h.chunk = function(n, r) {
if (null == r || r < 1) return [];
for (var t = [], e = 0, u = n.length; e < u; ) t.push(c.call(n, e, e += r));
return t;
};
var N = function(n, r, t, e, u) {
if (!(e instanceof r)) return n.apply(t, u);
var i = m(n.prototype), o = n.apply(i, u);
return h.isObject(o) ? o : i;
};
h.bind = g(function(r, t, e) {
if (!h.isFunction(r)) throw new TypeError("Bind must be called on a function");
var u = g(function(n) {
return N(r, u, t, this, e.concat(n));
});
return u;
}), h.partial = g(function(u, i) {
var o = h.partial.placeholder, a = function() {
for (var n = 0, r = i.length, t = Array(r), e = 0; e < r; e++) t[e] = i[e] === o ? arguments[n++] : i[e];
for (;n < arguments.length; ) t.push(arguments[n++]);
return N(u, a, this, this, t);
};
return a;
}), (h.partial.placeholder = h).bindAll = g(function(n, r) {
var t = (r = M(r, !1, !1)).length;
if (t < 1) throw new Error("bindAll must be passed function names");
for (;t--; ) {
var e = r[t];
n[e] = h.bind(n[e], n);
}
}), h.memoize = function(e, u) {
var i = function(n) {
var r = i.cache, t = "" + (u ? u.apply(this, arguments) : n);
return j(r, t) || (r[t] = e.apply(this, arguments)), r[t];
};
return i.cache = {}, i;
}, h.delay = g(function(n, r, t) {
return setTimeout(function() {
return n.apply(null, t);
}, r);
}), h.defer = h.partial(h.delay, h, 1), h.throttle = function(t, e, u) {
var i, o, a, c, l = 0;
u || (u = {});
var f = function() {
l = !1 === u.leading ? 0 : h.now(), i = null, c = t.apply(o, a), i || (o = a = null);
}, n = function() {
var n = h.now();
l || !1 !== u.leading || (l = n);
var r = e - (n - l);
return o = this, a = arguments, r <= 0 || e < r ? (i && (clearTimeout(i), i = null), 
l = n, c = t.apply(o, a), i || (o = a = null)) : i || !1 === u.trailing || (i = setTimeout(f, r)), 
c;
};
return n.cancel = function() {
clearTimeout(i), l = 0, i = o = a = null;
}, n;
}, h.debounce = function(t, e, u) {
var i, o, a = function(n, r) {
i = null, r && (o = t.apply(n, r));
}, n = g(function(n) {
if (i && clearTimeout(i), u) {
var r = !i;
i = setTimeout(a, e), r && (o = t.apply(this, n));
} else i = h.delay(a, e, this, n);
return o;
});
return n.cancel = function() {
clearTimeout(i), i = null;
}, n;
}, h.wrap = function(n, r) {
return h.partial(r, n);
}, h.negate = function(n) {
return function() {
return !n.apply(this, arguments);
};
}, h.compose = function() {
var t = arguments, e = t.length - 1;
return function() {
for (var n = e, r = t[e].apply(this, arguments); n--; ) r = t[n].call(this, r);
return r;
};
}, h.after = function(n, r) {
return function() {
if (--n < 1) return r.apply(this, arguments);
};
}, h.before = function(n, r) {
var t;
return function() {
return 0 < --n && (t = r.apply(this, arguments)), n <= 1 && (r = null), t;
};
}, h.once = h.partial(h.before, 2), h.restArguments = g;
var I = !{
toString: null
}.propertyIsEnumerable("toString"), T = [ "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString" ], B = function(n, r) {
var t = T.length, e = n.constructor, u = h.isFunction(e) && e.prototype || o, i = "constructor";
for (j(n, i) && !h.contains(r, i) && r.push(i); t--; ) (i = T[t]) in n && n[i] !== u[i] && !h.contains(r, i) && r.push(i);
};
h.keys = function(n) {
if (!h.isObject(n)) return [];
if (a) return a(n);
var r = [];
for (var t in n) j(n, t) && r.push(t);
return I && B(n, r), r;
}, h.allKeys = function(n) {
if (!h.isObject(n)) return [];
var r = [];
for (var t in n) r.push(t);
return I && B(n, r), r;
}, h.values = function(n) {
for (var r = h.keys(n), t = r.length, e = Array(t), u = 0; u < t; u++) e[u] = n[r[u]];
return e;
}, h.mapObject = function(n, r, t) {
r = d(r, t);
for (var e = h.keys(n), u = e.length, i = {}, o = 0; o < u; o++) {
var a = e[o];
i[a] = r(n[a], a, n);
}
return i;
}, h.pairs = function(n) {
for (var r = h.keys(n), t = r.length, e = Array(t), u = 0; u < t; u++) e[u] = [ r[u], n[r[u]] ];
return e;
}, h.invert = function(n) {
for (var r = {}, t = h.keys(n), e = 0, u = t.length; e < u; e++) r[n[t[e]]] = t[e];
return r;
}, h.functions = h.methods = function(n) {
var r = [];
for (var t in n) h.isFunction(n[t]) && r.push(t);
return r.sort();
};
var R = function(c, l) {
return function(n) {
var r = arguments.length;
if (l && (n = Object(n)), r < 2 || null == n) return n;
for (var t = 1; t < r; t++) for (var e = arguments[t], u = c(e), i = u.length, o = 0; o < i; o++) {
var a = u[o];
l && void 0 !== n[a] || (n[a] = e[a]);
}
return n;
};
};
h.extend = R(h.allKeys), h.extendOwn = h.assign = R(h.keys), h.findKey = function(n, r, t) {
r = d(r, t);
for (var e, u = h.keys(n), i = 0, o = u.length; i < o; i++) if (r(n[e = u[i]], e, n)) return e;
};
var q, K, z = function(n, r, t) {
return r in t;
};
h.pick = g(function(n, r) {
var t = {}, e = r[0];
if (null == n) return t;
h.isFunction(e) ? (1 < r.length && (e = y(e, r[1])), r = h.allKeys(n)) : (e = z, 
r = M(r, !1, !1), n = Object(n));
for (var u = 0, i = r.length; u < i; u++) {
var o = r[u], a = n[o];
e(a, o, n) && (t[o] = a);
}
return t;
}), h.omit = g(function(n, t) {
var r, e = t[0];
return h.isFunction(e) ? (e = h.negate(e), 1 < t.length && (r = t[1])) : (t = h.map(M(t, !1, !1), String), 
e = function(n, r) {
return !h.contains(t, r);
}), h.pick(n, e, r);
}), h.defaults = R(h.allKeys, !0), h.create = function(n, r) {
var t = m(n);
return r && h.extendOwn(t, r), t;
}, h.clone = function(n) {
return h.isObject(n) ? h.isArray(n) ? n.slice() : h.extend({}, n) : n;
}, h.tap = function(n, r) {
return r(n), n;
}, h.isMatch = function(n, r) {
var t = h.keys(r), e = t.length;
if (null == n) return !e;
for (var u = Object(n), i = 0; i < e; i++) {
var o = t[i];
if (r[o] !== u[o] || !(o in u)) return !1;
}
return !0;
}, q = function(n, r, t, e) {
if (n === r) return 0 !== n || 1 / n == 1 / r;
if (null == n || null == r) return !1;
if (n != n) return r != r;
var u = typeof n;
return ("function" === u || "object" === u || "object" == typeof r) && K(n, r, t, e);
}, K = function(n, r, t, e) {
n instanceof h && (n = n._wrapped), r instanceof h && (r = r._wrapped);
var u = p.call(n);
if (u !== p.call(r)) return !1;
switch (u) {
case "[object RegExp]":
case "[object String]":
return "" + n == "" + r;

case "[object Number]":
return +n != +n ? +r != +r : 0 == +n ? 1 / +n == 1 / r : +n == +r;

case "[object Date]":
case "[object Boolean]":
return +n == +r;

case "[object Symbol]":
return s.valueOf.call(n) === s.valueOf.call(r);
}
var i = "[object Array]" === u;
if (!i) {
if ("object" != typeof n || "object" != typeof r) return !1;
var o = n.constructor, a = r.constructor;
if (o !== a && !(h.isFunction(o) && o instanceof o && h.isFunction(a) && a instanceof a) && "constructor" in n && "constructor" in r) return !1;
}
e = e || [];
for (var c = (t = t || []).length; c--; ) if (t[c] === n) return e[c] === r;
if (t.push(n), e.push(r), i) {
if ((c = n.length) !== r.length) return !1;
for (;c--; ) if (!q(n[c], r[c], t, e)) return !1;
} else {
var l, f = h.keys(n);
if (c = f.length, h.keys(r).length !== c) return !1;
for (;c--; ) if (l = f[c], !j(r, l) || !q(n[l], r[l], t, e)) return !1;
}
return t.pop(), e.pop(), !0;
}, h.isEqual = function(n, r) {
return q(n, r);
}, h.isEmpty = function(n) {
return null == n || (w(n) && (h.isArray(n) || h.isString(n) || h.isArguments(n)) ? 0 === n.length : 0 === h.keys(n).length);
}, h.isElement = function(n) {
return !(!n || 1 !== n.nodeType);
}, h.isArray = t || function(n) {
return "[object Array]" === p.call(n);
}, h.isObject = function(n) {
var r = typeof n;
return "function" === r || "object" === r && !!n;
}, h.each([ "Arguments", "Function", "String", "Number", "Date", "RegExp", "Error", "Symbol", "Map", "WeakMap", "Set", "WeakSet" ], function(r) {
h["is" + r] = function(n) {
return p.call(n) === "[object " + r + "]";
};
}), h.isArguments(arguments) || (h.isArguments = function(n) {
return j(n, "callee");
});
var D = n.document && n.document.childNodes;
"function" != typeof /./ && "object" != typeof Int8Array && "function" != typeof D && (h.isFunction = function(n) {
return "function" == typeof n || !1;
}), h.isFinite = function(n) {
return !h.isSymbol(n) && isFinite(n) && !isNaN(parseFloat(n));
}, h.isNaN = function(n) {
return h.isNumber(n) && isNaN(n);
}, h.isBoolean = function(n) {
return !0 === n || !1 === n || "[object Boolean]" === p.call(n);
}, h.isNull = function(n) {
return null === n;
}, h.isUndefined = function(n) {
return void 0 === n;
}, h.has = function(n, r) {
if (!h.isArray(r)) return j(n, r);
for (var t = r.length, e = 0; e < t; e++) {
var u = r[e];
if (null == n || !i.call(n, u)) return !1;
n = n[u];
}
return !!t;
}, h.noConflict = function() {
return n._ = r, this;
}, h.identity = function(n) {
return n;
}, h.constant = function(n) {
return function() {
return n;
};
}, h.noop = function() {}, h.property = function(r) {
return h.isArray(r) ? function(n) {
return x(n, r);
} : b(r);
}, h.propertyOf = function(r) {
return null == r ? function() {} : function(n) {
return h.isArray(n) ? x(r, n) : r[n];
};
}, h.matcher = h.matches = function(r) {
return r = h.extendOwn({}, r), function(n) {
return h.isMatch(n, r);
};
}, h.times = function(n, r, t) {
var e = Array(Math.max(0, n));
r = y(r, t, 1);
for (var u = 0; u < n; u++) e[u] = r(u);
return e;
}, h.random = function(n, r) {
return null == r && (r = n, n = 0), n + Math.floor(Math.random() * (r - n + 1));
}, h.now = Date.now || function() {
return new Date().getTime();
};
var L = {
"&": "&amp;",
"<": "&lt;",
">": "&gt;",
'"': "&quot;",
"'": "&#x27;",
"`": "&#x60;"
}, P = h.invert(L), W = function(r) {
var t = function(n) {
return r[n];
}, n = "(?:" + h.keys(r).join("|") + ")", e = RegExp(n), u = RegExp(n, "g");
return function(n) {
return n = null == n ? "" : "" + n, e.test(n) ? n.replace(u, t) : n;
};
};
h.escape = W(L), h.unescape = W(P), h.result = function(n, r, t) {
h.isArray(r) || (r = [ r ]);
var e = r.length;
if (!e) return h.isFunction(t) ? t.call(n) : t;
for (var u = 0; u < e; u++) {
var i = null == n ? void 0 : n[r[u]];
void 0 === i && (i = t, u = e), n = h.isFunction(i) ? i.call(n) : i;
}
return n;
};
var C = 0;
h.uniqueId = function(n) {
var r = ++C + "";
return n ? n + r : r;
}, h.templateSettings = {
evaluate: /<%([\s\S]+?)%>/g,
interpolate: /<%=([\s\S]+?)%>/g,
escape: /<%-([\s\S]+?)%>/g
};
var J = /(.)^/, U = {
"'": "'",
"\\": "\\",
"\r": "r",
"\n": "n",
"\u2028": "u2028",
"\u2029": "u2029"
}, V = /\\|'|\r|\n|\u2028|\u2029/g, $ = function(n) {
return "\\" + U[n];
};
h.template = function(i, n, r) {
!n && r && (n = r), n = h.defaults({}, n, h.templateSettings);
var t, e = RegExp([ (n.escape || J).source, (n.interpolate || J).source, (n.evaluate || J).source ].join("|") + "|$", "g"), o = 0, a = "__p+='";
i.replace(e, function(n, r, t, e, u) {
return a += i.slice(o, u).replace(V, $), o = u + n.length, r ? a += "'+\n((__t=(" + r + "))==null?'':_.escape(__t))+\n'" : t ? a += "'+\n((__t=(" + t + "))==null?'':__t)+\n'" : e && (a += "';\n" + e + "\n__p+='"), 
n;
}), a += "';\n", n.variable || (a = "with(obj||{}){\n" + a + "}\n"), a = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + a + "return __p;\n";
try {
t = new Function(n.variable || "obj", "_", a);
} catch (n) {
throw n.source = a, n;
}
var u = function(n) {
return t.call(this, n, h);
}, c = n.variable || "obj";
return u.source = "function(" + c + "){\n" + a + "}", u;
}, h.chain = function(n) {
var r = h(n);
return r._chain = !0, r;
};
var G = function(n, r) {
return n._chain ? h(r).chain() : r;
};
h.mixin = function(t) {
return h.each(h.functions(t), function(n) {
var r = h[n] = t[n];
h.prototype[n] = function() {
var n = [ this._wrapped ];
return u.apply(n, arguments), G(this, r.apply(h, n));
};
}), h;
}, h.mixin(h), h.each([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], function(r) {
var t = e[r];
h.prototype[r] = function() {
var n = this._wrapped;
return t.apply(n, arguments), "shift" !== r && "splice" !== r || 0 !== n.length || delete n[0], 
G(this, n);
};
}), h.each([ "concat", "join", "slice" ], function(n) {
var r = e[n];
h.prototype[n] = function() {
return G(this, r.apply(this._wrapped, arguments));
};
}), h.prototype.value = function() {
return this._wrapped;
}, h.prototype.valueOf = h.prototype.toJSON = h.prototype.value, h.prototype.toString = function() {
return String(this._wrapped);
}, "function" == typeof define && define.amd && define("underscore", [], function() {
return h;
});
}();

!function(e, n) {
"use strict";
"function" == typeof define && define.amd ? define("stackframe", [], n) : "object" == typeof exports ? module.exports = n() : e.StackFrame = n();
}(this, function() {
"use strict";
function e(e) {
return !isNaN(parseFloat(e)) && isFinite(e);
}
function n(e, n, r, t, o, i) {
void 0 !== e && this.setFunctionName(e), void 0 !== n && this.setArgs(n), void 0 !== r && this.setFileName(r), 
void 0 !== t && this.setLineNumber(t), void 0 !== o && this.setColumnNumber(o), 
void 0 !== i && this.setSource(i);
}
return n.prototype = {
getFunctionName: function() {
return this.functionName;
},
setFunctionName: function(e) {
this.functionName = String(e);
},
getArgs: function() {
return this.args;
},
setArgs: function(e) {
if ("[object Array]" !== Object.prototype.toString.call(e)) throw new TypeError("Args must be an Array");
this.args = e;
},
getFileName: function() {
return this.fileName;
},
setFileName: function(e) {
this.fileName = String(e);
},
getLineNumber: function() {
return this.lineNumber;
},
setLineNumber: function(n) {
if (!e(n)) throw new TypeError("Line Number must be a Number");
this.lineNumber = Number(n);
},
getColumnNumber: function() {
return this.columnNumber;
},
setColumnNumber: function(n) {
if (!e(n)) throw new TypeError("Column Number must be a Number");
this.columnNumber = Number(n);
},
getSource: function() {
return this.source;
},
setSource: function(e) {
this.source = String(e);
},
toString: function() {
var n = this.getFunctionName() || "{anonymous}", r = "(" + (this.getArgs() || []).join(",") + ")", t = this.getFileName() ? "@" + this.getFileName() : "", o = e(this.getLineNumber()) ? ":" + this.getLineNumber() : "", i = e(this.getColumnNumber()) ? ":" + this.getColumnNumber() : "";
return n + r + t + o + i;
}
}, n;
});

var SourceMap = function(e) {
function n(t) {
if (r[t]) return r[t].exports;
var o = r[t] = {
exports: {},
id: t,
loaded: !1
};
return e[t].call(o.exports, o, o.exports, n), o.loaded = !0, o.exports;
}
var r = {};
return n.m = e, n.c = r, n.p = "", n(0);
}([ function(e, n, r) {
function t(e) {
var n = e;
return "string" == typeof e && (n = JSON.parse(e.replace(/^\)\]\}'/, ""))), null != n.sections ? new a(n) : new o(n);
}
function o(e) {
var n = e;
"string" == typeof e && (n = JSON.parse(e.replace(/^\)\]\}'/, "")));
var r = s.getArg(n, "version"), t = s.getArg(n, "sources"), o = s.getArg(n, "names", []), i = s.getArg(n, "sourceRoot", null), a = s.getArg(n, "sourcesContent", null), u = s.getArg(n, "mappings"), l = s.getArg(n, "file", null);
if (r != this._version) throw new Error("Unsupported version: " + r);
t = t.map(String).map(s.normalize).map(function(e) {
return i && s.isAbsolute(i) && s.isAbsolute(e) ? s.relative(i, e) : e;
}), this._names = c.fromArray(o.map(String), !0), this._sources = c.fromArray(t, !0), 
this.sourceRoot = i, this.sourcesContent = a, this._mappings = u, this.file = l;
}
function i() {
this.generatedLine = 0, this.generatedColumn = 0, this.source = null, this.originalLine = null, 
this.originalColumn = null, this.name = null;
}
function a(e) {
var n = e;
"string" == typeof e && (n = JSON.parse(e.replace(/^\)\]\}'/, "")));
var r = s.getArg(n, "version"), o = s.getArg(n, "sections");
if (r != this._version) throw new Error("Unsupported version: " + r);
this._sources = new c(), this._names = new c();
var i = {
line: -1,
column: 0
};
this._sections = o.map(function(e) {
if (e.url) throw new Error("Support for url field in sections not implemented.");
var n = s.getArg(e, "offset"), r = s.getArg(n, "line"), o = s.getArg(n, "column");
if (r < i.line || r === i.line && o < i.column) throw new Error("Section offsets must be ordered and non-overlapping.");
return i = n, {
generatedOffset: {
generatedLine: r + 1,
generatedColumn: o + 1
},
consumer: new t(s.getArg(e, "map"))
};
});
}
var s = r(1), u = r(2), c = r(3).ArraySet, l = r(4), f = r(6).quickSort;
t.fromSourceMap = function(e) {
return o.fromSourceMap(e);
}, t.prototype._version = 3, t.prototype.__generatedMappings = null, Object.defineProperty(t.prototype, "_generatedMappings", {
get: function() {
return this.__generatedMappings || this._parseMappings(this._mappings, this.sourceRoot), 
this.__generatedMappings;
}
}), t.prototype.__originalMappings = null, Object.defineProperty(t.prototype, "_originalMappings", {
get: function() {
return this.__originalMappings || this._parseMappings(this._mappings, this.sourceRoot), 
this.__originalMappings;
}
}), t.prototype._charIsMappingSeparator = function(e, n) {
var r = e.charAt(n);
return ";" === r || "," === r;
}, t.prototype._parseMappings = function(e, n) {
throw new Error("Subclasses must implement _parseMappings");
}, t.GENERATED_ORDER = 1, t.ORIGINAL_ORDER = 2, t.GREATEST_LOWER_BOUND = 1, t.LEAST_UPPER_BOUND = 2, 
t.prototype.eachMapping = function(e, n, r) {
var o, i = n || null, a = r || t.GENERATED_ORDER;
switch (a) {
case t.GENERATED_ORDER:
o = this._generatedMappings;
break;

case t.ORIGINAL_ORDER:
o = this._originalMappings;
break;

default:
throw new Error("Unknown order of iteration.");
}
var u = this.sourceRoot;
o.map(function(e) {
var n = null === e.source ? null : this._sources.at(e.source);
return null != n && null != u && (n = s.join(u, n)), {
source: n,
generatedLine: e.generatedLine,
generatedColumn: e.generatedColumn,
originalLine: e.originalLine,
originalColumn: e.originalColumn,
name: null === e.name ? null : this._names.at(e.name)
};
}, this).forEach(e, i);
}, t.prototype.allGeneratedPositionsFor = function(e) {
var n = s.getArg(e, "line"), r = {
source: s.getArg(e, "source"),
originalLine: n,
originalColumn: s.getArg(e, "column", 0)
};
if (null != this.sourceRoot && (r.source = s.relative(this.sourceRoot, r.source)), 
!this._sources.has(r.source)) return [];
r.source = this._sources.indexOf(r.source);
var t = [], o = this._findMapping(r, this._originalMappings, "originalLine", "originalColumn", s.compareByOriginalPositions, u.LEAST_UPPER_BOUND);
if (o >= 0) {
var i = this._originalMappings[o];
if (void 0 === e.column) for (var a = i.originalLine; i && i.originalLine === a; ) t.push({
line: s.getArg(i, "generatedLine", null),
column: s.getArg(i, "generatedColumn", null),
lastColumn: s.getArg(i, "lastGeneratedColumn", null)
}), i = this._originalMappings[++o]; else for (var c = i.originalColumn; i && i.originalLine === n && i.originalColumn == c; ) t.push({
line: s.getArg(i, "generatedLine", null),
column: s.getArg(i, "generatedColumn", null),
lastColumn: s.getArg(i, "lastGeneratedColumn", null)
}), i = this._originalMappings[++o];
}
return t;
}, n.SourceMapConsumer = t, o.prototype = Object.create(t.prototype), o.prototype.consumer = t, 
o.fromSourceMap = function(e) {
var n = Object.create(o.prototype), r = n._names = c.fromArray(e._names.toArray(), !0), t = n._sources = c.fromArray(e._sources.toArray(), !0);
n.sourceRoot = e._sourceRoot, n.sourcesContent = e._generateSourcesContent(n._sources.toArray(), n.sourceRoot), 
n.file = e._file;
for (var a = e._mappings.toArray().slice(), u = n.__generatedMappings = [], l = n.__originalMappings = [], p = 0, g = a.length; g > p; p++) {
var h = a[p], m = new i();
m.generatedLine = h.generatedLine, m.generatedColumn = h.generatedColumn, h.source && (m.source = t.indexOf(h.source), 
m.originalLine = h.originalLine, m.originalColumn = h.originalColumn, h.name && (m.name = r.indexOf(h.name)), 
l.push(m)), u.push(m);
}
return f(n.__originalMappings, s.compareByOriginalPositions), n;
}, o.prototype._version = 3, Object.defineProperty(o.prototype, "sources", {
get: function() {
return this._sources.toArray().map(function(e) {
return null != this.sourceRoot ? s.join(this.sourceRoot, e) : e;
}, this);
}
}), o.prototype._parseMappings = function(e, n) {
for (var r, t, o, a, u, c = 1, p = 0, g = 0, h = 0, m = 0, d = 0, v = e.length, _ = 0, y = {}, w = {}, b = [], C = []; v > _; ) if (";" === e.charAt(_)) c++, 
_++, p = 0; else if ("," === e.charAt(_)) _++; else {
for (r = new i(), r.generatedLine = c, a = _; v > a && !this._charIsMappingSeparator(e, a); a++) ;
if (t = e.slice(_, a), o = y[t]) _ += t.length; else {
for (o = []; a > _; ) l.decode(e, _, w), u = w.value, _ = w.rest, o.push(u);
if (2 === o.length) throw new Error("Found a source, but no line and column");
if (3 === o.length) throw new Error("Found a source and line, but no column");
y[t] = o;
}
r.generatedColumn = p + o[0], p = r.generatedColumn, o.length > 1 && (r.source = m + o[1], 
m += o[1], r.originalLine = g + o[2], g = r.originalLine, r.originalLine += 1, r.originalColumn = h + o[3], 
h = r.originalColumn, o.length > 4 && (r.name = d + o[4], d += o[4])), C.push(r), 
"number" == typeof r.originalLine && b.push(r);
}
f(C, s.compareByGeneratedPositionsDeflated), this.__generatedMappings = C, f(b, s.compareByOriginalPositions), 
this.__originalMappings = b;
}, o.prototype._findMapping = function(e, n, r, t, o, i) {
if (e[r] <= 0) throw new TypeError("Line must be greater than or equal to 1, got " + e[r]);
if (e[t] < 0) throw new TypeError("Column must be greater than or equal to 0, got " + e[t]);
return u.search(e, n, o, i);
}, o.prototype.computeColumnSpans = function() {
for (var e = 0; e < this._generatedMappings.length; ++e) {
var n = this._generatedMappings[e];
if (e + 1 < this._generatedMappings.length) {
var r = this._generatedMappings[e + 1];
if (n.generatedLine === r.generatedLine) {
n.lastGeneratedColumn = r.generatedColumn - 1;
continue;
}
}
n.lastGeneratedColumn = 1 / 0;
}
}, o.prototype.originalPositionFor = function(e) {
var n = {
generatedLine: s.getArg(e, "line"),
generatedColumn: s.getArg(e, "column")
}, r = this._findMapping(n, this._generatedMappings, "generatedLine", "generatedColumn", s.compareByGeneratedPositionsDeflated, s.getArg(e, "bias", t.GREATEST_LOWER_BOUND));
if (r >= 0) {
var o = this._generatedMappings[r];
if (o.generatedLine === n.generatedLine) {
var i = s.getArg(o, "source", null);
null !== i && (i = this._sources.at(i), null != this.sourceRoot && (i = s.join(this.sourceRoot, i)));
var a = s.getArg(o, "name", null);
return null !== a && (a = this._names.at(a)), {
source: i,
line: s.getArg(o, "originalLine", null),
column: s.getArg(o, "originalColumn", null),
name: a
};
}
}
return {
source: null,
line: null,
column: null,
name: null
};
}, o.prototype.hasContentsOfAllSources = function() {
return this.sourcesContent ? this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(e) {
return null == e;
}) : !1;
}, o.prototype.sourceContentFor = function(e, n) {
if (!this.sourcesContent) return null;
if (null != this.sourceRoot && (e = s.relative(this.sourceRoot, e)), this._sources.has(e)) return this.sourcesContent[this._sources.indexOf(e)];
var r;
if (null != this.sourceRoot && (r = s.urlParse(this.sourceRoot))) {
var t = e.replace(/^file:\/\//, "");
if ("file" == r.scheme && this._sources.has(t)) return this.sourcesContent[this._sources.indexOf(t)];
if ((!r.path || "/" == r.path) && this._sources.has("/" + e)) return this.sourcesContent[this._sources.indexOf("/" + e)];
}
if (n) return null;
throw new Error('"' + e + '" is not in the SourceMap.');
}, o.prototype.generatedPositionFor = function(e) {
var n = s.getArg(e, "source");
if (null != this.sourceRoot && (n = s.relative(this.sourceRoot, n)), !this._sources.has(n)) return {
line: null,
column: null,
lastColumn: null
};
n = this._sources.indexOf(n);
var r = {
source: n,
originalLine: s.getArg(e, "line"),
originalColumn: s.getArg(e, "column")
}, o = this._findMapping(r, this._originalMappings, "originalLine", "originalColumn", s.compareByOriginalPositions, s.getArg(e, "bias", t.GREATEST_LOWER_BOUND));
if (o >= 0) {
var i = this._originalMappings[o];
if (i.source === r.source) return {
line: s.getArg(i, "generatedLine", null),
column: s.getArg(i, "generatedColumn", null),
lastColumn: s.getArg(i, "lastGeneratedColumn", null)
};
}
return {
line: null,
column: null,
lastColumn: null
};
}, n.BasicSourceMapConsumer = o, a.prototype = Object.create(t.prototype), a.prototype.constructor = t, 
a.prototype._version = 3, Object.defineProperty(a.prototype, "sources", {
get: function() {
for (var e = [], n = 0; n < this._sections.length; n++) for (var r = 0; r < this._sections[n].consumer.sources.length; r++) e.push(this._sections[n].consumer.sources[r]);
return e;
}
}), a.prototype.originalPositionFor = function(e) {
var n = {
generatedLine: s.getArg(e, "line"),
generatedColumn: s.getArg(e, "column")
}, r = u.search(n, this._sections, function(e, n) {
var r = e.generatedLine - n.generatedOffset.generatedLine;
return r ? r : e.generatedColumn - n.generatedOffset.generatedColumn;
}), t = this._sections[r];
return t ? t.consumer.originalPositionFor({
line: n.generatedLine - (t.generatedOffset.generatedLine - 1),
column: n.generatedColumn - (t.generatedOffset.generatedLine === n.generatedLine ? t.generatedOffset.generatedColumn - 1 : 0),
bias: e.bias
}) : {
source: null,
line: null,
column: null,
name: null
};
}, a.prototype.hasContentsOfAllSources = function() {
return this._sections.every(function(e) {
return e.consumer.hasContentsOfAllSources();
});
}, a.prototype.sourceContentFor = function(e, n) {
for (var r = 0; r < this._sections.length; r++) {
var t = this._sections[r], o = t.consumer.sourceContentFor(e, !0);
if (o) return o;
}
if (n) return null;
throw new Error('"' + e + '" is not in the SourceMap.');
}, a.prototype.generatedPositionFor = function(e) {
for (var n = 0; n < this._sections.length; n++) {
var r = this._sections[n];
if (-1 !== r.consumer.sources.indexOf(s.getArg(e, "source"))) {
var t = r.consumer.generatedPositionFor(e);
if (t) {
var o = {
line: t.line + (r.generatedOffset.generatedLine - 1),
column: t.column + (r.generatedOffset.generatedLine === t.line ? r.generatedOffset.generatedColumn - 1 : 0)
};
return o;
}
}
}
return {
line: null,
column: null
};
}, a.prototype._parseMappings = function(e, n) {
this.__generatedMappings = [], this.__originalMappings = [];
for (var r = 0; r < this._sections.length; r++) for (var t = this._sections[r], o = t.consumer._generatedMappings, i = 0; i < o.length; i++) {
var a = o[i], u = t.consumer._sources.at(a.source);
null !== t.consumer.sourceRoot && (u = s.join(t.consumer.sourceRoot, u)), this._sources.add(u), 
u = this._sources.indexOf(u);
var c = t.consumer._names.at(a.name);
this._names.add(c), c = this._names.indexOf(c);
var l = {
source: u,
generatedLine: a.generatedLine + (t.generatedOffset.generatedLine - 1),
generatedColumn: a.generatedColumn + (t.generatedOffset.generatedLine === a.generatedLine ? t.generatedOffset.generatedColumn - 1 : 0),
originalLine: a.originalLine,
originalColumn: a.originalColumn,
name: c
};
this.__generatedMappings.push(l), "number" == typeof l.originalLine && this.__originalMappings.push(l);
}
f(this.__generatedMappings, s.compareByGeneratedPositionsDeflated), f(this.__originalMappings, s.compareByOriginalPositions);
}, n.IndexedSourceMapConsumer = a;
}, function(e, n) {
function r(e, n, r) {
if (n in e) return e[n];
if (3 === arguments.length) return r;
throw new Error('"' + n + '" is a required argument.');
}
function t(e) {
var n = e.match(d);
return n ? {
scheme: n[1],
auth: n[2],
host: n[3],
port: n[4],
path: n[5]
} : null;
}
function o(e) {
var n = "";
return e.scheme && (n += e.scheme + ":"), n += "//", e.auth && (n += e.auth + "@"), 
e.host && (n += e.host), e.port && (n += ":" + e.port), e.path && (n += e.path), 
n;
}
function i(e) {
var r = e, i = t(e);
if (i) {
if (!i.path) return e;
r = i.path;
}
for (var a, s = n.isAbsolute(r), u = r.split(/\/+/), c = 0, l = u.length - 1; l >= 0; l--) a = u[l], 
"." === a ? u.splice(l, 1) : ".." === a ? c++ : c > 0 && ("" === a ? (u.splice(l + 1, c), 
c = 0) : (u.splice(l, 2), c--));
return r = u.join("/"), "" === r && (r = s ? "/" : "."), i ? (i.path = r, o(i)) : r;
}
function a(e, n) {
"" === e && (e = "."), "" === n && (n = ".");
var r = t(n), a = t(e);
if (a && (e = a.path || "/"), r && !r.scheme) return a && (r.scheme = a.scheme), 
o(r);
if (r || n.match(v)) return n;
if (a && !a.host && !a.path) return a.host = n, o(a);
var s = "/" === n.charAt(0) ? n : i(e.replace(/\/+$/, "") + "/" + n);
return a ? (a.path = s, o(a)) : s;
}
function s(e, n) {
"" === e && (e = "."), e = e.replace(/\/$/, "");
for (var r = 0; 0 !== n.indexOf(e + "/"); ) {
var t = e.lastIndexOf("/");
if (0 > t) return n;
if (e = e.slice(0, t), e.match(/^([^\/]+:\/)?\/*$/)) return n;
++r;
}
return Array(r + 1).join("../") + n.substr(e.length + 1);
}
function u(e) {
return e;
}
function c(e) {
return f(e) ? "$" + e : e;
}
function l(e) {
return f(e) ? e.slice(1) : e;
}
function f(e) {
if (!e) return !1;
var n = e.length;
if (9 > n) return !1;
if (95 !== e.charCodeAt(n - 1) || 95 !== e.charCodeAt(n - 2) || 111 !== e.charCodeAt(n - 3) || 116 !== e.charCodeAt(n - 4) || 111 !== e.charCodeAt(n - 5) || 114 !== e.charCodeAt(n - 6) || 112 !== e.charCodeAt(n - 7) || 95 !== e.charCodeAt(n - 8) || 95 !== e.charCodeAt(n - 9)) return !1;
for (var r = n - 10; r >= 0; r--) if (36 !== e.charCodeAt(r)) return !1;
return !0;
}
function p(e, n, r) {
var t = e.source - n.source;
return 0 !== t ? t : (t = e.originalLine - n.originalLine, 0 !== t ? t : (t = e.originalColumn - n.originalColumn, 
0 !== t || r ? t : (t = e.generatedColumn - n.generatedColumn, 0 !== t ? t : (t = e.generatedLine - n.generatedLine, 
0 !== t ? t : e.name - n.name))));
}
function g(e, n, r) {
var t = e.generatedLine - n.generatedLine;
return 0 !== t ? t : (t = e.generatedColumn - n.generatedColumn, 0 !== t || r ? t : (t = e.source - n.source, 
0 !== t ? t : (t = e.originalLine - n.originalLine, 0 !== t ? t : (t = e.originalColumn - n.originalColumn, 
0 !== t ? t : e.name - n.name))));
}
function h(e, n) {
return e === n ? 0 : e > n ? 1 : -1;
}
function m(e, n) {
var r = e.generatedLine - n.generatedLine;
return 0 !== r ? r : (r = e.generatedColumn - n.generatedColumn, 0 !== r ? r : (r = h(e.source, n.source), 
0 !== r ? r : (r = e.originalLine - n.originalLine, 0 !== r ? r : (r = e.originalColumn - n.originalColumn, 
0 !== r ? r : h(e.name, n.name)))));
}
n.getArg = r;
var d = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/, v = /^data:.+\,.+$/;
n.urlParse = t, n.urlGenerate = o, n.normalize = i, n.join = a, n.isAbsolute = function(e) {
return "/" === e.charAt(0) || !!e.match(d);
}, n.relative = s;
var _ = function() {
var e = Object.create(null);
return !("__proto__" in e);
}();
n.toSetString = _ ? u : c, n.fromSetString = _ ? u : l, n.compareByOriginalPositions = p, 
n.compareByGeneratedPositionsDeflated = g, n.compareByGeneratedPositionsInflated = m;
}, function(e, n) {
function r(e, t, o, i, a, s) {
var u = Math.floor((t - e) / 2) + e, c = a(o, i[u], !0);
return 0 === c ? u : c > 0 ? t - u > 1 ? r(u, t, o, i, a, s) : s == n.LEAST_UPPER_BOUND ? t < i.length ? t : -1 : u : u - e > 1 ? r(e, u, o, i, a, s) : s == n.LEAST_UPPER_BOUND ? u : 0 > e ? -1 : e;
}
n.GREATEST_LOWER_BOUND = 1, n.LEAST_UPPER_BOUND = 2, n.search = function(e, t, o, i) {
if (0 === t.length) return -1;
var a = r(-1, t.length, e, t, o, i || n.GREATEST_LOWER_BOUND);
if (0 > a) return -1;
for (;a - 1 >= 0 && 0 === o(t[a], t[a - 1], !0); ) --a;
return a;
};
}, function(e, n, r) {
function t() {
this._array = [], this._set = Object.create(null);
}
var o = r(1), i = Object.prototype.hasOwnProperty;
t.fromArray = function(e, n) {
for (var r = new t(), o = 0, i = e.length; i > o; o++) r.add(e[o], n);
return r;
}, t.prototype.size = function() {
return Object.getOwnPropertyNames(this._set).length;
}, t.prototype.add = function(e, n) {
var r = o.toSetString(e), t = i.call(this._set, r), a = this._array.length;
(!t || n) && this._array.push(e), t || (this._set[r] = a);
}, t.prototype.has = function(e) {
var n = o.toSetString(e);
return i.call(this._set, n);
}, t.prototype.indexOf = function(e) {
var n = o.toSetString(e);
if (i.call(this._set, n)) return this._set[n];
throw new Error('"' + e + '" is not in the set.');
}, t.prototype.at = function(e) {
if (e >= 0 && e < this._array.length) return this._array[e];
throw new Error("No element indexed by " + e);
}, t.prototype.toArray = function() {
return this._array.slice();
}, n.ArraySet = t;
}, function(e, n, r) {
function t(e) {
return 0 > e ? (-e << 1) + 1 : (e << 1) + 0;
}
function o(e) {
var n = 1 === (1 & e), r = e >> 1;
return n ? -r : r;
}
var i = r(5), a = 5, s = 1 << a, u = s - 1, c = s;
n.encode = function(e) {
var n, r = "", o = t(e);
do {
n = o & u, o >>>= a, o > 0 && (n |= c), r += i.encode(n);
} while (o > 0);
return r;
}, n.decode = function(e, n, r) {
var t, s, l = e.length, f = 0, p = 0;
do {
if (n >= l) throw new Error("Expected more digits in base 64 VLQ value.");
if (s = i.decode(e.charCodeAt(n++)), -1 === s) throw new Error("Invalid base64 digit: " + e.charAt(n - 1));
t = !!(s & c), s &= u, f += s << p, p += a;
} while (t);
r.value = o(f), r.rest = n;
};
}, function(e, n) {
var r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
n.encode = function(e) {
if (e >= 0 && e < r.length) return r[e];
throw new TypeError("Must be between 0 and 63: " + e);
}, n.decode = function(e) {
var n = 65, r = 90, t = 97, o = 122, i = 48, a = 57, s = 43, u = 47, c = 26, l = 52;
return e >= n && r >= e ? e - n : e >= t && o >= e ? e - t + c : e >= i && a >= e ? e - i + l : e == s ? 62 : e == u ? 63 : -1;
};
}, function(e, n) {
function r(e, n, r) {
var t = e[n];
e[n] = e[r], e[r] = t;
}
function t(e, n) {
return Math.round(e + Math.random() * (n - e));
}
function o(e, n, i, a) {
if (a > i) {
var s = t(i, a), u = i - 1;
r(e, s, a);
for (var c = e[a], l = i; a > l; l++) n(e[l], c) <= 0 && (u += 1, r(e, u, l));
r(e, u + 1, l);
var f = u + 1;
o(e, n, i, f - 1), o(e, n, f + 1, a);
}
}
n.quickSort = function(e, n) {
o(e, n, 0, e.length - 1);
};
} ]);

!function(e, n) {
"use strict";
"function" == typeof define && define.amd ? define("stacktrace-gps", [ "source-map", "stackframe" ], n) : "object" == typeof exports ? module.exports = n(require("source-map/lib/source-map-consumer"), require("stackframe")) : e.StackTraceGPS = n(e.SourceMap || e.sourceMap, e.StackFrame);
}(this, function(e, n) {
"use strict";
function r(e) {
return new Promise(function(n, r) {
var t = new XMLHttpRequest();
t.open("get", e), t.onerror = r, t.onreadystatechange = function() {
4 === t.readyState && (t.status >= 200 && t.status < 300 ? n(t.responseText) : r(new Error("HTTP status: " + t.status + " retrieving " + e)));
}, t.send();
});
}
function t(e) {
if ("undefined" != typeof window && window.atob) return window.atob(e);
throw new Error("You must supply a polyfill for window.atob in this environment");
}
function o(e) {
if ("undefined" != typeof JSON && JSON.parse) return JSON.parse(e);
throw new Error("You must supply a polyfill for JSON.parse in this environment");
}
function i(e, n) {
for (var r, t = /function\s+([^(]*?)\s*\(([^)]*)\)/, o = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/, i = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/, a = e.split("\n"), s = "", u = Math.min(n, 20), c = 0; u > c; ++c) {
var l = a[n - c - 1], f = l.indexOf("//");
if (f >= 0 && (l = l.substr(0, f)), l) {
if (s = l + s, r = o.exec(s), r && r[1]) return r[1];
if (r = t.exec(s), r && r[1]) return r[1];
if (r = i.exec(s), r && r[1]) return r[1];
}
}
}
function a() {
if ("function" != typeof Object.defineProperty || "function" != typeof Object.create) throw new Error("Unable to consume source maps in older browsers");
}
function s(e) {
if ("object" != typeof e) throw new TypeError("Given StackFrame is not an object");
if ("string" != typeof e.fileName) throw new TypeError("Given file name is not a String");
if ("number" != typeof e.lineNumber || e.lineNumber % 1 !== 0 || e.lineNumber < 1) throw new TypeError("Given line number must be a positive integer");
if ("number" != typeof e.columnNumber || e.columnNumber % 1 !== 0 || e.columnNumber < 0) throw new TypeError("Given column number must be a non-negative integer");
return !0;
}
function u(e) {
var n = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/.exec(e);
if (n && n[1]) return n[1];
throw new Error("sourceMappingURL not found");
}
function c(r, t, o, i, a) {
var s = new e.SourceMapConsumer(r), u = s.originalPositionFor({
line: o,
column: i
}), c = s.sourceContentFor(u.source);
return c && (a[u.source] = c), new n(u.name, t, u.source, u.line, u.column);
}
return function l(e) {
return this instanceof l ? (e = e || {}, this.sourceCache = e.sourceCache || {}, 
this.ajax = e.ajax || r, this._atob = e.atob || t, this._get = function(n) {
return new Promise(function(r, t) {
var o = "data:" === n.substr(0, 5);
if (this.sourceCache[n]) r(this.sourceCache[n]); else if (e.offline && !o) t(new Error("Cannot make network requests in offline mode")); else if (o) {
var i = /^data:application\/json;([\w=:"-]+;)*base64,/, a = n.match(i);
if (a) {
var s = a[0].length, u = n.substr(s), c = this._atob(u);
this.sourceCache[n] = c, r(c);
} else t(new Error("The encoding of the inline sourcemap is not supported"));
} else {
var l = this.ajax(n, {
method: "get"
});
this.sourceCache[n] = l, l.then(r, t);
}
}.bind(this));
}, this.pinpoint = function(e) {
return new Promise(function(n, r) {
this.getMappedLocation(e).then(function(e) {
function r() {
n(e);
}
this.findFunctionName(e).then(n, r)["catch"](r);
}.bind(this), r);
}.bind(this));
}, this.findFunctionName = function(e) {
return new Promise(function(r, t) {
s(e), this._get(e.fileName).then(function(t) {
var o = i(t, e.lineNumber, e.columnNumber);
r(new n(o, e.args, e.fileName, e.lineNumber, e.columnNumber));
}, t)["catch"](t);
}.bind(this));
}, void (this.getMappedLocation = function(e) {
return new Promise(function(n, r) {
a(), s(e);
var t = this.sourceCache, i = e.fileName;
this._get(i).then(function(a) {
var s = u(a), l = "data:" === s.substr(0, 5), f = i.substring(0, i.lastIndexOf("/") + 1);
"/" === s[0] || l || /^https?:\/\/|^\/\//i.test(s) || (s = f + s), this._get(s).then(function(r) {
var i = e.lineNumber, a = e.columnNumber;
"string" == typeof r && (r = o(r.replace(/^\)\]\}'/, ""))), "undefined" == typeof r.sourceRoot && (r.sourceRoot = f), 
n(c(r, e.args, i, a, t));
}, r)["catch"](r);
}.bind(this), r)["catch"](r);
}.bind(this));
})) : new l(e);
};
}), function(e, n) {
"use strict";
"function" == typeof define && define.amd ? define("stack-generator", [ "stackframe" ], n) : "object" == typeof exports ? module.exports = n(require("stackframe")) : e.StackGenerator = n(e.StackFrame);
}(this, function(e) {
return {
backtrace: function(n) {
var r = [], t = 10;
"object" == typeof n && "number" == typeof n.maxStackSize && (t = n.maxStackSize);
for (var o = arguments.callee; o && r.length < t; ) {
for (var i = new Array(o.arguments.length), a = 0; a < i.length; ++a) i[a] = o.arguments[a];
/function(?:\s+([\w$]+))+\s*\(/.test(o.toString()) ? r.push(new e(RegExp.$1 || void 0, i)) : r.push(new e(void 0, i));
try {
o = o.caller;
} catch (s) {
break;
}
}
return r;
}
};
}), function(e, n) {
"use strict";
"function" == typeof define && define.amd ? define("error-stack-parser", [ "stackframe" ], n) : "object" == typeof exports ? module.exports = n(require("stackframe")) : e.ErrorStackParser = n(e.StackFrame);
}(this, function(e) {
"use strict";
function n(e, n, r) {
if ("function" == typeof Array.prototype.map) return e.map(n, r);
for (var t = new Array(e.length), o = 0; o < e.length; o++) t[o] = n.call(r, e[o]);
return t;
}
function r(e, n, r) {
if ("function" == typeof Array.prototype.filter) return e.filter(n, r);
for (var t = [], o = 0; o < e.length; o++) n.call(r, e[o]) && t.push(e[o]);
return t;
}
function t(e, n) {
if ("function" == typeof Array.prototype.indexOf) return e.indexOf(n);
for (var r = 0; r < e.length; r++) if (e[r] === n) return r;
return -1;
}
var o = /(^|@)\S+\:\d+/, i = /^\s*at .*(\S+\:\d+|\(native\))/m, a = /^(eval@)?(\[native code\])?$/;
return {
parse: function(e) {
if ("undefined" != typeof e.stacktrace || "undefined" != typeof e["opera#sourceloc"]) return this.parseOpera(e);
if (e.stack && e.stack.match(i)) return this.parseV8OrIE(e);
if (e.stack) return this.parseFFOrSafari(e);
throw new Error("Cannot parse given Error object");
},
extractLocation: function(e) {
if (-1 === e.indexOf(":")) return [ e ];
var n = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/, r = n.exec(e.replace(/[\(\)]/g, ""));
return [ r[1], r[2] || void 0, r[3] || void 0 ];
},
parseV8OrIE: function(o) {
var a = r(o.stack.split("\n"), function(e) {
return !!e.match(i);
}, this);
return n(a, function(n) {
n.indexOf("(eval ") > -1 && (n = n.replace(/eval code/g, "eval").replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, ""));
var r = n.replace(/^\s+/, "").replace(/\(eval code/g, "(").split(/\s+/).slice(1), o = this.extractLocation(r.pop()), i = r.join(" ") || void 0, a = t([ "eval", "<anonymous>" ], o[0]) > -1 ? void 0 : o[0];
return new e(i, void 0, a, o[1], o[2], n);
}, this);
},
parseFFOrSafari: function(t) {
var o = r(t.stack.split("\n"), function(e) {
return !e.match(a);
}, this);
return n(o, function(n) {
if (n.indexOf(" > eval") > -1 && (n = n.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ":$1")), 
-1 === n.indexOf("@") && -1 === n.indexOf(":")) return new e(n);
var r = n.split("@"), t = this.extractLocation(r.pop()), o = r.join("@") || void 0;
return new e(o, void 0, t[0], t[1], t[2], n);
}, this);
},
parseOpera: function(e) {
return !e.stacktrace || e.message.indexOf("\n") > -1 && e.message.split("\n").length > e.stacktrace.split("\n").length ? this.parseOpera9(e) : e.stack ? this.parseOpera11(e) : this.parseOpera10(e);
},
parseOpera9: function(n) {
for (var r = /Line (\d+).*script (?:in )?(\S+)/i, t = n.message.split("\n"), o = [], i = 2, a = t.length; a > i; i += 2) {
var s = r.exec(t[i]);
s && o.push(new e(void 0, void 0, s[2], s[1], void 0, t[i]));
}
return o;
},
parseOpera10: function(n) {
for (var r = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i, t = n.stacktrace.split("\n"), o = [], i = 0, a = t.length; a > i; i += 2) {
var s = r.exec(t[i]);
s && o.push(new e(s[3] || void 0, void 0, s[2], s[1], void 0, t[i]));
}
return o;
},
parseOpera11: function(t) {
var i = r(t.stack.split("\n"), function(e) {
return !!e.match(o) && !e.match(/^Error created at/);
}, this);
return n(i, function(n) {
var r, t = n.split("@"), o = this.extractLocation(t.pop()), i = t.shift() || "", a = i.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^\)]*\)/g, "") || void 0;
i.match(/\(([^\)]*)\)/) && (r = i.replace(/^[^\(]+\(([^\)]*)\)$/, "$1"));
var s = void 0 === r || "[arguments not available]" === r ? void 0 : r.split(",");
return new e(a, s, o[0], o[1], o[2], n);
}, this);
}
};
}), function(e, n) {
"use strict";
"function" == typeof define && define.amd ? define("stacktrace", [ "error-stack-parser", "stack-generator", "stacktrace-gps" ], n) : "object" == typeof exports ? module.exports = n(require("error-stack-parser"), require("stack-generator"), require("stacktrace-gps")) : e.StackTrace = n(e.ErrorStackParser, e.StackGenerator, e.StackTraceGPS);
}(this, function(e, n, r) {
function t(e, n) {
var r = {};
return [ e, n ].forEach(function(e) {
for (var n in e) e.hasOwnProperty(n) && (r[n] = e[n]);
return r;
}), r;
}
function o(e) {
return e.stack || e["opera#sourceloc"];
}
function i(e, n) {
return "function" == typeof n ? e.filter(n) : e;
}
var a = {
filter: function(e) {
return -1 === (e.functionName || "").indexOf("StackTrace$$") && -1 === (e.functionName || "").indexOf("ErrorStackParser$$") && -1 === (e.functionName || "").indexOf("StackTraceGPS$$") && -1 === (e.functionName || "").indexOf("StackGenerator$$");
},
sourceCache: {}
}, s = function() {
try {
throw new Error();
} catch (e) {
return e;
}
};
return {
get: function(e) {
var n = s();
return o(n) ? this.fromError(n, e) : this.generateArtificially(e);
},
getSync: function(r) {
r = t(a, r);
var u = s(), c = o(u) ? e.parse(u) : n.backtrace(r);
return i(c, r.filter);
},
fromError: function(n, o) {
o = t(a, o);
var s = new r(o);
return new Promise(function(r) {
var t = i(e.parse(n), o.filter);
r(Promise.all(t.map(function(e) {
return new Promise(function(n) {
function r() {
n(e);
}
s.pinpoint(e).then(n, r)["catch"](r);
});
})));
}.bind(this));
},
generateArtificially: function(e) {
e = t(a, e);
var r = n.backtrace(e);
return "function" == typeof e.filter && (r = r.filter(e.filter)), Promise.resolve(r);
},
instrument: function(e, n, r, t) {
if ("function" != typeof e) throw new Error("Cannot instrument non-function object");
if ("function" == typeof e.__stacktraceOriginalFn) return e;
var i = function() {
try {
return this.get().then(n, r)["catch"](r), e.apply(t || this, arguments);
} catch (i) {
throw o(i) && this.fromError(i).then(n, r)["catch"](r), i;
}
}.bind(this);
return i.__stacktraceOriginalFn = e, i;
},
deinstrument: function(e) {
if ("function" != typeof e) throw new Error("Cannot de-instrument non-function object");
return "function" == typeof e.__stacktraceOriginalFn ? e.__stacktraceOriginalFn : e;
},
report: function(e, n, r) {
return new Promise(function(t, o) {
var i = new XMLHttpRequest();
i.onerror = o, i.onreadystatechange = function() {
4 === i.readyState && (i.status >= 200 && i.status < 400 ? t(i.responseText) : o(new Error("POST to " + n + " failed with status: " + i.status)));
}, i.open("post", n), i.setRequestHeader("Content-Type", "application/json");
var a = {
stack: e
};
void 0 !== r && (a.message = r), i.send(JSON.stringify(a));
});
}
};
});

var LoggerModule;

(function(LoggerModule) {
var Logger = function() {
function Logger() {}
Logger.logErrorMessage = function(errorMessage) {
try {
throw new Error(errorMessage);
} catch (exception) {
Logger.logException(exception);
}
};
Logger.logException = function(exception) {
var exceptionMessage = exception instanceof LogExtendedError ? exception.messageForLogs : exception.message;
if (window.console && console.error) {
console.error(exceptionMessage);
}
Logger.logJavaScriptError(new JavaScriptErrorEntry(exceptionMessage), exception);
};
Logger.consoleLog = function(message) {
if (window.console) {
console.log(message);
}
};
Logger.consoleLogWithTrace = function(message) {
Logger.consoleLog(message);
if (window.console && console.trace) {
console.trace(message);
}
};
Logger.consoleLogJqueryElement = function(message, $element) {
if ($element.length !== 1) {
Logger.consoleLog("jQuery element collection with length: " + $element.length);
} else {
message += " jQuery element";
if ($element.prop("class")) {
message += " class: " + $element.prop("class");
}
if ($element.prop("id")) {
message += " id: " + $element.prop("id");
}
var outerHtml = $element.prop("outerHTML");
if (outerHtml) {
message += " " + $element.prop("outerHTML").substring(0, 500);
}
Logger.consoleLogWithTrace(message);
}
};
Logger.consoleLogEvent = function(message, event) {
message += " Event";
if (event.which) {
message += " which: " + event.which;
}
if (event.isDefaultPrevented()) {
message += " default prevented";
}
if (event.isPropagationStopped()) {
message += " propagation stopped";
}
if (event.isImmediatePropagationStopped()) {
message += " propagation stopped";
}
Logger.consoleLogWithTrace(message);
};
Logger.attachWindowOnErrorAndAjaxComplete = function() {
window.onerror = Logger.onError;
$(document).ajaxComplete(function(event, jqXHR, ajaxOptions) {
Logger.notifyAjaxComplete(new AjaxRequestLogEntry(jqXHR, ajaxOptions));
});
};
Logger.onError = function(errorMessage, scriptUrl, errorLine, columnOrUndefined, errorOrUndefined) {
if ((jQuery("body").data("disableErrorLogging") || null) !== null) {
return;
}
var javaScriptErrorEntry = new JavaScriptErrorEntry(errorMessage || "Unknown JavaScript Error");
javaScriptErrorEntry.javaScriptFileUrl = scriptUrl;
javaScriptErrorEntry.javaScriptErrorLine = errorLine;
javaScriptErrorEntry.javaScriptErrorColumn = columnOrUndefined || null;
Logger.logJavaScriptError(javaScriptErrorEntry, errorOrUndefined);
return false;
};
Logger.logJavaScriptError = function(javaScriptErrorEntry, errorOrUndefined) {
if (Logger.messagesSentToServerCount < Logger.MAXIMUM_MESSAGES_TO_SEND_FROM_SINGLE_PAGE) {
Logger.messagesSentToServerCount++;
if ((errorOrUndefined || null) !== null && errorOrUndefined.stack) {
javaScriptErrorEntry.javaScriptStackTrace = errorOrUndefined.stack;
if (typeof StackTrace != "undefined") {
StackTrace.fromError(errorOrUndefined).then(function(stackframes) {
javaScriptErrorEntry.javaScriptStackTrace = stackframes.map(function(sf) {
return sf.toString();
}).join("\n");
Logger.postToServerAndPrintStackTrace(javaScriptErrorEntry);
}).catch(function(err) {
Logger.postToServerAndPrintStackTrace(javaScriptErrorEntry);
});
} else {
Logger.postToServerAndPrintStackTrace(javaScriptErrorEntry);
}
} else {
Logger.postToServerAndPrintStackTrace(javaScriptErrorEntry);
}
}
};
Logger.notifyAjaxComplete = function(ajaxRequestLogEntry) {
Logger.addPageActivityEntry(new PageActivityEntry(ajaxRequestLogEntry));
};
Logger.addPageActivityEntry = function(pageActivityEntry) {
Logger.pageActivityEntries.push(pageActivityEntry);
if (Logger.pageActivityEntries.length > Logger.MAXIMUM_PAGE_ACTIVITY_ENTRIES) {
Logger.pageActivityEntries = Logger.pageActivityEntries.slice(Logger.pageActivityEntries.length - Logger.MAXIMUM_PAGE_ACTIVITY_ENTRIES);
}
};
Logger.postToServerAndPrintStackTrace = function(javaScriptErrorEntry) {
try {
if (window.console && console.error && javaScriptErrorEntry.javaScriptStackTrace) {
console.error("Stack trace:\n" + javaScriptErrorEntry.javaScriptStackTrace);
}
jQuery.post("/api/error-reporting/logJavaScriptError", javaScriptErrorEntry);
} catch (e) {
if (window.console && console.error) {
console.error("Error occured trying to log JavaScript error: " + e.message);
}
}
};
Logger.MAXIMUM_MESSAGES_TO_SEND_FROM_SINGLE_PAGE = 10;
Logger.MAXIMUM_PAGE_ACTIVITY_ENTRIES = 5;
Logger.messagesSentToServerCount = 0;
Logger.pageActivityEntries = [];
return Logger;
}();
LoggerModule.Logger = Logger;
var JavaScriptErrorEntry = function() {
function JavaScriptErrorEntry(javaScriptErrorMessage) {
this.javaScriptFileUrl = null;
this.javaScriptErrorLine = null;
this.javaScriptErrorColumn = null;
this.javaScriptStackTrace = null;
this.javaScriptErrorMessage = javaScriptErrorMessage;
this.javaScriptPageUrl = window.location.href;
this.userActivityLogJson = JSON.stringify(Logger.pageActivityEntries);
}
return JavaScriptErrorEntry;
}();
var PageActivityEntry = function() {
function PageActivityEntry(activityObject) {
this.activityDate = new Date();
this.activityObject = activityObject;
}
return PageActivityEntry;
}();
var AjaxRequestLogEntry = function() {
function AjaxRequestLogEntry(jqXHR, ajaxOptions) {
this.url = ajaxOptions.url || null;
this.httpMethod = ajaxOptions.type || null;
this.requestContentType = ajaxOptions.contentType || null;
this.httpStatus = jqXHR.status || null;
this.responseText = jqXHR.responseText || null;
}
return AjaxRequestLogEntry;
}();
})(LoggerModule || (LoggerModule = {}));

var Logger = LoggerModule.Logger;

Logger.attachWindowOnErrorAndAjaxComplete();

$(window).on("load", function() {
WindowEventLoad.windowLoadAlreadyTriggered = true;
});

var WindowEventLoad = function() {
function WindowEventLoad() {}
WindowEventLoad.onPageFullyLoaded = function(onPageFullyLoadedCallback) {
if (WindowEventLoad.windowLoadAlreadyTriggered) {
onPageFullyLoadedCallback();
} else {
$(window).on("load", onPageFullyLoadedCallback);
}
};
WindowEventLoad.windowLoadAlreadyTriggered = false;
return WindowEventLoad;
}();

$(function() {
if (/iP/i.test(navigator.userAgent)) {
$("*").css("cursor", "pointer");
}
});

$(function() {
if (BrowserUtils.isMobilePhoneTabletOrOtherDeviceWithTouchInterface()) {
$("*").addClass("noHover");
}
});

$(function() {
if (BrowserUtils.isMobilePhoneTabletOrOtherDeviceWithTouchInterface()) {
$(document).on("focus", "input, textarea", function() {
$(this).attr("autocorrect", "off").attr("autocapitalize", "off").attr("spellcheck", "false");
});
}
});

$(function() {
var windowWidth = $(window).width();
var windowHeight = $(window).height();
var triggerResizedEventDebounced = _.debounce(function() {
windowWidth = $(window).width();
windowHeight = $(window).height();
$(window).trigger("resized");
}, 100);
$(window).resize(function() {
if (windowWidth && $(window).width() !== windowWidth || windowHeight && $(window).height() !== windowHeight) {
triggerResizedEventDebounced();
}
});
});

WindowEventLoad.onPageFullyLoaded(function() {
$("img").not(".doNotScaleImage").each(function() {
var $img = $(this);
if ($img.attr("width")) {
$img.css("max-width", parseInt($img.attr("width")));
$img.attr("width", null);
$img.css("width", "100%");
}
if ($img.attr("height")) {
$img.css("max-height", parseInt($img.attr("height")));
$img.attr("height", null);
$img.css("height", "auto");
}
});
});

var Arrays = function() {
function Arrays() {}
Arrays.contains = function(array, searchElement) {
return $.inArray(searchElement, array) >= 0;
};
Arrays.parse = function(complexElement) {
return complexElement.toArray().map(function(element) {
return $(element);
});
};
return Arrays;
}();

var Char = function() {
function Char() {}
Char.isUmlaut = function(subject) {
if (!subject) {
return false;
}
var char = subject;
if (subject === parseInt(subject)) {
char = String.fromCharCode(subject);
}
return Char.UMLAUT.indexOf(char) >= 0;
};
Char.isDigit = function(subject) {
if (!subject) {
return false;
}
var char = subject;
if (subject === parseInt(subject)) {
char = String.fromCharCode(subject);
}
return Char.DIGITS.indexOf(char) >= 0;
};
Char.isSpecialChar = function(subject) {
if (!subject) {
return false;
}
var char = subject;
if (subject === parseInt(subject)) {
char = String.fromCharCode(subject);
}
return Char.SPECIAL_CHARS.indexOf(char) >= 0;
};
Char.isLetter = function(subject) {
if (!subject) {
return false;
}
var char = subject;
if (subject === parseInt(subject)) {
char = String.fromCharCode(subject);
}
return Char.LETTERS.indexOf(char) !== -1;
};
Char.isUppercase = function(subject) {
var char = subject;
if (subject === parseInt(subject)) {
char = String.fromCharCode(subject);
}
if (char === "ß") {
return true;
}
return char === char.toUpperCase();
};
Char.isLowercase = function(subject) {
var char = subject;
if (subject === parseInt(subject)) {
char = String.fromCharCode(subject);
}
return char === char.toLowerCase();
};
Char.toLowercase = function(subject) {
var char = subject;
if (subject === parseInt(subject)) {
char = String.fromCharCode(subject);
return char.toLowerCase().charCodeAt(0);
}
return char.toLowerCase().charAt(0);
};
Char.toUppercase = function(subject) {
var char = subject;
if (subject === parseInt(subject)) {
char = String.fromCharCode(subject);
return char.toUpperCase().charCodeAt(0);
}
return char.toUpperCase().charAt(0);
};
Char.CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜßäöüabcdefghijklmnopqrstuvwxyz1234567890ÁÉáé";
Char.SPECIAL_CHARS = "- ,.;:'\"";
Char.LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜßäöüabcdefghijklmnopqrstuvwxyzÁÉáé";
Char.DIGITS = "123456790";
Char.UMLAUT = "ÄÖÜßäöü";
Char.isCorrectChar = function(typedChar, correctChar, caseSensitive) {
var _a;
if (typedChar === parseInt(typedChar)) {
typedChar = String.fromCharCode(typedChar);
}
if (correctChar === parseInt(correctChar)) {
correctChar = String.fromCharCode(correctChar);
}
if (!caseSensitive) {
typedChar = typedChar.toLowerCase();
correctChar = correctChar.toLowerCase();
}
if (typedChar === correctChar) {
return true;
}
var map = (_a = {}, _a["a"] = [ "ä", "à", "â" ], _a["A"] = [ "Ä" ], _a["o"] = [ "ö", "ô", "ô", "œ" ], 
_a["u"] = [ "ü", "ù", "û", "ü" ], _a["c"] = [ "ç" ], _a["e"] = [ "é", "è", "ê", "ë" ], 
_a["i"] = [ "î", "ï" ], _a["y"] = [ "ÿ" ], _a["O"] = [ "Ö" ], _a["s"] = [ "ß" ], 
_a["S"] = [ "ß" ], _a["ss"] = [ "ß" ], _a["SS"] = [ "ß" ], _a["u"] = [ "ü" ], _a["U"] = [ "Ü" ], 
_a);
return typedChar in map && map[typedChar].indexOf(correctChar) !== -1;
};
return Char;
}();

var Strings = function() {
function Strings() {}
Strings.contains = function(text, searchStr) {
return text.indexOf(searchStr) !== -1;
};
Strings.containsAny = function(text, searchStrings) {
return _.find(searchStrings, function(searchString) {
return Strings.contains(text, searchString);
}) !== undefined;
};
Strings.startsWith = function(text, prefix) {
return text.substr(0, prefix.length) === prefix;
};
Strings.startsWithAny = function(text, prefixes) {
return _.find(prefixes, function(prefix) {
return Strings.startsWith(text, prefix);
}) !== undefined;
};
Strings.insertAt = function(text, position, stringToInsert) {
return text.substr(0, position) + stringToInsert + text.substr(position);
};
Strings.removeString = function(text, positionStart, positionEnd) {
return text.substr(0, positionStart) + text.substr(positionEnd);
};
Strings.removePrefix = function(text, prefix) {
if (!Strings.startsWith(text, prefix)) {
return text;
}
return text.substr(prefix.length);
};
Strings.replaceAll = function(text, searchStr, replaceStr) {
return text.split(searchStr).join(replaceStr);
};
Strings.replaceEach = function(text, searchReplaceMappings) {
for (var i = 0, len = searchReplaceMappings.length; i < len; i++) {
var searchReplaceMapping = searchReplaceMappings[i];
var searchValue = searchReplaceMapping[0];
var replaceValue = searchReplaceMapping[1];
text = searchValue instanceof RegExp ? text.replace(searchValue, replaceValue) : Strings.replaceAll(text, searchValue, replaceValue);
}
return text;
};
Strings.commonPrefix = function(strA, strB, loose) {
var output = "";
for (var i = 0; i < strA.length; i++) {
if (!loose) {
if (strA.charAt(i) === strB.charAt(i)) {
output += strA.charAt(i);
} else {
return output;
}
} else {
if (Char.isCorrectChar(strA.charAt(i), strB.charAt(i), false) || strA.charAt(i) === " " && strB.charAt(i) === " ") {
output += strB.charAt(i);
} else {
return output;
}
}
}
return output;
};
Strings.commonPrefixBestMatch = function(needle, haystack, loose) {
var bestMatchWord = "";
var bestMatchCommonPrefix = "";
for (var i = 0; i < haystack.length; i++) {
var word = haystack[i];
var commonPrefix = Strings.commonPrefix(needle, word, loose);
if (commonPrefix.length > bestMatchCommonPrefix.length) {
bestMatchCommonPrefix = commonPrefix;
bestMatchWord = word;
} else if (commonPrefix.length === bestMatchCommonPrefix.length) {
if (word.length < bestMatchWord.length) {
bestMatchWord = word;
}
}
}
return bestMatchWord;
};
Strings.singleSpaces = function(str) {
return Strings.isBlank(str) ? "" : str.trim().replace(/\s+/g, " ");
};
Strings.isBlank = function(str) {
return _.isString(str) && str.trim() === "";
};
Strings.splitIntoLines = function(str) {
if (Strings.isBlank(str)) {
return [];
}
return str.trim().replace(/\r\n/g, "\n").split("\n");
};
Strings.splitIntoWords = function(str) {
if (Strings.isBlank(str)) {
return [];
}
return str.trim().replace(/\s+/g, " ").split(" ");
};
Strings.displayWidth = function(string, $containerInWhichWeCalculateSize) {
var $box = $("<div>").css({
position: "fixed",
bottom: "0",
left: "0",
fontSize: $containerInWhichWeCalculateSize.css("font-size"),
letterSpacing: $containerInWhichWeCalculateSize.css("letter-spacing"),
wordSpacing: $containerInWhichWeCalculateSize.css("word-spacing")
});
var $span = $("<span>").text(string);
$box.append($span);
$("body").append($box);
var width = $span.innerWidth();
$box.remove();
return width;
};
Strings.getLongest = function(stringArray) {
return _.max(stringArray, function(string) {
return string.length;
});
};
Strings.sanitizeForIOS = function($string) {
return $string.replace("’", "'").replace("′", "'").replace("‘", "'").replace("‛", "'").replace("”", '"').replace("“", '"').replace("‟", '"');
};
Strings.sanitizeHtmlWithWhiteList = function(html, whiteList) {
if (whiteList === void 0) {
whiteList = [];
}
var whiteListStringRegex = "";
for (var i = 0; i < whiteList.length; i++) {
if (i > 0) {
whiteListStringRegex += "|";
}
whiteListStringRegex += whiteList[i] + "|/" + whiteList[i];
}
if (whiteList.length == 0) {
return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
} else {
var regex1 = new RegExp("<((?!" + whiteListStringRegex + ")[^><]*)(>?)", "gmi");
return html.replace(regex1, function(match, p1, p2) {
return "&lt;" + p1 + (p2 ? "&gt;" : "");
}).replace(/("|'|&(?!lt;|gt;))(?![^<]*>)/gim, function(match, p3) {
switch (p3) {
case "&":
return "&amp;";

case "'":
return "&apos;";

case '"':
return "&quot;";
}
});
}
};
return Strings;
}();

String.prototype.includes = function(searchStr) {
return this.indexOf(searchStr) !== -1;
};

String.prototype.startsWith = function(prefix) {
return this.substr(0, prefix.length) === prefix;
};

String.prototype.endsWith = function(suffix) {
return this.substr(this.length - suffix.length) === suffix;
};

var Events = function() {
function Events() {}
Events.stopPropagationAndPreventDefault = function(event) {
event.stopPropagation();
event.preventDefault();
};
return Events;
}();

function _t(text, optional) {
return text;
}

function _tparam(translatedText, replacementsArray) {
_.each(replacementsArray, function(replacement, key) {
translatedText = translatedText.replace("{" + key + "}", replacement);
});
return translatedText;
}

function getAnimationDuration() {
return 300;
}

var ERROR_GETTING_DATA = '<div class="msgboxdiv messageTypeError">' + 'Wystąpił błąd przy pobieraniu danych z serwera. Naciśnij CTRL+F5, aby odświeżyć stronę.' + "</div>";

var AJAX_LOADER_IMG = '<img src="/images/ajax-loader.gif" width="16" height="16" alt="' + 'Proszę czekać...' + '" class="absmiddle">';

var LocationUtils = function() {
function LocationUtils() {}
LocationUtils.loadUrl = function(url) {
window.location.assign(url);
};
LocationUtils.loadUrlIfNotEmpty = function(url) {
if (url) {
LocationUtils.loadUrl(url);
}
};
LocationUtils.reloadPage = function() {
window.location.reload();
};
return LocationUtils;
}();

function Htmlspecialchars(str) {
if (str == null) {
return "";
}
str = "" + str;
str = str.replace(/&/g, "&amp;");
str = str.replace(/'/g, "&#039;");
str = str.replace(/"/g, "&quot;");
str = str.replace(/</g, "&lt;");
str = str.replace(/>/g, "&gt;");
str = str.replace(/\//g, "&#x2F;");
return str;
}

function Htmlspecialchars_decode(str) {
if (str == null) {
return "";
}
str = "" + str;
str = str.replace(/&#x2F;/g, "/");
str = str.replace(/&gt;/g, ">");
str = str.replace(/&lt;/g, "<");
str = str.replace(/&quot;/g, '"');
str = str.replace(/&#0*39;/g, "'");
str = str.replace(/&#x27;/g, "'");
str = str.replace(/&apos;/g, "'");
str = str.replace(/&amp;/g, "&");
return str;
}

var InputChangeMonitor = function() {
function InputChangeMonitor() {}
InputChangeMonitor.onContentsEdit = function($inputField, callback) {
if ($inputField.length < 1) {
throw new Error("Element do którego próbujemy przypiąć monitorowanie zdarzeń edycji nie istnieje jeszcze w drzewie DOM. " + "Obsługa zdarzeń przypinana jest bezpośrednio do docelowego elementu, dlatego musi on istnieć. " + "Wywołanie tej metody powinno być zwykle opakowane w $().");
}
$inputField.on("change input keyup", InputChangeMonitor.debounceCallback(callback));
};
InputChangeMonitor.onContentsEditWithImmediateCallbackCall = function($inputField, callback) {
InputChangeMonitor.onContentsEdit($inputField, callback);
callback();
};
InputChangeMonitor.onContentsEditBindingToDynamicallyAddedElements = function(inputFieldSelector, callback) {
var eventsNames = "change input keyup";
if ($(inputFieldSelector).is('input[type="text"]') || $(inputFieldSelector).is("textarea")) {
eventsNames = "keyup input";
}
$(document).on(eventsNames, inputFieldSelector, InputChangeMonitor.debounceCallback(callback));
};
InputChangeMonitor.debounceCallback = function(callback) {
return _.debounce(callback, InputChangeMonitor.INTERVAL_BETWEEN_HANDLER_CALLS_MS);
};
InputChangeMonitor.INTERVAL_BETWEEN_HANDLER_CALLS_MS = 1e3;
return InputChangeMonitor;
}();

var Keys;

(function(Keys) {
Keys[Keys["BACKSPACE"] = 8] = "BACKSPACE";
Keys[Keys["TAB"] = 9] = "TAB";
Keys[Keys["ENTER"] = 13] = "ENTER";
Keys[Keys["SHIFT"] = 16] = "SHIFT";
Keys[Keys["CTRL"] = 17] = "CTRL";
Keys[Keys["ALT_LEFT"] = 18] = "ALT_LEFT";
Keys[Keys["ESC"] = 27] = "ESC";
Keys[Keys["SPACE"] = 32] = "SPACE";
Keys[Keys["LEFT"] = 37] = "LEFT";
Keys[Keys["UP"] = 38] = "UP";
Keys[Keys["RIGHT"] = 39] = "RIGHT";
Keys[Keys["DOWN"] = 40] = "DOWN";
Keys[Keys["INSERT"] = 45] = "INSERT";
Keys[Keys["DELETE"] = 46] = "DELETE";
Keys[Keys["HOME"] = 36] = "HOME";
Keys[Keys["END"] = 35] = "END";
Keys[Keys["PAGE_UP"] = 33] = "PAGE_UP";
Keys[Keys["PAGE_DOWN"] = 34] = "PAGE_DOWN";
Keys[Keys["EQUAL_SIGN"] = 61] = "EQUAL_SIGN";
Keys[Keys["A"] = 65] = "A";
Keys[Keys["B"] = 66] = "B";
Keys[Keys["C"] = 67] = "C";
Keys[Keys["D"] = 68] = "D";
Keys[Keys["E"] = 69] = "E";
Keys[Keys["F"] = 70] = "F";
Keys[Keys["G"] = 71] = "G";
Keys[Keys["H"] = 72] = "H";
Keys[Keys["I"] = 73] = "I";
Keys[Keys["J"] = 74] = "J";
Keys[Keys["K"] = 75] = "K";
Keys[Keys["L"] = 76] = "L";
Keys[Keys["M"] = 77] = "M";
Keys[Keys["N"] = 78] = "N";
Keys[Keys["O"] = 79] = "O";
Keys[Keys["P"] = 80] = "P";
Keys[Keys["Q"] = 81] = "Q";
Keys[Keys["R"] = 82] = "R";
Keys[Keys["S"] = 83] = "S";
Keys[Keys["T"] = 84] = "T";
Keys[Keys["U"] = 85] = "U";
Keys[Keys["V"] = 86] = "V";
Keys[Keys["W"] = 87] = "W";
Keys[Keys["X"] = 88] = "X";
Keys[Keys["Y"] = 89] = "Y";
Keys[Keys["Z"] = 90] = "Z";
Keys[Keys["N0"] = 48] = "N0";
Keys[Keys["N1"] = 49] = "N1";
Keys[Keys["N2"] = 50] = "N2";
Keys[Keys["N3"] = 51] = "N3";
Keys[Keys["N4"] = 52] = "N4";
Keys[Keys["N5"] = 53] = "N5";
Keys[Keys["N6"] = 54] = "N6";
Keys[Keys["N7"] = 55] = "N7";
Keys[Keys["N8"] = 56] = "N8";
Keys[Keys["N9"] = 57] = "N9";
Keys[Keys["NUMPAD0"] = 96] = "NUMPAD0";
Keys[Keys["NUMPAD1"] = 97] = "NUMPAD1";
Keys[Keys["NUMPAD2"] = 98] = "NUMPAD2";
Keys[Keys["NUMPAD3"] = 99] = "NUMPAD3";
Keys[Keys["NUMPAD4"] = 100] = "NUMPAD4";
Keys[Keys["NUMPAD5"] = 101] = "NUMPAD5";
Keys[Keys["NUMPAD6"] = 102] = "NUMPAD6";
Keys[Keys["NUMPAD7"] = 103] = "NUMPAD7";
Keys[Keys["NUMPAD8"] = 104] = "NUMPAD8";
Keys[Keys["NUMPAD9"] = 105] = "NUMPAD9";
Keys[Keys["DASH"] = 109] = "DASH";
Keys[Keys["F1"] = 112] = "F1";
Keys[Keys["F2"] = 113] = "F2";
Keys[Keys["F3"] = 114] = "F3";
Keys[Keys["F4"] = 115] = "F4";
Keys[Keys["F5"] = 116] = "F5";
Keys[Keys["F6"] = 117] = "F6";
Keys[Keys["F7"] = 118] = "F7";
Keys[Keys["F8"] = 119] = "F8";
Keys[Keys["F9"] = 120] = "F9";
Keys[Keys["F10"] = 121] = "F10";
Keys[Keys["F11"] = 122] = "F11";
Keys[Keys["F12"] = 123] = "F12";
Keys[Keys["SEMICOLON"] = 186] = "SEMICOLON";
Keys[Keys["PLUS_SIGN"] = 187] = "PLUS_SIGN";
Keys[Keys["COMMA"] = 188] = "COMMA";
Keys[Keys["SUBSTRACT"] = 189] = "SUBSTRACT";
Keys[Keys["FULLSTOP"] = 190] = "FULLSTOP";
Keys[Keys["FORWARD_SLASH"] = 191] = "FORWARD_SLASH";
Keys[Keys["GRAVE_ACCENT"] = 192] = "GRAVE_ACCENT";
Keys[Keys["OPEN_BRACKET"] = 219] = "OPEN_BRACKET";
Keys[Keys["BACK_SLASH"] = 220] = "BACK_SLASH";
Keys[Keys["CLOSE_BRACKET"] = 221] = "CLOSE_BRACKET";
Keys[Keys["APOSTROPHE"] = 222] = "APOSTROPHE";
Keys[Keys["UNSPECIFIED_KEY_ANDROID"] = 229] = "UNSPECIFIED_KEY_ANDROID";
Keys[Keys["UNSPECIFIED_KEY_ZERO"] = 0] = "UNSPECIFIED_KEY_ZERO";
})(Keys || (Keys = {}));

var KeyboardApi = function() {
function KeyboardApi() {}
KeyboardApi.isKeyWithoutModifiers = function(event, keyCode) {
return event.which == keyCode && !KeyboardApi.hasAnyModifiers(event);
};
KeyboardApi.isKeyWithCtrl = function(event, keyCode) {
return event.which == keyCode && event.ctrlKey && !event.altKey && !event.shiftKey;
};
KeyboardApi.hasAnyModifiers = function(event) {
return event.ctrlKey || event.altKey || event.shiftKey;
};
KeyboardApi.isLetterKeyOrUnknownCodeOnAndroid = function(event) {
return event.which >= Keys.A && event.which <= Keys.Z || event.which == Keys.UNSPECIFIED_KEY_ANDROID || event.which == Keys.UNSPECIFIED_KEY_ZERO;
};
KeyboardApi.isNumberKey = function(event) {
return event.which >= Keys.N0 && event.which <= Keys.N9 || event.which >= Keys.NUMPAD0 && event.which <= Keys.NUMPAD9;
};
KeyboardApi.isSpecialCharacterKey = function(event) {
return event.which >= Keys.SEMICOLON && event.which <= Keys.GRAVE_ACCENT || event.which >= Keys.OPEN_BRACKET && event.which <= Keys.APOSTROPHE || event.which == Keys.DASH || event.which == Keys.EQUAL_SIGN;
};
KeyboardApi.isTextInputKey = function(event) {
return !event.ctrlKey && (KeyboardApi.isLetterKeyOrUnknownCodeOnAndroid(event) || KeyboardApi.isNumberKey(event) || KeyboardApi.isSpecialCharacterKey(event) || event.which === Keys.SPACE);
};
KeyboardApi.isTextInputKeyWithoutPolishChars = function(event) {
return !event.altKey && KeyboardApi.isTextInputKey(event);
};
KeyboardApi.isRemovalKey = function(event) {
return event.which == Keys.DELETE || event.which == Keys.BACKSPACE;
};
KeyboardApi.isUndoRedoKey = function(event) {
return event.which == Keys.Z && event.ctrlKey || event.which == Keys.Y && event.ctrlKey || event.which == Keys.Z && event.ctrlKey && event.shiftKey;
};
KeyboardApi.isFunctionKeyOrPotentialBrowserShortcut = function(event) {
return Arrays.contains([ Keys.ESC, Keys.PAGE_DOWN, Keys.PAGE_UP ], event.which) || event.which >= Keys.F1 && event.which <= Keys.F12 || event.ctrlKey;
};
KeyboardApi.shouldDisableCaptureForThisEvent = function(event) {
if (QtipModals.isModalPopupOpen()) {
return true;
}
if (event.which == Keys.ENTER || event.which == Keys.ESC) {
return false;
}
if (event.ctrlKey || event.altKey) {
return false;
}
if (event.which == Keys.SPACE && $(".doNotBlockPlayRecordingAgainKeyForThisInput:focus").length > 0) {
return false;
}
if (event.which == Keys.OPEN_BRACKET && $(".doNotBlockShowTranslationKeyForThisInput:focus").length > 0) {
return false;
}
if (event.which == Keys.CLOSE_BRACKET && $(".doNotBlockHintKeyForThisInput:focus").length > 0) {
return false;
}
if ((event.which == Keys.EQUAL_SIGN || event.which == Keys.PLUS_SIGN) && $(".doNotBlockNoteKeyForThisInput:focus").length > 0) {
return false;
}
if (KeyboardApi.isNumberKey(event) && $(".doNotBlockNumberKeysForThisInputIfEmpty:focus").length > 0 && $(".doNotBlockNumberKeysForThisInputIfEmpty:focus").val() == "") {
return false;
}
return KeyboardApi.anyInputOrTextareaHasFocus();
};
KeyboardApi.anyInputOrTextareaHasFocus = function() {
return $("input:focus").add("textarea:focus").length > 0;
};
KeyboardApi.blockBackspaceOutsideFormFields = function(event) {
if (event.which == Keys.BACKSPACE && !KeyboardApi.anyInputOrTextareaHasFocus()) {
event.preventDefault();
}
};
return KeyboardApi;
}();

var Time = function() {
function Time() {}
Time.unixTimestampSeconds = function() {
return new Date().getTime() / 1e3;
};
Time.microtime = function() {
var date = new Date();
return date.getTime() + date.getMilliseconds();
};
Time.msToTime = function(s) {
function addZ(n) {
return (n < 10 ? "0" : "") + n;
}
var ms = s % 1e3;
s = (s - ms) / 1e3;
var secs = s % 60;
s = (s - secs) / 60;
var mins = s % 60;
if (!mins && !secs && ms) {
secs = 1;
}
return mins + ":" + addZ(secs);
};
Time.secondsToTime = function(s) {
return Time.msToTime(s * 1e3);
};
return Time;
}();

var Language = function() {
function Language() {}
Language.EN = "en";
Language.DE = "de";
Language.ES = "es";
Language.FR = "fr";
Language.PL = "pl";
return Language;
}();

var LanguageCharSubstitutionData = function() {
function LanguageCharSubstitutionData() {}
LanguageCharSubstitutionData.GERMAN_NORMALIZATION_MAPPINGS = [ [ "Ä", "Ae" ], [ "ä", "ae" ], [ "Ö", "Oe" ], [ "ö", "oe" ], [ "Ü", "Ue" ], [ "ü", "ue" ], [ "ß", "ss" ], [ "ẞ", "ss" ] ];
LanguageCharSubstitutionData.GERMAN_DIACRITIC_REMOVAL_MAPPINGS = [ [ "Ä", "A" ], [ "ä", "a" ], [ "Ö", "O" ], [ "ö", "o" ], [ "Ü", "U" ], [ "ü", "u" ], [ "ß", "ss" ], [ "ẞ", "ss" ] ];
LanguageCharSubstitutionData.POLISH_DIACRITIC_REMOVAL_MAPPINGS = [ [ "Ą", "A" ], [ "ą", "a" ], [ "Ć", "C" ], [ "ć", "c" ], [ "Ę", "E" ], [ "ę", "e" ], [ "Ł", "L" ], [ "ł", "l" ], [ "Ń", "N" ], [ "ń", "n" ], [ "Ó", "O" ], [ "ó", "o" ], [ "Ś", "S" ], [ "ś", "s" ], [ "Ż", "Z" ], [ "ż", "z" ], [ "Ź", "Z" ], [ "ź", "z" ] ];
LanguageCharSubstitutionData.FRENCH_DIACRITIC_REMOVAL_MAPPINGS = [ [ "À", "A" ], [ "à", "a" ], [ "Â", "A" ], [ "â", "a" ], [ "Ä", "A" ], [ "ä", "a" ], [ "È", "E" ], [ "è", "e" ], [ "É", "E" ], [ "é", "e" ], [ "Ê", "E" ], [ "ê", "e" ], [ "Ë", "E" ], [ "ë", "e" ], [ "Î", "I" ], [ "î", "i" ], [ "Ï", "I" ], [ "ï", "i" ], [ "Ô", "O" ], [ "ô", "o" ], [ "Œ", "Oe" ], [ "œ", "oe" ], [ "Ù", "U" ], [ "ù", "u" ], [ "Û", "U" ], [ "û", "u" ], [ "Ü", "U" ], [ "ü", "u" ], [ "Ÿ", "Y" ], [ "ÿ", "y" ], [ "Ç", "C" ], [ "ç", "c" ] ];
LanguageCharSubstitutionData.OTHER_DIACRITIC_REMOVAL_MAPPINGS = [ [ "Á", "A" ], [ "á", "a" ], [ "Ã", "A" ], [ "ã", "a" ], [ "Å", "A" ], [ "å", "a" ], [ "Æ", "Ae" ], [ "æ", "ae" ], [ "Ì", "I" ], [ "ì", "i" ], [ "Í", "I" ], [ "í", "i" ], [ "Ñ", "N" ], [ "ñ", "n" ], [ "Ò", "O" ], [ "ò", "o" ], [ "Õ", "O" ], [ "õ", "o" ], [ "Ø", "O" ], [ "ø", "o" ], [ "Ú", "U" ], [ "ú", "u" ], [ "Ý", "Y" ], [ "ý", "y" ], [ "Þ", "Y" ], [ "þ", "y" ] ];
return LanguageCharSubstitutionData;
}();

var PhraseNormalizationData = function() {
function PhraseNormalizationData() {}
PhraseNormalizationData.PUNCTUATION_SPACE_MAPPINGS = [ [ /^\s+/, "" ], [ /[.?!\s]+$/, "" ], [ /[,;]/g, " " ], [ /\s{2,}/g, " " ] ];
PhraseNormalizationData.ENGLISH_PRECISE_MAPPINGS = [ [ /\b(I) am\b/gi, "$1'm" ], [ /\b(you|we|they) are\b/gi, "$1're" ], [ /\b(I|you|we|they) have\b/gi, "$1've" ], [ /\b(I|you|he|she|it|we|they) will\b/gi, "$1'll" ], [ /\b(c)an ?not\b/gi, "$1an't" ], [ /\b(w)ill not\b/gi, "$1on't" ], [ /\b(s)hall not\b/gi, "$1han't" ], [ /\b(is|are|has|have|was|were|does|did|had|would|could|should|need) not\b/gi, "$1n't" ], [ / aren't\b/gi, "'re not" ], [ / haven't\b/gi, "'ve not" ], [ / won't\b/gi, "'ll not" ], [ /\b(where|when|how|here) is\b/gi, "$1's" ], [ /\b(s)omething\b/gi, "$1th" ], [ /\b(s)ome(?:body|one)\b/gi, "$1b" ], [ /\b(let) us\b/gi, "$1's" ] ];
PhraseNormalizationData.ENGLISH_IMPRECISE_MAPPINGS = [ [ /\b(he|she|it|what|who|there|that|I|you|we|they) (?:had|would)\b/gi, "$1'd" ], [ /\b(he|she|it|what|who|there|that|name) (?:has|is(?! been))\b/gi, "$1's" ], [ / (?:is|has)n't\b/gi, "'s not" ], [ / (?:had|would)n't\b/gi, "'d not" ], [ /\bI'm (?=sorry\b)/gi, "" ] ];
PhraseNormalizationData.GERMAN_PRECISE_MAPPINGS = [ [ /\b(etw)as\b/gi, "$1" ], [ /\b(j)emand\b/gi, "$1d" ], [ /\b(j)emanden\b/gi, "$1dn" ], [ /\b(j)emandem\b/gi, "$1dm" ], [ /\b(j)emandes\b/gi, "$1ds" ] ];
return PhraseNormalizationData;
}();

var PhraseNormalization = function() {
function PhraseNormalization() {}
PhraseNormalization.normalizePhrasePrecisely = function(phrase, languageCode) {
switch (languageCode) {
case Language.EN:
return Strings.replaceEach(phrase, PhraseNormalizationData.ENGLISH_PRECISE_MAPPINGS);

case Language.DE:
return Strings.replaceEach(phrase, PhraseNormalizationData.GERMAN_PRECISE_MAPPINGS);

default:
return phrase;
}
};
PhraseNormalization.normalizePhraseImprecisely = function(phrase, languageCode) {
switch (languageCode) {
case Language.EN:
return Strings.replaceEach(phrase, PhraseNormalizationData.ENGLISH_IMPRECISE_MAPPINGS);

default:
return phrase;
}
};
PhraseNormalization.normalizePunctuation = function(phrase) {
phrase = Strings.replaceEach(phrase, PhraseNormalizationData.PUNCTUATION_SPACE_MAPPINGS);
phrase = Strings.replaceAll(phrase, '"', "'");
return phrase;
};
PhraseNormalization.normalizeAllForeignChars = function(phrase) {
return Strings.replaceEach(Strings.replaceEach(Strings.replaceEach(phrase, LanguageCharSubstitutionData.GERMAN_DIACRITIC_REMOVAL_MAPPINGS), LanguageCharSubstitutionData.FRENCH_DIACRITIC_REMOVAL_MAPPINGS), LanguageCharSubstitutionData.OTHER_DIACRITIC_REMOVAL_MAPPINGS);
};
return PhraseNormalization;
}();

var JsonResponses = function() {
function JsonResponses() {}
JsonResponses.generateJsonDoneHandler = function(doneCallbackThatReceivesJsonResponseArray) {
return function(responseData, textStatus, jqXHR) {
if (typeof jqXHR.responseJSON != "undefined") {
if (JsonResponses.processJsonResponseArrayDoOptionalRedirects(jqXHR.responseJSON)) {
return;
}
return doneCallbackThatReceivesJsonResponseArray(jqXHR.responseJSON);
} else {
throw new Error("Serwer nie zwrócił w odpowiedzi poprawnych danych JSON, bądź brakuje nagłówka reprezentującego typ zwróconych danych (nagłówek taki ustawia metoda Response::jsonResponse()).");
}
};
};
JsonResponses.generateJsonFailHandler = function(callbackThatReceivesFailJsonResponse) {
return function(jqXHR, textStatus, errorThrown) {
callbackThatReceivesFailJsonResponse(new FailJsonResponse(jqXHR, textStatus, errorThrown));
};
};
JsonResponses.generateJsonFailHandlerShowingAlerts = function(errorMessageFirstLine) {
return JsonResponses.generateJsonFailHandler(function(failJsonResponse) {
alert(errorMessageFirstLine + "\n" + failJsonResponse.getErrorMessageHtml());
});
};
JsonResponses.processJsonResponseArrayDoOptionalRedirects = function(jsonResponseArray) {
if (typeof jsonResponseArray.jsonResponseRedirectToUrl != "undefined" && jsonResponseArray.jsonResponseRedirectToUrl != null) {
window.location.assign(jsonResponseArray.jsonResponseRedirectToUrl);
return true;
} else {
return false;
}
};
return JsonResponses;
}();

var FailJsonResponse = function() {
function FailJsonResponse(jqXHR, textStatus, errorThrown) {
this.jqXHR = jqXHR;
this.textStatus = textStatus;
this.errorThrown = errorThrown;
}
FailJsonResponse.prototype.getErrorMessageHtml = function() {
if (this.jqXHR.responseJSON && typeof this.jqXHR.responseJSON.errorMessageHtmlFromServer != "undefined" && this.jqXHR.responseJSON.errorMessageHtmlFromServer != null) {
return this.jqXHR.responseJSON.errorMessageHtmlFromServer;
} else {
return 'Wystąpił błąd przy pobieraniu danych z serwera.';
}
};
FailJsonResponse.prototype.getErrorMessageForLogs = function() {
return "jqXHR error: textStatus=" + this.textStatus + ", errorThrown=" + this.errorThrown + ("responseJSON" in this.jqXHR ? ", responseJSON=" + JSON.stringify(this.jqXHR.responseJSON) : "");
};
FailJsonResponse.prototype.canRequestBeRetried = function() {
return !(this.jqXHR.responseJSON && this.jqXHR.responseJSON.doNotRetryRequest);
};
return FailJsonResponse;
}();

var DropdownMenu = function() {
function DropdownMenu() {}
DropdownMenu.init = function() {
$(".dropdownMenu").on("click", function(event) {
if ($(this).hasClass(DropdownMenu.CLASS_DISABLED)) {
return true;
}
var $optionsBox = $(this).find(".dropdownMenuOptions");
if (!$optionsBox.is(":visible")) {
$(".dropdownMenuOptions").hide();
event.stopPropagation();
$optionsBox.fadeIn(getAnimationDuration());
}
});
$(document).on("click", function(event) {
$(".dropdownMenuOptions").fadeOut(getAnimationDuration());
});
};
DropdownMenu.CLASS_DISABLED = "disabled";
return DropdownMenu;
}();

var LanguageKeyboardCharacters = function() {
function LanguageKeyboardCharacters() {}
LanguageKeyboardCharacters.isLanguageKeyboardAvailable = function(languageCode) {
return LanguageKeyboardCharacters.languageKeysArrays[languageCode] !== undefined;
};
LanguageKeyboardCharacters.getLanguageKeysArray = function(languageCode) {
return LanguageKeyboardCharacters.languageKeysArrays[languageCode];
};
LanguageKeyboardCharacters.languageKeysArrays = {
de: [ {
upperCaseCharacter: "Ä",
lowerCaseCharacter: "ä"
}, {
upperCaseCharacter: "Ö",
lowerCaseCharacter: "ö"
}, {
upperCaseCharacter: "Ü",
lowerCaseCharacter: "ü"
}, {
upperCaseCharacter: "ß",
lowerCaseCharacter: "ß"
} ],
ipa: [ {
upperCaseCharacter: "Ʌ",
lowerCaseCharacter: "ʌ"
}, {
upperCaseCharacter: "ɑ",
lowerCaseCharacter: "ɑ"
}, {
upperCaseCharacter: "æ",
lowerCaseCharacter: "æ"
}, {
upperCaseCharacter: "ə",
lowerCaseCharacter: "ə"
}, {
upperCaseCharacter: "ᵊ",
lowerCaseCharacter: "ᵊ"
}, {
upperCaseCharacter: "ɜ",
lowerCaseCharacter: "ɜ"
}, {
upperCaseCharacter: "ɚ",
lowerCaseCharacter: "ɚ"
}, {
upperCaseCharacter: "ɝ",
lowerCaseCharacter: "ɝ"
}, {
upperCaseCharacter: "ɛ",
lowerCaseCharacter: "ɛ"
}, {
upperCaseCharacter: "ɪ",
lowerCaseCharacter: "ɪ"
}, {
upperCaseCharacter: "ɒ",
lowerCaseCharacter: "ɒ"
}, {
upperCaseCharacter: "ɔ",
lowerCaseCharacter: "ɔ"
}, {
upperCaseCharacter: "ʊ",
lowerCaseCharacter: "ʊ"
}, {
upperCaseCharacter: "ɫ",
lowerCaseCharacter: "ɫ"
}, {
upperCaseCharacter: "ŋ",
lowerCaseCharacter: "ŋ"
}, {
upperCaseCharacter: "ʳ",
lowerCaseCharacter: "ʳ"
}, {
upperCaseCharacter: "ᵖ",
lowerCaseCharacter: "ᵖ"
}, {
upperCaseCharacter: "ɹ",
lowerCaseCharacter: "ɹ"
}, {
upperCaseCharacter: "ɾ",
lowerCaseCharacter: "ɾ"
}, {
upperCaseCharacter: "ʃ",
lowerCaseCharacter: "ʃ"
}, {
upperCaseCharacter: "θ",
lowerCaseCharacter: "θ"
}, {
upperCaseCharacter: "ð",
lowerCaseCharacter: "ð"
}, {
upperCaseCharacter: "ʒ",
lowerCaseCharacter: "ʒ"
}, {
upperCaseCharacter: "ˈ",
lowerCaseCharacter: "ˈ"
}, {
upperCaseCharacter: "ˌ",
lowerCaseCharacter: "ˌ"
}, {
upperCaseCharacter: "ː",
lowerCaseCharacter: "ː"
} ]
};
return LanguageKeyboardCharacters;
}();

var LanguageKeyboard = function() {
function LanguageKeyboard() {}
LanguageKeyboard.init = function(editorSelector, languageKeyboardContainerSelector, languageCode, insertCharHandler) {
if (insertCharHandler === void 0) {
insertCharHandler = LanguageKeyboard.insertCharByCodeDefaultHandler;
}
if (!LanguageKeyboardCharacters.isLanguageKeyboardAvailable(languageCode)) {
$(".languageKeyboardVisibleContainer").hide();
return false;
}
LanguageKeyboard.createLanguageKeyboardInContainer(languageKeyboardContainerSelector, languageCode);
$(document).off("focusin" + LanguageKeyboard.EVENT_SUFFIX, editorSelector).on("focusin" + LanguageKeyboard.EVENT_SUFFIX, editorSelector, function() {
LanguageKeyboard.insertCharHandler = insertCharHandler;
LanguageKeyboard.$targetEditor = $(this);
LanguageKeyboard.setKeyboardEnabled(languageKeyboardContainerSelector);
});
$(document).off("focusout" + LanguageKeyboard.EVENT_SUFFIX, editorSelector).on("focusout" + LanguageKeyboard.EVENT_SUFFIX, editorSelector, function() {
LanguageKeyboard.insertCharHandler = null;
LanguageKeyboard.$targetEditor = null;
LanguageKeyboard.setKeyboardDisabled(languageKeyboardContainerSelector);
});
if (!$(editorSelector).is(":focus")) {
LanguageKeyboard.setKeyboardDisabled(languageKeyboardContainerSelector);
} else {
$(editorSelector).trigger("focusin");
}
};
LanguageKeyboard.createLanguageKeyboardInContainer = function(languageKeyboardContainerSelector, languageCode) {
var $languageKeyboardContainer = $(languageKeyboardContainerSelector);
if ($languageKeyboardContainer.length === 0) {
throw new Error("Selektor kontenera jest nieprawidłowy (nie ma takiego obiektu): '" + languageKeyboardContainerSelector) + "'";
} else if ($languageKeyboardContainer.length > 1) {
throw new Error("Selektor kontenera jest nieprawidłowy (istnieje wiele obiektów na które wskazuje selektor '" + languageKeyboardContainerSelector + "')");
}
if ($languageKeyboardContainer.data("languageKeyboardRendered")) {
return;
}
$languageKeyboardContainer.data("languageKeyboardRendered", true);
var $keyboard = LanguageKeyboard.renderKeyboardForLanguageCode(languageCode);
$languageKeyboardContainer.append($keyboard);
$keyboard.on("mousedown click", Events.stopPropagationAndPreventDefault);
$keyboard.on("click" + LanguageKeyboard.EVENT_SUFFIX, ".languageKeyboardCharButton", function(event) {
LanguageKeyboard.triggerKeyTypedEventHandler($(this).data(event.shiftKey ? LanguageKeyboard.DATA_BUTTON_UPPERCASE_CHARACTER : LanguageKeyboard.DATA_BUTTON_LOWERCASE_CHARACTER), event);
});
$(document).off("keydown" + LanguageKeyboard.EVENT_SUFFIX).on("keydown" + LanguageKeyboard.EVENT_SUFFIX, function(event) {
if (event.which === Keys.SHIFT) {
LanguageKeyboard.changeLetterCaseOnKeys($keyboard, true);
return;
}
});
$(document).off("keyup" + LanguageKeyboard.EVENT_SUFFIX).on("keyup" + LanguageKeyboard.EVENT_SUFFIX, function(event) {
if (event.which === Keys.SHIFT) {
LanguageKeyboard.changeLetterCaseOnKeys($keyboard, false);
return;
}
});
return $keyboard;
};
LanguageKeyboard.renderKeyboardForLanguageCode = function(languageCode) {
var $keyboard = $("<div>").addClass("languageKeyboard");
_.each(LanguageKeyboardCharacters.getLanguageKeysArray(languageCode), function(languageKeyArray) {
$keyboard.append(LanguageKeyboard.generateButtonSpanForSingleKey(languageKeyArray));
});
return $keyboard;
};
LanguageKeyboard.generateButtonSpanForSingleKey = function(languageKeyArray) {
return $('<span class="languageKeyboardCharButton"></span>').data(LanguageKeyboard.DATA_BUTTON_LOWERCASE_CHARACTER, languageKeyArray.lowerCaseCharacter).data(LanguageKeyboard.DATA_BUTTON_UPPERCASE_CHARACTER, languageKeyArray.upperCaseCharacter).append($('<span class="languageKeyboardCharButtonLetter"></span>').text(languageKeyArray.lowerCaseCharacter));
};
LanguageKeyboard.triggerKeyTypedEventHandler = function(typedCharacter, event) {
if (LanguageKeyboard.insertCharHandler !== null && LanguageKeyboard.$targetEditor !== null) {
LanguageKeyboard.insertCharHandler(typedCharacter, LanguageKeyboard.$targetEditor);
event.preventDefault();
}
};
LanguageKeyboard.insertCharByCodeDefaultHandler = function(characterToInsert, $targetEditor) {
if ($targetEditor.is("input") || $targetEditor.is("textarea")) {
$targetEditor.selection("insert", {
text: characterToInsert,
mode: "before"
});
} else {
$targetEditor.text($targetEditor.text() + characterToInsert);
}
};
LanguageKeyboard.changeLetterCaseOnKeys = function($keyboard, isShiftEnabled) {
$keyboard.find(".languageKeyboardCharButton").each(function() {
var charToShowOnKey = $(this).data(isShiftEnabled ? LanguageKeyboard.DATA_BUTTON_UPPERCASE_CHARACTER : LanguageKeyboard.DATA_BUTTON_LOWERCASE_CHARACTER);
$(this).find(".languageKeyboardCharButtonLetter").text(charToShowOnKey);
});
};
LanguageKeyboard.setKeyboardDisabled = function(languageKeyboardContainerSelector) {
$(languageKeyboardContainerSelector).find(".languageKeyboard").addClass("disabledLanguageKeyboard");
if (BrowserUtils.isMobileAppMode()) {
$(languageKeyboardContainerSelector).find(".languageKeyboard, .languageKeyboardCharButton").hide();
}
};
LanguageKeyboard.setKeyboardEnabled = function(languageKeyboardContainerSelector) {
$(languageKeyboardContainerSelector).find(".languageKeyboard").removeClass("disabledLanguageKeyboard");
if (BrowserUtils.isMobileAppMode()) {
$(languageKeyboardContainerSelector).find(".languageKeyboard").slideDown("fast", "linear").find(".languageKeyboardCharButton").fadeIn();
}
};
LanguageKeyboard.EVENT_SUFFIX = ".LANGKEYS";
LanguageKeyboard.DATA_BUTTON_LOWERCASE_CHARACTER = "lowerCaseCharacter";
LanguageKeyboard.DATA_BUTTON_UPPERCASE_CHARACTER = "upperCaseCharacter";
LanguageKeyboard.insertCharHandler = null;
LanguageKeyboard.$targetEditor = null;
return LanguageKeyboard;
}();

var SiteActivityMonitor = function() {
function SiteActivityMonitor() {}
SiteActivityMonitor.pingerLoop = function() {
if (SiteActivityMonitor.lastActivityTimestamp > Time.unixTimestampSeconds() - SiteActivityMonitor.UPDATES_INTERVAL_MINUTES * 60) {
$.post("/profil/ping", {
activityMonitorCurrentUrl: window.location.pathname
}).done(JsonResponses.generateJsonDoneHandler(function(jsonResponseArray) {}));
}
};
SiteActivityMonitor.activityDetected = function() {
SiteActivityMonitor.lastActivityTimestamp = Time.unixTimestampSeconds();
};
SiteActivityMonitor.UPDATES_INTERVAL_MINUTES = 1;
SiteActivityMonitor.lastActivityTimestamp = Time.unixTimestampSeconds();
return SiteActivityMonitor;
}();

$(document).on("keydown", "body", SiteActivityMonitor.activityDetected);

$(document).on("mousedown", "body", SiteActivityMonitor.activityDetected);

$(document).on("mousemove", "body", SiteActivityMonitor.activityDetected);

setInterval(SiteActivityMonitor.pingerLoop, SiteActivityMonitor.UPDATES_INTERVAL_MINUTES * 60 * 1e3);

$(document).on("click", "a.close-notification-on-click", function(eventObject) {
$(eventObject.currentTarget).closest(".closeableNotificationWrapper").hide();
if ($(eventObject.target).data("closeableNotificationId")) {
$.post("/notifications/markClosed", {
closeableNotificationId: $(eventObject.target).data("closeableNotificationId")
});
}
});

$(document).on("click", ".soundOnClick", function(event) {
if ($(this).isDisabled()) {
return false;
}
$(this).asAudioIcon().playAudio();
return null;
});

$.fn.isHidden = function() {
return this.hasClass("hidden");
};

$.fn.isDisabled = function() {
return this.hasClass("disabled");
};

$.fn.disable = function() {
return this.addClass("disabled");
};

$.fn.enable = function() {
return this.removeClass("disabled");
};

$.fn.randomize = function() {
var j;
for (var i = 0; i < this.length; i++) {
j = Math.floor(Math.random() * this.length);
$(this[i]).before($(this[j]));
}
return $(this);
};

var BrowserUtils = function() {
function BrowserUtils() {}
BrowserUtils.isDesktop = function() {
return $("body").hasClass("isDesktop");
};
BrowserUtils.isMobilePhoneTabletOrOtherDeviceWithTouchInterface = function() {
return $("body").hasClass("isMobile");
};
BrowserUtils.isMobilePhoneBrowser = function() {
return $("body").hasClass("isMobilePhoneBrowser");
};
BrowserUtils.isiOS = function() {
return $("body").hasClass("isiOS");
};
BrowserUtils.isIpad = function() {
return $("body").hasClass("isTabletBrowser") && BrowserUtils.isiOS();
};
BrowserUtils.isTouchScreen = function() {
return Cookies.get("onTouchStartDetected") == "true";
};
BrowserUtils.isMobileAppMode = function() {
return $("body").hasClass("isMobileAppMode");
};
BrowserUtils.supportsMediaRecorder = function() {
return navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function" && typeof MediaRecorder === "function";
};
BrowserUtils.isFirefoxUserAgent = function() {
return /firefox/.test(navigator.userAgent.toLowerCase());
};
return BrowserUtils;
}();

$(document).one("touchstart", function() {
if (!BrowserUtils.isTouchScreen()) {
Cookies.set("onTouchStartDetected", "true");
}
});

var BrowserHistory = function() {
function BrowserHistory() {}
BrowserHistory.pushQtipState = function(url, location) {
if (history.pushState) {
var stateObj = {
browserHistory: "qtip",
url: url,
location: location
};
history.pushState(stateObj, "qtip", location);
}
};
BrowserHistory.replaceGrammarCategoryLinkState = function(location) {
if (history.replaceState) {
var stateObj = {
browserHistory: "grammarCategory",
location: location
};
history.replaceState(stateObj, "grammarCategory", location);
}
};
return BrowserHistory;
}();

$(function() {
var location = window.location.href;
if (Strings.contains(location, "popupmode=etutor") && !QtipModals.isModalPopupOpen()) {
var locationArr = location.split(/#/);
QtipModals.showModalForUrlWithOptions(locationArr[locationArr.length - 1], new QtipModalOptions(), true);
}
window.onpopstate = function(event) {
if (event.state !== null && event.state.url !== undefined) {
if (QtipModals.isModalPopupOpen()) {
QtipModalScalingSupport._modalAjaxLoadContent(QtipModals.getCurrentQtipModal(), event.state.url, new QtipModalOptions());
} else if (Strings.contains(event.state.url, "popupmode=etutor")) {
QtipModals.showModalForUrlWithOptions(event.state.url, new QtipModalOptions(), true);
}
} else if (event.state === null) {
if (QtipModals.isModalPopupOpen()) {
QtipModals.hideQtipModalsAndTooltips();
}
}
};
});

var MediaRecorderFeatureDetection = function() {
function MediaRecorderFeatureDetection() {}
MediaRecorderFeatureDetection.getBestSupportedCodec = function() {
if (BrowserUtils.supportsMediaRecorder()) {
var codesToCheck = [ "audio/webm;codecs=opus", "audio/ogg codecs=opus", "audio/webm", "audio/ogg" ];
for (var _i = 0, codesToCheck_1 = codesToCheck; _i < codesToCheck_1.length; _i++) {
var codecToCheck = codesToCheck_1[_i];
if (MediaRecorder.isTypeSupported(codecToCheck)) {
return codecToCheck;
}
}
}
throw new RequirementsUnsatisfied("Przeglądarka nie wspiera wymaganych przez nas kodeków audio.");
};
MediaRecorderFeatureDetection.supportsLocalRecordingsPlayback = function() {
return BrowserUtils.isFirefoxUserAgent();
};
return MediaRecorderFeatureDetection;
}();

$(function() {
RepetitionItemManager.initialize();
});

var RepetitionItemManager = function() {
function RepetitionItemManager() {}
RepetitionItemManager.initialize = function() {
$(document).on("click", ".showHideDictionaryElementNote", function() {
var documentWidth = $(document).width();
var documentHeight = $(document).height();
var $containerObject = null;
if ($(".dikibody").length > 0) {
$containerObject = $(".dikibody");
} else if ($(".learningcontents").length > 0) {
$containerObject = $(this).closest(".learningcontents");
}
if ($containerObject !== null) {
var offset = $containerObject.offset();
var containerBodyWidth = offset.left + $containerObject.width();
if (containerBodyWidth < documentWidth) {
documentWidth = containerBodyWidth;
}
var containerBodyHeight = offset.top + $containerObject.height();
if (containerBodyHeight < documentHeight) {
documentHeight = containerBodyHeight;
}
}
var dictionaryNote = $(this).parent().find(".elementNoteDictionaryWrapper").find(".elementNoteDictionaryBody");
dictionaryNote.css("margin-left", "0");
dictionaryNote.css("margin-top", "0");
dictionaryNote.toggle();
if (dictionaryNote.is(":not(:hidden)")) {
dictionaryNote.find("textarea").focus();
}
if ($(window).width() > 450) {
if (dictionaryNote.is(":visible")) {
var rightRand = dictionaryNote.offset().left + dictionaryNote.width() + 40;
var bottomRand = dictionaryNote.offset().top + dictionaryNote.height() + 40;
var left = 0;
var top_1 = 0;
if (rightRand > documentWidth) {
left += parseInt(rightRand - documentWidth) * -1;
}
if (rightRand < $(".showHideDictionaryElementNote").offset().left) {
left += parseInt($(".showHideDictionaryElementNote").offset().left - rightRand);
}
if (bottomRand > documentHeight) {
if (dictionaryNote.closest(".learningcontents").height() < dictionaryNote.height() + 40) {
$("#multisearchresults").height(dictionaryNote.height() + 40);
top_1 -= dictionaryNote.position().top;
} else {
top_1 += parseInt(bottomRand - documentHeight) * -1;
}
}
dictionaryNote.css({
"margin-top": top_1,
"margin-left": left
});
}
}
return false;
});
$(document).on("click", ".elementNoteDictionaryHide", function() {
$(this).parent().parent().hide();
return false;
});
$(document).on("click", ".elementNoteDictionaryEditView", function() {
$(this).parent().hide();
$(this).parent().parent().find(".elementNoteDictionaryEdit").show();
return false;
});
$(document).on("click", ".elementNoteDictionaryEditHide", function() {
$(this).parent().parent().hide();
var textArea = $(this).parent().find(".elementNoteDictionaryTextarea");
textArea.val(textArea.data("notetext"));
return false;
});
$(document).on("click", ".elementNoteDictionarySave", function() {
var $textarea = $(this).parent().find(".elementNoteDictionaryTextarea");
RepetitionItemManager.saveWordsBaseElementNote($textarea);
return false;
});
};
RepetitionItemManager.addOrRemoveElement = function(addOrRemoveLinkAnchor, baseElementId, enableInRepetitions) {
var $wrapperSpan = $(addOrRemoveLinkAnchor).parent();
$wrapperSpan.html(AJAX_LOADER_IMG);
$.post("/words/learn/ajaxAddOrRemoveElementFromRepetitions", {
learningElementActions: baseElementId + "=" + (enableInRepetitions ? "addToRepetitions" : "removeFromRepetitions"),
generateNewAddRemoveToRepetitionsLink: true
}).done(JsonResponses.generateJsonDoneHandler(function(learningDataArray) {
if (!learningDataArray.numRepetitionsForToday && !learningDataArray.numQueuedRepetitions) {
if (learningDataArray.error === "NOT_LOGGED_IN") {
alert('Twoja sesja wygasła - prosimy ponownie zalogować się w serwisie.');
} else if (learningDataArray.length > 0) {
alert('Serwer zwrócił nieprawidłowe dane');
}
} else {
RepetitionsCore.onNumRepetitionsChanged(learningDataArray.numRepetitionsForToday, "", learningDataArray.numQueuedRepetitions);
}
if (learningDataArray.newAddRemoveToRepetitionsLinkHtml) {
$wrapperSpan.html(learningDataArray.newAddRemoveToRepetitionsLinkHtml);
}
})).fail(JsonResponses.generateJsonFailHandlerShowingAlerts('Błąd podczas dodawania elementu do nauki.'));
};
RepetitionItemManager.saveWordsBaseElementNote = function(textArea) {
if (textArea.val().length > RepetitionItemManager.ELEMENT_NOTE_CHARS_LIMIT) {
alert(_tparam('Przekroczono dopuszczalny limit znaków w notatce ({0}).', [ RepetitionItemManager.ELEMENT_NOTE_CHARS_LIMIT ]));
return false;
}
var clickedWord = textArea.closest(".elementNoteDictionary");
textArea.parent().find(".placeForLoaderImage").html(AJAX_LOADER_IMG);
$.post("/words/elements-in-repetitions/my-notes/ajaxSaveWordsBaseElementNote", {
wordsBaseElementId: textArea.data("baseelementid"),
elementNoteText: textArea.val()
}, function(obj) {
if (obj.error != undefined) {
alert('Błąd edycji notatki!');
}
if (clickedWord.find(".seeWordsBaseNote").is(":visible")) {
if (textArea.val() != "") {
clickedWord.find(".showHideDictionaryElementNote").attr("title", textArea.val());
} else {
clickedWord.find(".seeWordsBaseNote").hide();
clickedWord.find(".addWordsBaseNote").show();
clickedWord.find(".showHideDictionaryElementNote").attr("title", 'Dodaj notatkę');
textArea.parent().find(".elementNoteTitle").text('Dodaj notatkę');
}
} else if (clickedWord.find(".addWordsBaseNote").is(":visible") && textArea.val() != "") {
clickedWord.find(".seeWordsBaseNote").show();
clickedWord.find(".addWordsBaseNote").hide();
clickedWord.find(".showHideDictionaryElementNote").attr("title", 'Edytuj notatkę');
textArea.parent().find(".elementNoteTitle").text('Edytuj notatkę');
}
textArea.data("notetext", textArea.val());
textArea.parent().find(".placeForLoaderImage").html("");
if (textArea.parent().parent().find(".elementNoteDictionaryText").text() != "") {
textArea.parent().hide();
} else {
textArea.parent().parent().hide();
}
}, "json");
};
RepetitionItemManager.ELEMENT_NOTE_CHARS_LIMIT = 500;
return RepetitionItemManager;
}();

var DikiDictionary = function() {
function DikiDictionary() {}
DikiDictionary.getSearchUrlFor = function(searchText, dictionarySelectorMode) {
return DikiDictionary.searchUrlPrefix + "?q=" + encodeURIComponent($.trim(searchText)) + "&popupmode=etutor" + (dictionarySelectorMode ? "&dictionaryselectormode=1" : "");
};
DikiDictionary.getForeignLanguage = function() {
return DikiDictionary.langpair.substr(0, 2);
};
DikiDictionary.popupDikiSearch = function(searchText, dictionarySelectorMode) {
var qtipModalOptions = new QtipModalOptions();
qtipModalOptions.addToBrowserHistory = true;
qtipModalOptions.onDocumentReady = function() {
if ($("body").hasClass("clearSearchForIosEnabled")) {
$('input[type="search"]:not(.clear_input)').clearSearch();
}
};
QtipModals.showModalForUrlWithOptions(DikiDictionary.getSearchUrlFor(searchText, dictionarySelectorMode), qtipModalOptions);
};
DikiDictionary.showPopupWithUrl = function(url) {
QtipModals.showModalForUrlFullscreen(url);
};
DikiDictionary.initAutocompleteForSearchField = function($input, $containerForAutocompleteSuggestions) {
$(function() {
$input.autocomplete({
source: DikiDictionary.getSuggestionsForAutocomplete,
minLength: 2,
appendTo: $containerForAutocompleteSuggestions,
create: function(event, ui) {},
open: function() {
$containerForAutocompleteSuggestions.find("ul").scrollTop(0);
$containerForAutocompleteSuggestions.find("ul").height($(".dikibody").height() - $containerForAutocompleteSuggestions.offset().top);
},
search: function() {
$containerForAutocompleteSuggestions.find("ul").scrollTop(0);
},
select: function() {
_.defer(function() {
$input.closest("form").submit();
});
}
}).keydown(function(event) {
if (event.which == Keys.ENTER) {
$(this).autocomplete("close");
}
});
});
};
DikiDictionary.setFocusOnInputFieldOnDesktop = function($box) {
if (!BrowserUtils.isDesktop()) {
return;
}
var $input = $box.find(".dikiSearchInputField");
setTimeout(function() {
try {
$input.focus().select();
} catch (e) {
Logger.consoleLog(e);
}
}, 0);
};
DikiDictionary.selectorModeSearch = function(searchText, dictionarySelectorModePositionToAddNewElement) {
DikiDictionary.dictionarySelectorModePositionToAddNewElement = dictionarySelectorModePositionToAddNewElement;
DikiDictionary.popupDikiSearch(searchText, true);
};
DikiDictionary.getSuggestionsForAutocomplete = function(key, cont) {
$.getJSON("/autocomplete.php", {

langpair: DikiDictionary.langpair
}, function(result) {
var res = [];
for (var i = 0; i < result.length; i++) {
res.push({
id: i,
value: result[i].rutext,
q: result[i].url
});
}
cont(res);
});
};
DikiDictionary.getTranslation = function(searchQuery, csrfToken, foreignLanguageCode, nativeLanguageCode, callback) {
$.getJSON("/dictionary/translate/" + foreignLanguageCode + "/" + nativeLanguageCode, {
q: searchQuery,
csrftoken: csrfToken
}, function(result) {
if (result != null && !result.error) {
if (result.translatedText) {
callback(result.translatedText, false);
} else if (result.messageHtml) {
callback(result.messageHtml, true);
}
}
});
};
DikiDictionary.hideVulgarMeaningsOnPageLoad = function() {
$(".hiddenNotForChildrenMeaning").not(".hiddenNotForChildrenMeaningProcessed").after('<span class="hiddenNotForChildrenMeaningShowLink"><a href="#" onclick="DikiDictionary.showVulgarMeanings();return false;">' + 'Pokaż wulgarne znaczenie' + "</a></span>").hide().addClass("hiddenNotForChildrenMeaningProcessed");
$(".hiddenNotForChildrenMeaningExtras").hide();
};
DikiDictionary.showVulgarMeanings = function() {
$(".hiddenNotForChildrenMeaning").show("normal");
$(".hiddenNotForChildrenMeaningExtras").show("normal");
$(".hiddenNotForChildrenMeaningShowLink").hide();
};
DikiDictionary.init = function(initInQtip) {
if (initInQtip === void 0) {
initInQtip = false;
}
var $box;
if (initInQtip) {
$box = $(".qtip-content .dikibody");
} else {
$box = $(".dikibody");
}
if ($(".dikibody").length > 0) {
$box.on("mouseenter", ".dictpict", function() {
$("li." + $(this).attr("id").substring(0, $(this).attr("id").indexOf("p"))).addClass("hl");
});
$box.on("mouseleave", ".dictpict", function() {
$("li." + $(this).attr("id").substring(0, $(this).attr("id").indexOf("p"))).removeClass("hl");
});
DikiDictionary.setFocusOnInputFieldOnDesktop($box);
DikiDictionary.hideVulgarMeaningsOnPageLoad();
var dictionarySelectorModeAddLinkEventNamespace = "dictionarySelectorModeAddLink";
$(document).off("click." + dictionarySelectorModeAddLinkEventNamespace).on("click." + dictionarySelectorModeAddLinkEventNamespace, ".dictionarySelectorModeAddLink", function(event) {
event.preventDefault();
QtipModals.hideQtipModalsAndTooltips();
var elementToAddJson = $(this).data("elementToAddJson");
elementToAddJson.isActiveInRepetitions = true;
ElementsEditor.addElement(elementToAddJson, DikiDictionary.dictionarySelectorModePositionToAddNewElement);
});
DikiDictionary.showRecentSearches();
}
};
DikiDictionary.initAutocompleteForDefaultSearchField = function() {
var $dikiInput = $("input.dikiSearchInputField");
if ($dikiInput.length > 0) {
DikiDictionary.initAutocompleteForSearchField($dikiInput, $(".autocompleteResults"));
}
};
DikiDictionary.initSearchOnDoubleClick = function() {
if (window.top == window.self && DikiDictionary.enableDoubleClickSearch) {
$(document).on("dblclick." + DikiDictionary.jqueryEventsNamespace, function(event) {
var selection = null;
if ($(event.target).closest(".doNotPopupDikiOnDoubleClick").length || $(event.target).closest(".qtip").length) {
return;
} else {
selection = DikiDictionary.getDocumentSelection();
if (selection != null && $.trim(selection) != "") {
DikiDictionary.doubleClickSearchAction(selection);
return;
} else {
setTimeout(function() {
selection = DikiDictionary.getDocumentSelection();
if (selection != null && $.trim(selection) != "") {
DikiDictionary.doubleClickSearchAction(selection);
}
return;
}, 1e3);
}
}
});
}
};
DikiDictionary.doubleClickSearchAction = function(selection) {
if (DikiDictionary.popupOnDoubleClick) {
DikiDictionary.popupDikiSearch(selection);
} else {
LocationUtils.loadUrl(DikiDictionary.searchUrlPrefix + "?q=" + $.trim(encodeURIComponent(selection)));
}
};
DikiDictionary.getDocumentSelection = function() {
return $.selection().length > 0 ? $.selection() : null;
};
DikiDictionary.showRecentSearches = function() {
var recentSearchContainer = $(".recentSearchContainer");
var examplesSearchContainer = $(".examplesSearchContainer");
if (recentSearchContainer.length > 0) {
$.ajax({
url: "/dictionary/recentSearches",
method: "GET",
cache: false,
data: {
lang: DikiDictionary.getForeignLanguage()
}
}).done(function(data) {
if (data.length) {
examplesSearchContainer.hide();
$(data).each(function(index, element) {
if (index > 0) {
recentSearchContainer.append(", ");
}
recentSearchContainer.append(Strings.replaceAll(recentSearchContainer.data("recent-search-url-template"), "XqueryX", element.toString()));
});
recentSearchContainer.show();
} else {
examplesSearchContainer.show();
recentSearchContainer.hide();
}
});
}
};
DikiDictionary.jqueryEventsNamespace = "DIKI";
DikiDictionary.searchUrlPrefix = "/slownik-angielskiego";
DikiDictionary.langpair = "en::pl";
DikiDictionary.enableDoubleClickSearch = true;
DikiDictionary.popupOnDoubleClick = true;
DikiDictionary.dictionarySelectorModePositionToAddNewElement = undefined;
return DikiDictionary;
}();

if (window.location.pathname === "/" || Strings.containsAny(window.location.href, [ "/account", "/adminpanel/", "/buy", "/coins-market", "/group", "/informacje", "/offer", "/pricing", "/profil", "/registration", "/regulamin", "/search" ])) {
DikiDictionary.enableDoubleClickSearch = false;
}

if (window.location.pathname === "/" || Strings.containsAny(window.location.href, [ "?q=", "&q=" ])) {
DikiDictionary.popupOnDoubleClick = false;
}

$(function() {
DikiDictionary.init();
DikiDictionary.initAutocompleteForDefaultSearchField();
DikiDictionary.initSearchOnDoubleClick();
});

!function(a, b, c) {
!function(a) {
"use strict";
"function" == typeof define && define.amd ? define([ "jquery" ], a) : jQuery && !jQuery.fn.qtip && a(jQuery);
}(function(d) {
"use strict";
function e(a, b, c, e) {
this.id = c, this.target = a, this.tooltip = E, this.elements = {
target: a
}, this._id = R + "-" + c, this.timers = {
img: {}
}, this.options = b, this.plugins = {}, this.cache = {
event: {},
target: d(),
disabled: D,
attr: e,
onTooltip: D,
lastClass: ""
}, this.rendered = this.destroyed = this.disabled = this.waiting = this.hiddenDuringWait = this.positioning = this.triggering = D;
}
function f(a) {
return a === E || "object" !== d.type(a);
}
function g(a) {
return !(d.isFunction(a) || a && a.attr || a.length || "object" === d.type(a) && (a.jquery || a.then));
}
function h(a) {
var b, c, e, h;
return f(a) ? D : (f(a.metadata) && (a.metadata = {
type: a.metadata
}), "content" in a && (b = a.content, f(b) || b.jquery || b.done ? (c = g(b) ? D : b, 
b = a.content = {
text: c
}) : c = b.text, "ajax" in b && (e = b.ajax, h = e && e.once !== D, delete b.ajax, 
b.text = function(a, b) {
var f = c || d(this).attr(b.options.content.attr) || "Loading...", g = d.ajax(d.extend({}, e, {
context: b
})).then(e.success, E, e.error).then(function(a) {
return a && h && b.set("content.text", a), a;
}, function(a, c, d) {
b.destroyed || 0 === a.status || b.set("content.text", c + ": " + d);
});
return h ? f : (b.set("content.text", f), g);
}), "title" in b && (d.isPlainObject(b.title) && (b.button = b.title.button, b.title = b.title.text), 
g(b.title || D) && (b.title = D))), "position" in a && f(a.position) && (a.position = {
my: a.position,
at: a.position
}), "show" in a && f(a.show) && (a.show = a.show.jquery ? {
target: a.show
} : a.show === C ? {
ready: C
} : {
event: a.show
}), "hide" in a && f(a.hide) && (a.hide = a.hide.jquery ? {
target: a.hide
} : {
event: a.hide
}), "style" in a && f(a.style) && (a.style = {
classes: a.style
}), d.each(Q, function() {
this.sanitize && this.sanitize(a);
}), a);
}
function i(a, b) {
for (var c, d = 0, e = a, f = b.split("."); e = e[f[d++]]; ) d < f.length && (c = e);
return [ c || a, f.pop() ];
}
function j(a, b) {
var c, d, e;
for (c in this.checks) if (this.checks.hasOwnProperty(c)) for (d in this.checks[c]) this.checks[c].hasOwnProperty(d) && (e = new RegExp(d, "i").exec(a)) && (b.push(e), 
("builtin" === c || this.plugins[c]) && this.checks[c][d].apply(this.plugins[c] || this, b));
}
function k(a) {
return U.concat("").join(a ? "-" + a + " " : " ");
}
function l(a, b) {
return b > 0 ? setTimeout(d.proxy(a, this), b) : void a.call(this);
}
function m(a) {
this.tooltip.hasClass(_) || (clearTimeout(this.timers.show), clearTimeout(this.timers.hide), 
this.timers.show = l.call(this, function() {
this.toggle(C, a);
}, this.options.show.delay));
}
function n(a) {
if (!this.tooltip.hasClass(_) && !this.destroyed) {
var b = d(a.relatedTarget), c = b.closest(V)[0] === this.tooltip[0], e = b[0] === this.options.show.target[0];
if (clearTimeout(this.timers.show), clearTimeout(this.timers.hide), this !== b[0] && "mouse" === this.options.position.target && c || this.options.hide.fixed && /mouse(out|leave|move)/.test(a.type) && (c || e)) try {
a.preventDefault(), a.stopImmediatePropagation();
} catch (f) {} else this.timers.hide = l.call(this, function() {
this.toggle(D, a);
}, this.options.hide.delay, this);
}
}
function o(a) {
!this.tooltip.hasClass(_) && this.options.hide.inactive && (clearTimeout(this.timers.inactive), 
this.timers.inactive = l.call(this, function() {
this.hide(a);
}, this.options.hide.inactive));
}
function p(a) {
this.rendered && this.tooltip[0].offsetWidth > 0 && this.reposition(a);
}
function q(a, c, e) {
d(b.body).delegate(a, (c.split ? c : c.join("." + R + " ")) + "." + R, function() {
var a = x.api[d.attr(this, T)];
a && !a.disabled && e.apply(a, arguments);
});
}
function r(a, c, f) {
var g, i, j, k, l, m = d(b.body), n = a[0] === b ? m : a, o = a.metadata ? a.metadata(f.metadata) : E, p = "html5" === f.metadata.type && o ? o[f.metadata.name] : E, q = a.data(f.metadata.name || "qtipopts");
try {
q = "string" == typeof q ? d.parseJSON(q) : q;
} catch (r) {}
if (k = d.extend(C, {}, x.defaults, f, "object" == typeof q ? h(q) : E, h(p || o)), 
i = k.position, k.id = c, "boolean" == typeof k.content.text) {
if (j = a.attr(k.content.attr), k.content.attr === D || !j) return D;
k.content.text = j;
}
if (i.container.length || (i.container = m), i.target === D && (i.target = n), k.show.target === D && (k.show.target = n), 
k.show.solo === C && (k.show.solo = i.container.closest("body")), k.hide.target === D && (k.hide.target = n), 
k.position.viewport === C && (k.position.viewport = i.container), i.container = i.container.eq(0), 
i.at = new z(i.at, C), i.my = new z(i.my), a.data(R)) if (k.overwrite) a.qtip("destroy", !0); else if (k.overwrite === D) return D;
return a.attr(S, c), k.suppress && (l = a.attr("title")) && a.removeAttr("title").attr(ba, l).attr("title", ""), 
g = new e(a, k, c, !!j), a.data(R, g), g;
}
function s(a) {
return a.charAt(0).toUpperCase() + a.slice(1);
}
function t(a, b) {
var d, e, f = b.charAt(0).toUpperCase() + b.slice(1), g = (b + " " + ua.join(f + " ") + f).split(" "), h = 0;
if (ta[b]) return a.css(ta[b]);
for (;d = g[h++]; ) if ((e = a.css(d)) !== c) return ta[b] = d, e;
}
function u(a, b) {
return Math.ceil(parseFloat(t(a, b)));
}
function v(a, b) {
this._ns = "tip", this.options = b, this.offset = b.offset, this.size = [ b.width, b.height ], 
this.qtip = a, this.init(a);
}
function w(a, b) {
this.options = b, this._ns = "-modal", this.qtip = a, this.init(a);
}
var x, y, z, A, B, C = !0, D = !1, E = null, F = "x", G = "y", H = "width", I = "height", J = "top", K = "left", L = "bottom", M = "right", N = "center", O = "flipinvert", P = "shift", Q = {}, R = "qtip", S = "data-hasqtip", T = "data-qtip-id", U = [ "ui-widget", "ui-tooltip" ], V = "." + R, W = "click dblclick mousedown mouseup mousemove mouseleave mouseenter".split(" "), X = R + "-fixed", Y = R + "-default", Z = R + "-focus", $ = R + "-hover", _ = R + "-disabled", aa = "_replacedByqTip", ba = "oldtitle", ca = {
ie: function() {
var a, c;
for (a = 4, c = b.createElement("div"); (c.innerHTML = "\x3c!--[if gt IE " + a + "]><i></i><![endif]--\x3e") && c.getElementsByTagName("i")[0]; a += 1) ;
return a > 4 ? a : NaN;
}(),
iOS: parseFloat(("" + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [ 0, "" ])[1]).replace("undefined", "3_2").replace("_", ".").replace("_", "")) || D
};
y = e.prototype, y._when = function(a) {
return d.when.apply(d, a);
}, y.render = function(a) {
if (this.rendered || this.destroyed) return this;
var b = this, c = this.options, e = this.cache, f = this.elements, g = c.content.text, h = c.content.title, i = c.content.button, j = c.position, k = [];
return d.attr(this.target[0], "aria-describedby", this._id), e.posClass = this._createPosClass((this.position = {
my: j.my,
at: j.at
}).my), this.tooltip = f.tooltip = d("<div/>", {
id: this._id,
class: [ R, Y, c.style.classes, e.posClass ].join(" "),
width: c.style.width || "",
height: c.style.height || "",
tracking: "mouse" === j.target && j.adjust.mouse,
role: "alert",
"aria-live": "polite",
"aria-atomic": D,
"aria-describedby": this._id + "-content",
"aria-hidden": C
}).toggleClass(_, this.disabled).attr(T, this.id).data(R, this).appendTo(j.container).append(f.content = d("<div />", {
class: R + "-content",
id: this._id + "-content",
"aria-atomic": C
})), this.rendered = -1, this.positioning = C, h && (this._createTitle(), d.isFunction(h) || k.push(this._updateTitle(h, D))), 
i && this._createButton(), d.isFunction(g) || k.push(this._updateContent(g, D)), 
this.rendered = C, this._setWidget(), d.each(Q, function(a) {
var c;
"render" === this.initialize && (c = this(b)) && (b.plugins[a] = c);
}), this._unassignEvents(), this._assignEvents(), this._when(k).then(function() {
b._trigger("render"), b.positioning = D, b.hiddenDuringWait || !c.show.ready && !a || b.toggle(C, e.event, D), 
b.hiddenDuringWait = D;
}), x.api[this.id] = this, this;
}, y.destroy = function(a) {
function b() {
if (!this.destroyed) {
this.destroyed = C;
var a, b = this.target, c = b.attr(ba);
this.rendered && this.tooltip.stop(1, 0).find("*").remove().end().remove(), d.each(this.plugins, function() {
this.destroy && this.destroy();
});
for (a in this.timers) this.timers.hasOwnProperty(a) && clearTimeout(this.timers[a]);
b.removeData(R).removeAttr(T).removeAttr(S).removeAttr("aria-describedby"), this.options.suppress && c && b.attr("title", c).removeAttr(ba), 
this._unassignEvents(), this.options = this.elements = this.cache = this.timers = this.plugins = this.mouse = E, 
delete x.api[this.id];
}
}
return this.destroyed ? this.target : (a === C && "hide" !== this.triggering || !this.rendered ? b.call(this) : (this.tooltip.one("tooltiphidden", d.proxy(b, this)), 
!this.triggering && this.hide()), this.target);
}, A = y.checks = {
builtin: {
"^id$": function(a, b, c, e) {
var f = c === C ? x.nextid : c, g = R + "-" + f;
f !== D && f.length > 0 && !d("#" + g).length ? (this._id = g, this.rendered && (this.tooltip[0].id = this._id, 
this.elements.content[0].id = this._id + "-content", this.elements.title[0].id = this._id + "-title")) : a[b] = e;
},
"^prerender": function(a, b, c) {
c && !this.rendered && this.render(this.options.show.ready);
},
"^content.text$": function(a, b, c) {
this._updateContent(c);
},
"^content.attr$": function(a, b, c, d) {
this.options.content.text === this.target.attr(d) && this._updateContent(this.target.attr(c));
},
"^content.title$": function(a, b, c) {
return c ? (c && !this.elements.title && this._createTitle(), void this._updateTitle(c)) : this._removeTitle();
},
"^content.button$": function(a, b, c) {
this._updateButton(c);
},
"^content.title.(text|button)$": function(a, b, c) {
this.set("content." + b, c);
},
"^position.(my|at)$": function(a, b, c) {
"string" == typeof c && (this.position[b] = a[b] = new z(c, "at" === b));
},
"^position.container$": function(a, b, c) {
this.rendered && this.tooltip.appendTo(c);
},
"^show.ready$": function(a, b, c) {
c && (!this.rendered && this.render(C) || this.toggle(C));
},
"^style.classes$": function(a, b, c, d) {
this.rendered && this.tooltip.removeClass(d).addClass(c);
},
"^style.(width|height)": function(a, b, c) {
this.rendered && this.tooltip.css(b, c);
},
"^style.widget|content.title": function() {
this.rendered && this._setWidget();
},
"^style.def": function(a, b, c) {
this.rendered && this.tooltip.toggleClass(Y, !!c);
},
"^events.(render|show|move|hide|focus|blur)$": function(a, b, c) {
this.rendered && this.tooltip[(d.isFunction(c) ? "" : "un") + "bind"]("tooltip" + b, c);
},
"^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)": function() {
if (this.rendered) {
var a = this.options.position;
this.tooltip.attr("tracking", "mouse" === a.target && a.adjust.mouse), this._unassignEvents(), 
this._assignEvents();
}
}
}
}, y.get = function(a) {
if (this.destroyed) return this;
var b = i(this.options, a.toLowerCase()), c = b[0][b[1]];
return c.precedance ? c.string() : c;
};
var da = /^position\.(my|at|adjust|target|container|viewport)|style|content|show\.ready/i, ea = /^prerender|show\.ready/i;
y.set = function(a, b) {
if (this.destroyed) return this;
var c, e = this.rendered, f = D, g = this.options;
return "string" == typeof a ? (c = a, a = {}, a[c] = b) : a = d.extend({}, a), d.each(a, function(b, c) {
if (e && ea.test(b)) return void delete a[b];
var h, j = i(g, b.toLowerCase());
h = j[0][j[1]], j[0][j[1]] = c && c.nodeType ? d(c) : c, f = da.test(b) || f, a[b] = [ j[0], j[1], c, h ];
}), h(g), this.positioning = C, d.each(a, d.proxy(j, this)), this.positioning = D, 
this.rendered && this.tooltip[0].offsetWidth > 0 && f && this.reposition("mouse" === g.position.target ? E : this.cache.event), 
this;
}, y._update = function(a, b) {
var c = this, e = this.cache;
return this.rendered && a ? (d.isFunction(a) && (a = a.call(this.elements.target, e.event, this) || ""), 
d.isFunction(a.then) ? (e.waiting = C, a.then(function(a) {
return e.waiting = D, c._update(a, b);
}, E, function(a) {
return c._update(a, b);
})) : a === D || !a && "" !== a ? D : (a.jquery && a.length > 0 ? b.empty().append(a.css({
display: "block",
visibility: "visible"
})) : b.html(a), this._waitForContent(b).then(function(a) {
c.rendered && c.tooltip[0].offsetWidth > 0 && c.reposition(e.event, !a.length);
}))) : D;
}, y._waitForContent = function(a) {
var b = this.cache;
return b.waiting = C, (d.fn.imagesLoaded ? a.imagesLoaded() : new d.Deferred().resolve([])).done(function() {
b.waiting = D;
}).promise();
}, y._updateContent = function(a, b) {
this._update(a, this.elements.content, b);
}, y._updateTitle = function(a, b) {
this._update(a, this.elements.title, b) === D && this._removeTitle(D);
}, y._createTitle = function() {
var a = this.elements, b = this._id + "-title";
a.titlebar && this._removeTitle(), a.titlebar = d("<div />", {
class: R + "-titlebar " + (this.options.style.widget ? k("header") : "")
}).append(a.title = d("<div />", {
id: b,
class: R + "-title",
"aria-atomic": C
})).insertBefore(a.content).delegate(".qtip-close", "mousedown keydown mouseup keyup mouseout", function(a) {
d(this).toggleClass("ui-state-active ui-state-focus", "down" === a.type.substr(-4));
}).delegate(".qtip-close", "mouseover mouseout", function(a) {
d(this).toggleClass("ui-state-hover", "mouseover" === a.type);
}), this.options.content.button && this._createButton();
}, y._removeTitle = function(a) {
var b = this.elements;
b.title && (b.titlebar.remove(), b.titlebar = b.title = b.button = E, a !== D && this.reposition());
}, y._createPosClass = function(a) {
return R + "-pos-" + (a || this.options.position.my).abbrev();
}, y.reposition = function(c, e) {
if (!this.rendered || this.positioning || this.destroyed) return this;
this.positioning = C;
var f, g, h, i, j = this.cache, k = this.tooltip, l = this.options.position, m = l.target, n = l.my, o = l.at, p = l.viewport, q = l.container, r = l.adjust, s = r.method.split(" "), t = k.outerWidth(D), u = k.outerHeight(D), v = 0, w = 0, x = k.css("position"), y = {
left: 0,
top: 0
}, z = k[0].offsetWidth > 0, A = c && "scroll" === c.type, B = d(a), E = q[0].ownerDocument, F = this.mouse;
if (d.isArray(m) && 2 === m.length) o = {
x: K,
y: J
}, y = {
left: m[0],
top: m[1]
}; else if ("mouse" === m) o = {
x: K,
y: J
}, (!r.mouse || this.options.hide.distance) && j.origin && j.origin.pageX ? c = j.origin : !c || c && ("resize" === c.type || "scroll" === c.type) ? c = j.event : F && F.pageX && (c = F), 
"static" !== x && (y = q.offset()), E.body.offsetWidth !== (a.innerWidth || E.documentElement.clientWidth) && (g = d(b.body).offset()), 
y = {
left: c.pageX - y.left + (g && g.left || 0),
top: c.pageY - y.top + (g && g.top || 0)
}, r.mouse && A && F && (y.left -= (F.scrollX || 0) - B.scrollLeft(), y.top -= (F.scrollY || 0) - B.scrollTop()); else {
if ("event" === m ? c && c.target && "scroll" !== c.type && "resize" !== c.type ? j.target = d(c.target) : c.target || (j.target = this.elements.target) : "event" !== m && (j.target = d(m.jquery ? m : this.elements.target)), 
m = j.target, m = d(m).eq(0), 0 === m.length) return this;
m[0] === b || m[0] === a ? (v = ca.iOS ? a.innerWidth : m.width(), w = ca.iOS ? a.innerHeight : m.height(), 
m[0] === a && (y = {
top: (p || m).scrollTop(),
left: (p || m).scrollLeft()
})) : Q.imagemap && m.is("area") ? f = Q.imagemap(this, m, o, Q.viewport ? s : D) : Q.svg && m && m[0].ownerSVGElement ? f = Q.svg(this, m, o, Q.viewport ? s : D) : (v = m.outerWidth(D), 
w = m.outerHeight(D), y = m.offset()), f && (v = f.width, w = f.height, g = f.offset, 
y = f.position), y = this.reposition.offset(m, y, q), (ca.iOS > 3.1 && ca.iOS < 4.1 || ca.iOS >= 4.3 && ca.iOS < 4.33 || !ca.iOS && "fixed" === x) && (y.left -= B.scrollLeft(), 
y.top -= B.scrollTop()), (!f || f && f.adjustable !== D) && (y.left += o.x === M ? v : o.x === N ? v / 2 : 0, 
y.top += o.y === L ? w : o.y === N ? w / 2 : 0);
}
return y.left += r.x + (n.x === M ? -t : n.x === N ? -t / 2 : 0), y.top += r.y + (n.y === L ? -u : n.y === N ? -u / 2 : 0), 
Q.viewport ? (h = y.adjusted = Q.viewport(this, y, l, v, w, t, u), g && h.left && (y.left += g.left), 
g && h.top && (y.top += g.top), h.my && (this.position.my = h.my)) : y.adjusted = {
left: 0,
top: 0
}, j.posClass !== (i = this._createPosClass(this.position.my)) && (j.posClass = i, 
k.removeClass(j.posClass).addClass(i)), this._trigger("move", [ y, p.elem || p ], c) ? (delete y.adjusted, 
e === D || !z || isNaN(y.left) || isNaN(y.top) || "mouse" === m || !d.isFunction(l.effect) ? k.css(y) : d.isFunction(l.effect) && (l.effect.call(k, this, d.extend({}, y)), 
k.queue(function(a) {
d(this).css({
opacity: "",
height: ""
}), ca.ie && this.style.removeAttribute("filter"), a();
})), this.positioning = D, this) : this;
}, y.reposition.offset = function(a, c, e) {
function f(a, b) {
c.left += b * a.scrollLeft(), c.top += b * a.scrollTop();
}
if (!e[0]) return c;
var g, h, i, j, k = d(a[0].ownerDocument), l = !!ca.ie && "CSS1Compat" !== b.compatMode, m = e[0];
do {
"static" !== (h = d.css(m, "position")) && ("fixed" === h ? (i = m.getBoundingClientRect(), 
f(k, -1)) : (i = d(m).position(), i.left += parseFloat(d.css(m, "borderLeftWidth")) || 0, 
i.top += parseFloat(d.css(m, "borderTopWidth")) || 0), c.left -= i.left + (parseFloat(d.css(m, "marginLeft")) || 0), 
c.top -= i.top + (parseFloat(d.css(m, "marginTop")) || 0), g || "hidden" === (j = d.css(m, "overflow")) || "visible" === j || (g = d(m)));
} while (m = m.offsetParent);
return g && (g[0] !== k[0] || l) && f(g, 1), c;
};
var fa = (z = y.reposition.Corner = function(a, b) {
a = ("" + a).replace(/([A-Z])/, " $1").replace(/middle/gi, N).toLowerCase(), this.x = (a.match(/left|right/i) || a.match(/center/) || [ "inherit" ])[0].toLowerCase(), 
this.y = (a.match(/top|bottom|center/i) || [ "inherit" ])[0].toLowerCase(), this.forceY = !!b;
var c = a.charAt(0);
this.precedance = "t" === c || "b" === c ? G : F;
}).prototype;
fa.invert = function(a, b) {
this[a] = this[a] === K ? M : this[a] === M ? K : b || this[a];
}, fa.string = function(a) {
var b = this.x, c = this.y, d = b !== c ? "center" === b || "center" !== c && (this.precedance === G || this.forceY) ? [ c, b ] : [ b, c ] : [ b ];
return a !== !1 ? d.join(" ") : d;
}, fa.abbrev = function() {
var a = this.string(!1);
return a[0].charAt(0) + (a[1] && a[1].charAt(0) || "");
}, fa.clone = function() {
return new z(this.string(), this.forceY);
}, y.toggle = function(a, c) {
var e = this.cache, f = this.options, g = this.tooltip;
if (c) {
if (/over|enter/.test(c.type) && e.event && /out|leave/.test(e.event.type) && f.show.target.add(c.target).length === f.show.target.length && g.has(c.relatedTarget).length) return this;
e.event = d.event.fix(c);
}
if (this.waiting && !a && (this.hiddenDuringWait = C), !this.rendered) return a ? this.render(1) : this;
if (this.destroyed || this.disabled) return this;
var h, i, j, k = a ? "show" : "hide", l = this.options[k], m = this.options.position, n = this.options.content, o = this.tooltip.css("width"), p = this.tooltip.is(":visible"), q = a || 1 === l.target.length, r = !c || l.target.length < 2 || e.target[0] === c.target;
return (typeof a).search("boolean|number") && (a = !p), h = !g.is(":animated") && p === a && r, 
i = h ? E : !!this._trigger(k, [ 90 ]), this.destroyed ? this : (i !== D && a && this.focus(c), 
!i || h ? this : (d.attr(g[0], "aria-hidden", !a), a ? (this.mouse && (e.origin = d.event.fix(this.mouse)), 
d.isFunction(n.text) && this._updateContent(n.text, D), d.isFunction(n.title) && this._updateTitle(n.title, D), 
!B && "mouse" === m.target && m.adjust.mouse && (d(b).bind("mousemove." + R, this._storeMouse), 
B = C), o || g.css("width", g.outerWidth(D)), this.reposition(c, arguments[2]), 
o || g.css("width", ""), l.solo && ("string" == typeof l.solo ? d(l.solo) : d(V, l.solo)).not(g).not(l.target).qtip("hide", new d.Event("tooltipsolo"))) : (clearTimeout(this.timers.show), 
delete e.origin, B && !d(V + '[tracking="true"]:visible', l.solo).not(g).length && (d(b).unbind("mousemove." + R), 
B = D), this.blur(c)), j = d.proxy(function() {
a ? (ca.ie && g[0].style.removeAttribute("filter"), g.css("overflow", ""), "string" == typeof l.autofocus && d(this.options.show.autofocus, g).focus(), 
this.options.show.target.trigger("qtip-" + this.id + "-inactive")) : g.css({
display: "",
visibility: "",
opacity: "",
left: "",
top: ""
}), this._trigger(a ? "visible" : "hidden");
}, this), l.effect === D || q === D ? (g[k](), j()) : d.isFunction(l.effect) ? (g.stop(1, 1), 
l.effect.call(g, this), g.queue("fx", function(a) {
j(), a();
})) : g.fadeTo(90, a ? 1 : 0, j), a && l.target.trigger("qtip-" + this.id + "-inactive"), 
this));
}, y.show = function(a) {
return this.toggle(C, a);
}, y.hide = function(a) {
return this.toggle(D, a);
}, y.focus = function(a) {
if (!this.rendered || this.destroyed) return this;
var b = d(V), c = this.tooltip, e = parseInt(c[0].style.zIndex, 10), f = x.zindex + b.length;
return c.hasClass(Z) || this._trigger("focus", [ f ], a) && (e !== f && (b.each(function() {
this.style.zIndex > e && (this.style.zIndex = this.style.zIndex - 1);
}), b.filter("." + Z).qtip("blur", a)), c.addClass(Z)[0].style.zIndex = f), this;
}, y.blur = function(a) {
return !this.rendered || this.destroyed ? this : (this.tooltip.removeClass(Z), this._trigger("blur", [ this.tooltip.css("zIndex") ], a), 
this);
}, y.disable = function(a) {
return this.destroyed ? this : ("toggle" === a ? a = !(this.rendered ? this.tooltip.hasClass(_) : this.disabled) : "boolean" != typeof a && (a = C), 
this.rendered && this.tooltip.toggleClass(_, a).attr("aria-disabled", a), this.disabled = !!a, 
this);
}, y.enable = function() {
return this.disable(D);
}, y._createButton = function() {
var a = this, b = this.elements, c = b.tooltip, e = this.options.content.button, f = "string" == typeof e, g = f ? e : "Close tooltip";
b.button && b.button.remove(), e.jquery ? b.button = e : b.button = d("<a />", {
class: "qtip-close " + (this.options.style.widget ? "" : R + "-icon"),
title: g,
"aria-label": g
}).prepend(d("<span />", {
class: "ui-icon ui-icon-close",
html: "&times;"
})), b.button.appendTo(b.titlebar || c).attr("role", "button").click(function(b) {
return c.hasClass(_) || a.hide(b), D;
});
}, y._updateButton = function(a) {
if (!this.rendered) return D;
var b = this.elements.button;
a ? this._createButton() : b.remove();
}, y._setWidget = function() {
var a = this.options.style.widget, b = this.elements, c = b.tooltip, d = c.hasClass(_);
c.removeClass(_), _ = a ? "ui-state-disabled" : "qtip-disabled", c.toggleClass(_, d), 
c.toggleClass("ui-helper-reset " + k(), a).toggleClass(Y, this.options.style.def && !a), 
b.content && b.content.toggleClass(k("content"), a), b.titlebar && b.titlebar.toggleClass(k("header"), a), 
b.button && b.button.toggleClass(R + "-icon", !a);
}, y._storeMouse = function(a) {
return (this.mouse = d.event.fix(a)).type = "mousemove", this;
}, y._bind = function(a, b, c, e, f) {
if (a && c && b.length) {
var g = "." + this._id + (e ? "-" + e : "");
return d(a).bind((b.split ? b : b.join(g + " ")) + g, d.proxy(c, f || this)), this;
}
}, y._unbind = function(a, b) {
return a && d(a).unbind("." + this._id + (b ? "-" + b : "")), this;
}, y._trigger = function(a, b, c) {
var e = new d.Event("tooltip" + a);
return e.originalEvent = c && d.extend({}, c) || this.cache.event || E, this.triggering = a, 
this.tooltip.trigger(e, [ this ].concat(b || [])), this.triggering = D, !e.isDefaultPrevented();
}, y._bindEvents = function(a, b, c, e, f, g) {
var h = c.filter(e).add(e.filter(c)), i = [];
h.length && (d.each(b, function(b, c) {
var e = d.inArray(c, a);
e > -1 && i.push(a.splice(e, 1)[0]);
}), i.length && (this._bind(h, i, function(a) {
var b = this.rendered ? this.tooltip[0].offsetWidth > 0 : !1;
(b ? g : f).call(this, a);
}), c = c.not(h), e = e.not(h))), this._bind(c, a, f), this._bind(e, b, g);
}, y._assignInitialEvents = function(a) {
function b(a) {
return this.disabled || this.destroyed ? D : (this.cache.event = a && d.event.fix(a), 
this.cache.target = a && d(a.target), clearTimeout(this.timers.show), void (this.timers.show = l.call(this, function() {
this.render("object" == typeof a || c.show.ready);
}, c.prerender ? 0 : c.show.delay)));
}
var c = this.options, e = c.show.target, f = c.hide.target, g = c.show.event ? d.trim("" + c.show.event).split(" ") : [], h = c.hide.event ? d.trim("" + c.hide.event).split(" ") : [];
this._bind(this.elements.target, [ "remove", "removeqtip" ], function() {
this.destroy(!0);
}, "destroy"), /mouse(over|enter)/i.test(c.show.event) && !/mouse(out|leave)/i.test(c.hide.event) && h.push("mouseleave"), 
this._bind(e, "mousemove", function(a) {
this._storeMouse(a), this.cache.onTarget = C;
}), this._bindEvents(g, h, e, f, b, function() {
return this.timers ? void clearTimeout(this.timers.show) : D;
}), (c.show.ready || c.prerender) && b.call(this, a);
}, y._assignEvents = function() {
var c = this, e = this.options, f = e.position, g = this.tooltip, h = e.show.target, i = e.hide.target, j = f.container, k = f.viewport, l = d(b), q = d(a), r = e.show.event ? d.trim("" + e.show.event).split(" ") : [], s = e.hide.event ? d.trim("" + e.hide.event).split(" ") : [];
d.each(e.events, function(a, b) {
c._bind(g, "toggle" === a ? [ "tooltipshow", "tooltiphide" ] : [ "tooltip" + a ], b, null, g);
}), /mouse(out|leave)/i.test(e.hide.event) && "window" === e.hide.leave && this._bind(l, [ "mouseout", "blur" ], function(a) {
/select|option/.test(a.target.nodeName) || a.relatedTarget || this.hide(a);
}), e.hide.fixed ? i = i.add(g.addClass(X)) : /mouse(over|enter)/i.test(e.show.event) && this._bind(i, "mouseleave", function() {
clearTimeout(this.timers.show);
}), ("" + e.hide.event).indexOf("unfocus") > -1 && this._bind(j.closest("html"), [ "mousedown", "touchstart" ], function(a) {
var b = d(a.target), c = this.rendered && !this.tooltip.hasClass(_) && this.tooltip[0].offsetWidth > 0, e = b.parents(V).filter(this.tooltip[0]).length > 0;
b[0] === this.target[0] || b[0] === this.tooltip[0] || e || this.target.has(b[0]).length || !c || this.hide(a);
}), "number" == typeof e.hide.inactive && (this._bind(h, "qtip-" + this.id + "-inactive", o, "inactive"), 
this._bind(i.add(g), x.inactiveEvents, o)), this._bindEvents(r, s, h, i, m, n), 
this._bind(h.add(g), "mousemove", function(a) {
if ("number" == typeof e.hide.distance) {
var b = this.cache.origin || {}, c = this.options.hide.distance, d = Math.abs;
(d(a.pageX - b.pageX) >= c || d(a.pageY - b.pageY) >= c) && this.hide(a);
}
this._storeMouse(a);
}), "mouse" === f.target && f.adjust.mouse && (e.hide.event && this._bind(h, [ "mouseenter", "mouseleave" ], function(a) {
return this.cache ? void (this.cache.onTarget = "mouseenter" === a.type) : D;
}), this._bind(l, "mousemove", function(a) {
this.rendered && this.cache.onTarget && !this.tooltip.hasClass(_) && this.tooltip[0].offsetWidth > 0 && this.reposition(a);
})), (f.adjust.resize || k.length) && this._bind(d.event.special.resize ? k : q, "resize", p), 
f.adjust.scroll && this._bind(q.add(f.container), "scroll", p);
}, y._unassignEvents = function() {
var c = this.options, e = c.show.target, f = c.hide.target, g = d.grep([ this.elements.target[0], this.rendered && this.tooltip[0], c.position.container[0], c.position.viewport[0], c.position.container.closest("html")[0], a, b ], function(a) {
return "object" == typeof a;
});
e && e.toArray && (g = g.concat(e.toArray())), f && f.toArray && (g = g.concat(f.toArray())), 
this._unbind(g)._unbind(g, "destroy")._unbind(g, "inactive");
}, d(function() {
q(V, [ "mouseenter", "mouseleave" ], function(a) {
var b = "mouseenter" === a.type, c = d(a.currentTarget), e = d(a.relatedTarget || a.target), f = this.options;
b ? (this.focus(a), c.hasClass(X) && !c.hasClass(_) && clearTimeout(this.timers.hide)) : "mouse" === f.position.target && f.position.adjust.mouse && f.hide.event && f.show.target && !e.closest(f.show.target[0]).length && this.hide(a), 
c.toggleClass($, b);
}), q("[" + T + "]", W, o);
}), x = d.fn.qtip = function(a, b, e) {
var f = ("" + a).toLowerCase(), g = E, i = d.makeArray(arguments).slice(1), j = i[i.length - 1], k = this[0] ? d.data(this[0], R) : E;
return !arguments.length && k || "api" === f ? k : "string" == typeof a ? (this.each(function() {
var a = d.data(this, R);
if (!a) return C;
if (j && j.timeStamp && (a.cache.event = j), !b || "option" !== f && "options" !== f) a[f] && a[f].apply(a, i); else {
if (e === c && !d.isPlainObject(b)) return g = a.get(b), D;
a.set(b, e);
}
}), g !== E ? g : this) : "object" != typeof a && arguments.length ? void 0 : (k = h(d.extend(C, {}, a)), 
this.each(function(a) {
var b, c;
return c = d.isArray(k.id) ? k.id[a] : k.id, c = !c || c === D || c.length < 1 || x.api[c] ? x.nextid++ : c, 
b = r(d(this), c, k), b === D ? C : (x.api[c] = b, d.each(Q, function() {
"initialize" === this.initialize && this(b);
}), void b._assignInitialEvents(j));
}));
}, d.qtip = e, x.api = {}, d.each({
attr: function(a, b) {
if (this.length) {
var c = this[0], e = "title", f = d.data(c, "qtip");
if (a === e && f && f.options && "object" == typeof f && "object" == typeof f.options && f.options.suppress) return arguments.length < 2 ? d.attr(c, ba) : (f && f.options.content.attr === e && f.cache.attr && f.set("content.text", b), 
this.attr(ba, b));
}
return d.fn["attr" + aa].apply(this, arguments);
},
clone: function(a) {
var b = d.fn["clone" + aa].apply(this, arguments);
return a || b.filter("[" + ba + "]").attr("title", function() {
return d.attr(this, ba);
}).removeAttr(ba), b;
}
}, function(a, b) {
if (!b || d.fn[a + aa]) return C;
var c = d.fn[a + aa] = d.fn[a];
d.fn[a] = function() {
return b.apply(this, arguments) || c.apply(this, arguments);
};
}), d.ui || (d["cleanData" + aa] = d.cleanData, d.cleanData = function(a) {
for (var b, c = 0; (b = d(a[c])).length; c++) if (b.attr(S)) try {
b.triggerHandler("removeqtip");
} catch (e) {}
d["cleanData" + aa].apply(this, arguments);
}), x.version = "3.0.3", x.nextid = 0, x.inactiveEvents = W, x.zindex = 15e3, x.defaults = {
prerender: D,
id: D,
overwrite: C,
suppress: C,
content: {
text: C,
attr: "title",
title: D,
button: D
},
position: {
my: "top left",
at: "bottom right",
target: D,
container: D,
viewport: D,
adjust: {
x: 0,
y: 0,
mouse: C,
scroll: C,
resize: C,
method: "flipinvert flipinvert"
},
effect: function(a, b) {
d(this).animate(b, {
duration: 200,
queue: D
});
}
},
show: {
target: D,
event: "mouseenter",
effect: C,
delay: 90,
solo: D,
ready: D,
autofocus: D
},
hide: {
target: D,
event: "mouseleave",
effect: C,
delay: 0,
fixed: D,
inactive: D,
leave: "window",
distance: D
},
style: {
classes: "",
widget: D,
width: D,
height: D,
def: C
},
events: {
render: E,
move: E,
show: E,
hide: E,
toggle: E,
visible: E,
hidden: E,
focus: E,
blur: E
}
};
var ga, ha, ia, ja, ka, la = "margin", ma = "border", na = "color", oa = "background-color", pa = "transparent", qa = " !important", ra = !!b.createElement("canvas").getContext, sa = /rgba?\(0, 0, 0(, 0)?\)|transparent|#123456/i, ta = {}, ua = [ "Webkit", "O", "Moz", "ms" ];
ra ? (ja = a.devicePixelRatio || 1, ka = function() {
var a = b.createElement("canvas").getContext("2d");
return a.backingStorePixelRatio || a.webkitBackingStorePixelRatio || a.mozBackingStorePixelRatio || a.msBackingStorePixelRatio || a.oBackingStorePixelRatio || 1;
}(), ia = ja / ka) : ha = function(a, b, c) {
return "<qtipvml:" + a + ' xmlns="urn:schemas-microsoft.com:vml" class="qtip-vml" ' + (b || "") + ' style="behavior: url(#default#VML); ' + (c || "") + '" />';
}, d.extend(v.prototype, {
init: function(a) {
var b, c;
c = this.element = a.elements.tip = d("<div />", {
class: R + "-tip"
}).prependTo(a.tooltip), ra ? (b = d("<canvas />").appendTo(this.element)[0].getContext("2d"), 
b.lineJoin = "miter", b.miterLimit = 1e5, b.save()) : (b = ha("shape", 'coordorigin="0,0"', "position:absolute;"), 
this.element.html(b + b), a._bind(d("*", c).add(c), [ "click", "mousedown" ], function(a) {
a.stopPropagation();
}, this._ns)), a._bind(a.tooltip, "tooltipmove", this.reposition, this._ns, this), 
this.create();
},
_swapDimensions: function() {
this.size[0] = this.options.height, this.size[1] = this.options.width;
},
_resetDimensions: function() {
this.size[0] = this.options.width, this.size[1] = this.options.height;
},
_useTitle: function(a) {
var b = this.qtip.elements.titlebar;
return b && (a.y === J || a.y === N && this.element.position().top + this.size[1] / 2 + this.options.offset < b.outerHeight(C));
},
_parseCorner: function(a) {
var b = this.qtip.options.position.my;
return a === D || b === D ? a = D : a === C ? a = new z(b.string()) : a.string || (a = new z(a), 
a.fixed = C), a;
},
_parseWidth: function(a, b, c) {
var d = this.qtip.elements, e = ma + s(b) + "Width";
return (c ? u(c, e) : u(d.content, e) || u(this._useTitle(a) && d.titlebar || d.content, e) || u(d.tooltip, e)) || 0;
},
_parseRadius: function(a) {
var b = this.qtip.elements, c = ma + s(a.y) + s(a.x) + "Radius";
return ca.ie < 9 ? 0 : u(this._useTitle(a) && b.titlebar || b.content, c) || u(b.tooltip, c) || 0;
},
_invalidColour: function(a, b, c) {
var d = a.css(b);
return !d || c && d === a.css(c) || sa.test(d) ? D : d;
},
_parseColours: function(a) {
var b = this.qtip.elements, c = this.element.css("cssText", ""), e = ma + s(a[a.precedance]) + s(na), f = this._useTitle(a) && b.titlebar || b.content, g = this._invalidColour, h = [];
return h[0] = g(c, oa) || g(f, oa) || g(b.content, oa) || g(b.tooltip, oa) || c.css(oa), 
h[1] = g(c, e, na) || g(f, e, na) || g(b.content, e, na) || g(b.tooltip, e, na) || b.tooltip.css(e), 
d("*", c).add(c).css("cssText", oa + ":" + pa + qa + ";" + ma + ":0" + qa + ";"), 
h;
},
_calculateSize: function(a) {
var b, c, d, e = a.precedance === G, f = this.options.width, g = this.options.height, h = "c" === a.abbrev(), i = (e ? f : g) * (h ? .5 : 1), j = Math.pow, k = Math.round, l = Math.sqrt(j(i, 2) + j(g, 2)), m = [ this.border / i * l, this.border / g * l ];
return m[2] = Math.sqrt(j(m[0], 2) - j(this.border, 2)), m[3] = Math.sqrt(j(m[1], 2) - j(this.border, 2)), 
b = l + m[2] + m[3] + (h ? 0 : m[0]), c = b / l, d = [ k(c * f), k(c * g) ], e ? d : d.reverse();
},
_calculateTip: function(a, b, c) {
c = c || 1, b = b || this.size;
var d = b[0] * c, e = b[1] * c, f = Math.ceil(d / 2), g = Math.ceil(e / 2), h = {
br: [ 0, 0, d, e, d, 0 ],
bl: [ 0, 0, d, 0, 0, e ],
tr: [ 0, e, d, 0, d, e ],
tl: [ 0, 0, 0, e, d, e ],
tc: [ 0, e, f, 0, d, e ],
bc: [ 0, 0, d, 0, f, e ],
rc: [ 0, 0, d, g, 0, e ],
lc: [ d, 0, d, e, 0, g ]
};
return h.lt = h.br, h.rt = h.bl, h.lb = h.tr, h.rb = h.tl, h[a.abbrev()];
},
_drawCoords: function(a, b) {
a.beginPath(), a.moveTo(b[0], b[1]), a.lineTo(b[2], b[3]), a.lineTo(b[4], b[5]), 
a.closePath();
},
create: function() {
var a = this.corner = (ra || ca.ie) && this._parseCorner(this.options.corner);
return this.enabled = !!this.corner && "c" !== this.corner.abbrev(), this.enabled && (this.qtip.cache.corner = a.clone(), 
this.update()), this.element.toggle(this.enabled), this.corner;
},
update: function(b, c) {
if (!this.enabled) return this;
var e, f, g, h, i, j, k, l, m = this.qtip.elements, n = this.element, o = n.children(), p = this.options, q = this.size, r = p.mimic, s = Math.round;
b || (b = this.qtip.cache.corner || this.corner), r === D ? r = b : (r = new z(r), 
r.precedance = b.precedance, "inherit" === r.x ? r.x = b.x : "inherit" === r.y ? r.y = b.y : r.x === r.y && (r[b.precedance] = b[b.precedance])), 
f = r.precedance, b.precedance === F ? this._swapDimensions() : this._resetDimensions(), 
e = this.color = this._parseColours(b), e[1] !== pa ? (l = this.border = this._parseWidth(b, b[b.precedance]), 
p.border && 1 > l && !sa.test(e[1]) && (e[0] = e[1]), this.border = l = p.border !== C ? p.border : l) : this.border = l = 0, 
k = this.size = this._calculateSize(b), n.css({
width: k[0],
height: k[1],
lineHeight: k[1] + "px"
}), j = b.precedance === G ? [ s(r.x === K ? l : r.x === M ? k[0] - q[0] - l : (k[0] - q[0]) / 2), s(r.y === J ? k[1] - q[1] : 0) ] : [ s(r.x === K ? k[0] - q[0] : 0), s(r.y === J ? l : r.y === L ? k[1] - q[1] - l : (k[1] - q[1]) / 2) ], 
ra ? (g = o[0].getContext("2d"), g.restore(), g.save(), g.clearRect(0, 0, 6e3, 6e3), 
h = this._calculateTip(r, q, ia), i = this._calculateTip(r, this.size, ia), o.attr(H, k[0] * ia).attr(I, k[1] * ia), 
o.css(H, k[0]).css(I, k[1]), this._drawCoords(g, i), g.fillStyle = e[1], g.fill(), 
g.translate(j[0] * ia, j[1] * ia), this._drawCoords(g, h), g.fillStyle = e[0], g.fill()) : (h = this._calculateTip(r), 
h = "m" + h[0] + "," + h[1] + " l" + h[2] + "," + h[3] + " " + h[4] + "," + h[5] + " xe", 
j[2] = l && /^(r|b)/i.test(b.string()) ? 8 === ca.ie ? 2 : 1 : 0, o.css({
coordsize: k[0] + l + " " + k[1] + l,
antialias: "" + (r.string().indexOf(N) > -1),
left: j[0] - j[2] * Number(f === F),
top: j[1] - j[2] * Number(f === G),
width: k[0] + l,
height: k[1] + l
}).each(function(a) {
var b = d(this);
b[b.prop ? "prop" : "attr"]({
coordsize: k[0] + l + " " + k[1] + l,
path: h,
fillcolor: e[0],
filled: !!a,
stroked: !a
}).toggle(!(!l && !a)), !a && b.html(ha("stroke", 'weight="' + 2 * l + 'px" color="' + e[1] + '" miterlimit="1000" joinstyle="miter"'));
})), a.opera && setTimeout(function() {
m.tip.css({
display: "inline-block",
visibility: "visible"
});
}, 1), c !== D && this.calculate(b, k);
},
calculate: function(a, b) {
if (!this.enabled) return D;
var c, e, f = this, g = this.qtip.elements, h = this.element, i = this.options.offset, j = {};
return a = a || this.corner, c = a.precedance, b = b || this._calculateSize(a), 
e = [ a.x, a.y ], c === F && e.reverse(), d.each(e, function(d, e) {
var h, k, l;
e === N ? (h = c === G ? K : J, j[h] = "50%", j[la + "-" + h] = -Math.round(b[c === G ? 0 : 1] / 2) + i) : (h = f._parseWidth(a, e, g.tooltip), 
k = f._parseWidth(a, e, g.content), l = f._parseRadius(a), j[e] = Math.max(-f.border, d ? k : i + (l > h ? l : -h)));
}), j[a[c]] -= b[c === F ? 0 : 1], h.css({
margin: "",
top: "",
bottom: "",
left: "",
right: ""
}).css(j), j;
},
reposition: function(a, b, d) {
function e(a, b, c, d, e) {
a === P && j.precedance === b && k[d] && j[c] !== N ? j.precedance = j.precedance === F ? G : F : a !== P && k[d] && (j[b] = j[b] === N ? k[d] > 0 ? d : e : j[b] === d ? e : d);
}
function f(a, b, e) {
j[a] === N ? p[la + "-" + b] = o[a] = g[la + "-" + b] - k[b] : (h = g[e] !== c ? [ k[b], -g[b] ] : [ -k[b], g[b] ], 
(o[a] = Math.max(h[0], h[1])) > h[0] && (d[b] -= k[b], o[b] = D), p[g[e] !== c ? e : b] = o[a]);
}
if (this.enabled) {
var g, h, i = b.cache, j = this.corner.clone(), k = d.adjusted, l = b.options.position.adjust.method.split(" "), m = l[0], n = l[1] || l[0], o = {
left: D,
top: D,
x: 0,
y: 0
}, p = {};
this.corner.fixed !== C && (e(m, F, G, K, M), e(n, G, F, J, L), j.string() === i.corner.string() && i.cornerTop === k.top && i.cornerLeft === k.left || this.update(j, D)), 
g = this.calculate(j), g.right !== c && (g.left = -g.right), g.bottom !== c && (g.top = -g.bottom), 
g.user = this.offset, o.left = m === P && !!k.left, o.left && f(F, K, M), o.top = n === P && !!k.top, 
o.top && f(G, J, L), this.element.css(p).toggle(!(o.x && o.y || j.x === N && o.y || j.y === N && o.x)), 
d.left -= g.left.charAt ? g.user : m !== P || o.top || !o.left && !o.top ? g.left + this.border : 0, 
d.top -= g.top.charAt ? g.user : n !== P || o.left || !o.left && !o.top ? g.top + this.border : 0, 
i.cornerLeft = k.left, i.cornerTop = k.top, i.corner = j.clone();
}
},
destroy: function() {
this.qtip._unbind(this.qtip.tooltip, this._ns), this.qtip.elements.tip && this.qtip.elements.tip.find("*").remove().end().remove();
}
}), ga = Q.tip = function(a) {
return new v(a, a.options.style.tip);
}, ga.initialize = "render", ga.sanitize = function(a) {
if (a.style && "tip" in a.style) {
var b = a.style.tip;
"object" != typeof b && (b = a.style.tip = {
corner: b
}), /string|boolean/i.test(typeof b.corner) || (b.corner = C);
}
}, A.tip = {
"^position.my|style.tip.(corner|mimic|border)$": function() {
this.create(), this.qtip.reposition();
},
"^style.tip.(height|width)$": function(a) {
this.size = [ a.width, a.height ], this.update(), this.qtip.reposition();
},
"^content.title|style.(classes|widget)$": function() {
this.update();
}
}, d.extend(C, x.defaults, {
style: {
tip: {
corner: C,
mimic: D,
width: 6,
height: 6,
border: C,
offset: 0
}
}
}), Q.viewport = function(c, d, e, f, g, h, i) {
function j(a, b, c, e, f, g, h, i, j) {
var k = d[f], s = u[a], t = v[a], w = c === P, x = s === f ? j : s === g ? -j : -j / 2, y = t === f ? i : t === g ? -i : -i / 2, z = q[f] + r[f] - (n ? 0 : m[f]), A = z - k, B = k + j - (h === H ? o : p) - z, C = x - (u.precedance === a || s === u[b] ? y : 0) - (t === N ? i / 2 : 0);
return w ? (C = (s === f ? 1 : -1) * x, d[f] += A > 0 ? A : B > 0 ? -B : 0, d[f] = Math.max(-m[f] + r[f], k - C, Math.min(Math.max(-m[f] + r[f] + (h === H ? o : p), k + C), d[f], "center" === s ? k - x : 1e9))) : (e *= c === O ? 2 : 0, 
A > 0 && (s !== f || B > 0) ? (d[f] -= C + e, l.invert(a, f)) : B > 0 && (s !== g || A > 0) && (d[f] -= (s === N ? -C : C) + e, 
l.invert(a, g)), d[f] < q[f] && -d[f] > B && (d[f] = k, l = u.clone())), d[f] - k;
}
var k, l, m, n, o, p, q, r, s = e.target, t = c.elements.tooltip, u = e.my, v = e.at, w = e.adjust, x = w.method.split(" "), y = x[0], z = x[1] || x[0], A = e.viewport, B = e.container, C = {
left: 0,
top: 0
};
return A.jquery && s[0] !== a && s[0] !== b.body && "none" !== w.method ? (m = B.offset() || C, 
n = "static" === B.css("position"), k = "fixed" === t.css("position"), o = A[0] === a ? A.width() : A.outerWidth(D), 
p = A[0] === a ? A.height() : A.outerHeight(D), q = {
left: k ? 0 : A.scrollLeft(),
top: k ? 0 : A.scrollTop()
}, r = A.offset() || C, "shift" === y && "shift" === z || (l = u.clone()), C = {
left: "none" !== y ? j(F, G, y, w.x, K, M, H, f, h) : 0,
top: "none" !== z ? j(G, F, z, w.y, J, L, I, g, i) : 0,
my: l
}) : C;
};
var va, wa, xa = "qtip-modal", ya = "." + xa;
wa = function() {
function a(a) {
if (d.expr[":"].focusable) return d.expr[":"].focusable;
var b, c, e, f = !isNaN(d.attr(a, "tabindex")), g = a.nodeName && a.nodeName.toLowerCase();
return "area" === g ? (b = a.parentNode, c = b.name, a.href && c && "map" === b.nodeName.toLowerCase() ? (e = d("img[usemap=#" + c + "]")[0], 
!!e && e.is(":visible")) : !1) : /input|select|textarea|button|object/.test(g) ? !a.disabled : "a" === g ? a.href || f : f;
}
function c(a) {
j.length < 1 && a.length ? a.not("body").blur() : j.first().focus();
}
function e(a) {
if (h.is(":visible")) {
var b, e = d(a.target), g = f.tooltip, i = e.closest(V);
b = i.length < 1 ? D : parseInt(i[0].style.zIndex, 10) > parseInt(g[0].style.zIndex, 10), 
b || e.closest(V)[0] === g[0] || c(e);
}
}
var f, g, h, i = this, j = {};
d.extend(i, {
init: function() {
return h = i.elem = d("<div />", {
id: "qtip-overlay",
html: "<div></div>",
mousedown: function() {
return D;
}
}).hide(), d(b.body).bind("focusin" + ya, e), d(b).bind("keydown" + ya, function(a) {
f && f.options.show.modal.escape && 27 === a.keyCode && f.hide(a);
}), h.bind("click" + ya, function(a) {
f && f.options.show.modal.blur && f.hide(a);
}), i;
},
update: function(b) {
f = b, j = b.options.show.modal.stealfocus !== D ? b.tooltip.find("*").filter(function() {
return a(this);
}) : [];
},
toggle: function(a, e, j) {
var k = a.tooltip, l = a.options.show.modal, m = l.effect, n = e ? "show" : "hide", o = h.is(":visible"), p = d(ya).filter(":visible:not(:animated)").not(k);
return i.update(a), e && l.stealfocus !== D && c(d(":focus")), h.toggleClass("blurs", l.blur), 
e && h.appendTo(b.body), h.is(":animated") && o === e && g !== D || !e && p.length ? i : (h.stop(C, D), 
d.isFunction(m) ? m.call(h, e) : m === D ? h[n]() : h.fadeTo(parseInt(j, 10) || 90, e ? 1 : 0, function() {
e || h.hide();
}), e || h.queue(function(a) {
h.css({
left: "",
top: ""
}), d(ya).length || h.detach(), a();
}), g = e, f.destroyed && (f = E), i);
}
}), i.init();
}, wa = new wa(), d.extend(w.prototype, {
init: function(a) {
var b = a.tooltip;
return this.options.on ? (a.elements.overlay = wa.elem, b.addClass(xa).css("z-index", x.modal_zindex + d(ya).length), 
a._bind(b, [ "tooltipshow", "tooltiphide" ], function(a, c, e) {
var f = a.originalEvent;
if (a.target === b[0]) if (f && "tooltiphide" === a.type && /mouse(leave|enter)/.test(f.type) && d(f.relatedTarget).closest(wa.elem[0]).length) try {
a.preventDefault();
} catch (g) {} else (!f || f && "tooltipsolo" !== f.type) && this.toggle(a, "tooltipshow" === a.type, e);
}, this._ns, this), a._bind(b, "tooltipfocus", function(a, c) {
if (!a.isDefaultPrevented() && a.target === b[0]) {
var e = d(ya), f = x.modal_zindex + e.length, g = parseInt(b[0].style.zIndex, 10);
wa.elem[0].style.zIndex = f - 1, e.each(function() {
this.style.zIndex > g && (this.style.zIndex -= 1);
}), e.filter("." + Z).qtip("blur", a.originalEvent), b.addClass(Z)[0].style.zIndex = f, 
wa.update(c);
try {
a.preventDefault();
} catch (h) {}
}
}, this._ns, this), void a._bind(b, "tooltiphide", function(a) {
a.target === b[0] && d(ya).filter(":visible").not(b).last().qtip("focus", a);
}, this._ns, this)) : this;
},
toggle: function(a, b, c) {
return a && a.isDefaultPrevented() ? this : void wa.toggle(this.qtip, !!b, c);
},
destroy: function() {
this.qtip.tooltip.removeClass(xa), this.qtip._unbind(this.qtip.tooltip, this._ns), 
wa.toggle(this.qtip, D), delete this.qtip.elements.overlay;
}
}), va = Q.modal = function(a) {
return new w(a, a.options.show.modal);
}, va.sanitize = function(a) {
a.show && ("object" != typeof a.show.modal ? a.show.modal = {
on: !!a.show.modal
} : "undefined" == typeof a.show.modal.on && (a.show.modal.on = C));
}, x.modal_zindex = x.zindex - 200, va.initialize = "render", A.modal = {
"^show.modal.(on|blur)$": function() {
this.destroy(), this.init(), this.qtip.elems.overlay.toggle(this.qtip.tooltip[0].offsetWidth > 0);
}
}, d.extend(C, x.defaults, {
show: {
modal: {
on: D,
effect: C,
blur: C,
stealfocus: C,
escape: C
}
}
});
});
}(window, document);

var QtipModalScalingSupport = function() {
function QtipModalScalingSupport() {}
QtipModalScalingSupport._modalSetContent = function($qTipWindow, contentHtml, qtipModalOptions) {
var $qTipContent = $qTipWindow.find(".qtip-content");
$qTipContent.html(contentHtml);
$qTipContent.scrollTop(0);
QtipModals._initDictionaryInnerSearchAndAutocompleteOnContentLoaded($qTipWindow);
qtipModalOptions.onDocumentReady($qTipWindow);
};
QtipModalScalingSupport._modalAjaxLoadContent = function($qTipWindow, url, qtipModalOptions) {
$.get(url).done(function(contentHtml) {
QtipModalScalingSupport._modalSetContent($qTipWindow, contentHtml, qtipModalOptions);
}).fail(function() {
throw new Error("Żądanie Ajax dla adresu " + url + " nie powiodło się.");
});
};
QtipModalScalingSupport._resize = function($qTipWindow) {
$("body").css("position", "relative");
var $qTipContent = $qTipWindow.find(".qtip-content");
var width = $(window).width();
var height = $(window).height();
if ($qTipWindow.hasClass("qtipOverEntireViewport")) {
width = Math.min(width, 992);
height -= 2;
} else {
var $dummy = $("<div>");
$dummy.html($qTipContent.html());
$dummy.css({
position: "fixed",
opacity: 0,
width: "100%",
height: "100%"
});
$("body").append($dummy);
var $content = $dummy.children().first();
$content.css("display", "inline-block");
width = Math.min(width - 50, $content.width());
height = Math.min(height - 50, $content.height());
$dummy.css("max-width", width + "px");
var _height = Math.min(height, $content.height());
if (_height !== height) {
height = _height;
} else {
$dummy.css("max-width", "auto");
$dummy.css("max-height", height + "px");
width = Math.min(width, $content.width());
}
height += 2 * ($content.position() === undefined ? 0 : $content.position().top);
height += parseInt($(".qtip-content").css("padding-top")) * 2;
if ($dummy.find(".VideoPlayerBox").length > 0) {
var maxVideoWidth = height / .625;
if (width > maxVideoWidth) {
width = maxVideoWidth;
}
}
width = Math.max(width, $(window).width() > 400 ? 400 : $(window).width());
$dummy.remove();
}
$qTipContent.css({
width: width + "px",
height: height + "px"
});
$qTipWindow.qtip("reposition");
};
QtipModalScalingSupport.getDebouncedWindowResizeHandler = function() {
return _.debounce(QtipModalScalingSupport._resize, 200);
};
QtipModalScalingSupport._scale = function($qTipWindow) {
$qTipWindow.css("max-width", Math.min($(window).width() - 60, 500) + "px");
$qTipWindow.qtip("reposition");
};
QtipModalScalingSupport.getDebouncedWindowScaleHandler = function() {
return _.debounce(QtipModalScalingSupport._scale, 200);
};
return QtipModalScalingSupport;
}();

var QtipModalOptions = function() {
function QtipModalOptions() {
this.scaleToContentsSize = false;
this.cssClass = "";
this.addToBrowserHistory = false;
this.showCloseButton = true;
this.onDocumentReady = function($qTipWindow) {};
this.onRender = function(eventFromQtip, api) {};
this.onHide = function(eventFromQtip, api) {};
}
QtipModalOptions.prototype.getHtmlClassWithViewportSizeClasses = function() {
return this.cssClass + (this.scaleToContentsSize ? "" : " qtipOverEntireViewport");
};
return QtipModalOptions;
}();

var QtipModals = function() {
function QtipModals() {}
QtipModals._addToBrowserHistory = function(url, qtipModalOptions) {
if (qtipModalOptions.addToBrowserHistory) {
var locationArr = window.location.href.split(/#/);
BrowserHistory.pushQtipState(url, locationArr[0] + "#" + url);
}
};
QtipModals._restoreBrowserHistoryLocationBeforePopup = function() {
var location = window.location.href;
if (Strings.contains(location, "popupmode=etutor")) {
var locationArr = location.split(/#/);
BrowserHistory.pushQtipState(locationArr[0], locationArr[0]);
}
};
QtipModals.isModalPopupOpen = function() {
return $("." + QtipModals.QTIP_POPUP_MODAL_CLASS).length > 0;
};
QtipModals.hideQtipModalsAndTooltips = function() {
$(".qtip").qtip("hide");
};
QtipModals.getCurrentQtipModal = function() {
return $("." + QtipModals.QTIP_POPUP_MODAL_CLASS).first();
};
QtipModals.showModalForUrlFullscreen = function(pageUrl) {
var qtipModalOptions = new QtipModalOptions();
QtipModals.showModalForUrlWithOptions(pageUrl, qtipModalOptions);
};
QtipModals.showModalForUrlDynamicallyScaling = function(pageUrl) {
var qtipModalOptions = new QtipModalOptions();
qtipModalOptions.scaleToContentsSize = true;
QtipModals.showModalForUrlWithOptions(pageUrl, qtipModalOptions);
};
QtipModals.showModalForImg = function(imgUrl) {
var html = '<img src="' + imgUrl + '" width="100%" style="max-width: 800px">';
var qtipModalOptions = new QtipModalOptions();
qtipModalOptions.scaleToContentsSize = true;
QtipModals._popupModal(html, qtipModalOptions);
};
QtipModals.showModalForUrlWithOptions = function(pageUrl, qtipModalOptions, addNextToBrowserHistory) {
if (addNextToBrowserHistory === void 0) {
addNextToBrowserHistory = false;
}
$.get({
url: pageUrl
}).done(function(contentsHtml) {
QtipModals._addToBrowserHistory(pageUrl, qtipModalOptions);
if (addNextToBrowserHistory) {
qtipModalOptions.addToBrowserHistory = true;
}
QtipModals._popupModal(contentsHtml, qtipModalOptions);
}).fail(function() {
QtipAlertsAndConfirmations.popupAlert('Wystąpił błąd', 'Nie udało się załadować strony. Spróbuj ponownie później.');
});
};
QtipModals.showModalPopupWithHtmlFullscreen = function(contentsHtml) {
var qtipModalOptions = new QtipModalOptions();
return QtipModals._popupModal(contentsHtml, qtipModalOptions);
};
QtipModals.showModalPopupWithHtmlDynamicallyScaling = function(contentsHtml) {
var qtipModalOptions = new QtipModalOptions();
qtipModalOptions.scaleToContentsSize = true;
return QtipModals._popupModal(contentsHtml, qtipModalOptions);
};
QtipModals._popupModal = function(contentsHtml, qtipModalOptions) {
QtipModals.pausedCauseQtipModalOpen = SoundPlayer.pause();
var $qTipWindow = $("." + QtipModals.QTIP_POPUP_MODAL_CLASS);
if ($qTipWindow.length !== 0) {
QtipModalScalingSupport._modalSetContent($qTipWindow, contentsHtml, qtipModalOptions);
return;
}
var bodyOverflow = $("body").css("overflow");
var bodyPosition = $("body").css("position");
var resizeDebounced = QtipModalScalingSupport.getDebouncedWindowResizeHandler();
var $popup = $("<div />").qtip({
content: {
text: contentsHtml,
title: false,
button: qtipModalOptions.showCloseButton ? $('<a class="close-button"></a>') : ""
},
position: {
my: "center",
at: "center",
target: $(window),
adjust: {
y: 0,
mouse: false,
scroll: false,
resize: false
}
},
show: {
solo: true,
ready: true,
modal: {
on: true,
blur: true
}
},
hide: false,
events: {
render: function(eventFromQtip, api) {
var $qTipWindow = $(this);
var $qTipContent = $qTipWindow.find(".qtip-content");
$qTipContent.on("click", "a", function(event) {
var $link = $(this);
if (!$link.attr("href")) {
Logger.logErrorMessage("Zignorowano kliknięcie linku bez ustawionego atrybutu href.");
return;
}
if ($link.attr("target") === "_blank") {
return;
}
if (Strings.startsWithAny($link.attr("href"), [ "#" ]) && $link.attr("href").length > 1) {
event.preventDefault();
event.stopPropagation();
var $qTipContent = $qTipWindow.find(".qtip-content");
var anchor = $('a[name="' + $link.attr("href").substr(1) + '"]').first();
if (anchor.length) {
$qTipContent.animate({
scrollTop: anchor.offset().top
}, 500);
}
return;
}
if (Strings.startsWithAny($link.attr("href"), [ "#", "javascript:" ])) {
return;
}
if ($link.attr("target") === "_self") {
api.hide();
return;
}
event.preventDefault();
event.stopPropagation();
var url = $(this).attr("href");
QtipModals._addToBrowserHistory(url, qtipModalOptions);
QtipModalScalingSupport._modalAjaxLoadContent($qTipWindow, url, qtipModalOptions);
});
$qTipContent.on("submit", "form", function(event) {
var $form = $(this);
if ($form.attr("target") == "_self") {
return true;
}
Events.stopPropagationAndPreventDefault(event);
if ($form.hasClass(QtipModals.DIKI_MODAL_SEARCH_FORM_CLASS)) {
var searchUrl = DikiDictionary.getSearchUrlFor($form.find(QtipModals.DIKI_MODAL_SEARCH_FIELD_IN_FORM_SELECTOR).val());
QtipModals._addToBrowserHistory(searchUrl, qtipModalOptions);
QtipModalScalingSupport._modalAjaxLoadContent($qTipWindow, searchUrl, qtipModalOptions);
return;
}
$.ajax($form.attr("action"), {
method: $form.attr("method") || "post",
data: $form.serializeArray()
}).done(function(resultHtml) {
QtipModalScalingSupport._modalSetContent($qTipWindow, resultHtml, qtipModalOptions);
});
});
var modalWindow = $(this);
$(window).on("resized", function() {
resizeDebounced(modalWindow);
});
QtipModals._initDictionaryInnerSearchAndAutocompleteOnContentLoaded($qTipWindow);
qtipModalOptions.onRender(eventFromQtip, api);
qtipModalOptions.onDocumentReady(eventFromQtip, api);
},
show: function(eventFromQtip, api) {
var modalWindow = $(this);
QtipModalScalingSupport._resize(modalWindow);
_.defer(function() {
$("body").css("overflow", "hidden");
});
},
visible: function(eventFromQtip, api) {
if ($("body").hasClass("clearSearchForIosEnabled")) {
$('input[type="search"]:not(clear_input)').clearSearch();
}
},
hide: function(eventFromQtip, api) {
if (QtipModals.pausedCauseQtipModalOpen) {
SoundPlayer.resume();
}
qtipModalOptions.onHide(eventFromQtip, api);
api.destroy();
$("body").css("overflow", bodyOverflow);
$("body").css("position", bodyPosition);
QtipModals._restoreBrowserHistoryLocationBeforePopup();
},
move: function(eventFromQtip, api) {
if (eventFromQtip.originalEvent) {
resizeDebounced($(this));
}
}
},
style: {
classes: QtipModals.QTIP_POPUP_MODAL_CLASS + " " + qtipModalOptions.getHtmlClassWithViewportSizeClasses()
}
});
return $popup;
};
QtipModals._initDictionaryInnerSearchAndAutocompleteOnContentLoaded = function($qTipWindow) {
var $dikiSearchForm = $qTipWindow.find("form." + QtipModals.DIKI_MODAL_SEARCH_FORM_CLASS);
var $searchQueryInput = $dikiSearchForm.find(QtipModals.DIKI_MODAL_SEARCH_FIELD_IN_FORM_SELECTOR);
DikiDictionary.init(true);
DikiDictionary.initAutocompleteForSearchField($searchQueryInput, $qTipWindow.find(".autocompleteResults"));
};
QtipModals.QTIP_POPUP_MODAL_CLASS = "qTipPopupModal";
QtipModals.DEFAULT_OK_BUTTON_TEXT = "Potwierdź";
QtipModals.DEFAULT_CANCEL_BUTTON_TEXT = "Anuluj";
QtipModals.DEFAULT_CLOSE_BUTTON_TEXT = "Zamknij";
QtipModals.DIKI_MODAL_SEARCH_FORM_CLASS = "dikibodymodal";
QtipModals.DIKI_MODAL_SEARCH_FIELD_IN_FORM_SELECTOR = "input.dikiSearchInputField";
QtipModals.pausedCauseQtipModalOpen = false;
return QtipModals;
}();

var QtipAlertsAndConfirmations = function() {
function QtipAlertsAndConfirmations() {}
QtipAlertsAndConfirmations.popupAlert = function(titleText, contentsHtmlOrJQuery, qtipAlertOptions) {
var $content, $contentContainer = $("<div>");
if (contentsHtmlOrJQuery instanceof jQuery) {
$content = $('<div class="qTipContent">').append(contentsHtmlOrJQuery);
} else {
$content = $('<div class="qTipContentText">').append($("<span>").html(contentsHtmlOrJQuery));
}
$contentContainer.append($content);
var $buttonContainer = $('<div class="qTipContentButtons">');
$contentContainer.append($buttonContainer);
var $closeButton = $("<button>").addClass("qTipCloseButton").text(QtipModals.DEFAULT_CLOSE_BUTTON_TEXT);
$buttonContainer.append($closeButton);
var $popup = $("<div />").qtip({
content: {
text: $contentContainer,
title: titleText,
button: true
},
position: {
my: "center",
at: "center",
target: $(window)
},
show: {
solo: true,
ready: true,
modal: {
on: true,
blur: false
}
},
hide: false,
events: {
render: function(eventFromQtip, api) {
var modalWindow = $(this);
$(window).on("resized", function() {
var scaleDebounced = QtipModalScalingSupport.getDebouncedWindowScaleHandler();
scaleDebounced(modalWindow);
});
$closeButton.click(function(e) {
api.hide(e);
});
if (qtipAlertOptions && typeof qtipAlertOptions.onRender === "function") {
qtipAlertOptions.onRender(eventFromQtip, api);
}
},
show: function(eventFromQtip, api) {
var modalWindow = $(this);
QtipModalScalingSupport._scale(modalWindow);
},
hide: function(eventFromQtip, api) {
api.destroy();
},
move: function(eventFromQtip, api) {}
},
style: {
classes: "qTipPopup"
}
});
return $popup;
};
QtipAlertsAndConfirmations.popupDialog = function(payload, qtipDialogOptions) {
var $content, $contentContainer = $("<div>");
if (payload instanceof jQuery) {
$content = $('<div class="qTipContent">').append(payload);
} else {
$content = $('<div class="qTipContentText">').append($("<span>").text(payload));
}
$contentContainer.append($content);
var $buttonContainer = $('<div class="qTipContentButtons">');
$contentContainer.append($buttonContainer);
var $cancelButton = $("<button>").addClass("qTipCloseButton").text(qtipDialogOptions.cancelButtonText || QtipModals.DEFAULT_CANCEL_BUTTON_TEXT);
var $okButton = $("<button>").addClass("qTipOkButton").text(qtipDialogOptions.okButtonText || QtipModals.DEFAULT_OK_BUTTON_TEXT);
$buttonContainer.append($cancelButton);
$buttonContainer.append($okButton);
var $popup = $("<div />").qtip({
content: {
text: $contentContainer,
title: qtipDialogOptions.title,
button: true
},
position: {
my: "center",
at: "center",
target: $(window)
},
show: {
solo: true,
ready: true,
modal: {
on: true,
blur: false
}
},
hide: false,
events: {
show: function(eventFromQtip, api) {
var modalWindow = $(this);
QtipModalScalingSupport._scale(modalWindow);
},
render: function(eventFromQtip, api) {
var modalWindow = $(this);
$(window).on("resized", function() {
var scaleDebounced = QtipModalScalingSupport.getDebouncedWindowScaleHandler();
scaleDebounced(modalWindow);
});
if (typeof qtipDialogOptions.onRender === "function") {
qtipDialogOptions.onRender(eventFromQtip, api);
}
$okButton.on("click", function(e) {
if (typeof qtipDialogOptions.okHandler === "function") {
qtipDialogOptions.okHandler(eventFromQtip, api);
}
api.hide(e);
});
$cancelButton.on("click", function(e) {
if (typeof qtipDialogOptions.cancelHandler === "function") {
qtipDialogOptions.cancelHandler(eventFromQtip, api);
}
api.hide(e);
});
$(this).find(".qtip-close.qtip-icon").on("click", function(e) {
if (typeof qtipDialogOptions.cancelHandler === "function") {
qtipDialogOptions.cancelHandler(eventFromQtip, api);
}
});
},
hide: function(eventFromQtip, api) {
if (typeof qtipDialogOptions.onClose === "function") {
qtipDialogOptions.onClose(eventFromQtip, api);
}
api.destroy();
},
move: function(eventFromQtip, api) {}
},
style: {
classes: "qTipPopup"
}
});
return $popup;
};
return QtipAlertsAndConfirmations;
}();

var QtipTooltips = function() {
function QtipTooltips() {}
QtipTooltips.assignQtipTooltips = function() {
QtipTooltips.assignQtipTooltipsOnDesktopBrowsers();
QtipTooltips.assignQtipHelpTooltips();
};
QtipTooltips.assignQtipTooltipsOnDesktopBrowsers = function() {
if (!BrowserUtils.isDesktop()) {
return;
}
$("a[title]").not(".helpTooltip").add(".tooltip[title]").each(function(index, tooltipSource) {
if ($(tooltipSource).data("hasqtip")) {
return;
}
$(tooltipSource).qtip({
position: {
my: "top center",
at: "bottom center",
viewport: $("#contentWrapper"),
adjust: {
method: "shift flip",
mouse: false,
y: 5
}
}
});
});
};
QtipTooltips.assignQtipHelpTooltips = function() {
$(".helpTooltip").each(function(index, tooltipSource) {
$(tooltipSource).qtip({
position: {
my: "top center",
at: "bottom center",
viewport: $("body"),
adjust: {
method: "shift none"
}
},
show: {
solo: true,
event: "mouseenter click",
target: $(tooltipSource)
},
hide: {
event: "unfocus click",
target: $(tooltipSource)
}
});
});
};
QtipTooltips.removeAllDisplayedTooltipsAndBindToNewElements = function() {
QtipModals.hideQtipModalsAndTooltips();
QtipTooltips.assignQtipTooltips();
};
return QtipTooltips;
}();

$(function() {
QtipTooltips.assignQtipTooltips();
});

$(document).on("click", "a.openInQtipModalFullscreen", function(event) {
event.preventDefault();
QtipModals.showModalForUrlFullscreen($(this).attr("href"));
});

$(document).on("click", "a.openInQtipModalDynamicallyScaling", function(event) {
event.preventDefault();
QtipModals.showModalForUrlDynamicallyScaling($(this).attr("href"));
});

$(document).on("click", "a.openImgInQtipModal", function(event) {
event.preventDefault();
QtipModals.showModalForImg($(this).attr("href"));
});

$(document).on("click", ".qtipModalClose", function(event) {
event.preventDefault();
QtipModals.hideQtipModalsAndTooltips();
});

(function() {
"use strict";
var round = function(number, precision) {
return Math.round(number * (10 * precision)) / (10 * precision);
};
var HowlerGlobal = function() {
this.init();
};
HowlerGlobal.prototype = {
init: function() {
var self = this || Howler;
self._counter = 1e3;
self._html5AudioPool = [];
self.html5PoolSize = 10;
self._codecs = {};
self._howls = [];
self._muted = false;
self._volume = 1;
self._canPlayEvent = "canplaythrough";
self._navigator = typeof window !== "undefined" && window.navigator ? window.navigator : null;
self.masterGain = null;
self.noAudio = false;
self.usingWebAudio = true;
self.autoSuspend = true;
self.ctx = null;
self.autoUnlock = true;
self._setup();
return self;
},
volume: function(vol) {
var self = this || Howler;
vol = parseFloat(vol);
if (!self.ctx) {
setupAudioContext();
}
if (typeof vol !== "undefined" && vol >= 0 && vol <= 1) {
self._volume = vol;
if (self._muted) {
return self;
}
if (self.usingWebAudio) {
self.masterGain.gain.setValueAtTime(vol, Howler.ctx.currentTime);
}
for (var i = 0; i < self._howls.length; i++) {
if (!self._howls[i]._webAudio) {
var ids = self._howls[i]._getSoundIds();
for (var j = 0; j < ids.length; j++) {
var sound = self._howls[i]._soundById(ids[j]);
if (sound && sound._node) {
sound._node.volume = sound._volume * vol;
}
}
}
}
return self;
}
return self._volume;
},
mute: function(muted) {
var self = this || Howler;
if (!self.ctx) {
setupAudioContext();
}
self._muted = muted;
if (self.usingWebAudio) {
self.masterGain.gain.setValueAtTime(muted ? 0 : self._volume, Howler.ctx.currentTime);
}
for (var i = 0; i < self._howls.length; i++) {
if (!self._howls[i]._webAudio) {
var ids = self._howls[i]._getSoundIds();
for (var j = 0; j < ids.length; j++) {
var sound = self._howls[i]._soundById(ids[j]);
if (sound && sound._node) {
sound._node.muted = muted ? true : sound._muted;
}
}
}
}
return self;
},
unload: function() {
var self = this || Howler;
for (var i = self._howls.length - 1; i >= 0; i--) {
self._howls[i].unload();
}
if (self.usingWebAudio && self.ctx && typeof self.ctx.close !== "undefined") {
self.ctx.close();
self.ctx = null;
setupAudioContext();
}
return self;
},
codecs: function(ext) {
return (this || Howler)._codecs[ext.replace(/^x-/, "")];
},
_setup: function() {
var self = this || Howler;
self.state = self.ctx ? self.ctx.state || "running" : "running";
if (/iP(hone|od|ad)|Mac/.test(self._navigator && self._navigator.platform)) {} else {
self._autoSuspend();
}
if (!self.usingWebAudio) {
if (typeof Audio !== "undefined") {
try {
var test = new Audio();
if (typeof test.oncanplaythrough === "undefined") {
self._canPlayEvent = "canplay";
}
} catch (e) {
self.noAudio = true;
}
} else {
self.noAudio = true;
}
}
try {
var test = new Audio();
if (test.muted) {
self.noAudio = true;
}
} catch (e) {}
if (!self.noAudio) {
self._setupCodecs();
}
return self;
},
_setupCodecs: function() {
var self = this || Howler;
var audioTest = null;
try {
audioTest = typeof Audio !== "undefined" ? new Audio() : null;
} catch (err) {
return self;
}
if (!audioTest || typeof audioTest.canPlayType !== "function") {
return self;
}
var mpegTest = audioTest.canPlayType("audio/mpeg;").replace(/^no$/, "");
var checkOpera = self._navigator && self._navigator.userAgent.match(/OPR\/([0-6].)/g);
var isOldOpera = checkOpera && parseInt(checkOpera[0].split("/")[1], 10) < 33;
self._codecs = {
mp3: !!(!isOldOpera && (mpegTest || audioTest.canPlayType("audio/mp3;").replace(/^no$/, ""))),
mpeg: !!mpegTest,
opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
oga: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""),
aac: !!audioTest.canPlayType("audio/aac;").replace(/^no$/, ""),
caf: !!audioTest.canPlayType("audio/x-caf;").replace(/^no$/, ""),
m4a: !!(audioTest.canPlayType("audio/x-m4a;") || audioTest.canPlayType("audio/m4a;") || audioTest.canPlayType("audio/aac;")).replace(/^no$/, ""),
mp4: !!(audioTest.canPlayType("audio/x-mp4;") || audioTest.canPlayType("audio/mp4;") || audioTest.canPlayType("audio/aac;")).replace(/^no$/, ""),
weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ""),
webm: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ""),
dolby: !!audioTest.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ""),
flac: !!(audioTest.canPlayType("audio/x-flac;") || audioTest.canPlayType("audio/flac;")).replace(/^no$/, "")
};
return self;
},
_unlockAudio: function() {
var self = this || Howler;
var shouldUnlock = /iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk|Mobi|Chrome|Safari/i.test(self._navigator && self._navigator.userAgent);
if (self._audioUnlocked || !self.ctx || !shouldUnlock) {
return;
}
self._audioUnlocked = false;
self.autoUnlock = false;
if (!self._mobileUnloaded && self.ctx.sampleRate !== 44100) {
self._mobileUnloaded = true;
self.unload();
}
self._scratchBuffer = self.ctx.createBuffer(1, 1, 22050);
var unlock = function(e) {
for (var i = 0; i < self.html5PoolSize; i++) {
var audioNode = new Audio();
audioNode._unlocked = true;
self._releaseHtml5Audio(audioNode);
}
for (var i = 0; i < self._howls.length; i++) {
if (!self._howls[i]._webAudio) {
var ids = self._howls[i]._getSoundIds();
for (var j = 0; j < ids.length; j++) {
var sound = self._howls[i]._soundById(ids[j]);
if (sound && sound._node && !sound._node._unlocked) {
sound._node._unlocked = true;
sound._node.load();
}
}
}
}
self._autoResume();
var source = self.ctx.createBufferSource();
source.buffer = self._scratchBuffer;
source.connect(self.ctx.destination);
if (typeof source.start === "undefined") {
source.noteOn(0);
} else {
source.start(0);
}
if (typeof self.ctx.resume === "function") {
self.ctx.resume();
}
source.onended = function() {
source.disconnect(0);
self._audioUnlocked = true;
document.removeEventListener("touchstart", unlock, true);
document.removeEventListener("touchend", unlock, true);
document.removeEventListener("click", unlock, true);
for (var i = 0; i < self._howls.length; i++) {
self._howls[i]._emit("unlock");
}
};
};
document.addEventListener("touchstart", unlock, true);
document.addEventListener("touchend", unlock, true);
document.addEventListener("click", unlock, true);
return self;
},
_obtainHtml5Audio: function() {
var self = this || Howler;
if (self._html5AudioPool.length) {
return self._html5AudioPool.pop();
}
var testPlay = new Audio().play();
if (testPlay && typeof Promise !== "undefined" && (testPlay instanceof Promise || typeof testPlay.then === "function")) {
testPlay.catch(function() {
console.warn("HTML5 Audio pool exhausted, returning potentially locked audio object.");
});
}
return new Audio();
},
_releaseHtml5Audio: function(audio) {
var self = this || Howler;
if (audio._unlocked) {
self._html5AudioPool.push(audio);
}
return self;
},
_autoSuspend: function() {
var self = this;
if (!self.autoSuspend || !self.ctx || typeof self.ctx.suspend === "undefined" || !Howler.usingWebAudio) {
return;
}
for (var i = 0; i < self._howls.length; i++) {
if (self._howls[i]._webAudio) {
for (var j = 0; j < self._howls[i]._sounds.length; j++) {
if (!self._howls[i]._sounds[j]._paused) {
return self;
}
}
}
}
if (self._suspendTimer) {
clearTimeout(self._suspendTimer);
}
self._suspendTimer = setTimeout(function() {
if (!self.autoSuspend) {
return;
}
self._suspendTimer = null;
self.state = "suspending";
self.ctx.suspend().then(function() {
self.state = "suspended";
if (self._resumeAfterSuspend) {
delete self._resumeAfterSuspend;
self._autoResume();
}
}).catch(function() {});
}, 3e4);
return self;
},
_autoResume: function() {
var self = this;
if (!self.ctx || typeof self.ctx.resume === "undefined" || !Howler.usingWebAudio) {
return;
}
if (self.state === "running" && self._suspendTimer) {
clearTimeout(self._suspendTimer);
self._suspendTimer = null;
} else if (self.state === "suspended" || /iP(hone|od|ad)|Mac/.test(Howler._navigator && Howler._navigator.platform)) {
self.ctx.resume().then(function() {
self.state = "running";
for (var i = 0; i < self._howls.length; i++) {
self._howls[i]._emit("resume");
}
}).catch(function() {
self.state = "suspended";
});
if (self._suspendTimer) {
clearTimeout(self._suspendTimer);
self._suspendTimer = null;
}
} else if (self.state === "suspending") {
self._resumeAfterSuspend = true;
}
return self;
}
};
var Howler = new HowlerGlobal();
var Howl = function(o) {
var self = this;
if (!o.src || o.src.length === 0) {
Logger.logErrorMessage("An array of source files must be passed with any new Howl.");
return;
}
self.init(o);
};
Howl.prototype = {
init: function(o) {
var self = this;
if (!Howler.ctx) {
setupAudioContext();
}
self._autoplay = o.autoplay || false;
self._format = typeof o.format !== "string" ? o.format : [ o.format ];
self._html5 = o.html5 || false;
self._muted = o.mute || false;
self._loop = o.loop || false;
self._pool = o.pool || 5;
self._preload = typeof o.preload === "boolean" ? o.preload : true;
self._rate = o.rate || 1;
self._sprite = o.sprite || {};
self._src = typeof o.src !== "string" ? o.src : [ o.src ];
self._volume = o.volume !== undefined ? o.volume : 1;
self._xhrWithCredentials = o.xhrWithCredentials || false;
self._duration = 0;
self._state = "unloaded";
self._sounds = [];
self._endTimers = {};
self._queue = [];
self._playLock = false;
self._onend = o.onend ? [ {
fn: o.onend
} ] : [];
self._onfade = o.onfade ? [ {
fn: o.onfade
} ] : [];
self._onload = o.onload ? [ {
fn: o.onload
} ] : [];
self._onloaderror = o.onloaderror ? [ {
fn: o.onloaderror
} ] : [];
self._onplayerror = o.onplayerror ? [ {
fn: o.onplayerror
} ] : [];
self._onpause = o.onpause ? [ {
fn: o.onpause
} ] : [];
self._onplay = o.onplay ? [ {
fn: o.onplay
} ] : [];
self._onstop = o.onstop ? [ {
fn: o.onstop
} ] : [];
self._onmute = o.onmute ? [ {
fn: o.onmute
} ] : [];
self._onvolume = o.onvolume ? [ {
fn: o.onvolume
} ] : [];
self._onrate = o.onrate ? [ {
fn: o.onrate
} ] : [];
self._onseek = o.onseek ? [ {
fn: o.onseek
} ] : [];
self._onunlock = o.onunlock ? [ {
fn: o.onunlock
} ] : [];
self._onresume = [];
self._onwhileplaying = o.onwhileplaying ? [ {
fn: o.onwhileplaying
} ] : [];
self._webAudio = Howler.usingWebAudio && !self._html5;
if (typeof Howler.ctx !== "undefined" && Howler.ctx && Howler.autoUnlock) {
Howler._unlockAudio();
}
Howler._howls.push(self);
if (self._autoplay) {
self._queue.push({
event: "play",
action: function() {
self.play();
}
});
}
if (self._preload) {
self.load();
}
return self;
},
load: function() {
var self = this;
var url = null;
if (Howler.noAudio) {
self._emit("loaderror", null, "No audio support.");
return;
}
if (typeof self._src === "string") {
self._src = [ self._src ];
}
for (var i = 0; i < self._src.length; i++) {
var ext, str;
if (self._format && self._format[i]) {
ext = self._format[i];
} else {
str = self._src[i];
if (typeof str !== "string") {
self._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
continue;
}
ext = /^data:audio\/([^;,]+);/i.exec(str);
if (!ext) {
ext = /\.([^.]+)$/.exec(str.split("?", 1)[0]);
}
if (ext) {
ext = ext[1].toLowerCase();
}
}
if (!ext) {
console.warn('No file extension was found. Consider using the "format" property or specify an extension.');
}
if (ext && Howler.codecs(ext)) {
url = self._src[i];
break;
}
}
if (!url) {
self._emit("loaderror", null, "No codec support for selected audio sources.");
return;
}
self._src = url;
self._state = "loading";
if (window.location.protocol === "https:" && url.slice(0, 5) === "http:") {
self._html5 = true;
self._webAudio = false;
}
new Sound(self);
if (self._webAudio) {
loadBuffer(self);
}
return self;
},
play: function(sprite, internal) {
var self = this;
var id = null;
if (typeof sprite === "number") {
id = sprite;
sprite = null;
} else if (typeof sprite === "string" && self._state === "loaded" && !self._sprite[sprite]) {
return null;
} else if (typeof sprite === "undefined") {
sprite = "__default";
if (!self._playLock) {
var num = 0;
for (var i = 0; i < self._sounds.length; i++) {
if (self._sounds[i]._paused && !self._sounds[i]._ended) {
num++;
id = self._sounds[i]._id;
}
}
if (num === 1) {
sprite = null;
} else {
id = null;
}
}
}
var sound = id ? self._soundById(id) : self._inactiveSound();
if (!sound) {
return null;
}
if (id && !sprite) {
sprite = sound._sprite || "__default";
}
if (self._state !== "loaded") {
sound._sprite = sprite;
sound._ended = false;
var soundId = sound._id;
self._queue.push({
event: "play",
action: function() {
self.play(soundId);
}
});
return soundId;
}
if (id && !sound._paused) {
if (!internal) {
self._loadQueue("play");
}
return sound._id;
}
if (self._webAudio) {
Howler._autoResume();
}
var seek = Math.max(0, sound._seek > 0 ? sound._seek : self._sprite[sprite][0] / 1e3);
var duration = Math.max(0, (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1e3 - seek);
var timeout = duration * 1e3 / Math.abs(sound._rate);
var start = self._sprite[sprite][0] / 1e3;
var stop = (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1e3;
var loop = !!(sound._loop || self._sprite[sprite][2]);
sound._sprite = sprite;
sound._ended = false;
var setParams = function() {
sound._paused = false;
sound._seek = seek;
sound._start = start;
sound._stop = stop;
sound._loop = loop;
};
if (stop > 0 && seek >= stop) {
self._ended(sound);
return;
}
var node = sound._node;
if (self._webAudio) {
var playWebAudio = function() {
self._playLock = false;
setParams();
self._refreshBuffer(sound);
var vol = sound._muted || self._muted ? 0 : sound._volume;
node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
sound._playStart = Howler.ctx.currentTime;
if (typeof node.bufferSource.start === "undefined") {
sound._loop ? node.bufferSource.noteGrainOn(0, seek, 86400) : node.bufferSource.noteGrainOn(0, seek, duration);
} else {
sound._loop ? node.bufferSource.start(0, seek, 86400) : node.bufferSource.start(0, seek, duration);
}
if (timeout !== Infinity) {
self._setInterval(sound._id);
}
if (!internal) {
setTimeout(function() {
self._emit("play", sound._id);
self._loadQueue();
}, 0);
}
};
if (Howler.state === "running") {
playWebAudio();
} else {
self._playLock = true;
self.once("resume", playWebAudio);
self._clearTimer(sound._id);
}
} else {
var playHtml5 = function() {
node.currentTime = seek;
node.muted = sound._muted || self._muted || Howler._muted || node.muted;
node.volume = sound._volume * Howler.volume();
node.playbackRate = sound._rate;
try {
var play = node.play();
if (play && typeof Promise !== "undefined" && (play instanceof Promise || typeof play.then === "function")) {
self._playLock = true;
setParams();
play.then(function() {
self._playLock = false;
node._unlocked = true;
if (!internal) {
self._emit("play", sound._id);
self._loadQueue();
}
}).catch(function() {
self._playLock = false;
self._emit("playerror", sound._id, "Playback was unable to start. This is most commonly an issue " + "on mobile devices and Chrome where playback was not within a user interaction.");
sound._ended = true;
sound._paused = true;
});
} else if (!internal) {
self._playLock = false;
setParams();
self._emit("play", sound._id);
self._loadQueue();
}
node.playbackRate = sound._rate;
if (node.paused) {
self._emit("playerror", sound._id, "Playback was unable to start. This is most commonly an issue " + "on mobile devices and Chrome where playback was not within a user interaction.");
return;
}
self._setInterval(sound._id);
} catch (err) {
self._emit("playerror", sound._id, err);
}
};
var loadedNoReadyState = window && window.ejecta || !node.readyState && Howler._navigator.isCocoonJS;
if (node.readyState >= 3 || loadedNoReadyState) {
playHtml5();
} else {
self._playLock = true;
var listener = function() {
playHtml5();
node.removeEventListener(Howler._canPlayEvent, listener, false);
};
node.addEventListener(Howler._canPlayEvent, listener, false);
self._clearTimer(sound._id);
}
}
return sound._id;
},
pause: function(id) {
var self = this;
if (self._state !== "loaded" || self._playLock) {
self._queue.push({
event: "pause",
action: function() {
self.pause(id);
}
});
return self;
}
var ids = self._getSoundIds(id);
for (var i = 0; i < ids.length; i++) {
self._clearTimer(ids[i]);
var sound = self._soundById(ids[i]);
if (sound && !sound._paused) {
sound._seek = self.seek(ids[i]);
sound._rateSeek = 0;
sound._paused = true;
self._stopFade(ids[i]);
if (sound._node) {
if (self._webAudio) {
if (!sound._node.bufferSource) {
continue;
}
if (typeof sound._node.bufferSource.stop === "undefined") {
sound._node.bufferSource.noteOff(0);
} else {
sound._node.bufferSource.stop(0);
}
self._cleanBuffer(sound._node);
} else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
sound._node.pause();
}
}
}
if (!arguments[1]) {
self._emit("pause", sound ? sound._id : null);
}
}
return self;
},
stop: function(id, internal) {
var self = this;
if (self._state !== "loaded" || self._playLock) {
self._queue.push({
event: "stop",
action: function() {
self.stop(id);
}
});
return self;
}
var ids = self._getSoundIds(id);
for (var i = 0; i < ids.length; i++) {
self._clearTimer(ids[i]);
var sound = self._soundById(ids[i]);
if (sound) {
sound._seek = sound._start || 0;
sound._rateSeek = 0;
sound._paused = true;
sound._ended = true;
self._stopFade(ids[i]);
if (sound._node) {
if (self._webAudio) {
if (sound._node.bufferSource) {
if (typeof sound._node.bufferSource.stop === "undefined") {
sound._node.bufferSource.noteOff(0);
} else {
sound._node.bufferSource.stop(0);
}
self._cleanBuffer(sound._node);
}
} else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
sound._node.currentTime = sound._start || 0;
sound._node.pause();
}
}
if (!internal) {
self._emit("stop", sound._id);
}
}
}
return self;
},
mute: function(muted, id) {
var self = this;
if (self._state !== "loaded" || self._playLock) {
self._queue.push({
event: "mute",
action: function() {
self.mute(muted, id);
}
});
return self;
}
if (typeof id === "undefined") {
if (typeof muted === "boolean") {
self._muted = muted;
} else {
return self._muted;
}
}
var ids = self._getSoundIds(id);
for (var i = 0; i < ids.length; i++) {
var sound = self._soundById(ids[i]);
if (sound) {
sound._muted = muted;
if (sound._interval) {
self._stopFade(sound._id);
}
if (self._webAudio && sound._node) {
sound._node.gain.setValueAtTime(muted ? 0 : sound._volume, Howler.ctx.currentTime);
} else if (sound._node) {
sound._node.muted = Howler._muted ? true : muted;
}
self._emit("mute", sound._id);
}
}
return self;
},
volume: function() {
var self = this;
var args = arguments;
var vol, id;
if (args.length === 0) {
return self._volume;
} else if (args.length === 1 || args.length === 2 && typeof args[1] === "undefined") {
var ids = self._getSoundIds();
var index = ids.indexOf(args[0]);
if (index >= 0) {
id = parseInt(args[0], 10);
} else {
vol = parseFloat(args[0]);
}
} else if (args.length >= 2) {
vol = parseFloat(args[0]);
id = parseInt(args[1], 10);
}
var sound;
if (typeof vol !== "undefined" && vol >= 0 && vol <= 1) {
if (self._state !== "loaded" || self._playLock) {
self._queue.push({
event: "volume",
action: function() {
self.volume.apply(self, args);
}
});
return self;
}
if (typeof id === "undefined") {
self._volume = vol;
}
id = self._getSoundIds(id);
for (var i = 0; i < id.length; i++) {
sound = self._soundById(id[i]);
if (sound) {
sound._volume = vol;
if (!args[2]) {
self._stopFade(id[i]);
}
if (self._webAudio && sound._node && !sound._muted) {
sound._node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
} else if (sound._node && !sound._muted) {
sound._node.volume = vol * Howler.volume();
}
self._emit("volume", sound._id);
}
}
} else {
sound = id ? self._soundById(id) : self._sounds[0];
return sound ? sound._volume : 0;
}
return self;
},
fade: function(from, to, len, id) {
var self = this;
if (self._state !== "loaded" || self._playLock) {
self._queue.push({
event: "fade",
action: function() {
self.fade(from, to, len, id);
}
});
return self;
}
from = parseFloat(from);
to = parseFloat(to);
len = parseFloat(len);
self.volume(from, id);
var ids = self._getSoundIds(id);
for (var i = 0; i < ids.length; i++) {
var sound = self._soundById(ids[i]);
if (sound) {
if (!id) {
self._stopFade(ids[i]);
}
if (self._webAudio && !sound._muted) {
var currentTime = Howler.ctx.currentTime;
var end = currentTime + len / 1e3;
sound._volume = from;
sound._node.gain.setValueAtTime(from, currentTime);
sound._node.gain.linearRampToValueAtTime(to, end);
}
self._startFadeInterval(sound, from, to, len, ids[i], typeof id === "undefined");
}
}
return self;
},
_startFadeInterval: function(sound, from, to, len, id, isGroup) {
var self = this;
var vol = from;
var diff = to - from;
var steps = Math.abs(diff / .01);
var stepLen = Math.max(4, steps > 0 ? len / steps : len);
var lastTick = Date.now();
sound._fadeTo = to;
sound._interval = setInterval(function() {
var tick = (Date.now() - lastTick) / len;
lastTick = Date.now();
vol += diff * tick;
vol = Math.max(0, vol);
vol = Math.min(1, vol);
vol = round(vol, 2);
if (self._webAudio) {
sound._volume = vol;
} else {
self.volume(vol, sound._id, true);
}
if (isGroup) {
self._volume = vol;
}
if (to < from && vol <= to || to > from && vol >= to) {
clearInterval(sound._interval);
sound._interval = null;
sound._fadeTo = null;
self.volume(to, sound._id);
self._emit("fade", sound._id);
}
}, stepLen);
},
_stopFade: function(id) {
var self = this;
var sound = self._soundById(id);
if (sound && sound._interval) {
if (self._webAudio) {
sound._node.gain.cancelScheduledValues(Howler.ctx.currentTime);
}
clearInterval(sound._interval);
sound._interval = null;
self.volume(sound._fadeTo, id);
sound._fadeTo = null;
self._emit("fade", id);
}
return self;
},
loop: function() {
var self = this;
var args = arguments;
var loop, id, sound;
if (args.length === 0) {
return self._loop;
} else if (args.length === 1) {
if (typeof args[0] === "boolean") {
loop = args[0];
self._loop = loop;
} else {
sound = self._soundById(parseInt(args[0], 10));
return sound ? sound._loop : false;
}
} else if (args.length === 2) {
loop = args[0];
id = parseInt(args[1], 10);
}
var ids = self._getSoundIds(id);
for (var i = 0; i < ids.length; i++) {
sound = self._soundById(ids[i]);
if (sound) {
sound._loop = loop;
if (self._webAudio && sound._node && sound._node.bufferSource) {
sound._node.bufferSource.loop = loop;
if (loop) {
sound._node.bufferSource.loopStart = sound._start || 0;
sound._node.bufferSource.loopEnd = sound._stop;
}
}
}
}
return self;
},
rate: function() {
var self = this;
var args = arguments;
var rate, id;
if (args.length === 0) {
id = self._sounds[0]._id;
} else if (args.length === 1) {
var ids = self._getSoundIds();
var index = ids.indexOf(args[0]);
if (index >= 0) {
id = parseInt(args[0], 10);
} else {
rate = parseFloat(args[0]);
}
} else if (args.length === 2) {
rate = parseFloat(args[0]);
id = parseInt(args[1], 10);
}
var sound;
if (typeof rate === "number") {
if (self._state !== "loaded" || self._playLock) {
self._queue.push({
event: "rate",
action: function() {
self.rate.apply(self, args);
}
});
return self;
}
if (typeof id === "undefined") {
self._rate = rate;
}
id = self._getSoundIds(id);
for (var i = 0; i < id.length; i++) {
sound = self._soundById(id[i]);
if (sound) {
if (self.playing(id[i])) {
sound._rateSeek = self.seek(id[i]);
sound._playStart = self._webAudio ? Howler.ctx.currentTime : sound._playStart;
}
sound._rate = rate;
if (self._webAudio && sound._node && sound._node.bufferSource) {
sound._node.bufferSource.playbackRate.setValueAtTime(rate, Howler.ctx.currentTime);
} else if (sound._node) {
sound._node.playbackRate = rate;
}
if (self._endTimers[id[i]] || !sound._paused) {
self._clearTimer(id[i]);
self._setInterval(id[i]);
}
self._emit("rate", sound._id);
}
}
} else {
sound = self._soundById(id);
return sound ? sound._rate : self._rate;
}
return self;
},
seek: function() {
var self = this;
var args = arguments;
var seek, id;
if (args.length === 0) {
id = self._sounds[0]._id;
} else if (args.length === 1) {
var ids = self._getSoundIds();
var index = ids.indexOf(args[0]);
if (index >= 0) {
id = parseInt(args[0], 10);
} else if (self._sounds.length) {
id = self._sounds[0]._id;
seek = parseFloat(args[0]);
}
} else if (args.length === 2) {
seek = parseFloat(args[0]);
id = parseInt(args[1], 10);
}
if (typeof id === "undefined") {
return self;
}
if (self._state !== "loaded" || self._playLock) {
self._queue.push({
event: "seek",
action: function() {
self.seek.apply(self, args);
}
});
return self;
}
var sound = self._soundById(id);
if (sound) {
if (typeof seek === "number" && seek >= 0) {
var playing = self.playing(id);
if (playing) {
self.pause(id, true);
}
sound._seek = seek;
sound._ended = false;
self._clearTimer(id);
if (!self._webAudio && sound._node && !isNaN(sound._node.duration)) {
sound._node.currentTime = seek;
}
var seekAndEmit = function() {
self._emit("seek", id);
if (playing) {
self.play(id, true);
}
};
if (playing && !self._webAudio) {
var emitSeek = function() {
if (!self._playLock) {
seekAndEmit();
} else {
setTimeout(emitSeek, 0);
}
};
setTimeout(emitSeek, 0);
} else {
seekAndEmit();
}
} else {
if (self._webAudio) {
var realTime = self.playing(id) ? Howler.ctx.currentTime - sound._playStart : 0;
var rateSeek = sound._rateSeek ? sound._rateSeek - sound._seek : 0;
return round(sound._seek + (rateSeek + realTime * Math.abs(sound._rate)), 5);
} else {
return round(sound._node.currentTime, 3);
}
}
}
return self;
},
playing: function(id) {
var self = this;
if (typeof id === "number") {
var sound = self._soundById(id);
return sound ? !sound._paused : false;
}
for (var i = 0; i < self._sounds.length; i++) {
if (!self._sounds[i]._paused) {
return true;
}
}
return false;
},
duration: function(id) {
var self = this;
var duration = self._duration;
var sound = self._soundById(id);
if (sound) {
if (self._webAudio === false) {
duration = sound._node.duration;
} else {
duration = self._sprite[sound._sprite][1] / 1e3;
}
}
return duration;
},
state: function() {
return this._state;
},
unload: function() {
var self = this;
var sounds = self._sounds;
for (var i = 0; i < sounds.length; i++) {
if (!sounds[i]._paused) {
self.stop(sounds[i]._id);
}
if (!self._webAudio) {
var checkIE = /MSIE |Trident\//.test(Howler._navigator && Howler._navigator.userAgent);
if (!checkIE) {
sounds[i]._node.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
}
sounds[i]._node.removeEventListener("error", sounds[i]._errorFn, false);
sounds[i]._node.removeEventListener(Howler._canPlayEvent, sounds[i]._loadFn, false);
Howler._releaseHtml5Audio(sounds[i]._node);
}
delete sounds[i]._node;
self._clearTimer(sounds[i]._id);
}
var index = Howler._howls.indexOf(self);
if (index >= 0) {
Howler._howls.splice(index, 1);
}
var remCache = true;
for (i = 0; i < Howler._howls.length; i++) {
if (Howler._howls[i]._src === self._src || self._src.indexOf(Howler._howls[i]._src) >= 0) {
remCache = false;
break;
}
}
if (cache && remCache) {
delete cache[self._src];
}
Howler.noAudio = false;
self._state = "unloaded";
self._sounds = [];
self = null;
return null;
},
on: function(event, fn, id, once) {
var self = this;
var events = self["_on" + event];
if (typeof fn === "function") {
events.push(once ? {
id: id,
fn: fn,
once: once
} : {
id: id,
fn: fn
});
}
return self;
},
off: function(event, fn, id) {
var self = this;
var events = self["_on" + event];
var i = 0;
if (typeof fn === "number") {
id = fn;
fn = null;
}
if (fn || id) {
for (i = 0; i < events.length; i++) {
var isId = id === events[i].id;
if (fn === events[i].fn && isId || !fn && isId) {
events.splice(i, 1);
break;
}
}
} else if (event) {
self["_on" + event] = [];
} else {
var keys = Object.keys(self);
for (i = 0; i < keys.length; i++) {
if (keys[i].indexOf("_on") === 0 && Array.isArray(self[keys[i]])) {
self[keys[i]] = [];
}
}
}
return self;
},
once: function(event, fn, id) {
var self = this;
self.on(event, fn, id, 1);
return self;
},
_emit: function(event, id, msg) {
var self = this;
var events = self["_on" + event];
for (var i = events.length - 1; i >= 0; i--) {
if (!events[i].id || events[i].id === id || event === "load") {
setTimeout(function(fn) {
fn.call(this, id, msg);
}.bind(self, events[i].fn), 0);
if (events[i].once) {
self.off(event, events[i].fn, events[i].id);
}
}
}
self._loadQueue(event);
return self;
},
_loadQueue: function(event) {
var self = this;
if (self._queue.length > 0) {
var task = self._queue[0];
if (task.event === event) {
self._queue.shift();
self._loadQueue();
}
if (!event) {
task.action();
}
}
return self;
},
_ended: function(sound) {
var self = this;
var sprite = sound._sprite;
if (!self._webAudio && sound._node && !sound._node.paused && !sound._node.ended && sound._node.currentTime < sound._stop) {
setTimeout(self._ended.bind(self, sound), 100);
return self;
}
var loop = !!(sound._loop || self._sprite[sprite][2]);
self._emit("end", sound._id);
if (!self._webAudio && loop) {
self.stop(sound._id, true).play(sound._id);
}
if (self._webAudio && loop) {
self._emit("play", sound._id);
sound._seek = sound._start || 0;
sound._rateSeek = 0;
sound._playStart = Howler.ctx.currentTime;
var timeout = (sound._stop - sound._start) * 1e3 / Math.abs(sound._rate);
self._setInterval(sound._id, timeout);
}
if (self._webAudio && !loop) {
sound._paused = true;
sound._ended = true;
sound._seek = sound._start || 0;
sound._rateSeek = 0;
self._clearTimer(sound._id);
self._cleanBuffer(sound._node);
if (/iP(hone|od|ad)|Mac/.test(Howler._navigator && Howler._navigator.platform)) {} else {
Howler._autoSuspend();
}
}
if (!self._webAudio && !loop) {
self.stop(sound._id, true);
}
return self;
},
_setInterval: function(id, timeout) {
var self = this;
var sound = self._soundById(id);
var hasUndefinedTimeout = timeout === undefined;
if (self._webAudio === false && sound._node.paused == true) {
return;
}
self._endTimers[id] = setInterval(function() {
if (hasUndefinedTimeout) {
timeout = self.duration(id);
if (timeout === Infinity) {
return;
}
}
var seek = Math.min(timeout, self.seek(id));
self._emit("whileplaying", id, [ timeout, seek ]);
if (timeout !== 0 && seek >= timeout - .09) {
self._ended(sound);
if (self._webAudio === false) {
sound._node.load();
}
}
}, 100);
},
_clearTimer: function(id) {
var self = this;
if (self._endTimers[id]) {
if (typeof self._endTimers[id] !== "function") {
clearTimeout(self._endTimers[id]);
} else {
var sound = self._soundById(id);
if (sound && sound._node) {
sound._node.removeEventListener("ended", self._endTimers[id], false);
}
}
delete self._endTimers[id];
}
return self;
},
_soundById: function(id) {
var self = this;
for (var i = 0; i < self._sounds.length; i++) {
if (id === self._sounds[i]._id) {
return self._sounds[i];
}
}
return null;
},
_inactiveSound: function() {
var self = this;
self._drain();
for (var i = 0; i < self._sounds.length; i++) {
if (self._sounds[i]._ended) {
return self._sounds[i].reset();
}
}
return new Sound(self);
},
_drain: function() {
var self = this;
var limit = self._pool;
var cnt = 0;
var i = 0;
if (self._sounds.length < limit) {
return;
}
for (i = 0; i < self._sounds.length; i++) {
if (self._sounds[i]._ended) {
cnt++;
}
}
for (i = self._sounds.length - 1; i >= 0; i--) {
if (cnt <= limit) {
return;
}
if (self._sounds[i]._ended) {
if (self._webAudio && self._sounds[i]._node) {
self._sounds[i]._node.disconnect(0);
}
self._sounds.splice(i, 1);
cnt--;
}
}
},
_getSoundIds: function(id) {
var self = this;
if (typeof id === "undefined") {
var ids = [];
for (var i = 0; i < self._sounds.length; i++) {
ids.push(self._sounds[i]._id);
}
return ids;
} else {
return [ id ];
}
},
_refreshBuffer: function(sound) {
var self = this;
sound._node.bufferSource = Howler.ctx.createBufferSource();
sound._node.bufferSource.buffer = cache[self._src];
if (sound._panner) {
sound._node.bufferSource.connect(sound._panner);
} else {
sound._node.bufferSource.connect(sound._node);
}
sound._node.bufferSource.loop = sound._loop;
if (sound._loop) {
sound._node.bufferSource.loopStart = sound._start || 0;
sound._node.bufferSource.loopEnd = sound._stop || 0;
}
sound._node.bufferSource.playbackRate.setValueAtTime(sound._rate, Howler.ctx.currentTime);
return self;
},
_cleanBuffer: function(node) {
var self = this;
var isIOS = Howler._navigator && Howler._navigator.vendor.indexOf("Apple") >= 0;
if (Howler._scratchBuffer && node.bufferSource) {
node.bufferSource.onended = null;
node.bufferSource.disconnect(0);
if (isIOS) {
try {
node.bufferSource.buffer = Howler._scratchBuffer;
} catch (e) {}
}
}
node.bufferSource = null;
return self;
}
};
var Sound = function(howl) {
this._parent = howl;
this.init();
};
Sound.prototype = {
init: function() {
var self = this;
var parent = self._parent;
self._muted = parent._muted;
self._loop = parent._loop;
self._volume = parent._volume;
self._rate = parent._rate;
self._seek = 0;
self._paused = true;
self._ended = true;
self._sprite = "__default";
self._id = ++Howler._counter;
parent._sounds.push(self);
self.create();
return self;
},
create: function() {
var self = this;
var parent = self._parent;
var volume = Howler._muted || self._muted || self._parent._muted ? 0 : self._volume;
if (parent._webAudio) {
self._node = typeof Howler.ctx.createGain === "undefined" ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
self._node.gain.setValueAtTime(volume, Howler.ctx.currentTime);
self._node.paused = true;
self._node.connect(Howler.masterGain);
} else {
self._node = Howler._obtainHtml5Audio();
self._errorFn = self._errorListener.bind(self);
self._node.addEventListener("error", self._errorFn, false);
self._loadFn = self._loadListener.bind(self);
self._node.addEventListener(Howler._canPlayEvent, self._loadFn, false);
self._node.src = parent._src;
self._node.preload = "auto";
self._node.volume = volume * Howler.volume();
self._node.load();
}
return self;
},
reset: function() {
var self = this;
var parent = self._parent;
self._muted = parent._muted;
self._loop = parent._loop;
self._volume = parent._volume;
self._rate = parent._rate;
self._seek = 0;
self._rateSeek = 0;
self._paused = true;
self._ended = true;
self._sprite = "__default";
self._id = ++Howler._counter;
return self;
},
_errorListener: function() {
var self = this;
self._parent._emit("loaderror", self._id, self._node.error ? self._node.error.code : 0);
self._node.removeEventListener("error", self._errorFn, false);
},
_loadListener: function() {
var self = this;
var parent = self._parent;
parent._duration = round(self._node.duration, 1);
if (Object.keys(parent._sprite).length === 0) {
parent._sprite = {
__default: [ 0, parent._duration * 1e3 ]
};
}
if (parent._state !== "loaded") {
parent._state = "loaded";
parent._emit("load");
parent._loadQueue();
}
self._node.removeEventListener(Howler._canPlayEvent, self._loadFn, false);
}
};
var cache = {};
var loadBuffer = function(self) {
var url = self._src;
if (cache[url]) {
self._duration = round(cache[url].duration, 3);
loadSound(self);
return;
}
if (/^data:[^;]+;base64,/.test(url)) {
var data = atob(url.split(",")[1]);
var dataView = new Uint8Array(data.length);
for (var i = 0; i < data.length; ++i) {
dataView[i] = data.charCodeAt(i);
}
decodeAudioData(dataView.buffer, self);
} else {
var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.withCredentials = self._xhrWithCredentials;
xhr.responseType = "arraybuffer";
xhr.onload = function() {
var code = (xhr.status + "")[0];
if (code !== "0" && code !== "2" && code !== "3") {
self._emit("loaderror", null, "Failed loading audio file with status: " + xhr.status + ".");
return;
}
decodeAudioData(xhr.response, self);
};
xhr.onerror = function() {
if (self._webAudio) {
self._html5 = true;
self._webAudio = false;
self._sounds = [];
delete cache[url];
self.load();
}
};
safeXhrSend(xhr);
}
};
var safeXhrSend = function(xhr) {
try {
xhr.send();
} catch (e) {
xhr.onerror();
}
};
var decodeAudioData = function(arraybuffer, self) {
var error = function() {
self._emit("loaderror", null, "Decoding audio data failed.");
};
var success = function(buffer) {
if (buffer && self._sounds.length > 0) {
cache[self._src] = buffer;
loadSound(self, buffer);
} else {
error();
}
};
if (typeof Promise !== "undefined" && Howler.ctx.decodeAudioData.length === 1) {
Howler.ctx.decodeAudioData(arraybuffer).then(success).catch(error);
} else {
Howler.ctx.decodeAudioData(arraybuffer, success, error);
}
};
var loadSound = function(self, buffer) {
if (buffer && !self._duration) {
self._duration = buffer.duration;
}
if (Object.keys(self._sprite).length === 0) {
self._sprite = {
__default: [ 0, self._duration * 1e3 ]
};
}
if (self._state !== "loaded") {
self._state = "loaded";
self._emit("load");
self._loadQueue();
}
};
var setupAudioContext = function() {
if (!Howler.usingWebAudio) {
return;
}
try {
if (typeof AudioContext !== "undefined") {
Howler.ctx = new AudioContext();
} else if (typeof webkitAudioContext !== "undefined") {
Howler.ctx = new webkitAudioContext();
} else {
Howler.usingWebAudio = false;
}
} catch (e) {
Howler.usingWebAudio = false;
}
if (!Howler.ctx) {
Howler.usingWebAudio = false;
}
var iOS = /iP(hone|od|ad)/.test(Howler._navigator && Howler._navigator.platform);
var appVersion = Howler._navigator && Howler._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
var version = appVersion ? parseInt(appVersion[1], 10) : null;
if (iOS && version && version < 9) {
var safari = /safari/.test(Howler._navigator && Howler._navigator.userAgent.toLowerCase());
if (Howler._navigator && Howler._navigator.standalone && !safari || Howler._navigator && !Howler._navigator.standalone && !safari) {
Howler.usingWebAudio = false;
}
}
if (Howler.usingWebAudio) {
Howler.masterGain = typeof Howler.ctx.createGain === "undefined" ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
Howler.masterGain.gain.setValueAtTime(Howler._muted ? 0 : 1, Howler.ctx.currentTime);
Howler.masterGain.connect(Howler.ctx.destination);
}
Howler._setup();
};
if (typeof define === "function" && define.amd) {
define([], function() {
return {
Howler: Howler,
Howl: Howl
};
});
}
if (typeof exports !== "undefined") {
exports.Howler = Howler;
exports.Howl = Howl;
}
if (typeof window !== "undefined") {
window.HowlerGlobal = HowlerGlobal;
window.Howler = Howler;
window.Howl = Howl;
window.Sound = Sound;
} else if (typeof global !== "undefined") {
global.HowlerGlobal = HowlerGlobal;
global.Howler = Howler;
global.Howl = Howl;
global.Sound = Sound;
}
})();

var SoundPlayer = function() {
function SoundPlayer() {}
SoundPlayer.init = function(url, options, node) {
var _options = {
src: $.isArray(url) ? url : [ url ]
};
if (BrowserUtils.isMobilePhoneTabletOrOtherDeviceWithTouchInterface() && !BrowserUtils.isiOS()) {
$.extend(_options, {
html5: true
});
}
if (!_.isEmpty(options)) {
$.extend(_options, options);
}
var sound = new Howl(_options);
SoundPlayer.addHowlPlayState(sound);
SoundPlayer.instancedHowls.push(sound);
if (node !== undefined) {
SoundPlayerGui.initialize(node, sound);
}
return sound;
};
SoundPlayer.initByTag = function(node, urlAttr, options) {
if (_.isString(node)) {
node = $(node);
}
return SoundPlayer.init(node.attr(urlAttr), options, node);
};
SoundPlayer.pause = function() {
var result = false;
_.each(SoundPlayer.instancedHowls, function(howl) {
if (howl.isPlaying()) {
howl.pause();
result = true;
}
});
return result;
};
SoundPlayer.resume = function() {
var result = false;
_.each(SoundPlayer.instancedHowls, function(howl) {
if (howl.isPaused()) {
howl.play();
result = true;
}
});
return result;
};
SoundPlayer.stop = function() {
var result = false;
SoundPlayer.instancedHowls.forEach(function(howl) {
if (howl.isPlaying()) {
howl.stop();
result = true;
}
});
return result;
};
SoundPlayer.addHowlPlayState = function(howl) {
howl.playState = Player.State.stopped;
howl.on("play", function() {
howl.playState = Player.State.playing;
});
howl.on("pause", function() {
howl.playState = Player.State.paused;
});
howl.on("stop", function() {
howl.playState = Player.State.stopped;
});
howl.on("end", function() {
howl.playState = Player.State.stopped;
});
howl.isPlaying = function() {
return this.playState === Player.State.playing;
};
howl.isPaused = function() {
return this.playState === Player.State.paused;
};
howl.isStopped = function() {
return this.playState === Player.State.stopped;
};
howl.isLoaded = function() {
return this.state() === "loaded";
};
};
SoundPlayer.instancedHowls = [];
return SoundPlayer;
}();

var Player;

(function(Player) {
var State;
(function(State) {
State[State["playing"] = 0] = "playing";
State[State["stopped"] = 1] = "stopped";
State[State["paused"] = 2] = "paused";
})(State = Player.State || (Player.State = {}));
})(Player || (Player = {}));

var SoundPlayerGui = function() {
function SoundPlayerGui() {}
SoundPlayerGui.initialize = function(soundPlayerPlaceHolder, sound) {
var player = SoundPlayerGui.getPlayerObject();
var node = _.isString(soundPlayerPlaceHolder) ? $(soundPlayerPlaceHolder) : soundPlayerPlaceHolder;
if (node.length === 0) {
throw new Error("SoundPlayer : Błąd, element DOM nie istnieje.");
}
if (node.length > 1) {
throw new Error("SoundPlayer : Błąd, zbyt wiele elementów DOM.");
}
node.replaceWith(player);
SoundPlayerGui.prepareGraphicsAndEvents(player, sound);
};
SoundPlayerGui.getPlayerObject = function() {
return $('<div class="SoundPlayer">' + '<div class="sp-bar-ui">' + '<div class = "sp-controls">' + '<div class = "sp-controls-inline-element sp-controls-button-rewind">' + '<div class = "sp-button-rewind"></div>' + "</div>" + '<div class = "sp-controls-inline-element sp-controls-button-play">' + '<div class = "sp-button-play"></div>' + "</div>" + '<div class = "sp-controls-inline-element sp-controls-button-fast-forward">' + '<div class = "sp-button-fast-forward"></div>' + "</div>" + '<div class = "sp-controls-inline-element sp-controls-progressbar">' + '<div class = "sp-progress">' + '<div class = "sp-progress-inline-element sp-progress-time"> 0:00 </div>' + '<div class = "sp-progress-inline-element">' + '<div class = "sp-progress-progressbar">' + '<div class = "sp-progressbar-track">' + '<div class = "sp-progressbar-bar"></div>' + '<div class = "sp-progressbar-ball">' + '<i class = "sp-ball-animation"></i>' + "</div>" + "</div>" + "</div>" + "</div>" + '<div class = "sp-progress-inline-element sp-progress-duration">' + '<span class = "sp-duration-whileloading"></span>' + "</div>" + "</div>" + "</div>" + "</div>" + "</div>" + "</div>");
};
SoundPlayerGui.prepareGraphicsAndEvents = function(player, sound) {
var gui = new InterfaceLayer(player);
sound.on("load", function() {
player.removeClass(SoundPlayerGui.CLASS_BUFFERING);
});
sound.on("play", function() {
player.addClass(SoundPlayerGui.CLASS_PLAYING);
});
sound.on("pause", function() {
player.removeClass(SoundPlayerGui.CLASS_PLAYING);
});
var gui_stop = function() {
player.removeClass(SoundPlayerGui.CLASS_PLAYING);
gui.updateProgress(sound.duration(), 0);
};
sound.on("stop", gui_stop);
sound.on("end", gui_stop);
var _seekTo = null;
sound.on("whileplaying", function(id, data) {
gui.updateProgress(data[0], data[1]);
if (_seekTo) {
sound.seek(_seekTo);
_seekTo = null;
}
});
gui.playButton.on("click", function() {
if (sound.isPlaying()) {
sound.pause();
return;
}
if (sound.state() !== "loaded") {
player.addClass(SoundPlayerGui.CLASS_BUFFERING);
}
sound.play();
});
gui.rewindButton.on("click", function() {
var secondsRewind = 10;
if (sound.state() !== "loaded") {
player.addClass(SoundPlayerGui.CLASS_BUFFERING);
}
if (sound.isPlaying()) {
sound.pause();
}
_.defer(function() {
var seek = SoundPlayerGui.getSoundSeek(sound);
_seekTo = seek > secondsRewind ? seek - secondsRewind : 1e-4;
});
sound.play();
});
gui.fastforwardButton.on("click", function() {
var secondsforward = 10;
if (sound.state() !== "loaded") {
player.addClass(SoundPlayerGui.CLASS_BUFFERING);
}
if (sound.isPlaying()) {
sound.pause();
}
_.defer(function() {
var seek = SoundPlayerGui.getSoundSeek(sound);
var secondsLeft = sound.duration() - seek;
_seekTo = secondsLeft > secondsforward ? seek + secondsforward : sound.duration();
});
sound.play();
});
gui.seekBar.on("click", function(event) {
if (!sound.isPlaying()) {
sound.play();
}
var offset = gui.seekBar.offset();
var percent = (event.clientX - offset.left) / gui.seekBar.innerWidth();
_.defer(function() {
_seekTo = percent * sound.duration();
});
});
};
SoundPlayerGui.getSoundSeek = function(sound) {
var seek = isNaN(sound.seek()) ? 0 : sound.seek();
if (sound.seek()._sounds !== undefined && sound.seek()._sounds.length == 1 && sound.seek()._sounds[0] !== undefined && !isNaN(sound.seek()._sounds[0]._seek)) {
seek = sound.seek()._sounds[0]._seek;
}
return seek;
};
SoundPlayerGui.CLASS_PLAYING = "playing";
SoundPlayerGui.CLASS_BUFFERING = "buffering";
return SoundPlayerGui;
}();

var InterfaceLayer = function() {
function InterfaceLayer(player) {
var _this = this;
this.updateProgress = function(duration, seek) {
var percent = seek / duration * 100;
percent = Math.min(100, Math.max(0, percent));
_this.seekBall.css("left", percent + "%");
_this.seekBarFilling.css("width", percent + "%");
_this.durationDisplay.html(Time.secondsToTime(duration));
_this.positionDisplay.html(Time.secondsToTime(seek));
};
this.ui = player.find(".sp-bar-ui");
this.seekBall = player.find(".sp-progressbar-ball");
this.seekBar = player.find(".sp-progressbar-track");
this.seekBarFilling = player.find(".sp-progressbar-bar");
this.playButton = player.find(".sp-controls-button-play");
this.rewindButton = player.find(".sp-controls-button-rewind");
this.fastforwardButton = player.find(".sp-controls-button-fast-forward");
this.durationDisplay = player.find(".sp-progress-duration");
this.positionDisplay = player.find(".sp-progress-time");
}
return InterfaceLayer;
}();

var SequentialAudioOutput = function() {
function SequentialAudioOutput() {}
SequentialAudioOutput.play = function(soundUrl) {
var sound = AudioCache.get(soundUrl);
SequentialAudioOutput.cancell();
SequentialAudioOutput.lastPlayed = sound;
return new Promise(function(resolve, reject) {
sound.once("end", resolve);
sound.once("loaderror", reject);
sound.once("stop", function() {
reject(new PlaybackInterruptedByUser());
});
sound.play();
setTimeout(function() {
if (!sound.playing()) {
reject(new PlaybackFailure("Odtwarzanie dźwięku nie zostało rozpoczęte w ciągu " + SequentialAudioOutput.secondsLimitForSoundInitialization + " sekund"));
}
}, SequentialAudioOutput.secondsLimitForSoundInitialization * 1e3);
});
};
SequentialAudioOutput.cancell = function() {
SequentialAudioOutput.lastPlayed && SequentialAudioOutput.lastPlayed.stop();
};
SequentialAudioOutput.secondsLimitForSoundInitialization = 2;
return SequentialAudioOutput;
}();

var SoundGroupManager = function() {
function SoundGroupManager() {
this.enabled = true;
}
SoundGroupManager.prototype.preload = function(soundUrl) {
if (this.enabled) {
AudioCache.save(soundUrl);
}
};
SoundGroupManager.prototype.play = function(soundUrl) {
if (!this.enabled) {
return Promise.resolve(undefined);
}
if (!soundUrl) {
Logger.logErrorMessage("Przekazano pusty adres dźwięku do odtworzenia.");
return Promise.resolve(undefined);
}
return SequentialAudioOutput.play(soundUrl).catch(SoundGroupManager.cleaningErrorsOtherThanUserInterruption);
};
SoundGroupManager.prototype.disable = function() {
this.enabled = false;
};
SoundGroupManager.cleaningErrorsOtherThanUserInterruption = function(playbackException) {
switch (true) {
case playbackException instanceof PlaybackInterruptedByUser:
throw playbackException;

case playbackException instanceof PlaybackFailure:
break;

default:
Logger.logException(playbackException);
break;
}
};
return SoundGroupManager;
}();

var AudioCache = function() {
function AudioCache() {}
AudioCache.get = function(soundUrl) {
AudioCache.save(soundUrl);
return AudioCache.sounds[soundUrl];
};
AudioCache.save = function(soundUrl) {
AudioCache.load(soundUrl);
AudioCache.refreshIndex(soundUrl);
AudioCache.removeExcessiveSounds();
};
AudioCache.load = function(soundUrl) {
if (AudioCache.contains(soundUrl)) {
return;
}
var howlerAudio = {
src: soundUrl
};
if (BrowserUtils.isMobilePhoneTabletOrOtherDeviceWithTouchInterface() && !BrowserUtils.isiOS()) {
$.extend(howlerAudio, {
html5: true
});
}
if (!AudioCache.isAudioLocalRecording(soundUrl)) {
AudioCache.sounds[soundUrl] = new Howl(howlerAudio);
return;
}
if (MediaRecorderFeatureDetection.supportsLocalRecordingsPlayback()) {
$.extend(howlerAudio, {
format: "ogg"
});
AudioCache.sounds[soundUrl] = new Howl(howlerAudio);
return;
}
$.extend(howlerAudio, {
html5: true
});
AudioCache.sounds[soundUrl] = new Howl(howlerAudio);
};
AudioCache.refreshIndex = function(soundUrl) {
if (AudioCache.hasTopIndex(soundUrl)) {
return;
}
var lastUsedSound = AudioCache.sounds[soundUrl];
AudioCache.sounds = _.omit(AudioCache.sounds, soundUrl);
AudioCache.sounds[soundUrl] = lastUsedSound;
};
AudioCache.removeExcessiveSounds = function() {
while (_.keys(AudioCache.sounds).length > AudioCache.cachedSoundsLimit) {
AudioCache.cleanUpSound(AudioCache.getLeastUsedSound());
}
};
AudioCache.cleanUpSound = function(soundUrl) {
if (!AudioCache.contains(soundUrl)) {
return;
}
AudioCache.sounds[soundUrl].unload();
AudioCache.sounds = _.omit(AudioCache.sounds, soundUrl);
};
AudioCache.contains = function(soundUrl) {
return soundUrl in AudioCache.sounds;
};
AudioCache.hasTopIndex = function(soundUrl) {
return _.keys(AudioCache.sounds).pop() === soundUrl;
};
AudioCache.getLeastUsedSound = function() {
return _.keys(AudioCache.sounds)[0];
};
AudioCache.isAudioLocalRecording = function(soundUrl) {
return /^blob:.*/.test(soundUrl) || / .*\..{1,4}/.test(soundUrl);
};
AudioCache.cachedSoundsLimit = 20;
AudioCache.sounds = [];
return AudioCache;
}();

var Sound = function() {
function Sound() {}
Sound.preloadSound = function(soundUrl) {
Sound.audioRecordings.preload(soundUrl);
};
Sound.playAndThen = function(soundUrl, unconditionalCallback) {
if (unconditionalCallback === void 0) {
unconditionalCallback = function() {};
}
Sound.playAndExecuteUnconditionallyAfter(soundUrl, unconditionalCallback);
};
Sound.playAndThenIfNotInterrupted = function(soundUrl, conditionalCallback) {
if (conditionalCallback === void 0) {
conditionalCallback = function() {};
}
Sound.audioRecordings.play(soundUrl).then(conditionalCallback).catch(function() {});
};
Sound.play = function(soundUrl) {
return Sound.audioRecordings.play(soundUrl).then(function() {
return {
interrupted: false
};
}).catch(function() {
return {
interrupted: true
};
});
};
Sound.tryAutoplayWithoutUserInteraction = function(soundUrl) {
Sound.playAndThen(soundUrl);
};
Sound.playCorrectAnswerSoundAndThenAnother = function(soundUrl, onFinish) {
if (onFinish === void 0) {
onFinish = function() {};
}
Sound.audioRecordings.preload(soundUrl);
Sound.playAndExecuteUnconditionallyAfter(soundUrl, onFinish, AudioEffects.playCorrectAnswer());
};
Sound.playWrongAnswerSoundAndThenAnother = function(soundUrl, onFinish) {
if (onFinish === void 0) {
onFinish = function() {};
}
Sound.audioRecordings.preload(soundUrl);
Sound.playAndExecuteUnconditionallyAfter(soundUrl, onFinish, AudioEffects.playWrongAnswer());
};
Sound.playCorrectAnswerSound = function(onFinish) {
if (onFinish === void 0) {
onFinish = function() {};
}
AudioEffects.playCorrectAnswer().then(onFinish);
};
Sound.playWrongAnswerSound = function(onFinish) {
if (onFinish === void 0) {
onFinish = function() {};
}
AudioEffects.playWrongAnswer().then(onFinish);
};
Sound.playWinnerCongratulationsSound = function(onFinish) {
if (onFinish === void 0) {
onFinish = function() {};
}
AudioEffects.playWinnerCongratulations().then(onFinish);
};
Sound.playGameLostSound = function(onFinish) {
if (onFinish === void 0) {
onFinish = function() {};
}
AudioEffects.playGameLost().then(onFinish);
};
Sound.playAndExecuteUnconditionallyAfter = function(soundUrl, onFinish, currentSoundPlayed) {
if (onFinish === void 0) {
onFinish = function() {};
}
if (currentSoundPlayed === void 0) {
currentSoundPlayed = Promise.resolve(undefined);
}
currentSoundPlayed.then(function() {
return Sound.audioRecordings.play(soundUrl);
}).catch(function() {}).then(onFinish);
};
Sound.getDuration = function(soundUrl) {
var sound = AudioCache.get(soundUrl);
return sound.duration();
};
Sound.audioRecordings = new SoundGroupManager();
return Sound;
}();

$.fn.asAudioIcon = function() {
if (this.length > 0 && this.hasClass("icon-sound")) {
return this;
}
throw new Error("element nie jest poprawną ikoną audio");
};

$.fn.asAutoPlayAudioIcon = function() {
if (this.length > 0 && this.hasClass("icon-sound") && (this.hasClass("autoplay") || this.parent().hasClass("autoplay"))) {
return this;
}
throw new Error("element nie jest poprawną ikoną audio autoplay");
};

$.fn.getAudioIcon = function() {
try {
return this.asAudioIcon();
} catch (invalidElementStructure) {
return this.find(".icon-sound").first().asAudioIcon();
}
};

$.fn.getAutoPlayAudioIcon = function() {
try {
return this.asAutoPlayAudioIcon();
} catch (invalidElementStructure) {
if (this.find(".icon-sound.autoplay").length) {
return this.find(".autoplay.icon-sound").first().asAutoPlayAudioIcon();
} else if (this.find(".autoplay").length) {
return this.find(".autoplay").find(".icon-sound").first().asAutoPlayAudioIcon();
}
return null;
}
};

$.fn.hasAudioIcon = function() {
return this.hasClass("icon-sound") || this.find(".icon-sound").length > 0;
};

$.fn.playAudio = function() {
if (this.isDisabled()) {
return Promise.reject({
interrupted: true
});
}
return Sound.play(this.getAudioUrl());
};

$.fn.hasAudio = function() {
return this.getAudioUrl() !== "";
};

$.fn.getAudioUrl = function() {
return this.attr("data-audio-url");
};

$.fn.getAudioDelay = function() {
return parseInt(this.attr("data-audio-delay") === undefined ? 0 : this.attr("data-audio-delay"));
};

$.fn.setAudioDelay = function(delay) {
this.attr("data-audio-delay", delay);
return this;
};

$.fn.setAudio = function(speechAudio) {
var speechUrl = window.URL.createObjectURL(speechAudio);
Sound.preloadSound(speechUrl);
this.attr("data-audio-url", speechUrl).enable();
return this;
};

$.fn.removeAudio = function() {
this.attr("data-audio-url", "").disable();
return this;
};

var HeaderMenu = function() {
function HeaderMenu() {
return HeaderMenu._INSTANCE;
}
HeaderMenu.getInstance = function() {
return HeaderMenu._INSTANCE;
};
HeaderMenu.prototype.init = function() {
if (!HeaderMenu._initialised) {
this.initMenu();
this.initSearch();
DropdownMenu.init();
HeaderMenu._initialised = true;
}
};
HeaderMenu.prototype.initMenu = function() {
if (BrowserUtils.isDesktop()) {
this.initMenuPerfectScrollbar();
}
$(document).on(BrowserUtils.isiOS() ? "touchstart" : "click", function(event) {
if ($(event.target).closest(HeaderMenu.SELECTOR_MENU_ICON).length == 1) {
return;
}
if ($(event.target).closest(HeaderMenu.SELECTOR_MENU_BOX).length == 1) {
return;
}
if (!$(HeaderMenu.SELECTOR_MENU_BACKGROUND).hasClass("slideout-menu")) {
var headerMenu = new HeaderMenu();
headerMenu.hideMenu();
}
});
$(document).on("click", HeaderMenu.SELECTOR_MENU_ICON, function(e) {
e.preventDefault();
e.stopPropagation();
HeaderMenu.toggleMenu();
HeaderMenu.hideSearchBox();
});
$(document).on("click", HeaderMenu.SELECTOR_MENU_ITEM, function(event) {
var $menuItem = $(this);
var hadVisibleSubmenu = $menuItem.attr(HeaderMenu.ATTR_SUB_MENU) === HeaderMenu.AVAL_SUB_MENU_VISIBLE;
HeaderMenu.hideSubMenus();
if (!$menuItem.hasClass(HeaderMenu.CLASS_ITEM_WITH_SUB_MENU) || hadVisibleSubmenu) {
return true;
}
$menuItem.attr(HeaderMenu.ATTR_SUB_MENU, HeaderMenu.AVAL_SUB_MENU_VISIBLE);
if (BrowserUtils.isDesktop()) {
HeaderMenu.updatePerfectScrollbar();
}
});
};
HeaderMenu.toggleMenu = function() {
if (!$(HeaderMenu.SELECTOR_MENU_BACKGROUND).hasClass("slideout-menu")) {
var headerMenu = new HeaderMenu();
if (HeaderMenu.isMenuShown()) {
headerMenu.hideMenu();
} else {
headerMenu.showMenu();
}
}
};
HeaderMenu.prototype.initSearch = function() {
DikiDictionary.initAutocompleteForSearchField($(HeaderMenu.SELECTOR_SEARCH_INPUT), $(HeaderMenu.SELECTOR_SEARCH_AUTOCOMPLETE_BOX));
$(document).on("keydown", HeaderMenu.SELECTOR_SEARCH_BOX, function(event) {
event.stopPropagation();
});
$(document).on(BrowserUtils.isiOS() ? "touchstart" : "click", function(event) {
if ($(event.target).closest(HeaderMenu.SELECTOR_SEARCH_ICON).length == 1) {
return;
}
HeaderMenu.hideSearchBox();
});
$(document).on(BrowserUtils.isiOS() ? "touchstart" : "click", HeaderMenu.SELECTOR_SEARCH_ICON, function() {
if (HeaderMenu.isSearchBoxShown()) {
HeaderMenu.hideSearchBox();
} else {
$(document).one("mousedown", function() {
return false;
});
HeaderMenu.showSearchBox();
}
});
$(document).on(BrowserUtils.isiOS() ? "touchstart" : "click", HeaderMenu.SELECTOR_SEARCH_BOX, function(event) {
event.stopPropagation();
});
$(HeaderMenu.SELECTOR_SEARCH_BOX).find("form").on("submit", function(event) {
Events.stopPropagationAndPreventDefault(event);
var searchFor = $(HeaderMenu.SELECTOR_SEARCH_INPUT).val();
HeaderMenu.hideSearchBox();
if (!searchFor) {
return false;
}
DikiDictionary.popupDikiSearch(searchFor);
});
};
HeaderMenu.prototype.showMenu = function() {
var $body = $("body");
$body.addClass(HeaderMenu.CLASS_BODY_MENU_OPEN);
$(HeaderMenu.SELECTOR_MENU_BACKGROUND).fadeIn(getAnimationDuration(), function() {
if (BrowserUtils.isDesktop()) {
HeaderMenu.updatePerfectScrollbar();
}
});
};
HeaderMenu.prototype.hideMenu = function() {
var $body = $("body");
$(HeaderMenu.SELECTOR_MENU_BOX).scrollTop(0);
$body.removeClass(HeaderMenu.CLASS_BODY_MENU_OPEN);
$(HeaderMenu.SELECTOR_MENU_BACKGROUND).fadeOut(getAnimationDuration(), function() {
HeaderMenu.hideSubMenus();
});
};
HeaderMenu.isMenuShown = function() {
return $(HeaderMenu.SELECTOR_MENU_BOX).is(":visible");
};
HeaderMenu.hideSubMenus = function() {
$(HeaderMenu.SELECTOR_MENU_ITEM).filter("." + HeaderMenu.CLASS_ITEM_WITH_SUB_MENU).not("." + HeaderMenu.CLASS_ITEM_WITH_SUB_MENU_NEVER_CLOSE).attr(HeaderMenu.ATTR_SUB_MENU, HeaderMenu.AVAL_SUB_MENU_HIDDEN);
};
HeaderMenu.prototype.initMenuPerfectScrollbar = function() {
var $menu = $(HeaderMenu.SELECTOR_MENU_BOX);
if (HeaderMenu.perfectScrollbar !== null) {
HeaderMenu.perfectScrollbar.destroy();
HeaderMenu.perfectScrollbar = null;
}
if ($menu.length) {
HeaderMenu.perfectScrollbar = new PerfectScrollbar(HeaderMenu.SELECTOR_MENU_BOX);
}
$(".ps-scrollbar-y").on("mousedown", function() {
$(HeaderMenu.SELECTOR_MENU_BOX).parent().one("click", function(event) {
event.stopPropagation();
});
});
$(window).on("resized", function() {
HeaderMenu.updatePerfectScrollbar();
});
};
HeaderMenu.updatePerfectScrollbar = function() {
if (HeaderMenu.perfectScrollbar !== null) {
HeaderMenu.perfectScrollbar.update();
}
};
HeaderMenu.showSearchBox = function() {
$(HeaderMenu.SELECTOR_SEARCH_ICON).addClass("active");
$(HeaderMenu.SELECTOR_SEARCH_BOX).fadeIn(getAnimationDuration());
$(HeaderMenu.SELECTOR_SEARCH_INPUT).focus();
};
HeaderMenu.hideSearchBox = function() {
$(HeaderMenu.SELECTOR_SEARCH_ICON).removeClass("active");
$(HeaderMenu.SELECTOR_SEARCH_BOX).fadeOut(getAnimationDuration());
$(HeaderMenu.SELECTOR_SEARCH_INPUT).blur();
};
HeaderMenu.isSearchBoxShown = function() {
return $(HeaderMenu.SELECTOR_SEARCH_BOX).is(":visible");
};
HeaderMenu.SELECTOR_HEADER = "#thinHeader";
HeaderMenu.SELECTOR_MENU_ICON = "#thinHeaderMenuIcon";
HeaderMenu.SELECTOR_MENU_BACKGROUND = "#thinHeaderMenuFixedPlacement";
HeaderMenu.SELECTOR_MENU_BOX = "#thinHeaderMenu";
HeaderMenu.SELECTOR_MENU_ITEM = HeaderMenu.SELECTOR_MENU_BOX + " .menuItem";
HeaderMenu.ATTR_SUB_MENU = "data-sub-menu";
HeaderMenu.AVAL_SUB_MENU_HIDDEN = "hidden";
HeaderMenu.AVAL_SUB_MENU_VISIBLE = "visible";
HeaderMenu.CLASS_ITEM_WITH_SUB_MENU = "hasSubMenu";
HeaderMenu.CLASS_ITEM_WITH_SUB_MENU_NEVER_CLOSE = "subMenuNeverClose";
HeaderMenu.CLASS_BODY_MENU_OPEN = "thinHeaderMenuVisible";
HeaderMenu.SELECTOR_SEARCH_ICON = "#thinHeaderSearchIcon";
HeaderMenu.SELECTOR_SEARCH_BOX = ".etutorHeaderSearchBoxWrapper";
HeaderMenu.SELECTOR_SEARCH_INPUT = HeaderMenu.SELECTOR_SEARCH_BOX + ' input[type="search"]';
HeaderMenu.SELECTOR_SEARCH_AUTOCOMPLETE_BOX = HeaderMenu.SELECTOR_SEARCH_BOX + " .autocompleteResults";
HeaderMenu._INSTANCE = new HeaderMenu();
HeaderMenu._initialised = false;
HeaderMenu.perfectScrollbar = null;
return HeaderMenu;
}();

var RepetitionsCore = function() {
function RepetitionsCore() {}
RepetitionsCore.onNumRepetitionsChanged = function(numRepetitionsForToday, remainingNumberOfRepetitionsHtmlInfo, numRepetitionsQueued) {
$(".remainingNumberOfRepetitionsContainer").html(remainingNumberOfRepetitionsHtmlInfo);
if (numRepetitionsForToday == 0 && numRepetitionsQueued > 0) {
$(".numRepetitionsForTodayCounter").text("+" + numRepetitionsQueued).addClass("hasElementsQueued");
var cookieVal = Cookies.get(this.REVIEWING_NEW_REPETITION_ELEMENTS_COOKIE_NAME);
if (cookieVal !== undefined || cookieVal === undefined && typeof RepetitionQueue !== "undefined" && RepetitionQueue.numNewRepetitionsDuringEndingToday > numRepetitionsQueued) {
RepetitionsCore.setCookieForVotingNewElements();
$(".finishedTableCloseable").hide();
$(".progressbarWrapper").hide();
}
} else if (numRepetitionsForToday >= 0 && numRepetitionsQueued == 0) {
numRepetitionsForToday = numRepetitionsForToday > 0 ? numRepetitionsForToday : "";
$(".numRepetitionsForTodayCounter").text(numRepetitionsForToday).removeClass("hasElementsQueued");
} else if (numRepetitionsForToday > 0 && numRepetitionsQueued > 0) {
$(".numRepetitionsForTodayCounter").text(numRepetitionsForToday + " (+" + numRepetitionsQueued + ")").addClass("hasElementsQueued");
}
};
RepetitionsCore.setCookieForVotingNewElements = function() {
Cookies.set(this.REVIEWING_NEW_REPETITION_ELEMENTS_COOKIE_NAME, "true", {
expires: 1 / 24 / 30
});
};
RepetitionsCore.REVIEWING_NEW_REPETITION_ELEMENTS_COOKIE_NAME = "votingNewRepetition";
return RepetitionsCore;
}();

var LogExtendedError = function() {
function LogExtendedError(message, name) {
if (name === void 0) {
name = "Undifined Error";
}
this.message = message;
this.messageForLogs = message;
this.name = name;
this.stack = new Error().stack;
}
return LogExtendedError;
}();

var UserMediaError = function() {
function UserMediaError(name, message, helpPageUrl) {
if (name === void 0) {
name = "User Media Error";
}
if (message === void 0) {
message = "Unspecified media error";
}
this.name = name;
this.message = message;
this.helpPageUrl = helpPageUrl;
this.stack = new Error().stack;
}
UserMediaError.prototype.ajaxGetHelpPageHtml = function() {
return $.get(this.helpPageUrl);
};
return UserMediaError;
}();

var RequirementsUnsatisfied = function(_super) {
__extends(RequirementsUnsatisfied, _super);
function RequirementsUnsatisfied(message) {
return _super.call(this, "RequirementsUnsatisfied", message, "/game/help/media-problems/recording-not-supported") || this;
}
return RequirementsUnsatisfied;
}(UserMediaError);

var PlaybackFailure = function(_super) {
__extends(PlaybackFailure, _super);
function PlaybackFailure(message) {
return _super.call(this, "PlaybackFailure", message, "/game/help/media-problems/pronunciation-trainer-failure") || this;
}
return PlaybackFailure;
}(UserMediaError);

var PlaybackInterruptedByUser = function(_super) {
__extends(PlaybackInterruptedByUser, _super);
function PlaybackInterruptedByUser(message) {
if (message === void 0) {
message = "Użytkownik przerwał odtwarzanie";
}
return _super.call(this, message) || this;
}
return PlaybackInterruptedByUser;
}(PlaybackFailure);

$(document).on("click", "[gtag-event-category]", function(event) {
if (typeof gtag === "function") {
gtag("event", $(this).attr("gtag-event-action"), {
event_category: $(this).attr("gtag-event-category"),
event_label: $(this).attr("gtag-event-label")
});
}
});

!function(e) {
if ("object" == typeof exports && "undefined" != typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else {
var f;
"undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), 
f.Slideout = e();
}
}(function() {
var define, module, exports;
return function e(t, n, r) {
function s(o, u) {
if (!n[o]) {
if (!t[o]) {
var a = typeof require == "function" && require;
if (!u && a) return a(o, !0);
if (i) return i(o, !0);
var f = new Error("Cannot find module '" + o + "'");
throw f.code = "MODULE_NOT_FOUND", f;
}
var l = n[o] = {
exports: {}
};
t[o][0].call(l.exports, function(e) {
var n = t[o][1][e];
return s(n ? n : e);
}, l, l.exports, e, t, n, r);
}
return n[o].exports;
}
var i = typeof require == "function" && require;
for (var o = 0; o < r.length; o++) s(r[o]);
return s;
}({
1: [ function(require, module, exports) {
"use strict";
var decouple = require("decouple");
var Emitter = require("emitter");
var scrollTimeout;
var scrolling = false;
var doc = window.document;
var html = doc.documentElement;
var msPointerSupported = window.navigator.msPointerEnabled;
var touch = {
start: msPointerSupported ? "MSPointerDown" : "touchstart",
move: msPointerSupported ? "MSPointerMove" : "touchmove",
end: msPointerSupported ? "MSPointerUp" : "touchend"
};
var prefix = function prefix() {
var regex = /^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/;
var styleDeclaration = doc.getElementsByTagName("script")[0].style;
for (var prop in styleDeclaration) {
if (regex.test(prop)) {
return "-" + prop.match(regex)[0].toLowerCase() + "-";
}
}
if ("WebkitOpacity" in styleDeclaration) {
return "-webkit-";
}
if ("KhtmlOpacity" in styleDeclaration) {
return "-khtml-";
}
return "";
}();
function extend(destination, from) {
for (var prop in from) {
if (from[prop]) {
destination[prop] = from[prop];
}
}
return destination;
}
function inherits(child, uber) {
child.prototype = extend(child.prototype || {}, uber.prototype);
}
function hasIgnoredElements(el) {
while (el.parentNode) {
if (el.getAttribute("data-slideout-ignore") !== null) {
return el;
}
el = el.parentNode;
}
return null;
}
function Slideout(options) {
options = options || {};
this._startOffsetX = 0;
this._currentOffsetX = 0;
this._opening = false;
this._moved = false;
this._opened = false;
this._preventOpen = false;
this.panel = options.panel;
this.menu = options.menu;
this.menuMoveable = true;
this._touch = options.touch === undefined ? true : options.touch && true;
this._side = options.side || "left";
this._easing = options.fx || options.easing || "ease";
this._duration = parseInt(options.duration, 10) || 300;
this._tolerance = parseInt(options.tolerance, 10) || 70;
this._leftPixels = parseInt(options.leftPixels, 10) || 20;
this._padding = this._translateTo = parseInt(options.padding, 10) || 256;
this._orientation = this._side === "right" ? -1 : 1;
this._translateTo *= this._orientation;
if (!$(this.panel).hasClass("slideout-panel")) {
$(this.panel).addClass("slideout-panel");
}
if (!$(this.panel).hasClass("slideout-panel-" + this._side)) {
$(this.panel).addClass("slideout-panel-" + this._side);
}
if (!$(this.menu).hasClass("slideout-menu")) {
$(this.menu).addClass("slideout-menu");
}
if (!$(this.menu).hasClass("slideout-menu-" + this._side)) {
$(this.menu).addClass("slideout-menu-" + this._side);
}
if (this._touch) {
this._initTouchEvents();
}
}
inherits(Slideout, Emitter);
Slideout.prototype.open = function() {
var self = this;
this.emit("beforeopen");
if (!$(html).hasClass("slideout-open")) {
$(html).addClass("slideout-open");
}
this._setTransition();
if (this.menuMoveable) {
this._openAnimation(this._translateTo);
} else {
this._translateXTo(this._translateTo);
}
this._opened = true;
setTimeout(function() {
if (self.menuMoveable) {
self.menu.style.transition = self.menu.style["-webkit-transition"] = "";
} else {
self.panel.style.transition = self.panel.style["-webkit-transition"] = "";
}
self.emit("open");
}, this._duration + 50);
return this;
};
Slideout.prototype.close = function() {
var self = this;
if (!this.isOpen() && !this._opening) {
return this;
}
this.emit("beforeclose");
this._setTransition();
if (this.menuMoveable) {
this._closeAnimation(0);
} else {
this._translateXTo(0);
}
this._opened = false;
setTimeout(function() {
$(html).removeClass("slideout-open");
if (self.menuMoveable) {
self.menu.style.transition = self.menu.style["-webkit-transition"] = self.menu.style[prefix + "transform"] = self.menu.style.transform = "";
} else {
self.panel.style.transition = self.panel.style["-webkit-transition"] = self.panel.style[prefix + "transform"] = self.panel.style.transform = "";
}
self.emit("close");
}, this._duration + 50);
return this;
};
Slideout.prototype.toggle = function() {
return this.isOpen() ? this.close() : this.open();
};
Slideout.prototype.isOpen = function() {
return this._opened;
};
Slideout.prototype._translateXTo = function(translateX) {
this._currentOffsetX = translateX;
this.panel.style[prefix + "transform"] = this.panel.style.transform = "translateX(" + translateX + "px)";
return this;
};
Slideout.prototype._openAnimation = function(translateX) {
var self = this;
this.menu.style["display"] = "block";
setTimeout(function() {
self.menu.style[prefix + "transform"] = self.menu.style.transform = "translateX(" + translateX + "px)";
}, 20);
return this;
};
Slideout.prototype._closeAnimation = function(translateX) {
this.menu.style[prefix + "transform"] = this.menu.style.transform = "translateX(" + translateX + "px)";
var self = this;
setTimeout(function() {
self.menu.style["display"] = "none";
}, this._duration);
return this;
};
Slideout.prototype._setTransition = function() {
if (this.menuMoveable) {
this.menu.style[prefix + "transition"] = this.menu.style.transition = prefix + "transform " + this._duration + "ms " + this._easing;
} else {
this.panel.style[prefix + "transition"] = this.panel.style.transition = prefix + "transform " + this._duration + "ms " + this._easing;
}
return this;
};
Slideout.prototype._initTouchEvents = function() {
var self = this;
this._onScrollFn = decouple(doc, "scroll", function() {
if (!self._moved) {
clearTimeout(scrollTimeout);
scrolling = true;
scrollTimeout = setTimeout(function() {
scrolling = false;
}, 250);
}
});
this._preventMove = function(eve) {
if (self._moved) {
eve.preventDefault();
}
};
doc.addEventListener(touch.move, this._preventMove);
this._resetTouchFn = function(eve) {
if (typeof eve.touches === "undefined") {
return;
}
self._moved = false;
self._opening = false;
self._startOffsetX = eve.touches[0].pageX;
self._preventOpen = !self._touch || !self.isOpen() && self.menu.clientWidth !== 0;
};
this.panel.addEventListener(touch.start, this._resetTouchFn);
this.menu.addEventListener(touch.start, this._resetTouchFn);
this._onTouchCancelFn = function() {
self._moved = false;
self._opening = false;
};
this.panel.addEventListener("touchcancel", this._onTouchCancelFn);
this._onTouchEndFn = function() {
if (self._moved) {
self.emit("translateend");
self._opening && Math.abs(self._currentOffsetX) > self._tolerance ? self.open() : self.close();
}
self._moved = false;
};
this.panel.addEventListener(touch.end, this._onTouchEndFn);
this.menu.addEventListener(touch.end, this._onTouchEndFn);
this._onTouchMoveFn = function(eve) {
if (!self.isOpen() && self._startOffsetX > self._leftPixels || self.isOpen() && self._startOffsetX < self._padding / 2) {
return;
}
if (scrolling || self._preventOpen || typeof eve.touches === "undefined" || hasIgnoredElements(eve.target)) {
return;
}
var dif_x = eve.touches[0].clientX - self._startOffsetX;
var translateX = self._currentOffsetX = dif_x;
if (Math.abs(translateX) > self._padding) {
return;
}
if (Math.abs(dif_x) > 10) {
self._opening = true;
var oriented_dif_x = dif_x * self._orientation;
if (self._opened && oriented_dif_x > 0 || !self._opened && oriented_dif_x < 0) {
return;
}
if (!self._moved) {
self.emit("translatestart");
}
if (oriented_dif_x <= 0) {
translateX = dif_x + self._padding * self._orientation;
self._opening = false;
}
if (!(self._moved && $(html).hasClass("slideout-open"))) {
$(html).addClass("slideout-open");
}
if (self.menuMoveable) {
self.menu.style["display"] = "block";
self.menu.style[prefix + "transform"] = self.menu.style.transform = "translateX(" + translateX + "px)";
} else {
self.panel.style[prefix + "transform"] = self.panel.style.transform = "translateX(" + translateX + "px)";
}
self.emit("translate", translateX);
self._moved = true;
}
};
this.panel.addEventListener(touch.move, this._onTouchMoveFn);
this.menu.addEventListener(touch.move, this._onTouchMoveFn);
return this;
};
Slideout.prototype.enableTouch = function() {
this._touch = true;
return this;
};
Slideout.prototype.disableTouch = function() {
this._touch = false;
return this;
};
Slideout.prototype.destroy = function() {
this.close();
doc.removeEventListener(touch.move, this._preventMove);
this.panel.removeEventListener(touch.start, this._resetTouchFn);
this.panel.removeEventListener("touchcancel", this._onTouchCancelFn);
this.panel.removeEventListener(touch.end, this._onTouchEndFn);
this.panel.removeEventListener(touch.move, this._onTouchMoveFn);
doc.removeEventListener("scroll", this._onScrollFn);
this.open = this.close = function() {};
return this;
};
module.exports = Slideout;
}, {
decouple: 2,
emitter: 3
} ],
2: [ function(require, module, exports) {
"use strict";
var requestAnimFrame = function() {
return window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(callback) {
window.setTimeout(callback, 1e3 / 60);
};
}();
function decouple(node, event, fn) {
var eve, tracking = false;
function captureEvent(e) {
eve = e;
track();
}
function track() {
if (!tracking) {
requestAnimFrame(update);
tracking = true;
}
}
function update() {
fn.call(node, eve);
tracking = false;
}
node.addEventListener(event, captureEvent, false);
return captureEvent;
}
module.exports = decouple;
}, {} ],
3: [ function(require, module, exports) {
"use strict";
var _classCallCheck = function(instance, Constructor) {
if (!(instance instanceof Constructor)) {
throw new TypeError("Cannot call a class as a function");
}
};
exports.__esModule = true;
var Emitter = function() {
function Emitter() {
_classCallCheck(this, Emitter);
}
Emitter.prototype.on = function on(event, listener) {
this._eventCollection = this._eventCollection || {};
this._eventCollection[event] = this._eventCollection[event] || [];
this._eventCollection[event].push(listener);
return this;
};
Emitter.prototype.once = function once(event, listener) {
var self = this;
function fn() {
self.off(event, fn);
listener.apply(this, arguments);
}
fn.listener = listener;
this.on(event, fn);
return this;
};
Emitter.prototype.off = function off(event, listener) {
var listeners = undefined;
if (!this._eventCollection || !(listeners = this._eventCollection[event])) {
return this;
}
listeners.forEach(function(fn, i) {
if (fn === listener || fn.listener === listener) {
listeners.splice(i, 1);
}
});
if (listeners.length === 0) {
delete this._eventCollection[event];
}
return this;
};
Emitter.prototype.emit = function emit(event) {
var _this = this;
for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
args[_key - 1] = arguments[_key];
}
var listeners = undefined;
if (!this._eventCollection || !(listeners = this._eventCollection[event])) {
return this;
}
listeners = listeners.slice(0);
listeners.forEach(function(fn) {
return fn.apply(_this, args);
});
return this;
};
return Emitter;
}();
exports["default"] = Emitter;
module.exports = exports["default"];
}, {} ]
}, {}, [ 1 ])(1);
});

$(function() {
if (BrowserUtils.isMobileAppMode() && document.getElementById("contentWrapper") && document.getElementById("thinHeaderMenuFixedPlacement")) {
var slideout = new Slideout({
panel: document.getElementById("contentWrapper"),
menu: document.getElementById("thinHeaderMenuFixedPlacement"),
padding: 300,
tolerance: 70,
duration: 300,
leftPixels: 40,
touch: !$("body").hasClass("disableMenuSlidingFromTheLeft")
});
slideout.on("beforeopen", function() {
$(this.panel).addClass("panel-open");
}).on("beforeclose", function() {}).on("close", function() {
$(this.panel).removeClass("panel-open");
});
$(document).on("click", HeaderMenu.SELECTOR_MENU_ICON, function(e) {
e.preventDefault();
e.stopPropagation();
slideout.toggle();
});
$(document).on(BrowserUtils.isiOS() ? "touchstart" : "click", function(event) {
if ($(event.target).closest(HeaderMenu.SELECTOR_MENU_ICON).length == 1) {
return;
}
if ($(event.target).closest(HeaderMenu.SELECTOR_MENU_BOX).length == 1) {
return;
}
slideout.close();
});
}
});

var DarkMode = function() {
function DarkMode() {}
DarkMode.initialize = function() {
$("#darkModeChanger").on("change", function(e) {
e.preventDefault();
var darkMode = false;
if ($(this).prop("checked")) {
darkMode = true;
}
$.post("/profil/ustawienia/ajaxDarkMode", {
darkMode: darkMode
}).done(function(data) {
if (data["darkMode"]) {
$("body").addClass("darkMode");
} else {
$("body").removeClass("darkMode");
}
});
});
};
return DarkMode;
}();

$(function() {
DarkMode.initialize();
});

$(function() {
DikiHeader.initialize();
if (BrowserUtils.isiOS() && BrowserUtils.isMobileAppMode()) {
var repairScroll = function() {
$("div.dikitop").css({
position: "fixed",
top: 0
});
$("input.dikiSearchInputField").trigger("blur");
};
$("#contentWrapper").on("touchstart", repairScroll);
if (BrowserUtils.isIpad()) {
$("input.dikiSearchInputField").on("focus", function() {
var $scrollTop = $(document).scrollTop();
$("div.dikitop").css({
position: "absolute",
top: $scrollTop - 1
});
});
}
}
});

var DikiHeader = function() {
function DikiHeader() {}
DikiHeader.initialize = function() {
HeaderMenu.getInstance().init();
$(document).scroll(DikiHeader.scrollRoundAndRound);
};
DikiHeader.scrollRoundAndRound = function() {
if ($(document).scrollTop() > 10) {
$("#thinHeaderMenuFixedPlacement").addClass("onTop");
return;
}
$("#thinHeaderMenuFixedPlacement").removeClass("onTop");
};
return DikiHeader;
}();
