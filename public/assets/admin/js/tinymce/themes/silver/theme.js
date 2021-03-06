(function () {
var silver = (function () {
    'use strict';

    var noop = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
    };
    var noarg = function (f) {
      return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return f();
      };
    };
    var compose = function (fa, fb) {
      return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return fa(fb.apply(null, args));
      };
    };
    var constant = function (value) {
      return function () {
        return value;
      };
    };
    var identity = function (x) {
      return x;
    };
    function curry(fn) {
      var initialArgs = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        initialArgs[_i - 1] = arguments[_i];
      }
      return function () {
        var restArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          restArgs[_i] = arguments[_i];
        }
        var all = initialArgs.concat(restArgs);
        return fn.apply(null, all);
      };
    }
    var not = function (f) {
      return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return !f.apply(null, args);
      };
    };
    var die = function (msg) {
      return function () {
        throw new Error(msg);
      };
    };
    var never = constant(false);
    var always = constant(true);

    var never$1 = never;
    var always$1 = always;
    var none = function () {
      return NONE;
    };
    var NONE = function () {
      var eq = function (o) {
        return o.isNone();
      };
      var call$$1 = function (thunk) {
        return thunk();
      };
      var id = function (n) {
        return n;
      };
      var noop$$1 = function () {
      };
      var nul = function () {
        return null;
      };
      var undef = function () {
        return undefined;
      };
      var me = {
        fold: function (n, s) {
          return n();
        },
        is: never$1,
        isSome: never$1,
        isNone: always$1,
        getOr: id,
        getOrThunk: call$$1,
        getOrDie: function (msg) {
          throw new Error(msg || 'error: getOrDie called on none.');
        },
        getOrNull: nul,
        getOrUndefined: undef,
        or: id,
        orThunk: call$$1,
        map: none,
        ap: none,
        each: noop$$1,
        bind: none,
        flatten: none,
        exists: never$1,
        forall: always$1,
        filter: none,
        equals: eq,
        equals_: eq,
        toArray: function () {
          return [];
        },
        toString: constant('none()')
      };
      if (Object.freeze)
        Object.freeze(me);
      return me;
    }();
    var some = function (a) {
      var constant_a = function () {
        return a;
      };
      var self = function () {
        return me;
      };
      var map = function (f) {
        return some(f(a));
      };
      var bind = function (f) {
        return f(a);
      };
      var me = {
        fold: function (n, s) {
          return s(a);
        },
        is: function (v) {
          return a === v;
        },
        isSome: always$1,
        isNone: never$1,
        getOr: constant_a,
        getOrThunk: constant_a,
        getOrDie: constant_a,
        getOrNull: constant_a,
        getOrUndefined: constant_a,
        or: self,
        orThunk: self,
        map: map,
        ap: function (optfab) {
          return optfab.fold(none, function (fab) {
            return some(fab(a));
          });
        },
        each: function (f) {
          f(a);
        },
        bind: bind,
        flatten: constant_a,
        exists: bind,
        forall: bind,
        filter: function (f) {
          return f(a) ? me : NONE;
        },
        equals: function (o) {
          return o.is(a);
        },
        equals_: function (o, elementEq) {
          return o.fold(never$1, function (b) {
            return elementEq(a, b);
          });
        },
        toArray: function () {
          return [a];
        },
        toString: function () {
          return 'some(' + a + ')';
        }
      };
      return me;
    };
    var from = function (value) {
      return value === null || value === undefined ? NONE : some(value);
    };
    var Option = {
      some: some,
      none: none,
      from: from
    };

    var typeOf = function (x) {
      if (x === null)
        return 'null';
      var t = typeof x;
      if (t === 'object' && Array.prototype.isPrototypeOf(x))
        return 'array';
      if (t === 'object' && String.prototype.isPrototypeOf(x))
        return 'string';
      return t;
    };
    var isType = function (type) {
      return function (value) {
        return typeOf(value) === type;
      };
    };
    var isString = isType('string');
    var isObject = isType('object');
    var isArray = isType('array');
    var isBoolean = isType('boolean');
    var isFunction = isType('function');
    var isNumber = isType('number');

    var rawIndexOf = function () {
      var pIndexOf = Array.prototype.indexOf;
      var fastIndex = function (xs, x) {
        return pIndexOf.call(xs, x);
      };
      var slowIndex = function (xs, x) {
        return slowIndexOf(xs, x);
      };
      return pIndexOf === undefined ? slowIndex : fastIndex;
    }();
    var indexOf = function (xs, x) {
      var r = rawIndexOf(xs, x);
      return r === -1 ? Option.none() : Option.some(r);
    };
    var contains = function (xs, x) {
      return rawIndexOf(xs, x) > -1;
    };
    var exists = function (xs, pred) {
      return findIndex(xs, pred).isSome();
    };
    var chunk = function (array, size) {
      var r = [];
      for (var i = 0; i < array.length; i += size) {
        var s = array.slice(i, i + size);
        r.push(s);
      }
      return r;
    };
    var map = function (xs, f) {
      var len = xs.length;
      var r = new Array(len);
      for (var i = 0; i < len; i++) {
        var x = xs[i];
        r[i] = f(x, i, xs);
      }
      return r;
    };
    var each = function (xs, f) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        f(x, i, xs);
      }
    };
    var eachr = function (xs, f) {
      for (var i = xs.length - 1; i >= 0; i--) {
        var x = xs[i];
        f(x, i, xs);
      }
    };
    var partition = function (xs, pred) {
      var pass = [];
      var fail = [];
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        var arr = pred(x, i, xs) ? pass : fail;
        arr.push(x);
      }
      return {
        pass: pass,
        fail: fail
      };
    };
    var filter = function (xs, pred) {
      var r = [];
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        if (pred(x, i, xs)) {
          r.push(x);
        }
      }
      return r;
    };
    var foldr = function (xs, f, acc) {
      eachr(xs, function (x) {
        acc = f(acc, x);
      });
      return acc;
    };
    var foldl = function (xs, f, acc) {
      each(xs, function (x) {
        acc = f(acc, x);
      });
      return acc;
    };
    var find = function (xs, pred) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        if (pred(x, i, xs)) {
          return Option.some(x);
        }
      }
      return Option.none();
    };
    var findIndex = function (xs, pred) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        if (pred(x, i, xs)) {
          return Option.some(i);
        }
      }
      return Option.none();
    };
    var slowIndexOf = function (xs, x) {
      for (var i = 0, len = xs.length; i < len; ++i) {
        if (xs[i] === x) {
          return i;
        }
      }
      return -1;
    };
    var push = Array.prototype.push;
    var flatten = function (xs) {
      var r = [];
      for (var i = 0, len = xs.length; i < len; ++i) {
        if (!Array.prototype.isPrototypeOf(xs[i]))
          throw new Error('Arr.flatten item ' + i + ' was not an array, input: ' + xs);
        push.apply(r, xs[i]);
      }
      return r;
    };
    var bind = function (xs, f) {
      var output = map(xs, f);
      return flatten(output);
    };
    var forall = function (xs, pred) {
      for (var i = 0, len = xs.length; i < len; ++i) {
        var x = xs[i];
        if (pred(x, i, xs) !== true) {
          return false;
        }
      }
      return true;
    };
    var slice = Array.prototype.slice;
    var reverse = function (xs) {
      var r = slice.call(xs, 0);
      r.reverse();
      return r;
    };
    var difference = function (a1, a2) {
      return filter(a1, function (x) {
        return !contains(a2, x);
      });
    };
    var pure = function (x) {
      return [x];
    };
    var sort = function (xs, comparator) {
      var copy = slice.call(xs, 0);
      copy.sort(comparator);
      return copy;
    };
    var head = function (xs) {
      return xs.length === 0 ? Option.none() : Option.some(xs[0]);
    };
    var last = function (xs) {
      return xs.length === 0 ? Option.none() : Option.some(xs[xs.length - 1]);
    };
    var from$1 = isFunction(Array.from) ? Array.from : function (x) {
      return slice.call(x);
    };

    var keys = Object.keys;
    var hasOwnProperty = Object.hasOwnProperty;
    var each$1 = function (obj, f) {
      var props = keys(obj);
      for (var k = 0, len = props.length; k < len; k++) {
        var i = props[k];
        var x = obj[i];
        f(x, i, obj);
      }
    };
    var map$1 = function (obj, f) {
      return tupleMap(obj, function (x, i, obj) {
        return {
          k: i,
          v: f(x, i, obj)
        };
      });
    };
    var tupleMap = function (obj, f) {
      var r = {};
      each$1(obj, function (x, i) {
        var tuple = f(x, i, obj);
        r[tuple.k] = tuple.v;
      });
      return r;
    };
    var mapToArray = function (obj, f) {
      var r = [];
      each$1(obj, function (value, name) {
        r.push(f(value, name));
      });
      return r;
    };
    var find$1 = function (obj, pred) {
      var props = keys(obj);
      for (var k = 0, len = props.length; k < len; k++) {
        var i = props[k];
        var x = obj[i];
        if (pred(x, i, obj)) {
          return Option.some(x);
        }
      }
      return Option.none();
    };
    var values = function (obj) {
      return mapToArray(obj, function (v) {
        return v;
      });
    };
    var get = function (obj, key) {
      return has(obj, key) ? Option.some(obj[key]) : Option.none();
    };
    var has = function (obj, key) {
      return hasOwnProperty.call(obj, key);
    };

    var exclude = function (obj, fields) {
      var r = {};
      each$1(obj, function (v, k) {
        if (!contains(fields, k)) {
          r[k] = v;
        }
      });
      return r;
    };

    var readOpt = function (key) {
      return function (obj) {
        return has(obj, key) ? Option.from(obj[key]) : Option.none();
      };
    };
    var readOr = function (key, fallback) {
      return function (obj) {
        return has(obj, key) ? obj[key] : fallback;
      };
    };
    var readOptFrom = function (obj, key) {
      return readOpt(key)(obj);
    };
    var hasKey = function (obj, key) {
      return has(obj, key) && obj[key] !== undefined && obj[key] !== null;
    };

    var wrap = function (key, value) {
      var r = {};
      r[key] = value;
      return r;
    };
    var wrapAll = function (keyvalues) {
      var r = {};
      each(keyvalues, function (kv) {
        r[kv.key] = kv.value;
      });
      return r;
    };

    var value = function (o) {
      var is = function (v) {
        return o === v;
      };
      var or = function (opt) {
        return value(o);
      };
      var orThunk = function (f) {
        return value(o);
      };
      var map = function (f) {
        return value(f(o));
      };
      var mapError = function (f) {
        return value(o);
      };
      var each = function (f) {
        f(o);
      };
      var bind = function (f) {
        return f(o);
      };
      var fold = function (_, onValue) {
        return onValue(o);
      };
      var exists = function (f) {
        return f(o);
      };
      var forall = function (f) {
        return f(o);
      };
      var toOption = function () {
        return Option.some(o);
      };
      return {
        is: is,
        isValue: always,
        isError: never,
        getOr: constant(o),
        getOrThunk: constant(o),
        getOrDie: constant(o),
        or: or,
        orThunk: orThunk,
        fold: fold,
        map: map,
        mapError: mapError,
        each: each,
        bind: bind,
        exists: exists,
        forall: forall,
        toOption: toOption
      };
    };
    var error = function (message) {
      var getOrThunk = function (f) {
        return f();
      };
      var getOrDie = function () {
        return die(String(message))();
      };
      var or = function (opt) {
        return opt;
      };
      var orThunk = function (f) {
        return f();
      };
      var map = function (f) {
        return error(message);
      };
      var mapError = function (f) {
        return error(f(message));
      };
      var bind = function (f) {
        return error(message);
      };
      var fold = function (onError, _) {
        return onError(message);
      };
      return {
        is: never,
        isValue: never,
        isError: always,
        getOr: identity,
        getOrThunk: getOrThunk,
        getOrDie: getOrDie,
        or: or,
        orThunk: orThunk,
        fold: fold,
        map: map,
        mapError: mapError,
        each: noop,
        bind: bind,
        exists: never,
        forall: always,
        toOption: Option.none
      };
    };
    var Result = {
      value: value,
      error: error
    };

    var generate = function (cases) {
      if (!isArray(cases)) {
        throw new Error('cases must be an array');
      }
      if (cases.length === 0) {
        throw new Error('there must be at least one case');
      }
      var constructors = [];
      var adt = {};
      each(cases, function (acase, count) {
        var keys$$1 = keys(acase);
        if (keys$$1.length !== 1) {
          throw new Error('one and only one name per case');
        }
        var key = keys$$1[0];
        var value = acase[key];
        if (adt[key] !== undefined) {
          throw new Error('duplicate key detected:' + key);
        } else if (key === 'cata') {
          throw new Error('cannot have a case named cata (sorry)');
        } else if (!isArray(value)) {
          throw new Error('case arguments must be an array');
        }
        constructors.push(key);
        adt[key] = function () {
          var argLength = arguments.length;
          if (argLength !== value.length) {
            throw new Error('Wrong number of arguments to case ' + key + '. Expected ' + value.length + ' (' + value + '), got ' + argLength);
          }
          var args = new Array(argLength);
          for (var i = 0; i < args.length; i++)
            args[i] = arguments[i];
          var match = function (branches) {
            var branchKeys = keys(branches);
            if (constructors.length !== branchKeys.length) {
              throw new Error('Wrong number of arguments to match. Expected: ' + constructors.join(',') + '\nActual: ' + branchKeys.join(','));
            }
            var allReqd = forall(constructors, function (reqKey) {
              return contains(branchKeys, reqKey);
            });
            if (!allReqd)
              throw new Error('Not all branches were specified when using match. Specified: ' + branchKeys.join(', ') + '\nRequired: ' + constructors.join(', '));
            return branches[key].apply(null, args);
          };
          return {
            fold: function () {
              if (arguments.length !== cases.length) {
                throw new Error('Wrong number of arguments to fold. Expected ' + cases.length + ', got ' + arguments.length);
              }
              var target = arguments[count];
              return target.apply(null, args);
            },
            match: match,
            log: function (label) {
              console.log(label, {
                constructors: constructors,
                constructor: key,
                params: args
              });
            }
          };
        };
      });
      return adt;
    };
    var Adt = { generate: generate };

    var comparison = Adt.generate([
      {
        bothErrors: [
          'error1',
          'error2'
        ]
      },
      {
        firstError: [
          'error1',
          'value2'
        ]
      },
      {
        secondError: [
          'value1',
          'error2'
        ]
      },
      {
        bothValues: [
          'value1',
          'value2'
        ]
      }
    ]);
    var partition$1 = function (results) {
      var errors = [];
      var values = [];
      each(results, function (result) {
        result.fold(function (err) {
          errors.push(err);
        }, function (value) {
          values.push(value);
        });
      });
      return {
        errors: errors,
        values: values
      };
    };

    var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
    var shallow = function (old, nu) {
      return nu;
    };
    var deep = function (old, nu) {
      var bothObjects = isObject(old) && isObject(nu);
      return bothObjects ? deepMerge(old, nu) : nu;
    };
    var baseMerge = function (merger) {
      return function () {
        var objects = new Array(arguments.length);
        for (var i = 0; i < objects.length; i++)
          objects[i] = arguments[i];
        if (objects.length === 0)
          throw new Error('Can\'t merge zero objects');
        var ret = {};
        for (var j = 0; j < objects.length; j++) {
          var curObject = objects[j];
          for (var key in curObject)
            if (hasOwnProperty$1.call(curObject, key)) {
              ret[key] = merger(ret[key], curObject[key]);
            }
        }
        return ret;
      };
    };
    var deepMerge = baseMerge(deep);
    var merge = baseMerge(shallow);

    var exclude$1 = function (obj, fields) {
      return exclude(obj, fields);
    };
    var readOpt$1 = function (key) {
      return readOpt(key);
    };
    var readOr$1 = function (key, fallback) {
      return readOr(key, fallback);
    };
    var readOptFrom$1 = function (obj, key) {
      return readOptFrom(obj, key);
    };
    var wrap$1 = function (key, value) {
      return wrap(key, value);
    };
    var wrapAll$1 = function (keyvalues) {
      return wrapAll(keyvalues);
    };
    var mergeValues = function (values, base) {
      return values.length === 0 ? Result.value(base) : Result.value(deepMerge(base, merge.apply(undefined, values)));
    };
    var mergeErrors = function (errors) {
      return compose(Result.error, flatten)(errors);
    };
    var consolidate = function (objs, base) {
      var partitions = partition$1(objs);
      return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : mergeValues(partitions.values, base);
    };
    var hasKey$1 = function (obj, key) {
      return hasKey(obj, key);
    };

    var Cell = function (initial) {
      var value = initial;
      var get = function () {
        return value;
      };
      var set = function (v) {
        value = v;
      };
      var clone = function () {
        return Cell(get());
      };
      return {
        get: get,
        set: set,
        clone: clone
      };
    };

    var cat = function (arr) {
      var r = [];
      var push = function (x) {
        r.push(x);
      };
      for (var i = 0; i < arr.length; i++) {
        arr[i].each(push);
      }
      return r;
    };
    var findMap = function (arr, f) {
      for (var i = 0; i < arr.length; i++) {
        var r = f(arr[i], i);
        if (r.isSome()) {
          return r;
        }
      }
      return Option.none();
    };
    var liftN = function (arr, f) {
      var r = [];
      for (var i = 0; i < arr.length; i++) {
        var x = arr[i];
        if (x.isSome()) {
          r.push(x.getOrDie());
        } else {
          return Option.none();
        }
      }
      return Option.some(f.apply(null, r));
    };

    var touchstart = constant('touchstart');
    var touchmove = constant('touchmove');
    var touchend = constant('touchend');
    var mousedown = constant('mousedown');
    var mousemove = constant('mousemove');
    var mouseout = constant('mouseout');
    var mouseup = constant('mouseup');
    var mouseover = constant('mouseover');
    var focusin = constant('focusin');
    var focusout = constant('focusout');
    var keydown = constant('keydown');
    var keyup = constant('keyup');
    var input = constant('input');
    var change = constant('change');
    var click = constant('click');
    var transitionend = constant('transitionend');
    var selectstart = constant('selectstart');
    var paste = constant('paste');

    var cached = function (f) {
      var called = false;
      var r;
      return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        if (!called) {
          called = true;
          r = f.apply(null, args);
        }
        return r;
      };
    };

    var firstMatch = function (regexes, s) {
      for (var i = 0; i < regexes.length; i++) {
        var x = regexes[i];
        if (x.test(s))
          return x;
      }
      return undefined;
    };
    var find$2 = function (regexes, agent) {
      var r = firstMatch(regexes, agent);
      if (!r)
        return {
          major: 0,
          minor: 0
        };
      var group = function (i) {
        return Number(agent.replace(r, '$' + i));
      };
      return nu(group(1), group(2));
    };
    var detect = function (versionRegexes, agent) {
      var cleanedAgent = String(agent).toLowerCase();
      if (versionRegexes.length === 0)
        return unknown();
      return find$2(versionRegexes, cleanedAgent);
    };
    var unknown = function () {
      return nu(0, 0);
    };
    var nu = function (major, minor) {
      return {
        major: major,
        minor: minor
      };
    };
    var Version = {
      nu: nu,
      detect: detect,
      unknown: unknown
    };

    var edge = 'Edge';
    var chrome = 'Chrome';
    var ie = 'IE';
    var opera = 'Opera';
    var firefox = 'Firefox';
    var safari = 'Safari';
    var isBrowser = function (name, current) {
      return function () {
        return current === name;
      };
    };
    var unknown$1 = function () {
      return nu$1({
        current: undefined,
        version: Version.unknown()
      });
    };
    var nu$1 = function (info) {
      var current = info.current;
      var version = info.version;
      return {
        current: current,
        version: version,
        isEdge: isBrowser(edge, current),
        isChrome: isBrowser(chrome, current),
        isIE: isBrowser(ie, current),
        isOpera: isBrowser(opera, current),
        isFirefox: isBrowser(firefox, current),
        isSafari: isBrowser(safari, current)
      };
    };
    var Browser = {
      unknown: unknown$1,
      nu: nu$1,
      edge: constant(edge),
      chrome: constant(chrome),
      ie: constant(ie),
      opera: constant(opera),
      firefox: constant(firefox),
      safari: constant(safari)
    };

    var windows = 'Windows';
    var ios = 'iOS';
    var android = 'Android';
    var linux = 'Linux';
    var osx = 'OSX';
    var solaris = 'Solaris';
    var freebsd = 'FreeBSD';
    var isOS = function (name, current) {
      return function () {
        return current === name;
      };
    };
    var unknown$2 = function () {
      return nu$2({
        current: undefined,
        version: Version.unknown()
      });
    };
    var nu$2 = function (info) {
      var current = info.current;
      var version = info.version;
      return {
        current: current,
        version: version,
        isWindows: isOS(windows, current),
        isiOS: isOS(ios, current),
        isAndroid: isOS(android, current),
        isOSX: isOS(osx, current),
        isLinux: isOS(linux, current),
        isSolaris: isOS(solaris, current),
        isFreeBSD: isOS(freebsd, current)
      };
    };
    var OperatingSystem = {
      unknown: unknown$2,
      nu: nu$2,
      windows: constant(windows),
      ios: constant(ios),
      android: constant(android),
      linux: constant(linux),
      osx: constant(osx),
      solaris: constant(solaris),
      freebsd: constant(freebsd)
    };

    var DeviceType = function (os, browser, userAgent) {
      var isiPad = os.isiOS() && /ipad/i.test(userAgent) === true;
      var isiPhone = os.isiOS() && !isiPad;
      var isAndroid3 = os.isAndroid() && os.version.major === 3;
      var isAndroid4 = os.isAndroid() && os.version.major === 4;
      var isTablet = isiPad || isAndroid3 || isAndroid4 && /mobile/i.test(userAgent) === true;
      var isTouch = os.isiOS() || os.isAndroid();
      var isPhone = isTouch && !isTablet;
      var iOSwebview = browser.isSafari() && os.isiOS() && /safari/i.test(userAgent) === false;
      return {
        isiPad: constant(isiPad),
        isiPhone: constant(isiPhone),
        isTablet: constant(isTablet),
        isPhone: constant(isPhone),
        isTouch: constant(isTouch),
        isAndroid: os.isAndroid,
        isiOS: os.isiOS,
        isWebView: constant(iOSwebview)
      };
    };

    var detect$1 = function (candidates, userAgent) {
      var agent = String(userAgent).toLowerCase();
      return find(candidates, function (candidate) {
        return candidate.search(agent);
      });
    };
    var detectBrowser = function (browsers, userAgent) {
      return detect$1(browsers, userAgent).map(function (browser) {
        var version = Version.detect(browser.versionRegexes, userAgent);
        return {
          current: browser.name,
          version: version
        };
      });
    };
    var detectOs = function (oses, userAgent) {
      return detect$1(oses, userAgent).map(function (os) {
        var version = Version.detect(os.versionRegexes, userAgent);
        return {
          current: os.name,
          version: version
        };
      });
    };
    var UaString = {
      detectBrowser: detectBrowser,
      detectOs: detectOs
    };

    var checkRange = function (str, substr, start) {
      if (substr === '')
        return true;
      if (str.length < substr.length)
        return false;
      var x = str.substr(start, start + substr.length);
      return x === substr;
    };
    var contains$1 = function (str, substr) {
      return str.indexOf(substr) !== -1;
    };
    var endsWith = function (str, suffix) {
      return checkRange(str, suffix, str.length - suffix.length);
    };
    var trim = function (str) {
      return str.replace(/^\s+|\s+$/g, '');
    };

    var normalVersionRegex = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/;
    var checkContains = function (target) {
      return function (uastring) {
        return contains$1(uastring, target);
      };
    };
    var browsers = [
      {
        name: 'Edge',
        versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
        search: function (uastring) {
          var monstrosity = contains$1(uastring, 'edge/') && contains$1(uastring, 'chrome') && contains$1(uastring, 'safari') && contains$1(uastring, 'applewebkit');
          return monstrosity;
        }
      },
      {
        name: 'Chrome',
        versionRegexes: [
          /.*?chrome\/([0-9]+)\.([0-9]+).*/,
          normalVersionRegex
        ],
        search: function (uastring) {
          return contains$1(uastring, 'chrome') && !contains$1(uastring, 'chromeframe');
        }
      },
      {
        name: 'IE',
        versionRegexes: [
          /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
          /.*?rv:([0-9]+)\.([0-9]+).*/
        ],
        search: function (uastring) {
          return contains$1(uastring, 'msie') || contains$1(uastring, 'trident');
        }
      },
      {
        name: 'Opera',
        versionRegexes: [
          normalVersionRegex,
          /.*?opera\/([0-9]+)\.([0-9]+).*/
        ],
        search: checkContains('opera')
      },
      {
        name: 'Firefox',
        versionRegexes: [/.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/],
        search: checkContains('firefox')
      },
      {
        name: 'Safari',
        versionRegexes: [
          normalVersionRegex,
          /.*?cpu os ([0-9]+)_([0-9]+).*/
        ],
        search: function (uastring) {
          return (contains$1(uastring, 'safari') || contains$1(uastring, 'mobile/')) && contains$1(uastring, 'applewebkit');
        }
      }
    ];
    var oses = [
      {
        name: 'Windows',
        search: checkContains('win'),
        versionRegexes: [/.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name: 'iOS',
        search: function (uastring) {
          return contains$1(uastring, 'iphone') || contains$1(uastring, 'ipad');
        },
        versionRegexes: [
          /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
          /.*cpu os ([0-9]+)_([0-9]+).*/,
          /.*cpu iphone os ([0-9]+)_([0-9]+).*/
        ]
      },
      {
        name: 'Android',
        search: checkContains('android'),
        versionRegexes: [/.*?android\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name: 'OSX',
        search: checkContains('os x'),
        versionRegexes: [/.*?os\ x\ ?([0-9]+)_([0-9]+).*/]
      },
      {
        name: 'Linux',
        search: checkContains('linux'),
        versionRegexes: []
      },
      {
        name: 'Solaris',
        search: checkContains('sunos'),
        versionRegexes: []
      },
      {
        name: 'FreeBSD',
        search: checkContains('freebsd'),
        versionRegexes: []
      }
    ];
    var PlatformInfo = {
      browsers: constant(browsers),
      oses: constant(oses)
    };

    var detect$2 = function (userAgent) {
      var browsers = PlatformInfo.browsers();
      var oses = PlatformInfo.oses();
      var browser = UaString.detectBrowser(browsers, userAgent).fold(Browser.unknown, Browser.nu);
      var os = UaString.detectOs(oses, userAgent).fold(OperatingSystem.unknown, OperatingSystem.nu);
      var deviceType = DeviceType(os, browser, userAgent);
      return {
        browser: browser,
        os: os,
        deviceType: deviceType
      };
    };
    var PlatformDetection = { detect: detect$2 };

    var detect$3 = cached(function () {
      var userAgent = navigator.userAgent;
      return PlatformDetection.detect(userAgent);
    });
    var PlatformDetection$1 = { detect: detect$3 };

    var alloy = { tap: constant('alloy.tap') };
    var focus$1 = constant('alloy.focus');
    var postBlur = constant('alloy.blur.post');
    var receive = constant('alloy.receive');
    var execute = constant('alloy.execute');
    var focusItem = constant('alloy.focus.item');
    var tap = alloy.tap;
    var tapOrClick = PlatformDetection$1.detect().deviceType.isTouch() ? alloy.tap : click;
    var longpress = constant('alloy.longpress');
    var sandboxClose = constant('alloy.sandbox.close');
    var typeaheadCancel = constant('alloy.typeahead.cancel');
    var systemInit = constant('alloy.system.init');
    var windowScroll = constant('alloy.system.scroll');
    var attachedToDom = constant('alloy.system.attached');
    var detachedFromDom = constant('alloy.system.detached');
    var dismissRequested = constant('alloy.system.dismissRequested');
    var focusShifted = constant('alloy.focusmanager.shifted');
    var slotVisibility = constant('alloy.slotcontainer.visibility');
    var changeTab = constant('alloy.change.tab');
    var dismissTab = constant('alloy.dismiss.tab');

    var fromHtml = function (html, scope) {
      var doc = scope || document;
      var div = doc.createElement('div');
      div.innerHTML = html;
      if (!div.hasChildNodes() || div.childNodes.length > 1) {
        console.error('HTML does not have a single root node', html);
        throw new Error('HTML must have a single root node');
      }
      return fromDom(div.childNodes[0]);
    };
    var fromTag = function (tag, scope) {
      var doc = scope || document;
      var node = doc.createElement(tag);
      return fromDom(node);
    };
    var fromText = function (text, scope) {
      var doc = scope || document;
      var node = doc.createTextNode(text);
      return fromDom(node);
    };
    var fromDom = function (node) {
      if (node === null || node === undefined) {
        throw new Error('Node cannot be null or undefined');
      }
      return { dom: constant(node) };
    };
    var fromPoint = function (docElm, x, y) {
      var doc = docElm.dom();
      return Option.from(doc.elementFromPoint(x, y)).map(fromDom);
    };
    var Element$$1 = {
      fromHtml: fromHtml,
      fromTag: fromTag,
      fromText: fromText,
      fromDom: fromDom,
      fromPoint: fromPoint
    };

    var Immutable = function () {
      var fields = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        fields[_i] = arguments[_i];
      }
      return function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          values[_i] = arguments[_i];
        }
        if (fields.length !== values.length) {
          throw new Error('Wrong number of arguments to struct. Expected "[' + fields.length + ']", got ' + values.length + ' arguments');
        }
        var struct = {};
        each(fields, function (name, i) {
          struct[name] = constant(values[i]);
        });
        return struct;
      };
    };

    var sort$1 = function (arr) {
      return arr.slice(0).sort();
    };
    var reqMessage = function (required, keys) {
      throw new Error('All required keys (' + sort$1(required).join(', ') + ') were not specified. Specified keys were: ' + sort$1(keys).join(', ') + '.');
    };
    var unsuppMessage = function (unsupported) {
      throw new Error('Unsupported keys for object: ' + sort$1(unsupported).join(', '));
    };
    var validateStrArr = function (label, array) {
      if (!isArray(array))
        throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
      each(array, function (a) {
        if (!isString(a))
          throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
      });
    };
    var checkDupes = function (everything) {
      var sorted = sort$1(everything);
      var dupe = find(sorted, function (s, i) {
        return i < sorted.length - 1 && s === sorted[i + 1];
      });
      dupe.each(function (d) {
        throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
      });
    };

    var MixedBag = function (required, optional) {
      var everything = required.concat(optional);
      if (everything.length === 0)
        throw new Error('You must specify at least one required or optional field.');
      validateStrArr('required', required);
      validateStrArr('optional', optional);
      checkDupes(everything);
      return function (obj) {
        var keys$$1 = keys(obj);
        var allReqd = forall(required, function (req) {
          return contains(keys$$1, req);
        });
        if (!allReqd)
          reqMessage(required, keys$$1);
        var unsupported = filter(keys$$1, function (key) {
          return !contains(everything, key);
        });
        if (unsupported.length > 0)
          unsuppMessage(unsupported);
        var r = {};
        each(required, function (req) {
          r[req] = constant(obj[req]);
        });
        each(optional, function (opt) {
          r[opt] = constant(Object.prototype.hasOwnProperty.call(obj, opt) ? Option.some(obj[opt]) : Option.none());
        });
        return r;
      };
    };

    var Global = typeof window !== 'undefined' ? window : Function('return this;')();

    var path = function (parts, scope) {
      var o = scope !== undefined && scope !== null ? scope : Global;
      for (var i = 0; i < parts.length && o !== undefined && o !== null; ++i)
        o = o[parts[i]];
      return o;
    };
    var resolve = function (p, scope) {
      var parts = p.split('.');
      return path(parts, scope);
    };

    var unsafe = function (name, scope) {
      return resolve(name, scope);
    };
    var getOrDie = function (name, scope) {
      var actual = unsafe(name, scope);
      if (actual === undefined || actual === null)
        throw name + ' not available on this browser';
      return actual;
    };
    var Global$1 = { getOrDie: getOrDie };

    var node = function () {
      var f = Global$1.getOrDie('Node');
      return f;
    };
    var compareDocumentPosition = function (a, b, match) {
      return (a.compareDocumentPosition(b) & match) !== 0;
    };
    var documentPositionPreceding = function (a, b) {
      return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_PRECEDING);
    };
    var documentPositionContainedBy = function (a, b) {
      return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_CONTAINED_BY);
    };
    var Node$1 = {
      documentPositionPreceding: documentPositionPreceding,
      documentPositionContainedBy: documentPositionContainedBy
    };

    var ATTRIBUTE = Node.ATTRIBUTE_NODE;
    var CDATA_SECTION = Node.CDATA_SECTION_NODE;
    var COMMENT = Node.COMMENT_NODE;
    var DOCUMENT = Node.DOCUMENT_NODE;
    var DOCUMENT_TYPE = Node.DOCUMENT_TYPE_NODE;
    var DOCUMENT_FRAGMENT = Node.DOCUMENT_FRAGMENT_NODE;
    var ELEMENT = Node.ELEMENT_NODE;
    var TEXT = Node.TEXT_NODE;
    var PROCESSING_INSTRUCTION = Node.PROCESSING_INSTRUCTION_NODE;
    var ENTITY_REFERENCE = Node.ENTITY_REFERENCE_NODE;
    var ENTITY = Node.ENTITY_NODE;
    var NOTATION = Node.NOTATION_NODE;

    var ELEMENT$1 = ELEMENT;
    var DOCUMENT$1 = DOCUMENT;
    var is = function (element, selector) {
      var elem = element.dom();
      if (elem.nodeType !== ELEMENT$1) {
        return false;
      } else if (elem.matches !== undefined) {
        return elem.matches(selector);
      } else if (elem.msMatchesSelector !== undefined) {
        return elem.msMatchesSelector(selector);
      } else if (elem.webkitMatchesSelector !== undefined) {
        return elem.webkitMatchesSelector(selector);
      } else if (elem.mozMatchesSelector !== undefined) {
        return elem.mozMatchesSelector(selector);
      } else {
        throw new Error('Browser lacks native selectors');
      }
    };
    var bypassSelector = function (dom) {
      return dom.nodeType !== ELEMENT$1 && dom.nodeType !== DOCUMENT$1 || dom.childElementCount === 0;
    };
    var all = function (selector, scope) {
      var base = scope === undefined ? document : scope.dom();
      return bypassSelector(base) ? [] : map(base.querySelectorAll(selector), Element$$1.fromDom);
    };
    var one = function (selector, scope) {
      var base = scope === undefined ? document : scope.dom();
      return bypassSelector(base) ? Option.none() : Option.from(base.querySelector(selector)).map(Element$$1.fromDom);
    };

    var eq = function (e1, e2) {
      return e1.dom() === e2.dom();
    };
    var regularContains = function (e1, e2) {
      var d1 = e1.dom();
      var d2 = e2.dom();
      return d1 === d2 ? false : d1.contains(d2);
    };
    var ieContains = function (e1, e2) {
      return Node$1.documentPositionContainedBy(e1.dom(), e2.dom());
    };
    var browser = PlatformDetection$1.detect().browser;
    var contains$2 = browser.isIE() ? ieContains : regularContains;

    var owner = function (element) {
      return Element$$1.fromDom(element.dom().ownerDocument);
    };
    var defaultView = function (element) {
      var el = element.dom();
      var defView = el.ownerDocument.defaultView;
      return Element$$1.fromDom(defView);
    };
    var parent = function (element) {
      var dom = element.dom();
      return Option.from(dom.parentNode).map(Element$$1.fromDom);
    };
    var offsetParent = function (element) {
      var dom = element.dom();
      return Option.from(dom.offsetParent).map(Element$$1.fromDom);
    };
    var nextSibling = function (element) {
      var dom = element.dom();
      return Option.from(dom.nextSibling).map(Element$$1.fromDom);
    };
    var children = function (element) {
      var dom = element.dom();
      return map(dom.childNodes, Element$$1.fromDom);
    };
    var child = function (element, index) {
      var cs = element.dom().childNodes;
      return Option.from(cs[index]).map(Element$$1.fromDom);
    };
    var firstChild = function (element) {
      return child(element, 0);
    };
    var spot = Immutable('element', 'offset');

    var fromHtml$1 = function (html, scope) {
      var doc = scope || document;
      var div = doc.createElement('div');
      div.innerHTML = html;
      return children(Element$$1.fromDom(div));
    };

    var before = function (marker, element) {
      var parent$$1 = parent(marker);
      parent$$1.each(function (v) {
        v.dom().insertBefore(element.dom(), marker.dom());
      });
    };
    var after = function (marker, element) {
      var sibling = nextSibling(marker);
      sibling.fold(function () {
        var parent$$1 = parent(marker);
        parent$$1.each(function (v) {
          append(v, element);
        });
      }, function (v) {
        before(v, element);
      });
    };
    var prepend = function (parent$$1, element) {
      var firstChild$$1 = firstChild(parent$$1);
      firstChild$$1.fold(function () {
        append(parent$$1, element);
      }, function (v) {
        parent$$1.dom().insertBefore(element.dom(), v.dom());
      });
    };
    var append = function (parent$$1, element) {
      parent$$1.dom().appendChild(element.dom());
    };
    var appendAt = function (parent$$1, element, index) {
      child(parent$$1, index).fold(function () {
        append(parent$$1, element);
      }, function (v) {
        before(v, element);
      });
    };

    var append$1 = function (parent, elements) {
      each(elements, function (x) {
        append(parent, x);
      });
    };

    var empty = function (element) {
      element.dom().textContent = '';
      each(children(element), function (rogue) {
        remove(rogue);
      });
    };
    var remove = function (element) {
      var dom = element.dom();
      if (dom.parentNode !== null) {
        dom.parentNode.removeChild(dom);
      }
    };

    var get$1 = function (element) {
      return element.dom().innerHTML;
    };
    var set = function (element, content) {
      var owner$$1 = owner(element);
      var docDom = owner$$1.dom();
      var fragment = Element$$1.fromDom(docDom.createDocumentFragment());
      var contentElements = fromHtml$1(content, docDom);
      append$1(fragment, contentElements);
      empty(element);
      append(element, fragment);
    };
    var getOuter = function (element) {
      var container = Element$$1.fromTag('div');
      var clone = Element$$1.fromDom(element.dom().cloneNode(true));
      append(container, clone);
      return get$1(container);
    };

    var name = function (element) {
      var r = element.dom().nodeName;
      return r.toLowerCase();
    };
    var type = function (element) {
      return element.dom().nodeType;
    };
    var isType$1 = function (t) {
      return function (element) {
        return type(element) === t;
      };
    };
    var isElement = isType$1(ELEMENT);
    var isText = isType$1(TEXT);
    var isDocument = isType$1(DOCUMENT);

    var rawSet = function (dom, key, value) {
      if (isString(value) || isBoolean(value) || isNumber(value)) {
        dom.setAttribute(key, value + '');
      } else {
        console.error('Invalid call to Attr.set. Key ', key, ':: Value ', value, ':: Element ', dom);
        throw new Error('Attribute value was not simple');
      }
    };
    var set$1 = function (element, key, value) {
      rawSet(element.dom(), key, value);
    };
    var setAll = function (element, attrs) {
      var dom = element.dom();
      each$1(attrs, function (v, k) {
        rawSet(dom, k, v);
      });
    };
    var get$2 = function (element, key) {
      var v = element.dom().getAttribute(key);
      return v === null ? undefined : v;
    };
    var has$1 = function (element, key) {
      var dom = element.dom();
      return dom && dom.hasAttribute ? dom.hasAttribute(key) : false;
    };
    var remove$1 = function (element, key) {
      element.dom().removeAttribute(key);
    };

    var clone$1 = function (original, isDeep) {
      return Element$$1.fromDom(original.dom().cloneNode(isDeep));
    };
    var shallow$1 = function (original) {
      return clone$1(original, false);
    };

    var getHtml = function (element) {
      var clone = shallow$1(element);
      return getOuter(clone);
    };

    var element = function (elem) {
      return getHtml(elem);
    };

    var unknown$3 = 'unknown';
    var CHROME_INSPECTOR_GLOBAL = '__CHROME_INSPECTOR_CONNECTION_TO_ALLOY__';
    var EventConfiguration;
    (function (EventConfiguration) {
      EventConfiguration[EventConfiguration['STOP'] = 0] = 'STOP';
      EventConfiguration[EventConfiguration['NORMAL'] = 1] = 'NORMAL';
      EventConfiguration[EventConfiguration['LOGGING'] = 2] = 'LOGGING';
    }(EventConfiguration || (EventConfiguration = {})));
    var eventConfig = Cell({});
    var makeEventLogger = function (eventName, initialTarget) {
      var sequence = [];
      var startTime = new Date().getTime();
      return {
        logEventCut: function (name$$1, target, purpose) {
          sequence.push({
            outcome: 'cut',
            target: target,
            purpose: purpose
          });
        },
        logEventStopped: function (name$$1, target, purpose) {
          sequence.push({
            outcome: 'stopped',
            target: target,
            purpose: purpose
          });
        },
        logNoParent: function (name$$1, target, purpose) {
          sequence.push({
            outcome: 'no-parent',
            target: target,
            purpose: purpose
          });
        },
        logEventNoHandlers: function (name$$1, target) {
          sequence.push({
            outcome: 'no-handlers-left',
            target: target
          });
        },
        logEventResponse: function (name$$1, target, purpose) {
          sequence.push({
            outcome: 'response',
            purpose: purpose,
            target: target
          });
        },
        write: function () {
          var finishTime = new Date().getTime();
          if (contains([
              'mousemove',
              'mouseover',
              'mouseout',
              systemInit()
            ], eventName)) {
            return;
          }
          console.log(eventName, {
            event: eventName,
            time: finishTime - startTime,
            target: initialTarget.dom(),
            sequence: map(sequence, function (s) {
              if (!contains([
                  'cut',
                  'stopped',
                  'response'
                ], s.outcome)) {
                return s.outcome;
              } else {
                return '{' + s.purpose + '} ' + s.outcome + ' at (' + element(s.target) + ')';
              }
            })
          });
        }
      };
    };
    var processEvent = function (eventName, initialTarget, f) {
      var status$$1 = readOptFrom$1(eventConfig.get(), eventName).orThunk(function () {
        var patterns = keys(eventConfig.get());
        return findMap(patterns, function (p) {
          return eventName.indexOf(p) > -1 ? Option.some(eventConfig.get()[p]) : Option.none();
        });
      }).getOr(EventConfiguration.NORMAL);
      switch (status$$1) {
      case EventConfiguration.NORMAL:
        return f(noLogger());
      case EventConfiguration.LOGGING: {
          var logger = makeEventLogger(eventName, initialTarget);
          var output = f(logger);
          logger.write();
          return output;
        }
      case EventConfiguration.STOP:
        return true;
      }
    };
    var path$1 = [
      'alloy/data/Fields',
      'alloy/debugging/Debugging'
    ];
    var getTrace = function () {
      var err = new Error();
      if (err.stack !== undefined) {
        var lines = err.stack.split('\n');
        return find(lines, function (line) {
          return line.indexOf('alloy') > 0 && !exists(path$1, function (p) {
            return line.indexOf(p) > -1;
          });
        }).getOr(unknown$3);
      } else {
        return unknown$3;
      }
    };
    var ignoreEvent = {
      logEventCut: noop,
      logEventStopped: noop,
      logNoParent: noop,
      logEventNoHandlers: noop,
      logEventResponse: noop,
      write: noop
    };
    var monitorEvent = function (eventName, initialTarget, f) {
      return processEvent(eventName, initialTarget, f);
    };
    var inspectorInfo = function (comp) {
      var go = function (c) {
        var cSpec = c.spec();
        return {
          '(original.spec)': cSpec,
          '(dom.ref)': c.element().dom(),
          '(element)': element(c.element()),
          '(initComponents)': map(cSpec.components !== undefined ? cSpec.components : [], go),
          '(components)': map(c.components(), go),
          '(bound.events)': mapToArray(c.events(), function (v, k) {
            return [k];
          }).join(', '),
          '(behaviours)': cSpec.behaviours !== undefined ? map$1(cSpec.behaviours, function (v, k) {
            return v === undefined ? '--revoked--' : {
              'config': v.configAsRaw(),
              'original-config': v.initialConfig,
              'state': c.readState(k)
            };
          }) : 'none'
        };
      };
      return go(comp);
    };
    var getOrInitConnection = function () {
      if (window[CHROME_INSPECTOR_GLOBAL] !== undefined) {
        return window[CHROME_INSPECTOR_GLOBAL];
      } else {
        var setEventStatus_1 = function (eventName, status$$1) {
          var evs = eventConfig.get();
          evs[eventName] = status$$1;
          eventConfig.set(evs);
        };
        window[CHROME_INSPECTOR_GLOBAL] = {
          systems: {},
          lookup: function (uid) {
            var systems = window[CHROME_INSPECTOR_GLOBAL].systems;
            var connections = keys(systems);
            return findMap(connections, function (conn) {
              var connGui = systems[conn];
              return connGui.getByUid(uid).toOption().map(function (comp) {
                return wrap$1(element(comp.element()), inspectorInfo(comp));
              });
            }).orThunk(function () {
              return Option.some({ 'error': 'Systems (' + connections.join(', ') + ') did not contain uid: ' + uid });
            });
          },
          events: {
            setToNormal: function (eventName) {
              setEventStatus_1(eventName, EventConfiguration.NORMAL);
            },
            setToLogging: function (eventName) {
              setEventStatus_1(eventName, EventConfiguration.LOGGING);
            },
            setToStop: function (eventName) {
              setEventStatus_1(eventName, EventConfiguration.STOP);
            }
          }
        };
        return window[CHROME_INSPECTOR_GLOBAL];
      }
    };
    var registerInspector = function (name$$1, gui) {
      var connection = getOrInitConnection();
      connection.systems[name$$1] = gui;
    };
    var noLogger = constant(ignoreEvent);

    var unique = 0;
    var generate$1 = function (prefix) {
      var date = new Date();
      var time = date.getTime();
      var random = Math.floor(Math.random() * 1000000000);
      unique++;
      return prefix + '_' + random + unique + String(time);
    };

    var global = tinymce.util.Tools.resolve('tinymce.ThemeManager');

    var __assign = function () {
      __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
      var t = {};
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === 'function')
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)
          if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
      return t;
    }

    var adt = Adt.generate([
      { strict: [] },
      { defaultedThunk: ['fallbackThunk'] },
      { asOption: [] },
      { asDefaultedOptionThunk: ['fallbackThunk'] },
      { mergeWithThunk: ['baseThunk'] }
    ]);
    var defaulted = function (fallback) {
      return adt.defaultedThunk(constant(fallback));
    };
    var mergeWith = function (base) {
      return adt.mergeWithThunk(constant(base));
    };
    var strict = adt.strict;
    var asOption = adt.asOption;
    var defaultedThunk = adt.defaultedThunk;
    var mergeWithThunk = adt.mergeWithThunk;

    var SimpleResultType;
    (function (SimpleResultType) {
      SimpleResultType[SimpleResultType['Error'] = 0] = 'Error';
      SimpleResultType[SimpleResultType['Value'] = 1] = 'Value';
    }(SimpleResultType || (SimpleResultType = {})));
    var fold = function (res, onError, onValue) {
      return res.stype === SimpleResultType.Error ? onError(res.serror) : onValue(res.svalue);
    };
    var partition$2 = function (results) {
      var values = [];
      var errors = [];
      each(results, function (obj) {
        fold(obj, function (err) {
          return errors.push(err);
        }, function (val) {
          return values.push(val);
        });
      });
      return {
        values: values,
        errors: errors
      };
    };
    var mapError = function (res, f) {
      if (res.stype === SimpleResultType.Error) {
        return {
          stype: SimpleResultType.Error,
          serror: f(res.serror)
        };
      } else {
        return res;
      }
    };
    var map$2 = function (res, f) {
      if (res.stype === SimpleResultType.Value) {
        return {
          stype: SimpleResultType.Value,
          svalue: f(res.svalue)
        };
      } else {
        return res;
      }
    };
    var bind$1 = function (res, f) {
      if (res.stype === SimpleResultType.Value) {
        return f(res.svalue);
      } else {
        return res;
      }
    };
    var bindError = function (res, f) {
      if (res.stype === SimpleResultType.Error) {
        return f(res.serror);
      } else {
        return res;
      }
    };
    var svalue = function (v) {
      return {
        stype: SimpleResultType.Value,
        svalue: v
      };
    };
    var serror = function (e) {
      return {
        stype: SimpleResultType.Error,
        serror: e
      };
    };
    var toResult = function (res) {
      return fold(res, Result.error, Result.value);
    };
    var fromResult = function (res) {
      return res.fold(serror, svalue);
    };
    var SimpleResult = {
      fromResult: fromResult,
      toResult: toResult,
      svalue: svalue,
      partition: partition$2,
      serror: serror,
      bind: bind$1,
      bindError: bindError,
      map: map$2,
      mapError: mapError,
      fold: fold
    };

    var mergeValues$1 = function (values, base) {
      return values.length > 0 ? SimpleResult.svalue(deepMerge(base, merge.apply(undefined, values))) : SimpleResult.svalue(base);
    };
    var mergeErrors$1 = function (errors) {
      return compose(SimpleResult.serror, flatten)(errors);
    };
    var consolidateObj = function (objects, base) {
      var partition$$1 = SimpleResult.partition(objects);
      return partition$$1.errors.length > 0 ? mergeErrors$1(partition$$1.errors) : mergeValues$1(partition$$1.values, base);
    };
    var consolidateArr = function (objects) {
      var partitions = SimpleResult.partition(objects);
      return partitions.errors.length > 0 ? mergeErrors$1(partitions.errors) : SimpleResult.svalue(partitions.values);
    };
    var ResultCombine = {
      consolidateObj: consolidateObj,
      consolidateArr: consolidateArr
    };

    var typeAdt = Adt.generate([
      {
        setOf: [
          'validator',
          'valueType'
        ]
      },
      { arrOf: ['valueType'] },
      { objOf: ['fields'] },
      { itemOf: ['validator'] },
      {
        choiceOf: [
          'key',
          'branches'
        ]
      },
      { thunk: ['description'] },
      {
        func: [
          'args',
          'outputSchema'
        ]
      }
    ]);
    var fieldAdt = Adt.generate([
      {
        field: [
          'name',
          'presence',
          'type'
        ]
      },
      { state: ['name'] }
    ]);

    var json = function () {
      return Global$1.getOrDie('JSON');
    };
    var parse = function (text) {
      return json().parse(text);
    };
    var stringify = function (obj, replacer, space) {
      return json().stringify(obj, replacer, space);
    };
    var JSON$1 = {
      parse: parse,
      stringify: stringify
    };

    var formatObj = function (input) {
      return isObject(input) && keys(input).length > 100 ? ' removed due to size' : JSON$1.stringify(input, null, 2);
    };
    var formatErrors = function (errors) {
      var es = errors.length > 10 ? errors.slice(0, 10).concat([{
          path: [],
          getErrorInfo: function () {
            return '... (only showing first ten failures)';
          }
        }]) : errors;
      return map(es, function (e) {
        return 'Failed path: (' + e.path.join(' > ') + ')\n' + e.getErrorInfo();
      });
    };

    var nu$3 = function (path, getErrorInfo) {
      return SimpleResult.serror([{
          path: path,
          getErrorInfo: getErrorInfo
        }]);
    };
    var missingStrict = function (path, key, obj) {
      return nu$3(path, function () {
        return 'Could not find valid *strict* value for "' + key + '" in ' + formatObj(obj);
      });
    };
    var missingKey = function (path, key) {
      return nu$3(path, function () {
        return 'Choice schema did not contain choice key: "' + key + '"';
      });
    };
    var missingBranch = function (path, branches, branch) {
      return nu$3(path, function () {
        return 'The chosen schema: "' + branch + '" did not exist in branches: ' + formatObj(branches);
      });
    };
    var unsupportedFields = function (path, unsupported) {
      return nu$3(path, function () {
        return 'There are unsupported fields: [' + unsupported.join(', ') + '] specified';
      });
    };
    var custom = function (path, err) {
      return nu$3(path, function () {
        return err;
      });
    };

    var adt$1 = Adt.generate([
      {
        field: [
          'key',
          'okey',
          'presence',
          'prop'
        ]
      },
      {
        state: [
          'okey',
          'instantiator'
        ]
      }
    ]);
    var strictAccess = function (path, obj, key) {
      return readOptFrom(obj, key).fold(function () {
        return missingStrict(path, key, obj);
      }, SimpleResult.svalue);
    };
    var fallbackAccess = function (obj, key, fallbackThunk) {
      var v = readOptFrom(obj, key).fold(function () {
        return fallbackThunk(obj);
      }, identity);
      return SimpleResult.svalue(v);
    };
    var optionAccess = function (obj, key) {
      return SimpleResult.svalue(readOptFrom(obj, key));
    };
    var optionDefaultedAccess = function (obj, key, fallback) {
      var opt = readOptFrom(obj, key).map(function (val) {
        return val === true ? fallback(obj) : val;
      });
      return SimpleResult.svalue(opt);
    };
    var cExtractOne = function (path, obj, field, strength) {
      return field.fold(function (key, okey, presence, prop) {
        var bundle = function (av) {
          var result = prop.extract(path.concat([key]), strength, av);
          return SimpleResult.map(result, function (res) {
            return wrap(okey, strength(res));
          });
        };
        var bundleAsOption = function (optValue) {
          return optValue.fold(function () {
            var outcome = wrap(okey, strength(Option.none()));
            return SimpleResult.svalue(outcome);
          }, function (ov) {
            var result = prop.extract(path.concat([key]), strength, ov);
            return SimpleResult.map(result, function (res) {
              return wrap(okey, strength(Option.some(res)));
            });
          });
        };
        return function () {
          return presence.fold(function () {
            return SimpleResult.bind(strictAccess(path, obj, key), bundle);
          }, function (fallbackThunk) {
            return SimpleResult.bind(fallbackAccess(obj, key, fallbackThunk), bundle);
          }, function () {
            return SimpleResult.bind(optionAccess(obj, key), bundleAsOption);
          }, function (fallbackThunk) {
            return SimpleResult.bind(optionDefaultedAccess(obj, key, fallbackThunk), bundleAsOption);
          }, function (baseThunk) {
            var base = baseThunk(obj);
            var result = SimpleResult.map(fallbackAccess(obj, key, constant({})), function (v) {
              return deepMerge(base, v);
            });
            return SimpleResult.bind(result, bundle);
          });
        }();
      }, function (okey, instantiator) {
        var state = instantiator(obj);
        return SimpleResult.svalue(wrap(okey, strength(state)));
      });
    };
    var cExtract = function (path, obj, fields, strength) {
      var results = map(fields, function (field) {
        return cExtractOne(path, obj, field, strength);
      });
      return ResultCombine.consolidateObj(results, {});
    };
    var value$2 = function (validator) {
      var extract = function (path, strength, val) {
        return SimpleResult.bindError(validator(val, strength), function (err) {
          return custom(path, err);
        });
      };
      var toString$$1 = function () {
        return 'val';
      };
      var toDsl = function () {
        return typeAdt.itemOf(validator);
      };
      return {
        extract: extract,
        toString: toString$$1,
        toDsl: toDsl
      };
    };
    var getSetKeys = function (obj) {
      var keys$$1 = keys(obj);
      return filter(keys$$1, function (k) {
        return hasKey$1(obj, k);
      });
    };
    var objOfOnly = function (fields) {
      var delegate = objOf(fields);
      var fieldNames = foldr(fields, function (acc, f) {
        return f.fold(function (key) {
          return deepMerge(acc, wrap$1(key, true));
        }, constant(acc));
      }, {});
      var extract = function (path, strength, o) {
        var keys$$1 = isBoolean(o) ? [] : getSetKeys(o);
        var extra = filter(keys$$1, function (k) {
          return !hasKey$1(fieldNames, k);
        });
        return extra.length === 0 ? delegate.extract(path, strength, o) : unsupportedFields(path, extra);
      };
      return {
        extract: extract,
        toString: delegate.toString,
        toDsl: delegate.toDsl
      };
    };
    var objOf = function (fields) {
      var extract = function (path, strength, o) {
        return cExtract(path, o, fields, strength);
      };
      var toString$$1 = function () {
        var fieldStrings = map(fields, function (field) {
          return field.fold(function (key, okey, presence, prop) {
            return key + ' -> ' + prop.toString();
          }, function (okey, instantiator) {
            return 'state(' + okey + ')';
          });
        });
        return 'obj{\n' + fieldStrings.join('\n') + '}';
      };
      var toDsl = function () {
        return typeAdt.objOf(map(fields, function (f) {
          return f.fold(function (key, okey, presence, prop) {
            return fieldAdt.field(key, presence, prop);
          }, function (okey, instantiator) {
            return fieldAdt.state(okey);
          });
        }));
      };
      return {
        extract: extract,
        toString: toString$$1,
        toDsl: toDsl
      };
    };
    var arrOf = function (prop) {
      var extract = function (path, strength, array) {
        var results = map(array, function (a, i) {
          return prop.extract(path.concat(['[' + i + ']']), strength, a);
        });
        return ResultCombine.consolidateArr(results);
      };
      var toString$$1 = function () {
        return 'array(' + prop.toString() + ')';
      };
      var toDsl = function () {
        return typeAdt.arrOf(prop);
      };
      return {
        extract: extract,
        toString: toString$$1,
        toDsl: toDsl
      };
    };
    var setOf = function (validator, prop) {
      var validateKeys = function (path, keys$$1) {
        return arrOf(value$2(validator)).extract(path, identity, keys$$1);
      };
      var extract = function (path, strength, o) {
        var keys$$1 = keys(o);
        var validatedKeys = validateKeys(path, keys$$1);
        return SimpleResult.bind(validatedKeys, function (validKeys) {
          var schema = map(validKeys, function (vk) {
            return adt$1.field(vk, vk, strict(), prop);
          });
          return objOf(schema).extract(path, strength, o);
        });
      };
      var toString$$1 = function () {
        return 'setOf(' + prop.toString() + ')';
      };
      var toDsl = function () {
        return typeAdt.setOf(validator, prop);
      };
      return {
        extract: extract,
        toString: toString$$1,
        toDsl: toDsl
      };
    };
    var anyValue = constant(value$2(SimpleResult.svalue));
    var arrOfObj = compose(arrOf, objOf);
    var state = adt$1.state;
    var field = adt$1.field;

    var chooseFrom = function (path, strength, input, branches, ch) {
      var fields = readOptFrom$1(branches, ch);
      return fields.fold(function () {
        return missingBranch(path, branches, ch);
      }, function (fs) {
        return objOf(fs).extract(path.concat(['branch: ' + ch]), strength, input);
      });
    };
    var choose = function (key, branches) {
      var extract = function (path, strength, input) {
        var choice = readOptFrom$1(input, key);
        return choice.fold(function () {
          return missingKey(path, key);
        }, function (chosen) {
          return chooseFrom(path, strength, input, branches, chosen);
        });
      };
      var toString$$1 = function () {
        return 'chooseOn(' + key + '). Possible values: ' + keys(branches);
      };
      var toDsl = function () {
        return typeAdt.choiceOf(key, branches);
      };
      return {
        extract: extract,
        toString: toString$$1,
        toDsl: toDsl
      };
    };

    var _anyValue = value$2(SimpleResult.svalue);
    var arrOfObj$1 = function (objFields) {
      return arrOfObj(objFields);
    };
    var arrOfVal = function () {
      return arrOf(_anyValue);
    };
    var valueOf = function (validator) {
      return value$2(function (v) {
        return validator(v).fold(SimpleResult.serror, SimpleResult.svalue);
      });
    };
    var setOf$1 = function (validator, prop) {
      return setOf(function (v) {
        return SimpleResult.fromResult(validator(v));
      }, prop);
    };
    var extract = function (label, prop, strength, obj) {
      var res = prop.extract([label], strength, obj);
      return SimpleResult.mapError(res, function (errs) {
        return {
          input: obj,
          errors: errs
        };
      });
    };
    var asRaw = function (label, prop, obj) {
      return SimpleResult.toResult(extract(label, prop, identity, obj));
    };
    var getOrDie$1 = function (extraction) {
      return extraction.fold(function (errInfo) {
        throw new Error(formatError(errInfo));
      }, identity);
    };
    var asRawOrDie = function (label, prop, obj) {
      return getOrDie$1(asRaw(label, prop, obj));
    };
    var formatError = function (errInfo) {
      return 'Errors: \n' + formatErrors(errInfo.errors) + '\n\nInput object: ' + formatObj(errInfo.input);
    };
    var choose$1 = function (key, branches) {
      return choose(key, branches);
    };
    var anyValue$1 = constant(_anyValue);
    var typedValue = function (validator, expectedType) {
      return value$2(function (a) {
        var actualType = typeof a;
        return validator(a) ? SimpleResult.svalue(a) : SimpleResult.serror('Expected type: ' + expectedType + ' but got: ' + actualType);
      });
    };
    var number = typedValue(isNumber, 'number');
    var string = typedValue(isString, 'string');
    var boolean = typedValue(isBoolean, 'boolean');
    var functionProcessor = typedValue(isFunction, 'function');

    var validateEnum = function (values) {
      return valueOf(function (value) {
        return contains(values, value) ? Result.value(value) : Result.error('Unsupported value: "' + value + '", choose one of "' + values.join(', ') + '".');
      });
    };
    var strict$1 = function (key) {
      return field(key, key, strict(), anyValue());
    };
    var strictOf = function (key, schema) {
      return field(key, key, strict(), schema);
    };
    var strictNumber = function (key) {
      return strictOf(key, number);
    };
    var strictString = function (key) {
      return strictOf(key, string);
    };
    var strictStringEnum = function (key, values) {
      return field(key, key, strict(), validateEnum(values));
    };
    var strictFunction = function (key) {
      return strictOf(key, functionProcessor);
    };
    var forbid = function (key, message) {
      return field(key, key, asOption(), value$2(function (v) {
        return SimpleResult.serror('The field: ' + key + ' is forbidden. ' + message);
      }));
    };
    var strictObjOf = function (key, objSchema) {
      return field(key, key, strict(), objOf(objSchema));
    };
    var strictArrayOfObj = function (key, objFields) {
      return field(key, key, strict(), arrOfObj(objFields));
    };
    var strictArrayOf = function (key, schema) {
      return field(key, key, strict(), arrOf(schema));
    };
    var option = function (key) {
      return field(key, key, asOption(), anyValue());
    };
    var optionOf = function (key, schema) {
      return field(key, key, asOption(), schema);
    };
    var optionString = function (key) {
      return optionOf(key, string);
    };
    var optionFunction = function (key) {
      return optionOf(key, functionProcessor);
    };
    var optionObjOf = function (key, objSchema) {
      return field(key, key, asOption(), objOf(objSchema));
    };
    var optionObjOfOnly = function (key, objSchema) {
      return field(key, key, asOption(), objOfOnly(objSchema));
    };
    var defaulted$1 = function (key, fallback) {
      return field(key, key, defaulted(fallback), anyValue());
    };
    var defaultedOf = function (key, fallback, schema) {
      return field(key, key, defaulted(fallback), schema);
    };
    var defaultedNumber = function (key, fallback) {
      return defaultedOf(key, fallback, number);
    };
    var defaultedString = function (key, fallback) {
      return defaultedOf(key, fallback, string);
    };
    var defaultedStringEnum = function (key, fallback, values) {
      return defaultedOf(key, fallback, validateEnum(values));
    };
    var defaultedBoolean = function (key, fallback) {
      return defaultedOf(key, fallback, boolean);
    };
    var defaultedFunction = function (key, fallback) {
      return defaultedOf(key, fallback, functionProcessor);
    };
    var defaultedObjOf = function (key, fallback, objSchema) {
      return field(key, key, defaulted(fallback), objOf(objSchema));
    };
    var state$1 = function (okey, instantiator) {
      return state(okey, instantiator);
    };

    var isSource = function (component, simulatedEvent) {
      return eq(component.element(), simulatedEvent.event().target());
    };

    var nu$4 = function (parts) {
      if (!hasKey$1(parts, 'can') && !hasKey$1(parts, 'abort') && !hasKey$1(parts, 'run')) {
        throw new Error('EventHandler defined by: ' + JSON$1.stringify(parts, null, 2) + ' does not have can, abort, or run!');
      }
      return asRawOrDie('Extracting event.handler', objOfOnly([
        defaulted$1('can', constant(true)),
        defaulted$1('abort', constant(false)),
        defaulted$1('run', noop)
      ]), parts);
    };
    var all$1 = function (handlers, f) {
      return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return foldl(handlers, function (acc, handler) {
          return acc && f(handler).apply(undefined, args);
        }, true);
      };
    };
    var any = function (handlers, f) {
      return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return foldl(handlers, function (acc, handler) {
          return acc || f(handler).apply(undefined, args);
        }, false);
      };
    };
    var read = function (handler) {
      return isFunction(handler) ? {
        can: constant(true),
        abort: constant(false),
        run: handler
      } : handler;
    };
    var fuse = function (handlers) {
      var can = all$1(handlers, function (handler) {
        return handler.can;
      });
      var abort = any(handlers, function (handler) {
        return handler.abort;
      });
      var run = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        each(handlers, function (handler) {
          handler.run.apply(undefined, args);
        });
      };
      return nu$4({
        can: can,
        abort: abort,
        run: run
      });
    };

    var emit = function (component, event) {
      dispatchWith(component, component.element(), event, {});
    };
    var emitWith = function (component, event, properties) {
      dispatchWith(component, component.element(), event, properties);
    };
    var emitExecute = function (component) {
      emit(component, execute());
    };
    var dispatch = function (component, target, event) {
      dispatchWith(component, target, event, {});
    };
    var dispatchWith = function (component, target, event, properties) {
      var data = __assign({ target: target }, properties);
      component.getSystem().triggerEvent(event, target, map$1(data, constant));
    };
    var dispatchEvent = function (component, target, event, simulatedEvent) {
      component.getSystem().triggerEvent(event, target, simulatedEvent.event());
    };

    function ClosestOrAncestor (is, ancestor, scope, a, isRoot) {
      return is(scope, a) ? Option.some(scope) : isFunction(isRoot) && isRoot(scope) ? Option.none() : ancestor(scope, a, isRoot);
    }

    var inBody = function (element) {
      var dom = isText(element) ? element.dom().parentNode : element.dom();
      return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
    };
    var body = cached(function () {
      return getBody(Element$$1.fromDom(document));
    });
    var getBody = function (doc) {
      var b = doc.dom().body;
      if (b === null || b === undefined) {
        throw new Error('Body is not available yet');
      }
      return Element$$1.fromDom(b);
    };

    var ancestor = function (scope, predicate, isRoot) {
      var element = scope.dom();
      var stop = isFunction(isRoot) ? isRoot : constant(false);
      while (element.parentNode) {
        element = element.parentNode;
        var el = Element$$1.fromDom(element);
        if (predicate(el)) {
          return Option.some(el);
        } else if (stop(el)) {
          break;
        }
      }
      return Option.none();
    };
    var closest = function (scope, predicate, isRoot) {
      var is = function (s) {
        return predicate(s);
      };
      return ClosestOrAncestor(is, ancestor, scope, predicate, isRoot);
    };
    var descendant = function (scope, predicate) {
      var descend = function (node) {
        for (var i = 0; i < node.childNodes.length; i++) {
          if (predicate(Element$$1.fromDom(node.childNodes[i]))) {
            return Option.some(Element$$1.fromDom(node.childNodes[i]));
          }
          var res = descend(node.childNodes[i]);
          if (res.isSome()) {
            return res;
          }
        }
        return Option.none();
      };
      return descend(scope.dom());
    };

    var closest$1 = function (target, transform, isRoot) {
      var delegate = closest(target, function (elem) {
        return transform(elem).isSome();
      }, isRoot);
      return delegate.bind(transform);
    };

    var derive = function (configs) {
      return wrapAll$1(configs);
    };
    var abort = function (name, predicate) {
      return {
        key: name,
        value: nu$4({ abort: predicate })
      };
    };
    var can = function (name, predicate) {
      return {
        key: name,
        value: nu$4({ can: predicate })
      };
    };
    var preventDefault = function (name) {
      return {
        key: name,
        value: nu$4({
          run: function (component, simulatedEvent) {
            simulatedEvent.event().prevent();
          }
        })
      };
    };
    var run = function (name, handler) {
      return {
        key: name,
        value: nu$4({ run: handler })
      };
    };
    var runActionExtra = function (name, action, extra) {
      return {
        key: name,
        value: nu$4({
          run: function (component) {
            action.apply(undefined, [component].concat(extra));
          }
        })
      };
    };
    var runOnName = function (name) {
      return function (handler) {
        return run(name, handler);
      };
    };
    var runOnSourceName = function (name) {
      return function (handler) {
        return {
          key: name,
          value: nu$4({
            run: function (component, simulatedEvent) {
              if (isSource(component, simulatedEvent)) {
                handler(component, simulatedEvent);
              }
            }
          })
        };
      };
    };
    var redirectToUid = function (name, uid) {
      return run(name, function (component, simulatedEvent) {
        component.getSystem().getByUid(uid).each(function (redirectee) {
          dispatchEvent(redirectee, redirectee.element(), name, simulatedEvent);
        });
      });
    };
    var redirectToPart = function (name, detail, partName) {
      var uid = detail.partUids[partName];
      return redirectToUid(name, uid);
    };
    var runWithTarget = function (name, f) {
      return run(name, function (component, simulatedEvent) {
        var ev = simulatedEvent.event();
        var target = component.getSystem().getByDom(ev.target()).fold(function () {
          var closest = closest$1(ev.target(), function (el) {
            return component.getSystem().getByDom(el).toOption();
          }, constant(false));
          return closest.getOr(component);
        }, function (c) {
          return c;
        });
        f(component, target, simulatedEvent);
      });
    };
    var cutter = function (name) {
      return run(name, function (component, simulatedEvent) {
        simulatedEvent.cut();
      });
    };
    var stopper = function (name) {
      return run(name, function (component, simulatedEvent) {
        simulatedEvent.stop();
      });
    };
    var runOnSource = function (name, f) {
      return runOnSourceName(name)(f);
    };
    var runOnAttached = runOnSourceName(attachedToDom());
    var runOnDetached = runOnSourceName(detachedFromDom());
    var runOnInit = runOnSourceName(systemInit());
    var runOnExecute = runOnName(execute());

    var isRecursive = function (component, originator, target) {
      return eq(originator, component.element()) && !eq(originator, target);
    };
    var events = derive([can(focus$1(), function (component, simulatedEvent) {
        var originator = simulatedEvent.event().originator();
        var target = simulatedEvent.event().target();
        if (isRecursive(component, originator, target)) {
          console.warn(focus$1() + ' did not get interpreted by the desired target. ' + '\nOriginator: ' + element(originator) + '\nTarget: ' + element(target) + '\nCheck the ' + focus$1() + ' event handlers');
          return false;
        } else {
          return true;
        }
      })]);

    var DefaultEvents = /*#__PURE__*/Object.freeze({
        events: events
    });

    var prefix = constant('alloy-id-');
    var idAttr = constant('data-alloy-id');

    var prefix$1 = prefix();
    var idAttr$1 = idAttr();
    var write = function (label, elem) {
      var id = generate$1(prefix$1 + label);
      writeOnly(elem, id);
      return id;
    };
    var writeOnly = function (elem, uid) {
      Object.defineProperty(elem.dom(), idAttr$1, {
        value: uid,
        writable: true
      });
    };
    var read$1 = function (elem) {
      var id = isElement(elem) ? elem.dom()[idAttr$1] : null;
      return Option.from(id);
    };
    var generate$2 = function (prefix$$1) {
      return generate$1(prefix$$1);
    };

    var make = identity;

    var NoContextApi = function (getComp) {
      var fail = function (event) {
        return function () {
          throw new Error('The component must be in a context to send: ' + event + '\n' + element(getComp().element()) + ' is not in context.');
        };
      };
      return {
        debugInfo: constant('fake'),
        triggerEvent: fail('triggerEvent'),
        triggerFocus: fail('triggerFocus'),
        triggerEscape: fail('triggerEscape'),
        build: fail('build'),
        addToWorld: fail('addToWorld'),
        removeFromWorld: fail('removeFromWorld'),
        addToGui: fail('addToGui'),
        removeFromGui: fail('removeFromGui'),
        getByUid: fail('getByUid'),
        getByDom: fail('getByDom'),
        broadcast: fail('broadcast'),
        broadcastOn: fail('broadcastOn'),
        broadcastEvent: fail('broadcastEvent'),
        isConnected: constant(false)
      };
    };
    var singleton = NoContextApi();

    var markAsBehaviourApi = function (f, apiName, apiFunction) {
      var delegate = apiFunction.toString();
      var endIndex = delegate.indexOf(')') + 1;
      var openBracketIndex = delegate.indexOf('(');
      var parameters = delegate.substring(openBracketIndex + 1, endIndex - 1).split(/,\s*/);
      f.toFunctionAnnotation = function () {
        return {
          name: apiName,
          parameters: cleanParameters(parameters.slice(0, 1).concat(parameters.slice(3)))
        };
      };
      return f;
    };
    var cleanParameters = function (parameters) {
      return map(parameters, function (p) {
        return endsWith(p, '/*') ? p.substring(0, p.length - '/*'.length) : p;
      });
    };
    var markAsExtraApi = function (f, extraName) {
      var delegate = f.toString();
      var endIndex = delegate.indexOf(')') + 1;
      var openBracketIndex = delegate.indexOf('(');
      var parameters = delegate.substring(openBracketIndex + 1, endIndex - 1).split(/,\s*/);
      f.toFunctionAnnotation = function () {
        return {
          name: extraName,
          parameters: cleanParameters(parameters)
        };
      };
      return f;
    };
    var markAsSketchApi = function (f, apiFunction) {
      var delegate = apiFunction.toString();
      var endIndex = delegate.indexOf(')') + 1;
      var openBracketIndex = delegate.indexOf('(');
      var parameters = delegate.substring(openBracketIndex + 1, endIndex - 1).split(/,\s*/);
      f.toFunctionAnnotation = function () {
        return {
          name: 'OVERRIDE',
          parameters: cleanParameters(parameters.slice(1))
        };
      };
      return f;
    };

    var premadeTag = generate$1('alloy-premade');
    var premade = function (comp) {
      return wrap$1(premadeTag, comp);
    };
    var getPremade = function (spec) {
      return readOptFrom$1(spec, premadeTag);
    };
    var makeApi = function (f) {
      return markAsSketchApi(function (component) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
          rest[_i - 1] = arguments[_i];
        }
        return f.apply(undefined, [component.getApis()].concat([component].concat(rest)));
      }, f);
    };

    var NoState = {
      init: function () {
        return nu$5({
          readState: function () {
            return 'No State required';
          }
        });
      }
    };
    var nu$5 = function (spec) {
      return spec;
    };

    var generateFrom = function (spec, all) {
      var schema = map(all, function (a) {
        return optionObjOf(a.name(), [
          strict$1('config'),
          defaulted$1('state', NoState)
        ]);
      });
      var validated = asRaw('component.behaviours', objOf(schema), spec.behaviours).fold(function (errInfo) {
        throw new Error(formatError(errInfo) + '\nComplete spec:\n' + JSON$1.stringify(spec, null, 2));
      }, function (v) {
        return v;
      });
      return {
        list: all,
        data: map$1(validated, function (optBlobThunk) {
          var optBlob = optBlobThunk;
          var output = optBlob.map(function (blob) {
            return {
              config: blob.config,
              state: blob.state.init(blob.config)
            };
          });
          return function () {
            return output;
          };
        })
      };
    };
    var getBehaviours = function (bData) {
      return bData.list;
    };
    var getData = function (bData) {
      return bData.data;
    };

    var byInnerKey = function (data, tuple) {
      var r = {};
      each$1(data, function (detail, key) {
        each$1(detail, function (value, indexKey) {
          var chain = readOr$1(indexKey, [])(r);
          r[indexKey] = chain.concat([tuple(key, value)]);
        });
      });
      return r;
    };

    var nu$6 = function (s) {
      return {
        classes: s.classes !== undefined ? s.classes : [],
        attributes: s.attributes !== undefined ? s.attributes : {},
        styles: s.styles !== undefined ? s.styles : {}
      };
    };
    var merge$1 = function (defnA, mod) {
      return __assign({}, defnA, {
        attributes: __assign({}, defnA.attributes, mod.attributes),
        styles: __assign({}, defnA.styles, mod.styles),
        classes: defnA.classes.concat(mod.classes)
      });
    };

    var combine = function (info, baseMod, behaviours, base) {
      var modsByBehaviour = __assign({}, baseMod);
      each(behaviours, function (behaviour) {
        modsByBehaviour[behaviour.name()] = behaviour.exhibit(info, base);
      });
      var nameAndMod = function (name, modification) {
        return {
          name: name,
          modification: modification
        };
      };
      var byAspect = byInnerKey(modsByBehaviour, nameAndMod);
      var combineObjects = function (objects) {
        return foldr(objects, function (b, a) {
          return __assign({}, a.modification, b);
        }, {});
      };
      var combinedClasses = foldr(byAspect.classes, function (b, a) {
        return a.modification.concat(b);
      }, []);
      var combinedAttributes = combineObjects(byAspect.attributes);
      var combinedStyles = combineObjects(byAspect.styles);
      return nu$6({
        classes: combinedClasses,
        attributes: combinedAttributes,
        styles: combinedStyles
      });
    };

    var sortKeys = function (label, keyName, array, order) {
      var sliced = array.slice(0);
      try {
        var sorted = sliced.sort(function (a, b) {
          var aKey = a[keyName]();
          var bKey = b[keyName]();
          var aIndex = order.indexOf(aKey);
          var bIndex = order.indexOf(bKey);
          if (aIndex === -1) {
            throw new Error('The ordering for ' + label + ' does not have an entry for ' + aKey + '.\nOrder specified: ' + JSON$1.stringify(order, null, 2));
          }
          if (bIndex === -1) {
            throw new Error('The ordering for ' + label + ' does not have an entry for ' + bKey + '.\nOrder specified: ' + JSON$1.stringify(order, null, 2));
          }
          if (aIndex < bIndex) {
            return -1;
          } else if (bIndex < aIndex) {
            return 1;
          } else {
            return 0;
          }
        });
        return Result.value(sorted);
      } catch (err) {
        return Result.error([err]);
      }
    };

    var uncurried = function (handler, purpose) {
      return {
        handler: handler,
        purpose: constant(purpose)
      };
    };
    var curried = function (handler, purpose) {
      return {
        cHandler: handler,
        purpose: constant(purpose)
      };
    };
    var curryArgs = function (descHandler, extraArgs) {
      return curried(curry.apply(undefined, [descHandler.handler].concat(extraArgs)), descHandler.purpose());
    };
    var getCurried = function (descHandler) {
      return descHandler.cHandler;
    };

    var behaviourTuple = function (name, handler) {
      return {
        name: constant(name),
        handler: constant(handler)
      };
    };
    var nameToHandlers = function (behaviours, info) {
      var r = {};
      each(behaviours, function (behaviour) {
        r[behaviour.name()] = behaviour.handlers(info);
      });
      return r;
    };
    var groupByEvents = function (info, behaviours, base) {
      var behaviourEvents = __assign({}, base, nameToHandlers(behaviours, info));
      return byInnerKey(behaviourEvents, behaviourTuple);
    };
    var combine$1 = function (info, eventOrder, behaviours, base) {
      var byEventName = groupByEvents(info, behaviours, base);
      return combineGroups(byEventName, eventOrder);
    };
    var assemble = function (rawHandler) {
      var handler = read(rawHandler);
      return function (component, simulatedEvent) {
        var rest = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          rest[_i - 2] = arguments[_i];
        }
        var args = [
          component,
          simulatedEvent
        ].concat(rest);
        if (handler.abort.apply(undefined, args)) {
          simulatedEvent.stop();
        } else if (handler.can.apply(undefined, args)) {
          handler.run.apply(undefined, args);
        }
      };
    };
    var missingOrderError = function (eventName, tuples) {
      return Result.error(['The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' + 'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 'can trigger it are: ' + JSON$1.stringify(map(tuples, function (c) {
          return c.name();
        }), null, 2)]);
    };
    var fuse$1 = function (tuples, eventOrder, eventName) {
      var order = eventOrder[eventName];
      if (!order) {
        return missingOrderError(eventName, tuples);
      } else {
        return sortKeys('Event: ' + eventName, 'name', tuples, order).map(function (sortedTuples) {
          var handlers = map(sortedTuples, function (tuple) {
            return tuple.handler();
          });
          return fuse(handlers);
        });
      }
    };
    var combineGroups = function (byEventName, eventOrder) {
      var r = mapToArray(byEventName, function (tuples, eventName) {
        var combined = tuples.length === 1 ? Result.value(tuples[0].handler()) : fuse$1(tuples, eventOrder, eventName);
        return combined.map(function (handler) {
          var assembled = assemble(handler);
          var purpose = tuples.length > 1 ? filter(eventOrder, function (o) {
            return contains(tuples, function (t) {
              return t.name() === o;
            });
          }).join(' > ') : tuples[0].name();
          return wrap$1(eventName, uncurried(assembled, purpose));
        });
      });
      return consolidate(r, {});
    };

    var toInfo = function (spec) {
      return asRaw('custom.definition', objOf([
        field('dom', 'dom', strict(), objOf([
          strict$1('tag'),
          defaulted$1('styles', {}),
          defaulted$1('classes', []),
          defaulted$1('attributes', {}),
          option('value'),
          option('innerHtml')
        ])),
        strict$1('components'),
        strict$1('uid'),
        defaulted$1('events', {}),
        defaulted$1('apis', {}),
        field('eventOrder', 'eventOrder', mergeWith({
          'alloy.execute': [
            'disabling',
            'alloy.base.behaviour',
            'toggling',
            'typeaheadevents'
          ],
          'alloy.focus': [
            'alloy.base.behaviour',
            'focusing',
            'keying'
          ],
          'alloy.system.init': [
            'alloy.base.behaviour',
            'disabling',
            'toggling',
            'representing'
          ],
          'input': [
            'alloy.base.behaviour',
            'representing',
            'streaming',
            'invalidating'
          ],
          'alloy.system.detached': [
            'alloy.base.behaviour',
            'representing'
          ],
          'mousedown': [
            'focusing',
            'alloy.base.behaviour',
            'item-type-events'
          ]
        }), anyValue$1()),
        option('domModification')
      ]), spec);
    };
    var toDefinition = function (detail) {
      return __assign({}, detail.dom, {
        uid: detail.uid,
        domChildren: map(detail.components, function (comp) {
          return comp.element();
        })
      });
    };
    var toModification = function (detail) {
      return detail.domModification.fold(function () {
        return nu$6({});
      }, nu$6);
    };
    var toEvents = function (info) {
      return info.events;
    };

    var read$2 = function (element, attr) {
      var value = get$2(element, attr);
      return value === undefined || value === '' ? [] : value.split(' ');
    };
    var add = function (element, attr, id) {
      var old = read$2(element, attr);
      var nu = old.concat([id]);
      set$1(element, attr, nu.join(' '));
      return true;
    };
    var remove$2 = function (element, attr, id) {
      var nu = filter(read$2(element, attr), function (v) {
        return v !== id;
      });
      if (nu.length > 0) {
        set$1(element, attr, nu.join(' '));
      } else {
        remove$1(element, attr);
      }
      return false;
    };

    var supports = function (element) {
      return element.dom().classList !== undefined;
    };
    var get$3 = function (element) {
      return read$2(element, 'class');
    };
    var add$1 = function (element, clazz) {
      return add(element, 'class', clazz);
    };
    var remove$3 = function (element, clazz) {
      return remove$2(element, 'class', clazz);
    };

    var add$2 = function (element, clazz) {
      if (supports(element)) {
        element.dom().classList.add(clazz);
      } else {
        add$1(element, clazz);
      }
    };
    var cleanClass = function (element) {
      var classList = supports(element) ? element.dom().classList : get$3(element);
      if (classList.length === 0) {
        remove$1(element, 'class');
      }
    };
    var remove$4 = function (element, clazz) {
      if (supports(element)) {
        var classList = element.dom().classList;
        classList.remove(clazz);
      } else {
        remove$3(element, clazz);
      }
      cleanClass(element);
    };
    var has$2 = function (element, clazz) {
      return supports(element) && element.dom().classList.contains(clazz);
    };

    var add$3 = function (element, classes) {
      each(classes, function (x) {
        add$2(element, x);
      });
    };
    var remove$5 = function (element, classes) {
      each(classes, function (x) {
        remove$4(element, x);
      });
    };

    var isSupported = function (dom) {
      return dom.style !== undefined;
    };

    var internalSet = function (dom, property, value) {
      if (!isString(value)) {
        console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
        throw new Error('CSS value must be a string: ' + value);
      }
      if (isSupported(dom)) {
        dom.style.setProperty(property, value);
      }
    };
    var internalRemove = function (dom, property) {
      if (isSupported(dom)) {
        dom.style.removeProperty(property);
      }
    };
    var set$2 = function (element, property, value) {
      var dom = element.dom();
      internalSet(dom, property, value);
    };
    var setAll$1 = function (element, css) {
      var dom = element.dom();
      each$1(css, function (v, k) {
        internalSet(dom, k, v);
      });
    };
    var setOptions = function (element, css) {
      var dom = element.dom();
      each$1(css, function (v, k) {
        v.fold(function () {
          internalRemove(dom, k);
        }, function (value) {
          internalSet(dom, k, value);
        });
      });
    };
    var get$5 = function (element, property) {
      var dom = element.dom();
      var styles = window.getComputedStyle(dom);
      var r = styles.getPropertyValue(property);
      var v = r === '' && !inBody(element) ? getUnsafeProperty(dom, property) : r;
      return v === null ? undefined : v;
    };
    var getUnsafeProperty = function (dom, property) {
      return isSupported(dom) ? dom.style.getPropertyValue(property) : '';
    };
    var getRaw = function (element, property) {
      var dom = element.dom();
      var raw = getUnsafeProperty(dom, property);
      return Option.from(raw).filter(function (r) {
        return r.length > 0;
      });
    };
    var isValidValue = function (tag, property, value) {
      var element = Element$$1.fromTag(tag);
      set$2(element, property, value);
      var style = getRaw(element, property);
      return style.isSome();
    };
    var remove$6 = function (element, property) {
      var dom = element.dom();
      internalRemove(dom, property);
      if (has$1(element, 'style') && trim(get$2(element, 'style')) === '') {
        remove$1(element, 'style');
      }
    };
    var reflow = function (e) {
      return e.dom().offsetWidth;
    };

    var get$6 = function (element) {
      return element.dom().value;
    };
    var set$3 = function (element, value) {
      if (value === undefined) {
        throw new Error('Value.set was undefined');
      }
      element.dom().value = value;
    };

    var renderToDom = function (definition) {
      var subject = Element$$1.fromTag(definition.tag);
      setAll(subject, definition.attributes);
      add$3(subject, definition.classes);
      setAll$1(subject, definition.styles);
      definition.innerHtml.each(function (html) {
        return set(subject, html);
      });
      var children = definition.domChildren;
      append$1(subject, children);
      definition.value.each(function (value) {
        set$3(subject, value);
      });
      if (!definition.uid) {
        debugger;
      }
      writeOnly(subject, definition.uid);
      return subject;
    };

    var getBehaviours$1 = function (spec) {
      var behaviours = readOr$1('behaviours', {})(spec);
      var keys$$1 = filter(keys(behaviours), function (k) {
        return behaviours[k] !== undefined;
      });
      return map(keys$$1, function (k) {
        return behaviours[k].me;
      });
    };
    var generateFrom$1 = function (spec, all) {
      return generateFrom(spec, all);
    };
    var generate$3 = function (spec) {
      var all = getBehaviours$1(spec);
      return generateFrom$1(spec, all);
    };

    var getDomDefinition = function (info, bList, bData) {
      var definition = toDefinition(info);
      var infoModification = toModification(info);
      var baseModification = { 'alloy.base.modification': infoModification };
      var modification = bList.length > 0 ? combine(bData, baseModification, bList, definition) : infoModification;
      return merge$1(definition, modification);
    };
    var getEvents = function (info, bList, bData) {
      var baseEvents = { 'alloy.base.behaviour': toEvents(info) };
      return combine$1(bData, info.eventOrder, bList, baseEvents).getOrDie();
    };
    var build = function (spec) {
      var getMe = function () {
        return me;
      };
      var systemApi = Cell(singleton);
      var info = getOrDie$1(toInfo(spec));
      var bBlob = generate$3(spec);
      var bList = getBehaviours(bBlob);
      var bData = getData(bBlob);
      var modDefinition = getDomDefinition(info, bList, bData);
      var item = renderToDom(modDefinition);
      var events = getEvents(info, bList, bData);
      var subcomponents = Cell(info.components);
      var connect = function (newApi) {
        systemApi.set(newApi);
      };
      var disconnect = function () {
        systemApi.set(NoContextApi(getMe));
      };
      var syncComponents = function () {
        var children$$1 = children(item);
        var subs = bind(children$$1, function (child$$1) {
          return systemApi.get().getByDom(child$$1).fold(function () {
            return [];
          }, function (c) {
            return [c];
          });
        });
        subcomponents.set(subs);
      };
      var config = function (behaviour) {
        var b = bData;
        var f = isFunction(b[behaviour.name()]) ? b[behaviour.name()] : function () {
          throw new Error('Could not find ' + behaviour.name() + ' in ' + JSON$1.stringify(spec, null, 2));
        };
        return f();
      };
      var hasConfigured = function (behaviour) {
        return isFunction(bData[behaviour.name()]);
      };
      var getApis = function () {
        return info.apis;
      };
      var readState = function (behaviourName) {
        return bData[behaviourName]().map(function (b) {
          return b.state.readState();
        }).getOr('not enabled');
      };
      var me = {
        getSystem: systemApi.get,
        config: config,
        hasConfigured: hasConfigured,
        spec: constant(spec),
        readState: readState,
        getApis: getApis,
        connect: connect,
        disconnect: disconnect,
        element: constant(item),
        syncComponents: syncComponents,
        components: subcomponents.get,
        events: constant(events)
      };
      return me;
    };

    var buildSubcomponents = function (spec) {
      var components = readOr$1('components', [])(spec);
      return map(components, build$1);
    };
    var buildFromSpec = function (userSpec) {
      var _a = make(userSpec), specEvents = _a.events, spec = __rest(_a, ['events']);
      var components = buildSubcomponents(spec);
      var completeSpec = __assign({}, spec, {
        events: __assign({}, DefaultEvents, specEvents),
        components: components
      });
      return Result.value(build(completeSpec));
    };
    var text = function (textContent) {
      var element = Element$$1.fromText(textContent);
      return external({ element: element });
    };
    var external = function (spec) {
      var extSpec = asRawOrDie('external.component', objOfOnly([
        strict$1('element'),
        option('uid')
      ]), spec);
      var systemApi = Cell(NoContextApi());
      var connect = function (newApi) {
        systemApi.set(newApi);
      };
      var disconnect = function () {
        systemApi.set(NoContextApi(function () {
          return me;
        }));
      };
      extSpec.uid.each(function (uid) {
        writeOnly(extSpec.element, uid);
      });
      var me = {
        getSystem: systemApi.get,
        config: Option.none,
        hasConfigured: constant(false),
        connect: connect,
        disconnect: disconnect,
        getApis: function () {
          return {};
        },
        element: constant(extSpec.element),
        spec: constant(spec),
        readState: constant('No state'),
        syncComponents: noop,
        components: constant([]),
        events: constant({})
      };
      return premade(me);
    };
    var uids = generate$2;
    var build$1 = function (spec) {
      return getPremade(spec).fold(function () {
        var userSpecWithUid = spec.hasOwnProperty('uid') ? spec : __assign({ uid: uids('') }, spec);
        return buildFromSpec(userSpecWithUid).getOrDie();
      }, function (prebuilt) {
        return prebuilt;
      });
    };
    var premade$1 = premade;

    var closest$2 = function (scope, predicate, isRoot) {
      return closest(scope, predicate, isRoot).isSome();
    };

    var ancestor$2 = function (scope, selector, isRoot) {
      return ancestor(scope, function (e) {
        return is(e, selector);
      }, isRoot);
    };
    var descendant$2 = function (scope, selector) {
      return one(selector, scope);
    };
    var closest$3 = function (scope, selector, isRoot) {
      return ClosestOrAncestor(is, ancestor$2, scope, selector, isRoot);
    };

    var find$3 = function (queryElem) {
      var dependent = closest(queryElem, function (elem) {
        if (!isElement(elem)) {
          return false;
        }
        var id = get$2(elem, 'id');
        return id !== undefined && id.indexOf('aria-owns') > -1;
      });
      return dependent.bind(function (dep) {
        var id = get$2(dep, 'id');
        var doc = owner(dep);
        return descendant$2(doc, '[aria-owns="' + id + '"]');
      });
    };
    var manager = function () {
      var ariaId = generate$1('aria-owns');
      var link = function (elem) {
        set$1(elem, 'aria-owns', ariaId);
      };
      var unlink = function (elem) {
        remove$1(elem, 'aria-owns');
      };
      return {
        id: constant(ariaId),
        link: link,
        unlink: unlink
      };
    };

    var isAriaPartOf = function (component, queryElem) {
      return find$3(queryElem).exists(function (owner) {
        return isPartOf(component, owner);
      });
    };
    var isPartOf = function (component, queryElem) {
      return closest$2(queryElem, function (el) {
        return eq(el, component.element());
      }, constant(false)) || isAriaPartOf(component, queryElem);
    };

    var menuFields = constant([
      strict$1('menu'),
      strict$1('selectedMenu')
    ]);
    var itemFields = constant([
      strict$1('item'),
      strict$1('selectedItem')
    ]);
    var schema = constant(objOf(itemFields().concat(menuFields())));
    var itemSchema = constant(objOf(itemFields()));

    var _initSize = strictObjOf('initSize', [
      strict$1('numColumns'),
      strict$1('numRows')
    ]);
    var itemMarkers = function () {
      return strictOf('markers', itemSchema());
    };
    var tieredMenuMarkers = function () {
      return strictObjOf('markers', [strict$1('backgroundMenu')].concat(menuFields()).concat(itemFields()));
    };
    var markers = function (required) {
      return strictObjOf('markers', map(required, strict$1));
    };
    var onPresenceHandler = function (label, fieldName, presence) {
      var trace = getTrace();
      return field(fieldName, fieldName, presence, valueOf(function (f) {
        return Result.value(function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return f.apply(undefined, args);
        });
      }));
    };
    var onHandler = function (fieldName) {
      return onPresenceHandler('onHandler', fieldName, defaulted(noop));
    };
    var onKeyboardHandler = function (fieldName) {
      return onPresenceHandler('onKeyboardHandler', fieldName, defaulted(Option.none));
    };
    var onStrictHandler = function (fieldName) {
      return onPresenceHandler('onHandler', fieldName, strict());
    };
    var onStrictKeyboardHandler = function (fieldName) {
      return onPresenceHandler('onKeyboardHandler', fieldName, strict());
    };
    var output$1 = function (name, value) {
      return state$1(name, constant(value));
    };
    var snapshot$1 = function (name) {
      return state$1(name, identity);
    };
    var initSize = constant(_initSize);

    var executeEvent = function (bConfig, bState, executor) {
      return runOnExecute(function (component) {
        executor(component, bConfig, bState);
      });
    };
    var loadEvent = function (bConfig, bState, f) {
      return runOnInit(function (component, simulatedEvent) {
        f(component, bConfig, bState);
      });
    };
    var create = function (schema, name, active, apis, extra, state) {
      var configSchema = objOfOnly(schema);
      var schemaSchema = optionObjOf(name, [optionObjOfOnly('config', schema)]);
      return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
    };
    var createModes = function (modes, name, active, apis, extra, state) {
      var configSchema = modes;
      var schemaSchema = optionObjOf(name, [optionOf('config', modes)]);
      return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
    };
    var wrapApi = function (bName, apiFunction, apiName) {
      var f = function (component) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
          rest[_i - 1] = arguments[_i];
        }
        var args = [component].concat(rest);
        return component.config({ name: constant(bName) }).fold(function () {
          throw new Error('We could not find any behaviour configuration for: ' + bName + '. Using API: ' + apiName);
        }, function (info) {
          var rest = Array.prototype.slice.call(args, 1);
          return apiFunction.apply(undefined, [
            component,
            info.config,
            info.state
          ].concat(rest));
        });
      };
      return markAsBehaviourApi(f, apiName, apiFunction);
    };
    var revokeBehaviour = function (name) {
      return {
        key: name,
        value: undefined
      };
    };
    var doCreate = function (configSchema, schemaSchema, name, active, apis, extra, state) {
      var getConfig = function (info) {
        return hasKey$1(info, name) ? info[name]() : Option.none();
      };
      var wrappedApis = map$1(apis, function (apiF, apiName) {
        return wrapApi(name, apiF, apiName);
      });
      var wrappedExtra = map$1(extra, function (extraF, extraName) {
        return markAsExtraApi(extraF, extraName);
      });
      var me = __assign({}, wrappedExtra, wrappedApis, {
        revoke: curry(revokeBehaviour, name),
        config: function (spec) {
          var prepared = asRawOrDie(name + '-config', configSchema, spec);
          return {
            key: name,
            value: {
              config: prepared,
              me: me,
              configAsRaw: cached(function () {
                return asRawOrDie(name + '-config', configSchema, spec);
              }),
              initialConfig: spec,
              state: state
            }
          };
        },
        schema: function () {
          return schemaSchema;
        },
        exhibit: function (info, base) {
          return getConfig(info).bind(function (behaviourInfo) {
            return readOptFrom$1(active, 'exhibit').map(function (exhibitor) {
              return exhibitor(base, behaviourInfo.config, behaviourInfo.state);
            });
          }).getOr(nu$6({}));
        },
        name: function () {
          return name;
        },
        handlers: function (info) {
          return getConfig(info).map(function (behaviourInfo) {
            var getEvents = readOr$1('events', function (a, b) {
              return {};
            })(active);
            return getEvents(behaviourInfo.config, behaviourInfo.state);
          }).getOr({});
        }
      });
      return me;
    };

    var derive$1 = function (capabilities) {
      return wrapAll$1(capabilities);
    };
    var simpleSchema = objOfOnly([
      strict$1('fields'),
      strict$1('name'),
      defaulted$1('active', {}),
      defaulted$1('apis', {}),
      defaulted$1('state', NoState),
      defaulted$1('extra', {})
    ]);
    var create$1 = function (data) {
      var value = asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
      return create(value.fields, value.name, value.active, value.apis, value.extra, value.state);
    };
    var modeSchema = objOfOnly([
      strict$1('branchKey'),
      strict$1('branches'),
      strict$1('name'),
      defaulted$1('active', {}),
      defaulted$1('apis', {}),
      defaulted$1('state', NoState),
      defaulted$1('extra', {})
    ]);
    var createModes$1 = function (data) {
      var value = asRawOrDie('Creating behaviour: ' + data.name, modeSchema, data);
      return createModes(choose$1(value.branchKey, value.branches), value.name, value.active, value.apis, value.extra, value.state);
    };
    var revoke$1 = constant(undefined);

    var chooseChannels = function (channels, message) {
      return message.universal() ? channels : filter(channels, function (ch) {
        return contains(message.channels(), ch);
      });
    };
    var events$1 = function (receiveConfig) {
      return derive([run(receive(), function (component, message) {
          var channelMap = receiveConfig.channels;
          var channels = keys(channelMap);
          var targetChannels = chooseChannels(channels, message);
          each(targetChannels, function (ch) {
            var channelInfo = channelMap[ch];
            var channelSchema = channelInfo.schema;
            var data = asRawOrDie('channel[' + ch + '] data\nReceiver: ' + element(component.element()), channelSchema, message.data());
            channelInfo.onReceive(component, data);
          });
        })]);
    };

    var ActiveReceiving = /*#__PURE__*/Object.freeze({
        events: events$1
    });

    var ReceivingSchema = [strictOf('channels', setOf$1(Result.value, objOfOnly([
        onStrictHandler('onReceive'),
        defaulted$1('schema', anyValue$1())
      ])))];

    var Receiving = create$1({
      fields: ReceivingSchema,
      name: 'receiving',
      active: ActiveReceiving
    });

    var exhibit = function (base, posConfig) {
      return nu$6({
        classes: [],
        styles: posConfig.useFixed ? {} : { position: 'relative' }
      });
    };

    var ActivePosition = /*#__PURE__*/Object.freeze({
        exhibit: exhibit
    });

    var attached = function (element, scope) {
      var doc = scope || Element$$1.fromDom(document.documentElement);
      return ancestor(element, curry(eq, doc)).isSome();
    };
    var windowOf = function (element) {
      var dom = element.dom();
      if (dom === dom.window && element instanceof Window) {
        return element;
      }
      return isDocument(element) ? dom.defaultView || dom.parentWindow : null;
    };

    var r = function (left, top) {
      var translate = function (x, y) {
        return r(left + x, top + y);
      };
      return {
        left: constant(left),
        top: constant(top),
        translate: translate
      };
    };
    var Position = r;

    var boxPosition = function (dom) {
      var box = dom.getBoundingClientRect();
      return Position(box.left, box.top);
    };
    var firstDefinedOrZero = function (a, b) {
      return a !== undefined ? a : b !== undefined ? b : 0;
    };
    var absolute = function (element) {
      var doc = element.dom().ownerDocument;
      var body = doc.body;
      var win = windowOf(Element$$1.fromDom(doc));
      var html = doc.documentElement;
      var scrollTop = firstDefinedOrZero(win.pageYOffset, html.scrollTop);
      var scrollLeft = firstDefinedOrZero(win.pageXOffset, html.scrollLeft);
      var clientTop = firstDefinedOrZero(html.clientTop, body.clientTop);
      var clientLeft = firstDefinedOrZero(html.clientLeft, body.clientLeft);
      return viewport(element).translate(scrollLeft - clientLeft, scrollTop - clientTop);
    };
    var viewport = function (element) {
      var dom = element.dom();
      var doc = dom.ownerDocument;
      var body = doc.body;
      var html = Element$$1.fromDom(doc.documentElement);
      if (body === dom) {
        return Position(body.offsetLeft, body.offsetTop);
      }
      if (!attached(element, html)) {
        return Position(0, 0);
      }
      return boxPosition(dom);
    };

    var isSafari = PlatformDetection$1.detect().browser.isSafari();
    var get$7 = function (_DOC) {
      var doc = _DOC !== undefined ? _DOC.dom() : document;
      var x = doc.body.scrollLeft || doc.documentElement.scrollLeft;
      var y = doc.body.scrollTop || doc.documentElement.scrollTop;
      return Position(x, y);
    };

    function Dimension (name, getOffset) {
      var set = function (element, h) {
        if (!isNumber(h) && !h.match(/^[0-9]+$/)) {
          throw new Error(name + '.set accepts only positive integer values. Value was ' + h);
        }
        var dom = element.dom();
        if (isSupported(dom)) {
          dom.style[name] = h + 'px';
        }
      };
      var get = function (element) {
        var r = getOffset(element);
        if (r <= 0 || r === null) {
          var css = get$5(element, name);
          return parseFloat(css) || 0;
        }
        return r;
      };
      var getOuter = get;
      var aggregate = function (element, properties) {
        return foldl(properties, function (acc, property) {
          var val = get$5(element, property);
          var value = val === undefined ? 0 : parseInt(val, 10);
          return isNaN(value) ? acc : acc + value;
        }, 0);
      };
      var max = function (element, value, properties) {
        var cumulativeInclusions = aggregate(element, properties);
        var absoluteMax = value > cumulativeInclusions ? value - cumulativeInclusions : 0;
        return absoluteMax;
      };
      return {
        set: set,
        get: get,
        getOuter: getOuter,
        aggregate: aggregate,
        max: max
      };
    }

    var api = Dimension('width', function (element) {
      return element.dom().offsetWidth;
    });
    var set$4 = function (element, h) {
      api.set(element, h);
    };
    var get$8 = function (element) {
      return api.get(element);
    };
    var getOuter$1 = function (element) {
      return api.getOuter(element);
    };

    var api$1 = Dimension('height', function (element) {
      var dom = element.dom();
      return inBody(element) ? dom.getBoundingClientRect().height : dom.offsetHeight;
    });
    var get$9 = function (element) {
      return api$1.get(element);
    };
    var getOuter$2 = function (element) {
      return api$1.getOuter(element);
    };
    var setMax$1 = function (element, value) {
      var inclusions = [
        'margin-top',
        'border-top-width',
        'padding-top',
        'padding-bottom',
        'border-bottom-width',
        'margin-bottom'
      ];
      var absMax = api$1.max(element, value, inclusions);
      set$2(element, 'max-height', absMax + 'px');
    };

    var decision = MixedBag([
      'x',
      'y',
      'width',
      'height',
      'maxHeight',
      'direction',
      'classes',
      'label',
      'candidateYforTest'
    ], []);
    var css = Immutable('position', 'left', 'top', 'right', 'bottom');

    var adt$2 = Adt.generate([
      { southeast: [] },
      { southwest: [] },
      { northeast: [] },
      { northwest: [] },
      { south: [] },
      { north: [] },
      { east: [] },
      { west: [] }
    ]);
    var cata = function (subject, southeast, southwest, northeast, northwest, south, north, east, west) {
      return subject.fold(southeast, southwest, northeast, northwest, south, north, east, west);
    };
    var cataVertical = function (subject, south, middle, north) {
      return subject.fold(south, south, north, north, south, north, middle, middle);
    };
    var southeast = adt$2.southeast;
    var southwest = adt$2.southwest;
    var northeast = adt$2.northeast;
    var northwest = adt$2.northwest;
    var south = adt$2.south;
    var north = adt$2.north;
    var east = adt$2.east;
    var west = adt$2.west;

    var pointed = Immutable('point', 'width', 'height');
    var rect = Immutable('x', 'y', 'width', 'height');
    var bounds = function (x, y, width, height) {
      return {
        x: constant(x),
        y: constant(y),
        width: constant(width),
        height: constant(height),
        right: constant(x + width),
        bottom: constant(y + height)
      };
    };
    var box = function (element) {
      var xy = absolute(element);
      var w = getOuter$1(element);
      var h = getOuter$2(element);
      return bounds(xy.left(), xy.top(), w, h);
    };

    var walkUp = function (navigation, doc) {
      var frame = navigation.view(doc);
      return frame.fold(constant([]), function (f) {
        var parent = navigation.owner(f);
        var rest = walkUp(navigation, parent);
        return [f].concat(rest);
      });
    };
    var pathTo = function (element, navigation) {
      var d = navigation.owner(element);
      var paths = walkUp(navigation, d);
      return Option.some(paths);
    };

    var view = function (doc) {
      var element = doc.dom() === document ? Option.none() : Option.from(doc.dom().defaultView.frameElement);
      return element.map(Element$$1.fromDom);
    };
    var owner$1 = function (element) {
      return owner(element);
    };

    var Navigation = /*#__PURE__*/Object.freeze({
        view: view,
        owner: owner$1
    });

    var find$4 = function (element) {
      var doc = Element$$1.fromDom(document);
      var scroll$$1 = get$7(doc);
      var path = pathTo(element, Navigation);
      return path.fold(curry(absolute, element), function (frames$$1) {
        var offset = viewport(element);
        var r = foldr(frames$$1, function (b, a) {
          var loc = viewport(a);
          return {
            left: b.left + loc.left(),
            top: b.top + loc.top()
          };
        }, {
          left: 0,
          top: 0
        });
        return Position(r.left + offset.left() + scroll$$1.left(), r.top + offset.top() + scroll$$1.top());
      });
    };

    var win = function () {
      var width = window.innerWidth;
      var height = window.innerHeight;
      var doc = Element$$1.fromDom(document);
      var scroll$$1 = get$7(doc);
      return bounds(scroll$$1.left(), scroll$$1.top(), width, height);
    };

    var adt$3 = Adt.generate([
      { none: [] },
      {
        relative: [
          'x',
          'y',
          'width',
          'height'
        ]
      },
      {
        fixed: [
          'x',
          'y',
          'width',
          'height'
        ]
      }
    ]);
    var positionWithDirection = function (posName, decision$$1, x, y, width, height) {
      var decisionX = decision$$1.x() - x;
      var decisionY = decision$$1.y() - y;
      var decisionWidth = decision$$1.width();
      var decisionHeight = decision$$1.height();
      var decisionRight = width - (decisionX + decisionWidth);
      var decisionBottom = height - (decisionY + decisionHeight);
      var left = Option.some(decisionX);
      var top = Option.some(decisionY);
      var right = Option.some(decisionRight);
      var bottom = Option.some(decisionBottom);
      var none = Option.none();
      return cata(decision$$1.direction(), function () {
        return css(posName, left, top, none, none);
      }, function () {
        return css(posName, none, top, right, none);
      }, function () {
        return css(posName, left, none, none, bottom);
      }, function () {
        return css(posName, none, none, right, bottom);
      }, function () {
        return css(posName, left, top, none, none);
      }, function () {
        return css(posName, left, none, none, bottom);
      }, function () {
        return css(posName, left, top, none, none);
      }, function () {
        return css(posName, none, top, right, none);
      });
    };
    var reposition = function (origin, decision$$1) {
      return origin.fold(function () {
        return css('absolute', Option.some(decision$$1.x()), Option.some(decision$$1.y()), Option.none(), Option.none());
      }, function (x, y, width, height) {
        return positionWithDirection('absolute', decision$$1, x, y, width, height);
      }, function (x, y, width, height) {
        return positionWithDirection('fixed', decision$$1, x, y, width, height);
      });
    };
    var toBox = function (origin, element) {
      var rel = curry(find$4, element);
      var position = origin.fold(rel, rel, function () {
        var scroll = get$7();
        return find$4(element).translate(-scroll.left(), -scroll.top());
      });
      var width = getOuter$1(element);
      var height = getOuter$2(element);
      return bounds(position.left(), position.top(), width, height);
    };
    var viewport$1 = function (origin, getBounds) {
      return getBounds.fold(function () {
        return origin.fold(win, win, bounds);
      }, function (b) {
        return origin.fold(b, b, bounds);
      });
    };
    var cata$1 = function (subject, onNone, onRelative, onFixed) {
      return subject.fold(onNone, onRelative, onFixed);
    };
    var relative$1 = adt$3.relative;
    var fixed = adt$3.fixed;

    var anchor = Immutable('anchorBox', 'origin');
    var box$1 = function (anchorBox, origin) {
      return anchor(anchorBox, origin);
    };

    var adt$4 = Adt.generate([
      { fit: ['reposition'] },
      {
        nofit: [
          'reposition',
          'deltaW',
          'deltaH'
        ]
      }
    ]);
    var attempt = function (candidate, width, height, bounds) {
      var candidateX = candidate.x();
      var candidateY = candidate.y();
      var bubbleLeft = candidate.bubble().offset().left();
      var bubbleTop = candidate.bubble().offset().top();
      var boundsX = bounds.x();
      var boundsY = bounds.y();
      var boundsWidth = bounds.width();
      var boundsHeight = bounds.height();
      var newX = candidateX + bubbleLeft;
      var newY = candidateY + bubbleTop;
      var xInBounds = newX >= boundsX;
      var yInBounds = newY >= boundsY;
      var originInBounds = xInBounds && yInBounds;
      var xFit = newX + width <= boundsX + boundsWidth;
      var yFit = newY + height <= boundsY + boundsHeight;
      var sizeInBounds = xFit && yFit;
      var deltaW = xInBounds ? Math.min(width, boundsX + boundsWidth - newX) : Math.abs(boundsX - (newX + width));
      var deltaH = yInBounds ? Math.min(height, boundsY + boundsHeight - newY) : Math.abs(boundsY - (newY + height));
      var maxX = bounds.x() + bounds.width();
      var minX = Math.max(bounds.x(), newX);
      var limitX = Math.min(minX, maxX);
      var limitY = yInBounds ? newY : newY + (height - deltaH);
      var upAvailable = constant(limitY + deltaH - boundsY);
      var downAvailable = constant(boundsY + boundsHeight - limitY);
      var maxHeight = cataVertical(candidate.direction(), downAvailable, downAvailable, upAvailable);
      var reposition = decision({
        x: limitX,
        y: limitY,
        width: deltaW,
        height: deltaH,
        maxHeight: maxHeight,
        direction: candidate.direction(),
        classes: {
          on: candidate.bubble().classesOn(),
          off: candidate.bubble().classesOff()
        },
        label: candidate.label(),
        candidateYforTest: newY
      });
      return originInBounds && sizeInBounds ? adt$4.fit(reposition) : adt$4.nofit(reposition, deltaW, deltaH);
    };
    var attempts = function (candidates, anchorBox, elementBox, bubbles, bounds) {
      var panelWidth = elementBox.width();
      var panelHeight = elementBox.height();
      var attemptBestFit = function (layout, reposition, deltaW, deltaH) {
        var next = layout(anchorBox, elementBox, bubbles);
        var attemptLayout = attempt(next, panelWidth, panelHeight, bounds);
        return attemptLayout.fold(adt$4.fit, function (newReposition, newDeltaW, newDeltaH) {
          var improved = newDeltaH > deltaH || newDeltaW > deltaW;
          return improved ? adt$4.nofit(newReposition, newDeltaW, newDeltaH) : adt$4.nofit(reposition, deltaW, deltaH);
        });
      };
      var abc = foldl(candidates, function (b, a) {
        var bestNext = curry(attemptBestFit, a);
        return b.fold(adt$4.fit, bestNext);
      }, adt$4.nofit(decision({
        x: anchorBox.x(),
        y: anchorBox.y(),
        width: elementBox.width(),
        height: elementBox.height(),
        maxHeight: elementBox.height(),
        direction: southeast(),
        classes: [],
        label: 'none',
        candidateYforTest: anchorBox.y()
      }), -1, -1));
      return abc.fold(identity, identity);
    };

    var elementSize = function (p) {
      return {
        width: constant(getOuter$1(p)),
        height: constant(getOuter$2(p))
      };
    };
    var layout = function (anchorBox, element, bubbles, options) {
      remove$6(element, 'max-height');
      var elementBox = elementSize(element);
      return attempts(options.preference(), anchorBox, elementBox, bubbles, options.bounds());
    };
    var setClasses = function (element, decision) {
      var classInfo = decision.classes();
      remove$5(element, classInfo.off);
      add$3(element, classInfo.on);
    };
    var setHeight = function (element, decision, options) {
      var maxHeightFunction = options.maxHeightFunction();
      maxHeightFunction(element, decision.maxHeight());
    };
    var position = function (element, decision, options) {
      var addPx = function (num) {
        return num + 'px';
      };
      var newPosition = reposition(options.origin(), decision);
      setOptions(element, {
        position: Option.some(newPosition.position()),
        left: newPosition.left().map(addPx),
        top: newPosition.top().map(addPx),
        right: newPosition.right().map(addPx),
        bottom: newPosition.bottom().map(addPx)
      });
    };

    var setMaxHeight = function (element, maxHeight) {
      setMax$1(element, Math.floor(maxHeight));
    };
    var anchored = constant(function (element, available) {
      setMaxHeight(element, available);
      setAll$1(element, {
        'overflow-x': 'hidden',
        'overflow-y': 'auto'
      });
    });
    var expandable = constant(function (element, available) {
      setMaxHeight(element, available);
    });

    var reparteeOptions = MixedBag([
      'bounds',
      'origin',
      'preference',
      'maxHeightFunction'
    ], []);
    var defaultOr = function (options, key, dephault) {
      return options[key] === undefined ? dephault : options[key];
    };
    var simple = function (anchor, element, bubble, layouts, getBounds, overrideOptions) {
      var maxHeightFunction = defaultOr(overrideOptions, 'maxHeightFunction', anchored());
      var anchorBox = anchor.anchorBox();
      var origin = anchor.origin();
      var options = reparteeOptions({
        bounds: viewport$1(origin, getBounds),
        origin: origin,
        preference: layouts,
        maxHeightFunction: maxHeightFunction
      });
      go(anchorBox, element, bubble, options);
    };
    var go = function (anchorBox, element, bubble, options) {
      var decision = layout(anchorBox, element, bubble, options);
      position(element, decision, options);
      setClasses(element, decision);
      setHeight(element, decision, options);
    };

    var allAlignments = [
      'valignCentre',
      'alignLeft',
      'alignRight',
      'alignCentre',
      'top',
      'bottom',
      'left',
      'right'
    ];
    var nu$7 = function (width, yoffset, classes) {
      var getClasses = function (prop) {
        return readOptFrom$1(classes, prop).getOr([]);
      };
      var make = function (xDelta, yDelta, alignmentsOn) {
        var alignmentsOff = difference(allAlignments, alignmentsOn);
        return {
          offset: function () {
            return Position(xDelta, yDelta);
          },
          classesOn: function () {
            return bind(alignmentsOn, getClasses);
          },
          classesOff: function () {
            return bind(alignmentsOff, getClasses);
          }
        };
      };
      return {
        southeast: function () {
          return make(-width, yoffset, [
            'top',
            'alignLeft'
          ]);
        },
        southwest: function () {
          return make(width, yoffset, [
            'top',
            'alignRight'
          ]);
        },
        south: function () {
          return make(-width / 2, yoffset, [
            'top',
            'alignCentre'
          ]);
        },
        northeast: function () {
          return make(-width, -yoffset, [
            'bottom',
            'alignLeft'
          ]);
        },
        northwest: function () {
          return make(width, -yoffset, [
            'bottom',
            'alignRight'
          ]);
        },
        north: function () {
          return make(-width / 2, -yoffset, [
            'bottom',
            'alignCentre'
          ]);
        },
        east: function () {
          return make(width, -yoffset / 2, [
            'valignCentre',
            'left'
          ]);
        },
        west: function () {
          return make(-width, -yoffset / 2, [
            'valignCentre',
            'right'
          ]);
        }
      };
    };
    var fallback = function () {
      return nu$7(0, 0, {});
    };

    var nu$8 = Immutable('x', 'y', 'bubble', 'direction', 'label');

    var eastX = function (anchor) {
      return anchor.x();
    };
    var middleX = function (anchor, element) {
      return anchor.x() + anchor.width() / 2 - element.width() / 2;
    };
    var westX = function (anchor, element) {
      return anchor.x() + anchor.width() - element.width();
    };
    var northY = function (anchor, element) {
      return anchor.y() - element.height();
    };
    var southY = function (anchor) {
      return anchor.y() + anchor.height();
    };
    var centreY = function (anchor, element) {
      return anchor.y() + anchor.height() / 2 - element.height() / 2;
    };
    var eastEdgeX = function (anchor) {
      return anchor.x() + anchor.width();
    };
    var westEdgeX = function (anchor, element) {
      return anchor.x() - element.width();
    };
    var southeast$1 = function (anchor, element, bubbles) {
      return nu$8(eastX(anchor), southY(anchor), bubbles.southeast(), southeast(), 'layout-se');
    };
    var southwest$1 = function (anchor, element, bubbles) {
      return nu$8(westX(anchor, element), southY(anchor), bubbles.southwest(), southwest(), 'layout-sw');
    };
    var northeast$1 = function (anchor, element, bubbles) {
      return nu$8(eastX(anchor), northY(anchor, element), bubbles.northeast(), northeast(), 'layout-ne');
    };
    var northwest$1 = function (anchor, element, bubbles) {
      return nu$8(westX(anchor, element), northY(anchor, element), bubbles.northwest(), northwest(), 'layout-nw');
    };
    var north$1 = function (anchor, element, bubbles) {
      return nu$8(middleX(anchor, element), northY(anchor, element), bubbles.north(), north(), 'layout-n');
    };
    var south$1 = function (anchor, element, bubbles) {
      return nu$8(middleX(anchor, element), southY(anchor), bubbles.south(), south(), 'layout-s');
    };
    var east$1 = function (anchor, element, bubbles) {
      return nu$8(eastEdgeX(anchor), centreY(anchor, element), bubbles.east(), east(), 'layout-e');
    };
    var west$1 = function (anchor, element, bubbles) {
      return nu$8(westEdgeX(anchor, element), centreY(anchor, element), bubbles.west(), west(), 'layout-w');
    };
    var all$2 = function () {
      return [
        southeast$1,
        southwest$1,
        northeast$1,
        northwest$1,
        south$1,
        north$1,
        east$1,
        west$1
      ];
    };
    var allRtl = function () {
      return [
        southwest$1,
        southeast$1,
        northwest$1,
        northeast$1,
        south$1,
        north$1,
        east$1,
        west$1
      ];
    };

    var nu$9 = function (x) {
      return x;
    };

    var onDirection = function (isLtr, isRtl) {
      return function (element) {
        return getDirection(element) === 'rtl' ? isRtl : isLtr;
      };
    };
    var getDirection = function (element) {
      return get$5(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
    };

    var schema$1 = function () {
      return optionObjOf('layouts', [
        strict$1('onLtr'),
        strict$1('onRtl')
      ]);
    };
    var get$a = function (elem, info, defaultLtr, defaultRtl) {
      var ltr = info.layouts.map(function (ls) {
        return ls.onLtr(elem);
      }).getOr(defaultLtr);
      var rtl = info.layouts.map(function (ls) {
        return ls.onRtl(elem);
      }).getOr(defaultRtl);
      var f = onDirection(ltr, rtl);
      return f(elem);
    };

    var placement = function (component, anchorInfo, origin) {
      var hotspot = anchorInfo.hotspot;
      var anchorBox = toBox(origin, hotspot.element());
      var layouts = get$a(component.element(), anchorInfo, all$2(), allRtl());
      return Option.some(nu$9({
        anchorBox: anchorBox,
        bubble: fallback(),
        overrides: {},
        layouts: layouts,
        placer: Option.none()
      }));
    };
    var HotspotAnchor = [
      strict$1('hotspot'),
      schema$1(),
      output$1('placement', placement)
    ];

    var placement$1 = function (component, anchorInfo, origin) {
      var anchorBox = bounds(anchorInfo.x, anchorInfo.y, anchorInfo.width, anchorInfo.height);
      var layouts = get$a(component.element(), anchorInfo, all$2(), allRtl());
      return Option.some(nu$9({
        anchorBox: anchorBox,
        bubble: anchorInfo.bubble,
        overrides: {},
        layouts: layouts,
        placer: Option.none()
      }));
    };
    var MakeshiftAnchor = [
      strict$1('x'),
      strict$1('y'),
      defaulted$1('height', 0),
      defaulted$1('width', 0),
      defaulted$1('bubble', fallback()),
      schema$1(),
      output$1('placement', placement$1)
    ];

    var zeroWidth = function () {
      return '\uFEFF';
    };

    var adt$5 = Adt.generate([
      { before: ['element'] },
      {
        on: [
          'element',
          'offset'
        ]
      },
      { after: ['element'] }
    ]);

    var type$1 = Adt.generate([
      { domRange: ['rng'] },
      {
        relative: [
          'startSitu',
          'finishSitu'
        ]
      },
      {
        exact: [
          'start',
          'soffset',
          'finish',
          'foffset'
        ]
      }
    ]);
    var range$1 = Immutable('start', 'soffset', 'finish', 'foffset');
    var exactFromRange = function (simRange) {
      return type$1.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
    };
    var domRange = type$1.domRange;
    var relative$2 = type$1.relative;
    var exact = type$1.exact;

    var makeRange = function (start, soffset, finish, foffset) {
      var doc = owner(start);
      var rng = doc.dom().createRange();
      rng.setStart(start.dom(), soffset);
      rng.setEnd(finish.dom(), foffset);
      return rng;
    };
    var after$3 = function (start, soffset, finish, foffset) {
      var r = makeRange(start, soffset, finish, foffset);
      var same = eq(start, finish) && soffset === foffset;
      return r.collapsed && !same;
    };

    var setStart = function (rng, situ) {
      situ.fold(function (e) {
        rng.setStartBefore(e.dom());
      }, function (e, o) {
        rng.setStart(e.dom(), o);
      }, function (e) {
        rng.setStartAfter(e.dom());
      });
    };
    var setFinish = function (rng, situ) {
      situ.fold(function (e) {
        rng.setEndBefore(e.dom());
      }, function (e, o) {
        rng.setEnd(e.dom(), o);
      }, function (e) {
        rng.setEndAfter(e.dom());
      });
    };
    var relativeToNative = function (win, startSitu, finishSitu) {
      var range = win.document.createRange();
      setStart(range, startSitu);
      setFinish(range, finishSitu);
      return range;
    };
    var exactToNative = function (win, start, soffset, finish, foffset) {
      var rng = win.document.createRange();
      rng.setStart(start.dom(), soffset);
      rng.setEnd(finish.dom(), foffset);
      return rng;
    };
    var toRect = function (rect) {
      return {
        left: constant(rect.left),
        top: constant(rect.top),
        right: constant(rect.right),
        bottom: constant(rect.bottom),
        width: constant(rect.width),
        height: constant(rect.height)
      };
    };
    var getFirstRect = function (rng) {
      var rects = rng.getClientRects();
      var rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
      return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect) : Option.none();
    };

    var adt$6 = Adt.generate([
      {
        ltr: [
          'start',
          'soffset',
          'finish',
          'foffset'
        ]
      },
      {
        rtl: [
          'start',
          'soffset',
          'finish',
          'foffset'
        ]
      }
    ]);
    var fromRange = function (win, type, range) {
      return type(Element$$1.fromDom(range.startContainer), range.startOffset, Element$$1.fromDom(range.endContainer), range.endOffset);
    };
    var getRanges = function (win, selection) {
      return selection.match({
        domRange: function (rng) {
          return {
            ltr: constant(rng),
            rtl: Option.none
          };
        },
        relative: function (startSitu, finishSitu) {
          return {
            ltr: cached(function () {
              return relativeToNative(win, startSitu, finishSitu);
            }),
            rtl: cached(function () {
              return Option.some(relativeToNative(win, finishSitu, startSitu));
            })
          };
        },
        exact: function (start, soffset, finish, foffset) {
          return {
            ltr: cached(function () {
              return exactToNative(win, start, soffset, finish, foffset);
            }),
            rtl: cached(function () {
              return Option.some(exactToNative(win, finish, foffset, start, soffset));
            })
          };
        }
      });
    };
    var doDiagnose = function (win, ranges) {
      var rng = ranges.ltr();
      if (rng.collapsed) {
        var reversed = ranges.rtl().filter(function (rev) {
          return rev.collapsed === false;
        });
        return reversed.map(function (rev) {
          return adt$6.rtl(Element$$1.fromDom(rev.endContainer), rev.endOffset, Element$$1.fromDom(rev.startContainer), rev.startOffset);
        }).getOrThunk(function () {
          return fromRange(win, adt$6.ltr, rng);
        });
      } else {
        return fromRange(win, adt$6.ltr, rng);
      }
    };
    var diagnose = function (win, selection) {
      var ranges = getRanges(win, selection);
      return doDiagnose(win, ranges);
    };
    var asLtrRange = function (win, selection) {
      var diagnosis = diagnose(win, selection);
      return diagnosis.match({
        ltr: function (start, soffset, finish, foffset) {
          var rng = win.document.createRange();
          rng.setStart(start.dom(), soffset);
          rng.setEnd(finish.dom(), foffset);
          return rng;
        },
        rtl: function (start, soffset, finish, foffset) {
          var rng = win.document.createRange();
          rng.setStart(finish.dom(), foffset);
          rng.setEnd(start.dom(), soffset);
          return rng;
        }
      });
    };

    var searchForPoint = function (rectForOffset, x, y, maxX, length) {
      if (length === 0) {
        return 0;
      } else if (x === maxX) {
        return length - 1;
      }
      var xDelta = maxX;
      for (var i = 1; i < length; i++) {
        var rect = rectForOffset(i);
        var curDeltaX = Math.abs(x - rect.left);
        if (y <= rect.bottom) {
          if (y < rect.top || curDeltaX > xDelta) {
            return i - 1;
          } else {
            xDelta = curDeltaX;
          }
        }
      }
      return 0;
    };
    var inRect = function (rect, x, y) {
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };

    function NodeValue (is, name) {
      var get = function (element) {
        if (!is(element)) {
          throw new Error('Can only get ' + name + ' value of a ' + name + ' node');
        }
        return getOption(element).getOr('');
      };
      var getOptionIE10 = function (element) {
        try {
          return getOptionSafe(element);
        } catch (e) {
          return Option.none();
        }
      };
      var getOptionSafe = function (element) {
        return is(element) ? Option.from(element.dom().nodeValue) : Option.none();
      };
      var browser = PlatformDetection$1.detect().browser;
      var getOption = browser.isIE() && browser.version.major === 10 ? getOptionIE10 : getOptionSafe;
      var set = function (element, value) {
        if (!is(element)) {
          throw new Error('Can only set raw ' + name + ' value of a ' + name + ' node');
        }
        element.dom().nodeValue = value;
      };
      return {
        get: get,
        getOption: getOption,
        set: set
      };
    }

    var api$2 = NodeValue(isText, 'text');
    var get$b = function (element) {
      return api$2.get(element);
    };
    var getOption = function (element) {
      return api$2.getOption(element);
    };

    var locateOffset = function (doc, textnode, x, y, rect) {
      var rangeForOffset = function (o) {
        var r = doc.dom().createRange();
        r.setStart(textnode.dom(), o);
        r.collapse(true);
        return r;
      };
      var rectForOffset = function (o) {
        var r = rangeForOffset(o);
        return r.getBoundingClientRect();
      };
      var length = get$b(textnode).length;
      var offset = searchForPoint(rectForOffset, x, y, rect.right, length);
      return rangeForOffset(offset);
    };
    var locate = function (doc, node, x, y) {
      var r = doc.dom().createRange();
      r.selectNode(node.dom());
      var rects = r.getClientRects();
      var foundRect = findMap(rects, function (rect) {
        return inRect(rect, x, y) ? Option.some(rect) : Option.none();
      });
      return foundRect.map(function (rect) {
        return locateOffset(doc, node, x, y, rect);
      });
    };

    var searchInChildren = function (doc, node, x, y) {
      var r = doc.dom().createRange();
      var nodes = children(node);
      return findMap(nodes, function (n) {
        r.selectNode(n.dom());
        return inRect(r.getBoundingClientRect(), x, y) ? locateNode(doc, n, x, y) : Option.none();
      });
    };
    var locateNode = function (doc, node, x, y) {
      var locator = isText(node) ? locate : searchInChildren;
      return locator(doc, node, x, y);
    };
    var locate$1 = function (doc, node, x, y) {
      var r = doc.dom().createRange();
      r.selectNode(node.dom());
      var rect = r.getBoundingClientRect();
      var boundedX = Math.max(rect.left, Math.min(rect.right, x));
      var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
      return locateNode(doc, node, boundedX, boundedY);
    };

    var NBSP = '\xA0';
    var isTextNodeWithCursorPosition = function (el) {
      return getOption(el).filter(function (text) {
        return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
      }).isSome();
    };
    var elementsWithCursorPosition = [
      'img',
      'br'
    ];
    var isCursorPosition = function (elem) {
      var hasCursorPosition = isTextNodeWithCursorPosition(elem);
      return hasCursorPosition || contains(elementsWithCursorPosition, name(elem));
    };

    var first$3 = function (element) {
      return descendant(element, isCursorPosition);
    };
    var last$2 = function (element) {
      return descendantRtl(element, isCursorPosition);
    };
    var descendantRtl = function (scope, predicate) {
      var descend = function (element) {
        var children$$1 = children(element);
        for (var i = children$$1.length - 1; i >= 0; i--) {
          var child$$1 = children$$1[i];
          if (predicate(child$$1)) {
            return Option.some(child$$1);
          }
          var res = descend(child$$1);
          if (res.isSome()) {
            return res;
          }
        }
        return Option.none();
      };
      return descend(scope);
    };

    var COLLAPSE_TO_LEFT = true;
    var COLLAPSE_TO_RIGHT = false;
    var getCollapseDirection = function (rect, x) {
      return x - rect.left < rect.right - x ? COLLAPSE_TO_LEFT : COLLAPSE_TO_RIGHT;
    };
    var createCollapsedNode = function (doc, target, collapseDirection) {
      var r = doc.dom().createRange();
      r.selectNode(target.dom());
      r.collapse(collapseDirection);
      return r;
    };
    var locateInElement = function (doc, node, x) {
      var cursorRange = doc.dom().createRange();
      cursorRange.selectNode(node.dom());
      var rect = cursorRange.getBoundingClientRect();
      var collapseDirection = getCollapseDirection(rect, x);
      var f = collapseDirection === COLLAPSE_TO_LEFT ? first$3 : last$2;
      return f(node).map(function (target) {
        return createCollapsedNode(doc, target, collapseDirection);
      });
    };
    var locateInEmpty = function (doc, node, x) {
      var rect = node.dom().getBoundingClientRect();
      var collapseDirection = getCollapseDirection(rect, x);
      return Option.some(createCollapsedNode(doc, node, collapseDirection));
    };
    var search = function (doc, node, x) {
      var f = children(node).length === 0 ? locateInEmpty : locateInElement;
      return f(doc, node, x);
    };

    var caretPositionFromPoint = function (doc, x, y) {
      return Option.from(doc.dom().caretPositionFromPoint(x, y)).bind(function (pos) {
        if (pos.offsetNode === null) {
          return Option.none();
        }
        var r = doc.dom().createRange();
        r.setStart(pos.offsetNode, pos.offset);
        r.collapse();
        return Option.some(r);
      });
    };
    var caretRangeFromPoint = function (doc, x, y) {
      return Option.from(doc.dom().caretRangeFromPoint(x, y));
    };
    var searchTextNodes = function (doc, node, x, y) {
      var r = doc.dom().createRange();
      r.selectNode(node.dom());
      var rect = r.getBoundingClientRect();
      var boundedX = Math.max(rect.left, Math.min(rect.right, x));
      var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
      return locate$1(doc, node, boundedX, boundedY);
    };
    var searchFromPoint = function (doc, x, y) {
      return Element$$1.fromPoint(doc, x, y).bind(function (elem) {
        var fallback = function () {
          return search(doc, elem, x);
        };
        return children(elem).length === 0 ? fallback() : searchTextNodes(doc, elem, x, y).orThunk(fallback);
      });
    };
    var availableSearch = document.caretPositionFromPoint ? caretPositionFromPoint : document.caretRangeFromPoint ? caretRangeFromPoint : searchFromPoint;

    var descendants$1 = function (scope, selector) {
      return all(selector, scope);
    };

    var readRange = function (selection) {
      if (selection.rangeCount > 0) {
        var firstRng = selection.getRangeAt(0);
        var lastRng = selection.getRangeAt(selection.rangeCount - 1);
        return Option.some(range$1(Element$$1.fromDom(firstRng.startContainer), firstRng.startOffset, Element$$1.fromDom(lastRng.endContainer), lastRng.endOffset));
      } else {
        return Option.none();
      }
    };
    var doGetExact = function (selection) {
      var anchorNode = Element$$1.fromDom(selection.anchorNode);
      var focusNode = Element$$1.fromDom(selection.focusNode);
      return after$3(anchorNode, selection.anchorOffset, focusNode, selection.focusOffset) ? Option.some(range$1(Element$$1.fromDom(selection.anchorNode), selection.anchorOffset, Element$$1.fromDom(selection.focusNode), selection.focusOffset)) : readRange(selection);
    };
    var getExact = function (win) {
      return Option.from(win.getSelection()).filter(function (sel) {
        return sel.rangeCount > 0;
      }).bind(doGetExact);
    };
    var getFirstRect$1 = function (win, selection) {
      var rng = asLtrRange(win, selection);
      return getFirstRect(rng);
    };

    var point = Immutable('element', 'offset');
    var descendOnce = function (element, offset) {
      var children$$1 = children(element);
      if (children$$1.length === 0) {
        return point(element, offset);
      } else if (offset < children$$1.length) {
        return point(children$$1[offset], 0);
      } else {
        var last = children$$1[children$$1.length - 1];
        var len = isText(last) ? get$b(last).length : children(last).length;
        return point(last, len);
      }
    };

    var adt$7 = Adt.generate([
      { screen: ['point'] },
      {
        absolute: [
          'point',
          'scrollLeft',
          'scrollTop'
        ]
      }
    ]);
    var toFixed = function (pos) {
      return pos.fold(function (point) {
        return point;
      }, function (point, scrollLeft, scrollTop) {
        return point.translate(-scrollLeft, -scrollTop);
      });
    };
    var toAbsolute = function (pos) {
      return pos.fold(function (point) {
        return point;
      }, function (point, scrollLeft, scrollTop) {
        return point;
      });
    };
    var sum = function (points) {
      return foldl(points, function (b, a) {
        return b.translate(a.left(), a.top());
      }, Position(0, 0));
    };
    var sumAsFixed = function (positions) {
      var points = map(positions, toFixed);
      return sum(points);
    };
    var sumAsAbsolute = function (positions) {
      var points = map(positions, toAbsolute);
      return sum(points);
    };
    var screen = adt$7.screen;
    var absolute$2 = adt$7.absolute;

    var getOffset = function (component, origin, anchorInfo) {
      var win = defaultView(anchorInfo.root).dom();
      var hasSameOwner = function (frame) {
        var frameOwner = owner(frame);
        var compOwner = owner(component.element());
        return eq(frameOwner, compOwner);
      };
      return Option.from(win.frameElement).map(Element$$1.fromDom).filter(hasSameOwner).map(absolute);
    };
    var getRootPoint = function (component, origin, anchorInfo) {
      var doc = owner(component.element());
      var outerScroll = get$7(doc);
      var offset = getOffset(component, origin, anchorInfo).getOr(outerScroll);
      return absolute$2(offset, outerScroll.left(), outerScroll.top());
    };

    var capRect = function (left, top, width, height) {
      var newLeft = left, newTop = top, newWidth = width, newHeight = height;
      if (left < 0) {
        newLeft = 0;
        newWidth = width + left;
      }
      if (top < 0) {
        newTop = 0;
        newHeight = height + top;
      }
      var point = screen(Position(newLeft, newTop));
      return Option.some(pointed(point, newWidth, newHeight));
    };
    var calcNewAnchor = function (optBox, rootPoint, anchorInfo, origin, elem) {
      return optBox.map(function (box$$1) {
        var points = [
          rootPoint,
          box$$1.point()
        ];
        var topLeft = cata$1(origin, function () {
          return sumAsAbsolute(points);
        }, function () {
          return sumAsAbsolute(points);
        }, function () {
          return sumAsFixed(points);
        });
        var anchorBox = rect(topLeft.left(), topLeft.top(), box$$1.width(), box$$1.height());
        var layoutsLtr = function () {
          return anchorInfo.showAbove ? [
            northeast$1,
            northwest$1,
            southeast$1,
            southwest$1,
            north$1,
            south$1
          ] : [
            southeast$1,
            southwest$1,
            northeast$1,
            northwest$1,
            south$1,
            south$1
          ];
        };
        var layoutsRtl = function () {
          return anchorInfo.showAbove ? [
            northwest$1,
            northeast$1,
            southwest$1,
            southeast$1,
            north$1,
            south$1
          ] : [
            southwest$1,
            southeast$1,
            northwest$1,
            northeast$1,
            south$1,
            north$1
          ];
        };
        var layouts = get$a(elem, anchorInfo, layoutsLtr(), layoutsRtl());
        return nu$9({
          anchorBox: anchorBox,
          bubble: anchorInfo.bubble.getOr(fallback()),
          overrides: anchorInfo.overrides,
          layouts: layouts,
          placer: Option.none()
        });
      });
    };
    var ContentAnchorCommon = {
      capRect: capRect,
      calcNewAnchor: calcNewAnchor
    };

    var point$1 = Immutable('element', 'offset');
    var descendOnce$1 = function (element, offset) {
      return isText(element) ? point$1(element, offset) : descendOnce(element, offset);
    };
    var getAnchorSelection = function (win, anchorInfo) {
      var getSelection = anchorInfo.getSelection.getOrThunk(function () {
        return function () {
          return getExact(win);
        };
      });
      return getSelection().map(function (sel) {
        var modStart = descendOnce$1(sel.start(), sel.soffset());
        var modFinish = descendOnce$1(sel.finish(), sel.foffset());
        return range$1(modStart.element(), modStart.offset(), modFinish.element(), modFinish.offset());
      });
    };
    var placement$2 = function (component, anchorInfo, origin) {
      var win = defaultView(anchorInfo.root).dom();
      var rootPoint = getRootPoint(component, origin, anchorInfo);
      var selectionBox = getAnchorSelection(win, anchorInfo).bind(function (sel) {
        var optRect = getFirstRect$1(win, exactFromRange(sel)).orThunk(function () {
          var x = Element$$1.fromText(zeroWidth());
          before(sel.start(), x);
          return getFirstRect$1(win, exact(x, 0, x, 1)).map(function (rect) {
            remove(x);
            return rect;
          });
        });
        return optRect.bind(function (rawRect) {
          return ContentAnchorCommon.capRect(rawRect.left(), rawRect.top(), rawRect.width(), rawRect.height());
        });
      });
      var targetElement = getAnchorSelection(win, anchorInfo).bind(function (sel) {
        return isElement(sel.start()) ? Option.some(sel.start()) : parent(sel.start());
      });
      var elem = targetElement.getOr(component.element());
      return ContentAnchorCommon.calcNewAnchor(selectionBox, rootPoint, anchorInfo, origin, elem);
    };
    var SelectionAnchor = [
      option('getSelection'),
      strict$1('root'),
      option('bubble'),
      schema$1(),
      defaulted$1('overrides', {}),
      defaulted$1('showAbove', false),
      output$1('placement', placement$2)
    ];

    var placement$3 = function (component, anchorInfo, origin) {
      var rootPoint = getRootPoint(component, origin, anchorInfo);
      return anchorInfo.node.bind(function (target) {
        var rect = target.dom().getBoundingClientRect();
        var nodeBox = ContentAnchorCommon.capRect(rect.left, rect.top, rect.width, rect.height);
        var elem = anchorInfo.node.getOr(component.element());
        return ContentAnchorCommon.calcNewAnchor(nodeBox, rootPoint, anchorInfo, origin, elem);
      });
    };
    var NodeAnchor = [
      strict$1('node'),
      strict$1('root'),
      option('bubble'),
      schema$1(),
      defaulted$1('overrides', {}),
      defaulted$1('showAbove', false),
      output$1('placement', placement$3)
    ];

    var eastX$1 = function (anchor) {
      return anchor.x() + anchor.width();
    };
    var westX$1 = function (anchor, element) {
      return anchor.x() - element.width();
    };
    var northY$1 = function (anchor, element) {
      return anchor.y() - element.height() + anchor.height();
    };
    var southY$1 = function (anchor) {
      return anchor.y();
    };
    var southeast$2 = function (anchor, element, bubbles) {
      return nu$8(eastX$1(anchor), southY$1(anchor), bubbles.southeast(), southeast(), 'link-layout-se');
    };
    var southwest$2 = function (anchor, element, bubbles) {
      return nu$8(westX$1(anchor, element), southY$1(anchor), bubbles.southwest(), southwest(), 'link-layout-sw');
    };
    var northeast$2 = function (anchor, element, bubbles) {
      return nu$8(eastX$1(anchor), northY$1(anchor, element), bubbles.northeast(), northeast(), 'link-layout-ne');
    };
    var northwest$2 = function (anchor, element, bubbles) {
      return nu$8(westX$1(anchor, element), northY$1(anchor, element), bubbles.northwest(), northwest(), 'link-layout-nw');
    };
    var all$5 = function () {
      return [
        southeast$2,
        southwest$2,
        northeast$2,
        northwest$2
      ];
    };
    var allRtl$1 = function () {
      return [
        southwest$2,
        southeast$2,
        northwest$2,
        northeast$2
      ];
    };

    var placement$4 = function (component, submenuInfo, origin) {
      var anchorBox = toBox(origin, submenuInfo.item.element());
      var layouts = get$a(component.element(), submenuInfo, all$5(), allRtl$1());
      return Option.some(nu$9({
        anchorBox: anchorBox,
        bubble: fallback(),
        overrides: {},
        layouts: layouts,
        placer: Option.none()
      }));
    };
    var SubmenuAnchor = [
      strict$1('item'),
      schema$1(),
      output$1('placement', placement$4)
    ];

    var AnchorSchema = choose$1('anchor', {
      selection: SelectionAnchor,
      node: NodeAnchor,
      hotspot: HotspotAnchor,
      submenu: SubmenuAnchor,
      makeshift: MakeshiftAnchor
    });

    var getFixedOrigin = function () {
      return fixed(0, 0, window.innerWidth, window.innerHeight);
    };
    var getRelativeOrigin = function (component) {
      var position = absolute(component.element());
      var bounds$$1 = component.element().dom().getBoundingClientRect();
      return relative$1(position.left(), position.top(), bounds$$1.width, bounds$$1.height);
    };
    var place = function (component, origin, anchoring, getBounds, placee) {
      var anchor = box$1(anchoring.anchorBox, origin);
      simple(anchor, placee.element(), anchoring.bubble, anchoring.layouts, getBounds, anchoring.overrides);
    };
    var position$1 = function (component, posConfig, posState, anchor, placee) {
      var boxElement = Option.none();
      positionWithin(component, posConfig, posState, anchor, placee, boxElement);
    };
    var positionWithin = function (component, posConfig, posState, anchor, placee, boxElement) {
      var anchorage = asRawOrDie('positioning anchor.info', AnchorSchema, anchor);
      set$2(placee.element(), 'position', 'fixed');
      var oldVisibility = getRaw(placee.element(), 'visibility');
      set$2(placee.element(), 'visibility', 'hidden');
      var origin = posConfig.useFixed ? getFixedOrigin() : getRelativeOrigin(component);
      var placer = anchorage.placement;
      var getBounds = boxElement.map(function (boxElem) {
        return function () {
          return box(boxElem);
        };
      }).or(posConfig.getBounds);
      placer(component, anchorage, origin).each(function (anchoring) {
        var doPlace = anchoring.placer.getOr(place);
        doPlace(component, origin, anchoring, getBounds, placee);
      });
      oldVisibility.fold(function () {
        remove$6(placee.element(), 'visibility');
      }, function (vis) {
        set$2(placee.element(), 'visibility', vis);
      });
      if (getRaw(placee.element(), 'left').isNone() && getRaw(placee.element(), 'top').isNone() && getRaw(placee.element(), 'right').isNone() && getRaw(placee.element(), 'bottom').isNone() && getRaw(placee.element(), 'position').is('fixed')) {
        remove$6(placee.element(), 'position');
      }
    };
    var getMode = function (component, pConfig, pState) {
      return pConfig.useFixed ? 'fixed' : 'absolute';
    };

    var PositionApis = /*#__PURE__*/Object.freeze({
        position: position$1,
        positionWithin: positionWithin,
        getMode: getMode
    });

    var PositionSchema = [
      defaulted$1('useFixed', false),
      option('getBounds')
    ];

    var Positioning = create$1({
      fields: PositionSchema,
      name: 'positioning',
      active: ActivePosition,
      apis: PositionApis
    });

    var fireDetaching = function (component) {
      emit(component, detachedFromDom());
      var children$$1 = component.components();
      each(children$$1, fireDetaching);
    };
    var fireAttaching = function (component) {
      var children$$1 = component.components();
      each(children$$1, fireAttaching);
      emit(component, attachedToDom());
    };
    var attach = function (parent$$1, child$$1) {
      attachWith(parent$$1, child$$1, append);
    };
    var attachWith = function (parent$$1, child$$1, insertion) {
      parent$$1.getSystem().addToWorld(child$$1);
      insertion(parent$$1.element(), child$$1.element());
      if (inBody(parent$$1.element())) {
        fireAttaching(child$$1);
      }
      parent$$1.syncComponents();
    };
    var doDetach = function (component) {
      fireDetaching(component);
      remove(component.element());
      component.getSystem().removeFromWorld(component);
    };
    var detach = function (component) {
      var parent$$1 = parent(component.element()).bind(function (p) {
        return component.getSystem().getByDom(p).fold(Option.none, Option.some);
      });
      doDetach(component);
      parent$$1.each(function (p) {
        p.syncComponents();
      });
    };
    var detachChildren = function (component) {
      var subs = component.components();
      each(subs, doDetach);
      empty(component.element());
      component.syncComponents();
    };
    var attachSystem = function (element, guiSystem) {
      attachSystemInternal(element, guiSystem, append);
    };
    var attachSystemAfter = function (element, guiSystem) {
      attachSystemInternal(element, guiSystem, after);
    };
    var attachSystemInternal = function (element, guiSystem, inserter) {
      inserter(element, guiSystem.element());
      var children$$1 = children(guiSystem.element());
      each(children$$1, function (child$$1) {
        guiSystem.getByDom(child$$1).each(fireAttaching);
      });
    };
    var detachSystem = function (guiSystem) {
      var children$$1 = children(guiSystem.element());
      each(children$$1, function (child$$1) {
        guiSystem.getByDom(child$$1).each(fireDetaching);
      });
      remove(guiSystem.element());
    };

    var rebuild = function (sandbox, sConfig, sState, data) {
      sState.get().each(function (data) {
        detachChildren(sandbox);
      });
      var point = sConfig.getAttachPoint(sandbox);
      attach(point, sandbox);
      var built = sandbox.getSystem().build(data);
      attach(sandbox, built);
      sState.set(built);
      return built;
    };
    var open = function (sandbox, sConfig, sState, data) {
      var newState = rebuild(sandbox, sConfig, sState, data);
      sConfig.onOpen(sandbox, newState);
      return newState;
    };
    var openWhileCloaked = function (sandbox, sConfig, sState, data, transaction) {
      cloak(sandbox, sConfig, sState);
      open(sandbox, sConfig, sState, data);
      transaction();
      decloak(sandbox, sConfig, sState);
    };
    var close = function (sandbox, sConfig, sState) {
      sState.get().each(function (data) {
        detachChildren(sandbox);
        detach(sandbox);
        sConfig.onClose(sandbox, data);
        sState.clear();
      });
    };
    var isOpen = function (sandbox, sConfig, sState) {
      return sState.isOpen();
    };
    var isPartOf$1 = function (sandbox, sConfig, sState, queryElem) {
      return isOpen(sandbox, sConfig, sState) && sState.get().exists(function (data) {
        return sConfig.isPartOf(sandbox, data, queryElem);
      });
    };
    var getState = function (sandbox, sConfig, sState) {
      return sState.get();
    };
    var store = function (sandbox, cssKey, attr, newValue) {
      getRaw(sandbox.element(), cssKey).fold(function () {
        remove$1(sandbox.element(), attr);
      }, function (v) {
        set$1(sandbox.element(), attr, v);
      });
      set$2(sandbox.element(), cssKey, newValue);
    };
    var restore = function (sandbox, cssKey, attr) {
      if (has$1(sandbox.element(), attr)) {
        var oldValue = get$2(sandbox.element(), attr);
        set$2(sandbox.element(), cssKey, oldValue);
      } else {
        remove$6(sandbox.element(), cssKey);
      }
    };
    var cloak = function (sandbox, sConfig, sState) {
      var sink = sConfig.getAttachPoint(sandbox);
      set$2(sandbox.element(), 'position', Positioning.getMode(sink));
      store(sandbox, 'visibility', sConfig.cloakVisibilityAttr, 'hidden');
    };
    var hasPosition = function (element) {
      return exists([
        'top',
        'left',
        'right',
        'bottom'
      ], function (pos) {
        return getRaw(element, pos).isSome();
      });
    };
    var decloak = function (sandbox, sConfig, sState) {
      if (!hasPosition(sandbox.element())) {
        remove$6(sandbox.element(), 'position');
      }
      restore(sandbox, 'visibility', sConfig.cloakVisibilityAttr);
    };

    var SandboxApis = /*#__PURE__*/Object.freeze({
        cloak: cloak,
        decloak: decloak,
        open: open,
        openWhileCloaked: openWhileCloaked,
        close: close,
        isOpen: isOpen,
        isPartOf: isPartOf$1,
        getState: getState
    });

    var events$2 = function (sandboxConfig, sandboxState) {
      return derive([run(sandboxClose(), function (sandbox, simulatedEvent) {
          close(sandbox, sandboxConfig, sandboxState);
        })]);
    };

    var ActiveSandbox = /*#__PURE__*/Object.freeze({
        events: events$2
    });

    var SandboxSchema = [
      onHandler('onOpen'),
      onHandler('onClose'),
      strict$1('isPartOf'),
      strict$1('getAttachPoint'),
      defaulted$1('cloakVisibilityAttr', 'data-precloak-visibility')
    ];

    var init = function () {
      var contents = Cell(Option.none());
      var readState = constant('not-implemented');
      var isOpen = function () {
        return contents.get().isSome();
      };
      var set = function (c) {
        contents.set(Option.some(c));
      };
      var get = function (c) {
        return contents.get();
      };
      var clear = function () {
        contents.set(Option.none());
      };
      return nu$5({
        readState: readState,
        isOpen: isOpen,
        clear: clear,
        set: set,
        get: get
      });
    };

    var SandboxState = /*#__PURE__*/Object.freeze({
        init: init
    });

    var Sandboxing = create$1({
      fields: SandboxSchema,
      name: 'sandboxing',
      active: ActiveSandbox,
      apis: SandboxApis,
      state: SandboxState
    });

    var dismissPopups = constant('dismiss.popups');
    var mouseReleased = constant('mouse.released');

    var schema$2 = objOfOnly([
      defaulted$1('isExtraPart', constant(false)),
      optionObjOf('fireEventInstead', [defaulted$1('event', dismissRequested())])
    ]);
    var receivingConfig = function (rawSpec) {
      var c = receiving(rawSpec);
      return Receiving.config(c);
    };
    var receiving = function (rawSpec) {
      var spec = asRawOrDie('Dismissal', schema$2, rawSpec);
      return {
        channels: wrap$1(dismissPopups(), {
          schema: objOfOnly([strict$1('target')]),
          onReceive: function (sandbox, data) {
            if (Sandboxing.isOpen(sandbox)) {
              var isPart = Sandboxing.isPartOf(sandbox, data.target) || spec.isExtraPart(sandbox, data.target);
              if (!isPart) {
                spec.fireEventInstead.fold(function () {
                  return Sandboxing.close(sandbox);
                }, function (fe) {
                  return emit(sandbox, fe.event);
                });
              }
            }
          }
        })
      };
    };

    var field$1 = function (name, forbidden) {
      return defaultedObjOf(name, {}, map(forbidden, function (f) {
        return forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name);
      }).concat([state$1('dump', identity)]));
    };
    var get$d = function (data) {
      return data.dump;
    };
    var augment = function (data, original) {
      return __assign({}, data.dump, derive$1(original));
    };
    var SketchBehaviours = {
      field: field$1,
      augment: augment,
      get: get$d
    };

    var _placeholder = 'placeholder';
    var adt$8 = Adt.generate([
      {
        single: [
          'required',
          'valueThunk'
        ]
      },
      {
        multiple: [
          'required',
          'valueThunks'
        ]
      }
    ]);
    var subPlaceholder = function (owner, detail, compSpec, placeholders) {
      if (owner.exists(function (o) {
          return o !== compSpec.owner;
        })) {
        return adt$8.single(true, constant(compSpec));
      }
      return readOptFrom$1(placeholders, compSpec.name).fold(function () {
        throw new Error('Unknown placeholder component: ' + compSpec.name + '\nKnown: [' + keys(placeholders) + ']\nNamespace: ' + owner.getOr('none') + '\nSpec: ' + JSON$1.stringify(compSpec, null, 2));
      }, function (newSpec) {
        return newSpec.replace();
      });
    };
    var scan = function (owner, detail, compSpec, placeholders) {
      if (compSpec.uiType === _placeholder) {
        return subPlaceholder(owner, detail, compSpec, placeholders);
      } else {
        return adt$8.single(false, constant(compSpec));
      }
    };
    var substitute = function (owner, detail, compSpec, placeholders) {
      var base = scan(owner, detail, compSpec, placeholders);
      return base.fold(function (req, valueThunk) {
        var value = valueThunk(detail, compSpec.config, compSpec.validated);
        var childSpecs = readOptFrom$1(value, 'components').getOr([]);
        var substituted = bind(childSpecs, function (c) {
          return substitute(owner, detail, c, placeholders);
        });
        return [__assign({}, value, { components: substituted })];
      }, function (req, valuesThunk) {
        var values$$1 = valuesThunk(detail, compSpec.config, compSpec.validated);
        var preprocessor = compSpec.validated.preprocess.getOr(identity);
        return preprocessor(values$$1);
      });
    };
    var substituteAll = function (owner, detail, components, placeholders) {
      return bind(components, function (c) {
        return substitute(owner, detail, c, placeholders);
      });
    };
    var oneReplace = function (label, replacements) {
      var called = false;
      var used = function () {
        return called;
      };
      var replace = function () {
        if (called === true) {
          throw new Error('Trying to use the same placeholder more than once: ' + label);
        }
        called = true;
        return replacements;
      };
      var required = function () {
        return replacements.fold(function (req, _) {
          return req;
        }, function (req, _) {
          return req;
        });
      };
      return {
        name: constant(label),
        required: required,
        used: used,
        replace: replace
      };
    };
    var substitutePlaces = function (owner, detail, components, placeholders) {
      var ps = map$1(placeholders, function (ph, name) {
        return oneReplace(name, ph);
      });
      var outcome = substituteAll(owner, detail, components, ps);
      each$1(ps, function (p) {
        if (p.used() === false && p.required()) {
          throw new Error('Placeholder: ' + p.name() + ' was not found in components list\nNamespace: ' + owner.getOr('none') + '\nComponents: ' + JSON$1.stringify(detail.components, null, 2));
        }
      });
      return outcome;
    };
    var single = adt$8.single;
    var multiple = adt$8.multiple;
    var placeholder = constant(_placeholder);

    var adt$9 = Adt.generate([
      { required: ['data'] },
      { external: ['data'] },
      { optional: ['data'] },
      { group: ['data'] }
    ]);
    var fFactory = defaulted$1('factory', { sketch: identity });
    var fSchema = defaulted$1('schema', []);
    var fName = strict$1('name');
    var fPname = field('pname', 'pname', defaultedThunk(function (typeSpec) {
      return '<alloy.' + generate$1(typeSpec.name) + '>';
    }), anyValue$1());
    var fGroupSchema = state$1('schema', function () {
      return [option('preprocess')];
    });
    var fDefaults = defaulted$1('defaults', constant({}));
    var fOverrides = defaulted$1('overrides', constant({}));
    var requiredSpec = objOf([
      fFactory,
      fSchema,
      fName,
      fPname,
      fDefaults,
      fOverrides
    ]);
    var externalSpec = objOf([
      fFactory,
      fSchema,
      fName,
      fDefaults,
      fOverrides
    ]);
    var optionalSpec = objOf([
      fFactory,
      fSchema,
      fName,
      fPname,
      fDefaults,
      fOverrides
    ]);
    var groupSpec = objOf([
      fFactory,
      fGroupSchema,
      fName,
      strict$1('unit'),
      fPname,
      fDefaults,
      fOverrides
    ]);
    var asNamedPart = function (part) {
      return part.fold(Option.some, Option.none, Option.some, Option.some);
    };
    var name$1 = function (part) {
      var get = function (data) {
        return data.name;
      };
      return part.fold(get, get, get, get);
    };
    var asCommon = function (part) {
      return part.fold(identity, identity, identity, identity);
    };
    var convert = function (adtConstructor, partSchema) {
      return function (spec) {
        var data = asRawOrDie('Converting part type', partSchema, spec);
        return adtConstructor(data);
      };
    };
    var required = convert(adt$9.required, requiredSpec);
    var external$1 = convert(adt$9.external, externalSpec);
    var optional = convert(adt$9.optional, optionalSpec);
    var group = convert(adt$9.group, groupSpec);
    var original = constant('entirety');

    var PartType = /*#__PURE__*/Object.freeze({
        required: required,
        external: external$1,
        optional: optional,
        group: group,
        asNamedPart: asNamedPart,
        name: name$1,
        asCommon: asCommon,
        original: original
    });

    var combine$2 = function (detail, data, partSpec, partValidated) {
      return deepMerge(data.defaults(detail, partSpec, partValidated), partSpec, { uid: detail.partUids[data.name] }, data.overrides(detail, partSpec, partValidated));
    };
    var subs = function (owner, detail, parts) {
      var internals = {};
      var externals = {};
      each(parts, function (part) {
        part.fold(function (data) {
          internals[data.pname] = single(true, function (detail, partSpec, partValidated) {
            return data.factory.sketch(combine$2(detail, data, partSpec, partValidated));
          });
        }, function (data) {
          var partSpec = detail.parts[data.name];
          externals[data.name] = constant(data.factory.sketch(combine$2(detail, data, partSpec[original()]), partSpec));
        }, function (data) {
          internals[data.pname] = single(false, function (detail, partSpec, partValidated) {
            return data.factory.sketch(combine$2(detail, data, partSpec, partValidated));
          });
        }, function (data) {
          internals[data.pname] = multiple(true, function (detail, _partSpec, _partValidated) {
            var units = detail[data.name];
            return map(units, function (u) {
              return data.factory.sketch(deepMerge(data.defaults(detail, u, _partValidated), u, data.overrides(detail, u)));
            });
          });
        });
      });
      return {
        internals: constant(internals),
        externals: constant(externals)
      };
    };

    var generate$4 = function (owner, parts) {
      var r = {};
      each(parts, function (part) {
        asNamedPart(part).each(function (np) {
          var g = doGenerateOne(owner, np.pname);
          r[np.name] = function (config) {
            var validated = asRawOrDie('Part: ' + np.name + ' in ' + owner, objOf(np.schema), config);
            return __assign({}, g, {
              config: config,
              validated: validated
            });
          };
        });
      });
      return r;
    };
    var doGenerateOne = function (owner, pname) {
      return {
        uiType: placeholder(),
        owner: owner,
        name: pname
      };
    };
    var generateOne = function (owner, pname, config) {
      return {
        uiType: placeholder(),
        owner: owner,
        name: pname,
        config: config,
        validated: {}
      };
    };
    var schemas = function (parts) {
      return bind(parts, function (part) {
        return part.fold(Option.none, Option.some, Option.none, Option.none).map(function (data) {
          return strictObjOf(data.name, data.schema.concat([snapshot$1(original())]));
        }).toArray();
      });
    };
    var names = function (parts) {
      return map(parts, name$1);
    };
    var substitutes = function (owner, detail, parts) {
      return subs(owner, detail, parts);
    };
    var components = function (owner, detail, internals) {
      return substitutePlaces(Option.some(owner), detail, detail.components, internals);
    };
    var getPart = function (component, detail, partKey) {
      var uid = detail.partUids[partKey];
      return component.getSystem().getByUid(uid).toOption();
    };
    var getPartOrDie = function (component, detail, partKey) {
      return getPart(component, detail, partKey).getOrDie('Could not find part: ' + partKey);
    };
    var getParts = function (component, detail, partKeys) {
      var r = {};
      var uids = detail.partUids;
      var system = component.getSystem();
      each(partKeys, function (pk) {
        r[pk] = system.getByUid(uids[pk]);
      });
      return map$1(r, constant);
    };
    var getAllParts = function (component, detail) {
      var system = component.getSystem();
      return map$1(detail.partUids, function (pUid, k) {
        return constant(system.getByUid(pUid));
      });
    };
    var getAllPartNames = function (detail) {
      return keys(detail.partUids);
    };
    var getPartsOrDie = function (component, detail, partKeys) {
      var r = {};
      var uids = detail.partUids;
      var system = component.getSystem();
      each(partKeys, function (pk) {
        r[pk] = system.getByUid(uids[pk]).getOrDie();
      });
      return map$1(r, constant);
    };
    var defaultUids = function (baseUid, partTypes) {
      var partNames = names(partTypes);
      return wrapAll$1(map(partNames, function (pn) {
        return {
          key: pn,
          value: baseUid + '-' + pn
        };
      }));
    };
    var defaultUidsSchema = function (partTypes) {
      return field('partUids', 'partUids', mergeWithThunk(function (spec) {
        return defaultUids(spec.uid, partTypes);
      }), anyValue$1());
    };

    var AlloyParts = /*#__PURE__*/Object.freeze({
        generate: generate$4,
        generateOne: generateOne,
        schemas: schemas,
        names: names,
        substitutes: substitutes,
        components: components,
        defaultUids: defaultUids,
        defaultUidsSchema: defaultUidsSchema,
        getAllParts: getAllParts,
        getAllPartNames: getAllPartNames,
        getPart: getPart,
        getPartOrDie: getPartOrDie,
        getParts: getParts,
        getPartsOrDie: getPartsOrDie
    });

    var base = function (label, partSchemas, partUidsSchemas, spec) {
      var ps = partSchemas.length > 0 ? [strictObjOf('parts', partSchemas)] : [];
      return ps.concat([
        strict$1('uid'),
        defaulted$1('dom', {}),
        defaulted$1('components', []),
        snapshot$1('originalSpec'),
        defaulted$1('debug.sketcher', {})
      ]).concat(partUidsSchemas);
    };
    var asRawOrDie$1 = function (label, schema, spec, partSchemas, partUidsSchemas) {
      var baseS = base(label, partSchemas, partUidsSchemas, spec);
      return asRawOrDie(label + ' [SpecSchema]', objOfOnly(baseS.concat(schema)), spec);
    };

    var single$1 = function (owner, schema, factory, spec) {
      var specWithUid = supplyUid(spec);
      var detail = asRawOrDie$1(owner, schema, specWithUid, [], []);
      return factory(detail, specWithUid);
    };
    var composite = function (owner, schema, partTypes, factory, spec) {
      var specWithUid = supplyUid(spec);
      var partSchemas = schemas(partTypes);
      var partUidsSchema = defaultUidsSchema(partTypes);
      var detail = asRawOrDie$1(owner, schema, specWithUid, partSchemas, [partUidsSchema]);
      var subs = substitutes(owner, detail, partTypes);
      var components$$1 = components(owner, detail, subs.internals());
      return factory(detail, components$$1, specWithUid, subs.externals());
    };
    var supplyUid = function (spec) {
      return spec.hasOwnProperty('uid') ? spec : __assign({}, spec, { uid: generate$2('uid') });
    };

    function isSketchSpec(spec) {
      return spec.uid !== undefined;
    }
    var singleSchema = objOfOnly([
      strict$1('name'),
      strict$1('factory'),
      strict$1('configFields'),
      defaulted$1('apis', {}),
      defaulted$1('extraApis', {})
    ]);
    var compositeSchema = objOfOnly([
      strict$1('name'),
      strict$1('factory'),
      strict$1('configFields'),
      strict$1('partFields'),
      defaulted$1('apis', {}),
      defaulted$1('extraApis', {})
    ]);
    var single$2 = function (rawConfig) {
      var config = asRawOrDie('Sketcher for ' + rawConfig.name, singleSchema, rawConfig);
      var sketch = function (spec) {
        return single$1(config.name, config.configFields, config.factory, spec);
      };
      var apis = map$1(config.apis, makeApi);
      var extraApis = map$1(config.extraApis, function (f, k) {
        return markAsExtraApi(f, k);
      });
      return __assign({
        name: constant(config.name),
        partFields: constant([]),
        configFields: constant(config.configFields),
        sketch: sketch
      }, apis, extraApis);
    };
    var composite$1 = function (rawConfig) {
      var config = asRawOrDie('Sketcher for ' + rawConfig.name, compositeSchema, rawConfig);
      var sketch = function (spec) {
        return composite(config.name, config.configFields, config.partFields, config.factory, spec);
      };
      var parts = generate$4(config.name, config.partFields);
      var apis = map$1(config.apis, makeApi);
      var extraApis = map$1(config.extraApis, function (f, k) {
        return markAsExtraApi(f, k);
      });
      return __assign({
        name: constant(config.name),
        partFields: constant(config.partFields),
        configFields: constant(config.configFields),
        sketch: sketch,
        parts: constant(parts)
      }, apis, extraApis);
    };

    var inside = function (target) {
      return name(target) === 'input' && get$2(target, 'type') !== 'radio' || name(target) === 'textarea';
    };

    var getCurrent = function (component, composeConfig, composeState) {
      return composeConfig.find(component);
    };

    var ComposeApis = /*#__PURE__*/Object.freeze({
        getCurrent: getCurrent
    });

    var ComposeSchema = [strict$1('find')];

    var Composing = create$1({
      fields: ComposeSchema,
      name: 'composing',
      apis: ComposeApis
    });

    var cycleBy = function (value, delta, min, max) {
      var r = value + delta;
      if (r > max) {
        return min;
      } else {
        return r < min ? max : r;
      }
    };
    var cap = function (value, min, max) {
      if (value <= min) {
        return min;
      } else {
        return value >= max ? max : value;
      }
    };

    var dehighlightAll = function (component, hConfig, hState) {
      var highlighted = descendants$1(component.element(), '.' + hConfig.highlightClass);
      each(highlighted, function (h) {
        remove$4(h, hConfig.highlightClass);
        component.getSystem().getByDom(h).each(function (target) {
          hConfig.onDehighlight(component, target);
        });
      });
    };
    var dehighlight = function (component, hConfig, hState, target) {
      var wasHighlighted = isHighlighted(component, hConfig, hState, target);
      remove$4(target.element(), hConfig.highlightClass);
      if (wasHighlighted) {
        hConfig.onDehighlight(component, target);
      }
    };
    var highlight = function (component, hConfig, hState, target) {
      var wasHighlighted = isHighlighted(component, hConfig, hState, target);
      dehighlightAll(component, hConfig, hState);
      add$2(target.element(), hConfig.highlightClass);
      if (!wasHighlighted) {
        hConfig.onHighlight(component, target);
      }
    };
    var highlightFirst = function (component, hConfig, hState) {
      getFirst(component, hConfig, hState).each(function (firstComp) {
        highlight(component, hConfig, hState, firstComp);
      });
    };
    var highlightLast = function (component, hConfig, hState) {
      getLast(component, hConfig, hState).each(function (lastComp) {
        highlight(component, hConfig, hState, lastComp);
      });
    };
    var highlightAt = function (component, hConfig, hState, index) {
      getByIndex(component, hConfig, hState, index).fold(function (err) {
        throw new Error(err);
      }, function (firstComp) {
        highlight(component, hConfig, hState, firstComp);
      });
    };
    var highlightBy = function (component, hConfig, hState, predicate) {
      var candidates = getCandidates(component, hConfig, hState);
      var targetComp = find(candidates, predicate);
      targetComp.each(function (c) {
        highlight(component, hConfig, hState, c);
      });
    };
    var isHighlighted = function (component, hConfig, hState, queryTarget) {
      return has$2(queryTarget.element(), hConfig.highlightClass);
    };
    var getHighlighted = function (component, hConfig, hState) {
      return descendant$2(component.element(), '.' + hConfig.highlightClass).bind(function (e) {
        return component.getSystem().getByDom(e).toOption();
      });
    };
    var getByIndex = function (component, hConfig, hState, index) {
      var items = descendants$1(component.element(), '.' + hConfig.itemClass);
      return Option.from(items[index]).fold(function () {
        return Result.error('No element found with index ' + index);
      }, component.getSystem().getByDom);
    };
    var getFirst = function (component, hConfig, hState) {
      return descendant$2(component.element(), '.' + hConfig.itemClass).bind(function (e) {
        return component.getSystem().getByDom(e).toOption();
      });
    };
    var getLast = function (component, hConfig, hState) {
      var items = descendants$1(component.element(), '.' + hConfig.itemClass);
      var last$$1 = items.length > 0 ? Option.some(items[items.length - 1]) : Option.none();
      return last$$1.bind(function (c) {
        return component.getSystem().getByDom(c).toOption();
      });
    };
    var getDelta = function (component, hConfig, hState, delta) {
      var items = descendants$1(component.element(), '.' + hConfig.itemClass);
      var current = findIndex(items, function (item) {
        return has$2(item, hConfig.highlightClass);
      });
      return current.bind(function (selected) {
        var dest = cycleBy(selected, delta, 0, items.length - 1);
        return component.getSystem().getByDom(items[dest]).toOption();
      });
    };
    var getPrevious = function (component, hConfig, hState) {
      return getDelta(component, hConfig, hState, -1);
    };
    var getNext = function (component, hConfig, hState) {
      return getDelta(component, hConfig, hState, +1);
    };
    var getCandidates = function (component, hConfig, hState) {
      var items = descendants$1(component.element(), '.' + hConfig.itemClass);
      return cat(map(items, function (i) {
        return component.getSystem().getByDom(i).toOption();
      }));
    };

    var HighlightApis = /*#__PURE__*/Object.freeze({
        dehighlightAll: dehighlightAll,
        dehighlight: dehighlight,
        highlight: highlight,
        highlightFirst: highlightFirst,
        highlightLast: highlightLast,
        highlightAt: highlightAt,
        highlightBy: highlightBy,
        isHighlighted: isHighlighted,
        getHighlighted: getHighlighted,
        getFirst: getFirst,
        getLast: getLast,
        getPrevious: getPrevious,
        getNext: getNext,
        getCandidates: getCandidates
    });

    var HighlightSchema = [
      strict$1('highlightClass'),
      strict$1('itemClass'),
      onHandler('onHighlight'),
      onHandler('onDehighlight')
    ];

    var Highlighting = create$1({
      fields: HighlightSchema,
      name: 'highlighting',
      apis: HighlightApis
    });

    var BACKSPACE = function () {
      return [8];
    };
    var TAB = function () {
      return [9];
    };
    var ENTER = function () {
      return [13];
    };
    var ESCAPE = function () {
      return [27];
    };
    var SPACE = function () {
      return [32];
    };
    var LEFT = function () {
      return [37];
    };
    var UP = function () {
      return [38];
    };
    var RIGHT = function () {
      return [39];
    };
    var DOWN = function () {
      return [40];
    };

    var cyclePrev = function (values, index, predicate) {
      var before = reverse(values.slice(0, index));
      var after = reverse(values.slice(index + 1));
      return find(before.concat(after), predicate);
    };
    var tryPrev = function (values, index, predicate) {
      var before = reverse(values.slice(0, index));
      return find(before, predicate);
    };
    var cycleNext = function (values, index, predicate) {
      var before = values.slice(0, index);
      var after = values.slice(index + 1);
      return find(after.concat(before), predicate);
    };
    var tryNext = function (values, index, predicate) {
      var after = values.slice(index + 1);
      return find(after, predicate);
    };

    var inSet = function (keys) {
      return function (event) {
        var raw = event.raw();
        return contains(keys, raw.which);
      };
    };
    var and = function (preds) {
      return function (event) {
        return forall(preds, function (pred) {
          return pred(event);
        });
      };
    };
    var isShift = function (event) {
      var raw = event.raw();
      return raw.shiftKey === true;
    };
    var isControl = function (event) {
      var raw = event.raw();
      return raw.ctrlKey === true;
    };
    var isNotShift = not(isShift);

    var rule = function (matches, action) {
      return {
        matches: matches,
        classification: action
      };
    };
    var choose$2 = function (transitions, event) {
      var transition = find(transitions, function (t) {
        return t.matches(event);
      });
      return transition.map(function (t) {
        return t.classification;
      });
    };

    var focus$2 = function (element) {
      element.dom().focus();
    };
    var blur$$1 = function (element) {
      element.dom().blur();
    };
    var hasFocus = function (element) {
      var doc = owner(element).dom();
      return element.dom() === doc.activeElement;
    };
    var active = function (_DOC) {
      var doc = _DOC !== undefined ? _DOC.dom() : document;
      return Option.from(doc.activeElement).map(Element$$1.fromDom);
    };
    var search$1 = function (element) {
      return active(owner(element)).filter(function (e) {
        return element.dom().contains(e.dom());
      });
    };

    var reportFocusShifting = function (component, prevFocus, newFocus) {
      var noChange = prevFocus.exists(function (p) {
        return newFocus.exists(function (n) {
          return eq(n, p);
        });
      });
      if (!noChange) {
        emitWith(component, focusShifted(), {
          prevFocus: prevFocus,
          newFocus: newFocus
        });
      }
    };
    var dom = function () {
      var get = function (component) {
        return search$1(component.element());
      };
      var set = function (component, focusee) {
        var prevFocus = get(component);
        component.getSystem().triggerFocus(focusee, component.element());
        var newFocus = get(component);
        reportFocusShifting(component, prevFocus, newFocus);
      };
      return {
        get: get,
        set: set
      };
    };
    var highlights = function () {
      var get = function (component) {
        return Highlighting.getHighlighted(component).map(function (item) {
          return item.element();
        });
      };
      var set = function (component, element) {
        var prevFocus = get(component);
        component.getSystem().getByDom(element).fold(noop, function (item) {
          Highlighting.highlight(component, item);
        });
        var newFocus = get(component);
        reportFocusShifting(component, prevFocus, newFocus);
      };
      return {
        get: get,
        set: set
      };
    };

    var FocusInsideModes;
    (function (FocusInsideModes) {
      FocusInsideModes['OnFocusMode'] = 'onFocus';
      FocusInsideModes['OnEnterOrSpaceMode'] = 'onEnterOrSpace';
      FocusInsideModes['OnApiMode'] = 'onApi';
    }(FocusInsideModes || (FocusInsideModes = {})));

    var typical = function (infoSchema, stateInit, getKeydownRules, getKeyupRules, optFocusIn) {
      var schema = function () {
        return infoSchema.concat([
          defaulted$1('focusManager', dom()),
          defaultedOf('focusInside', 'onFocus', valueOf(function (val) {
            return contains([
              'onFocus',
              'onEnterOrSpace',
              'onApi'
            ], val) ? Result.value(val) : Result.error('Invalid value for focusInside');
          })),
          output$1('handler', me),
          output$1('state', stateInit),
          output$1('sendFocusIn', optFocusIn)
        ]);
      };
      var processKey = function (component, simulatedEvent, getRules, keyingConfig, keyingState) {
        var rules = getRules(component, simulatedEvent, keyingConfig, keyingState);
        return choose$2(rules, simulatedEvent.event()).bind(function (rule$$1) {
          return rule$$1(component, simulatedEvent, keyingConfig, keyingState);
        });
      };
      var toEvents = function (keyingConfig, keyingState) {
        var onFocusHandler = keyingConfig.focusInside !== FocusInsideModes.OnFocusMode ? Option.none() : optFocusIn(keyingConfig).map(function (focusIn) {
          return run(focus$1(), function (component, simulatedEvent) {
            focusIn(component, keyingConfig, keyingState);
            simulatedEvent.stop();
          });
        });
        var tryGoInsideComponent = function (component, simulatedEvent) {
          var isEnterOrSpace = inSet(SPACE().concat(ENTER()))(simulatedEvent.event());
          if (keyingConfig.focusInside === FocusInsideModes.OnEnterOrSpaceMode && isEnterOrSpace && isSource(component, simulatedEvent)) {
            optFocusIn(keyingConfig).each(function (focusIn) {
              focusIn(component, keyingConfig, keyingState);
              simulatedEvent.stop();
            });
          }
        };
        return derive(onFocusHandler.toArray().concat([
          run(keydown(), function (component, simulatedEvent) {
            processKey(component, simulatedEvent, getKeydownRules, keyingConfig, keyingState).fold(function () {
              tryGoInsideComponent(component, simulatedEvent);
            }, function (_) {
              simulatedEvent.stop();
            });
          }),
          run(keyup(), function (component, simulatedEvent) {
            processKey(component, simulatedEvent, getKeyupRules, keyingConfig, keyingState).each(function (_) {
              simulatedEvent.stop();
            });
          })
        ]));
      };
      var me = {
        schema: schema,
        processKey: processKey,
        toEvents: toEvents
      };
      return me;
    };

    var create$3 = function (cyclicField) {
      var schema = [
        option('onEscape'),
        option('onEnter'),
        defaulted$1('selector', '[data-alloy-tabstop="true"]'),
        defaulted$1('firstTabstop', 0),
        defaulted$1('useTabstopAt', constant(true)),
        option('visibilitySelector')
      ].concat([cyclicField]);
      var isVisible = function (tabbingConfig, element) {
        var target = tabbingConfig.visibilitySelector.bind(function (sel) {
          return closest$3(element, sel);
        }).getOr(element);
        return get$9(target) > 0;
      };
      var findInitial = function (component, tabbingConfig) {
        var tabstops = descendants$1(component.element(), tabbingConfig.selector);
        var visibles = filter(tabstops, function (elem) {
          return isVisible(tabbingConfig, elem);
        });
        return Option.from(visibles[tabbingConfig.firstTabstop]);
      };
      var findCurrent = function (component, tabbingConfig) {
        return tabbingConfig.focusManager.get(component).bind(function (elem) {
          return closest$3(elem, tabbingConfig.selector);
        });
      };
      var isTabstop = function (tabbingConfig, element) {
        return isVisible(tabbingConfig, element) && tabbingConfig.useTabstopAt(element);
      };
      var focusIn = function (component, tabbingConfig) {
        findInitial(component, tabbingConfig).each(function (target) {
          tabbingConfig.focusManager.set(component, target);
        });
      };
      var goFromTabstop = function (component, tabstops, stopIndex, tabbingConfig, cycle) {
        return cycle(tabstops, stopIndex, function (elem) {
          return isTabstop(tabbingConfig, elem);
        }).fold(function () {
          return tabbingConfig.cyclic ? Option.some(true) : Option.none();
        }, function (target) {
          tabbingConfig.focusManager.set(component, target);
          return Option.some(true);
        });
      };
      var go = function (component, simulatedEvent, tabbingConfig, cycle) {
        var tabstops = descendants$1(component.element(), tabbingConfig.selector);
        return findCurrent(component, tabbingConfig).bind(function (tabstop) {
          var optStopIndex = findIndex(tabstops, curry(eq, tabstop));
          return optStopIndex.bind(function (stopIndex) {
            return goFromTabstop(component, tabstops, stopIndex, tabbingConfig, cycle);
          });
        });
      };
      var goBackwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
        var navigate = tabbingConfig.cyclic ? cyclePrev : tryPrev;
        return go(component, simulatedEvent, tabbingConfig, navigate);
      };
      var goForwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
        var navigate = tabbingConfig.cyclic ? cycleNext : tryNext;
        return go(component, simulatedEvent, tabbingConfig, navigate);
      };
      var execute = function (component, simulatedEvent, tabbingConfig, tabbingState) {
        return tabbingConfig.onEnter.bind(function (f) {
          return f(component, simulatedEvent);
        });
      };
      var exit = function (component, simulatedEvent, tabbingConfig, tabbingState) {
        return tabbingConfig.onEscape.bind(function (f) {
          return f(component, simulatedEvent);
        });
      };
      var getKeydownRules = constant([
        rule(and([
          isShift,
          inSet(TAB())
        ]), goBackwards),
        rule(inSet(TAB()), goForwards),
        rule(inSet(ESCAPE()), exit),
        rule(and([
          isNotShift,
          inSet(ENTER())
        ]), execute)
      ]);
      var getKeyupRules = constant([]);
      return typical(schema, NoState.init, getKeydownRules, getKeyupRules, function () {
        return Option.some(focusIn);
      });
    };

    var AcyclicType = create$3(state$1('cyclic', constant(false)));

    var CyclicType = create$3(state$1('cyclic', constant(true)));

    var doDefaultExecute = function (component, simulatedEvent, focused) {
      dispatch(component, focused, execute());
      return Option.some(true);
    };
    var defaultExecute = function (component, simulatedEvent, focused) {
      return inside(focused) && inSet(SPACE())(simulatedEvent.event()) ? Option.none() : doDefaultExecute(component, simulatedEvent, focused);
    };
    var stopEventForFirefox = function (component, simulatedEvent) {
      return Option.some(true);
    };

    var schema$3 = [
      defaulted$1('execute', defaultExecute),
      defaulted$1('useSpace', false),
      defaulted$1('useEnter', true),
      defaulted$1('useControlEnter', false),
      defaulted$1('useDown', false)
    ];
    var execute$1 = function (component, simulatedEvent, executeConfig) {
      return executeConfig.execute(component, simulatedEvent, component.element());
    };
    var getKeydownRules = function (component, simulatedEvent, executeConfig, executeState) {
      var spaceExec = executeConfig.useSpace && !inside(component.element()) ? SPACE() : [];
      var enterExec = executeConfig.useEnter ? ENTER() : [];
      var downExec = executeConfig.useDown ? DOWN() : [];
      var execKeys = spaceExec.concat(enterExec).concat(downExec);
      return [rule(inSet(execKeys), execute$1)].concat(executeConfig.useControlEnter ? [rule(and([
          isControl,
          inSet(ENTER())
        ]), execute$1)] : []);
    };
    var getKeyupRules = function (component, simulatedEvent, executeConfig, executeState) {
      return executeConfig.useSpace && !inside(component.element()) ? [rule(inSet(SPACE()), stopEventForFirefox)] : [];
    };
    var ExecutionType = typical(schema$3, NoState.init, getKeydownRules, getKeyupRules, function () {
      return Option.none();
    });

    var flatgrid = function (spec) {
      var dimensions = Cell(Option.none());
      var setGridSize = function (numRows, numColumns) {
        dimensions.set(Option.some({
          numRows: constant(numRows),
          numColumns: constant(numColumns)
        }));
      };
      var getNumRows = function () {
        return dimensions.get().map(function (d) {
          return d.numRows();
        });
      };
      var getNumColumns = function () {
        return dimensions.get().map(function (d) {
          return d.numColumns();
        });
      };
      return nu$5({
        readState: function () {
          return dimensions.get().map(function (d) {
            return {
              numRows: d.numRows(),
              numColumns: d.numColumns()
            };
          }).getOr({
            numRows: '?',
            numColumns: '?'
          });
        },
        setGridSize: setGridSize,
        getNumRows: getNumRows,
        getNumColumns: getNumColumns
      });
    };
    var init$1 = function (spec) {
      return spec.state(spec);
    };

    var KeyingState = /*#__PURE__*/Object.freeze({
        flatgrid: flatgrid,
        init: init$1
    });

    var useH = function (movement) {
      return function (component, simulatedEvent, config, state) {
        var move = movement(component.element());
        return use(move, component, simulatedEvent, config, state);
      };
    };
    var west$2 = function (moveLeft, moveRight) {
      var movement = onDirection(moveLeft, moveRight);
      return useH(movement);
    };
    var east$2 = function (moveLeft, moveRight) {
      var movement = onDirection(moveRight, moveLeft);
      return useH(movement);
    };
    var useV = function (move) {
      return function (component, simulatedEvent, config, state) {
        return use(move, component, simulatedEvent, config, state);
      };
    };
    var use = function (move, component, simulatedEvent, config, state) {
      var outcome = config.focusManager.get(component).bind(function (focused) {
        return move(component.element(), focused, config, state);
      });
      return outcome.map(function (newFocus) {
        config.focusManager.set(component, newFocus);
        return true;
      });
    };
    var north$2 = useV;
    var south$2 = useV;
    var move = useV;

    var isHidden = function (dom) {
      return dom.offsetWidth <= 0 && dom.offsetHeight <= 0;
    };
    var isVisible = function (element) {
      var dom = element.dom();
      return !isHidden(dom);
    };

    var indexInfo = MixedBag([
      'index',
      'candidates'
    ], []);
    var locate$2 = function (candidates, predicate) {
      return findIndex(candidates, predicate).map(function (index) {
        return indexInfo({
          index: index,
          candidates: candidates
        });
      });
    };

    var locateVisible = function (container, current, selector) {
      var filter$$1 = isVisible;
      return locateIn(container, current, selector, filter$$1);
    };
    var locateIn = function (container, current, selector, filter$$1) {
      var predicate = curry(eq, current);
      var candidates = descendants$1(container, selector);
      var visible = filter(candidates, isVisible);
      return locate$2(visible, predicate);
    };
    var findIndex$2 = function (elements, target) {
      return findIndex(elements, function (elem) {
        return eq(target, elem);
      });
    };

    var withGrid = function (values, index, numCols, f) {
      var oldRow = Math.floor(index / numCols);
      var oldColumn = index % numCols;
      return f(oldRow, oldColumn).bind(function (address) {
        var newIndex = address.row() * numCols + address.column();
        return newIndex >= 0 && newIndex < values.length ? Option.some(values[newIndex]) : Option.none();
      });
    };
    var cycleHorizontal = function (values, index, numRows, numCols, delta) {
      return withGrid(values, index, numCols, function (oldRow, oldColumn) {
        var onLastRow = oldRow === numRows - 1;
        var colsInRow = onLastRow ? values.length - oldRow * numCols : numCols;
        var newColumn = cycleBy(oldColumn, delta, 0, colsInRow - 1);
        return Option.some({
          row: constant(oldRow),
          column: constant(newColumn)
        });
      });
    };
    var cycleVertical = function (values, index, numRows, numCols, delta) {
      return withGrid(values, index, numCols, function (oldRow, oldColumn) {
        var newRow = cycleBy(oldRow, delta, 0, numRows - 1);
        var onLastRow = newRow === numRows - 1;
        var colsInRow = onLastRow ? values.length - newRow * numCols : numCols;
        var newCol = cap(oldColumn, 0, colsInRow - 1);
        return Option.some({
          row: constant(newRow),
          column: constant(newCol)
        });
      });
    };
    var cycleRight = function (values, index, numRows, numCols) {
      return cycleHorizontal(values, index, numRows, numCols, +1);
    };
    var cycleLeft = function (values, index, numRows, numCols) {
      return cycleHorizontal(values, index, numRows, numCols, -1);
    };
    var cycleUp = function (values, index, numRows, numCols) {
      return cycleVertical(values, index, numRows, numCols, -1);
    };
    var cycleDown = function (values, index, numRows, numCols) {
      return cycleVertical(values, index, numRows, numCols, +1);
    };

    var schema$4 = [
      strict$1('selector'),
      defaulted$1('execute', defaultExecute),
      onKeyboardHandler('onEscape'),
      defaulted$1('captureTab', false),
      initSize()
    ];
    var focusIn = function (component, gridConfig, gridState) {
      descendant$2(component.element(), gridConfig.selector).each(function (first) {
        gridConfig.focusManager.set(component, first);
      });
    };
    var findCurrent = function (component, gridConfig) {
      return gridConfig.focusManager.get(component).bind(function (elem) {
        return closest$3(elem, gridConfig.selector);
      });
    };
    var execute$2 = function (component, simulatedEvent, gridConfig, gridState) {
      return findCurrent(component, gridConfig).bind(function (focused) {
        return gridConfig.execute(component, simulatedEvent, focused);
      });
    };
    var doMove = function (cycle) {
      return function (element, focused, gridConfig, gridState) {
        return locateVisible(element, focused, gridConfig.selector).bind(function (identified) {
          return cycle(identified.candidates(), identified.index(), gridState.getNumRows().getOr(gridConfig.initSize.numRows), gridState.getNumColumns().getOr(gridConfig.initSize.numColumns));
        });
      };
    };
    var handleTab = function (component, simulatedEvent, gridConfig, gridState) {
      return gridConfig.captureTab ? Option.some(true) : Option.none();
    };
    var doEscape = function (component, simulatedEvent, gridConfig, gridState) {
      return gridConfig.onEscape(component, simulatedEvent);
    };
    var moveLeft = doMove(cycleLeft);
    var moveRight = doMove(cycleRight);
    var moveNorth = doMove(cycleUp);
    var moveSouth = doMove(cycleDown);
    var getKeydownRules$1 = constant([
      rule(inSet(LEFT()), west$2(moveLeft, moveRight)),
      rule(inSet(RIGHT()), east$2(moveLeft, moveRight)),
      rule(inSet(UP()), north$2(moveNorth)),
      rule(inSet(DOWN()), south$2(moveSouth)),
      rule(and([
        isShift,
        inSet(TAB())
      ]), handleTab),
      rule(and([
        isNotShift,
        inSet(TAB())
      ]), handleTab),
      rule(inSet(ESCAPE()), doEscape),
      rule(inSet(SPACE().concat(ENTER())), execute$2)
    ]);
    var getKeyupRules$1 = constant([rule(inSet(SPACE()), stopEventForFirefox)]);
    var FlatgridType = typical(schema$4, flatgrid, getKeydownRules$1, getKeyupRules$1, function () {
      return Option.some(focusIn);
    });

    var horizontal = function (container, selector, current, delta) {
      var isDisabledButton = function (candidate) {
        return name(candidate) === 'button' && get$2(candidate, 'disabled') === 'disabled';
      };
      var tryCycle = function (initial, index, candidates) {
        var newIndex = cycleBy(index, delta, 0, candidates.length - 1);
        if (newIndex === initial) {
          return Option.none();
        } else {
          return isDisabledButton(candidates[newIndex]) ? tryCycle(initial, newIndex, candidates) : Option.from(candidates[newIndex]);
        }
      };
      return locateVisible(container, current, selector).bind(function (identified) {
        var index = identified.index();
        var candidates = identified.candidates();
        return tryCycle(index, index, candidates);
      });
    };

    var schema$5 = [
      strict$1('selector'),
      defaulted$1('getInitial', Option.none),
      defaulted$1('execute', defaultExecute),
      onKeyboardHandler('onEscape'),
      defaulted$1('executeOnMove', false),
      defaulted$1('allowVertical', true)
    ];
    var findCurrent$1 = function (component, flowConfig) {
      return flowConfig.focusManager.get(component).bind(function (elem) {
        return closest$3(elem, flowConfig.selector);
      });
    };
    var execute$3 = function (component, simulatedEvent, flowConfig) {
      return findCurrent$1(component, flowConfig).bind(function (focused) {
        return flowConfig.execute(component, simulatedEvent, focused);
      });
    };
    var focusIn$1 = function (component, flowConfig) {
      flowConfig.getInitial(component).orThunk(function () {
        return descendant$2(component.element(), flowConfig.selector);
      }).each(function (first) {
        flowConfig.focusManager.set(component, first);
      });
    };
    var moveLeft$1 = function (element, focused, info) {
      return horizontal(element, info.selector, focused, -1);
    };
    var moveRight$1 = function (element, focused, info) {
      return horizontal(element, info.selector, focused, +1);
    };
    var doMove$1 = function (movement) {
      return function (component, simulatedEvent, flowConfig) {
        return movement(component, simulatedEvent, flowConfig).bind(function () {
          return flowConfig.executeOnMove ? execute$3(component, simulatedEvent, flowConfig) : Option.some(true);
        });
      };
    };
    var doEscape$1 = function (component, simulatedEvent, flowConfig, _flowState) {
      return flowConfig.onEscape(component, simulatedEvent);
    };
    var getKeydownRules$2 = function (_component, _se, flowConfig, _flowState) {
      var westMovers = LEFT().concat(flowConfig.allowVertical ? UP() : []);
      var eastMovers = RIGHT().concat(flowConfig.allowVertical ? DOWN() : []);
      return [
        rule(inSet(westMovers), doMove$1(west$2(moveLeft$1, moveRight$1))),
        rule(inSet(eastMovers), doMove$1(east$2(moveLeft$1, moveRight$1))),
        rule(inSet(ENTER()), execute$3),
        rule(inSet(SPACE()), execute$3),
        rule(inSet(ESCAPE()), doEscape$1)
      ];
    };
    var getKeyupRules$2 = constant([rule(inSet(SPACE()), stopEventForFirefox)]);
    var FlowType = typical(schema$5, NoState.init, getKeydownRules$2, getKeyupRules$2, function () {
      return Option.some(focusIn$1);
    });

    var outcome = MixedBag([
      'rowIndex',
      'columnIndex',
      'cell'
    ], []);
    var toCell = function (matrix, rowIndex, columnIndex) {
      return Option.from(matrix[rowIndex]).bind(function (row) {
        return Option.from(row[columnIndex]).map(function (cell) {
          return outcome({
            rowIndex: rowIndex,
            columnIndex: columnIndex,
            cell: cell
          });
        });
      });
    };
    var cycleHorizontal$1 = function (matrix, rowIndex, startCol, deltaCol) {
      var row = matrix[rowIndex];
      var colsInRow = row.length;
      var newColIndex = cycleBy(startCol, deltaCol, 0, colsInRow - 1);
      return toCell(matrix, rowIndex, newColIndex);
    };
    var cycleVertical$1 = function (matrix, colIndex, startRow, deltaRow) {
      var nextRowIndex = cycleBy(startRow, deltaRow, 0, matrix.length - 1);
      var colsInNextRow = matrix[nextRowIndex].length;
      var nextColIndex = cap(colIndex, 0, colsInNextRow - 1);
      return toCell(matrix, nextRowIndex, nextColIndex);
    };
    var moveHorizontal = function (matrix, rowIndex, startCol, deltaCol) {
      var row = matrix[rowIndex];
      var colsInRow = row.length;
      var newColIndex = cap(startCol + deltaCol, 0, colsInRow - 1);
      return toCell(matrix, rowIndex, newColIndex);
    };
    var moveVertical = function (matrix, colIndex, startRow, deltaRow) {
      var nextRowIndex = cap(startRow + deltaRow, 0, matrix.length - 1);
      var colsInNextRow = matrix[nextRowIndex].length;
      var nextColIndex = cap(colIndex, 0, colsInNextRow - 1);
      return toCell(matrix, nextRowIndex, nextColIndex);
    };
    var cycleRight$1 = function (matrix, startRow, startCol) {
      return cycleHorizontal$1(matrix, startRow, startCol, +1);
    };
    var cycleLeft$1 = function (matrix, startRow, startCol) {
      return cycleHorizontal$1(matrix, startRow, startCol, -1);
    };
    var cycleUp$1 = function (matrix, startRow, startCol) {
      return cycleVertical$1(matrix, startCol, startRow, -1);
    };
    var cycleDown$1 = function (matrix, startRow, startCol) {
      return cycleVertical$1(matrix, startCol, startRow, +1);
    };
    var moveLeft$2 = function (matrix, startRow, startCol) {
      return moveHorizontal(matrix, startRow, startCol, -1);
    };
    var moveRight$2 = function (matrix, startRow, startCol) {
      return moveHorizontal(matrix, startRow, startCol, +1);
    };
    var moveUp = function (matrix, startRow, startCol) {
      return moveVertical(matrix, startCol, startRow, -1);
    };
    var moveDown = function (matrix, startRow, startCol) {
      return moveVertical(matrix, startCol, startRow, +1);
    };

    var schema$6 = [
      strictObjOf('selectors', [
        strict$1('row'),
        strict$1('cell')
      ]),
      defaulted$1('cycles', true),
      defaulted$1('previousSelector', Option.none),
      defaulted$1('execute', defaultExecute)
    ];
    var focusIn$2 = function (component, matrixConfig) {
      var focused = matrixConfig.previousSelector(component).orThunk(function () {
        var selectors = matrixConfig.selectors;
        return descendant$2(component.element(), selectors.cell);
      });
      focused.each(function (cell) {
        matrixConfig.focusManager.set(component, cell);
      });
    };
    var execute$4 = function (component, simulatedEvent, matrixConfig) {
      return search$1(component.element()).bind(function (focused) {
        return matrixConfig.execute(component, simulatedEvent, focused);
      });
    };
    var toMatrix = function (rows, matrixConfig) {
      return map(rows, function (row) {
        return descendants$1(row, matrixConfig.selectors.cell);
      });
    };
    var doMove$2 = function (ifCycle, ifMove) {
      return function (element, focused, matrixConfig) {
        var move$$1 = matrixConfig.cycles ? ifCycle : ifMove;
        return closest$3(focused, matrixConfig.selectors.row).bind(function (inRow) {
          var cellsInRow = descendants$1(inRow, matrixConfig.selectors.cell);
          return findIndex$2(cellsInRow, focused).bind(function (colIndex) {
            var allRows = descendants$1(element, matrixConfig.selectors.row);
            return findIndex$2(allRows, inRow).bind(function (rowIndex) {
              var matrix = toMatrix(allRows, matrixConfig);
              return move$$1(matrix, rowIndex, colIndex).map(function (next) {
                return next.cell();
              });
            });
          });
        });
      };
    };
    var moveLeft$3 = doMove$2(cycleLeft$1, moveLeft$2);
    var moveRight$3 = doMove$2(cycleRight$1, moveRight$2);
    var moveNorth$1 = doMove$2(cycleUp$1, moveUp);
    var moveSouth$1 = doMove$2(cycleDown$1, moveDown);
    var getKeydownRules$3 = constant([
      rule(inSet(LEFT()), west$2(moveLeft$3, moveRight$3)),
      rule(inSet(RIGHT()), east$2(moveLeft$3, moveRight$3)),
      rule(inSet(UP()), north$2(moveNorth$1)),
      rule(inSet(DOWN()), south$2(moveSouth$1)),
      rule(inSet(SPACE().concat(ENTER())), execute$4)
    ]);
    var getKeyupRules$3 = constant([rule(inSet(SPACE()), stopEventForFirefox)]);
    var MatrixType = typical(schema$6, NoState.init, getKeydownRules$3, getKeyupRules$3, function () {
      return Option.some(focusIn$2);
    });

    var schema$7 = [
      strict$1('selector'),
      defaulted$1('execute', defaultExecute),
      defaulted$1('moveOnTab', false)
    ];
    var execute$5 = function (component, simulatedEvent, menuConfig) {
      return menuConfig.focusManager.get(component).bind(function (focused) {
        return menuConfig.execute(component, simulatedEvent, focused);
      });
    };
    var focusIn$3 = function (component, menuConfig) {
      descendant$2(component.element(), menuConfig.selector).each(function (first) {
        menuConfig.focusManager.set(component, first);
      });
    };
    var moveUp$1 = function (element, focused, info) {
      return horizontal(element, info.selector, focused, -1);
    };
    var moveDown$1 = function (element, focused, info) {
      return horizontal(element, info.selector, focused, +1);
    };
    var fireShiftTab = function (component, simulatedEvent, menuConfig) {
      return menuConfig.moveOnTab ? move(moveUp$1)(component, simulatedEvent, menuConfig) : Option.none();
    };
    var fireTab = function (component, simulatedEvent, menuConfig) {
      return menuConfig.moveOnTab ? move(moveDown$1)(component, simulatedEvent, menuConfig) : Option.none();
    };
    var getKeydownRules$4 = constant([
      rule(inSet(UP()), move(moveUp$1)),
      rule(inSet(DOWN()), move(moveDown$1)),
      rule(and([
        isShift,
        inSet(TAB())
      ]), fireShiftTab),
      rule(and([
        isNotShift,
        inSet(TAB())
      ]), fireTab),
      rule(inSet(ENTER()), execute$5),
      rule(inSet(SPACE()), execute$5)
    ]);
    var getKeyupRules$4 = constant([rule(inSet(SPACE()), stopEventForFirefox)]);
    var MenuType = typical(schema$7, NoState.init, getKeydownRules$4, getKeyupRules$4, function () {
      return Option.some(focusIn$3);
    });

    var schema$8 = [
      onKeyboardHandler('onSpace'),
      onKeyboardHandler('onEnter'),
      onKeyboardHandler('onShiftEnter'),
      onKeyboardHandler('onLeft'),
      onKeyboardHandler('onRight'),
      onKeyboardHandler('onTab'),
      onKeyboardHandler('onShiftTab'),
      onKeyboardHandler('onUp'),
      onKeyboardHandler('onDown'),
      onKeyboardHandler('onEscape'),
      defaulted$1('stopSpaceKeyup', false),
      option('focusIn')
    ];
    var getKeydownRules$5 = function (component, simulatedEvent, specialInfo) {
      return [
        rule(inSet(SPACE()), specialInfo.onSpace),
        rule(and([
          isNotShift,
          inSet(ENTER())
        ]), specialInfo.onEnter),
        rule(and([
          isShift,
          inSet(ENTER())
        ]), specialInfo.onShiftEnter),
        rule(and([
          isShift,
          inSet(TAB())
        ]), specialInfo.onShiftTab),
        rule(and([
          isNotShift,
          inSet(TAB())
        ]), specialInfo.onTab),
        rule(inSet(UP()), specialInfo.onUp),
        rule(inSet(DOWN()), specialInfo.onDown),
        rule(inSet(LEFT()), specialInfo.onLeft),
        rule(inSet(RIGHT()), specialInfo.onRight),
        rule(inSet(SPACE()), specialInfo.onSpace),
        rule(inSet(ESCAPE()), specialInfo.onEscape)
      ];
    };
    var getKeyupRules$5 = function (component, simulatedEvent, specialInfo) {
      return specialInfo.stopSpaceKeyup ? [rule(inSet(SPACE()), stopEventForFirefox)] : [];
    };
    var SpecialType = typical(schema$8, NoState.init, getKeydownRules$5, getKeyupRules$5, function (specialInfo) {
      return specialInfo.focusIn;
    });

    var acyclic = AcyclicType.schema();
    var cyclic = CyclicType.schema();
    var flow = FlowType.schema();
    var flatgrid$1 = FlatgridType.schema();
    var matrix = MatrixType.schema();
    var execution = ExecutionType.schema();
    var menu = MenuType.schema();
    var special = SpecialType.schema();

    var KeyboardBranches = /*#__PURE__*/Object.freeze({
        acyclic: acyclic,
        cyclic: cyclic,
        flow: flow,
        flatgrid: flatgrid$1,
        matrix: matrix,
        execution: execution,
        menu: menu,
        special: special
    });

    var Keying = createModes$1({
      branchKey: 'mode',
      branches: KeyboardBranches,
      name: 'keying',
      active: {
        events: function (keyingConfig, keyingState) {
          var handler = keyingConfig.handler;
          return handler.toEvents(keyingConfig, keyingState);
        }
      },
      apis: {
        focusIn: function (component, keyConfig, keyState) {
          keyConfig.sendFocusIn(keyConfig).fold(function () {
            component.getSystem().triggerFocus(component.element(), component.element());
          }, function (sendFocusIn) {
            sendFocusIn(component, keyConfig, keyState);
          });
        },
        setGridSize: function (component, keyConfig, keyState, numRows, numColumns) {
          if (!hasKey$1(keyState, 'setGridSize')) {
            console.error('Layout does not support setGridSize');
          } else {
            keyState.setGridSize(numRows, numColumns);
          }
        }
      },
      state: KeyingState
    });

    var preserve$2 = function (f, container) {
      var ownerDoc = owner(container);
      var refocus = active(ownerDoc).bind(function (focused) {
        var hasFocus$$1 = function (elem) {
          return eq(focused, elem);
        };
        return hasFocus$$1(container) ? Option.some(container) : descendant(container, hasFocus$$1);
      });
      var result = f(container);
      refocus.each(function (oldFocus) {
        active(ownerDoc).filter(function (newFocus) {
          return eq(newFocus, oldFocus);
        }).fold(function () {
          focus$2(oldFocus);
        }, noop);
      });
      return result;
    };

    var set$7 = function (component, replaceConfig, replaceState, data) {
      detachChildren(component);
      preserve$2(function () {
        var children = map(data, component.getSystem().build);
        each(children, function (l) {
          attach(component, l);
        });
      }, component.element());
    };
    var insert = function (component, replaceConfig, insertion, childSpec) {
      var child = component.getSystem().build(childSpec);
      attachWith(component, child, insertion);
    };
    var append$2 = function (component, replaceConfig, replaceState, appendee) {
      insert(component, replaceConfig, append, appendee);
    };
    var prepend$2 = function (component, replaceConfig, replaceState, prependee) {
      insert(component, replaceConfig, prepend, prependee);
    };
    var remove$7 = function (component, replaceConfig, replaceState, removee) {
      var children = contents(component, replaceConfig);
      var foundChild = find(children, function (child) {
        return eq(removee.element(), child.element());
      });
      foundChild.each(detach);
    };
    var contents = function (component, replaceConfig) {
      return component.components();
    };
    var replaceAt = function (component, replaceConfig, replaceState, replaceeIndex, replacer) {
      var children = contents(component, replaceConfig);
      return Option.from(children[replaceeIndex]).map(function (replacee) {
        remove$7(component, replaceConfig, replaceState, replacee);
        replacer.each(function (r) {
          insert(component, replaceConfig, function (p, c) {
            appendAt(p, c, replaceeIndex);
          }, r);
        });
        return replacee;
      });
    };
    var replaceBy = function (component, replaceConfig, replaceState, replaceePred, replacer) {
      var children = contents(component, replaceConfig);
      return findIndex(children, replaceePred).bind(function (replaceeIndex) {
        return replaceAt(component, replaceConfig, replaceState, replaceeIndex, replacer);
      });
    };

    var ReplaceApis = /*#__PURE__*/Object.freeze({
        append: append$2,
        prepend: prepend$2,
        remove: remove$7,
        replaceAt: replaceAt,
        replaceBy: replaceBy,
        set: set$7,
        contents: contents
    });

    var Replacing = create$1({
      fields: [],
      name: 'replacing',
      apis: ReplaceApis
    });

    var onLoad = function (component, repConfig, repState) {
      repConfig.store.manager.onLoad(component, repConfig, repState);
    };
    var onUnload = function (component, repConfig, repState) {
      repConfig.store.manager.onUnload(component, repConfig, repState);
    };
    var setValue = function (component, repConfig, repState, data) {
      repConfig.store.manager.setValue(component, repConfig, repState, data);
    };
    var getValue = function (component, repConfig, repState) {
      return repConfig.store.manager.getValue(component, repConfig, repState);
    };
    var getState$1 = function (component, repConfig, repState) {
      return repState;
    };

    var RepresentApis = /*#__PURE__*/Object.freeze({
        onLoad: onLoad,
        onUnload: onUnload,
        setValue: setValue,
        getValue: getValue,
        getState: getState$1
    });

    var events$3 = function (repConfig, repState) {
      var es = repConfig.resetOnDom ? [
        runOnAttached(function (comp, se) {
          onLoad(comp, repConfig, repState);
        }),
        runOnDetached(function (comp, se) {
          onUnload(comp, repConfig, repState);
        })
      ] : [loadEvent(repConfig, repState, onLoad)];
      return derive(es);
    };

    var ActiveRepresenting = /*#__PURE__*/Object.freeze({
        events: events$3
    });

    var memory = function () {
      var data = Cell(null);
      var readState = function () {
        return {
          mode: 'memory',
          value: data.get()
        };
      };
      var isNotSet = function () {
        return data.get() === null;
      };
      var clear = function () {
        data.set(null);
      };
      return nu$5({
        set: data.set,
        get: data.get,
        isNotSet: isNotSet,
        clear: clear,
        readState: readState
      });
    };
    var manual = function () {
      var readState = function () {
      };
      return nu$5({ readState: readState });
    };
    var dataset = function () {
      var dataByValue = Cell({});
      var dataByText = Cell({});
      var readState = function () {
        return {
          mode: 'dataset',
          dataByValue: dataByValue.get(),
          dataByText: dataByText.get()
        };
      };
      var clear = function () {
        dataByValue.set({});
        dataByText.set({});
      };
      var lookup = function (itemString) {
        return readOptFrom$1(dataByValue.get(), itemString).orThunk(function () {
          return readOptFrom$1(dataByText.get(), itemString);
        });
      };
      var update = function (items) {
        var currentDataByValue = dataByValue.get();
        var currentDataByText = dataByText.get();
        var newDataByValue = {};
        var newDataByText = {};
        each(items, function (item) {
          newDataByValue[item.value] = item;
          readOptFrom$1(item, 'meta').each(function (meta) {
            readOptFrom$1(meta, 'text').each(function (text) {
              newDataByText[text] = item;
            });
          });
        });
        dataByValue.set(__assign({}, currentDataByValue, newDataByValue));
        dataByText.set(__assign({}, currentDataByText, newDataByText));
      };
      return nu$5({
        readState: readState,
        lookup: lookup,
        update: update,
        clear: clear
      });
    };
    var init$2 = function (spec) {
      return spec.store.manager.state(spec);
    };

    var RepresentState = /*#__PURE__*/Object.freeze({
        memory: memory,
        dataset: dataset,
        manual: manual,
        init: init$2
    });

    var setValue$1 = function (component, repConfig, repState, data) {
      var store = repConfig.store;
      repState.update([data]);
      store.setValue(component, data);
      repConfig.onSetValue(component, data);
    };
    var getValue$1 = function (component, repConfig, repState) {
      var store = repConfig.store;
      var key = store.getDataKey(component);
      return repState.lookup(key).fold(function () {
        return store.getFallbackEntry(key);
      }, function (data) {
        return data;
      });
    };
    var onLoad$1 = function (component, repConfig, repState) {
      var store = repConfig.store;
      store.initialValue.each(function (data) {
        setValue$1(component, repConfig, repState, data);
      });
    };
    var onUnload$1 = function (component, repConfig, repState) {
      repState.clear();
    };
    var DatasetStore = [
      option('initialValue'),
      strict$1('getFallbackEntry'),
      strict$1('getDataKey'),
      strict$1('setValue'),
      output$1('manager', {
        setValue: setValue$1,
        getValue: getValue$1,
        onLoad: onLoad$1,
        onUnload: onUnload$1,
        state: dataset
      })
    ];

    var getValue$2 = function (component, repConfig, repState) {
      return repConfig.store.getValue(component);
    };
    var setValue$2 = function (component, repConfig, repState, data) {
      repConfig.store.setValue(component, data);
      repConfig.onSetValue(component, data);
    };
    var onLoad$2 = function (component, repConfig, repState) {
      repConfig.store.initialValue.each(function (data) {
        repConfig.store.setValue(component, data);
      });
    };
    var ManualStore = [
      strict$1('getValue'),
      defaulted$1('setValue', noop),
      option('initialValue'),
      output$1('manager', {
        setValue: setValue$2,
        getValue: getValue$2,
        onLoad: onLoad$2,
        onUnload: noop,
        state: NoState.init
      })
    ];

    var setValue$3 = function (component, repConfig, repState, data) {
      repState.set(data);
      repConfig.onSetValue(component, data);
    };
    var getValue$3 = function (component, repConfig, repState) {
      return repState.get();
    };
    var onLoad$3 = function (component, repConfig, repState) {
      repConfig.store.initialValue.each(function (initVal) {
        if (repState.isNotSet()) {
          repState.set(initVal);
        }
      });
    };
    var onUnload$2 = function (component, repConfig, repState) {
      repState.clear();
    };
    var MemoryStore = [
      option('initialValue'),
      output$1('manager', {
        setValue: setValue$3,
        getValue: getValue$3,
        onLoad: onLoad$3,
        onUnload: onUnload$2,
        state: memory
      })
    ];

    var RepresentSchema = [
      defaultedOf('store', { mode: 'memory' }, choose$1('mode', {
        memory: MemoryStore,
        manual: ManualStore,
        dataset: DatasetStore
      })),
      onHandler('onSetValue'),
      defaulted$1('resetOnDom', false)
    ];

    var Representing = create$1({
      fields: RepresentSchema,
      name: 'representing',
      active: ActiveRepresenting,
      apis: RepresentApis,
      extra: {
        setValueFrom: function (component, source) {
          var value = Representing.getValue(source);
          Representing.setValue(component, value);
        }
      },
      state: RepresentState
    });

    var focus$3 = function (component, focusConfig) {
      if (!focusConfig.ignore) {
        focus$2(component.element());
        focusConfig.onFocus(component);
      }
    };
    var blur$1 = function (component, focusConfig) {
      if (!focusConfig.ignore) {
        blur$$1(component.element());
      }
    };
    var isFocused = function (component) {
      return hasFocus(component.element());
    };

    var FocusApis = /*#__PURE__*/Object.freeze({
        focus: focus$3,
        blur: blur$1,
        isFocused: isFocused
    });

    var exhibit$1 = function (base, focusConfig) {
      var mod = focusConfig.ignore ? {} : { attributes: { tabindex: '-1' } };
      return nu$6(mod);
    };
    var events$4 = function (focusConfig) {
      return derive([run(focus$1(), function (component, simulatedEvent) {
          focus$3(component, focusConfig);
          simulatedEvent.stop();
        })].concat(focusConfig.stopMousedown ? [run(mousedown(), function (_, simulatedEvent) {
          simulatedEvent.event().prevent();
        })] : []));
    };

    var ActiveFocus = /*#__PURE__*/Object.freeze({
        exhibit: exhibit$1,
        events: events$4
    });

    var FocusSchema = [
      onHandler('onFocus'),
      defaulted$1('stopMousedown', false),
      defaulted$1('ignore', false)
    ];

    var Focusing = create$1({
      fields: FocusSchema,
      name: 'focusing',
      active: ActiveFocus,
      apis: FocusApis
    });

    var updateAriaState = function (component, toggleConfig, toggleState) {
      var ariaInfo = toggleConfig.aria;
      ariaInfo.update(component, ariaInfo, toggleState.get());
    };
    var updateClass = function (component, toggleConfig, toggleState) {
      toggleConfig.toggleClass.each(function (toggleClass) {
        if (toggleState.get()) {
          add$2(component.element(), toggleClass);
        } else {
          remove$4(component.element(), toggleClass);
        }
      });
    };
    var toggle$3 = function (component, toggleConfig, toggleState) {
      set$8(component, toggleConfig, toggleState, !toggleState.get());
    };
    var on$1 = function (component, toggleConfig, toggleState) {
      toggleState.set(true);
      updateClass(component, toggleConfig, toggleState);
      updateAriaState(component, toggleConfig, toggleState);
    };
    var off = function (component, toggleConfig, toggleState) {
      toggleState.set(false);
      updateClass(component, toggleConfig, toggleState);
      updateAriaState(component, toggleConfig, toggleState);
    };
    var set$8 = function (component, toggleConfig, toggleState, state) {
      var action = state ? on$1 : off;
      action(component, toggleConfig, toggleState);
    };
    var isOn = function (component, toggleConfig, toggleState) {
      return toggleState.get();
    };
    var onLoad$4 = function (component, toggleConfig, toggleState) {
      set$8(component, toggleConfig, toggleState, toggleConfig.selected);
    };

    var ToggleApis = /*#__PURE__*/Object.freeze({
        onLoad: onLoad$4,
        toggle: toggle$3,
        isOn: isOn,
        on: on$1,
        off: off,
        set: set$8
    });

    var exhibit$2 = function (base, toggleConfig, toggleState) {
      return nu$6({});
    };
    var events$5 = function (toggleConfig, toggleState) {
      var execute = executeEvent(toggleConfig, toggleState, toggle$3);
      var load = loadEvent(toggleConfig, toggleState, onLoad$4);
      return derive(flatten([
        toggleConfig.toggleOnExecute ? [execute] : [],
        [load]
      ]));
    };

    var ActiveToggle = /*#__PURE__*/Object.freeze({
        exhibit: exhibit$2,
        events: events$5
    });

    var init$3 = function (spec) {
      var cell = Cell(false);
      var set = function (state) {
        return cell.set(state);
      };
      var clear = function () {
        return cell.set(false);
      };
      var get = function () {
        return cell.get();
      };
      var readState = function () {
        return cell.get();
      };
      return {
        readState: readState,
        get: get,
        set: set,
        clear: clear
      };
    };

    var TogglingState = /*#__PURE__*/Object.freeze({
        init: init$3
    });

    var updatePressed = function (component, ariaInfo, status) {
      set$1(component.element(), 'aria-pressed', status);
      if (ariaInfo.syncWithExpanded) {
        updateExpanded(component, ariaInfo, status);
      }
    };
    var updateSelected = function (component, ariaInfo, status) {
      set$1(component.element(), 'aria-selected', status);
    };
    var updateChecked = function (component, ariaInfo, status) {
      set$1(component.element(), 'aria-checked', status);
    };
    var updateExpanded = function (component, ariaInfo, status) {
      set$1(component.element(), 'aria-expanded', status);
    };

    var ToggleSchema = [
      defaulted$1('selected', false),
      option('toggleClass'),
      defaulted$1('toggleOnExecute', true),
      defaultedOf('aria', { mode: 'none' }, choose$1('mode', {
        pressed: [
          defaulted$1('syncWithExpanded', false),
          output$1('update', updatePressed)
        ],
        checked: [output$1('update', updateChecked)],
        expanded: [output$1('update', updateExpanded)],
        selected: [output$1('update', updateSelected)],
        none: [output$1('update', noop)]
      }))
    ];

    var Toggling = create$1({
      fields: ToggleSchema,
      name: 'toggling',
      active: ActiveToggle,
      apis: ToggleApis,
      state: TogglingState
    });

    var hoverEvent = 'alloy.item-hover';
    var focusEvent = 'alloy.item-focus';
    var onHover = function (item) {
      if (search$1(item.element()).isNone() || Focusing.isFocused(item)) {
        if (!Focusing.isFocused(item)) {
          Focusing.focus(item);
        }
        emitWith(item, hoverEvent, { item: item });
      }
    };
    var onFocus = function (item) {
      emitWith(item, focusEvent, { item: item });
    };
    var hover = constant(hoverEvent);
    var focus$4 = constant(focusEvent);

    var events$6 = function (name, eventHandlers) {
      var events = derive(eventHandlers);
      return create$1({
        fields: [strict$1('enabled')],
        name: name,
        active: { events: constant(events) }
      });
    };
    var config = function (name, eventHandlers) {
      var me = events$6(name, eventHandlers);
      return {
        key: name,
        value: {
          config: {},
          me: me,
          configAsRaw: constant({}),
          initialConfig: {},
          state: NoState
        }
      };
    };

    var builder = function (detail) {
      return {
        dom: detail.dom,
        domModification: __assign({}, detail.domModification, { attributes: __assign({ 'role': detail.toggling.isSome() ? 'menuitemcheckbox' : 'menuitem' }, detail.domModification.attributes, { 'aria-haspopup': detail.hasSubmenu }, detail.hasSubmenu ? { 'aria-expanded': false } : {}) }),
        behaviours: SketchBehaviours.augment(detail.itemBehaviours, [
          detail.toggling.fold(Toggling.revoke, function (tConfig) {
            return Toggling.config(__assign({ aria: { mode: 'checked' } }, tConfig));
          }),
          Focusing.config({
            ignore: detail.ignoreFocus,
            stopMousedown: detail.ignoreFocus,
            onFocus: function (component) {
              onFocus(component);
            }
          }),
          Keying.config({ mode: 'execution' }),
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: detail.data
            }
          }),
          config('item-type-events', [
            run(tapOrClick(), emitExecute),
            cutter(mousedown()),
            run(mouseover(), onHover),
            run(focusItem(), Focusing.focus)
          ])
        ]),
        components: detail.components,
        eventOrder: detail.eventOrder
      };
    };
    var schema$9 = [
      strict$1('data'),
      strict$1('components'),
      strict$1('dom'),
      defaulted$1('hasSubmenu', false),
      option('toggling'),
      SketchBehaviours.field('itemBehaviours', [
        Toggling,
        Focusing,
        Keying,
        Representing
      ]),
      defaulted$1('ignoreFocus', false),
      defaulted$1('domModification', {}),
      output$1('builder', builder),
      defaulted$1('eventOrder', {})
    ];

    var builder$1 = function (detail) {
      return {
        dom: detail.dom,
        components: detail.components,
        events: derive([stopper(focusItem())])
      };
    };
    var schema$a = [
      strict$1('dom'),
      strict$1('components'),
      output$1('builder', builder$1)
    ];

    var owner$2 = function () {
      return 'item-widget';
    };
    var parts = constant([required({
        name: 'widget',
        overrides: function (detail) {
          return {
            behaviours: derive$1([Representing.config({
                store: {
                  mode: 'manual',
                  getValue: function (component) {
                    return detail.data;
                  },
                  setValue: function () {
                  }
                }
              })])
          };
        }
      })]);

    var builder$2 = function (detail) {
      var subs = substitutes(owner$2(), detail, parts());
      var components$$1 = components(owner$2(), detail, subs.internals());
      var focusWidget = function (component) {
        return getPart(component, detail, 'widget').map(function (widget) {
          Keying.focusIn(widget);
          return widget;
        });
      };
      var onHorizontalArrow = function (component, simulatedEvent) {
        return inside(simulatedEvent.event().target()) ? Option.none() : function () {
          if (detail.autofocus) {
            simulatedEvent.setSource(component.element());
            return Option.none();
          } else {
            return Option.none();
          }
        }();
      };
      return {
        dom: detail.dom,
        components: components$$1,
        domModification: detail.domModification,
        events: derive([
          runOnExecute(function (component, simulatedEvent) {
            focusWidget(component).each(function (widget) {
              simulatedEvent.stop();
            });
          }),
          run(mouseover(), onHover),
          run(focusItem(), function (component, simulatedEvent) {
            if (detail.autofocus) {
              focusWidget(component);
            } else {
              Focusing.focus(component);
            }
          })
        ]),
        behaviours: SketchBehaviours.augment(detail.widgetBehaviours, [
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: detail.data
            }
          }),
          Focusing.config({
            ignore: detail.ignoreFocus,
            onFocus: function (component) {
              onFocus(component);
            }
          }),
          Keying.config({
            mode: 'special',
            focusIn: detail.autofocus ? function (component) {
              focusWidget(component);
            } : revoke$1(),
            onLeft: onHorizontalArrow,
            onRight: onHorizontalArrow,
            onEscape: function (component, simulatedEvent) {
              if (!Focusing.isFocused(component) && !detail.autofocus) {
                Focusing.focus(component);
                return Option.some(true);
              } else if (detail.autofocus) {
                simulatedEvent.setSource(component.element());
                return Option.none();
              } else {
                return Option.none();
              }
            }
          })
        ])
      };
    };
    var schema$b = [
      strict$1('uid'),
      strict$1('data'),
      strict$1('components'),
      strict$1('dom'),
      defaulted$1('autofocus', false),
      defaulted$1('ignoreFocus', false),
      SketchBehaviours.field('widgetBehaviours', [
        Representing,
        Focusing,
        Keying
      ]),
      defaulted$1('domModification', {}),
      defaultUidsSchema(parts()),
      output$1('builder', builder$2)
    ];

    var itemSchema$1 = choose$1('type', {
      widget: schema$b,
      item: schema$9,
      separator: schema$a
    });
    var configureGrid = function (detail, movementInfo) {
      return {
        mode: 'flatgrid',
        selector: '.' + detail.markers.item,
        initSize: {
          numColumns: movementInfo.initSize.numColumns,
          numRows: movementInfo.initSize.numRows
        },
        focusManager: detail.focusManager
      };
    };
    var configureMatrix = function (detail, movementInfo) {
      return {
        mode: 'matrix',
        selectors: {
          row: movementInfo.rowSelector,
          cell: '.' + detail.markers.item
        },
        focusManager: detail.focusManager
      };
    };
    var configureMenu = function (detail, movementInfo) {
      return {
        mode: 'menu',
        selector: '.' + detail.markers.item,
        moveOnTab: movementInfo.moveOnTab,
        focusManager: detail.focusManager
      };
    };
    var parts$1 = constant([group({
        factory: {
          sketch: function (spec) {
            var itemInfo = asRawOrDie('menu.spec item', itemSchema$1, spec);
            return itemInfo.builder(itemInfo);
          }
        },
        name: 'items',
        unit: 'item',
        defaults: function (detail, u) {
          return u.hasOwnProperty('uid') ? u : __assign({}, u, { uid: generate$2('item') });
        },
        overrides: function (detail, u) {
          return {
            type: u.type,
            ignoreFocus: detail.fakeFocus,
            domModification: { classes: [detail.markers.item] }
          };
        }
      })]);
    var schema$c = constant([
      strict$1('value'),
      strict$1('items'),
      strict$1('dom'),
      strict$1('components'),
      defaulted$1('eventOrder', {}),
      field$1('menuBehaviours', [
        Highlighting,
        Representing,
        Composing,
        Keying
      ]),
      defaultedOf('movement', {
        mode: 'menu',
        moveOnTab: true
      }, choose$1('mode', {
        grid: [
          initSize(),
          output$1('config', configureGrid)
        ],
        matrix: [
          output$1('config', configureMatrix),
          strict$1('rowSelector')
        ],
        menu: [
          defaulted$1('moveOnTab', true),
          output$1('config', configureMenu)
        ]
      })),
      itemMarkers(),
      defaulted$1('fakeFocus', false),
      defaulted$1('focusManager', dom()),
      onHandler('onHighlight')
    ]);

    var focus$5 = constant('alloy.menu-focus');

    var make$1 = function (detail, components, spec, externals) {
      return {
        uid: detail.uid,
        dom: detail.dom,
        markers: detail.markers,
        behaviours: augment(detail.menuBehaviours, [
          Highlighting.config({
            highlightClass: detail.markers.selectedItem,
            itemClass: detail.markers.item,
            onHighlight: detail.onHighlight
          }),
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: detail.value
            }
          }),
          Composing.config({ find: Option.some }),
          Keying.config(detail.movement.config(detail, detail.movement))
        ]),
        events: derive([
          run(focus$4(), function (menu, simulatedEvent) {
            var event = simulatedEvent.event();
            menu.getSystem().getByDom(event.target()).each(function (item) {
              Highlighting.highlight(menu, item);
              simulatedEvent.stop();
              emitWith(menu, focus$5(), {
                menu: menu,
                item: item
              });
            });
          }),
          run(hover(), function (menu, simulatedEvent) {
            var item = simulatedEvent.event().item();
            Highlighting.highlight(menu, item);
          })
        ]),
        components: components,
        eventOrder: detail.eventOrder,
        domModification: { attributes: { role: 'menu' } }
      };
    };

    var Menu = composite$1({
      name: 'Menu',
      configFields: schema$c(),
      partFields: parts$1(),
      factory: make$1
    });

    var transpose = function (obj) {
      return tupleMap(obj, function (v, k) {
        return {
          k: v,
          v: k
        };
      });
    };
    var trace = function (items, byItem, byMenu, finish) {
      return readOptFrom$1(byMenu, finish).bind(function (triggerItem) {
        return readOptFrom$1(items, triggerItem).bind(function (triggerMenu) {
          var rest = trace(items, byItem, byMenu, triggerMenu);
          return Option.some([triggerMenu].concat(rest));
        });
      }).getOr([]);
    };
    var generate$5 = function (menus, expansions) {
      var items = {};
      each$1(menus, function (menuItems, menu) {
        each(menuItems, function (item) {
          items[item] = menu;
        });
      });
      var byItem = expansions;
      var byMenu = transpose(expansions);
      var menuPaths = map$1(byMenu, function (_triggerItem, submenu) {
        return [submenu].concat(trace(items, byItem, byMenu, submenu));
      });
      return map$1(items, function (menu) {
        return readOptFrom$1(menuPaths, menu).getOr([menu]);
      });
    };

    var init$4 = function () {
      var expansions = Cell({});
      var menus = Cell({});
      var paths = Cell({});
      var primary = Cell(Option.none());
      var directory = Cell({});
      var clear = function () {
        expansions.set({});
        menus.set({});
        paths.set({});
        primary.set(Option.none());
      };
      var isClear = function () {
        return primary.get().isNone();
      };
      var setMenuBuilt = function (menuName, built) {
        var _a;
        menus.set(__assign({}, menus.get(), (_a = {}, _a[menuName] = {
          type: 'prepared',
          menu: built
        }, _a)));
      };
      var setContents = function (sPrimary, sMenus, sExpansions, dir) {
        primary.set(Option.some(sPrimary));
        expansions.set(sExpansions);
        menus.set(sMenus);
        directory.set(dir);
        var sPaths = generate$5(dir, sExpansions);
        paths.set(sPaths);
      };
      var expand = function (itemValue) {
        return readOptFrom$1(expansions.get(), itemValue).map(function (menu) {
          var current = readOptFrom$1(paths.get(), itemValue).getOr([]);
          return [menu].concat(current);
        });
      };
      var collapse = function (itemValue) {
        return readOptFrom$1(paths.get(), itemValue).bind(function (path) {
          return path.length > 1 ? Option.some(path.slice(1)) : Option.none();
        });
      };
      var refresh = function (itemValue) {
        return readOptFrom$1(paths.get(), itemValue);
      };
      var lookupMenu = function (menuValue) {
        return readOptFrom$1(menus.get(), menuValue);
      };
      var otherMenus = function (path) {
        var menuValues = directory.get();
        return difference(keys(menuValues), path);
      };
      var getPrimary = function () {
        return primary.get().bind(function (primaryName) {
          return lookupMenu(primaryName).bind(function (prep) {
            return prep.type === 'prepared' ? Option.some(prep.menu) : Option.none();
          });
        });
      };
      var getMenus = function () {
        return menus.get();
      };
      return {
        setMenuBuilt: setMenuBuilt,
        setContents: setContents,
        expand: expand,
        refresh: refresh,
        collapse: collapse,
        lookupMenu: lookupMenu,
        otherMenus: otherMenus,
        getPrimary: getPrimary,
        getMenus: getMenus,
        clear: clear,
        isClear: isClear
      };
    };
    var LayeredState = { init: init$4 };

    var make$2 = function (detail, rawUiSpec) {
      var submenuParentItems = Cell(Option.none());
      var buildMenus = function (container, primaryName, menus) {
        return map$1(menus, function (spec, name) {
          var makeSketch = function () {
            return Menu.sketch(__assign({ dom: spec.dom }, spec, {
              value: name,
              items: spec.items,
              markers: detail.markers,
              fakeFocus: detail.fakeFocus,
              onHighlight: detail.onHighlight,
              focusManager: detail.fakeFocus ? highlights() : dom()
            }));
          };
          return name === primaryName ? {
            type: 'prepared',
            menu: container.getSystem().build(makeSketch())
          } : {
            type: 'notbuilt',
            nbMenu: makeSketch
          };
        });
      };
      var layeredState = LayeredState.init();
      var setup = function (container) {
        var componentMap = buildMenus(container, detail.data.primary, detail.data.menus);
        var directory = toDirectory(container);
        layeredState.setContents(detail.data.primary, componentMap, detail.data.expansions, directory);
        return layeredState.getPrimary();
      };
      var getItemValue = function (item) {
        return Representing.getValue(item).value;
      };
      var toDirectory = function (container) {
        return map$1(detail.data.menus, function (data, menuName) {
          return bind(data.items, function (item) {
            return item.type === 'separator' ? [] : [item.data.value];
          });
        });
      };
      var setActiveMenu = function (container, menu) {
        Highlighting.highlight(container, menu);
        Highlighting.getHighlighted(menu).orThunk(function () {
          return Highlighting.getFirst(menu);
        }).each(function (item) {
          dispatch(container, item.element(), focusItem());
        });
      };
      var getMenus = function (state, menuValues) {
        return cat(map(menuValues, function (mv) {
          return state.lookupMenu(mv).bind(function (prep) {
            return prep.type === 'prepared' ? Option.some(prep.menu) : Option.none();
          });
        }));
      };
      var closeOthers = function (container, state, path) {
        var others = getMenus(state, state.otherMenus(path));
        each(others, function (o) {
          remove$5(o.element(), [detail.markers.backgroundMenu]);
          if (!detail.stayInDom) {
            Replacing.remove(container, o);
          }
        });
      };
      var getSubmenuParents = function (container) {
        return submenuParentItems.get().getOrThunk(function () {
          var r = {};
          var items = descendants$1(container.element(), '.' + detail.markers.item);
          var parentItems = filter(items, function (i) {
            return get$2(i, 'aria-haspopup') === 'true';
          });
          each(parentItems, function (i) {
            container.getSystem().getByDom(i).each(function (itemComp) {
              var key = getItemValue(itemComp);
              r[key] = itemComp;
            });
          });
          submenuParentItems.set(Option.some(r));
          return r;
        });
      };
      var updateAriaExpansions = function (container, path) {
        var parentItems = getSubmenuParents(container);
        each$1(parentItems, function (v, k) {
          var expanded = contains(path, k);
          set$1(v.element(), 'aria-expanded', expanded);
        });
      };
      var updateMenuPath = function (container, state, path) {
        return Option.from(path[0]).bind(function (latestMenuName) {
          return state.lookupMenu(latestMenuName).bind(function (menuPrep) {
            if (menuPrep.type === 'notbuilt') {
              return Option.none();
            } else {
              var activeMenu = menuPrep.menu;
              var rest = getMenus(state, path.slice(1));
              each(rest, function (r) {
                add$2(r.element(), detail.markers.backgroundMenu);
              });
              if (!inBody(activeMenu.element())) {
                Replacing.append(container, premade$1(activeMenu));
              }
              remove$5(activeMenu.element(), [detail.markers.backgroundMenu]);
              setActiveMenu(container, activeMenu);
              closeOthers(container, state, path);
              return Option.some(activeMenu);
            }
          });
        });
      };
      var ExpandHighlightDecision;
      (function (ExpandHighlightDecision) {
        ExpandHighlightDecision[ExpandHighlightDecision['HighlightSubmenu'] = 0] = 'HighlightSubmenu';
        ExpandHighlightDecision[ExpandHighlightDecision['HighlightParent'] = 1] = 'HighlightParent';
      }(ExpandHighlightDecision || (ExpandHighlightDecision = {})));
      var buildIfRequired = function (container, menuName, menuPrep) {
        if (menuPrep.type === 'notbuilt') {
          var menu = container.getSystem().build(menuPrep.nbMenu());
          layeredState.setMenuBuilt(menuName, menu);
          return menu;
        } else {
          return menuPrep.menu;
        }
      };
      var expandRight = function (container, item, decision) {
        if (decision === void 0) {
          decision = ExpandHighlightDecision.HighlightSubmenu;
        }
        var value = getItemValue(item);
        return layeredState.expand(value).bind(function (path) {
          updateAriaExpansions(container, path);
          return Option.from(path[0]).bind(function (menuName) {
            return layeredState.lookupMenu(menuName).bind(function (activeMenuPrep) {
              var activeMenu = buildIfRequired(container, menuName, activeMenuPrep);
              if (!inBody(activeMenu.element())) {
                Replacing.append(container, premade$1(activeMenu));
              }
              detail.onOpenSubmenu(container, item, activeMenu);
              if (decision === ExpandHighlightDecision.HighlightSubmenu) {
                Highlighting.highlightFirst(activeMenu);
                return updateMenuPath(container, layeredState, path);
              } else {
                Highlighting.dehighlightAll(activeMenu);
                return Option.some(item);
              }
            });
          });
        });
      };
      var collapseLeft = function (container, item) {
        var value = getItemValue(item);
        return layeredState.collapse(value).bind(function (path) {
          updateAriaExpansions(container, path);
          return updateMenuPath(container, layeredState, path).map(function (activeMenu) {
            detail.onCollapseMenu(container, item, activeMenu);
            return activeMenu;
          });
        });
      };
      var updateView = function (container, item) {
        var value = getItemValue(item);
        return layeredState.refresh(value).bind(function (path) {
          updateAriaExpansions(container, path);
          return updateMenuPath(container, layeredState, path);
        });
      };
      var onRight = function (container, item) {
        return inside(item.element()) ? Option.none() : expandRight(container, item, ExpandHighlightDecision.HighlightSubmenu);
      };
      var onLeft = function (container, item) {
        return inside(item.element()) ? Option.none() : collapseLeft(container, item);
      };
      var onEscape = function (container, item) {
        return collapseLeft(container, item).orThunk(function () {
          return detail.onEscape(container, item).map(function () {
            return container;
          });
        });
      };
      var keyOnItem = function (f) {
        return function (container, simulatedEvent) {
          return closest$3(simulatedEvent.getSource(), '.' + detail.markers.item).bind(function (target) {
            return container.getSystem().getByDom(target).toOption().bind(function (item) {
              return f(container, item).map(function () {
                return true;
              });
            });
          });
        };
      };
      var events = derive([
        run(focus$5(), function (sandbox, simulatedEvent) {
          var menu = simulatedEvent.event().menu();
          Highlighting.highlight(sandbox, menu);
          var value = getItemValue(simulatedEvent.event().item());
          layeredState.refresh(value).each(function (path) {
            return closeOthers(sandbox, layeredState, path);
          });
        }),
        runOnExecute(function (component, simulatedEvent) {
          var target = simulatedEvent.event().target();
          component.getSystem().getByDom(target).each(function (item) {
            var itemValue = getItemValue(item);
            if (itemValue.indexOf('collapse-item') === 0) {
              collapseLeft(component, item);
            }
            expandRight(component, item, ExpandHighlightDecision.HighlightSubmenu).fold(function () {
              detail.onExecute(component, item);
            }, function () {
            });
          });
        }),
        runOnAttached(function (container, simulatedEvent) {
          setup(container).each(function (primary) {
            Replacing.append(container, premade$1(primary));
            detail.onOpenMenu(container, primary);
            if (detail.highlightImmediately) {
              setActiveMenu(container, primary);
            }
          });
        })
      ].concat(detail.navigateOnHover ? [run(hover(), function (sandbox, simulatedEvent) {
          var item = simulatedEvent.event().item();
          updateView(sandbox, item);
          expandRight(sandbox, item, ExpandHighlightDecision.HighlightParent);
          detail.onHover(sandbox, item);
        })] : []));
      var collapseMenuApi = function (container) {
        Highlighting.getHighlighted(container).each(function (currentMenu) {
          Highlighting.getHighlighted(currentMenu).each(function (currentItem) {
            collapseLeft(container, currentItem);
          });
        });
      };
      var highlightPrimary = function (container) {
        layeredState.getPrimary().each(function (primary) {
          setActiveMenu(container, primary);
        });
      };
      var apis = {
        collapseMenu: collapseMenuApi,
        highlightPrimary: highlightPrimary
      };
      return {
        uid: detail.uid,
        dom: detail.dom,
        markers: detail.markers,
        behaviours: augment(detail.tmenuBehaviours, [
          Keying.config({
            mode: 'special',
            onRight: keyOnItem(onRight),
            onLeft: keyOnItem(onLeft),
            onEscape: keyOnItem(onEscape),
            focusIn: function (container, keyInfo) {
              layeredState.getPrimary().each(function (primary) {
                dispatch(container, primary.element(), focusItem());
              });
            }
          }),
          Highlighting.config({
            highlightClass: detail.markers.selectedMenu,
            itemClass: detail.markers.menu
          }),
          Composing.config({
            find: function (container) {
              return Highlighting.getHighlighted(container);
            }
          }),
          Replacing.config({})
        ]),
        eventOrder: detail.eventOrder,
        apis: apis,
        events: events
      };
    };
    var collapseItem = constant('collapse-item');

    var tieredData = function (primary, menus, expansions) {
      return {
        primary: primary,
        menus: menus,
        expansions: expansions
      };
    };
    var singleData = function (name, menu) {
      return {
        primary: name,
        menus: wrap$1(name, menu),
        expansions: {}
      };
    };
    var collapseItem$1 = function (text) {
      return {
        value: generate$1(collapseItem()),
        meta: { text: text }
      };
    };
    var tieredMenu = single$2({
      name: 'TieredMenu',
      configFields: [
        onStrictKeyboardHandler('onExecute'),
        onStrictKeyboardHandler('onEscape'),
        onStrictHandler('onOpenMenu'),
        onStrictHandler('onOpenSubmenu'),
        onHandler('onCollapseMenu'),
        defaulted$1('highlightImmediately', true),
        strictObjOf('data', [
          strict$1('primary'),
          strict$1('menus'),
          strict$1('expansions')
        ]),
        defaulted$1('fakeFocus', false),
        onHandler('onHighlight'),
        onHandler('onHover'),
        tieredMenuMarkers(),
        strict$1('dom'),
        defaulted$1('navigateOnHover', true),
        defaulted$1('stayInDom', false),
        field$1('tmenuBehaviours', [
          Keying,
          Highlighting,
          Composing,
          Replacing
        ]),
        defaulted$1('eventOrder', {})
      ],
      apis: {
        collapseMenu: function (apis, tmenu) {
          apis.collapseMenu(tmenu);
        },
        highlightPrimary: function (apis, tmenu) {
          apis.highlightPrimary(tmenu);
        }
      },
      factory: make$2,
      extraApis: {
        tieredData: tieredData,
        singleData: singleData,
        collapseItem: collapseItem$1
      }
    });

    var makeMenu = function (detail, menuSandbox, anchor, menuSpec) {
      var lazySink = function () {
        return detail.lazySink(menuSandbox);
      };
      return tieredMenu.sketch({
        dom: { tag: 'div' },
        data: menuSpec.data,
        markers: menuSpec.menu.markers,
        onEscape: function () {
          Sandboxing.close(menuSandbox);
          detail.onEscape.map(function (handler) {
            return handler(menuSandbox);
          });
          return Option.some(true);
        },
        onExecute: function () {
          return Option.some(true);
        },
        onOpenMenu: function (tmenu, menu) {
          Positioning.position(lazySink().getOrDie(), anchor, menu);
        },
        onOpenSubmenu: function (tmenu, item, submenu) {
          var sink = lazySink().getOrDie();
          Positioning.position(sink, {
            anchor: 'submenu',
            item: item
          }, submenu);
        }
      });
    };
    var factory = function (detail, spec) {
      var isPartOfRelated = function (sandbox, queryElem) {
        var related = detail.getRelated(sandbox);
        return related.exists(function (rel) {
          return isPartOf(rel, queryElem);
        });
      };
      var setContent = function (sandbox, thing) {
        Sandboxing.open(sandbox, thing);
      };
      var showAt = function (sandbox, anchor, thing) {
        var getBounds = Option.none();
        showWithin(sandbox, anchor, thing, getBounds);
      };
      var showWithin = function (sandbox, anchor, thing, boxElement) {
        var sink = detail.lazySink(sandbox).getOrDie();
        Sandboxing.openWhileCloaked(sandbox, thing, function () {
          return Positioning.positionWithin(sink, anchor, sandbox, boxElement);
        });
        detail.onShow(sandbox);
      };
      var showMenuAt = function (sandbox, anchor, menuSpec) {
        var menu = makeMenu(detail, sandbox, anchor, menuSpec);
        Sandboxing.open(sandbox, menu);
        detail.onShow(sandbox);
      };
      var hide = function (sandbox) {
        Sandboxing.close(sandbox);
        detail.onHide(sandbox);
      };
      var getContent = function (sandbox) {
        return Sandboxing.getState(sandbox);
      };
      var apis = {
        setContent: setContent,
        showAt: showAt,
        showWithin: showWithin,
        showMenuAt: showMenuAt,
        hide: hide,
        getContent: getContent,
        isOpen: Sandboxing.isOpen
      };
      return {
        uid: detail.uid,
        dom: detail.dom,
        behaviours: augment(detail.inlineBehaviours, [
          Sandboxing.config({
            isPartOf: function (sandbox, data, queryElem) {
              return isPartOf(data, queryElem) || isPartOfRelated(sandbox, queryElem);
            },
            getAttachPoint: function (sandbox) {
              return detail.lazySink(sandbox).getOrDie();
            }
          }),
          receivingConfig(__assign({ isExtraPart: constant(false) }, detail.fireDismissalEventInstead.map(function (fe) {
            return { fireEventInstead: { event: fe.event } };
          }).getOr({})))
        ]),
        eventOrder: detail.eventOrder,
        apis: apis
      };
    };
    var InlineView = single$2({
      name: 'InlineView',
      configFields: [
        strict$1('lazySink'),
        onHandler('onShow'),
        onHandler('onHide'),
        optionFunction('onEscape'),
        field$1('inlineBehaviours', [
          Sandboxing,
          Receiving
        ]),
        optionObjOf('fireDismissalEventInstead', [defaulted$1('event', dismissRequested())]),
        defaulted$1('getRelated', Option.none),
        defaulted$1('eventOrder', Option.none)
      ],
      factory: factory,
      apis: {
        showAt: function (apis, component, anchor, thing) {
          apis.showAt(component, anchor, thing);
        },
        showWithin: function (apis, component, anchor, thing, boxElement) {
          apis.showWithin(component, anchor, thing, boxElement);
        },
        showMenuAt: function (apis, component, anchor, menuSpec) {
          apis.showMenuAt(component, anchor, menuSpec);
        },
        hide: function (apis, component) {
          apis.hide(component);
        },
        isOpen: function (apis, component) {
          return apis.isOpen(component);
        },
        getContent: function (apis, component) {
          return apis.getContent(component);
        },
        setContent: function (apis, component, thing) {
          apis.setContent(component, thing);
        }
      }
    });

    var events$7 = function (optAction) {
      var executeHandler = function (action) {
        return run(execute(), function (component, simulatedEvent) {
          action(component);
          simulatedEvent.stop();
        });
      };
      var onClick = function (component, simulatedEvent) {
        simulatedEvent.stop();
        emitExecute(component);
      };
      var onMousedown = function (component, simulatedEvent) {
        simulatedEvent.cut();
      };
      var pointerEvents = PlatformDetection$1.detect().deviceType.isTouch() ? [run(tap(), onClick)] : [
        run(click(), onClick),
        run(mousedown(), onMousedown)
      ];
      return derive(flatten([
        optAction.map(executeHandler).toArray(),
        pointerEvents
      ]));
    };

    var factory$1 = function (detail) {
      var events = events$7(detail.action);
      var tag = detail.dom.tag;
      var lookupAttr = function (attr) {
        return readOptFrom$1(detail.dom, 'attributes').bind(function (attrs) {
          return readOptFrom$1(attrs, attr);
        });
      };
      var getModAttributes = function () {
        if (tag === 'button') {
          var type = lookupAttr('type').getOr('button');
          var roleAttrs = lookupAttr('role').map(function (role) {
            return { role: role };
          }).getOr({});
          return __assign({ type: type }, roleAttrs);
        } else {
          var role = lookupAttr('role').getOr('button');
          return { role: role };
        }
      };
      return {
        uid: detail.uid,
        dom: detail.dom,
        components: detail.components,
        events: events,
        behaviours: SketchBehaviours.augment(detail.buttonBehaviours, [
          Focusing.config({}),
          Keying.config({
            mode: 'execution',
            useSpace: true,
            useEnter: true
          })
        ]),
        domModification: { attributes: getModAttributes() },
        eventOrder: detail.eventOrder
      };
    };
    var Button = single$2({
      name: 'Button',
      factory: factory$1,
      configFields: [
        defaulted$1('uid', undefined),
        strict$1('dom'),
        defaulted$1('components', []),
        SketchBehaviours.field('buttonBehaviours', [
          Focusing,
          Keying
        ]),
        option('action'),
        option('role'),
        defaulted$1('eventOrder', {})
      ]
    });

    var record = function (spec) {
      var uid = isSketchSpec(spec) && hasKey$1(spec, 'uid') ? spec.uid : generate$2('memento');
      var get = function (anyInSystem) {
        return anyInSystem.getSystem().getByUid(uid).getOrDie();
      };
      var getOpt = function (anyInSystem) {
        return anyInSystem.getSystem().getByUid(uid).fold(Option.none, Option.some);
      };
      var asSpec = function () {
        return __assign({}, spec, { uid: uid });
      };
      return {
        get: get,
        getOpt: getOpt,
        asSpec: asSpec
      };
    };

    var getAll = function () {
      return {
        'accessibility-check': '<svg width="24" height="24"><path d="M12 2a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2c0-1.1.9-2 2-2zm8 7h-5v12c0 .6-.4 1-1 1a1 1 0 0 1-1-1v-5c0-.6-.4-1-1-1a1 1 0 0 0-1 1v5c0 .6-.4 1-1 1a1 1 0 0 1-1-1V9H4a1 1 0 1 1 0-2h16c.6 0 1 .4 1 1s-.4 1-1 1z" fill-rule="nonzero"/></svg>',
        'align-center': '<svg width="24" height="24"><path d="M5 5h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 1 1 0-2zm3 4h8c.6 0 1 .4 1 1s-.4 1-1 1H8a1 1 0 1 1 0-2zm0 8h8c.6 0 1 .4 1 1s-.4 1-1 1H8a1 1 0 0 1 0-2zm-3-4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 0 1 0-2z" fill-rule="evenodd"/></svg>',
        'align-justify': '<svg width="24" height="24"><path d="M5 5h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 1 1 0-2zm0 4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 1 1 0-2zm0 4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 0 1 0-2zm0 4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 0 1 0-2z" fill-rule="evenodd"/></svg>',
        'align-left': '<svg width="24" height="24"><path d="M5 5h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 1 1 0-2zm0 4h8c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 1 1 0-2zm0 8h8c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 0 1 0-2zm0-4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 0 1 0-2z" fill-rule="evenodd"/></svg>',
        'align-none': '<svg width="24" height="24"><path d="M14.2 5L13 7H5a1 1 0 1 1 0-2h9.2zm4 0h.8a1 1 0 0 1 0 2h-2l1.2-2zm-6.4 4l-1.2 2H5a1 1 0 0 1 0-2h6.8zm4 0H19a1 1 0 0 1 0 2h-4.4l1.2-2zm-6.4 4l-1.2 2H5a1 1 0 0 1 0-2h4.4zm4 0H19a1 1 0 0 1 0 2h-6.8l1.2-2zM7 17l-1.2 2H5a1 1 0 0 1 0-2h2zm4 0h8a1 1 0 0 1 0 2H9.8l1.2-2zm5.2-13.5l1.3.7-9.7 16.3-1.3-.7 9.7-16.3z" fill-rule="evenodd"/></svg>',
        'align-right': '<svg width="24" height="24"><path d="M5 5h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 1 1 0-2zm6 4h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 0 1 0-2zm0 8h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 0 1 0-2zm-6-4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 0 1 0-2z" fill-rule="evenodd"/></svg>',
        'arrow-left': '<svg width="24" height="24"><path d="M5.6 13l12 6a1 1 0 0 0 1.4-1V6a1 1 0 0 0-1.4-.9l-12 6a1 1 0 0 0 0 1.8z" fill-rule="evenodd"/></svg>',
        'arrow-right': '<svg width="24" height="24"><path d="M18.5 13l-12 6A1 1 0 0 1 5 18V6a1 1 0 0 1 1.4-.9l12 6a1 1 0 0 1 0 1.8z" fill-rule="evenodd"/></svg>',
        'bold': '<svg width="24" height="24"><path d="M7.8 19c-.3 0-.5 0-.6-.2l-.2-.5V5.7c0-.2 0-.4.2-.5l.6-.2h5c1.5 0 2.7.3 3.5 1 .7.6 1.1 1.4 1.1 2.5a3 3 0 0 1-.6 1.9c-.4.6-1 1-1.6 1.2.4.1.9.3 1.3.6s.8.7 1 1.2c.4.4.5 1 .5 1.6 0 1.3-.4 2.3-1.3 3-.8.7-2.1 1-3.8 1H7.8zm5-8.3c.6 0 1.2-.1 1.6-.5.4-.3.6-.7.6-1.3 0-1.1-.8-1.7-2.3-1.7H9.3v3.5h3.4zm.5 6c.7 0 1.3-.1 1.7-.4.4-.4.6-.9.6-1.5s-.2-1-.7-1.4c-.4-.3-1-.4-2-.4H9.4v3.8h4z" fill-rule="evenodd"/></svg>',
        'bookmark': '<svg width="24" height="24"><path d="M6 4v17l6-4 6 4V4c0-.6-.4-1-1-1H7a1 1 0 0 0-1 1z" fill-rule="nonzero"/></svg>',
        'border-width': '<svg width="24" height="24"><path d="M5 14.8h14a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2zm-.5 3.7h15c.3 0 .5.2.5.5s-.2.5-.5.5h-15a.5.5 0 1 1 0-1zm.5-8.3h14c.6 0 1 .4 1 1v1c0 .5-.4 1-1 1H5a1 1 0 0 1-1-1v-1c0-.6.4-1 1-1zm0-5.7h14c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1H5a1 1 0 0 1-1-1v-2c0-.6.4-1 1-1z" fill-rule="evenodd"/></svg>',
        'brightness': '<svg width="24" height="24"><path d="M12 17c.3 0 .5.1.7.3.2.2.3.4.3.7v1c0 .3-.1.5-.3.7a1 1 0 0 1-.7.3 1 1 0 0 1-.7-.3 1 1 0 0 1-.3-.7v-1c0-.3.1-.5.3-.7.2-.2.4-.3.7-.3zm0-10a1 1 0 0 1-.7-.3A1 1 0 0 1 11 6V5c0-.3.1-.5.3-.7.2-.2.4-.3.7-.3.3 0 .5.1.7.3.2.2.3.4.3.7v1c0 .3-.1.5-.3.7a1 1 0 0 1-.7.3zm7 4c.3 0 .5.1.7.3.2.2.3.4.3.7 0 .3-.1.5-.3.7a1 1 0 0 1-.7.3h-1a1 1 0 0 1-.7-.3 1 1 0 0 1-.3-.7c0-.3.1-.5.3-.7.2-.2.4-.3.7-.3h1zM7 12c0 .3-.1.5-.3.7a1 1 0 0 1-.7.3H5a1 1 0 0 1-.7-.3A1 1 0 0 1 4 12c0-.3.1-.5.3-.7.2-.2.4-.3.7-.3h1c.3 0 .5.1.7.3.2.2.3.4.3.7zm10 3.5l.7.8c.2.1.3.4.3.6 0 .3-.1.6-.3.8a1 1 0 0 1-.8.3 1 1 0 0 1-.6-.3l-.8-.7a1 1 0 0 1-.3-.8c0-.2.1-.5.3-.7a1 1 0 0 1 1.4 0zm-10-7l-.7-.8a1 1 0 0 1-.3-.6c0-.3.1-.6.3-.8.2-.2.5-.3.8-.3.2 0 .5.1.7.3l.7.7c.2.2.3.5.3.8 0 .2-.1.5-.3.7a1 1 0 0 1-.7.3 1 1 0 0 1-.8-.3zm10 0a1 1 0 0 1-.8.3 1 1 0 0 1-.7-.3 1 1 0 0 1-.3-.7c0-.3.1-.6.3-.8l.8-.7c.1-.2.4-.3.6-.3.3 0 .6.1.8.3.2.2.3.5.3.8 0 .2-.1.5-.3.7l-.7.7zm-10 7c.2-.2.5-.3.8-.3.2 0 .5.1.7.3a1 1 0 0 1 0 1.4l-.8.8a1 1 0 0 1-.6.3 1 1 0 0 1-.8-.3 1 1 0 0 1-.3-.8c0-.2.1-.5.3-.6l.7-.8zM12 8a4 4 0 0 1 3.7 2.4 4 4 0 0 1 0 3.2A4 4 0 0 1 12 16a4 4 0 0 1-3.7-2.4 4 4 0 0 1 0-3.2A4 4 0 0 1 12 8zm0 6.5c.7 0 1.3-.2 1.8-.7.5-.5.7-1.1.7-1.8s-.2-1.3-.7-1.8c-.5-.5-1.1-.7-1.8-.7s-1.3.2-1.8.7c-.5.5-.7 1.1-.7 1.8s.2 1.3.7 1.8c.5.5 1.1.7 1.8.7z" fill-rule="evenodd"/></svg>',
        'browse': '<svg width="24" height="24"><path d="M19 4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4v-2h4V8H5v10h4v2H5a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h14zm-8 9.4l-2.3 2.3a1 1 0 1 1-1.4-1.4l4-4a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1-1.4 1.4L13 13.4V20a1 1 0 0 1-2 0v-6.6z" fill-rule="nonzero"/></svg>',
        'cancel': '<svg width="24" height="24"><path d="M12 4.6a7.4 7.4 0 1 1 0 14.8 7.4 7.4 0 0 1 0-14.8zM12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 8L14.8 8l1 1.1-2.7 2.8 2.7 2.7-1.1 1.1-2.7-2.7-2.7 2.7-1-1.1 2.6-2.7-2.7-2.7 1-1.1 2.8 2.7z" fill-rule="nonzero"/></svg>',
        'change-case': '<svg width="24" height="24"><path d="M18.4 18.2v-.6c-.5.8-1.3 1.2-2.4 1.2-2.2 0-3.3-1.6-3.3-4.8 0-3.1 1-4.7 3.3-4.7 1.1 0 1.8.3 2.4 1.1v-.6c0-.5.4-.8.8-.8s.8.3.8.8v8.4c0 .5-.4.8-.8.8a.8.8 0 0 1-.8-.8zm-2-7.4c-1.3 0-1.8.9-1.8 3.2 0 2.4.5 3.3 1.7 3.3 1.3 0 1.8-.9 1.8-3.2 0-2.4-.5-3.3-1.7-3.3zM10 15.7H5.5l-.8 2.6a1 1 0 0 1-1 .7h-.2a.7.7 0 0 1-.7-1l4-12a1 1 0 1 1 2 0l4 12a.7.7 0 0 1-.8 1h-.2a1 1 0 0 1-1-.7l-.8-2.6zm-.3-1.5l-2-6.5-1.9 6.5h3.9z" fill-rule="evenodd"/></svg>',
        'character-count': '<svg width="24" height="24"><path d="M4 11.5h16v1H4v-1zm4.8-6.8V10H7.7V5.8h-1v-1h2zM11 8.3V9h2v1h-3V7.7l2-1v-.9h-2v-1h3v2.4l-2 1zm6.3-3.4V10h-3.1V9h2.1V8h-2.1V6.8h2.1v-1h-2.1v-1h3.1zM5.8 16.4c0-.5.2-.8.5-1 .2-.2.6-.3 1.2-.3l.8.1c.2 0 .4.2.5.3l.4.4v2.8l.2.3H8.2v-.1-.2l-.6.3H7c-.4 0-.7 0-1-.2a1 1 0 0 1-.3-.9c0-.3 0-.6.3-.8.3-.2.7-.4 1.2-.4l.6-.2h.3v-.2l-.1-.2a.8.8 0 0 0-.5-.1 1 1 0 0 0-.4 0l-.3.4h-1zm2.3.8h-.2l-.2.1-.4.1a1 1 0 0 0-.4.2l-.2.2.1.3.5.1h.4l.4-.4v-.6zm2-3.4h1.2v1.7l.5-.3h.5c.5 0 .9.1 1.2.5.3.4.5.8.5 1.4 0 .6-.2 1.1-.5 1.5-.3.4-.7.6-1.3.6l-.6-.1-.4-.4v.4h-1.1v-5.4zm1.1 3.3c0 .3 0 .6.2.8a.7.7 0 0 0 1.2 0l.2-.8c0-.4 0-.6-.2-.8a.7.7 0 0 0-.6-.3l-.6.3-.2.8zm6.1-.5c0-.2 0-.3-.2-.4a.8.8 0 0 0-.5-.2c-.3 0-.5.1-.6.3l-.2.9c0 .3 0 .6.2.8.1.2.3.3.6.3.2 0 .4 0 .5-.2l.2-.4h1.1c0 .5-.3.8-.6 1.1a2 2 0 0 1-1.3.4c-.5 0-1-.2-1.3-.6a2 2 0 0 1-.5-1.4c0-.6.1-1.1.5-1.5.3-.4.8-.5 1.4-.5.5 0 1 0 1.2.3.4.3.5.7.5 1.2h-1v-.1z" fill-rule="evenodd"/></svg>',
        'checklist': '<svg width="24" height="24"><path d="M11 17h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 0 1 0-2zm0-6h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 0 1 0-2zm0-6h8a1 1 0 0 1 0 2h-8a1 1 0 0 1 0-2zM7.2 16c.2-.4.6-.5.9-.3.3.2.4.6.2 1L6 20c-.2.3-.7.4-1 0l-1.3-1.3a.7.7 0 0 1 0-1c.3-.2.7-.2 1 0l.7.9 1.7-2.8zm0-6c.2-.4.6-.5.9-.3.3.2.4.6.2 1L6 14c-.2.3-.7.4-1 0l-1.3-1.3a.7.7 0 0 1 0-1c.3-.2.7-.2 1 0l.7.9 1.7-2.8zm0-6c.2-.4.6-.5.9-.3.3.2.4.6.2 1L6 8c-.2.3-.7.4-1 0L3.8 6.9a.7.7 0 0 1 0-1c.3-.2.7-.2 1 0l.7.9 1.7-2.8z" fill-rule="evenodd"/></svg>',
        'checkmark': '<svg width="24" height="24"><path d="M18.2 5.4a1 1 0 0 1 1.6 1.2l-8 12a1 1 0 0 1-1.5.1l-5-5a1 1 0 1 1 1.4-1.4l4.1 4.1 7.4-11z" fill-rule="nonzero"/></svg>',
        'chevron-down': '<svg width="10" height="10"><path d="M8.7 2.2c.3-.3.8-.3 1 0 .4.4.4.9 0 1.2L5.7 7.8c-.3.3-.9.3-1.2 0L.2 3.4a.8.8 0 0 1 0-1.2c.3-.3.8-.3 1.1 0L5 6l3.7-3.8z" fill-rule="nonzero"/></svg>',
        'chevron-left': '<svg width="10" height="10"><path d="M7.8 1.3L4 5l3.8 3.7c.3.3.3.8 0 1-.4.4-.9.4-1.2 0L2.2 5.7a.8.8 0 0 1 0-1.2L6.6.2C7 0 7.4 0 7.8.2c.3.3.3.8 0 1.1z" fill-rule="nonzero"/></svg>',
        'chevron-right': '<svg width="10" height="10"><path d="M2.2 1.3a.8.8 0 0 1 0-1c.4-.4.9-.4 1.2 0l4.4 4.1c.3.4.3.9 0 1.2L3.4 9.8c-.3.3-.8.3-1.2 0a.8.8 0 0 1 0-1.1L6 5 2.2 1.3z" fill-rule="nonzero"/></svg>',
        'chevron-up': '<svg width="10" height="10"><path d="M8.7 7.8L5 4 1.3 7.8c-.3.3-.8.3-1 0a.8.8 0 0 1 0-1.2l4.1-4.4c.3-.3.9-.3 1.2 0l4.2 4.4c.3.3.3.9 0 1.2-.3.3-.8.3-1.1 0z" fill-rule="nonzero"/></svg>',
        'close': '<svg width="24" height="24"><path d="M17.3 8.2L13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5z" fill-rule="evenodd"/></svg>',
        'code-sample': '<svg width="24" height="26"><path d="M7.1 11a2.8 2.8 0 0 1-.8 2 2.8 2.8 0 0 1 .8 2v1.7c0 .3.1.6.4.8.2.3.5.4.8.4.3 0 .4.2.4.4v.8c0 .2-.1.4-.4.4-.7 0-1.4-.3-2-.8-.5-.6-.8-1.3-.8-2V15c0-.3-.1-.6-.4-.8-.2-.3-.5-.4-.8-.4a.4.4 0 0 1-.4-.4v-.8c0-.2.2-.4.4-.4.3 0 .6-.1.8-.4.3-.2.4-.5.4-.8V9.3c0-.7.3-1.4.8-2 .6-.5 1.3-.8 2-.8.3 0 .4.2.4.4v.8c0 .2-.1.4-.4.4-.3 0-.6.1-.8.4-.3.2-.4.5-.4.8V11zm9.8 0V9.3c0-.3-.1-.6-.4-.8-.2-.3-.5-.4-.8-.4a.4.4 0 0 1-.4-.4V7c0-.2.1-.4.4-.4.7 0 1.4.3 2 .8.5.6.8 1.3.8 2V11c0 .3.1.6.4.8.2.3.5.4.8.4.2 0 .4.2.4.4v.8c0 .2-.2.4-.4.4-.3 0-.6.1-.8.4-.3.2-.4.5-.4.8v1.7c0 .7-.3 1.4-.8 2-.6.5-1.3.8-2 .8a.4.4 0 0 1-.4-.4v-.8c0-.2.1-.4.4-.4.3 0 .6-.1.8-.4.3-.2.4-.5.4-.8V15a2.8 2.8 0 0 1 .8-2 2.8 2.8 0 0 1-.8-2zm-3.3-.4c0 .4-.1.8-.5 1.1-.3.3-.7.5-1.1.5-.4 0-.8-.2-1.1-.5-.4-.3-.5-.7-.5-1.1 0-.5.1-.9.5-1.2.3-.3.7-.4 1.1-.4.4 0 .8.1 1.1.4.4.3.5.7.5 1.2zM12 13c.4 0 .8.1 1.1.5.4.3.5.7.5 1.1 0 1-.1 1.6-.5 2a3 3 0 0 1-1.1 1c-.4.3-.8.4-1.1.4a.5.5 0 0 1-.5-.5V17a3 3 0 0 0 1-.2l.6-.6c-.6 0-1-.2-1.3-.5-.2-.3-.3-.7-.3-1 0-.5.1-1 .5-1.2.3-.4.7-.5 1.1-.5z" fill-rule="evenodd"/></svg>',
        'color-levels': '<svg width="24" height="24"><path d="M17.5 11.4A9 9 0 0 1 18 14c0 .5 0 1-.2 1.4 0 .4-.3.9-.5 1.3a6.2 6.2 0 0 1-3.7 3 5.7 5.7 0 0 1-3.2 0A5.9 5.9 0 0 1 7.6 18a6.2 6.2 0 0 1-1.4-2.6 6.7 6.7 0 0 1 0-2.8c0-.4.1-.9.3-1.3a13.6 13.6 0 0 1 2.3-4A20 20 0 0 1 12 4a26.4 26.4 0 0 1 3.2 3.4 18.2 18.2 0 0 1 2.3 4zm-2 4.5c.4-.7.5-1.4.5-2a7.3 7.3 0 0 0-1-3.2c.2.6.2 1.2.2 1.9a4.5 4.5 0 0 1-1.3 3 5.3 5.3 0 0 1-2.3 1.5 4.9 4.9 0 0 1-2 .1 4.3 4.3 0 0 0 2.4.8 4 4 0 0 0 2-.6 4 4 0 0 0 1.5-1.5z" fill-rule="evenodd"/></svg>',
        'color-picker': '<svg width="24" height="24"><path d="M12 3a9 9 0 0 0 0 18 1.5 1.5 0 0 0 1.1-2.5c-.2-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-8-9-8zm-5.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill-rule="nonzero"/></svg>',
        'color-swatch-remove-color': '<svg width="24" height="24"><path stroke="#000" stroke-width="2" d="M21 3L3 21" fill-rule="evenodd"/></svg>',
        'color-swatch': '<svg width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="1" fill-rule="evenodd"/></svg>',
        'comment': '<svg width="24" height="24"><path d="M9 19l3-2h7c.6 0 1-.4 1-1V6c0-.6-.4-1-1-1H5a1 1 0 0 0-1 1v10c0 .6.4 1 1 1h4v2zm-2 4v-4H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-6.4L7 23z" fill-rule="nonzero"/></svg>',
        'contrast': '<svg width="24" height="24"><path d="M12 4a7.8 7.8 0 0 1 5.7 2.3A8 8 0 1 1 12 4zm-6 8a6 6 0 0 0 6 6V6a6 6 0 0 0-6 6z" fill-rule="evenodd"/></svg>',
        'copy': '<svg width="24" height="24"><path d="M16 3H6a2 2 0 0 0-2 2v11h2V5h10V3zm1 4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V9c0-1.2.9-2 2-2h7zm0 12V9h-7v10h7z" fill-rule="nonzero"/></svg>',
        'crop': '<svg width="24" height="24"><path d="M17 8v7h2c.6 0 1 .4 1 1s-.4 1-1 1h-2v2c0 .6-.4 1-1 1a1 1 0 0 1-1-1v-2H7V9H5a1 1 0 1 1 0-2h2V5c0-.6.4-1 1-1s1 .4 1 1v2h7l3-3 1 1-3 3zM9 9v5l5-5H9zm1 6h5v-5l-5 5z" fill-rule="evenodd"/></svg>',
        'cut': '<svg width="24" height="24"><path d="M18 15c.6.7 1 1.4 1 2.3 0 .8-.2 1.5-.7 2l-.8.5-1 .2c-.4 0-.8 0-1.2-.3a3.9 3.9 0 0 1-2.1-2.2c-.2-.5-.3-1-.2-1.5l-1-1-1 1c0 .5 0 1-.2 1.5-.1.5-.4 1-.9 1.4-.3.4-.7.6-1.2.8l-1.2.3c-.4 0-.7 0-1-.2-.3 0-.6-.3-.8-.5-.5-.5-.8-1.2-.7-2 0-.9.4-1.6 1-2.2A3.7 3.7 0 0 1 8.6 14H9l1-1-4-4-.5-1a3.3 3.3 0 0 1 0-2c0-.4.3-.7.5-1l6 6 6-6 .5 1a3.3 3.3 0 0 1 0 2c0 .4-.3.7-.5 1l-4 4 1 1h.5c.4 0 .8 0 1.2.3.5.2.9.4 1.2.8zm-8.5 2.2l.1-.4v-.3-.4a1 1 0 0 0-.2-.5 1 1 0 0 0-.4-.2 1.6 1.6 0 0 0-.8 0 2.6 2.6 0 0 0-.8.3 2.5 2.5 0 0 0-.9 1.1l-.1.4v.7l.2.5.5.2h.7a2.5 2.5 0 0 0 .8-.3 2.8 2.8 0 0 0 1-1zm2.5-2.8c.4 0 .7-.1 1-.4.3-.3.4-.6.4-1s-.1-.7-.4-1c-.3-.3-.6-.4-1-.4s-.7.1-1 .4c-.3.3-.4.6-.4 1s.1.7.4 1c.3.3.6.4 1 .4zm5.4 4l.2-.5v-.4-.3a2.6 2.6 0 0 0-.3-.8 2.4 2.4 0 0 0-.7-.7 2.5 2.5 0 0 0-.8-.3 1.5 1.5 0 0 0-.8 0 1 1 0 0 0-.4.2 1 1 0 0 0-.2.5 1.5 1.5 0 0 0 0 .7v.4l.3.4.3.4a2.8 2.8 0 0 0 .8.5l.4.1h.7l.5-.2z" fill-rule="evenodd"/></svg>',
        'document-properties': '<svg width="24" height="24"><path d="M14.4 3H7a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2V7.6L14.4 3zM17 19H7V5h6v4h4v10z" fill-rule="nonzero"/></svg>',
        'drag': '<svg width="24" height="24"><path d="M13 5h2v2h-2V5zm0 4h2v2h-2V9zM9 9h2v2H9V9zm4 4h2v2h-2v-2zm-4 0h2v2H9v-2zm0 4h2v2H9v-2zm4 0h2v2h-2v-2zM9 5h2v2H9V5z" fill-rule="evenodd"/></svg>',
        'duplicate': '<svg width="24" height="24"><g fill-rule="nonzero"><path d="M16 3v2H6v11H4V5c0-1.1.9-2 2-2h10zm3 8h-2V9h-7v10h9a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V9c0-1.2.9-2 2-2h7a2 2 0 0 1 2 2v2z"/><path d="M17 14h1a1 1 0 0 1 0 2h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1z"/></g></svg>',
        'edit-image': '<svg width="24" height="24"><path d="M18 16h2V7a2 2 0 0 0-2-2H7v2h11v9zM6 17h15a1 1 0 0 1 0 2h-1v1a1 1 0 0 1-2 0v-1H6a2 2 0 0 1-2-2V7H3a1 1 0 1 1 0-2h1V4a1 1 0 1 1 2 0v13zm3-5.3l1.3 2 3-4.7 3.7 6H7l2-3.3z" fill-rule="nonzero"/></svg>',
        'embed-page': '<svg width="24" height="24"><path d="M19 6V5H5v14h2A13 13 0 0 1 19 6zm0 1.4c-.8.8-1.6 2.4-2.2 4.6H19V7.4zm0 5.6h-2.4c-.4 1.8-.6 3.8-.6 6h3v-6zm-4 6c0-2.2.2-4.2.6-6H13c-.7 1.8-1.1 3.8-1.1 6h3zm-4 0c0-2.2.4-4.2 1-6H9.6A12 12 0 0 0 8 19h3zM4 3h16c.6 0 1 .4 1 1v16c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1V4c0-.6.4-1 1-1zm11.8 9c.4-1.9 1-3.4 1.8-4.5a9.2 9.2 0 0 0-4 4.5h2.2zm-3.4 0a12 12 0 0 1 2.8-4 12 12 0 0 0-5 4h2.2z" fill-rule="nonzero"/></svg>',
        'embed': '<svg width="24" height="24"><path d="M4 3h16c.6 0 1 .4 1 1v16c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1V4c0-.6.4-1 1-1zm1 2v14h14V5H5zm4.8 2.6l5.6 4a.5.5 0 0 1 0 .8l-5.6 4A.5.5 0 0 1 9 16V8a.5.5 0 0 1 .8-.4z" fill-rule="nonzero"/></svg>',
        'emoji': '<svg width="24" height="24"><path d="M9 11c.6 0 1-.4 1-1s-.4-1-1-1a1 1 0 0 0-1 1c0 .6.4 1 1 1zm6 0c.6 0 1-.4 1-1s-.4-1-1-1a1 1 0 0 0-1 1c0 .6.4 1 1 1zm-3 5.5c2.1 0 4-1.5 4.4-3.5H7.6c.5 2 2.3 3.5 4.4 3.5zM12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13z" fill-rule="nonzero"/></svg>',
        'fill': '<svg width="24" height="26"><path d="M16.6 12l-9-9-1.4 1.4 2.4 2.4-5.2 5.1c-.5.6-.5 1.6 0 2.2L9 19.6a1.5 1.5 0 0 0 2.2 0l5.5-5.5c.5-.6.5-1.6 0-2.2zM5.2 13L10 8.2l4.8 4.8H5.2zM19 14.5s-2 2.2-2 3.5c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.3-2-3.5-2-3.5z" fill-rule="nonzero"/></svg>',
        'flip-horizontally': '<svg width="24" height="24"><path d="M14 19h2v-2h-2v2zm4-8h2V9h-2v2zM4 7v10c0 1.1.9 2 2 2h3v-2H6V7h3V5H6a2 2 0 0 0-2 2zm14-2v2h2a2 2 0 0 0-2-2zm-7 16h2V3h-2v18zm7-6h2v-2h-2v2zm-4-8h2V5h-2v2zm4 12a2 2 0 0 0 2-2h-2v2z" fill-rule="nonzero"/></svg>',
        'flip-vertically': '<svg width="24" height="24"><path d="M5 14v2h2v-2H5zm8 4v2h2v-2h-2zm4-14H7a2 2 0 0 0-2 2v3h2V6h10v3h2V6a2 2 0 0 0-2-2zm2 14h-2v2a2 2 0 0 0 2-2zM3 11v2h18v-2H3zm6 7v2h2v-2H9zm8-4v2h2v-2h-2zM5 18c0 1.1.9 2 2 2v-2H5z" fill-rule="nonzero"/></svg>',
        'format-painter': '<svg width="24" height="24"><path d="M18 5V4c0-.5-.4-1-1-1H5a1 1 0 0 0-1 1v4c0 .6.5 1 1 1h12c.6 0 1-.4 1-1V7h1v4H9v9c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-7h8V5h-3z" fill-rule="nonzero"/></svg>',
        'fullscreen': '<svg width="24" height="24"><path d="M15.3 10l-1.2-1.3 2.9-3h-2.3a.9.9 0 1 1 0-1.7H19c.5 0 .9.4.9.9v4.4a.9.9 0 1 1-1.8 0V7l-2.9 3zm0 4l3 3v-2.3a.9.9 0 1 1 1.7 0V19c0 .5-.4.9-.9.9h-4.4a.9.9 0 1 1 0-1.8H17l-3-2.9 1.3-1.2zM10 15.4l-2.9 3h2.3a.9.9 0 1 1 0 1.7H5a.9.9 0 0 1-.9-.9v-4.4a.9.9 0 1 1 1.8 0V17l2.9-3 1.2 1.3zM8.7 10L5.7 7v2.3a.9.9 0 0 1-1.7 0V5c0-.5.4-.9.9-.9h4.4a.9.9 0 0 1 0 1.8H7l3 2.9-1.3 1.2z" fill-rule="nonzero"/></svg>',
        'gamma': '<svg width="24" height="24"><path d="M4 3h16c.6 0 1 .4 1 1v16c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1V4c0-.6.4-1 1-1zm1 2v14h14V5H5zm6.5 11.8V14L9.2 8.7a5.1 5.1 0 0 0-.4-.8l-.1-.2H8 8v-1l.3-.1.3-.1h.7a1 1 0 0 1 .6.5l.1.3a8.5 8.5 0 0 1 .3.6l1.9 4.6 2-5.2a1 1 0 0 1 1-.6.5.5 0 0 1 .5.6L13 14v2.8a.7.7 0 0 1-1.4 0z" fill-rule="nonzero"/></svg>',
        'help': '<svg width="24" height="24"><g fill-rule="evenodd"><path d="M12 5.5a6.5 6.5 0 0 0-6 9 6.3 6.3 0 0 0 1.4 2l1 1a6.3 6.3 0 0 0 3.6 1 6.5 6.5 0 0 0 6-9 6.3 6.3 0 0 0-1.4-2l-1-1a6.3 6.3 0 0 0-3.6-1zM12 4a7.8 7.8 0 0 1 5.7 2.3A8 8 0 1 1 12 4z"/><path d="M9.6 9.7a.7.7 0 0 1-.7-.8c0-1.1 1.5-1.8 3.2-1.8 1.8 0 3.2.8 3.2 2.4 0 1.4-.4 2.1-1.5 2.8-.2 0-.3.1-.3.2a2 2 0 0 0-.8.8.8.8 0 0 1-1.4-.6c.3-.7.8-1 1.3-1.5l.4-.2c.7-.4.8-.6.8-1.5 0-.5-.6-.9-1.7-.9-.5 0-1 .1-1.4.3-.2 0-.3.1-.3.2v-.2c0 .4-.4.8-.8.8z" fill-rule="nonzero"/><circle cx="12" cy="16" r="1"/></g></svg>',
        'highlight-bg-color': '<svg width="24" height="24"><g fill-rule="evenodd"><path id="tox-icon-highlight-bg-color__color" d="M3 18h18v3H3z"/><path fill-rule="nonzero" d="M7.7 16.7H3l3.3-3.3-.7-.8L10.2 8l4 4.1-4 4.2c-.2.2-.6.2-.8 0l-.6-.7-1.1 1.1zm5-7.5L11 7.4l3-2.9a2 2 0 0 1 2.6 0L18 6c.7.7.7 2 0 2.7l-2.9 2.9-1.8-1.8-.5-.6"/></g></svg>',
        'home': '<svg width="24" height="24"><path fill-rule="nonzero" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
        'horizontal-rule': '<svg width="24" height="24"><path d="M4 11h16v2H4z" fill-rule="evenodd"/></svg>',
        'image-options': '<svg width="24" height="24"><path d="M6 10a2 2 0 0 0-2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2 2 2 0 0 0-2-2zm12 0a2 2 0 0 0-2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2 2 2 0 0 0-2-2zm-6 0a2 2 0 0 0-2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2 2 2 0 0 0-2-2z" fill-rule="nonzero"/></svg>',
        'image': '<svg width="24" height="24"><path d="M5 15.7l3.3-3.2c.3-.3.7-.3 1 0L12 15l4.1-4c.3-.4.8-.4 1 0l2 1.9V5H5v10.7zM5 18V19h3l2.8-2.9-2-2L5 17.9zm14-3l-2.5-2.4-6.4 6.5H19v-4zM4 3h16c.6 0 1 .4 1 1v16c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1V4c0-.6.4-1 1-1zm6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill-rule="nonzero"/></svg>',
        'indent': '<svg width="24" height="24"><path d="M7 5h12c.6 0 1 .4 1 1s-.4 1-1 1H7a1 1 0 1 1 0-2zm5 4h7c.6 0 1 .4 1 1s-.4 1-1 1h-7a1 1 0 0 1 0-2zm0 4h7c.6 0 1 .4 1 1s-.4 1-1 1h-7a1 1 0 0 1 0-2zm-5 4h12a1 1 0 0 1 0 2H7a1 1 0 0 1 0-2zm-2.6-3.8L6.2 12l-1.8-1.2a1 1 0 0 1 1.2-1.6l3 2a1 1 0 0 1 0 1.6l-3 2a1 1 0 1 1-1.2-1.6z" fill-rule="evenodd"/></svg>',
        'indeterminate': '<svg width="24" height="24"><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM9 11a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H9z" fill-rule="evenodd"/></svg>',
        'info': '<svg width="24" height="24"><path d="M12 4a7.8 7.8 0 0 1 5.7 2.3A8 8 0 1 1 12 4zm-1 3v2h2V7h-2zm3 10v-1h-1v-5h-3v1h1v4h-1v1h4z" fill-rule="evenodd"/></svg>',
        'insert-character': '<svg width="24" height="24"><path d="M15 18h4l1-2v4h-6v-3.3l1.4-1a6 6 0 0 0 1.8-2.9 6.3 6.3 0 0 0-.1-4.1 5.8 5.8 0 0 0-3-3.2c-.6-.3-1.3-.5-2.1-.5a5.1 5.1 0 0 0-3.9 1.8 6.3 6.3 0 0 0-1.3 6 6.2 6.2 0 0 0 1.8 3l1.4.9V20H4v-4l1 2h4v-.5l-2-1L5.4 15A6.5 6.5 0 0 1 4 11c0-1 .2-1.9.6-2.7A7 7 0 0 1 6.3 6C7.1 5.4 8 5 9 4.5c1-.3 2-.5 3.1-.5a8.8 8.8 0 0 1 5.7 2 7 7 0 0 1 1.7 2.3 6 6 0 0 1 .2 4.8c-.2.7-.6 1.3-1 1.9a7.6 7.6 0 0 1-3.6 2.5v.5z" fill-rule="evenodd"/></svg>',
        'insert-time': '<svg width="24" height="24"><g fill-rule="nonzero"><path d="M19 2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3zm-7 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/><path d="M15 12h-3V7a.5.5 0 0 0-1 0v6h4a.5.5 0 0 0 0-1z"/></g></svg>',
        'invert': '<svg width="24" height="24"><path d="M18 19.3L16.5 18a5.8 5.8 0 0 1-3.1 1.9 6.1 6.1 0 0 1-5.5-1.6A5.8 5.8 0 0 1 6 14v-.3l.1-1.2A13.9 13.9 0 0 1 7.7 9l-3-3 .7-.8 2.8 2.9 9 8.9 1.5 1.6-.7.6zm0-5.5v.3l-.1 1.1-.4 1-1.2-1.2a4.3 4.3 0 0 0 .2-1v-.2c0-.4 0-.8-.2-1.3l-.5-1.4a14.8 14.8 0 0 0-3-4.2L12 6a26.1 26.1 0 0 0-2.2 2.5l-1-1a20.9 20.9 0 0 1 2.9-3.3L12 4l1 .8a22.2 22.2 0 0 1 4 5.4c.6 1.2 1 2.4 1 3.6z" fill-rule="evenodd"/></svg>',
        'italic': '<svg width="24" height="24"><path d="M16.7 4.7l-.1.9h-.3c-.6 0-1 0-1.4.3-.3.3-.4.6-.5 1.1l-2.1 9.8v.6c0 .5.4.8 1.4.8h.2l-.2.8H8l.2-.8h.2c1.1 0 1.8-.5 2-1.5l2-9.8.1-.5c0-.6-.4-.8-1.4-.8h-.3l.2-.9h5.8z" fill-rule="evenodd"/></svg>',
        'line': '<svg width="24" height="24"><path d="M15 9l-8 8H4v-3l8-8 3 3zm1-1l-3-3 1-1h1c-.2 0 0 0 0 0l2 2s0 .2 0 0v1l-1 1zM4 18h16v2H4v-2z" fill-rule="evenodd"/></svg>',
        'link': '<svg width="24" height="24"><path d="M6.2 12.3a1 1 0 0 1 1.4 1.4l-2.1 2a2 2 0 1 0 2.7 2.8l4.8-4.8a1 1 0 0 0 0-1.4 1 1 0 1 1 1.4-1.3 2.9 2.9 0 0 1 0 4L9.6 20a3.9 3.9 0 0 1-5.5-5.5l2-2zm11.6-.6a1 1 0 0 1-1.4-1.4l2-2a2 2 0 1 0-2.6-2.8L11 10.3a1 1 0 0 0 0 1.4A1 1 0 1 1 9.6 13a2.9 2.9 0 0 1 0-4L14.4 4a3.9 3.9 0 0 1 5.5 5.5l-2 2z" fill-rule="nonzero"/></svg>',
        'list-bull-circle': '<svg width="48" height="48"><g fill-rule="evenodd"><path d="M11 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 1a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM11 26a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 1a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM11 36a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 1a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill-rule="nonzero"/><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"/></g></svg>',
        'list-bull-default': '<svg width="48" height="48"><g fill-rule="evenodd"><circle cx="11" cy="14" r="3"/><circle cx="11" cy="24" r="3"/><circle cx="11" cy="34" r="3"/><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"/></g></svg>',
        'list-bull-square': '<svg width="48" height="48"><g fill-rule="evenodd"><path d="M8 11h6v6H8zM8 21h6v6H8zM8 31h6v6H8z"/><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"/></g></svg>',
        'list-num-default': '<svg width="48" height="48"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"/><path d="M10 17v-4.8l-1.5 1v-1.1l1.6-1h1.2V17h-1.2zm3.6.1c-.4 0-.7-.3-.7-.7 0-.4.3-.7.7-.7.5 0 .7.3.7.7 0 .4-.2.7-.7.7zm-5 5.7c0-1.2.8-2 2.1-2s2.1.8 2.1 1.8c0 .7-.3 1.2-1.4 2.2l-1.1 1v.2h2.6v1H8.6v-.9l2-1.9c.8-.8 1-1.1 1-1.5 0-.5-.4-.8-1-.8-.5 0-.9.3-.9.9H8.5zm6.3 4.3c-.5 0-.7-.3-.7-.7 0-.4.2-.7.7-.7.4 0 .7.3.7.7 0 .4-.3.7-.7.7zM10 34.4v-1h.7c.6 0 1-.3 1-.8 0-.4-.4-.7-1-.7s-1 .3-1 .8H8.6c0-1.1 1-1.8 2.2-1.8 1.3 0 2.1.6 2.1 1.6 0 .7-.4 1.2-1 1.3v.1c.8.1 1.3.7 1.3 1.4 0 1-1 1.9-2.4 1.9-1.3 0-2.2-.8-2.3-2h1.2c0 .6.5 1 1.1 1 .7 0 1-.4 1-1 0-.5-.3-.8-1-.8h-.7zm4.7 2.7c-.4 0-.7-.3-.7-.7 0-.4.3-.7.7-.7.5 0 .8.3.8.7 0 .4-.3.7-.8.7z"/></g></svg>',
        'list-num-lower-alpha': '<svg width="48" height="48"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"/><path d="M10.3 15.2c.5 0 1-.4 1-.9V14h-1c-.5.1-.8.3-.8.6 0 .4.3.6.8.6zm-.4.9c-1 0-1.5-.6-1.5-1.4 0-.8.6-1.3 1.7-1.4h1.1v-.4c0-.4-.2-.6-.7-.6-.5 0-.8.1-.9.4h-1c0-.8.8-1.4 2-1.4 1.1 0 1.8.6 1.8 1.6V16h-1.1v-.6h-.1c-.2.4-.7.7-1.3.7zm4.6 0c-.5 0-.7-.3-.7-.7 0-.4.2-.7.7-.7.4 0 .7.3.7.7 0 .4-.3.7-.7.7zm-3.2 10c-.6 0-1.2-.3-1.4-.8v.7H8.5v-6.3H10v2.5c.3-.5.8-.9 1.4-.9 1.2 0 1.9 1 1.9 2.4 0 1.5-.7 2.4-1.9 2.4zm-.4-3.7c-.7 0-1 .5-1 1.3s.3 1.4 1 1.4c.6 0 1-.6 1-1.4 0-.8-.4-1.3-1-1.3zm4 3.7c-.5 0-.7-.3-.7-.7 0-.4.2-.7.7-.7.4 0 .7.3.7.7 0 .4-.3.7-.7.7zm-2.2 7h-1.2c0-.5-.4-.8-.9-.8-.6 0-1 .5-1 1.4 0 1 .4 1.4 1 1.4.5 0 .8-.2 1-.7h1c0 1-.8 1.7-2 1.7-1.4 0-2.2-.9-2.2-2.4s.8-2.4 2.2-2.4c1.2 0 2 .7 2 1.7zm1.8 3c-.5 0-.8-.3-.8-.7 0-.4.3-.7.8-.7.4 0 .7.3.7.7 0 .4-.3.7-.7.7z"/></g></svg>',
        'list-num-lower-greek': '<svg width="48" height="48"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"/><path d="M10.5 15c.7 0 1-.5 1-1.3s-.3-1.3-1-1.3c-.5 0-.9.5-.9 1.3s.4 1.4 1 1.4zm-.3 1c-1.1 0-1.8-.8-1.8-2.3 0-1.5.7-2.4 1.8-2.4.7 0 1.1.4 1.3 1h.1v-.9h1.2v3.2c0 .4.1.5.4.5h.2v.9h-.6c-.6 0-1-.2-1.1-.7h-.1c-.2.4-.7.8-1.4.8zm5 .1c-.5 0-.8-.3-.8-.7 0-.4.3-.7.7-.7.5 0 .8.3.8.7 0 .4-.3.7-.8.7zm-4.9 7v-1h.3c.6 0 1-.2 1-.7 0-.5-.4-.8-1-.8-.5 0-.8.3-.8 1v2.2c0 .8.4 1.3 1.1 1.3.6 0 1-.4 1-1s-.5-1-1.3-1h-.3zM8.6 22c0-1.5.7-2.3 2-2.3 1.2 0 2 .6 2 1.6 0 .6-.3 1-.8 1.3.8.3 1.3.8 1.3 1.7 0 1.2-.8 1.9-1.9 1.9-.6 0-1.1-.3-1.3-.8v2.2H8.5V22zm6.2 4.2c-.4 0-.7-.3-.7-.7 0-.4.3-.7.7-.7.5 0 .7.3.7.7 0 .4-.2.7-.7.7zm-4.5 8.5L8 30h1.4l1.7 3.5 1.7-3.5h1.1l-2.2 4.6v.1c.5.8.7 1.4.7 1.8 0 .4-.1.8-.4 1-.2.2-.6.3-1 .3-.9 0-1.3-.4-1.3-1.2 0-.5.2-1 .5-1.7l.1-.2zm.7 1a2 2 0 0 0-.4.9c0 .3.1.4.4.4.3 0 .4-.1.4-.4 0-.2-.1-.6-.4-1zm4.5.5c-.5 0-.8-.3-.8-.7 0-.4.3-.7.8-.7.4 0 .7.3.7.7 0 .4-.3.7-.7.7z"/></g></svg>',
        'list-num-lower-roman': '<svg width="48" height="48"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"/><path d="M15.1 16v-1.2h1.3V16H15zm0 10v-1.2h1.3V26H15zm0 10v-1.2h1.3V36H15z"/><path fill-rule="nonzero" d="M12 21h1.5v5H12zM12 31h1.5v5H12zM9 21h1.5v5H9zM9 31h1.5v5H9zM6 31h1.5v5H6zM12 11h1.5v5H12zM12 19h1.5v1H12zM12 29h1.5v1H12zM9 19h1.5v1H9zM9 29h1.5v1H9zM6 29h1.5v1H6zM12 9h1.5v1H12z"/></g></svg>',
        'list-num-upper-alpha': '<svg width="48" height="48"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"/><path d="M12.6 17l-.5-1.4h-2L9.5 17H8.3l2-6H12l2 6h-1.3zM11 12.3l-.7 2.3h1.6l-.8-2.3zm4.7 4.8c-.4 0-.7-.3-.7-.7 0-.4.3-.7.7-.7.5 0 .7.3.7.7 0 .4-.2.7-.7.7zM11.4 27H8.7v-6h2.6c1.2 0 1.9.6 1.9 1.5 0 .6-.5 1.2-1 1.3.7.1 1.3.7 1.3 1.5 0 1-.8 1.7-2 1.7zM10 22v1.5h1c.6 0 1-.3 1-.8 0-.4-.4-.7-1-.7h-1zm0 4H11c.7 0 1.1-.3 1.1-.8 0-.6-.4-.9-1.1-.9H10V26zm5.4 1.1c-.5 0-.8-.3-.8-.7 0-.4.3-.7.8-.7.4 0 .7.3.7.7 0 .4-.3.7-.7.7zm-4.1 10c-1.8 0-2.8-1.1-2.8-3.1s1-3.1 2.8-3.1c1.4 0 2.5.9 2.6 2.2h-1.3c0-.7-.6-1.1-1.3-1.1-1 0-1.6.7-1.6 2s.6 2 1.6 2c.7 0 1.2-.4 1.4-1h1.2c-.1 1.3-1.2 2.2-2.6 2.2zm4.5 0c-.5 0-.8-.3-.8-.7 0-.4.3-.7.8-.7.4 0 .7.3.7.7 0 .4-.3.7-.7.7z"/></g></svg>',
        'list-num-upper-roman': '<svg width="48" height="48"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"/><path d="M15.1 17v-1.2h1.3V17H15zm0 10v-1.2h1.3V27H15zm0 10v-1.2h1.3V37H15z"/><path fill-rule="nonzero" d="M12 20h1.5v7H12zM12 30h1.5v7H12zM9 20h1.5v7H9zM9 30h1.5v7H9zM6 30h1.5v7H6zM12 10h1.5v7H12z"/></g></svg>',
        'lock': '<svg width="24" height="24"><path d="M16.3 11c.2 0 .3 0 .5.2l.2.6v7.4c0 .3 0 .4-.2.6l-.6.2H7.8c-.3 0-.4 0-.6-.2a.7.7 0 0 1-.2-.6v-7.4c0-.3 0-.4.2-.6l.5-.2H8V8c0-.8.3-1.5.9-2.1.6-.6 1.3-.9 2.1-.9h2c.8 0 1.5.3 2.1.9.6.6.9 1.3.9 2.1v3h.3zM10 8v3h4V8a1 1 0 0 0-.3-.7A1 1 0 0 0 13 7h-2a1 1 0 0 0-.7.3 1 1 0 0 0-.3.7z" fill-rule="evenodd"/></svg>',
        'ltr': '<svg width="24" height="24"><path d="M11 5h7a1 1 0 0 1 0 2h-1v11a1 1 0 0 1-2 0V7h-2v11a1 1 0 0 1-2 0v-6c-.5 0-1 0-1.4-.3A3.4 3.4 0 0 1 7.8 10a3.3 3.3 0 0 1 0-2.8 3.4 3.4 0 0 1 1.8-1.8L11 5zM4.4 16.2L6.2 15l-1.8-1.2a1 1 0 0 1 1.2-1.6l3 2a1 1 0 0 1 0 1.6l-3 2a1 1 0 1 1-1.2-1.6z" fill-rule="evenodd"/></svg>',
        'new-document': '<svg width="24" height="24"><path d="M14.4 3H7a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2V7.6L14.4 3zM17 19H7V5h6v4h4v10z" fill-rule="nonzero"/></svg>',
        'new-tab': '<svg width="24" height="24"><path d="M15 13l2-2v8H5V7h8l-2 2H7v8h8v-4zm4-8v5.5l-2-2-5.6 5.5H10v-1.4L15.5 7l-2-2H19z" fill-rule="evenodd"/></svg>',
        'non-breaking': '<svg width="24" height="24"><path d="M11 11H8a1 1 0 1 1 0-2h3V6c0-.6.4-1 1-1s1 .4 1 1v3h3c.6 0 1 .4 1 1s-.4 1-1 1h-3v3c0 .6-.4 1-1 1a1 1 0 0 1-1-1v-3zm10 4v5H3v-5c0-.6.4-1 1-1s1 .4 1 1v3h14v-3c0-.6.4-1 1-1s1 .4 1 1z" fill-rule="evenodd"/></svg>',
        'notice': '<svg width="24" height="24"><path d="M17.8 9.8L15.4 4 20 8.5v7L15.5 20h-7L4 15.5v-7L8.5 4h7l2.3 5.8zm0 0l2.2 5.7-2.3-5.8zM13 17v-2h-2v2h2zm0-4V7h-2v6h2z" fill-rule="evenodd"/></svg>',
        'ordered-list': '<svg width="24" height="24"><path d="M10 17h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 0 1 0-2zm0-6h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 0 1 0-2zm0-6h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 1 1 0-2zM6 4v3.5c0 .3-.2.5-.5.5a.5.5 0 0 1-.5-.5V5h-.5a.5.5 0 0 1 0-1H6zm-1 8.8l.2.2h1.3c.3 0 .5.2.5.5s-.2.5-.5.5H4.9a1 1 0 0 1-.9-1V13c0-.4.3-.8.6-1l1.2-.4.2-.3a.2.2 0 0 0-.2-.2H4.5a.5.5 0 0 1-.5-.5c0-.3.2-.5.5-.5h1.6c.5 0 .9.4.9 1v.1c0 .4-.3.8-.6 1l-1.2.4-.2.3zM7 17v2c0 .6-.4 1-1 1H4.5a.5.5 0 0 1 0-1h1.2c.2 0 .3-.1.3-.3 0-.2-.1-.3-.3-.3H4.4a.4.4 0 1 1 0-.8h1.3c.2 0 .3-.1.3-.3 0-.2-.1-.3-.3-.3H4.5a.5.5 0 1 1 0-1H6c.6 0 1 .4 1 1z" fill-rule="evenodd"/></svg>',
        'orientation': '<svg width="24" height="24"><path d="M7.3 6.4L1 13l6.4 6.5 6.5-6.5-6.5-6.5zM3.7 13l3.6-3.7L11 13l-3.7 3.7-3.6-3.7zM12 6l2.8 2.7c.3.3.3.8 0 1-.3.4-.9.4-1.2 0L9.2 5.7a.8.8 0 0 1 0-1.2L13.6.2c.3-.3.9-.3 1.2 0 .3.3.3.8 0 1.1L12 4h1a9 9 0 1 1-4.3 16.9l1.5-1.5A7 7 0 1 0 13 6h-1z" fill-rule="nonzero"/></svg>',
        'outdent': '<svg width="24" height="24"><path d="M7 5h12c.6 0 1 .4 1 1s-.4 1-1 1H7a1 1 0 1 1 0-2zm5 4h7c.6 0 1 .4 1 1s-.4 1-1 1h-7a1 1 0 0 1 0-2zm0 4h7c.6 0 1 .4 1 1s-.4 1-1 1h-7a1 1 0 0 1 0-2zm-5 4h12a1 1 0 0 1 0 2H7a1 1 0 0 1 0-2zm1.6-3.8a1 1 0 0 1-1.2 1.6l-3-2a1 1 0 0 1 0-1.6l3-2a1 1 0 0 1 1.2 1.6L6.8 12l1.8 1.2z" fill-rule="evenodd"/></svg>',
        'page-break': '<svg width="24" height="24"><g fill-rule="evenodd"><path d="M5 11c.6 0 1 .4 1 1s-.4 1-1 1a1 1 0 0 1 0-2zm3 0h1c.6 0 1 .4 1 1s-.4 1-1 1H8a1 1 0 0 1 0-2zm4 0c.6 0 1 .4 1 1s-.4 1-1 1a1 1 0 0 1 0-2zm3 0h1c.6 0 1 .4 1 1s-.4 1-1 1h-1a1 1 0 0 1 0-2zm4 0c.6 0 1 .4 1 1s-.4 1-1 1a1 1 0 0 1 0-2zM7 3v5h10V3c0-.6.4-1 1-1s1 .4 1 1v7H5V3c0-.6.4-1 1-1s1 .4 1 1zM6 22a1 1 0 0 1-1-1v-7h14v7c0 .6-.4 1-1 1a1 1 0 0 1-1-1v-5H7v5c0 .6-.4 1-1 1z"/></g></svg>',
        'paragraph': '<svg width="24" height="24"><path d="M10 5h7a1 1 0 0 1 0 2h-1v11a1 1 0 0 1-2 0V7h-2v11a1 1 0 0 1-2 0v-6c-.5 0-1 0-1.4-.3A3.4 3.4 0 0 1 6.8 10a3.3 3.3 0 0 1 0-2.8 3.4 3.4 0 0 1 1.8-1.8L10 5z" fill-rule="evenodd"/></svg>',
        'paste-text': '<svg width="24" height="24"><path d="M18 9V5h-2v1c0 .6-.4 1-1 1H9a1 1 0 0 1-1-1V5H6v13h3V9h9zM9 20H6a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.2A3 3 0 0 1 12 1a3 3 0 0 1 2.8 2H18a2 2 0 0 1 2 2v4h1v12H9v-1zm1.5-9.5v9h9v-9h-9zM12 3a1 1 0 0 0-1 1c0 .5.4 1 1 1s1-.5 1-1-.4-1-1-1zm0 9h6v2h-.5l-.5-1h-1v4h.8v1h-3.6v-1h.8v-4h-1l-.5 1H12v-2z" fill-rule="nonzero"/></svg>',
        'paste': '<svg width="24" height="24"><path d="M18 9V5h-2v1c0 .6-.4 1-1 1H9a1 1 0 0 1-1-1V5H6v13h3V9h9zM9 20H6a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.2A3 3 0 0 1 12 1a3 3 0 0 1 2.8 2H18a2 2 0 0 1 2 2v4h1v12H9v-1zm1.5-9.5v9h9v-9h-9zM12 3a1 1 0 0 0-1 1c0 .5.4 1 1 1s1-.5 1-1-.4-1-1-1z" fill-rule="nonzero"/></svg>',
        'permanent-pen': '<svg width="24" height="24"><path d="M10.5 17.5L8 20H3v-3l3.5-3.5a2 2 0 0 1 0-3L14 3l1 1-7.3 7.3a1 1 0 0 0 0 1.4l3.6 3.6c.4.4 1 .4 1.4 0L20 9l1 1-7.6 7.6a2 2 0 0 1-2.8 0l-.1-.1z" fill-rule="nonzero"/></svg>',
        'plus': '<svg width="24" height="24"><g fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" stroke="#000" stroke-width="2"><path d="M12 5v14M5 12h14"/></g></svg>',
        'preferences': '<svg width="24" height="24"><path d="M20.1 13.5l-1.9.2a5.8 5.8 0 0 1-.6 1.5l1.2 1.5c.4.4.3 1 0 1.4l-.7.7a1 1 0 0 1-1.4 0l-1.5-1.2a6.2 6.2 0 0 1-1.5.6l-.2 1.9c0 .5-.5.9-1 .9h-1a1 1 0 0 1-1-.9l-.2-1.9a5.8 5.8 0 0 1-1.5-.6l-1.5 1.2a1 1 0 0 1-1.4 0l-.7-.7a1 1 0 0 1 0-1.4l1.2-1.5a6.2 6.2 0 0 1-.6-1.5l-1.9-.2a1 1 0 0 1-.9-1v-1c0-.5.4-1 .9-1l1.9-.2a5.8 5.8 0 0 1 .6-1.5L5.2 7.3a1 1 0 0 1 0-1.4l.7-.7a1 1 0 0 1 1.4 0l1.5 1.2a6.2 6.2 0 0 1 1.5-.6l.2-1.9c0-.5.5-.9 1-.9h1c.5 0 1 .4 1 .9l.2 1.9a5.8 5.8 0 0 1 1.5.6l1.5-1.2a1 1 0 0 1 1.4 0l.7.7c.3.4.4 1 0 1.4l-1.2 1.5a6.2 6.2 0 0 1 .6 1.5l1.9.2c.5 0 .9.5.9 1v1c0 .5-.4 1-.9 1zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill-rule="evenodd"/></svg>',
        'preview': '<svg width="24" height="24"><path d="M3.5 12.5c.5.8 1.1 1.6 1.8 2.3 2 2 4.2 3.2 6.7 3.2s4.7-1.2 6.7-3.2a16.2 16.2 0 0 0 2.1-2.8 15.7 15.7 0 0 0-2.1-2.8c-2-2-4.2-3.2-6.7-3.2a9.3 9.3 0 0 0-6.7 3.2A16.2 16.2 0 0 0 3.2 12c0 .2.2.3.3.5zm-2.4-1l.7-1.2L4 7.8C6.2 5.4 8.9 4 12 4c3 0 5.8 1.4 8.1 3.8a18.2 18.2 0 0 1 2.8 3.7v1l-.7 1.2-2.1 2.5c-2.3 2.4-5 3.8-8.1 3.8-3 0-5.8-1.4-8.1-3.8a18.2 18.2 0 0 1-2.8-3.7 1 1 0 0 1 0-1zm12-3.3a2 2 0 1 0 2.7 2.6 4 4 0 1 1-2.6-2.6z" fill-rule="nonzero"/></svg>',
        'print': '<svg width="24" height="24"><path d="M18 8H6a3 3 0 0 0-3 3v6h2v3h14v-3h2v-6a3 3 0 0 0-3-3zm-1 10H7v-4h10v4zm.5-5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm.5-8H6v2h12V5z" fill-rule="nonzero"/></svg>',
        'quote': '<svg width="24" height="24"><path d="M7.5 17h.9c.4 0 .7-.2.9-.6L11 13V8c0-.6-.4-1-1-1H6a1 1 0 0 0-1 1v4c0 .6.4 1 1 1h2l-1.3 2.7a1 1 0 0 0 .8 1.3zm8 0h.9c.4 0 .7-.2.9-.6L19 13V8c0-.6-.4-1-1-1h-4a1 1 0 0 0-1 1v4c0 .6.4 1 1 1h2l-1.3 2.7a1 1 0 0 0 .8 1.3z" fill-rule="nonzero"/></svg>',
        'redo': '<svg width="24" height="24"><path d="M17.6 10H12c-2.8 0-4.4 1.4-4.9 3.5-.4 2 .3 4 1.4 4.6a1 1 0 1 1-1 1.8c-2-1.2-2.9-4.1-2.3-6.8.6-3 3-5.1 6.8-5.1h5.6l-3.3-3.3a1 1 0 1 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4l3.3-3.3z" fill-rule="nonzero"/></svg>',
        'reload': '<svg width="24" height="24"><g fill-rule="nonzero"><path d="M5 22.1l-1.2-4.7v-.2a1 1 0 0 1 1-1l5 .4a1 1 0 1 1-.2 2l-2.2-.2a7.8 7.8 0 0 0 8.4.2 7.5 7.5 0 0 0 3.5-6.4 1 1 0 1 1 2 0 9.5 9.5 0 0 1-4.5 8 9.9 9.9 0 0 1-10.2 0l.4 1.4a1 1 0 1 1-2 .5zM13.6 7.4c0-.5.5-1 1-.9l2.8.2a8 8 0 0 0-9.5-1 7.5 7.5 0 0 0-3.6 7 1 1 0 0 1-2 0 9.5 9.5 0 0 1 4.5-8.6 10 10 0 0 1 10.9.3l-.3-1a1 1 0 0 1 2-.5l1.1 4.8a1 1 0 0 1-1 1.2l-5-.4a1 1 0 0 1-.9-1z"/></g></svg>',
        'remove-formatting': '<svg width="24" height="24"><path d="M13.2 6a1 1 0 0 1 0 .2l-2.6 10a1 1 0 0 1-1 .8h-.2a.8.8 0 0 1-.8-1l2.6-10H8a1 1 0 1 1 0-2h9a1 1 0 0 1 0 2h-3.8zM5 18h7a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2zm13 1.5L16.5 18 15 19.5a.7.7 0 0 1-1-1l1.5-1.5-1.5-1.5a.7.7 0 0 1 1-1l1.5 1.5 1.5-1.5a.7.7 0 0 1 1 1L17.5 17l1.5 1.5a.7.7 0 0 1-1 1z" fill-rule="evenodd"/></svg>',
        'remove': '<svg width="24" height="24"><path d="M16 7h3a1 1 0 0 1 0 2h-1v9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V9H5a1 1 0 1 1 0-2h3V6a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1zm-2 0V6c0-.6-.4-1-1-1h-2a1 1 0 0 0-1 1v1h4zm2 2H8v9c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V9zm-7 3a1 1 0 0 1 2 0v4a1 1 0 0 1-2 0v-4zm4 0a1 1 0 0 1 2 0v4a1 1 0 0 1-2 0v-4z" fill-rule="nonzero"/></svg>',
        'resize-handle': '<svg width="10" height="10"><g fill-rule="nonzero"><path d="M8.1 1.1A.5.5 0 1 1 9 2l-7 7A.5.5 0 1 1 1 8l7-7zM8.1 5.1A.5.5 0 1 1 9 6l-3 3A.5.5 0 1 1 5 8l3-3z"/></g></svg>',
        'resize': '<svg width="24" height="24"><path d="M4 5c0-.3.1-.5.3-.7.2-.2.4-.3.7-.3h6c.3 0 .5.1.7.3.2.2.3.4.3.7 0 .3-.1.5-.3.7a1 1 0 0 1-.7.3H7.4L18 16.6V13c0-.3.1-.5.3-.7.2-.2.4-.3.7-.3.3 0 .5.1.7.3.2.2.3.4.3.7v6c0 .3-.1.5-.3.7a1 1 0 0 1-.7.3h-6a1 1 0 0 1-.7-.3 1 1 0 0 1-.3-.7c0-.3.1-.5.3-.7.2-.2.4-.3.7-.3h3.6L6 7.4V11c0 .3-.1.5-.3.7a1 1 0 0 1-.7.3 1 1 0 0 1-.7-.3A1 1 0 0 1 4 11V5z" fill-rule="evenodd"/></svg>',
        'restore-draft': '<svg width="24" height="24"><g fill-rule="evenodd"><path d="M17 13c0 .6-.4 1-1 1h-4V8c0-.6.4-1 1-1s1 .4 1 1v4h2c.6 0 1 .4 1 1z"/><path d="M4.7 10H9a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1V5a1 1 0 1 1 2 0v3l2.5-2.4a9.2 9.2 0 0 1 10.8-1.5A9 9 0 0 1 13.4 21c-2.4.1-4.7-.7-6.5-2.2a1 1 0 1 1 1.3-1.5 7.2 7.2 0 0 0 11.6-3.7 7 7 0 0 0-3.5-7.7A7.2 7.2 0 0 0 8 7L4.7 10z" fill-rule="nonzero"/></g></svg>',
        'rotate-left': '<svg width="24" height="24"><path d="M4.7 10H9a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1V5a1 1 0 1 1 2 0v3l2.5-2.4a9.2 9.2 0 0 1 10.8-1.5A9 9 0 0 1 13.4 21c-2.4.1-4.7-.7-6.5-2.2a1 1 0 1 1 1.3-1.5 7.2 7.2 0 0 0 11.6-3.7 7 7 0 0 0-3.5-7.7A7.2 7.2 0 0 0 8 7L4.7 10z" fill-rule="nonzero"/></svg>',
        'rotate-right': '<svg width="24" height="24"><path d="M20 8V5a1 1 0 0 1 2 0v6c0 .6-.4 1-1 1h-6a1 1 0 0 1 0-2h4.3L16 7A7.2 7.2 0 0 0 7.7 6a7 7 0 0 0 3 13.1c1.9.1 3.7-.5 5-1.7a1 1 0 0 1 1.4 1.5A9.2 9.2 0 0 1 2.2 14c-.9-3.9 1-8 4.5-9.9 3.5-1.9 8-1.3 10.8 1.5L20 8z" fill-rule="nonzero"/></svg>',
        'rtl': '<svg width="24" height="24"><path d="M8 5h8v2h-2v12h-2V7h-2v12H8v-7c-.5 0-1 0-1.4-.3A3.4 3.4 0 0 1 4.8 10a3.3 3.3 0 0 1 0-2.8 3.4 3.4 0 0 1 1.8-1.8L8 5zm12 11.2a1 1 0 1 1-1 1.6l-3-2a1 1 0 0 1 0-1.6l3-2a1 1 0 1 1 1 1.6L18.4 15l1.8 1.2z" fill-rule="evenodd"/></svg>',
        'save': '<svg width="24" height="24"><path d="M5 16h14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2c0-1.1.9-2 2-2zm0 2v2h14v-2H5zm10 0h2v2h-2v-2zm-4-6.4L8.7 9.3a1 1 0 1 0-1.4 1.4l4 4c.4.4 1 .4 1.4 0l4-4a1 1 0 1 0-1.4-1.4L13 11.6V4a1 1 0 0 0-2 0v7.6z" fill-rule="nonzero"/></svg>',
        'search': '<svg width="24" height="24"><path d="M16 17.3a8 8 0 1 1 1.4-1.4l4.3 4.4a1 1 0 0 1-1.4 1.4l-4.4-4.3zm-5-.3a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" fill-rule="nonzero"/></svg>',
        'select-all': '<svg width="24" height="24"><path d="M3 5h2V3a2 2 0 0 0-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2a2 2 0 0 0-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8a2 2 0 0 0 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2zM7 17h10V7H7v10zm2-8h6v6H9V9z" fill-rule="nonzero"/></svg>',
        'selected': '<svg width="24" height="24"><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm-2.4-6.1L7 12.3a.7.7 0 0 0-1 1L9.6 17 18 8.6a.7.7 0 0 0 0-1 .7.7 0 0 0-1 0l-7.4 7.3z" fill-rule="evenodd"/></svg>',
        'settings': '<svg width="24" height="24"><path d="M11 6h8c.6 0 1 .4 1 1s-.4 1-1 1h-8v.3c0 .2 0 .3-.2.5l-.6.2H7.8c-.3 0-.4 0-.6-.2a.7.7 0 0 1-.2-.6V8H5a1 1 0 1 1 0-2h2v-.3c0-.2 0-.3.2-.5l.5-.2h2.5c.3 0 .4 0 .6.2l.2.5V6zM8 8h2V6H8v2zm9 2.8v.2h2c.6 0 1 .4 1 1s-.4 1-1 1h-2v.3c0 .2 0 .3-.2.5l-.6.2h-2.4c-.3 0-.4 0-.6-.2a.7.7 0 0 1-.2-.6V13H5a1 1 0 0 1 0-2h8v-.3c0-.2 0-.3.2-.5l.6-.2h2.4c.3 0 .4 0 .6.2l.2.6zM14 13h2v-2h-2v2zm-3 2.8v.2h8c.6 0 1 .4 1 1s-.4 1-1 1h-8v.3c0 .2 0 .3-.2.5l-.6.2H7.8c-.3 0-.4 0-.6-.2a.7.7 0 0 1-.2-.6V18H5a1 1 0 0 1 0-2h2v-.3c0-.2 0-.3.2-.5l.5-.2h2.5c.3 0 .4 0 .6.2l.2.6zM8 18h2v-2H8v2z" fill-rule="evenodd"/></svg>',
        'sharpen': '<svg width="24" height="24"><path d="M16 6l4 4-8 9-8-9 4-4h8zm-4 10.2l5.5-6.2-.1-.1H12v-.3h5.1l-.2-.2H12V9h4.6l-.2-.2H12v-.3h4.1l-.2-.2H12V8h3.6l-.2-.2H8.7L6.5 10l.1.1H12v.3H6.9l.2.2H12v.3H7.3l.2.2H12v.3H7.7l.3.2h4v.3H8.2l.2.2H12v.3H8.6l.3.2H12v.3H9l.3.2H12v.3H9.5l.2.2H12v.3h-2l.2.2H12v.3h-1.6l.2.2H12v.3h-1.1l.2.2h.9v.3h-.7l.2.2h.5v.3h-.3l.3.2z" fill-rule="evenodd"/></svg>',
        'sourcecode': '<svg width="24" height="24"><g fill-rule="nonzero"><path d="M9.8 15.7c.3.3.3.8 0 1-.3.4-.9.4-1.2 0l-4.4-4.1a.8.8 0 0 1 0-1.2l4.4-4.2c.3-.3.9-.3 1.2 0 .3.3.3.8 0 1.1L6 12l3.8 3.7zM14.2 15.7c-.3.3-.3.8 0 1 .4.4.9.4 1.2 0l4.4-4.1c.3-.3.3-.9 0-1.2l-4.4-4.2a.8.8 0 0 0-1.2 0c-.3.3-.3.8 0 1.1L18 12l-3.8 3.7z"/></g></svg>',
        'spell-check': '<svg width="24" height="24"><path d="M6 8v3H5V5c0-.3.1-.5.3-.7.2-.2.4-.3.7-.3h2c.3 0 .5.1.7.3.2.2.3.4.3.7v6H8V8H6zm0-3v2h2V5H6zm13 0h-3v5h3v1h-3a1 1 0 0 1-.7-.3 1 1 0 0 1-.3-.7V5c0-.3.1-.5.3-.7.2-.2.4-.3.7-.3h3v1zm-5 1.5l-.1.7c-.1.2-.3.3-.6.3.3 0 .5.1.6.3l.1.7V10c0 .3-.1.5-.3.7a1 1 0 0 1-.7.3h-3V4h3c.3 0 .5.1.7.3.2.2.3.4.3.7v1.5zM13 10V8h-2v2h2zm0-3V5h-2v2h2zm3 5l1 1-6.5 7L7 15.5l1.3-1 2.2 2.2L16 12z" fill-rule="evenodd"/></svg>',
        'strike-through': '<svg width="24" height="24"><g fill-rule="evenodd"><path d="M15.6 8.5c-.5-.7-1-1.1-1.3-1.3-.6-.4-1.3-.6-2-.6-2.7 0-2.8 1.7-2.8 2.1 0 1.6 1.8 2 3.2 2.3 4.4.9 4.6 2.8 4.6 3.9 0 1.4-.7 4.1-5 4.1A6.2 6.2 0 0 1 7 16.4l1.5-1.1c.4.6 1.6 2 3.7 2 1.6 0 2.5-.4 3-1.2.4-.8.3-2-.8-2.6-.7-.4-1.6-.7-2.9-1-1-.2-3.9-.8-3.9-3.6C7.6 6 10.3 5 12.4 5c2.9 0 4.2 1.6 4.7 2.4l-1.5 1.1z"/><path d="M5 11h14a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2z" fill-rule="nonzero"/></g></svg>',
        'subscript': '<svg width="24" height="24"><path d="M10.4 10l4.6 4.6-1.4 1.4L9 11.4 4.4 16 3 14.6 7.6 10 3 5.4 4.4 4 9 8.6 13.6 4 15 5.4 10.4 10zM21 19h-5v-1l1-.8 1.7-1.6c.3-.4.5-.8.5-1.2 0-.3 0-.6-.2-.7-.2-.2-.5-.3-.9-.3a2 2 0 0 0-.8.2l-.7.3-.4-1.1 1-.6 1.2-.2c.8 0 1.4.3 1.8.7.4.4.6.9.6 1.5s-.2 1.1-.5 1.6a8 8 0 0 1-1.3 1.3l-.6.6h2.6V19z" fill-rule="nonzero"/></svg>',
        'superscript': '<svg width="24" height="24"><path d="M15 9.4L10.4 14l4.6 4.6-1.4 1.4L9 15.4 4.4 20 3 18.6 7.6 14 3 9.4 4.4 8 9 12.6 13.6 8 15 9.4zm5.9 1.6h-5v-1l1-.8 1.7-1.6c.3-.5.5-.9.5-1.3 0-.3 0-.5-.2-.7-.2-.2-.5-.3-.9-.3l-.8.2-.7.4-.4-1.2c.2-.2.5-.4 1-.5.3-.2.8-.2 1.2-.2.8 0 1.4.2 1.8.6.4.4.6 1 .6 1.6 0 .5-.2 1-.5 1.5l-1.3 1.4-.6.5h2.6V11z" fill-rule="nonzero"/></svg>',
        'table-cell-properties': '<svg width="24" height="24"><path d="M4 5h16v14H4V5zm10 10h-4v3h4v-3zm0-8h-4v3h4V7zM9 7H5v3h4V7zm-4 4v3h4v-3H5zm10 0v3h4v-3h-4zm0-1h4V7h-4v3zM5 15v3h4v-3H5zm10 3h4v-3h-4v3z" fill-rule="evenodd"/></svg>',
        'table-cell-select-all': '<svg width="24" height="24"><path d="M12.5 5.5v6h6v-6h-6zm-1 0h-6v6h6v-6zm1 13h6v-6h-6v6zm-1 0v-6h-6v6h6zm-7-14h15v15h-15v-15z" fill-rule="nonzero"/></svg>',
        'table-cell-select-inner': '<svg width="24" height="24"><g fill-rule="nonzero"><path d="M5.5 5.5v13h13v-13h-13zm-1-1h15v15h-15v-15z" opacity=".2"/><path d="M11.5 11.5v-7h1v7h7v1h-7v7h-1v-7h-7v-1h7z"/></g></svg>',
        'table-delete-column': '<svg width="24" height="24"><path d="M9 11.2l1 1v.2l-1 1v-2.2zm5 1l1-1v2.2l-1-1v-.2zM20 5v14H4V5h16zm-1 2h-4v.8l-.2-.2-.8.8V7h-4v1.4l-.8-.8-.2.2V7H5v11h4v-1.8l.5.5.5-.4V18h4v-1.8l.8.8.2-.3V18h4V7zm-3.9 3.4l-1.8 1.9 1.8 1.9c.4.3.4.9 0 1.2-.3.3-.8.3-1.2 0L12 13.5l-1.8 1.9a.8.8 0 0 1-1.2 0 .9.9 0 0 1 0-1.2l1.8-1.9-1.9-2a.9.9 0 0 1 1.2-1.2l2 2 1.8-1.8c.3-.4.9-.4 1.2 0a.8.8 0 0 1 0 1.1z" fill-rule="evenodd"/></svg>',
        'table-delete-row': '<svg width="24" height="24"><path d="M16.7 8.8l1.1 1.2-2.4 2.5L18 15l-1.2 1.2-2.5-2.5-2.4 2.5-1.3-1.2 2.5-2.5-2.5-2.5 1.2-1.3 2.6 2.6 2.4-2.5zM4 5h16v14H4V5zm15 5V7H5v3h4.8l1 1H5v3h5.8l-1 1H5v3h14v-3h-.4l-1-1H19v-3h-1.3l1-1h.3z" fill-rule="evenodd"/></svg>',
        'table-delete-table': '<svg width="24" height="26"><path d="M4 6h16v14H4V6zm1 2v11h14V8H5zm11.7 8.7l-1.5 1.5L12 15l-3.3 3.2-1.4-1.5 3.2-3.2-3.3-3.2 1.5-1.5L12 12l3.2-3.2 1.5 1.5-3.2 3.2 3.2 3.2z" fill-rule="evenodd"/></svg>',
        'table-insert-column-after': '<svg width="24" height="24"><path d="M14.3 9c.4 0 .7.3.7.6v2.2h2.1c.4 0 .7.3.7.7 0 .4-.3.7-.7.7H15v2.2c0 .3-.3.6-.7.6a.7.7 0 0 1-.6-.6v-2.2h-2.2a.7.7 0 0 1 0-1.4h2.2V9.6c0-.3.3-.6.6-.6zM4 5h16v14H4V5zm5 13v-3H5v3h4zm0-4v-3H5v3h4zm0-4V7H5v3h4zm10 8V7h-9v11h9z" fill-rule="evenodd"/></svg>',
        'table-insert-column-before': '<svg width="24" height="24"><path d="M9.7 16a.7.7 0 0 1-.7-.6v-2.2H6.9a.7.7 0 0 1 0-1.4H9V9.6c0-.3.3-.6.7-.6.3 0 .6.3.6.6v2.2h2.2c.4 0 .8.3.8.7 0 .4-.4.7-.8.7h-2.2v2.2c0 .3-.3.6-.6.6zM4 5h16v14H4V5zm10 13V7H5v11h9zm5 0v-3h-4v3h4zm0-4v-3h-4v3h4zm0-4V7h-4v3h4z" fill-rule="evenodd"/></svg>',
        'table-insert-row-above': '<svg width="24" height="24"><path d="M14.8 10.5c0 .3-.2.5-.5.5h-1.8v1.8c0 .3-.2.5-.5.5a.5.5 0 0 1-.5-.6V11H9.7a.5.5 0 0 1 0-1h1.8V8.3c0-.3.2-.6.5-.6s.5.3.5.6V10h1.8c.3 0 .5.2.5.5zM4 5h16v14H4V5zm5 13v-3H5v3h4zm5 0v-3h-4v3h4zm5 0v-3h-4v3h4zm0-4V7H5v7h14z" fill-rule="evenodd"/></svg>',
        'table-insert-row-after': '<svg width="24" height="24"><path d="M9.2 14.5c0-.3.2-.5.5-.5h1.8v-1.8c0-.3.2-.5.5-.5s.5.2.5.6V14h1.8c.3 0 .5.2.5.5s-.2.5-.5.5h-1.8v1.7c0 .3-.2.6-.5.6a.5.5 0 0 1-.5-.6V15H9.7a.5.5 0 0 1-.5-.5zM4 5h16v14H4V5zm6 2v3h4V7h-4zM5 7v3h4V7H5zm14 11v-7H5v7h14zm0-8V7h-4v3h4z" fill-rule="evenodd"/></svg>',
        'table-left-header': '<svg width="24" height="24"><path d="M4 5h16v13H4V5zm10 12v-3h-4v3h4zm0-4v-3h-4v3h4zm0-4V6h-4v3h4zm5 8v-3h-4v3h4zm0-4v-3h-4v3h4zm0-4V6h-4v3h4z" fill-rule="evenodd"/></svg>',
        'table-merge-cells': '<svg width="24" height="24"><path d="M4 5h16v14H4V5zm6 13h9v-7h-9v7zm4-11h-4v3h4V7zM9 7H5v3h4V7zm-4 4v3h4v-3H5zm10-1h4V7h-4v3zM5 15v3h4v-3H5z" fill-rule="evenodd"/></svg>',
        'table-row-properties': '<svg width="24" height="24"><path d="M4 5h16v14H4V5zm10 10h-4v3h4v-3zm0-8h-4v3h4V7zM9 7H5v3h4V7zm6 3h4V7h-4v3zM5 15v3h4v-3H5zm10 3h4v-3h-4v3z" fill-rule="evenodd"/></svg>',
        'table-split-cells': '<svg width="24" height="24"><path d="M4 5h16v14H4V5zm6 2v3h4V7h-4zM9 18v-3H5v3h4zm0-4v-3H5v3h4zm0-4V7H5v3h4zm10 8v-7h-9v7h9zm0-8V7h-4v3h4zm-3.5 4.5l1.5 1.6c.3.2.3.7 0 1-.2.2-.7.2-1 0l-1.5-1.6-1.6 1.5c-.2.3-.7.3-1 0a.7.7 0 0 1 0-1l1.6-1.5-1.5-1.6a.7.7 0 0 1 1-1l1.5 1.6 1.6-1.5c.2-.3.7-.3 1 0 .2.2.2.7 0 1l-1.6 1.5z" fill-rule="evenodd"/></svg>',
        'table-top-header': '<svg width="24" height="24"><path d="M4 5h16v13H4V5zm5 12v-3H5v3h4zm0-4v-3H5v3h4zm5 4v-3h-4v3h4zm0-4v-3h-4v3h4zm5 4v-3h-4v3h4zm0-4v-3h-4v3h4z" fill-rule="evenodd"/></svg>',
        'table': '<svg width="24" height="24"><path d="M4 5h16v14H4V5zm6 9h4v-3h-4v3zm4 1h-4v3h4v-3zm0-8h-4v3h4V7zM9 7H5v3h4V7zm-4 4v3h4v-3H5zm10 0v3h4v-3h-4zm0-1h4V7h-4v3zM5 15v3h4v-3H5zm10 3h4v-3h-4v3z" fill-rule="evenodd"/></svg>',
        'template': '<svg width="24" height="24"><path d="M19 19v-1H5v1h14zM9 16v-4a5 5 0 1 1 6 0v4h4a2 2 0 0 1 2 2v3H3v-3c0-1.1.9-2 2-2h4zm4 0v-5l.8-.6a3 3 0 1 0-3.6 0l.8.6v5h2z" fill-rule="nonzero"/></svg>',
        'temporary-placeholder': '<svg width="24" height="24"><path d="M20.5 2.5c-.8 0-1.5.7-1.5 1.5a1.5 1.5 0 0 1-3 0 3 3 0 0 0-6 0v2H8.5c-.3 0-.5.2-.5.5v1a8 8 0 1 0 6 0v-1c0-.3-.2-.5-.5-.5H11V4a2 2 0 0 1 4 0 2.5 2.5 0 0 0 5 0c0-.3.2-.5.5-.5a.5.5 0 0 0 0-1zM8.1 10.9a5 5 0 0 0-1.2 7 .5.5 0 0 1-.8.5 6 6 0 0 1 1.5-8.3.5.5 0 1 1 .5.8z" fill-rule="nonzero"/></svg>',
        'text-color': '<svg width="24" height="24"><g fill-rule="evenodd"><path id="tox-icon-text-color__color" d="M3 18h18v3H3z"/><path d="M8.7 16h-.8a.5.5 0 0 1-.5-.6l2.7-9c.1-.3.3-.4.5-.4h2.8c.2 0 .4.1.5.4l2.7 9a.5.5 0 0 1-.5.6h-.8a.5.5 0 0 1-.4-.4l-.7-2.2c0-.3-.3-.4-.5-.4h-3.4c-.2 0-.4.1-.5.4l-.7 2.2c0 .3-.2.4-.4.4zm2.6-7.6l-.6 2a.5.5 0 0 0 .5.6h1.6a.5.5 0 0 0 .5-.6l-.6-2c0-.3-.3-.4-.5-.4h-.4c-.2 0-.4.1-.5.4z"/></g></svg>',
        'toc': '<svg width="24" height="24"><path d="M5 5c.6 0 1 .4 1 1s-.4 1-1 1a1 1 0 1 1 0-2zm3 0h11c.6 0 1 .4 1 1s-.4 1-1 1H8a1 1 0 1 1 0-2zm-3 8c.6 0 1 .4 1 1s-.4 1-1 1a1 1 0 0 1 0-2zm3 0h11c.6 0 1 .4 1 1s-.4 1-1 1H8a1 1 0 0 1 0-2zm0-4c.6 0 1 .4 1 1s-.4 1-1 1a1 1 0 1 1 0-2zm3 0h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 0 1 0-2zm-3 8c.6 0 1 .4 1 1s-.4 1-1 1a1 1 0 0 1 0-2zm3 0h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 0 1 0-2z" fill-rule="evenodd"/></svg>',
        'translate': '<svg width="24" height="24"><path d="M12.7 14.3l-.3.7-.4.7-2.2-2.2-3.1 3c-.3.4-.8.4-1 0a.7.7 0 0 1 0-1l3.1-3A12.4 12.4 0 0 1 6.7 9H8a10.1 10.1 0 0 0 1.7 2.4c.5-.5 1-1.1 1.4-1.8l.9-2H4.7a.7.7 0 1 1 0-1.5h4.4v-.7c0-.4.3-.8.7-.8.4 0 .7.4.7.8v.7H15c.4 0 .8.3.8.7 0 .4-.4.8-.8.8h-1.4a12.3 12.3 0 0 1-1 2.4 13.5 13.5 0 0 1-1.7 2.3l1.9 1.8zm4.3-3l2.7 7.3a.5.5 0 0 1-.4.7 1 1 0 0 1-1-.7l-.6-1.5h-3.4l-.6 1.5a1 1 0 0 1-1 .7.5.5 0 0 1-.4-.7l2.7-7.4a1 1 0 1 1 2 0zm-2.2 4.4h2.4L16 12.5l-1.2 3.2z" fill-rule="evenodd"/></svg>',
        'underline': '<svg width="24" height="24"><path d="M16 5c.6 0 1 .4 1 1v5.5a4 4 0 0 1-.4 1.8l-1 1.4a5.3 5.3 0 0 1-5.5 1 5 5 0 0 1-1.6-1c-.5-.4-.8-.9-1.1-1.4a4 4 0 0 1-.4-1.8V6c0-.6.4-1 1-1s1 .4 1 1v5.5c0 .3 0 .6.2 1l.6.7a3.3 3.3 0 0 0 2.2.8 3.4 3.4 0 0 0 2.2-.8c.3-.2.4-.5.6-.8l.2-.9V6c0-.6.4-1 1-1zM8 17h8c.6 0 1 .4 1 1s-.4 1-1 1H8a1 1 0 0 1 0-2z" fill-rule="evenodd"/></svg>',
        'undo': '<svg width="24" height="24"><path d="M6.4 8H12c3.7 0 6.2 2 6.8 5.1.6 2.7-.4 5.6-2.3 6.8a1 1 0 0 1-1-1.8c1.1-.6 1.8-2.7 1.4-4.6-.5-2.1-2.1-3.5-4.9-3.5H6.4l3.3 3.3a1 1 0 1 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 1.4L6.4 8z" fill-rule="nonzero"/></svg>',
        'unlink': '<svg width="24" height="24"><path d="M6.2 12.3a1 1 0 0 1 1.4 1.4l-2 2a2 2 0 1 0 2.6 2.8l4.8-4.8a1 1 0 0 0 0-1.4 1 1 0 1 1 1.4-1.3 2.9 2.9 0 0 1 0 4L9.6 20a3.9 3.9 0 0 1-5.5-5.5l2-2zm11.6-.6a1 1 0 0 1-1.4-1.4l2.1-2a2 2 0 1 0-2.7-2.8L11 10.3a1 1 0 0 0 0 1.4A1 1 0 1 1 9.6 13a2.9 2.9 0 0 1 0-4L14.4 4a3.9 3.9 0 0 1 5.5 5.5l-2 2zM7.6 6.3a.8.8 0 0 1-1 1.1L3.3 4.2a.7.7 0 1 1 1-1l3.2 3.1zM5.1 8.6a.8.8 0 0 1 0 1.5H3a.8.8 0 0 1 0-1.5H5zm5-3.5a.8.8 0 0 1-1.5 0V3a.8.8 0 0 1 1.5 0V5zm6 11.8a.8.8 0 0 1 1-1l3.2 3.2a.8.8 0 0 1-1 1L16 17zm-2.2 2a.8.8 0 0 1 1.5 0V21a.8.8 0 0 1-1.5 0V19zm5-3.5a.7.7 0 1 1 0-1.5H21a.8.8 0 0 1 0 1.5H19z" fill-rule="nonzero"/></svg>',
        'unlock': '<svg width="24" height="24"><path d="M16 5c.8 0 1.5.3 2.1.9.6.6.9 1.3.9 2.1v3h-2V8a1 1 0 0 0-.3-.7A1 1 0 0 0 16 7h-2a1 1 0 0 0-.7.3 1 1 0 0 0-.3.7v3h.3c.2 0 .3 0 .5.2l.2.6v7.4c0 .3 0 .4-.2.6l-.6.2H4.8c-.3 0-.4 0-.6-.2a.7.7 0 0 1-.2-.6v-7.4c0-.3 0-.4.2-.6l.5-.2H11V8c0-.8.3-1.5.9-2.1.6-.6 1.3-.9 2.1-.9h2z" fill-rule="evenodd"/></svg>',
        'unordered-list': '<svg width="24" height="24"><path d="M11 5h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 0 1 0-2zm0 6h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 0 1 0-2zm0 6h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 0 1 0-2zM4.5 6c0-.4.1-.8.4-1 .3-.4.7-.5 1.1-.5.4 0 .8.1 1 .4.4.3.5.7.5 1.1 0 .4-.1.8-.4 1-.3.4-.7.5-1.1.5-.4 0-.8-.1-1-.4-.4-.3-.5-.7-.5-1.1zm0 6c0-.4.1-.8.4-1 .3-.4.7-.5 1.1-.5.4 0 .8.1 1 .4.4.3.5.7.5 1.1 0 .4-.1.8-.4 1-.3.4-.7.5-1.1.5-.4 0-.8-.1-1-.4-.4-.3-.5-.7-.5-1.1zm0 6c0-.4.1-.8.4-1 .3-.4.7-.5 1.1-.5.4 0 .8.1 1 .4.4.3.5.7.5 1.1 0 .4-.1.8-.4 1-.3.4-.7.5-1.1.5-.4 0-.8-.1-1-.4-.4-.3-.5-.7-.5-1.1z" fill-rule="evenodd"/></svg>',
        'unselected': '<svg width="24" height="24"><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-1a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" fill-rule="evenodd"/></svg>',
        'upload': '<svg width="24" height="24"><path d="M18 19v-2a1 1 0 0 1 2 0v3c0 .6-.4 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 2 0v2h12zM11 6.4L8.7 8.7a1 1 0 0 1-1.4-1.4l4-4a1 1 0 0 1 1.4 0l4 4a1 1 0 1 1-1.4 1.4L13 6.4V16a1 1 0 0 1-2 0V6.4z" fill-rule="nonzero"/></svg>',
        'user': '<svg width="24" height="24"><path d="M12 24a12 12 0 1 1 0-24 12 12 0 0 1 0 24zm-8.7-5.3a11 11 0 0 0 17.4 0C19.4 16.3 14.6 15 12 15c-2.6 0-7.4 1.3-8.7 3.7zM12 13c2.2 0 4-2 4-4.5S14.2 4 12 4 8 6 8 8.5 9.8 13 12 13z" fill-rule="nonzero"/></svg>',
        'warning': '<svg width="24" height="24"><path d="M19.8 18.3c.2.5.3.9 0 1.2-.1.3-.5.5-1 .5H5.2c-.5 0-.9-.2-1-.5-.3-.3-.2-.7 0-1.2L11 4.7l.5-.5.5-.2c.2 0 .3 0 .5.2.2 0 .3.3.5.5l6.8 13.6zM12 18c.3 0 .5-.1.7-.3.2-.2.3-.4.3-.7a1 1 0 0 0-.3-.7 1 1 0 0 0-.7-.3 1 1 0 0 0-.7.3 1 1 0 0 0-.3.7c0 .3.1.5.3.7.2.2.4.3.7.3zm.7-3l.3-4a1 1 0 0 0-.3-.7 1 1 0 0 0-.7-.3 1 1 0 0 0-.7.3 1 1 0 0 0-.3.7l.3 4h1.4z" fill-rule="evenodd"/></svg>',
        'zoom-in': '<svg width="24" height="24"><path d="M16 17.3a8 8 0 1 1 1.4-1.4l4.3 4.4a1 1 0 0 1-1.4 1.4l-4.4-4.3zm-5-.3a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm-1-9a1 1 0 0 1 2 0v6a1 1 0 0 1-2 0V8zm-2 4a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2H8z" fill-rule="nonzero"/></svg>',
        'zoom-out': '<svg width="24" height="24"><path d="M16 17.3a8 8 0 1 1 1.4-1.4l4.3 4.4a1 1 0 0 1-1.4 1.4l-4.4-4.3zm-5-.3a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm-3-5a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2H8z" fill-rule="nonzero"/></svg>'
      };
    };

    var defaultIcons = getAll();
    var defaultIcon = Option.from(defaultIcons['temporary-placeholder']).getOr('!not found!');
    var getDefault = function (name) {
      return Option.from(defaultIcons[name]).getOr(defaultIcon);
    };
    var getDefaultOr = function (name, fallback) {
      return Option.from(defaultIcons[name]).getOrThunk(function () {
        return fallback.getOr(defaultIcon);
      });
    };
    var get$e = function (name, icons) {
      return Option.from(icons()[name]).getOrThunk(function () {
        return getDefault(name);
      });
    };
    var getOr = function (name, icons, fallback) {
      return Option.from(icons()[name]).getOrThunk(function () {
        return getDefaultOr(name, fallback);
      });
    };
    var getDefaultFirst = function (names) {
      return findMap(names, function (name) {
        return Option.from(defaultIcons[name]);
      }).getOr(defaultIcon);
    };
    var getFirst$1 = function (names, icons) {
      return findMap(names, function (name) {
        return Option.from(icons()[name]);
      }).getOrThunk(function () {
        return getDefaultFirst(names);
      });
    };

    var notificationIconMap = {
      success: 'checkmark',
      error: 'warning',
      err: 'error',
      warning: 'warning',
      warn: 'warning',
      info: 'info'
    };
    var factory$2 = function (detail) {
      var memBannerText = record({
        dom: {
          tag: 'p',
          innerHtml: detail.translationProvider(detail.text)
        },
        behaviours: derive$1([Replacing.config({})])
      });
      var renderPercentBar = function (percent) {
        return {
          dom: {
            tag: 'div',
            classes: ['tox-bar'],
            attributes: { style: 'width: ' + percent + '%' }
          }
        };
      };
      var renderPercentText = function (percent) {
        return {
          dom: {
            tag: 'div',
            classes: ['tox-text'],
            innerHtml: percent + '%'
          }
        };
      };
      var memBannerProgress = record({
        dom: {
          tag: 'div',
          classes: detail.progress ? [
            'tox-progress-bar',
            'tox-progress-indicator'
          ] : ['tox-progress-bar']
        },
        components: [
          {
            dom: {
              tag: 'div',
              classes: ['tox-bar-container']
            },
            components: [renderPercentBar(0)]
          },
          renderPercentText(0)
        ],
        behaviours: derive$1([Replacing.config({})])
      });
      var updateProgress = function (comp, percent) {
        if (comp.getSystem().isConnected()) {
          memBannerProgress.getOpt(comp).each(function (progress) {
            Replacing.set(progress, [
              {
                dom: {
                  tag: 'div',
                  classes: ['tox-bar-container']
                },
                components: [renderPercentBar(percent)]
              },
              renderPercentText(percent)
            ]);
          });
        }
      };
      var updateText = function (comp, text$$1) {
        if (comp.getSystem().isConnected()) {
          var banner = memBannerText.get(comp);
          Replacing.set(banner, [text(text$$1)]);
        }
      };
      var apis = {
        updateProgress: updateProgress,
        updateText: updateText
      };
      var iconChoices = flatten([
        detail.icon.toArray(),
        detail.level.toArray(),
        detail.level.bind(function (level) {
          return Option.from(notificationIconMap[level]);
        }).toArray()
      ]);
      return {
        uid: detail.uid,
        dom: {
          tag: 'div',
          attributes: { role: 'alert' },
          classes: detail.level.map(function (level) {
            return [
              'tox-notification',
              'tox-notification--in',
              'tox-notification--' + level
            ];
          }).getOr([
            'tox-notification',
            'tox-notification--in'
          ])
        },
        components: [
          {
            dom: {
              tag: 'div',
              classes: ['tox-notification__icon'],
              innerHtml: getFirst$1(iconChoices, detail.iconProvider)
            }
          },
          {
            dom: {
              tag: 'div',
              classes: ['tox-notification__body']
            },
            components: [memBannerText.asSpec()],
            behaviours: derive$1([Replacing.config({})])
          }
        ].concat(detail.progress ? [memBannerProgress.asSpec()] : []).concat(Button.sketch({
          dom: {
            tag: 'button',
            classes: [
              'tox-notification__dismiss',
              'tox-button',
              'tox-button--naked',
              'tox-button--icon'
            ]
          },
          components: [{
              dom: {
                tag: 'div',
                classes: ['tox-icon'],
                innerHtml: get$e('close', detail.iconProvider),
                attributes: { 'aria-label': detail.translationProvider('Close') }
              }
            }],
          action: function (comp) {
            detail.onAction(comp);
          }
        })),
        apis: apis
      };
    };
    var Notification = single$2({
      name: 'Notification',
      factory: factory$2,
      configFields: [
        option('level'),
        strict$1('progress'),
        strict$1('icon'),
        strict$1('onAction'),
        strict$1('text'),
        strict$1('iconProvider'),
        strict$1('translationProvider')
      ],
      apis: {
        updateProgress: function (apis, comp, percent) {
          apis.updateProgress(comp, percent);
        },
        updateText: function (apis, comp, text$$1) {
          apis.updateText(comp, text$$1);
        }
      }
    });

    function NotificationManagerImpl (editor, extras, uiMothership) {
      var backstage = extras.backstage;
      var getEditorContainer = function (editor) {
        return editor.inline ? editor.getElement() : editor.getContentAreaContainer();
      };
      var prePositionNotifications = function (notifications) {
        each(notifications, function (notification) {
          notification.moveTo(0, 0);
        });
      };
      var positionNotifications = function (notifications) {
        if (notifications.length > 0) {
          var firstItem = notifications.slice(0, 1)[0];
          var container = getEditorContainer(editor);
          firstItem.moveRel(container, 'tc-tc');
          each(notifications, function (notification, index) {
            if (index > 0) {
              notification.moveRel(notifications[index - 1].getEl(), 'bc-tc');
            }
          });
        }
      };
      var reposition = function (notifications) {
        prePositionNotifications(notifications);
        positionNotifications(notifications);
      };
      var open = function (settings, closeCallback) {
        var close = function () {
          closeCallback();
          InlineView.hide(notificationWrapper);
        };
        var notification = build$1(Notification.sketch({
          text: settings.text,
          level: contains([
            'success',
            'error',
            'warning',
            'info'
          ], settings.type) ? settings.type : undefined,
          progress: settings.progressBar === true ? true : false,
          icon: Option.from(settings.icon),
          onAction: close,
          iconProvider: backstage.shared.providers.icons,
          translationProvider: backstage.shared.providers.translate
        }));
        var notificationWrapper = build$1(InlineView.sketch({
          dom: {
            tag: 'div',
            classes: ['tox-notifications-container']
          },
          lazySink: extras.backstage.shared.getSink,
          fireDismissalEventInstead: {}
        }));
        uiMothership.add(notificationWrapper);
        if (settings.timeout) {
          setTimeout(function () {
            close();
          }, settings.timeout);
        }
        return {
          close: close,
          moveTo: function (x, y) {
            InlineView.showAt(notificationWrapper, {
              anchor: 'makeshift',
              x: x,
              y: y
            }, premade$1(notification));
          },
          moveRel: function (element, rel) {
            InlineView.showAt(notificationWrapper, extras.backstage.shared.anchors.banner(), premade$1(notification));
          },
          text: function (nuText) {
            Notification.updateText(notification, nuText);
          },
          settings: settings,
          getEl: function () {
          },
          progressBar: {
            value: function (percent) {
              Notification.updateProgress(notification, percent);
            }
          }
        };
      };
      var close = function (notification) {
        notification.close();
      };
      var getArgs = function (notification) {
        return notification.settings;
      };
      return {
        open: open,
        close: close,
        reposition: reposition,
        getArgs: getArgs
      };
    }

    var last$3 = function (fn, rate) {
      var timer = null;
      var cancel = function () {
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }
      };
      var throttle = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        if (timer !== null)
          clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(null, args);
          timer = null;
        }, rate);
      };
      return {
        cancel: cancel,
        throttle: throttle
      };
    };

    var isValidTextRange = function (rng) {
      return rng.collapsed && rng.startContainer.nodeType === 3;
    };
    var whiteSpace = /[\u00a0 \t\r\n]/;
    var parse$1 = function (text, index, ch, minChars) {
      var i;
      for (i = index - 1; i >= 0; i--) {
        if (whiteSpace.test(text.charAt(i))) {
          return Option.none();
        }
        if (text.charAt(i) === ch) {
          break;
        }
      }
      if (i === -1 || index - i < minChars) {
        return Option.none();
      }
      return Option.some(text.substring(i + 1, index));
    };
    var getContext = function (initRange, ch, text, index, minChars) {
      if (minChars === void 0) {
        minChars = 0;
      }
      if (!isValidTextRange(initRange)) {
        return Option.none();
      }
      return parse$1(text, index, ch, minChars).map(function (newText) {
        var rng = initRange.cloneRange();
        rng.setStart(initRange.startContainer, initRange.startOffset - newText.length - 1);
        rng.setEnd(initRange.startContainer, initRange.startOffset);
        return {
          text: newText,
          rng: rng
        };
      });
    };

    var setup = function (api, editor) {
      editor.on('keypress', api.onKeypress.throttle);
      editor.on('remove', api.onKeypress.cancel);
      var redirectKeyToItem = function (item, e) {
        emitWith(item, keydown(), { raw: e });
      };
      editor.on('keydown', function (e) {
        var getItem = function () {
          return api.getView().bind(Highlighting.getHighlighted);
        };
        if (e.which === 8) {
          api.onKeypress.throttle(e);
        }
        if (api.isActive()) {
          if (e.which === 27) {
            api.closeIfNecessary();
          } else if (e.which === 32) {
            api.closeIfNecessary();
          } else if (e.which === 13) {
            getItem().each(emitExecute);
            e.preventDefault();
          } else if (e.which === 40) {
            getItem().fold(function () {
              api.getView().each(Highlighting.highlightFirst);
            }, function (item) {
              redirectKeyToItem(item, e);
            });
            e.preventDefault();
          } else if (e.which === 37 || e.which === 38 || e.which === 39) {
            getItem().each(function (item) {
              redirectKeyToItem(item, e);
              e.preventDefault();
            });
          }
        }
      });
    };
    var AutocompleterEditorEvents = { setup: setup };

    var global$1 = tinymce.util.Tools.resolve('tinymce.util.Promise');

    var getTriggerContext = function (initRange, initText, database) {
      return findMap(database.triggerChars, function (ch) {
        return getContext(initRange, ch, initText, initRange.startOffset).map(function (_a) {
          var rng = _a.rng, text = _a.text;
          return {
            range: rng,
            text: text,
            triggerChar: ch
          };
        });
      });
    };
    var lookup = function (editor, getDatabase) {
      var database = getDatabase();
      var rng = editor.selection.getRng();
      var startText = rng.startContainer.nodeValue;
      return getTriggerContext(rng, startText, database).map(function (context) {
        var autocompleters = filter(database.lookupByChar(context.triggerChar), function (autocompleter) {
          return context.text.length >= autocompleter.minChars && autocompleter.matches(context.range, startText, context.text);
        });
        var lookupData = global$1.all(map(autocompleters, function (ac) {
          var fetchResult = ac.fetch(context.text, ac.maxResults);
          return fetchResult.then(function (results) {
            return {
              items: results,
              columns: ac.columns,
              onAction: ac.onAction
            };
          });
        }));
        return {
          lookupData: lookupData,
          triggerChar: context.triggerChar,
          range: context.range
        };
      });
    };

    var autocompleterItemSchema = objOf([
      state$1('type', function () {
        return 'autocompleteitem';
      }),
      state$1('active', function () {
        return false;
      }),
      state$1('disabled', function () {
        return false;
      }),
      defaulted$1('meta', {}),
      strictString('value'),
      optionString('text'),
      optionString('icon')
    ]);
    var autocompleterSchema = objOf([
      strictString('type'),
      strictString('ch'),
      defaultedNumber('minChars', 0),
      defaulted$1('columns', 1),
      defaultedNumber('maxResults', 10),
      defaultedFunction('matches', function () {
        return true;
      }),
      strictFunction('fetch'),
      strictFunction('onAction')
    ]);
    var createAutocompleterItem = function (spec) {
      return asRaw('Autocompleter.Item', autocompleterItemSchema, spec);
    };
    var createAutocompleter = function (spec) {
      return asRaw('Autocompleter', autocompleterSchema, spec);
    };

    var stringArray = function (a) {
      var all = {};
      each(a, function (key) {
        all[key] = {};
      });
      return keys(all);
    };

    var register = function (editor) {
      var popups = editor.ui.registry.getAll().popups;
      var dataset = map$1(popups, function (popup) {
        return createAutocompleter(popup).fold(function (err) {
          throw new Error(formatError(err));
        }, function (x) {
          return x;
        });
      });
      var triggerChars = stringArray(mapToArray(dataset, function (v) {
        return v.ch;
      }));
      var datasetValues = values(dataset);
      var lookupByChar = function (ch) {
        return filter(datasetValues, function (dv) {
          return dv.ch === ch;
        });
      };
      return {
        dataset: dataset,
        triggerChars: triggerChars,
        lookupByChar: lookupByChar
      };
    };

    var commonMenuItemFields = [
      defaultedBoolean('disabled', false),
      optionString('text'),
      optionString('shortcut'),
      field('value', 'value', defaultedThunk(function () {
        return generate$1('menuitem-value');
      }), anyValue$1()),
      defaulted$1('meta', {})
    ];

    var menuItemSchema = objOf([
      strictString('type'),
      defaultedFunction('onSetup', function () {
        return noop;
      }),
      defaultedFunction('onAction', noop),
      optionString('icon')
    ].concat(commonMenuItemFields));
    var createMenuItem = function (spec) {
      return asRaw('menuitem', menuItemSchema, spec);
    };

    var nestedMenuItemSchema = objOf([
      strictString('type'),
      strictFunction('getSubmenuItems'),
      defaultedFunction('onSetup', function () {
        return noop;
      }),
      optionString('icon')
    ].concat(commonMenuItemFields));
    var createNestedMenuItem = function (spec) {
      return asRaw('nestedmenuitem', nestedMenuItemSchema, spec);
    };

    var toggleMenuItemSchema = objOf([
      strictString('type'),
      defaultedBoolean('active', false),
      defaultedFunction('onSetup', function () {
        return noop;
      }),
      strictFunction('onAction')
    ].concat(commonMenuItemFields));
    var createToggleMenuItem = function (spec) {
      return asRaw('togglemenuitem', toggleMenuItemSchema, spec);
    };

    var choiceMenuItemSchema = objOf([
      strictString('type'),
      defaultedBoolean('active', false),
      optionString('icon')
    ].concat(commonMenuItemFields));
    var createChoiceMenuItem = function (spec) {
      return asRaw('choicemenuitem', choiceMenuItemSchema, spec);
    };

    var separatorMenuItemSchema = objOf([
      strictString('type'),
      optionString('text')
    ]);
    var createSeparatorMenuItem = function (spec) {
      return asRaw('separatormenuitem', separatorMenuItemSchema, spec);
    };

    var fancyMenuItemSchema = objOf([
      strictString('type'),
      strictStringEnum('fancytype', ['inserttable']),
      defaultedFunction('onAction', noop)
    ]);
    var createFancyMenuItem = function (spec) {
      return asRaw('fancymenuitem', fancyMenuItemSchema, spec);
    };

    var detectSize = function (comp, margin, selectorClass) {
      var descendants = descendants$1(comp.element(), '.' + selectorClass);
      if (descendants.length > 0) {
        var columnLength = findIndex(descendants, function (c) {
          var thisTop = c.dom().getBoundingClientRect().top;
          var cTop = descendants[0].dom().getBoundingClientRect().top;
          return Math.abs(thisTop - cTop) > margin;
        }).getOr(descendants.length);
        return Option.some({
          numColumns: columnLength,
          numRows: Math.ceil(descendants.length / columnLength)
        });
      } else {
        return Option.none();
      }
    };

    var namedEvents = function (name, handlers) {
      return derive$1([config(name, handlers)]);
    };
    var unnamedEvents = function (handlers) {
      return namedEvents(generate$1('unnamed-events'), handlers);
    };
    var SimpleBehaviours = {
      namedEvents: namedEvents,
      unnamedEvents: unnamedEvents
    };

    var navClass = 'tox-menu-nav__js';
    var selectableClass = 'tox-collection__item';
    var colorClass = 'tox-swatch';
    var presetClasses = {
      normal: navClass,
      color: colorClass
    };
    var tickedClass = 'tox-collection__item--enabled';
    var groupHeadingClass = 'tox-collection__group-heading';
    var iconClass = 'tox-collection__item-icon';
    var textClass = 'tox-collection__item-label';
    var accessoryClass = 'tox-collection__item-accessory';
    var caretClass = 'tox-collection__item-caret';
    var checkmarkClass = 'tox-collection__item-checkmark';
    var activeClass = 'tox-collection__item--active';
    var classForPreset = function (presets) {
      return readOptFrom$1(presetClasses, presets).getOr(navClass);
    };

    var getAttrs = function (elem) {
      var attributes = elem.dom().attributes !== undefined ? elem.dom().attributes : [];
      return foldl(attributes, function (b, attr) {
        var _a;
        if (attr.name === 'class') {
          return b;
        } else {
          return __assign({}, b, (_a = {}, _a[attr.name] = attr.value, _a));
        }
      }, {});
    };
    var getClasses = function (elem) {
      return Array.prototype.slice.call(elem.dom().classList, 0);
    };
    var fromHtml$2 = function (html) {
      var elem = Element$$1.fromHtml(html);
      var children$$1 = children(elem);
      var attrs = getAttrs(elem);
      var classes = getClasses(elem);
      var contents = children$$1.length === 0 ? {} : { innerHtml: get$1(elem) };
      return __assign({
        tag: name(elem),
        classes: classes,
        attributes: attrs
      }, contents);
    };
    var simple$1 = function (tag, classes, components) {
      return {
        dom: {
          tag: tag,
          classes: classes
        },
        components: components
      };
    };

    var global$2 = tinymce.util.Tools.resolve('tinymce.util.I18n');

    var global$3 = tinymce.util.Tools.resolve('tinymce.Env');

    var convertText = function (source) {
      var mac = {
        alt: '&#x2325;',
        ctrl: '&#x2303;',
        shift: '&#x21E7;',
        meta: '&#x2318;'
      };
      var other = { meta: 'Ctrl' };
      var replace = global$3.mac ? mac : other;
      var shortcut = source.split('+');
      var updated = map(shortcut, function (segment) {
        var search = segment.toLowerCase().trim();
        return has(replace, search) ? replace[search] : segment;
      });
      return global$3.mac ? updated.join('') : updated.join('+');
    };
    var ConvertShortcut = { convertText: convertText };

    var renderIcon = function (iconHtml) {
      return {
        dom: {
          tag: 'span',
          classes: [iconClass],
          innerHtml: iconHtml
        }
      };
    };
    var renderText = function (text$$1) {
      return {
        dom: {
          tag: 'span',
          classes: [textClass]
        },
        components: [text(global$2.translate(text$$1))]
      };
    };
    var renderShortcut = function (shortcut) {
      return {
        dom: {
          tag: 'span',
          classes: [accessoryClass],
          innerHtml: ConvertShortcut.convertText(shortcut)
        }
      };
    };
    var renderCheckmark = function (icons) {
      return {
        dom: {
          tag: 'span',
          classes: [
            iconClass,
            checkmarkClass
          ],
          innerHtml: get$e('checkmark', icons)
        }
      };
    };
    var renderSubmenuCaret = function (icons) {
      return {
        dom: {
          tag: 'span',
          classes: [caretClass],
          innerHtml: get$e('chevron-right', icons)
        }
      };
    };

    var renderColorStructure = function (itemText, itemValue, iconSvg) {
      var colorPickerCommand = 'custom';
      var removeColorCommand = 'remove';
      var getDom = function () {
        var common = colorClass;
        var icon = iconSvg.getOr('');
        var title = itemText.map(function (text) {
          return ' title="' + text + '"';
        }).getOr('');
        if (itemValue === colorPickerCommand) {
          return fromHtml$2('<button class="' + common + ' tox-swatches__picker-btn"' + title + '>' + icon + '</button>');
        } else if (itemValue === removeColorCommand) {
          return fromHtml$2('<div class="' + common + ' tox-swatch--remove"' + title + '>' + icon + '</div>');
        } else {
          return fromHtml$2('<div class="' + common + '" style="background-color: ' + itemValue + '" data-mce-color="' + itemValue + '"' + title + '></div>');
        }
      };
      return {
        dom: getDom(),
        optComponents: []
      };
    };
    var renderNormalItemStructure = function (info, icon) {
      var leftIcon = info.checkMark.orThunk(function () {
        return icon.or(Option.some('')).map(renderIcon);
      });
      var domTitle = info.ariaLabel.map(function (label) {
        return { attributes: { title: global$2.translate(label) } };
      }).getOr({});
      var dom = merge({
        tag: 'div',
        classes: [
          navClass,
          selectableClass
        ]
      }, domTitle);
      var menuItem = {
        dom: dom,
        optComponents: [
          leftIcon,
          info.textContent.map(renderText),
          info.shortcutContent.map(renderShortcut),
          info.caret
        ]
      };
      return menuItem;
    };
    var renderItemStructure = function (info, providersBackstage, fallbackIcon) {
      if (fallbackIcon === void 0) {
        fallbackIcon = Option.none();
      }
      var icon = info.iconContent.map(function (iconName) {
        return getOr(iconName, providersBackstage.icons, fallbackIcon);
      });
      if (info.presets === 'color') {
        return renderColorStructure(info.ariaLabel, info.value, icon);
      } else {
        return renderNormalItemStructure(info, icon);
      }
    };

    var nativeDisabled = [
      'input',
      'button',
      'textarea'
    ];
    var onLoad$5 = function (component, disableConfig, disableState) {
      if (disableConfig.disabled) {
        disable(component, disableConfig, disableState);
      }
    };
    var hasNative = function (component) {
      return contains(nativeDisabled, name(component.element()));
    };
    var nativeIsDisabled = function (component) {
      return has$1(component.element(), 'disabled');
    };
    var nativeDisable = function (component) {
      set$1(component.element(), 'disabled', 'disabled');
    };
    var nativeEnable = function (component) {
      remove$1(component.element(), 'disabled');
    };
    var ariaIsDisabled = function (component) {
      return get$2(component.element(), 'aria-disabled') === 'true';
    };
    var ariaDisable = function (component) {
      set$1(component.element(), 'aria-disabled', 'true');
    };
    var ariaEnable = function (component) {
      set$1(component.element(), 'aria-disabled', 'false');
    };
    var disable = function (component, disableConfig, disableState) {
      disableConfig.disableClass.each(function (disableClass) {
        add$2(component.element(), disableClass);
      });
      var f = hasNative(component) ? nativeDisable : ariaDisable;
      f(component);
    };
    var enable = function (component, disableConfig, disableState) {
      disableConfig.disableClass.each(function (disableClass) {
        remove$4(component.element(), disableClass);
      });
      var f = hasNative(component) ? nativeEnable : ariaEnable;
      f(component);
    };
    var isDisabled = function (component) {
      return hasNative(component) ? nativeIsDisabled(component) : ariaIsDisabled(component);
    };

    var DisableApis = /*#__PURE__*/Object.freeze({
        enable: enable,
        disable: disable,
        isDisabled: isDisabled,
        onLoad: onLoad$5
    });

    var exhibit$3 = function (base, disableConfig, disableState) {
      return nu$6({ classes: disableConfig.disabled ? disableConfig.disableClass.map(pure).getOr([]) : [] });
    };
    var events$8 = function (disableConfig, disableState) {
      return derive([
        abort(execute(), function (component, simulatedEvent) {
          return isDisabled(component);
        }),
        loadEvent(disableConfig, disableState, onLoad$5)
      ]);
    };

    var ActiveDisable = /*#__PURE__*/Object.freeze({
        exhibit: exhibit$3,
        events: events$8
    });

    var DisableSchema = [
      defaulted$1('disabled', false),
      option('disableClass')
    ];

    var Disabling = create$1({
      fields: DisableSchema,
      name: 'disabling',
      active: ActiveDisable,
      apis: DisableApis
    });

    var item = function (disabled) {
      return Disabling.config({
        disabled: disabled,
        disableClass: 'tox-collection__item--state-disabled'
      });
    };
    var button = function (disabled) {
      return Disabling.config({ disabled: disabled });
    };
    var splitButton = function (disabled) {
      return Disabling.config({
        disabled: disabled,
        disableClass: 'tox-tbtn--disabled'
      });
    };
    var DisablingConfigs = {
      item: item,
      button: button,
      splitButton: splitButton
    };

    var runWithApi = function (info, comp) {
      var api = info.getApi(comp);
      return function (f) {
        f(api);
      };
    };
    var onControlAttached = function (info, editorOffCell) {
      return runOnAttached(function (comp) {
        var run$$1 = runWithApi(info, comp);
        run$$1(function (api) {
          var onDestroy = info.onSetup(api);
          if (onDestroy !== null && onDestroy !== undefined) {
            editorOffCell.set(onDestroy);
          }
        });
      });
    };
    var onControlDetached = function (getApi, editorOffCell) {
      return runOnDetached(function (comp) {
        return runWithApi(getApi, comp)(editorOffCell.get());
      });
    };

    var ItemResponse;
    (function (ItemResponse) {
      ItemResponse[ItemResponse['CLOSE_ON_EXECUTE'] = 0] = 'CLOSE_ON_EXECUTE';
      ItemResponse[ItemResponse['BUBBLE_TO_SANDBOX'] = 1] = 'BUBBLE_TO_SANDBOX';
    }(ItemResponse || (ItemResponse = {})));
    var ItemResponse$1 = ItemResponse;

    var onMenuItemExecute = function (info, itemResponse) {
      return runOnExecute(function (comp, simulatedEvent) {
        runWithApi(info, comp)(info.onAction);
        if (!info.triggersSubmenu && itemResponse === ItemResponse$1.CLOSE_ON_EXECUTE) {
          emit(comp, sandboxClose());
          simulatedEvent.stop();
        }
      });
    };
    var menuItemEventOrder = {
      'alloy.execute': [
        'disabling',
        'alloy.base.behaviour',
        'toggling',
        'item-events'
      ]
    };

    var componentRenderPipeline = function (xs) {
      return bind(xs, function (o) {
        return o.toArray();
      });
    };
    var renderCommonItem = function (spec, structure, itemResponse) {
      var editorOffCell = Cell(noop);
      return {
        type: 'item',
        dom: structure.dom,
        components: componentRenderPipeline(structure.optComponents),
        data: spec.data,
        eventOrder: menuItemEventOrder,
        hasSubmenu: spec.triggersSubmenu,
        itemBehaviours: derive$1([
          config('item-events', [
            onMenuItemExecute(spec, itemResponse),
            onControlAttached(spec, editorOffCell),
            onControlDetached(spec, editorOffCell)
          ]),
          DisablingConfigs.item(spec.disabled),
          Replacing.config({})
        ].concat(spec.itemBehaviours))
      };
    };
    var buildData = function (source) {
      return {
        value: source.value,
        meta: merge({ text: source.text.getOr('') }, source.meta)
      };
    };

    var renderAutocompleteItem = function (spec, useText, presets, onItemValueHandler, itemResponse, providersBackstage) {
      var structure = renderItemStructure({
        presets: presets,
        textContent: useText ? spec.text : Option.none(),
        ariaLabel: spec.text,
        iconContent: spec.icon,
        shortcutContent: Option.none(),
        checkMark: Option.none(),
        caret: Option.none(),
        value: spec.value
      }, providersBackstage, spec.icon);
      return renderCommonItem({
        data: buildData(spec),
        disabled: spec.disabled,
        getApi: function () {
          return {};
        },
        onAction: function (_api) {
          return onItemValueHandler(spec.value, spec.meta);
        },
        onSetup: function () {
          return function () {
          };
        },
        triggersSubmenu: false,
        itemBehaviours: []
      }, structure, itemResponse);
    };
    var renderChoiceItem = function (spec, useText, presets, onItemValueHandler, isSelected, itemResponse, providersBackstage) {
      var getApi = function (component) {
        return {
          setActive: function (state) {
            Toggling.set(component, state);
          },
          isActive: function () {
            return Toggling.isOn(component);
          },
          isDisabled: function () {
            return Disabling.isDisabled(component);
          },
          setDisabled: function (state) {
            return state ? Disabling.disable(component) : Disabling.enable(component);
          }
        };
      };
      var structure = renderItemStructure({
        presets: presets,
        textContent: useText ? spec.text : Option.none(),
        ariaLabel: spec.text,
        iconContent: spec.icon,
        shortcutContent: useText ? spec.shortcut : Option.none(),
        checkMark: useText ? Option.some(renderCheckmark(providersBackstage.icons)) : Option.none(),
        caret: Option.none(),
        value: spec.value
      }, providersBackstage);
      return deepMerge(renderCommonItem({
        data: buildData(spec),
        disabled: spec.disabled,
        getApi: getApi,
        onAction: function (_api) {
          return onItemValueHandler(spec.value);
        },
        onSetup: function (api) {
          api.setActive(isSelected);
          return function () {
          };
        },
        triggersSubmenu: false,
        itemBehaviours: []
      }, structure, itemResponse), {
        toggling: {
          toggleClass: tickedClass,
          toggleOnExecute: false,
          selected: spec.active
        }
      });
    };

    var parts$2 = constant(generate$4(owner$2(), parts()));

    var cellOverEvent = generate$1('cell-over');
    var cellExecuteEvent = generate$1('cell-execute');
    var makeCell = function (row, col, labelId) {
      var _a;
      var emitCellOver = function (c) {
        return emitWith(c, cellOverEvent, {
          row: row,
          col: col
        });
      };
      var emitExecute$$1 = function (c) {
        return emitWith(c, cellExecuteEvent, {
          row: row,
          col: col
        });
      };
      return build$1({
        dom: {
          tag: 'div',
          attributes: (_a = { role: 'button' }, _a['aria-labelledby'] = labelId, _a)
        },
        behaviours: derive$1([
          config('insert-table-picker-cell', [
            run(mouseover(), Focusing.focus),
            run(execute(), emitExecute$$1),
            run(tapOrClick(), emitExecute$$1)
          ]),
          Toggling.config({
            toggleClass: 'tox-insert-table-picker__selected',
            toggleOnExecute: false
          }),
          Focusing.config({ onFocus: emitCellOver })
        ])
      });
    };
    var makeCells = function (labelId, numRows, numCols) {
      var cells = [];
      for (var i = 0; i < numRows; i++) {
        var row = [];
        for (var j = 0; j < numCols; j++) {
          row.push(makeCell(i, j, labelId));
        }
        cells.push(row);
      }
      return cells;
    };
    var selectCells = function (cells, selectedRow, selectedColumn, numRows, numColumns) {
      for (var i = 0; i < numRows; i++) {
        for (var j = 0; j < numColumns; j++) {
          Toggling.set(cells[i][j], i <= selectedRow && j <= selectedColumn);
        }
      }
    };
    var makeComponents = function (cells) {
      return bind(cells, function (cellRow) {
        return map(cellRow, premade$1);
      });
    };
    var makeLabelText = function (row, col) {
      return text(col + 1 + 'x' + (row + 1));
    };
    function renderInsertTableMenuItem(spec) {
      var numRows = 10;
      var numColumns = 10;
      var sizeLabelId = generate$1('size-label');
      var cells = makeCells(sizeLabelId, numRows, numColumns);
      var memLabel = record({
        dom: {
          tag: 'span',
          classes: ['tox-insert-table-picker__label'],
          attributes: { id: sizeLabelId }
        },
        components: [text('0x0')],
        behaviours: derive$1([Replacing.config({})])
      });
      return {
        type: 'widget',
        data: { value: generate$1('widget-id') },
        dom: {
          tag: 'div',
          classes: ['tox-fancymenuitem']
        },
        autofocus: true,
        components: [parts$2().widget({
            dom: {
              tag: 'div',
              classes: ['tox-insert-table-picker']
            },
            components: makeComponents(cells).concat(memLabel.asSpec()),
            behaviours: derive$1([
              config('insert-table-picker', [
                runWithTarget(cellOverEvent, function (c, t, e) {
                  var row = e.event().row();
                  var col = e.event().col();
                  selectCells(cells, row, col, numRows, numColumns);
                  Replacing.set(memLabel.get(c), [makeLabelText(row, col)]);
                }),
                runWithTarget(cellExecuteEvent, function (c, _, e) {
                  spec.onAction({
                    numRows: e.event().row() + 1,
                    numColumns: e.event().col() + 1
                  });
                  emit(c, sandboxClose());
                })
              ]),
              Keying.config({
                initSize: {
                  numRows: numRows,
                  numColumns: numColumns
                },
                mode: 'flatgrid',
                selector: '[role="button"]'
              })
            ])
          })]
      };
    }

    var fancyMenuItems = { inserttable: renderInsertTableMenuItem };
    var valueOpt = function (obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key) ? Option.some(obj[key]) : Option.none();
    };
    var renderFancyMenuItem = function (spec) {
      return valueOpt(fancyMenuItems, spec.fancytype).map(function (render) {
        return render(spec);
      });
    };

    var renderNormalItem = function (spec, itemResponse, providersBackstage) {
      var getApi = function (component) {
        return {
          isDisabled: function () {
            return Disabling.isDisabled(component);
          },
          setDisabled: function (state) {
            return state ? Disabling.disable(component) : Disabling.enable(component);
          }
        };
      };
      var structure = renderItemStructure({
        presets: 'normal',
        iconContent: spec.icon,
        textContent: spec.text,
        ariaLabel: spec.text,
        caret: Option.none(),
        checkMark: Option.none(),
        shortcutContent: spec.shortcut
      }, providersBackstage);
      return renderCommonItem({
        data: buildData(spec),
        getApi: getApi,
        disabled: spec.disabled,
        onAction: spec.onAction,
        onSetup: spec.onSetup,
        triggersSubmenu: false,
        itemBehaviours: []
      }, structure, itemResponse);
    };

    var renderNestedItem = function (spec, itemResponse, providersBackstage) {
      var caret = renderSubmenuCaret(providersBackstage.icons);
      var getApi = function (component) {
        return {
          isDisabled: function () {
            return Disabling.isDisabled(component);
          },
          setDisabled: function (state) {
            return state ? Disabling.disable(component) : Disabling.enable(component);
          }
        };
      };
      var structure = renderItemStructure({
        presets: 'normal',
        iconContent: spec.icon,
        textContent: spec.text,
        ariaLabel: spec.text,
        caret: Option.some(caret),
        checkMark: Option.none(),
        shortcutContent: spec.shortcut
      }, providersBackstage);
      return renderCommonItem({
        data: buildData(spec),
        getApi: getApi,
        disabled: spec.disabled,
        onAction: noop,
        onSetup: spec.onSetup,
        triggersSubmenu: true,
        itemBehaviours: []
      }, structure, itemResponse);
    };

    var renderSeparatorItem = function (spec) {
      var innerHtml = spec.text.fold(function () {
        return {};
      }, function (text) {
        return { innerHtml: text };
      });
      return {
        type: 'separator',
        dom: __assign({
          tag: 'div',
          classes: [
            selectableClass,
            groupHeadingClass
          ]
        }, innerHtml),
        components: []
      };
    };

    var renderStyledText = function (tag, styleAttr, text$$1) {
      return simple$1('span', [textClass], [{
          dom: {
            tag: tag,
            attributes: { style: styleAttr }
          },
          components: [text(text$$1)]
        }]);
    };
    var renderStyleStructure = function (optTextContent, meta, checkMark) {
      return {
        dom: {
          tag: 'div',
          classes: [
            navClass,
            selectableClass
          ]
        },
        optComponents: [
          Option.some(checkMark),
          optTextContent.map(function (text$$1) {
            return renderStyledText(meta.tag, meta.styleAttr, text$$1);
          })
        ]
      };
    };

    var renderStyleItem = function (spec, itemResponse, providersBackstage) {
      var checkMark = spec.type === 'togglemenuitem' && spec.active ? renderCheckmark(providersBackstage.icons) : renderIcon('');
      var structure = renderStyleStructure(spec.text, spec.meta, checkMark);
      return deepMerge(renderCommonItem({
        data: buildData(spec),
        disabled: spec.disabled,
        getApi: function () {
          return 10;
        },
        onAction: spec.onAction,
        onSetup: function () {
          return function () {
          };
        },
        triggersSubmenu: false,
        itemBehaviours: []
      }, structure, itemResponse), spec.type === 'togglemenuitem' ? {
        toggling: {
          toggleClass: tickedClass,
          toggleOnExecute: false,
          selected: spec.active
        }
      } : {});
    };

    var renderToggleMenuItem = function (spec, itemResponse, providersBackstage) {
      var getApi = function (component) {
        return {
          setActive: function (state) {
            Toggling.set(component, state);
          },
          isActive: function () {
            return Toggling.isOn(component);
          },
          isDisabled: function () {
            return Disabling.isDisabled(component);
          },
          setDisabled: function (state) {
            return state ? Disabling.disable(component) : Disabling.enable(component);
          }
        };
      };
      var structure = renderItemStructure({
        iconContent: Option.none(),
        textContent: spec.text,
        ariaLabel: spec.text,
        checkMark: Option.some(renderCheckmark(providersBackstage.icons)),
        caret: Option.none(),
        shortcutContent: spec.shortcut,
        presets: 'normal'
      }, providersBackstage);
      return deepMerge(renderCommonItem({
        data: buildData(spec),
        disabled: spec.disabled,
        getApi: getApi,
        onAction: spec.onAction,
        onSetup: spec.onSetup,
        triggersSubmenu: false,
        itemBehaviours: []
      }, structure, itemResponse), {
        toggling: {
          toggleClass: tickedClass,
          toggleOnExecute: false,
          selected: spec.active
        }
      });
    };

    var choice = renderChoiceItem;
    var autocomplete = renderAutocompleteItem;
    var separator = renderSeparatorItem;
    var style = renderStyleItem;
    var normal = renderNormalItem;
    var nested = renderNestedItem;
    var toggle$4 = renderToggleMenuItem;
    var fancy = renderFancyMenuItem;

    var forMenu = function (presets) {
      if (presets === 'color') {
        return 'tox-swatches';
      } else {
        return 'tox-menu';
      }
    };
    var classes = function (presets) {
      return {
        backgroundMenu: 'tox-background-menu',
        selectedMenu: 'tox-selected-menu',
        selectedItem: 'tox-collection__item--active',
        hasIcons: 'tox-menu--has-icons',
        menu: forMenu(presets),
        tieredMenu: 'tox-tiered-menu'
      };
    };

    var markers$1 = function (presets) {
      var menuClasses = classes(presets);
      return {
        backgroundMenu: menuClasses.backgroundMenu,
        selectedMenu: menuClasses.selectedMenu,
        menu: menuClasses.menu,
        selectedItem: menuClasses.selectedItem,
        item: classForPreset(presets)
      };
    };
    var dom$2 = function (hasIcons, columns, presets) {
      var menuClasses = classes(presets);
      return {
        tag: 'div',
        classes: flatten([
          [
            menuClasses.menu,
            'tox-menu-' + columns + '-column'
          ],
          hasIcons ? [menuClasses.hasIcons] : []
        ])
      };
    };
    var components$1 = [Menu.parts().items({})];
    var part = function (hasIcons, columns, presets) {
      var menuClasses = classes(presets);
      var d = {
        tag: 'div',
        classes: flatten([[menuClasses.tieredMenu]])
      };
      return {
        dom: d,
        markers: markers$1(presets)
      };
    };

    var deriveMenuMovement = function (columns, presets) {
      var menuMarkers = markers$1(presets);
      if (columns === 1) {
        return {
          mode: 'menu',
          moveOnTab: true
        };
      } else if (columns === 'auto') {
        return {
          mode: 'grid',
          selector: '.' + menuMarkers.item,
          initSize: {
            numColumns: 1,
            numRows: 1
          }
        };
      } else {
        var rowClass = presets === 'color' ? 'tox-swatches__row' : 'tox-collection__group';
        return {
          mode: 'matrix',
          rowSelector: '.' + rowClass
        };
      }
    };
    var deriveCollectionMovement = function (columns, presets) {
      if (columns === 1) {
        return {
          mode: 'menu',
          moveOnTab: false,
          selector: '.tox-collection__item'
        };
      } else if (columns === 'auto') {
        return {
          mode: 'flatgrid',
          selector: '.' + 'tox-collection__item',
          initSize: {
            numColumns: 1,
            numRows: 1
          }
        };
      } else {
        return {
          mode: 'matrix',
          selectors: {
            row: presets === 'color' ? '.tox-swatches__row' : '.tox-collection__group',
            cell: presets === 'color' ? '.' + colorClass : '.' + selectableClass
          }
        };
      }
    };

    var chunk$1 = function (rowDom, numColumns) {
      return function (items) {
        var chunks = chunk(items, numColumns);
        return map(chunks, function (c) {
          return {
            dom: rowDom,
            components: c
          };
        });
      };
    };
    var forSwatch = function (columns) {
      return {
        dom: {
          tag: 'div',
          classes: ['tox-menu']
        },
        components: [{
            dom: {
              tag: 'div',
              classes: ['tox-swatches']
            },
            components: [Menu.parts().items({
                preprocess: columns !== 'auto' ? chunk$1({
                  tag: 'div',
                  classes: ['tox-swatches__row']
                }, columns) : identity
              })]
          }]
      };
    };
    var forToolbar = function (columns) {
      return {
        dom: {
          tag: 'div',
          classes: [
            'tox-menu',
            'tox-collection',
            'tox-collection--toolbar',
            'tox-collection--toolbar-lg'
          ]
        },
        components: [Menu.parts().items({
            preprocess: chunk$1({
              tag: 'div',
              classes: ['tox-collection__group']
            }, columns)
          })]
      };
    };
    var preprocessCollection = function (items, isSeparator) {
      var allSplits = [];
      var currentSplit = [];
      each(items, function (item, i) {
        if (isSeparator(item, i)) {
          if (currentSplit.length > 0) {
            allSplits.push(currentSplit);
          }
          currentSplit = [];
          if (has(item.dom, 'innerHtml')) {
            currentSplit.push(item);
          }
        } else {
          currentSplit.push(item);
        }
      });
      if (currentSplit.length > 0) {
        allSplits.push(currentSplit);
      }
      return map(allSplits, function (s) {
        return {
          dom: {
            tag: 'div',
            classes: ['tox-collection__group']
          },
          components: s
        };
      });
    };
    var forCollection = function (columns, initItems) {
      return {
        dom: {
          tag: 'div',
          classes: [
            'tox-menu',
            'tox-collection'
          ].concat(columns === 1 ? ['tox-collection--list'] : ['tox-collection--grid'])
        },
        components: [Menu.parts().items({
            preprocess: function (items) {
              if (columns !== 'auto' && columns > 1) {
                return chunk$1({
                  tag: 'div',
                  classes: ['tox-collection__group']
                }, columns)(items);
              } else {
                return preprocessCollection(items, function (item, i) {
                  return initItems[i].type === 'separator';
                });
              }
            }
          })]
      };
    };

    var FocusMode;
    (function (FocusMode) {
      FocusMode[FocusMode['ContentFocus'] = 0] = 'ContentFocus';
      FocusMode[FocusMode['UiFocus'] = 1] = 'UiFocus';
    }(FocusMode || (FocusMode = {})));
    var handleError = function (error) {
      console.error(formatError(error));
      console.log(error);
      return Option.none();
    };
    var hasIcon = function (item) {
      return item.icon !== undefined;
    };
    var menuHasIcons = function (xs) {
      return exists(xs, hasIcon);
    };
    var createMenuItemFromBridge = function (item, itemResponse, providersBackstage) {
      switch (item.type) {
      case 'menuitem':
        return createMenuItem(item).fold(handleError, function (d) {
          return Option.some(normal(d, itemResponse, providersBackstage));
        });
      case 'nestedmenuitem':
        return createNestedMenuItem(item).fold(handleError, function (d) {
          return Option.some(nested(d, itemResponse, providersBackstage));
        });
      case 'styleitem': {
          if (item.item.type === 'menuitem') {
            return createMenuItem(item.item).fold(handleError, function (d) {
              return Option.some(style(d, itemResponse, providersBackstage));
            });
          } else if (item.item.type === 'togglemenuitem') {
            return createToggleMenuItem(item.item).fold(handleError, function (d) {
              return Option.some(style(d, itemResponse, providersBackstage));
            });
          } else {
            console.error('Unsupported style item delegate', item.item);
            return Option.none();
          }
        }
      case 'togglemenuitem':
        return createToggleMenuItem(item).fold(handleError, function (d) {
          return Option.some(toggle$4(d, itemResponse, providersBackstage));
        });
      case 'separator':
        return createSeparatorMenuItem(item).fold(handleError, function (d) {
          return Option.some(separator(d));
        });
      case 'fancymenuitem':
        return createFancyMenuItem(item).fold(handleError, function (d) {
          return fancy(d);
        });
      default: {
          console.error('Unknown item in general menu', item);
          return Option.none();
        }
      }
    };
    var createPartialMenuWithAlloyItems = function (value, hasIcons, items, columns, presets) {
      if (presets === 'color') {
        var structure = forSwatch(columns);
        return {
          value: value,
          dom: structure.dom,
          components: structure.components,
          items: items
        };
      }
      if (presets === 'normal' && columns === 'auto') {
        var structure = forCollection(columns, items);
        return {
          value: value,
          dom: structure.dom,
          components: structure.components,
          items: items
        };
      }
      if (presets === 'normal' && columns === 1) {
        var structure = forCollection(1, items);
        return {
          value: value,
          dom: structure.dom,
          components: structure.components,
          items: items
        };
      }
      if (presets === 'normal') {
        var structure = forCollection(columns, items);
        return {
          value: value,
          dom: structure.dom,
          components: structure.components,
          items: items
        };
      }
      if (presets === 'toolbar' && columns !== 'auto') {
        var structure = forToolbar(columns);
        return {
          value: value,
          dom: structure.dom,
          components: structure.components,
          items: items
        };
      }
      return {
        value: value,
        dom: dom$2(hasIcons, columns, presets),
        components: components$1,
        items: items
      };
    };
    var createChoiceItems = function (items, onItemValueHandler, columns, itemPresets, itemResponse, select, providersBackstage) {
      return cat(map(items, function (item) {
        if (item.type === 'choiceitem') {
          return createChoiceMenuItem(item).fold(handleError, function (d) {
            return Option.some(choice(d, columns === 1, itemPresets, onItemValueHandler, select(item.value), itemResponse, providersBackstage));
          });
        } else {
          return Option.none();
        }
      }));
    };
    var createAutocompleteItems = function (items, onItemValueHandler, columns, itemResponse, providersBackstage) {
      return cat(map(items, function (item) {
        return createAutocompleterItem(item).fold(handleError, function (d) {
          return Option.some(autocomplete(d, columns === 1, 'normal', onItemValueHandler, itemResponse, providersBackstage));
        });
      }));
    };
    var createPartialChoiceMenu = function (value, items, onItemValueHandler, columns, presets, itemResponse, select, providersBackstage) {
      var hasIcons = menuHasIcons(items);
      var presetItemTypes = presets !== 'color' ? 'normal' : 'color';
      var alloyItems = createChoiceItems(items, onItemValueHandler, columns, presetItemTypes, itemResponse, select, providersBackstage);
      return createPartialMenuWithAlloyItems(value, hasIcons, alloyItems, columns, presets);
    };
    var createPartialMenu = function (value, items, itemResponse, providersBackstage) {
      var hasIcons = menuHasIcons(items);
      var alloyItems = cat(map(items, function (item) {
        return createMenuItemFromBridge(item, itemResponse, providersBackstage);
      }));
      return createPartialMenuWithAlloyItems(value, hasIcons, alloyItems, 1, 'normal');
    };
    var createTieredDataFrom = function (partialMenu) {
      return tieredMenu.singleData(partialMenu.value, partialMenu);
    };
    var createMenuFrom = function (partialMenu, columns, focusMode, presets) {
      var focusManager = focusMode === FocusMode.ContentFocus ? highlights() : dom();
      var movement = deriveMenuMovement(columns, presets);
      var menuMarkers = markers$1(presets);
      return {
        dom: partialMenu.dom,
        components: partialMenu.components,
        items: partialMenu.items,
        value: partialMenu.value,
        markers: {
          selectedItem: menuMarkers.selectedItem,
          item: menuMarkers.item
        },
        movement: movement,
        fakeFocus: focusMode === FocusMode.ContentFocus,
        focusManager: focusManager,
        menuBehaviours: SimpleBehaviours.unnamedEvents(columns !== 'auto' ? [] : [runOnAttached(function (comp, se) {
            detectSize(comp, 4, menuMarkers.item).each(function (_a) {
              var numColumns = _a.numColumns, numRows = _a.numRows;
              Keying.setGridSize(comp, numRows, numColumns);
            });
          })])
      };
    };

    var register$1 = function (editor, sharedBackstage) {
      var autocompleter = build$1(InlineView.sketch({
        dom: {
          tag: 'div',
          classes: ['tox-autocompleter']
        },
        components: [],
        lazySink: sharedBackstage.getSink
      }));
      var isActive = function () {
        return InlineView.isOpen(autocompleter);
      };
      var closeIfNecessary = function () {
        if (isActive()) {
          InlineView.hide(autocompleter);
        }
      };
      var getAutocompleters = cached(function () {
        return register(editor);
      });
      var getCombinedItems = function (triggerChar, matches) {
        var columns = findMap(matches, function (m) {
          return Option.from(m.columns);
        }).getOr(1);
        return bind(matches, function (match) {
          var choices = match.items;
          return createAutocompleteItems(choices, function (itemValue, itemMeta) {
            var nr = editor.selection.getRng();
            var textNode = nr.startContainer;
            getContext(nr, triggerChar, textNode.data, nr.startOffset).fold(function () {
              return console.error('Lost context. Cursor probably moved');
            }, function (_a) {
              var rng = _a.rng;
              var autocompleterApi = { hide: closeIfNecessary };
              match.onAction(autocompleterApi, rng, itemValue, itemMeta);
            });
          }, columns, ItemResponse$1.BUBBLE_TO_SANDBOX, sharedBackstage.providers);
        });
      };
      var onKeypress = last$3(function (e) {
        var optMatches = e.key === ' ' ? Option.none() : lookup(editor, getAutocompleters);
        optMatches.fold(closeIfNecessary, function (lookupInfo) {
          lookupInfo.lookupData.then(function (lookupData) {
            var combinedItems = getCombinedItems(lookupInfo.triggerChar, lookupData);
            if (combinedItems.length > 0) {
              var columns = findMap(lookupData, function (ld) {
                return Option.from(ld.columns);
              }).getOr(1);
              InlineView.showAt(autocompleter, {
                anchor: 'selection',
                root: Element$$1.fromDom(editor.getBody()),
                getSelection: function () {
                  return Option.some({
                    start: function () {
                      return Element$$1.fromDom(lookupInfo.range.startContainer);
                    },
                    soffset: function () {
                      return lookupInfo.range.startOffset;
                    },
                    finish: function () {
                      return Element$$1.fromDom(lookupInfo.range.endContainer);
                    },
                    foffset: function () {
                      return lookupInfo.range.endOffset;
                    }
                  });
                }
              }, Menu.sketch(createMenuFrom(createPartialMenuWithAlloyItems('autocompleter-value', true, combinedItems, columns, 'normal'), columns, FocusMode.ContentFocus, 'normal')));
              InlineView.getContent(autocompleter).each(Highlighting.highlightFirst);
            } else {
              closeIfNecessary();
            }
          });
        });
      }, 50);
      var autocompleterUiApi = {
        onKeypress: onKeypress,
        closeIfNecessary: closeIfNecessary,
        isActive: isActive,
        getView: function () {
          return InlineView.getContent(autocompleter);
        }
      };
      AutocompleterEditorEvents.setup(autocompleterUiApi, editor);
    };
    var Autocompleter = { register: register$1 };

    var mkEvent = function (target, x, y, stop, prevent, kill, raw) {
      return {
        target: constant(target),
        x: constant(x),
        y: constant(y),
        stop: stop,
        prevent: prevent,
        kill: kill,
        raw: constant(raw)
      };
    };
    var handle = function (filter, handler) {
      return function (rawEvent) {
        if (!filter(rawEvent)) {
          return;
        }
        var target = Element$$1.fromDom(rawEvent.target);
        var stop = function () {
          rawEvent.stopPropagation();
        };
        var prevent = function () {
          rawEvent.preventDefault();
        };
        var kill = compose(prevent, stop);
        var evt = mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
        handler(evt);
      };
    };
    var binder = function (element, event, filter, handler, useCapture) {
      var wrapped = handle(filter, handler);
      element.dom().addEventListener(event, wrapped, useCapture);
      return { unbind: curry(unbind, element, event, wrapped, useCapture) };
    };
    var bind$2 = function (element, event, filter, handler) {
      return binder(element, event, filter, handler, false);
    };
    var capture$1 = function (element, event, filter, handler) {
      return binder(element, event, filter, handler, true);
    };
    var unbind = function (element, event, handler, useCapture) {
      element.dom().removeEventListener(event, handler, useCapture);
    };

    var filter$1 = constant(true);
    var bind$3 = function (element, event, handler) {
      return bind$2(element, event, filter$1, handler);
    };
    var capture$2 = function (element, event, handler) {
      return capture$1(element, event, filter$1, handler);
    };

    var closest$4 = function (scope, selector, isRoot) {
      return closest$3(scope, selector, isRoot).isSome();
    };

    function DelayedFunction (fun, delay) {
      var ref = null;
      var schedule = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        ref = setTimeout(function () {
          fun.apply(null, args);
          ref = null;
        }, delay);
      };
      var cancel = function () {
        if (ref !== null) {
          clearTimeout(ref);
          ref = null;
        }
      };
      return {
        cancel: cancel,
        schedule: schedule
      };
    }

    var SIGNIFICANT_MOVE = 5;
    var LONGPRESS_DELAY = 400;
    var getTouch = function (event) {
      var raw = event.raw();
      if (raw.touches === undefined || raw.touches.length !== 1) {
        return Option.none();
      }
      return Option.some(raw.touches[0]);
    };
    var isFarEnough = function (touch, data) {
      var distX = Math.abs(touch.clientX - data.x());
      var distY = Math.abs(touch.clientY - data.y());
      return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
    };
    var monitor = function (settings) {
      var startData = Cell(Option.none());
      var longpress$$1 = DelayedFunction(function (event) {
        startData.set(Option.none());
        settings.triggerEvent(longpress(), event);
      }, LONGPRESS_DELAY);
      var handleTouchstart = function (event) {
        getTouch(event).each(function (touch) {
          longpress$$1.cancel();
          var data = {
            x: constant(touch.clientX),
            y: constant(touch.clientY),
            target: event.target
          };
          longpress$$1.schedule(event);
          startData.set(Option.some(data));
        });
        return Option.none();
      };
      var handleTouchmove = function (event) {
        longpress$$1.cancel();
        getTouch(event).each(function (touch) {
          startData.get().each(function (data) {
            if (isFarEnough(touch, data)) {
              startData.set(Option.none());
            }
          });
        });
        return Option.none();
      };
      var handleTouchend = function (event) {
        longpress$$1.cancel();
        var isSame = function (data) {
          return eq(data.target(), event.target());
        };
        return startData.get().filter(isSame).map(function (data) {
          return settings.triggerEvent(tap(), event);
        });
      };
      var handlers = wrapAll$1([
        {
          key: touchstart(),
          value: handleTouchstart
        },
        {
          key: touchmove(),
          value: handleTouchmove
        },
        {
          key: touchend(),
          value: handleTouchend
        }
      ]);
      var fireIfReady = function (event, type) {
        return readOptFrom$1(handlers, type).bind(function (handler) {
          return handler(event);
        });
      };
      return { fireIfReady: fireIfReady };
    };

    var isDangerous = function (event$$1) {
      var keyEv = event$$1.raw();
      return keyEv.which === BACKSPACE()[0] && !contains([
        'input',
        'textarea'
      ], name(event$$1.target())) && !closest$4(event$$1.target(), '[contenteditable="true"]');
    };
    var isFirefox = PlatformDetection$1.detect().browser.isFirefox();
    var settingsSchema = objOfOnly([
      strictFunction('triggerEvent'),
      defaulted$1('stopBackspace', true)
    ]);
    var bindFocus = function (container, handler) {
      if (isFirefox) {
        return capture$2(container, 'focus', handler);
      } else {
        return bind$3(container, 'focusin', handler);
      }
    };
    var bindBlur = function (container, handler) {
      if (isFirefox) {
        return capture$2(container, 'blur', handler);
      } else {
        return bind$3(container, 'focusout', handler);
      }
    };
    var setup$1 = function (container, rawSettings) {
      var settings = asRawOrDie('Getting GUI events settings', settingsSchema, rawSettings);
      var pointerEvents = PlatformDetection$1.detect().deviceType.isTouch() ? [
        'touchstart',
        'touchmove',
        'touchend',
        'gesturestart'
      ] : [
        'mousedown',
        'mouseup',
        'mouseover',
        'mousemove',
        'mouseout',
        'click'
      ];
      var tapEvent = monitor(settings);
      var simpleEvents = map(pointerEvents.concat([
        'selectstart',
        'input',
        'contextmenu',
        'change',
        'paste',
        'transitionend',
        'drag',
        'dragstart',
        'dragend',
        'dragenter',
        'dragleave',
        'dragover',
        'drop',
        'keyup'
      ]), function (type$$1) {
        return bind$3(container, type$$1, function (event$$1) {
          tapEvent.fireIfReady(event$$1, type$$1).each(function (tapStopped) {
            if (tapStopped) {
              event$$1.kill();
            }
          });
          var stopped = settings.triggerEvent(type$$1, event$$1);
          if (stopped) {
            event$$1.kill();
          }
        });
      });
      var onKeydown = bind$3(container, 'keydown', function (event$$1) {
        var stopped = settings.triggerEvent('keydown', event$$1);
        if (stopped) {
          event$$1.kill();
        } else if (settings.stopBackspace === true && isDangerous(event$$1)) {
          event$$1.prevent();
        }
      });
      var onFocusIn = bindFocus(container, function (event$$1) {
        var stopped = settings.triggerEvent('focusin', event$$1);
        if (stopped) {
          event$$1.kill();
        }
      });
      var onFocusOut = bindBlur(container, function (event$$1) {
        var stopped = settings.triggerEvent('focusout', event$$1);
        if (stopped) {
          event$$1.kill();
        }
        setTimeout(function () {
          settings.triggerEvent(postBlur(), event$$1);
        }, 0);
      });
      var unbind = function () {
        each(simpleEvents, function (e) {
          e.unbind();
        });
        onKeydown.unbind();
        onFocusIn.unbind();
        onFocusOut.unbind();
      };
      return { unbind: unbind };
    };

    var derive$2 = function (rawEvent, rawTarget) {
      var source = readOptFrom$1(rawEvent, 'target').map(function (getTarget) {
        return getTarget();
      }).getOr(rawTarget);
      return Cell(source);
    };

    var fromSource = function (event, source) {
      var stopper = Cell(false);
      var cutter = Cell(false);
      var stop = function () {
        stopper.set(true);
      };
      var cut = function () {
        cutter.set(true);
      };
      return {
        stop: stop,
        cut: cut,
        isStopped: stopper.get,
        isCut: cutter.get,
        event: constant(event),
        setSource: source.set,
        getSource: source.get
      };
    };
    var fromExternal = function (event) {
      var stopper = Cell(false);
      var stop = function () {
        stopper.set(true);
      };
      return {
        stop: stop,
        cut: noop,
        isStopped: stopper.get,
        isCut: constant(false),
        event: constant(event),
        setSource: die('Cannot set source of a broadcasted event'),
        getSource: die('Cannot get source of a broadcasted event')
      };
    };

    var adt$a = Adt.generate([
      { stopped: [] },
      { resume: ['element'] },
      { complete: [] }
    ]);
    var doTriggerHandler = function (lookup, eventType, rawEvent, target, source, logger) {
      var handler = lookup(eventType, target);
      var simulatedEvent = fromSource(rawEvent, source);
      return handler.fold(function () {
        logger.logEventNoHandlers(eventType, target);
        return adt$a.complete();
      }, function (handlerInfo) {
        var descHandler = handlerInfo.descHandler();
        var eventHandler = getCurried(descHandler);
        eventHandler(simulatedEvent);
        if (simulatedEvent.isStopped()) {
          logger.logEventStopped(eventType, handlerInfo.element(), descHandler.purpose());
          return adt$a.stopped();
        } else if (simulatedEvent.isCut()) {
          logger.logEventCut(eventType, handlerInfo.element(), descHandler.purpose());
          return adt$a.complete();
        } else {
          return parent(handlerInfo.element()).fold(function () {
            logger.logNoParent(eventType, handlerInfo.element(), descHandler.purpose());
            return adt$a.complete();
          }, function (parent$$1) {
            logger.logEventResponse(eventType, handlerInfo.element(), descHandler.purpose());
            return adt$a.resume(parent$$1);
          });
        }
      });
    };
    var doTriggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, source, logger) {
      return doTriggerHandler(lookup, eventType, rawEvent, rawTarget, source, logger).fold(function () {
        return true;
      }, function (parent$$1) {
        return doTriggerOnUntilStopped(lookup, eventType, rawEvent, parent$$1, source, logger);
      }, function () {
        return false;
      });
    };
    var triggerHandler = function (lookup, eventType, rawEvent, target, logger) {
      var source = derive$2(rawEvent, target);
      return doTriggerHandler(lookup, eventType, rawEvent, target, source, logger);
    };
    var broadcast = function (listeners, rawEvent, logger) {
      var simulatedEvent = fromExternal(rawEvent);
      each(listeners, function (listener) {
        var descHandler = listener.descHandler();
        var handler = getCurried(descHandler);
        handler(simulatedEvent);
      });
      return simulatedEvent.isStopped();
    };
    var triggerUntilStopped = function (lookup, eventType, rawEvent, logger) {
      var rawTarget = rawEvent.target();
      return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, logger);
    };
    var triggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, logger) {
      var source = derive$2(rawEvent, rawTarget);
      return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
    };

    var eventHandler = Immutable('element', 'descHandler');
    var broadcastHandler = function (id, handler) {
      return {
        id: constant(id),
        descHandler: constant(handler)
      };
    };
    function EventRegistry () {
      var registry = {};
      var registerId = function (extraArgs, id, events) {
        each$1(events, function (v, k) {
          var handlers = registry[k] !== undefined ? registry[k] : {};
          handlers[id] = curryArgs(v, extraArgs);
          registry[k] = handlers;
        });
      };
      var findHandler = function (handlers, elem) {
        return read$1(elem).fold(function () {
          return Option.none();
        }, function (id) {
          var reader = readOpt$1(id);
          return handlers.bind(reader).map(function (descHandler) {
            return eventHandler(elem, descHandler);
          });
        });
      };
      var filterByType = function (type) {
        return readOptFrom$1(registry, type).map(function (handlers) {
          return mapToArray(handlers, function (f, id) {
            return broadcastHandler(id, f);
          });
        }).getOr([]);
      };
      var find = function (isAboveRoot, type, target) {
        var readType = readOpt$1(type);
        var handlers = readType(registry);
        return closest$1(target, function (elem) {
          return findHandler(handlers, elem);
        }, isAboveRoot);
      };
      var unregisterId = function (id) {
        each$1(registry, function (handlersById, eventName) {
          if (handlersById.hasOwnProperty(id)) {
            delete handlersById[id];
          }
        });
      };
      return {
        registerId: registerId,
        unregisterId: unregisterId,
        filterByType: filterByType,
        find: find
      };
    }

    function Registry () {
      var events = EventRegistry();
      var components = {};
      var readOrTag = function (component) {
        var elem = component.element();
        return read$1(elem).fold(function () {
          return write('uid-', component.element());
        }, function (uid) {
          return uid;
        });
      };
      var failOnDuplicate = function (component, tagId) {
        var conflict = components[tagId];
        if (conflict === component) {
          unregister(component);
        } else {
          throw new Error('The tagId "' + tagId + '" is already used by: ' + element(conflict.element()) + '\nCannot use it for: ' + element(component.element()) + '\n' + 'The conflicting element is' + (inBody(conflict.element()) ? ' ' : ' not ') + 'already in the DOM');
        }
      };
      var register = function (component) {
        var tagId = readOrTag(component);
        if (hasKey$1(components, tagId)) {
          failOnDuplicate(component, tagId);
        }
        var extraArgs = [component];
        events.registerId(extraArgs, tagId, component.events());
        components[tagId] = component;
      };
      var unregister = function (component) {
        read$1(component.element()).each(function (tagId) {
          components[tagId] = undefined;
          events.unregisterId(tagId);
        });
      };
      var filter = function (type) {
        return events.filterByType(type);
      };
      var find = function (isAboveRoot, type, target) {
        return events.find(isAboveRoot, type, target);
      };
      var getById = function (id) {
        return readOpt$1(id)(components);
      };
      return {
        find: find,
        filter: filter,
        register: register,
        unregister: unregister,
        getById: getById
      };
    }

    var factory$3 = function (detail) {
      var _a = detail.dom, attributes = _a.attributes, domWithoutAttributes = __rest(_a, ['attributes']);
      return {
        uid: detail.uid,
        dom: __assign({
          tag: 'div',
          attributes: __assign({ role: 'presentation' }, attributes)
        }, domWithoutAttributes),
        components: detail.components,
        behaviours: get$d(detail.containerBehaviours),
        events: detail.events,
        domModification: detail.domModification,
        eventOrder: detail.eventOrder
      };
    };
    var Container = single$2({
      name: 'Container',
      factory: factory$3,
      configFields: [
        defaulted$1('components', []),
        field$1('containerBehaviours', []),
        defaulted$1('events', {}),
        defaulted$1('domModification', {}),
        defaulted$1('eventOrder', {})
      ]
    });

    var takeover = function (root) {
      var isAboveRoot = function (el) {
        return parent(root.element()).fold(function () {
          return true;
        }, function (parent$$1) {
          return eq(el, parent$$1);
        });
      };
      var registry = Registry();
      var lookup = function (eventName, target) {
        return registry.find(isAboveRoot, eventName, target);
      };
      var domEvents = setup$1(root.element(), {
        triggerEvent: function (eventName, event) {
          return monitorEvent(eventName, event.target(), function (logger) {
            return triggerUntilStopped(lookup, eventName, event, logger);
          });
        }
      });
      var systemApi = {
        debugInfo: constant('real'),
        triggerEvent: function (eventName, target, data) {
          monitorEvent(eventName, target, function (logger) {
            triggerOnUntilStopped(lookup, eventName, data, target, logger);
          });
        },
        triggerFocus: function (target, originator) {
          read$1(target).fold(function () {
            focus$2(target);
          }, function (_alloyId) {
            monitorEvent(focus$1(), target, function (logger) {
              triggerHandler(lookup, focus$1(), {
                originator: constant(originator),
                kill: noop,
                prevent: noop,
                target: constant(target)
              }, target, logger);
            });
          });
        },
        triggerEscape: function (comp, simulatedEvent) {
          systemApi.triggerEvent('keydown', comp.element(), simulatedEvent.event());
        },
        getByUid: function (uid) {
          return getByUid(uid);
        },
        getByDom: function (elem) {
          return getByDom(elem);
        },
        build: build$1,
        addToGui: function (c) {
          add(c);
        },
        removeFromGui: function (c) {
          remove$$1(c);
        },
        addToWorld: function (c) {
          addToWorld(c);
        },
        removeFromWorld: function (c) {
          removeFromWorld(c);
        },
        broadcast: function (message) {
          broadcast$$1(message);
        },
        broadcastOn: function (channels, message) {
          broadcastOn(channels, message);
        },
        broadcastEvent: function (eventName, event) {
          broadcastEvent(eventName, event);
        },
        isConnected: constant(true)
      };
      var addToWorld = function (component) {
        component.connect(systemApi);
        if (!isText(component.element())) {
          registry.register(component);
          each(component.components(), addToWorld);
          systemApi.triggerEvent(systemInit(), component.element(), { target: constant(component.element()) });
        }
      };
      var removeFromWorld = function (component) {
        if (!isText(component.element())) {
          each(component.components(), removeFromWorld);
          registry.unregister(component);
        }
        component.disconnect();
      };
      var add = function (component) {
        attach(root, component);
      };
      var remove$$1 = function (component) {
        detach(component);
      };
      var destroy = function () {
        domEvents.unbind();
        remove(root.element());
      };
      var broadcastData = function (data) {
        var receivers = registry.filter(receive());
        each(receivers, function (receiver) {
          var descHandler = receiver.descHandler();
          var handler = getCurried(descHandler);
          handler(data);
        });
      };
      var broadcast$$1 = function (message) {
        broadcastData({
          universal: constant(true),
          data: constant(message)
        });
      };
      var broadcastOn = function (channels, message) {
        broadcastData({
          universal: constant(false),
          channels: constant(channels),
          data: constant(message)
        });
      };
      var broadcastEvent = function (eventName, event) {
        var listeners = registry.filter(eventName);
        return broadcast(listeners, event);
      };
      var getByUid = function (uid) {
        return registry.getById(uid).fold(function () {
          return Result.error(new Error('Could not find component with uid: "' + uid + '" in system.'));
        }, Result.value);
      };
      var getByDom = function (elem) {
        var uid = read$1(elem).getOr('not found');
        return getByUid(uid);
      };
      addToWorld(root);
      return {
        root: constant(root),
        element: root.element,
        destroy: destroy,
        add: add,
        remove: remove$$1,
        getByUid: getByUid,
        getByDom: getByDom,
        addToWorld: addToWorld,
        removeFromWorld: removeFromWorld,
        broadcast: broadcast$$1,
        broadcastOn: broadcastOn,
        broadcastEvent: broadcastEvent
      };
    };

    var global$4 = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

    var global$5 = tinymce.util.Tools.resolve('tinymce.EditorManager');

    var getSkinUrl = function (editor) {
      var settings = editor.settings;
      var skin = settings.skin;
      var skinUrl = settings.skin_url;
      if (skin !== false) {
        var skinName = skin ? skin : 'oxide';
        if (skinUrl) {
          skinUrl = editor.documentBaseURI.toAbsolute(skinUrl);
        } else {
          skinUrl = global$5.baseURL + '/skins/ui/' + skinName;
        }
      }
      return skinUrl;
    };
    var isReadOnly = function (editor) {
      return editor.getParam('readonly', false, 'boolean');
    };
    var isSkinDisabled = function (editor) {
      return editor.getParam('skin') === false;
    };
    var getHeightSetting = function (editor) {
      return editor.getParam('height', Math.max(editor.getElement().offsetHeight, 200));
    };
    var getMinWidthSetting = function (editor) {
      return Option.from(editor.settings.min_width).filter(isNumber);
    };
    var getMinHeightSetting = function (editor) {
      return Option.from(editor.settings.min_height).filter(isNumber);
    };
    var getMaxWidthSetting = function (editor) {
      return Option.from(editor.getParam('max_width')).filter(isNumber);
    };
    var getMaxHeightSetting = function (editor) {
      return Option.from(editor.getParam('max_height')).filter(isNumber);
    };
    var getUserStyleFormats = function (editor) {
      return Option.from(editor.getParam('style_formats')).filter(isArray);
    };
    var isMergeStyleFormats = function (editor) {
      return editor.getParam('style_formats_merge', false, 'boolean');
    };
    var getRemovedMenuItems = function (editor) {
      return editor.getParam('removed_menuitems', '');
    };
    var isMenubarEnabled = function (editor) {
      return editor.getParam('menubar', true, 'boolean') !== false;
    };
    var isToolbarEnabled = function (editor) {
      var toolbarConfig = editor.getParam('toolbar');
      if (isArray(toolbarConfig)) {
        return toolbarConfig.length > 0;
      } else {
        return editor.getParam('toolbar', true, 'boolean') !== false;
      }
    };
    var getMultipleToolbarsSetting = function (editor) {
      var keys$$1 = keys(editor.settings);
      var toolbarKeys = filter(keys$$1, function (key) {
        return /^toolbar([1-9])$/.test(key);
      });
      var toolbars = map(toolbarKeys, function (key) {
        return editor.getParam(key, false, 'string');
      });
      var toolbarArray = filter(toolbars, function (toolbar) {
        return typeof toolbar === 'string';
      });
      return toolbarArray.length > 0 ? Option.some(toolbarArray) : Option.none();
    };

    var formChangeEvent = generate$1('form-component-change');
    var formCloseEvent = generate$1('form-close');
    var formCancelEvent = generate$1('form-cancel');
    var formActionEvent = generate$1('form-action');
    var formSubmitEvent = generate$1('form-submit');
    var formBlockEvent = generate$1('form-block');
    var formUnblockEvent = generate$1('form-unblock');
    var formTabChangeEvent = generate$1('form-tabchange');
    var formResizeEvent = generate$1('form-resize');

    var renderAlertBanner = function (spec, providersBackstage) {
      return Container.sketch({
        dom: {
          tag: 'div',
          attributes: { role: 'alert' },
          classes: [
            'tox-notification',
            'tox-notification--in',
            'tox-notification--' + spec.level
          ]
        },
        components: [
          {
            dom: {
              tag: 'div',
              classes: ['tox-notification__body'],
              innerHtml: providersBackstage.translate(spec.text)
            }
          },
          Button.sketch({
            dom: {
              tag: 'button',
              classes: [
                'tox-notification__right-icon',
                'tox-button',
                'tox-button--naked',
                'tox-button--icon'
              ],
              innerHtml: get$e(spec.icon, providersBackstage.icons),
              attributes: { title: providersBackstage.translate(spec.actionLabel) }
            },
            action: function (comp) {
              emitWith(comp, formActionEvent, {
                name: 'alert-banner',
                value: spec.url
              });
            }
          })
        ]
      });
    };

    var schema$d = constant([
      defaulted$1('prefix', 'form-field'),
      field$1('fieldBehaviours', [
        Composing,
        Representing
      ])
    ]);
    var parts$3 = constant([
      optional({
        schema: [strict$1('dom')],
        name: 'label'
      }),
      optional({
        factory: {
          sketch: function (spec) {
            return {
              uid: spec.uid,
              dom: {
                tag: 'span',
                styles: { display: 'none' },
                attributes: { 'aria-hidden': 'true' },
                innerHtml: spec.text
              }
            };
          }
        },
        schema: [strict$1('text')],
        name: 'aria-descriptor'
      }),
      required({
        factory: {
          sketch: function (spec) {
            var excludeFactory = exclude$1(spec, ['factory']);
            return spec.factory.sketch(excludeFactory);
          }
        },
        schema: [strict$1('factory')],
        name: 'field'
      })
    ]);

    var factory$4 = function (detail, components$$1, spec, externals) {
      var behaviours = augment(detail.fieldBehaviours, [
        Composing.config({
          find: function (container) {
            return getPart(container, detail, 'field');
          }
        }),
        Representing.config({
          store: {
            mode: 'manual',
            getValue: function (field) {
              return Composing.getCurrent(field).bind(Representing.getValue);
            },
            setValue: function (field, value) {
              Composing.getCurrent(field).each(function (current) {
                Representing.setValue(current, value);
              });
            }
          }
        })
      ]);
      var events = derive([runOnAttached(function (component, simulatedEvent) {
          var ps = getParts(component, detail, [
            'label',
            'field',
            'aria-descriptor'
          ]);
          ps.field().each(function (field) {
            var id = generate$1(detail.prefix);
            ps.label().each(function (label) {
              set$1(label.element(), 'for', id);
              set$1(field.element(), 'id', id);
            });
            ps['aria-descriptor']().each(function (descriptor) {
              var descriptorId = generate$1(detail.prefix);
              set$1(descriptor.element(), 'id', descriptorId);
              set$1(field.element(), 'aria-describedby', descriptorId);
            });
          });
        })]);
      var apis = {
        getField: function (container) {
          return getPart(container, detail, 'field');
        },
        getLabel: function (container) {
          return getPart(container, detail, 'label');
        }
      };
      return {
        uid: detail.uid,
        dom: detail.dom,
        components: components$$1,
        behaviours: behaviours,
        events: events,
        apis: apis
      };
    };
    var FormField = composite$1({
      name: 'FormField',
      configFields: schema$d(),
      partFields: parts$3(),
      factory: factory$4,
      apis: {
        getField: function (apis, comp) {
          return apis.getField(comp);
        },
        getLabel: function (apis, comp) {
          return apis.getLabel(comp);
        }
      }
    });

    var getCoupled = function (component, coupleConfig, coupleState, name) {
      return coupleState.getOrCreate(component, coupleConfig, name);
    };

    var CouplingApis = /*#__PURE__*/Object.freeze({
        getCoupled: getCoupled
    });

    var CouplingSchema = [strictOf('others', setOf$1(Result.value, anyValue$1()))];

    var init$5 = function (spec) {
      var coupled = {};
      var getOrCreate = function (component, coupleConfig, name) {
        var available = keys(coupleConfig.others);
        if (!available) {
          throw new Error('Cannot find coupled component: ' + name + '. Known coupled components: ' + JSON$1.stringify(available, null, 2));
        } else {
          return readOptFrom$1(coupled, name).getOrThunk(function () {
            var builder = readOptFrom$1(coupleConfig.others, name).getOrDie('No information found for coupled component: ' + name);
            var spec = builder(component);
            var built = component.getSystem().build(spec);
            coupled[name] = built;
            return built;
          });
        }
      };
      var readState = constant({});
      return nu$5({
        readState: readState,
        getOrCreate: getOrCreate
      });
    };

    var CouplingState = /*#__PURE__*/Object.freeze({
        init: init$5
    });

    var Coupling = create$1({
      fields: CouplingSchema,
      name: 'coupling',
      apis: CouplingApis,
      state: CouplingState
    });

    var events$9 = function (streamConfig, streamState) {
      var streams = streamConfig.stream.streams;
      var processor = streams.setup(streamConfig, streamState);
      return derive([
        run(streamConfig.event, processor),
        runOnDetached(function () {
          return streamState.cancel();
        })
      ].concat(streamConfig.cancelEvent.map(function (e) {
        return [run(e, function () {
            return streamState.cancel();
          })];
      }).getOr([])));
    };

    var ActiveStreaming = /*#__PURE__*/Object.freeze({
        events: events$9
    });

    var throttle = function (_config) {
      var state = Cell(null);
      var readState = function () {
        return { timer: state.get() !== null ? 'set' : 'unset' };
      };
      var setTimer = function (t) {
        state.set(t);
      };
      var cancel = function () {
        var t = state.get();
        if (t !== null) {
          t.cancel();
        }
      };
      return nu$5({
        readState: readState,
        setTimer: setTimer,
        cancel: cancel
      });
    };
    var init$6 = function (spec) {
      return spec.stream.streams.state(spec);
    };

    var StreamingState = /*#__PURE__*/Object.freeze({
        throttle: throttle,
        init: init$6
    });

    var setup$2 = function (streamInfo, streamState) {
      var sInfo = streamInfo.stream;
      var throttler = last$3(streamInfo.onStream, sInfo.delay);
      streamState.setTimer(throttler);
      return function (component, simulatedEvent) {
        throttler.throttle(component, simulatedEvent);
        if (sInfo.stopEvent) {
          simulatedEvent.stop();
        }
      };
    };
    var StreamingSchema = [
      strictOf('stream', choose$1('mode', {
        throttle: [
          strict$1('delay'),
          defaulted$1('stopEvent', true),
          output$1('streams', {
            setup: setup$2,
            state: throttle
          })
        ]
      })),
      defaulted$1('event', 'input'),
      option('cancelEvent'),
      onStrictHandler('onStream')
    ];

    var Streaming = create$1({
      fields: StreamingSchema,
      name: 'streaming',
      active: ActiveStreaming,
      state: StreamingState
    });

    var nu$a = function (baseFn) {
      var data = Option.none();
      var callbacks = [];
      var map$$1 = function (f) {
        return nu$a(function (nCallback) {
          get(function (data) {
            nCallback(f(data));
          });
        });
      };
      var get = function (nCallback) {
        if (isReady())
          call(nCallback);
        else
          callbacks.push(nCallback);
      };
      var set = function (x) {
        data = Option.some(x);
        run(callbacks);
        callbacks = [];
      };
      var isReady = function () {
        return data.isSome();
      };
      var run = function (cbs) {
        each(cbs, call);
      };
      var call = function (cb) {
        data.each(function (x) {
          setTimeout(function () {
            cb(x);
          }, 0);
        });
      };
      baseFn(set);
      return {
        get: get,
        map: map$$1,
        isReady: isReady
      };
    };
    var pure$1 = function (a) {
      return nu$a(function (callback) {
        callback(a);
      });
    };
    var LazyValue = {
      nu: nu$a,
      pure: pure$1
    };

    var bounce = function (f) {
      return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var me = this;
        setTimeout(function () {
          f.apply(me, args);
        }, 0);
      };
    };

    var nu$b = function (baseFn) {
      var get = function (callback) {
        baseFn(bounce(callback));
      };
      var map = function (fab) {
        return nu$b(function (callback) {
          get(function (a) {
            var value = fab(a);
            callback(value);
          });
        });
      };
      var bind = function (aFutureB) {
        return nu$b(function (callback) {
          get(function (a) {
            aFutureB(a).get(callback);
          });
        });
      };
      var anonBind = function (futureB) {
        return nu$b(function (callback) {
          get(function (a) {
            futureB.get(callback);
          });
        });
      };
      var toLazy = function () {
        return LazyValue.nu(get);
      };
      var toCached = function () {
        var cache = null;
        return nu$b(function (callback) {
          if (cache === null) {
            cache = toLazy();
          }
          cache.get(callback);
        });
      };
      return {
        map: map,
        bind: bind,
        anonBind: anonBind,
        toLazy: toLazy,
        toCached: toCached,
        get: get
      };
    };
    var pure$2 = function (a) {
      return nu$b(function (callback) {
        callback(a);
      });
    };
    var Future = {
      nu: nu$b,
      pure: pure$2
    };

    var suffix = constant('sink');
    var partType = constant(optional({
      name: suffix(),
      overrides: constant({
        dom: { tag: 'div' },
        behaviours: derive$1([Positioning.config({ useFixed: true })]),
        events: derive([
          cutter(keydown()),
          cutter(mousedown()),
          cutter(click())
        ])
      })
    }));

    var HighlightOnOpen;
    (function (HighlightOnOpen) {
      HighlightOnOpen[HighlightOnOpen['HighlightFirst'] = 0] = 'HighlightFirst';
      HighlightOnOpen[HighlightOnOpen['HighlightNone'] = 1] = 'HighlightNone';
    }(HighlightOnOpen || (HighlightOnOpen = {})));
    var getAnchor = function (detail, component) {
      var ourHotspot = detail.getHotspot(component).getOr(component);
      var anchor = 'hotspot';
      return detail.layouts.fold(function () {
        return {
          anchor: anchor,
          hotspot: ourHotspot
        };
      }, function (layouts) {
        return {
          anchor: anchor,
          hotspot: ourHotspot,
          layouts: layouts
        };
      });
    };
    var fetch = function (detail, mapFetch, component) {
      var fetcher = detail.fetch;
      return fetcher(component).map(mapFetch);
    };
    var openF = function (detail, mapFetch, anchor, component, sandbox, externals, highlightOnOpen) {
      var futureData = fetch(detail, mapFetch, component);
      var getLazySink = getSink(component, detail);
      return futureData.map(function (data) {
        return tieredMenu.sketch(__assign({}, externals.menu(), {
          uid: generate$2(''),
          data: data,
          highlightImmediately: highlightOnOpen === HighlightOnOpen.HighlightFirst,
          onOpenMenu: function (tmenu, menu) {
            var sink = getLazySink().getOrDie();
            Positioning.position(sink, anchor, menu);
            Sandboxing.decloak(sandbox);
          },
          onOpenSubmenu: function (tmenu, item, submenu) {
            var sink = getLazySink().getOrDie();
            Positioning.position(sink, {
              anchor: 'submenu',
              item: item
            }, submenu);
            Sandboxing.decloak(sandbox);
          },
          onEscape: function () {
            Focusing.focus(component);
            Sandboxing.close(sandbox);
            return Option.some(true);
          }
        }));
      });
    };
    var open$1 = function (detail, mapFetch, hotspot, sandbox, externals, onOpenSync, highlightOnOpen) {
      var anchor = getAnchor(detail, hotspot);
      var processed = openF(detail, mapFetch, anchor, hotspot, sandbox, externals, highlightOnOpen);
      return processed.map(function (data) {
        Sandboxing.cloak(sandbox);
        Sandboxing.open(sandbox, data);
        onOpenSync(sandbox);
        return sandbox;
      });
    };
    var close$1 = function (detail, mapFetch, component, sandbox, _externals, _onOpenSync, _highlightOnOpen) {
      Sandboxing.close(sandbox);
      return Future.pure(sandbox);
    };
    var togglePopup = function (detail, mapFetch, hotspot, externals, onOpenSync, highlightOnOpen) {
      var sandbox = Coupling.getCoupled(hotspot, 'sandbox');
      var showing = Sandboxing.isOpen(sandbox);
      var action = showing ? close$1 : open$1;
      return action(detail, mapFetch, hotspot, sandbox, externals, onOpenSync, highlightOnOpen);
    };
    var matchWidth = function (hotspot, container, useMinWidth) {
      var menu = Composing.getCurrent(container).getOr(container);
      var buttonWidth = get$8(hotspot.element());
      if (useMinWidth) {
        set$2(menu.element(), 'min-width', buttonWidth + 'px');
      } else {
        set$4(menu.element(), buttonWidth);
      }
    };
    var getSink = function (anyInSystem, sinkDetail) {
      return anyInSystem.getSystem().getByUid(sinkDetail.uid + '-' + suffix()).map(function (internalSink) {
        return function () {
          return Result.value(internalSink);
        };
      }).getOrThunk(function () {
        return sinkDetail.lazySink.fold(function () {
          return function () {
            return Result.error(new Error('No internal sink is specified, nor could an external sink be found'));
          };
        }, function (lazySinkFn) {
          return function () {
            return lazySinkFn(anyInSystem);
          };
        });
      });
    };
    var makeSandbox = function (detail, hotspot, extras) {
      var ariaOwner = manager();
      var onOpen = function (component, menu) {
        var anchor = getAnchor(detail, hotspot);
        ariaOwner.link(hotspot.element());
        if (detail.matchWidth) {
          matchWidth(anchor.hotspot, menu, detail.useMinWidth);
        }
        detail.onOpen(anchor, component, menu);
        if (extras !== undefined && extras.onOpen !== undefined) {
          extras.onOpen(component, menu);
        }
      };
      var onClose = function (component, menu) {
        ariaOwner.unlink(hotspot.element());
        if (extras !== undefined && extras.onClose !== undefined) {
          extras.onClose(component, menu);
        }
      };
      var lazySink = getSink(hotspot, detail);
      return {
        dom: {
          tag: 'div',
          classes: detail.sandboxClasses,
          attributes: { id: ariaOwner.id() }
        },
        behaviours: SketchBehaviours.augment(detail.sandboxBehaviours, [
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: hotspot
            }
          }),
          Sandboxing.config({
            onOpen: onOpen,
            onClose: onClose,
            isPartOf: function (container, data, queryElem) {
              return isPartOf(data, queryElem) || isPartOf(hotspot, queryElem);
            },
            getAttachPoint: function () {
              return lazySink().getOrDie();
            }
          }),
          Composing.config({
            find: function (sandbox) {
              return Sandboxing.getState(sandbox).bind(function (menu) {
                return Composing.getCurrent(menu);
              });
            }
          }),
          receivingConfig({ isExtraPart: constant(false) })
        ])
      };
    };

    var setValueFromItem = function (model, input, item) {
      var itemData = Representing.getValue(item);
      Representing.setValue(input, itemData);
      setCursorAtEnd(input);
    };
    var setSelectionOn = function (input, f) {
      var el = input.element();
      var value = get$6(el);
      var node = el.dom();
      if (get$2(el, 'type') !== 'number') {
        f(node, value);
      }
    };
    var setCursorAtEnd = function (input) {
      setSelectionOn(input, function (node, value) {
        return node.setSelectionRange(value.length, value.length);
      });
    };
    var setSelectionToEnd = function (input, startOffset) {
      setSelectionOn(input, function (node, value) {
        return node.setSelectionRange(startOffset, value.length);
      });
    };
    var attemptSelectOver = function (model, input, item) {
      if (!model.selectsOver) {
        return Option.none();
      } else {
        var currentValue = Representing.getValue(input);
        var inputDisplay_1 = model.getDisplayText(currentValue);
        var itemValue = Representing.getValue(item);
        var itemDisplay = model.getDisplayText(itemValue);
        return itemDisplay.indexOf(inputDisplay_1) === 0 ? Option.some(function () {
          setValueFromItem(model, input, item);
          setSelectionToEnd(input, inputDisplay_1.length);
        }) : Option.none();
      }
    };

    var schema$e = constant([
      option('data'),
      defaulted$1('inputAttributes', {}),
      defaulted$1('inputStyles', {}),
      defaulted$1('tag', 'input'),
      defaulted$1('inputClasses', []),
      onHandler('onSetValue'),
      defaulted$1('styles', {}),
      defaulted$1('eventOrder', {}),
      field$1('inputBehaviours', [
        Representing,
        Focusing
      ]),
      defaulted$1('selectOnFocus', true)
    ]);
    var focusBehaviours = function (detail) {
      return derive$1([Focusing.config({
          onFocus: detail.selectOnFocus === false ? noop : function (component) {
            var input = component.element();
            var value = get$6(input);
            input.dom().setSelectionRange(0, value.length);
          }
        })]);
    };
    var behaviours = function (detail) {
      return __assign({}, focusBehaviours(detail), augment(detail.inputBehaviours, [Representing.config({
          store: {
            mode: 'manual',
            initialValue: detail.data.getOr(undefined),
            getValue: function (input) {
              return get$6(input.element());
            },
            setValue: function (input, data) {
              var current = get$6(input.element());
              if (current !== data) {
                set$3(input.element(), data);
              }
            }
          },
          onSetValue: detail.onSetValue
        })]));
    };
    var dom$3 = function (detail) {
      return {
        tag: detail.tag,
        attributes: __assign({ type: 'input' }, detail.inputAttributes),
        styles: detail.inputStyles,
        classes: detail.inputClasses
      };
    };

    var itemExecute = constant('alloy.typeahead.itemexecute');

    var make$3 = function (detail, components, spec, externals) {
      var navigateList = function (comp, simulatedEvent, highlighter) {
        detail.previewing.set(false);
        var sandbox = Coupling.getCoupled(comp, 'sandbox');
        if (Sandboxing.isOpen(sandbox)) {
          Composing.getCurrent(sandbox).each(function (menu) {
            Highlighting.getHighlighted(menu).fold(function () {
              highlighter(menu);
            }, function () {
              dispatchEvent(sandbox, menu.element(), 'keydown', simulatedEvent);
            });
          });
        } else {
          var onOpenSync = function (sandbox) {
            Composing.getCurrent(sandbox).each(highlighter);
          };
          open$1(detail, mapFetch(comp), comp, sandbox, externals, onOpenSync, HighlightOnOpen.HighlightFirst).get(noop);
        }
      };
      var focusBehaviours$$1 = focusBehaviours(detail);
      var mapFetch = function (comp) {
        return function (tdata) {
          var menus = values(tdata.menus);
          var items = bind(menus, function (menu) {
            return filter(menu.items, function (item) {
              return item.type === 'item';
            });
          });
          var repState = Representing.getState(comp);
          repState.update(map(items, function (item) {
            return item.data;
          }));
          return tdata;
        };
      };
      var behaviours$$1 = [
        Focusing.config({}),
        Representing.config({
          onSetValue: detail.onSetValue,
          store: __assign({
            mode: 'dataset',
            getDataKey: function (comp) {
              return get$6(comp.element());
            },
            getFallbackEntry: function (itemString) {
              return {
                value: itemString,
                meta: {}
              };
            },
            setValue: function (comp, data) {
              set$3(comp.element(), detail.model.getDisplayText(data));
            }
          }, detail.initialData.map(function (d) {
            return wrap$1('initialValue', d);
          }).getOr({}))
        }),
        Streaming.config({
          stream: {
            mode: 'throttle',
            delay: detail.responseTime,
            stopEvent: false
          },
          onStream: function (component, simulatedEvent) {
            var sandbox = Coupling.getCoupled(component, 'sandbox');
            var focusInInput = Focusing.isFocused(component);
            if (focusInInput) {
              if (get$6(component.element()).length >= detail.minChars) {
                var previousValue_1 = Composing.getCurrent(sandbox).bind(function (menu) {
                  return Highlighting.getHighlighted(menu).map(Representing.getValue);
                });
                detail.previewing.set(true);
                var onOpenSync = function (_sandbox) {
                  Composing.getCurrent(sandbox).each(function (menu) {
                    previousValue_1.fold(function () {
                      if (detail.model.selectsOver) {
                        Highlighting.highlightFirst(menu);
                      }
                    }, function (pv) {
                      Highlighting.highlightBy(menu, function (item) {
                        var itemData = Representing.getValue(item);
                        return itemData.value === pv.value;
                      });
                      Highlighting.getHighlighted(menu).orThunk(function () {
                        Highlighting.highlightFirst(menu);
                        return Option.none();
                      });
                    });
                  });
                };
                open$1(detail, mapFetch(component), component, sandbox, externals, onOpenSync, HighlightOnOpen.HighlightFirst).get(noop);
              }
            }
          },
          cancelEvent: typeaheadCancel()
        }),
        Keying.config({
          mode: 'special',
          onDown: function (comp, simulatedEvent) {
            navigateList(comp, simulatedEvent, Highlighting.highlightFirst);
            return Option.some(true);
          },
          onEscape: function (comp) {
            var sandbox = Coupling.getCoupled(comp, 'sandbox');
            if (Sandboxing.isOpen(sandbox)) {
              Sandboxing.close(sandbox);
              return Option.some(true);
            }
            return Option.none();
          },
          onUp: function (comp, simulatedEvent) {
            navigateList(comp, simulatedEvent, Highlighting.highlightLast);
            return Option.some(true);
          },
          onEnter: function (comp) {
            var sandbox = Coupling.getCoupled(comp, 'sandbox');
            var sandboxIsOpen = Sandboxing.isOpen(sandbox);
            if (sandboxIsOpen && !detail.previewing.get()) {
              return Composing.getCurrent(sandbox).bind(function (menu) {
                return Highlighting.getHighlighted(menu);
              }).map(function (item) {
                emitWith(comp, itemExecute(), { item: item });
                return true;
              });
            } else {
              var currentValue = Representing.getValue(comp);
              emit(comp, typeaheadCancel());
              detail.onExecute(sandbox, comp, currentValue);
              if (sandboxIsOpen) {
                Sandboxing.close(sandbox);
              }
              return Option.some(true);
            }
          }
        }),
        Toggling.config({
          toggleClass: detail.markers.openClass,
          aria: {
            mode: 'pressed',
            syncWithExpanded: true
          }
        }),
        Coupling.config({
          others: {
            sandbox: function (hotspot) {
              return makeSandbox(detail, hotspot, {
                onOpen: identity,
                onClose: identity
              });
            }
          }
        }),
        config('typeaheadevents', [
          runOnExecute(function (comp) {
            var onOpenSync = noop;
            togglePopup(detail, mapFetch(comp), comp, externals, onOpenSync, HighlightOnOpen.HighlightFirst).get(noop);
          }),
          run(itemExecute(), function (comp, se) {
            var sandbox = Coupling.getCoupled(comp, 'sandbox');
            setValueFromItem(detail.model, comp, se.event().item());
            emit(comp, typeaheadCancel());
            detail.onItemExecute(comp, sandbox, se.event().item(), Representing.getValue(comp));
            Sandboxing.close(sandbox);
            setCursorAtEnd(comp);
          })
        ].concat(detail.dismissOnBlur ? [run(postBlur(), function (typeahead) {
            var sandbox = Coupling.getCoupled(typeahead, 'sandbox');
            if (search$1(sandbox.element()).isNone()) {
              Sandboxing.close(sandbox);
            }
          })] : []))
      ];
      return {
        uid: detail.uid,
        dom: dom$3(detail),
        behaviours: __assign({}, focusBehaviours$$1, augment(detail.typeaheadBehaviours, behaviours$$1)),
        eventOrder: detail.eventOrder
      };
    };

    var sandboxFields = function () {
      return [
        defaulted$1('sandboxClasses', []),
        SketchBehaviours.field('sandboxBehaviours', [
          Composing,
          Receiving,
          Sandboxing,
          Representing
        ])
      ];
    };

    var schema$f = constant([
      option('lazySink'),
      strict$1('fetch'),
      defaulted$1('minChars', 5),
      defaulted$1('responseTime', 1000),
      onHandler('onOpen'),
      defaulted$1('getHotspot', Option.some),
      defaulted$1('layouts', Option.none()),
      defaulted$1('eventOrder', {}),
      defaultedObjOf('model', {}, [
        defaulted$1('getDisplayText', function (itemData) {
          return itemData.meta !== undefined && itemData.meta.text !== undefined ? itemData.meta.text : itemData.value;
        }),
        defaulted$1('selectsOver', true),
        defaulted$1('populateFromBrowse', true)
      ]),
      onHandler('onSetValue'),
      onKeyboardHandler('onExecute'),
      onHandler('onItemExecute'),
      defaulted$1('inputClasses', []),
      defaulted$1('inputAttributes', {}),
      defaulted$1('inputStyles', {}),
      defaulted$1('matchWidth', true),
      defaulted$1('useMinWidth', false),
      defaulted$1('dismissOnBlur', true),
      markers(['openClass']),
      option('initialData'),
      field$1('typeaheadBehaviours', [
        Focusing,
        Representing,
        Streaming,
        Keying,
        Toggling,
        Coupling
      ]),
      state$1('previewing', function () {
        return Cell(true);
      })
    ].concat(schema$e()).concat(sandboxFields()));
    var parts$4 = constant([external$1({
        schema: [tieredMenuMarkers()],
        name: 'menu',
        overrides: function (detail) {
          return {
            fakeFocus: true,
            onHighlight: function (menu, item) {
              if (!detail.previewing.get()) {
                menu.getSystem().getByUid(detail.uid).each(function (input) {
                  if (detail.model.populateFromBrowse) {
                    setValueFromItem(detail.model, input, item);
                  }
                });
              } else {
                menu.getSystem().getByUid(detail.uid).each(function (input) {
                  attemptSelectOver(detail.model, input, item).fold(function () {
                    return Highlighting.dehighlight(menu, item);
                  }, function (fn) {
                    return fn();
                  });
                });
              }
              detail.previewing.set(false);
            },
            onExecute: function (menu, item) {
              return menu.getSystem().getByUid(detail.uid).toOption().map(function (typeahead) {
                emitWith(typeahead, itemExecute(), { item: item });
                return true;
              });
            },
            onHover: function (menu, item) {
              detail.previewing.set(false);
              menu.getSystem().getByUid(detail.uid).each(function (input) {
                if (detail.model.populateFromBrowse) {
                  setValueFromItem(detail.model, input, item);
                }
              });
            }
          };
        }
      })]);

    var Typeahead = composite$1({
      name: 'Typeahead',
      configFields: schema$f(),
      partFields: parts$4(),
      factory: make$3
    });

    var renderFormFieldWith = function (pLabel, pField, extraClasses) {
      var spec = renderFormFieldSpecWith(pLabel, pField, extraClasses);
      return FormField.sketch(spec);
    };
    var renderFormField = function (pLabel, pField) {
      return renderFormFieldWith(pLabel, pField, []);
    };
    var renderFormFieldSpecWith = function (pLabel, pField, extraClasses) {
      return {
        dom: renderFormFieldDomWith(extraClasses),
        components: pLabel.toArray().concat([pField])
      };
    };
    var renderFormFieldDom = function () {
      return renderFormFieldDomWith([]);
    };
    var renderFormFieldDomWith = function (extraClasses) {
      return {
        tag: 'div',
        classes: ['tox-form__group'].concat(extraClasses)
      };
    };
    var renderLabel = function (label, providersBackstage) {
      return FormField.parts().label({
        dom: {
          tag: 'label',
          classes: ['tox-label'],
          innerHtml: providersBackstage.translate(label)
        }
      });
    };

    var isMenuItemReference = function (item) {
      return isString(item);
    };
    var isSeparator = function (item) {
      return item.type === 'separator';
    };
    var isExpandingMenuItem = function (item) {
      return has(item, 'getSubmenuItems');
    };
    var separator$1 = { type: 'separator' };
    var unwrapReferences = function (items, menuItems) {
      var realItems = foldl(items, function (acc, item) {
        if (isMenuItemReference(item)) {
          if (item === '') {
            return acc;
          } else if (item === '|') {
            return acc.length > 0 && !isSeparator(acc[acc.length - 1]) ? acc.concat([separator$1]) : acc;
          } else if (has(menuItems, item.toLowerCase())) {
            return acc.concat([menuItems[item.toLowerCase()]]);
          } else {
            console.error('No representation for menuItem: ' + item);
            return acc;
          }
        } else {
          return acc.concat([item]);
        }
      }, []);
      if (realItems.length > 0 && isSeparator(realItems[realItems.length - 1])) {
        realItems.pop();
      }
      return realItems;
    };
    var getFromExpandingItem = function (item, menuItems) {
      var submenuItems = item.getSubmenuItems();
      var rest = expand(submenuItems, menuItems);
      var newMenus = deepMerge(rest.menus, wrap$1(item.value, rest.items));
      var newExpansions = deepMerge(rest.expansions, wrap$1(item.value, item.value));
      return {
        item: item,
        menus: newMenus,
        expansions: newExpansions
      };
    };
    var getFromItem = function (item, menuItems) {
      return isExpandingMenuItem(item) ? getFromExpandingItem(item, menuItems) : {
        item: item,
        menus: {},
        expansions: {}
      };
    };
    var generateValueIfRequired = function (item) {
      if (isSeparator(item)) {
        return item;
      } else {
        var itemValue = readOptFrom$1(item, 'value').getOrThunk(function () {
          return generate$1('generated-menu-item');
        });
        return deepMerge({ value: itemValue }, item);
      }
    };
    var expand = function (items, menuItems) {
      var realItems = unwrapReferences(isString(items) ? items.split(' ') : items, menuItems);
      return foldr(realItems, function (acc, item) {
        var itemWithValue = generateValueIfRequired(item);
        var newData = getFromItem(itemWithValue, menuItems);
        return {
          menus: deepMerge(acc.menus, newData.menus),
          items: [newData.item].concat(acc.items),
          expansions: deepMerge(acc.expansions, newData.expansions)
        };
      }, {
        menus: {},
        expansions: {},
        items: []
      });
    };

    var build$2 = function (items, itemResponse, providersBackstage) {
      var primary = generate$1('primary-menu');
      var data = expand(items, providersBackstage.menuItems());
      var mainMenu = createPartialMenu(primary, data.items, itemResponse, providersBackstage);
      var submenus = map$1(data.menus, function (menuItems, menuName) {
        return createPartialMenu(menuName, menuItems, itemResponse, providersBackstage);
      });
      var menus = deepMerge(submenus, wrap$1(primary, mainMenu));
      return tieredMenu.tieredData(primary, menus, data.expansions);
    };

    var renderAutocomplete = function (spec, sharedBackstage) {
      var pLabel = renderLabel(spec.label.getOr('?'), sharedBackstage.providers);
      var pField = FormField.parts().field({
        factory: Typeahead,
        dismissOnBlur: false,
        inputClasses: ['tox-textfield'],
        minChars: 1,
        fetch: function (input) {
          var value = Representing.getValue(input);
          var items = spec.getItems(value);
          var tdata = build$2(items, ItemResponse$1.BUBBLE_TO_SANDBOX, sharedBackstage.providers);
          return Future.pure(tdata);
        },
        markers: { openClass: 'dog' },
        lazySink: sharedBackstage.getSink,
        parts: { menu: part(false, 1, 'normal') }
      });
      return renderFormField(Option.some(pLabel), pField);
    };

    var renderBar = function (spec, backstage) {
      return {
        dom: {
          tag: 'div',
          classes: ['tox-bar']
        },
        components: map(spec.items, backstage.interpreter)
      };
    };

    var factory$5 = function (detail, spec) {
      return {
        uid: detail.uid,
        dom: dom$3(detail),
        components: [],
        behaviours: behaviours(detail),
        eventOrder: detail.eventOrder
      };
    };
    var Input = single$2({
      name: 'Input',
      configFields: schema$e(),
      factory: factory$5
    });

    var isFirefox$1 = PlatformDetection$1.detect().browser.isFirefox();
    var offscreen = {
      position: 'absolute',
      left: '-9999px'
    };
    var create$5 = function (doc, text) {
      var span = Element$$1.fromTag('span', doc.dom());
      set$1(span, 'role', 'presentation');
      var contents = Element$$1.fromText(text, doc.dom());
      append(span, contents);
      return span;
    };
    var linkToDescription = function (item, token) {
      var id = generate$1('ephox-alloy-aria-voice');
      set$1(token, 'id', id);
      set$1(item, 'aria-describedby', id);
    };
    var base$1 = function (getAttrs, parent$$1, text) {
      var doc = owner(parent$$1);
      var token = create$5(doc, text);
      if (isFirefox$1) {
        linkToDescription(parent$$1, token);
      }
      setAll(token, getAttrs(text));
      setAll$1(token, offscreen);
      append(parent$$1, token);
      setTimeout(function () {
        remove$1(token, 'aria-live');
        remove(token);
      }, 1000);
    };
    var getShoutAttrs = function (_text) {
      return {
        'aria-live': 'assertive',
        'aria-atomic': 'true',
        'role': 'alert'
      };
    };
    var shout = function (parent$$1, text) {
      return base$1(getShoutAttrs, parent$$1, text);
    };

    var ariaElements = [
      'input',
      'textarea'
    ];
    var isAriaElement = function (elem) {
      var name$$1 = name(elem);
      return contains(ariaElements, name$$1);
    };
    var markValid = function (component, invalidConfig) {
      var elem = invalidConfig.getRoot(component).getOr(component.element());
      remove$4(elem, invalidConfig.invalidClass);
      invalidConfig.notify.each(function (notifyInfo) {
        if (isAriaElement(component.element())) {
          remove$1(elem, 'title');
        }
        notifyInfo.getContainer(component).each(function (container) {
          set(container, notifyInfo.validHtml);
        });
        notifyInfo.onValid(component);
      });
    };
    var markInvalid = function (component, invalidConfig, invalidState, text) {
      var elem = invalidConfig.getRoot(component).getOr(component.element());
      add$2(elem, invalidConfig.invalidClass);
      invalidConfig.notify.each(function (notifyInfo) {
        if (isAriaElement(component.element())) {
          set$1(component.element(), 'title', text);
        }
        shout(body(), text);
        notifyInfo.getContainer(component).each(function (container) {
          set(container, text);
        });
        notifyInfo.onInvalid(component, text);
      });
    };
    var query = function (component, invalidConfig, invalidState) {
      return invalidConfig.validator.fold(function () {
        return Future.pure(Result.value(true));
      }, function (validatorInfo) {
        return validatorInfo.validate(component);
      });
    };
    var run$1 = function (component, invalidConfig, invalidState) {
      invalidConfig.notify.each(function (notifyInfo) {
        notifyInfo.onValidate(component);
      });
      return query(component, invalidConfig, invalidState).map(function (valid) {
        if (component.getSystem().isConnected()) {
          return valid.fold(function (err) {
            markInvalid(component, invalidConfig, invalidState, err);
            return Result.error(err);
          }, function (v) {
            markValid(component, invalidConfig);
            return Result.value(v);
          });
        } else {
          return Result.error('No longer in system');
        }
      });
    };
    var isInvalid = function (component, invalidConfig) {
      var elem = invalidConfig.getRoot(component).getOr(component.element());
      return has$2(elem, invalidConfig.invalidClass);
    };

    var InvalidateApis = /*#__PURE__*/Object.freeze({
        markValid: markValid,
        markInvalid: markInvalid,
        query: query,
        run: run$1,
        isInvalid: isInvalid
    });

    var events$a = function (invalidConfig, invalidState) {
      return invalidConfig.validator.map(function (validatorInfo) {
        return derive([run(validatorInfo.onEvent, function (component) {
            run$1(component, invalidConfig, invalidState).get(identity);
          })].concat(validatorInfo.validateOnLoad ? [runOnAttached(function (component) {
            run$1(component, invalidConfig, invalidState).get(noop);
          })] : []));
      }).getOr({});
    };

    var ActiveInvalidate = /*#__PURE__*/Object.freeze({
        events: events$a
    });

    var InvalidateSchema = [
      strict$1('invalidClass'),
      defaulted$1('getRoot', Option.none),
      optionObjOf('notify', [
        defaulted$1('aria', 'alert'),
        defaulted$1('getContainer', Option.none),
        defaulted$1('validHtml', ''),
        onHandler('onValid'),
        onHandler('onInvalid'),
        onHandler('onValidate')
      ]),
      optionObjOf('validator', [
        strict$1('validate'),
        defaulted$1('onEvent', 'input'),
        defaulted$1('validateOnLoad', true)
      ])
    ];

    var Invalidating = create$1({
      fields: InvalidateSchema,
      name: 'invalidating',
      active: ActiveInvalidate,
      apis: InvalidateApis,
      extra: {
        validation: function (validator) {
          return function (component) {
            var v = Representing.getValue(component);
            return Future.pure(validator(v));
          };
        }
      }
    });

    var exhibit$4 = function (base, tabConfig) {
      return nu$6({
        attributes: wrapAll$1([{
            key: tabConfig.tabAttr,
            value: 'true'
          }])
      });
    };

    var ActiveTabstopping = /*#__PURE__*/Object.freeze({
        exhibit: exhibit$4
    });

    var TabstopSchema = [defaulted$1('tabAttr', 'data-alloy-tabstop')];

    var Tabstopping = create$1({
      fields: TabstopSchema,
      name: 'tabstopping',
      active: ActiveTabstopping
    });

    var hexColour = function (hexString) {
      return { value: constant(hexString) };
    };
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    var longformRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    var isHexString = function (hex) {
      return shorthandRegex.test(hex) || longformRegex.test(hex);
    };
    var getLongForm = function (hexColour) {
      var hexString = hexColour.value().replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
      });
      return { value: constant(hexString) };
    };
    var extractValues = function (hexColour) {
      var longForm = getLongForm(hexColour);
      return longformRegex.exec(longForm.value());
    };
    var toHex = function (component) {
      var hex = component.toString(16);
      return hex.length == 1 ? '0' + hex : hex;
    };
    var fromRgba = function (rgbaColour) {
      var value = toHex(rgbaColour.red()) + toHex(rgbaColour.green()) + toHex(rgbaColour.blue());
      return hexColour(value);
    };

    var min = Math.min, max = Math.max, round = Math.round;
    var rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
    var rgbaRegex = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d?(?:\.\d+)?)\)/;
    var rgbaColour = function (red, green, blue, alpha) {
      return {
        red: constant(red),
        green: constant(green),
        blue: constant(blue),
        alpha: constant(alpha)
      };
    };
    var isRgbaComponent = function (value) {
      var num = parseInt(value, 10);
      return num.toString() === value && num >= 0 && num <= 255;
    };
    var fromHsv = function (hsv) {
      var side, chroma, x, match, hue, saturation, brightness, r, g, b;
      hue = (hsv.hue() || 0) % 360;
      saturation = hsv.saturation() / 100;
      brightness = hsv.value() / 100;
      saturation = max(0, min(saturation, 1));
      brightness = max(0, min(brightness, 1));
      if (saturation === 0) {
        r = g = b = round(255 * brightness);
        return rgbaColour(r, g, b, 1);
      }
      side = hue / 60;
      chroma = brightness * saturation;
      x = chroma * (1 - Math.abs(side % 2 - 1));
      match = brightness - chroma;
      switch (Math.floor(side)) {
      case 0:
        r = chroma;
        g = x;
        b = 0;
        break;
      case 1:
        r = x;
        g = chroma;
        b = 0;
        break;
      case 2:
        r = 0;
        g = chroma;
        b = x;
        break;
      case 3:
        r = 0;
        g = x;
        b = chroma;
        break;
      case 4:
        r = x;
        g = 0;
        b = chroma;
        break;
      case 5:
        r = chroma;
        g = 0;
        b = x;
        break;
      default:
        r = g = b = 0;
      }
      r = round(255 * (r + match));
      g = round(255 * (g + match));
      b = round(255 * (b + match));
      return rgbaColour(r, g, b, 1);
    };
    var fromHex = function (hexColour$$1) {
      var result = extractValues(hexColour$$1);
      var red = parseInt(result[1], 16);
      var green = parseInt(result[2], 16);
      var blue = parseInt(result[3], 16);
      return rgbaColour(red, green, blue, 1);
    };
    var fromStringValues = function (red, green, blue, alpha) {
      var r = parseInt(red, 10);
      var g = parseInt(green, 10);
      var b = parseInt(blue, 10);
      var a = parseFloat(alpha);
      return rgbaColour(r, g, b, a);
    };
    var fromString$1 = function (rgbaString) {
      if (rgbaString === 'transparent') {
        return Option.some(rgbaColour(0, 0, 0, 0));
      } else if (rgbRegex.test(rgbaString)) {
        var rgbMatch = rgbRegex.exec(rgbaString);
        return Option.some(fromStringValues(rgbMatch[1], rgbMatch[2], rgbMatch[3], '1'));
      } else if (rgbaRegex.test(rgbaString)) {
        var rgbaMatch = rgbRegex.exec(rgbaString);
        return Option.some(fromStringValues(rgbaMatch[1], rgbaMatch[2], rgbaMatch[3], rgbaMatch[4]));
      } else {
        return Option.none();
      }
    };
    var toString$2 = function (rgba) {
      return 'rgba(' + rgba.red() + ',' + rgba.green() + ',' + rgba.blue() + ',' + rgba.alpha() + ')';
    };
    var red = constant(rgbaColour(255, 0, 0, 1));

    var global$6 = tinymce.util.Tools.resolve('tinymce.util.LocalStorage');

    var storageName = 'tinymce-custom-colors';
    function ColorCache (max) {
      if (max === void 0) {
        max = 10;
      }
      var storageString = global$6.getItem(storageName);
      var localstorage = isString(storageString) ? JSON.parse(storageString) : [];
      var prune = function (list) {
        var diff = max - list.length;
        return diff < 0 ? list.slice(0, max) : list;
      };
      var cache = prune(localstorage);
      var add = function (key) {
        indexOf(cache, key).each(remove);
        cache.unshift(key);
        if (cache.length > max) {
          cache.pop();
        }
        global$6.setItem(storageName, JSON.stringify(cache));
      };
      var remove = function (idx) {
        cache.splice(idx, 1);
      };
      var state = function () {
        return cache.slice(0);
      };
      return {
        add: add,
        state: state
      };
    }

    var choiceItem = 'choiceitem';
    var defaultColors = [
      {
        type: choiceItem,
        text: 'Turquoise',
        value: '#18BC9B'
      },
      {
        type: choiceItem,
        text: 'Green',
        value: '#2FCC71'
      },
      {
        type: choiceItem,
        text: 'Blue',
        value: '#3598DB'
      },
      {
        type: choiceItem,
        text: 'Purple',
        value: '#9B59B6'
      },
      {
        type: choiceItem,
        text: 'Navy Blue',
        value: '#34495E'
      },
      {
        type: choiceItem,
        text: 'Dark Turquoise',
        value: '#18A085'
      },
      {
        type: choiceItem,
        text: 'Dark Green',
        value: '#27AE60'
      },
      {
        type: choiceItem,
        text: 'Medium Blue',
        value: '#2880B9'
      },
      {
        type: choiceItem,
        text: 'Medium Purple',
        value: '#8E44AD'
      },
      {
        type: choiceItem,
        text: 'Midnight Blue',
        value: '#2B3E50'
      },
      {
        type: choiceItem,
        text: 'Yellow',
        value: '#F1C40F'
      },
      {
        type: choiceItem,
        text: 'Orange',
        value: '#E67E23'
      },
      {
        type: choiceItem,
        text: 'Red',
        value: '#E74C3C'
      },
      {
        type: choiceItem,
        text: 'Light Gray',
        value: '#ECF0F1'
      },
      {
        type: choiceItem,
        text: 'Gray',
        value: '#95A5A6'
      },
      {
        type: choiceItem,
        text: 'Dark Yellow',
        value: '#F29D12'
      },
      {
        type: choiceItem,
        text: 'Dark Orange',
        value: '#D35400'
      },
      {
        type: choiceItem,
        text: 'Dark Red',
        value: '#E74C3C'
      },
      {
        type: choiceItem,
        text: 'Medium Gray',
        value: '#BDC3C7'
      },
      {
        type: choiceItem,
        text: 'Dark Gray',
        value: '#7E8C8D'
      },
      {
        type: choiceItem,
        text: 'Black',
        value: '#000000'
      },
      {
        type: choiceItem,
        text: 'White',
        value: '#ffffff'
      }
    ];
    var colorCache = ColorCache(10);
    var mapColors = function (colorMap) {
      var i;
      var colors = [];
      for (i = 0; i < colorMap.length; i += 2) {
        colors.push({
          text: colorMap[i + 1],
          value: '#' + colorMap[i],
          type: 'choiceitem'
        });
      }
      return colors;
    };
    var getColorCols = function (editor, defaultCols) {
      return editor.getParam('color_cols', defaultCols, 'number');
    };
    var hasCustomColors = function (editor) {
      return editor.getParam('custom_colors') !== false;
    };
    var getColorMap = function (editor) {
      return editor.getParam('color_map');
    };
    var getColors = function (editor) {
      var unmapped = getColorMap(editor);
      return unmapped !== undefined ? mapColors(unmapped) : defaultColors;
    };
    var getCurrentColors = function () {
      return map(colorCache.state(), function (color) {
        return {
          type: choiceItem,
          text: color,
          value: color
        };
      });
    };
    var addColor = function (color) {
      colorCache.add(color);
    };
    var Settings = {
      mapColors: mapColors,
      getColorCols: getColorCols,
      hasCustomColors: hasCustomColors,
      getColorMap: getColorMap,
      getColors: getColors,
      getCurrentColors: getCurrentColors,
      addColor: addColor
    };

    var getCurrentColor = function (editor, format) {
      var color;
      editor.dom.getParents(editor.selection.getStart(), function (elm) {
        var value;
        if (value = elm.style[format === 'forecolor' ? 'color' : 'background-color']) {
          color = color ? color : value;
        }
      });
      return color;
    };
    var applyFormat = function (editor, format, value) {
      editor.undoManager.transact(function () {
        editor.focus();
        editor.formatter.apply(format, { value: value });
        editor.nodeChanged();
      });
    };
    var removeFormat = function (editor, format) {
      editor.undoManager.transact(function () {
        editor.focus();
        editor.formatter.remove(format, { value: null }, null, true);
        editor.nodeChanged();
      });
    };
    var registerCommands = function (editor) {
      editor.addCommand('mceApplyTextcolor', function (format, value) {
        applyFormat(editor, format, value);
      });
      editor.addCommand('mceRemoveTextcolor', function (format) {
        removeFormat(editor, format);
      });
    };
    var calcCols = function (colors) {
      return Math.max(5, Math.ceil(Math.sqrt(colors)));
    };
    var getColorCols$1 = function (editor) {
      var colors = Settings.getColors(editor);
      var defaultCols = calcCols(colors.length);
      return Settings.getColorCols(editor, defaultCols);
    };
    var getAdditionalColors = function (hasCustom) {
      var type = 'choiceitem';
      var remove = {
        type: type,
        text: 'Remove color',
        icon: 'color-swatch-remove-color',
        value: 'remove'
      };
      var custom = {
        type: type,
        text: 'Custom color',
        icon: 'color-picker',
        value: 'custom'
      };
      return hasCustom ? [
        remove,
        custom
      ] : [remove];
    };
    var applyColour = function (editor, format, value, onChoice) {
      if (value === 'custom') {
        var dialog = colorPickerDialog(editor);
        dialog(function (colorOpt) {
          colorOpt.each(function (color) {
            Settings.addColor(color);
            editor.execCommand('mceApplyTextcolor', format, color);
            onChoice(color);
          });
        }, '#000000');
      } else if (value === 'remove') {
        onChoice('');
        editor.execCommand('mceRemoveTextcolor', format);
      } else {
        onChoice(value);
        editor.execCommand('mceApplyTextcolor', format, value);
      }
    };
    var getFetch = function (colors, hasCustom) {
      return function (callback) {
        callback(colors.concat(Settings.getCurrentColors().concat(getAdditionalColors(hasCustom))));
      };
    };
    var registerTextColorButton = function (editor, name, format, tooltip) {
      editor.ui.registry.addSplitButton(name, function () {
        var lastColour = Cell(null);
        return {
          type: 'splitbutton',
          tooltip: tooltip,
          presets: 'color',
          icon: name === 'forecolor' ? 'text-color' : 'highlight-bg-color',
          select: function (value) {
            var optCurrentRgb = Option.from(getCurrentColor(editor, format));
            return optCurrentRgb.bind(function (currentRgb) {
              return fromString$1(currentRgb).map(function (rgba) {
                var currentHex = fromRgba(rgba).value();
                return contains$1(value.toLowerCase(), currentHex);
              });
            }).getOr(false);
          },
          columns: getColorCols$1(editor),
          fetch: getFetch(Settings.getColors(editor), Settings.hasCustomColors(editor)),
          onAction: function (splitButtonApi) {
            if (lastColour.get() !== null) {
              applyColour(editor, format, lastColour.get(), function () {
              });
            }
          },
          onItemAction: function (splitButtonApi, value) {
            applyColour(editor, format, value, function (newColour) {
              var setIconFillAndStroke = function (pathId, colour) {
                splitButtonApi.setIconFill(pathId, colour);
                splitButtonApi.setIconStroke(pathId, colour);
              };
              lastColour.set(newColour);
              var id = name === 'forecolor' ? 'tox-icon-text-color__color' : 'tox-icon-highlight-bg-color__color';
              setIconFillAndStroke(id, newColour);
            });
          }
        };
      }());
    };
    var colorPickerDialog = function (editor) {
      return function (callback, value) {
        var getOnSubmit = function (callback) {
          return function (api) {
            var data = api.getData();
            callback(Option.from(data.colorpicker));
            api.close();
          };
        };
        var onAction = function (api, details) {
          if (details.name === 'hex-valid') {
            if (details.value) {
              api.enable('ok');
            } else {
              api.disable('ok');
            }
          }
        };
        var initialData = { colorpicker: value };
        var submit = getOnSubmit(callback);
        editor.windowManager.open({
          title: 'Color Picker',
          size: 'normal',
          body: {
            type: 'panel',
            items: [{
                type: 'colorpicker',
                name: 'colorpicker',
                label: 'Color'
              }]
          },
          buttons: [
            {
              type: 'cancel',
              name: 'cancel',
              text: 'Cancel'
            },
            {
              type: 'submit',
              name: 'save',
              text: 'Save',
              primary: true
            }
          ],
          initialData: initialData,
          onAction: onAction,
          onSubmit: submit,
          onClose: function () {
          },
          onCancel: function () {
            callback(Option.none());
          }
        });
      };
    };
    var register$2 = function (editor) {
      registerCommands(editor);
      registerTextColorButton(editor, 'forecolor', 'forecolor', 'Text color');
      registerTextColorButton(editor, 'backcolor', 'hilitecolor', 'Background color');
    };
    var ColorSwatch = {
      register: register$2,
      getFetch: getFetch,
      colorPickerDialog: colorPickerDialog,
      getCurrentColor: getCurrentColor,
      getColorCols: getColorCols$1,
      calcCols: calcCols
    };

    var schema$g = constant([
      strict$1('dom'),
      strict$1('fetch'),
      onHandler('onOpen'),
      onKeyboardHandler('onExecute'),
      defaulted$1('getHotspot', Option.some),
      defaulted$1('layouts', Option.none()),
      field$1('dropdownBehaviours', [
        Toggling,
        Coupling,
        Keying,
        Focusing
      ]),
      strict$1('toggleClass'),
      defaulted$1('eventOrder', {}),
      option('lazySink'),
      defaulted$1('matchWidth', false),
      defaulted$1('useMinWidth', false),
      option('role')
    ].concat(sandboxFields()));
    var parts$5 = constant([
      external$1({
        schema: [tieredMenuMarkers()],
        name: 'menu',
        defaults: function (detail) {
          return { onExecute: detail.onExecute };
        }
      }),
      partType()
    ]);

    var factory$6 = function (detail, components, _spec, externals) {
      var _a;
      var switchToMenu = function (sandbox) {
        Sandboxing.getState(sandbox).each(function (tmenu) {
          tieredMenu.highlightPrimary(tmenu);
        });
      };
      var action = function (component) {
        var onOpenSync = switchToMenu;
        togglePopup(detail, function (x) {
          return x;
        }, component, externals, onOpenSync, HighlightOnOpen.HighlightFirst).get(noop);
      };
      var apis = {
        expand: function (comp) {
          if (!Toggling.isOn(comp)) {
            togglePopup(detail, function (x) {
              return x;
            }, comp, externals, noop, HighlightOnOpen.HighlightNone).get(noop);
          }
        },
        open: function (comp) {
          if (!Toggling.isOn(comp)) {
            togglePopup(detail, function (x) {
              return x;
            }, comp, externals, noop, HighlightOnOpen.HighlightFirst).get(noop);
          }
        },
        isOpen: Toggling.isOn,
        close: function (comp) {
          if (Toggling.isOn(comp)) {
            togglePopup(detail, function (x) {
              return x;
            }, comp, externals, noop, HighlightOnOpen.HighlightFirst).get(noop);
          }
        }
      };
      var triggerExecute = function (comp, se) {
        emitExecute(comp);
        return Option.some(true);
      };
      var attributes = detail.role.fold(function () {
        return { 'aria-haspopup': 'true' };
      }, function (role) {
        return {
          'role': role,
          'aria-haspopup': 'true'
        };
      });
      return {
        uid: detail.uid,
        dom: detail.dom,
        components: components,
        behaviours: augment(detail.dropdownBehaviours, [
          Toggling.config({
            toggleClass: detail.toggleClass,
            aria: { mode: 'expanded' }
          }),
          Coupling.config({
            others: {
              sandbox: function (hotspot) {
                return makeSandbox(detail, hotspot, {
                  onOpen: function () {
                    Toggling.on(hotspot);
                  },
                  onClose: function () {
                    Toggling.off(hotspot);
                  }
                });
              }
            }
          }),
          Keying.config({
            mode: 'special',
            onSpace: triggerExecute,
            onEnter: triggerExecute,
            onDown: function (comp, se) {
              if (Dropdown.isOpen(comp)) {
                var sandbox = Coupling.getCoupled(comp, 'sandbox');
                switchToMenu(sandbox);
              } else {
                Dropdown.open(comp);
              }
              return Option.some(true);
            },
            onEscape: function (comp, se) {
              if (Dropdown.isOpen(comp)) {
                Dropdown.close(comp);
                return Option.some(true);
              } else {
                return Option.none();
              }
            }
          }),
          Focusing.config({})
        ]),
        events: events$7(Option.some(action)),
        eventOrder: __assign({}, detail.eventOrder, (_a = {}, _a[execute()] = [
          'disabling',
          'toggling',
          'alloy.base.behaviour'
        ], _a)),
        apis: apis,
        domModification: { attributes: attributes }
      };
    };
    var Dropdown = composite$1({
      name: 'Dropdown',
      configFields: schema$g(),
      partFields: parts$5(),
      factory: factory$6,
      apis: {
        open: function (apis, comp) {
          return apis.open(comp);
        },
        expand: function (apis, comp) {
          return apis.expand(comp);
        },
        close: function (apis, comp) {
          return apis.close(comp);
        },
        isOpen: function (apis, comp) {
          return apis.isOpen(comp);
        }
      }
    });

    var exhibit$5 = function (base, unselectConfig) {
      return nu$6({
        styles: {
          '-webkit-user-select': 'none',
          'user-select': 'none',
          '-ms-user-select': 'none',
          '-moz-user-select': '-moz-none'
        },
        attributes: { unselectable: 'on' }
      });
    };
    var events$b = function (unselectConfig) {
      return derive([abort(selectstart(), constant(true))]);
    };

    var ActiveUnselecting = /*#__PURE__*/Object.freeze({
        events: events$b,
        exhibit: exhibit$5
    });

    var Unselecting = create$1({
      fields: [],
      name: 'unselecting',
      active: ActiveUnselecting
    });

    var renderPanelButton = function (spec, sharedBackstage) {
      return Dropdown.sketch({
        dom: spec.dom,
        components: spec.components,
        toggleClass: 'mce-active',
        dropdownBehaviours: derive$1([
          Unselecting.config({}),
          Tabstopping.config({})
        ]),
        layouts: spec.layouts,
        sandboxClasses: ['tox-dialog__popups'],
        lazySink: sharedBackstage.getSink,
        fetch: function () {
          return Future.nu(function (callback) {
            return spec.fetch(callback);
          }).map(function (items) {
            return createTieredDataFrom(deepMerge(createPartialChoiceMenu(generate$1('menu-value'), items, function (value) {
              spec.onItemAction(value);
            }, 5, 'color', ItemResponse$1.CLOSE_ON_EXECUTE, function () {
              return false;
            }, sharedBackstage.providers), { movement: deriveMenuMovement(5, 'color') }));
          });
        },
        parts: { menu: part(false, 1, 'color') }
      });
    };

    var colorInputChangeEvent = generate$1('color-input-change');
    var colorSwatchChangeEvent = generate$1('color-swatch-change');
    var colorPickerCancelEvent = generate$1('color-picker-cancel');
    var renderColorInput = function (spec, sharedBackstage, colorInputBackstage) {
      var pField = FormField.parts().field({
        factory: Input,
        inputClasses: ['tox-textfield'],
        onSetValue: function (c) {
          return Invalidating.run(c).get(function () {
          });
        },
        inputBehaviours: derive$1([
          Tabstopping.config({}),
          Invalidating.config({
            invalidClass: 'tox-textbox-field-invalid',
            getRoot: function (comp) {
              return parent(comp.element());
            },
            notify: {
              onValid: function (comp) {
                var val = Representing.getValue(comp);
                emitWith(comp, colorInputChangeEvent, { color: val });
              }
            },
            validator: {
              validateOnLoad: false,
              validate: function (input) {
                var inputValue = Representing.getValue(input);
                if (inputValue.length === 0) {
                  return Future.pure(Result.value(true));
                } else {
                  var span = Element$$1.fromTag('span');
                  set$2(span, 'background-color', inputValue);
                  var res = getRaw(span, 'background-color').fold(function () {
                    return Result.error('blah');
                  }, function (_) {
                    return Result.value(inputValue);
                  });
                  return Future.pure(res);
                }
              }
            }
          })
        ]),
        selectOnFocus: false
      });
      var pLabel = spec.label.map(function (label) {
        return renderLabel(label, sharedBackstage.providers);
      });
      var emitSwatchChange = function (colorBit, value) {
        emitWith(colorBit, colorSwatchChangeEvent, { value: value });
      };
      var onItemAction = function (value) {
        sharedBackstage.getSink().each(function (sink) {
          memColorButton.getOpt(sink).each(function (colorBit) {
            if (value === 'custom') {
              colorInputBackstage.colorPicker(function (valueOpt) {
                valueOpt.fold(function () {
                  return emit(colorBit, colorPickerCancelEvent);
                }, function (value) {
                  emitSwatchChange(colorBit, value);
                  Settings.addColor(value);
                });
              }, '#ffffff');
            } else if (value === 'remove') {
              emitSwatchChange(colorBit, '');
            } else {
              emitSwatchChange(colorBit, value);
            }
          });
        });
      };
      var memColorButton = record(renderPanelButton({
        dom: {
          tag: 'span',
          attributes: { 'aria-label': sharedBackstage.providers.translate('Color swatch') }
        },
        layouts: Option.some({
          onRtl: function () {
            return [southeast$1];
          },
          onLtr: function () {
            return [southwest$1];
          }
        }),
        components: [],
        fetch: ColorSwatch.getFetch(colorInputBackstage.getColors(), colorInputBackstage.hasCustomColors()),
        onItemAction: onItemAction
      }, sharedBackstage));
      return FormField.sketch({
        dom: {
          tag: 'div',
          classes: ['tox-form__group']
        },
        components: pLabel.toArray().concat([{
            dom: {
              tag: 'div',
              classes: ['tox-color-input']
            },
            components: [
              pField,
              memColorButton.asSpec()
            ]
          }]),
        fieldBehaviours: derive$1([config('form-field-events', [
            run(colorInputChangeEvent, function (comp, se) {
              memColorButton.getOpt(comp).each(function (colorButton) {
                set$2(colorButton.element(), 'background-color', se.event().color());
              });
            }),
            run(colorSwatchChangeEvent, function (comp, se) {
              FormField.getField(comp).each(function (field) {
                Representing.setValue(field, se.event().value());
                Composing.getCurrent(comp).each(Focusing.focus);
              });
            }),
            run(colorPickerCancelEvent, function (comp, se) {
              FormField.getField(comp).each(function (field) {
                Composing.getCurrent(comp).each(Focusing.focus);
              });
            })
          ])])
      });
    };

    var platform = PlatformDetection$1.detect();
    var isTouch = platform.deviceType.isTouch();
    var labelPart = optional({
      schema: [strict$1('dom')],
      name: 'label'
    });
    var edgePart = function (name) {
      return optional({
        name: '' + name + '-edge',
        overrides: function (detail) {
          var action = detail.model.manager.edgeActions[name];
          return action.fold(function () {
            return {};
          }, function (a) {
            var touchEvents = derive([runActionExtra(touchstart(), a, [detail])]);
            var mouseEvents = derive([
              runActionExtra(mousedown(), a, [detail]),
              runActionExtra(mousemove(), function (l, det) {
                if (det.mouseIsDown.get()) {
                  a(l, det);
                }
              }, [detail])
            ]);
            return { events: isTouch ? touchEvents : mouseEvents };
          });
        }
      });
    };
    var tlEdgePart = edgePart('top-left');
    var tedgePart = edgePart('top');
    var trEdgePart = edgePart('top-right');
    var redgePart = edgePart('right');
    var brEdgePart = edgePart('bottom-right');
    var bedgePart = edgePart('bottom');
    var blEdgePart = edgePart('bottom-left');
    var ledgePart = edgePart('left');
    var thumbPart = required({
      name: 'thumb',
      defaults: constant({ dom: { styles: { position: 'absolute' } } }),
      overrides: function (detail) {
        return {
          events: derive([
            redirectToPart(touchstart(), detail, 'spectrum'),
            redirectToPart(touchmove(), detail, 'spectrum'),
            redirectToPart(touchend(), detail, 'spectrum'),
            redirectToPart(mousedown(), detail, 'spectrum'),
            redirectToPart(mousemove(), detail, 'spectrum'),
            redirectToPart(mouseup(), detail, 'spectrum')
          ])
        };
      }
    });
    var spectrumPart = required({
      schema: [state$1('mouseIsDown', function () {
          return Cell(false);
        })],
      name: 'spectrum',
      overrides: function (detail) {
        var modelDetail = detail.model;
        var model = modelDetail.manager;
        var setValueFrom = function (component, simulatedEvent) {
          return model.getValueFromEvent(simulatedEvent).map(function (value) {
            return model.setValueFrom(component, detail, value);
          });
        };
        var touchEvents = derive([
          run(touchstart(), setValueFrom),
          run(touchmove(), setValueFrom)
        ]);
        var mouseEvents = derive([
          run(mousedown(), setValueFrom),
          run(mousemove(), function (spectrum, se) {
            if (detail.mouseIsDown.get()) {
              setValueFrom(spectrum, se);
            }
          })
        ]);
        return {
          behaviours: derive$1(isTouch ? [] : [
            Keying.config({
              mode: 'special',
              onLeft: function (spectrum) {
                return model.onLeft(spectrum, detail);
              },
              onRight: function (spectrum) {
                return model.onRight(spectrum, detail);
              },
              onUp: function (spectrum) {
                return model.onUp(spectrum, detail);
              },
              onDown: function (spectrum) {
                return model.onDown(spectrum, detail);
              }
            }),
            Focusing.config({})
          ]),
          events: isTouch ? touchEvents : mouseEvents
        };
      }
    });
    var SliderParts = [
      labelPart,
      ledgePart,
      redgePart,
      tedgePart,
      bedgePart,
      tlEdgePart,
      trEdgePart,
      blEdgePart,
      brEdgePart,
      thumbPart,
      spectrumPart
    ];

    var isTouch$1 = PlatformDetection$1.detect().deviceType.isTouch();
    var _sliderChangeEvent = 'slider.change.value';
    var sliderChangeEvent = constant(_sliderChangeEvent);
    var getEventSource = function (simulatedEvent) {
      var evt = simulatedEvent.event().raw();
      if (isTouch$1) {
        var touchEvent = evt;
        return touchEvent.touches !== undefined && touchEvent.touches.length === 1 ? Option.some(touchEvent.touches[0]).map(function (t) {
          return Position(t.clientX, t.clientY);
        }) : Option.none();
      } else {
        var mouseEvent = evt;
        return mouseEvent.clientX !== undefined ? Option.some(mouseEvent).map(function (me) {
          return Position(me.clientX, me.clientY);
        }) : Option.none();
      }
    };

    var reduceBy = function (value, min, max, step) {
      if (value < min) {
        return value;
      } else if (value > max) {
        return max;
      } else if (value === min) {
        return min - 1;
      } else {
        return Math.max(min, value - step);
      }
    };
    var increaseBy = function (value, min, max, step) {
      if (value > max) {
        return value;
      } else if (value < min) {
        return min;
      } else if (value === max) {
        return max + 1;
      } else {
        return Math.min(max, value + step);
      }
    };
    var capValue = function (value, min, max) {
      return Math.max(min, Math.min(max, value));
    };
    var snapValueOf = function (value, min, max, step, snapStart) {
      return snapStart.fold(function () {
        var initValue = value - min;
        var extraValue = Math.round(initValue / step) * step;
        return capValue(min + extraValue, min - 1, max + 1);
      }, function (start) {
        var remainder = (value - start) % step;
        var adjustment = Math.round(remainder / step);
        var rawSteps = Math.floor((value - start) / step);
        var maxSteps = Math.floor((max - start) / step);
        var numSteps = Math.min(maxSteps, rawSteps + adjustment);
        var r = start + numSteps * step;
        return Math.max(start, r);
      });
    };
    var findOffsetOf = function (value, min, max) {
      return Math.min(max, Math.max(value, min)) - min;
    };
    var findValueOf = function (args) {
      var min = args.min, max = args.max, range = args.range, value = args.value, step = args.step, snap = args.snap, snapStart = args.snapStart, rounded = args.rounded, hasMinEdge = args.hasMinEdge, hasMaxEdge = args.hasMaxEdge, minBound = args.minBound, maxBound = args.maxBound, screenRange = args.screenRange;
      var capMin = hasMinEdge ? min - 1 : min;
      var capMax = hasMaxEdge ? max + 1 : max;
      if (value < minBound) {
        return capMin;
      } else if (value > maxBound) {
        return capMax;
      } else {
        var offset = findOffsetOf(value, minBound, maxBound);
        var newValue = capValue(offset / screenRange * range + min, capMin, capMax);
        if (snap && newValue >= min && newValue <= max) {
          return snapValueOf(newValue, min, max, step, snapStart);
        } else if (rounded) {
          return Math.round(newValue);
        } else {
          return newValue;
        }
      }
    };
    var findOffsetOfValue = function (args) {
      var min = args.min, max = args.max, range = args.range, value = args.value, hasMinEdge = args.hasMinEdge, hasMaxEdge = args.hasMaxEdge, maxBound = args.maxBound, maxOffset = args.maxOffset, centerMinEdge = args.centerMinEdge, centerMaxEdge = args.centerMaxEdge;
      if (value < min) {
        return hasMinEdge ? 0 : centerMinEdge;
      } else if (value > max) {
        return hasMaxEdge ? maxBound : centerMaxEdge;
      } else {
        return (value - min) / range * maxOffset;
      }
    };

    var t = 'top', r$1 = 'right', b = 'bottom', l = 'left';
    var minX = function (detail) {
      return detail.model.minX;
    };
    var minY = function (detail) {
      return detail.model.minY;
    };
    var min1X = function (detail) {
      return detail.model.minX - 1;
    };
    var min1Y = function (detail) {
      return detail.model.minY - 1;
    };
    var maxX = function (detail) {
      return detail.model.maxX;
    };
    var maxY = function (detail) {
      return detail.model.maxY;
    };
    var max1X = function (detail) {
      return detail.model.maxX + 1;
    };
    var max1Y = function (detail) {
      return detail.model.maxY + 1;
    };
    var range$2 = function (detail, max, min) {
      return max(detail) - min(detail);
    };
    var xRange = function (detail) {
      return range$2(detail, maxX, minX);
    };
    var yRange = function (detail) {
      return range$2(detail, maxY, minY);
    };
    var halfX = function (detail) {
      return xRange(detail) / 2;
    };
    var halfY = function (detail) {
      return yRange(detail) / 2;
    };
    var step$1 = function (detail) {
      return detail.stepSize;
    };
    var snap = function (detail) {
      return detail.snapToGrid;
    };
    var snapStart = function (detail) {
      return detail.snapStart;
    };
    var rounded = function (detail) {
      return detail.rounded;
    };
    var hasEdge = function (detail, edgeName) {
      return detail[edgeName + '-edge'] !== undefined;
    };
    var hasLEdge = function (detail) {
      return hasEdge(detail, l);
    };
    var hasREdge = function (detail) {
      return hasEdge(detail, r$1);
    };
    var hasTEdge = function (detail) {
      return hasEdge(detail, t);
    };
    var hasBEdge = function (detail) {
      return hasEdge(detail, b);
    };
    var currentValue = function (detail) {
      return detail.model.value.get();
    };

    var xValue = function (x) {
      return { x: constant(x) };
    };
    var yValue = function (y) {
      return { y: constant(y) };
    };
    var xyValue = function (x, y) {
      return {
        x: constant(x),
        y: constant(y)
      };
    };
    var fireSliderChange = function (component, value) {
      emitWith(component, sliderChangeEvent(), { value: value });
    };
    var setToTLEdgeXY = function (edge, detail) {
      fireSliderChange(edge, xyValue(min1X(detail), min1Y(detail)));
    };
    var setToTEdge = function (edge, detail) {
      fireSliderChange(edge, yValue(min1Y(detail)));
    };
    var setToTEdgeXY = function (edge, detail) {
      fireSliderChange(edge, xyValue(halfX(detail), min1Y(detail)));
    };
    var setToTREdgeXY = function (edge, detail) {
      fireSliderChange(edge, xyValue(max1X(detail), min1Y(detail)));
    };
    var setToREdge = function (edge, detail) {
      fireSliderChange(edge, xValue(max1X(detail)));
    };
    var setToREdgeXY = function (edge, detail) {
      fireSliderChange(edge, xyValue(max1X(detail), halfY(detail)));
    };
    var setToBREdgeXY = function (edge, detail) {
      fireSliderChange(edge, xyValue(max1X(detail), max1Y(detail)));
    };
    var setToBEdge = function (edge, detail) {
      fireSliderChange(edge, yValue(max1Y(detail)));
    };
    var setToBEdgeXY = function (edge, detail) {
      fireSliderChange(edge, xyValue(halfX(detail), max1Y(detail)));
    };
    var setToBLEdgeXY = function (edge, detail) {
      fireSliderChange(edge, xyValue(min1X(detail), max1Y(detail)));
    };
    var setToLEdge = function (edge, detail) {
      fireSliderChange(edge, xValue(min1X(detail)));
    };
    var setToLEdgeXY = function (edge, detail) {
      fireSliderChange(edge, xyValue(min1X(detail), halfY(detail)));
    };

    var top = 'top', right = 'right', bottom = 'bottom', left = 'left', width = 'width', height = 'height';
    var getBounds$2 = function (component) {
      return component.element().dom().getBoundingClientRect();
    };
    var getBoundsProperty = function (bounds, property) {
      return bounds[property];
    };
    var getMinXBounds = function (component) {
      var bounds = getBounds$2(component);
      return getBoundsProperty(bounds, left);
    };
    var getMaxXBounds = function (component) {
      var bounds = getBounds$2(component);
      return getBoundsProperty(bounds, right);
    };
    var getMinYBounds = function (component) {
      var bounds = getBounds$2(component);
      return getBoundsProperty(bounds, top);
    };
    var getMaxYBounds = function (component) {
      var bounds = getBounds$2(component);
      return getBoundsProperty(bounds, bottom);
    };
    var getXScreenRange = function (component) {
      var bounds = getBounds$2(component);
      return getBoundsProperty(bounds, width);
    };
    var getYScreenRange = function (component) {
      var bounds = getBounds$2(component);
      return getBoundsProperty(bounds, height);
    };
    var getCenterOffsetOf = function (componentMinEdge, componentMaxEdge, spectrumMinEdge) {
      return (componentMinEdge + componentMaxEdge) / 2 - spectrumMinEdge;
    };
    var getXCenterOffSetOf = function (component, spectrum) {
      var componentBounds = getBounds$2(component);
      var spectrumBounds = getBounds$2(spectrum);
      var componentMinEdge = getBoundsProperty(componentBounds, left);
      var componentMaxEdge = getBoundsProperty(componentBounds, right);
      var spectrumMinEdge = getBoundsProperty(spectrumBounds, left);
      return getCenterOffsetOf(componentMinEdge, componentMaxEdge, spectrumMinEdge);
    };
    var getYCenterOffSetOf = function (component, spectrum) {
      var componentBounds = getBounds$2(component);
      var spectrumBounds = getBounds$2(spectrum);
      var componentMinEdge = getBoundsProperty(componentBounds, top);
      var componentMaxEdge = getBoundsProperty(componentBounds, bottom);
      var spectrumMinEdge = getBoundsProperty(spectrumBounds, top);
      return getCenterOffsetOf(componentMinEdge, componentMaxEdge, spectrumMinEdge);
    };

    var fireSliderChange$1 = function (spectrum, value) {
      emitWith(spectrum, sliderChangeEvent(), { value: value });
    };
    var sliderValue = function (x) {
      return { x: constant(x) };
    };
    var findValueOfOffset = function (spectrum, detail, left) {
      var args = {
        min: minX(detail),
        max: maxX(detail),
        range: xRange(detail),
        value: left,
        step: step$1(detail),
        snap: snap(detail),
        snapStart: snapStart(detail),
        rounded: rounded(detail),
        hasMinEdge: hasLEdge(detail),
        hasMaxEdge: hasREdge(detail),
        minBound: getMinXBounds(spectrum),
        maxBound: getMaxXBounds(spectrum),
        screenRange: getXScreenRange(spectrum)
      };
      return findValueOf(args);
    };
    var setValueFrom = function (spectrum, detail, value) {
      var xValue = findValueOfOffset(spectrum, detail, value);
      var sliderVal = sliderValue(xValue);
      fireSliderChange$1(spectrum, sliderVal);
      return xValue;
    };
    var setToMin = function (spectrum, detail) {
      var min = minX(detail);
      fireSliderChange$1(spectrum, sliderValue(min));
    };
    var setToMax = function (spectrum, detail) {
      var max = maxX(detail);
      fireSliderChange$1(spectrum, sliderValue(max));
    };
    var moveBy = function (direction, spectrum, detail) {
      var f = direction > 0 ? increaseBy : reduceBy;
      var xValue = f(currentValue(detail).x(), minX(detail), maxX(detail), step$1(detail));
      fireSliderChange$1(spectrum, sliderValue(xValue));
      return Option.some(xValue);
    };
    var handleMovement = function (direction) {
      return function (spectrum, detail) {
        return moveBy(direction, spectrum, detail).map(function () {
          return true;
        });
      };
    };
    var getValueFromEvent = function (simulatedEvent) {
      var pos = getEventSource(simulatedEvent);
      return pos.map(function (p) {
        return p.left();
      });
    };
    var findOffsetOfValue$1 = function (spectrum, detail, value, minEdge, maxEdge) {
      var minOffset = 0;
      var maxOffset = getXScreenRange(spectrum);
      var centerMinEdge = minEdge.bind(function (edge) {
        return Option.some(getXCenterOffSetOf(edge, spectrum));
      }).getOr(minOffset);
      var centerMaxEdge = maxEdge.bind(function (edge) {
        return Option.some(getXCenterOffSetOf(edge, spectrum));
      }).getOr(maxOffset);
      var args = {
        min: minX(detail),
        max: maxX(detail),
        range: xRange(detail),
        value: value,
        hasMinEdge: hasLEdge(detail),
        hasMaxEdge: hasREdge(detail),
        minBound: getMinXBounds(spectrum),
        minOffset: minOffset,
        maxBound: getMaxXBounds(spectrum),
        maxOffset: maxOffset,
        centerMinEdge: centerMinEdge,
        centerMaxEdge: centerMaxEdge
      };
      return findOffsetOfValue(args);
    };
    var findPositionOfValue = function (slider, spectrum, value, minEdge, maxEdge, detail) {
      var offset = findOffsetOfValue$1(spectrum, detail, value, minEdge, maxEdge);
      return getMinXBounds(spectrum) - getMinXBounds(slider) + offset;
    };
    var setPositionFromValue = function (slider, thumb, detail, edges) {
      var value = currentValue(detail);
      var pos = findPositionOfValue(slider, edges.getSpectrum(slider), value.x(), edges.getLeftEdge(slider), edges.getRightEdge(slider), detail);
      var thumbRadius = get$8(thumb.element()) / 2;
      set$2(thumb.element(), 'left', pos - thumbRadius + 'px');
    };
    var onLeft = handleMovement(-1);
    var onRight = handleMovement(1);
    var onUp = Option.none;
    var onDown = Option.none;
    var edgeActions = {
      'top-left': Option.none(),
      'top': Option.none(),
      'top-right': Option.none(),
      'right': Option.some(setToREdge),
      'bottom-right': Option.none(),
      'bottom': Option.none(),
      'bottom-left': Option.none(),
      'left': Option.some(setToLEdge)
    };

    var HorizontalModel = /*#__PURE__*/Object.freeze({
        setValueFrom: setValueFrom,
        setToMin: setToMin,
        setToMax: setToMax,
        findValueOfOffset: findValueOfOffset,
        getValueFromEvent: getValueFromEvent,
        findPositionOfValue: findPositionOfValue,
        setPositionFromValue: setPositionFromValue,
        onLeft: onLeft,
        onRight: onRight,
        onUp: onUp,
        onDown: onDown,
        edgeActions: edgeActions
    });

    var fireSliderChange$2 = function (spectrum, value) {
      emitWith(spectrum, sliderChangeEvent(), { value: value });
    };
    var sliderValue$1 = function (y) {
      return { y: constant(y) };
    };
    var findValueOfOffset$1 = function (spectrum, detail, top) {
      var args = {
        min: minY(detail),
        max: maxY(detail),
        range: yRange(detail),
        value: top,
        step: step$1(detail),
        snap: snap(detail),
        snapStart: snapStart(detail),
        rounded: rounded(detail),
        hasMinEdge: hasTEdge(detail),
        hasMaxEdge: hasBEdge(detail),
        minBound: getMinYBounds(spectrum),
        maxBound: getMaxYBounds(spectrum),
        screenRange: getYScreenRange(spectrum)
      };
      return findValueOf(args);
    };
    var setValueFrom$1 = function (spectrum, detail, value) {
      var yValue = findValueOfOffset$1(spectrum, detail, value);
      var sliderVal = sliderValue$1(yValue);
      fireSliderChange$2(spectrum, sliderVal);
      return yValue;
    };
    var setToMin$1 = function (spectrum, detail) {
      var min = minY(detail);
      fireSliderChange$2(spectrum, sliderValue$1(min));
    };
    var setToMax$1 = function (spectrum, detail) {
      var max = maxY(detail);
      fireSliderChange$2(spectrum, sliderValue$1(max));
    };
    var moveBy$1 = function (direction, spectrum, detail) {
      var f = direction > 0 ? increaseBy : reduceBy;
      var yValue = f(currentValue(detail).y(), minY(detail), maxY(detail), step$1(detail));
      fireSliderChange$2(spectrum, sliderValue$1(yValue));
      return Option.some(yValue);
    };
    var handleMovement$1 = function (direction) {
      return function (spectrum, detail) {
        return moveBy$1(direction, spectrum, detail).map(function () {
          return true;
        });
      };
    };
    var getValueFromEvent$1 = function (simulatedEvent) {
      var pos = getEventSource(simulatedEvent);
      return pos.map(function (p) {
        return p.top();
      });
    };
    var findOffsetOfValue$2 = function (spectrum, detail, value, minEdge, maxEdge) {
      var minOffset = 0;
      var maxOffset = getYScreenRange(spectrum);
      var centerMinEdge = minEdge.bind(function (edge) {
        return Option.some(getYCenterOffSetOf(edge, spectrum));
      }).getOr(minOffset);
      var centerMaxEdge = maxEdge.bind(function (edge) {
        return Option.some(getYCenterOffSetOf(edge, spectrum));
      }).getOr(maxOffset);
      var args = {
        min: minY(detail),
        max: maxY(detail),
        range: yRange(detail),
        value: value,
        hasMinEdge: hasTEdge(detail),
        hasMaxEdge: hasBEdge(detail),
        minBound: getMinYBounds(spectrum),
        minOffset: minOffset,
        maxBound: getMaxYBounds(spectrum),
        maxOffset: maxOffset,
        centerMinEdge: centerMinEdge,
        centerMaxEdge: centerMaxEdge
      };
      return findOffsetOfValue(args);
    };
    var findPositionOfValue$1 = function (slider, spectrum, value, minEdge, maxEdge, detail) {
      var offset = findOffsetOfValue$2(spectrum, detail, value, minEdge, maxEdge);
      return getMinYBounds(spectrum) - getMinYBounds(slider) + offset;
    };
    var setPositionFromValue$1 = function (slider, thumb, detail, edges) {
      var value = currentValue(detail);
      var pos = findPositionOfValue$1(slider, edges.getSpectrum(slider), value.y(), edges.getTopEdge(slider), edges.getBottomEdge(slider), detail);
      var thumbRadius = get$9(thumb.element()) / 2;
      set$2(thumb.element(), 'top', pos - thumbRadius + 'px');
    };
    var onLeft$1 = Option.none;
    var onRight$1 = Option.none;
    var onUp$1 = handleMovement$1(-1);
    var onDown$1 = handleMovement$1(1);
    var edgeActions$1 = {
      'top-left': Option.none(),
      'top': Option.some(setToTEdge),
      'top-right': Option.none(),
      'right': Option.none(),
      'bottom-right': Option.none(),
      'bottom': Option.some(setToBEdge),
      'bottom-left': Option.none(),
      'left': Option.none()
    };

    var VerticalModel = /*#__PURE__*/Object.freeze({
        setValueFrom: setValueFrom$1,
        setToMin: setToMin$1,
        setToMax: setToMax$1,
        findValueOfOffset: findValueOfOffset$1,
        getValueFromEvent: getValueFromEvent$1,
        findPositionOfValue: findPositionOfValue$1,
        setPositionFromValue: setPositionFromValue$1,
        onLeft: onLeft$1,
        onRight: onRight$1,
        onUp: onUp$1,
        onDown: onDown$1,
        edgeActions: edgeActions$1
    });

    var fireSliderChange$3 = function (spectrum, value) {
      emitWith(spectrum, sliderChangeEvent(), { value: value });
    };
    var sliderValue$2 = function (x, y) {
      return {
        x: constant(x),
        y: constant(y)
      };
    };
    var setValueFrom$2 = function (spectrum, detail, value) {
      var xValue = findValueOfOffset(spectrum, detail, value.left());
      var yValue = findValueOfOffset$1(spectrum, detail, value.top());
      var val = sliderValue$2(xValue, yValue);
      fireSliderChange$3(spectrum, val);
      return val;
    };
    var moveBy$2 = function (direction, isVerticalMovement, spectrum, detail) {
      var f = direction > 0 ? increaseBy : reduceBy;
      var xValue = isVerticalMovement ? currentValue(detail).x() : f(currentValue(detail).x(), minX(detail), maxX(detail), step$1(detail));
      var yValue = !isVerticalMovement ? currentValue(detail).y() : f(currentValue(detail).y(), minY(detail), maxY(detail), step$1(detail));
      fireSliderChange$3(spectrum, sliderValue$2(xValue, yValue));
      return Option.some(xValue);
    };
    var handleMovement$2 = function (direction, isVerticalMovement) {
      return function (spectrum, detail) {
        return moveBy$2(direction, isVerticalMovement, spectrum, detail).map(function () {
          return true;
        });
      };
    };
    var setToMin$2 = function (spectrum, detail) {
      var mX = minX(detail);
      var mY = minY(detail);
      fireSliderChange$3(spectrum, sliderValue$2(mX, mY));
    };
    var setToMax$2 = function (spectrum, detail) {
      var mX = maxX(detail);
      var mY = maxY(detail);
      fireSliderChange$3(spectrum, sliderValue$2(mX, mY));
    };
    var getValueFromEvent$2 = function (simulatedEvent) {
      return getEventSource(simulatedEvent);
    };
    var setPositionFromValue$2 = function (slider, thumb, detail, edges) {
      var value = currentValue(detail);
      var xPos = findPositionOfValue(slider, edges.getSpectrum(slider), value.x(), edges.getLeftEdge(slider), edges.getRightEdge(slider), detail);
      var yPos = findPositionOfValue$1(slider, edges.getSpectrum(slider), value.y(), edges.getTopEdge(slider), edges.getBottomEdge(slider), detail);
      var thumbXRadius = get$8(thumb.element()) / 2;
      var thumbYRadius = get$9(thumb.element()) / 2;
      set$2(thumb.element(), 'left', xPos - thumbXRadius + 'px');
      set$2(thumb.element(), 'top', yPos - thumbYRadius + 'px');
    };
    var onLeft$2 = handleMovement$2(-1, false);
    var onRight$2 = handleMovement$2(1, false);
    var onUp$2 = handleMovement$2(-1, true);
    var onDown$2 = handleMovement$2(1, true);
    var edgeActions$2 = {
      'top-left': Option.some(setToTLEdgeXY),
      'top': Option.some(setToTEdgeXY),
      'top-right': Option.some(setToTREdgeXY),
      'right': Option.some(setToREdgeXY),
      'bottom-right': Option.some(setToBREdgeXY),
      'bottom': Option.some(setToBEdgeXY),
      'bottom-left': Option.some(setToBLEdgeXY),
      'left': Option.some(setToLEdgeXY)
    };

    var TwoDModel = /*#__PURE__*/Object.freeze({
        setValueFrom: setValueFrom$2,
        setToMin: setToMin$2,
        setToMax: setToMax$2,
        getValueFromEvent: getValueFromEvent$2,
        setPositionFromValue: setPositionFromValue$2,
        onLeft: onLeft$2,
        onRight: onRight$2,
        onUp: onUp$2,
        onDown: onDown$2,
        edgeActions: edgeActions$2
    });

    var isTouch$2 = PlatformDetection$1.detect().deviceType.isTouch();
    var SliderSchema = [
      defaulted$1('stepSize', 1),
      defaulted$1('onChange', noop),
      defaulted$1('onChoose', noop),
      defaulted$1('onInit', noop),
      defaulted$1('onDragStart', noop),
      defaulted$1('onDragEnd', noop),
      defaulted$1('snapToGrid', false),
      defaulted$1('rounded', true),
      option('snapStart'),
      strictOf('model', choose$1('mode', {
        x: [
          defaulted$1('minX', 0),
          defaulted$1('maxX', 100),
          state$1('value', function (spec) {
            return Cell(spec.mode.minX);
          }),
          strict$1('getInitialValue'),
          output$1('manager', HorizontalModel)
        ],
        y: [
          defaulted$1('minY', 0),
          defaulted$1('maxY', 100),
          state$1('value', function (spec) {
            return Cell(spec.mode.minY);
          }),
          strict$1('getInitialValue'),
          output$1('manager', VerticalModel)
        ],
        xy: [
          defaulted$1('minX', 0),
          defaulted$1('maxX', 100),
          defaulted$1('minY', 0),
          defaulted$1('maxY', 100),
          state$1('value', function (spec) {
            return Cell({
              x: constant(spec.mode.minX),
              y: constant(spec.mode.minY)
            });
          }),
          strict$1('getInitialValue'),
          output$1('manager', TwoDModel)
        ]
      })),
      field$1('sliderBehaviours', [
        Keying,
        Representing
      ])
    ].concat(!isTouch$2 ? [state$1('mouseIsDown', function () {
        return Cell(false);
      })] : []);

    var isTouch$3 = PlatformDetection$1.detect().deviceType.isTouch();
    var sketch$1 = function (detail, components$$1, _spec, _externals) {
      var getThumb = function (component) {
        return getPartOrDie(component, detail, 'thumb');
      };
      var getSpectrum = function (component) {
        return getPartOrDie(component, detail, 'spectrum');
      };
      var getLeftEdge = function (component) {
        return getPart(component, detail, 'left-edge');
      };
      var getRightEdge = function (component) {
        return getPart(component, detail, 'right-edge');
      };
      var getTopEdge = function (component) {
        return getPart(component, detail, 'top-edge');
      };
      var getBottomEdge = function (component) {
        return getPart(component, detail, 'bottom-edge');
      };
      var modelDetail = detail.model;
      var model = modelDetail.manager;
      var refresh = function (slider, thumb) {
        model.setPositionFromValue(slider, thumb, detail, {
          getLeftEdge: getLeftEdge,
          getRightEdge: getRightEdge,
          getTopEdge: getTopEdge,
          getBottomEdge: getBottomEdge,
          getSpectrum: getSpectrum
        });
      };
      var changeValue = function (slider, newValue) {
        modelDetail.value.set(newValue);
        var thumb = getThumb(slider);
        refresh(slider, thumb);
        detail.onChange(slider, thumb, newValue);
        return Option.some(true);
      };
      var resetToMin = function (slider) {
        model.setToMin(slider, detail);
      };
      var resetToMax = function (slider) {
        model.setToMax(slider, detail);
      };
      var touchEvents = [
        run(touchstart(), function (slider, _simulatedEvent) {
          detail.onDragStart(slider, getThumb(slider));
        }),
        run(touchend(), function (slider, _simulatedEvent) {
          detail.onDragEnd(slider, getThumb(slider));
        })
      ];
      var mouseEvents = [
        run(mousedown(), function (slider, simulatedEvent) {
          simulatedEvent.stop();
          detail.onDragStart(slider, getThumb(slider));
          detail.mouseIsDown.set(true);
        }),
        run(mouseup(), function (slider, _simulatedEvent) {
          detail.onDragEnd(slider, getThumb(slider));
        })
      ];
      var uiEventsArr = isTouch$3 ? touchEvents : mouseEvents;
      return {
        uid: detail.uid,
        dom: detail.dom,
        components: components$$1,
        behaviours: augment(detail.sliderBehaviours, flatten([
          !isTouch$3 ? [Keying.config({
              mode: 'special',
              focusIn: function (slider) {
                return getPart(slider, detail, 'spectrum').map(Keying.focusIn).map(constant(true));
              }
            })] : [],
          [
            Representing.config({
              store: {
                mode: 'manual',
                getValue: function (_) {
                  return modelDetail.value.get();
                }
              }
            }),
            Receiving.config({
              channels: {
                'mouse.released': {
                  onReceive: function (slider, se) {
                    var wasDown = detail.mouseIsDown.get();
                    detail.mouseIsDown.set(false);
                    if (wasDown) {
                      getPart(slider, detail, 'thumb').each(function (thumb) {
                        var value = modelDetail.value.get();
                        detail.onChoose(slider, thumb, value);
                      });
                    }
                  }
                }
              }
            })
          ]
        ])),
        events: derive([
          run(sliderChangeEvent(), function (slider, simulatedEvent) {
            changeValue(slider, simulatedEvent.event().value());
          }),
          runOnAttached(function (slider, simulatedEvent) {
            var getInitial = modelDetail.getInitialValue();
            modelDetail.value.set(getInitial);
            var thumb = getThumb(slider);
            refresh(slider, thumb);
            var spectrum = getSpectrum(slider);
            detail.onInit(slider, thumb, spectrum, modelDetail.value.get());
          })
        ].concat(uiEventsArr)),
        apis: {
          resetToMin: resetToMin,
          resetToMax: resetToMax,
          changeValue: changeValue,
          refresh: refresh
        },
        domModification: { styles: { position: 'relative' } }
      };
    };

    var Slider = composite$1({
      name: 'Slider',
      configFields: SliderSchema,
      partFields: SliderParts,
      factory: sketch$1,
      apis: {
        resetToMin: function (apis, slider) {
          apis.resetToMin(slider);
        },
        resetToMax: function (apis, slider) {
          apis.resetToMax(slider);
        },
        refresh: function (apis, slider) {
          apis.refresh(slider);
        }
      }
    });

    var fieldsUpdate = constant(generate$1('rgb-hex-update'));
    var sliderUpdate = constant(generate$1('slider-update'));
    var paletteUpdate = constant(generate$1('palette-update'));

    var paletteFactory = function (translate, getClass) {
      var spectrum = Slider.parts().spectrum({
        dom: {
          tag: 'canvas',
          attributes: { role: 'presentation' },
          classes: [getClass('sv-palette-spectrum')]
        }
      });
      var thumb = Slider.parts().thumb({
        dom: {
          tag: 'div',
          attributes: { role: 'presentation' },
          classes: [getClass('sv-palette-thumb')],
          innerHtml: '<div class=' + getClass('sv-palette-inner-thumb') + ' role="presentation"></div>'
        }
      });
      var setColour = function (canvas, rgba) {
        var width = canvas.width, height = canvas.height;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = rgba;
        ctx.fillRect(0, 0, width, height);
        var grdWhite = ctx.createLinearGradient(0, 0, width, 0);
        grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
        grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grdWhite;
        ctx.fillRect(0, 0, width, height);
        var grdBlack = ctx.createLinearGradient(0, 0, 0, height);
        grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
        grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = grdBlack;
        ctx.fillRect(0, 0, width, height);
      };
      var setSliderColour = function (slider, rgba) {
        var canvas = slider.components()[0].element().dom();
        setColour(canvas, toString$2(rgba));
      };
      var factory = function (detail) {
        var getInitialValue = constant({
          x: constant(0),
          y: constant(0)
        });
        var onChange = function (slider, _thumb, value) {
          emitWith(slider, paletteUpdate(), { value: value });
        };
        var onInit = function (_slider, _thumb, spectrum, _value) {
          setColour(spectrum.element().dom(), toString$2(red()));
        };
        var sliderBehaviours = derive$1([
          Composing.config({ find: Option.some }),
          Focusing.config({})
        ]);
        return Slider.sketch({
          dom: {
            tag: 'div',
            attributes: { role: 'presentation' },
            classes: [getClass('sv-palette')]
          },
          model: {
            mode: 'xy',
            getInitialValue: getInitialValue
          },
          rounded: false,
          components: [
            spectrum,
            thumb
          ],
          onChange: onChange,
          onInit: onInit,
          sliderBehaviours: sliderBehaviours
        });
      };
      var SaturationBrightnessPalette = single$2({
        factory: factory,
        name: 'SaturationBrightnessPalette',
        configFields: [],
        apis: {
          setRgba: function (apis, slider, rgba) {
            setSliderColour(slider, rgba);
          }
        },
        extraApis: {}
      });
      return SaturationBrightnessPalette;
    };
    var SaturationBrightnessPalette = { paletteFactory: paletteFactory };

    var sliderFactory = function (translate, getClass) {
      var spectrum = Slider.parts().spectrum({
        dom: {
          tag: 'div',
          classes: [getClass('hue-slider-spectrum')],
          attributes: { role: 'presentation' }
        }
      });
      var thumb = Slider.parts().thumb({
        dom: {
          tag: 'div',
          classes: [getClass('hue-slider-thumb')],
          attributes: { role: 'presentation' }
        }
      });
      return Slider.sketch({
        dom: {
          tag: 'div',
          classes: [getClass('hue-slider')],
          attributes: { role: 'presentation' }
        },
        rounded: false,
        model: {
          mode: 'y',
          getInitialValue: constant({ y: constant(0) })
        },
        components: [
          spectrum,
          thumb
        ],
        sliderBehaviours: derive$1([Focusing.config({})]),
        onChange: function (slider, thumb, value) {
          emitWith(slider, sliderUpdate(), { value: value });
        }
      });
    };
    var HueSlider = { sliderFactory: sliderFactory };

    var owner$3 = 'form';
    var schema$h = [field$1('formBehaviours', [Representing])];
    var getPartName = function (name) {
      return '<alloy.field.' + name + '>';
    };
    var sketch$2 = function (fSpec) {
      var parts = function () {
        var record = [];
        var field = function (name, config) {
          record.push(name);
          return generateOne(owner$3, getPartName(name), config);
        };
        return {
          field: field,
          record: function () {
            return record;
          }
        };
      }();
      var spec = fSpec(parts);
      var partNames = parts.record();
      var fieldParts = map(partNames, function (n) {
        return required({
          name: n,
          pname: getPartName(n)
        });
      });
      return composite(owner$3, schema$h, fieldParts, make$4, spec);
    };
    var toResult$1 = function (o, e) {
      return o.fold(function () {
        return Result.error(e);
      }, Result.value);
    };
    var make$4 = function (detail, components$$1, spec) {
      return {
        'uid': detail.uid,
        'dom': detail.dom,
        'components': components$$1,
        'behaviours': augment(detail.formBehaviours, [Representing.config({
            store: {
              mode: 'manual',
              getValue: function (form) {
                var resPs = getAllParts(form, detail);
                return map$1(resPs, function (resPThunk, pName) {
                  return resPThunk().bind(function (v) {
                    var opt = Composing.getCurrent(v);
                    return toResult$1(opt, 'missing current');
                  }).map(Representing.getValue);
                });
              },
              setValue: function (form, values$$1) {
                each$1(values$$1, function (newValue, key) {
                  getPart(form, detail, key).each(function (wrapper) {
                    Composing.getCurrent(wrapper).each(function (field) {
                      Representing.setValue(field, newValue);
                    });
                  });
                });
              }
            }
          })]),
        'apis': {
          getField: function (form, key) {
            return getPart(form, detail, key).bind(Composing.getCurrent);
          }
        }
      };
    };
    var Form = {
      getField: makeApi(function (apis, component, key) {
        return apis.getField(component, key);
      }),
      sketch: sketch$2
    };

    var validInput = generate$1('valid-input');
    var invalidInput = generate$1('invalid-input');
    var validatingInput = generate$1('validating-input');
    var translatePrefix = 'colorcustom.rgb.';
    var rgbFormFactory = function (translate, getClass, onValidHexx, onInvalidHexx) {
      var invalidation = function (label, isValid) {
        return Invalidating.config({
          invalidClass: getClass('invalid'),
          notify: {
            onValidate: function (comp) {
              emitWith(comp, validatingInput, { type: label });
            },
            onValid: function (comp) {
              emitWith(comp, validInput, {
                type: label,
                value: Representing.getValue(comp)
              });
            },
            onInvalid: function (comp) {
              emitWith(comp, invalidInput, {
                type: label,
                value: Representing.getValue(comp)
              });
            }
          },
          validator: {
            validate: function (comp) {
              var value = Representing.getValue(comp);
              var res = isValid(value) ? Result.value(true) : Result.error(translate('aria.input.invalid'));
              return Future.pure(res);
            },
            validateOnLoad: false
          }
        });
      };
      var renderTextField = function (isValid, name, label, description, data) {
        var helptext = translate(translatePrefix + 'range');
        var pLabel = FormField.parts().label({
          dom: {
            tag: 'label',
            innerHtml: label,
            attributes: { 'aria-label': description }
          }
        });
        var pField = FormField.parts().field({
          data: data,
          factory: Input,
          inputAttributes: __assign({ type: 'text' }, name === 'hex' ? { 'aria-live': 'polite' } : {}),
          inputClasses: [getClass('textfield')],
          inputBehaviours: derive$1([
            invalidation(name, isValid),
            Tabstopping.config({})
          ]),
          onSetValue: function (input) {
            if (Invalidating.isInvalid(input)) {
              var run$$1 = Invalidating.run(input);
              run$$1.get(noop);
            }
          }
        });
        var comps = [
          pLabel,
          pField
        ];
        var concats = name !== 'hex' ? [FormField.parts()['aria-descriptor']({ text: helptext })] : [];
        var components = comps.concat(concats);
        return {
          dom: {
            tag: 'div',
            attributes: { role: 'presentation' }
          },
          components: components
        };
      };
      var copyRgbToHex = function (form, rgba) {
        var hex = fromRgba(rgba);
        Form.getField(form, 'hex').each(function (hexField) {
          if (!Focusing.isFocused(hexField)) {
            Representing.setValue(form, { hex: hex.value() });
          }
        });
        return hex;
      };
      var copyRgbToForm = function (form, rgb) {
        var red$$1 = rgb.red(), green = rgb.green(), blue = rgb.blue();
        Representing.setValue(form, {
          red: red$$1,
          green: green,
          blue: blue
        });
      };
      var memPreview = record({
        dom: {
          tag: 'div',
          classes: [getClass('rgba-preview')],
          styles: { 'background-color': 'white' },
          attributes: { role: 'presentation' }
        }
      });
      var updatePreview = function (anyInSystem, hex) {
        memPreview.getOpt(anyInSystem).each(function (preview) {
          set$2(preview.element(), 'background-color', '#' + hex.value());
        });
      };
      var factory = function (detail) {
        var state = {
          red: constant(Cell(Option.some(255))),
          green: constant(Cell(Option.some(255))),
          blue: constant(Cell(Option.some(255))),
          hex: constant(Cell(Option.some('ffffff')))
        };
        var copyHexToRgb = function (form, hex) {
          var rgb = fromHex(hex);
          copyRgbToForm(form, rgb);
          setValueRgb(rgb);
        };
        var get = function (prop) {
          return state[prop]().get();
        };
        var set = function (prop, value) {
          state[prop]().set(value);
        };
        var getValueRgb = function () {
          return get('red').bind(function (red$$1) {
            return get('green').bind(function (green) {
              return get('blue').map(function (blue) {
                return rgbaColour(red$$1, green, blue, 1);
              });
            });
          });
        };
        var setValueRgb = function (rgb) {
          var red$$1 = rgb.red(), green = rgb.green(), blue = rgb.blue();
          set('red', Option.some(red$$1));
          set('green', Option.some(green));
          set('blue', Option.some(blue));
        };
        var onInvalidInput = function (form, simulatedEvent) {
          var data = simulatedEvent.event();
          if (data.type() !== 'hex') {
            set(data.type(), Option.none());
          } else {
            onInvalidHexx(form);
          }
        };
        var onValidHex = function (form, value) {
          onValidHexx(form);
          var hex = hexColour(value);
          set('hex', Option.some(value));
          var rgb = fromHex(hex);
          copyRgbToForm(form, rgb);
          setValueRgb(rgb);
          emitWith(form, fieldsUpdate(), { hex: hex });
          updatePreview(form, hex);
        };
        var onValidRgb = function (form, prop, value) {
          var val = parseInt(value, 10);
          set(prop, Option.some(val));
          getValueRgb().each(function (rgb) {
            var hex = copyRgbToHex(form, rgb);
            updatePreview(form, hex);
          });
        };
        var onValidInput = function (form, simulatedEvent) {
          var data = simulatedEvent.event();
          if (data.type() === 'hex') {
            onValidHex(form, data.value());
          } else {
            onValidRgb(form, data.type(), data.value());
          }
        };
        var formPartStrings = function (key) {
          return {
            label: translate(translatePrefix + key + '.label'),
            description: translate(translatePrefix + key + '.description')
          };
        };
        var redStrings = formPartStrings('red');
        var greenStrings = formPartStrings('green');
        var blueStrings = formPartStrings('blue');
        var hexStrings = formPartStrings('hex');
        return deepMerge(Form.sketch(function (parts) {
          return {
            dom: {
              tag: 'form',
              classes: [getClass('rgb-form')],
              attributes: { 'aria-label': translate('aria.color.picker') }
            },
            components: [
              parts.field('red', FormField.sketch(renderTextField(isRgbaComponent, 'red', redStrings.label, redStrings.description, 255))),
              parts.field('green', FormField.sketch(renderTextField(isRgbaComponent, 'green', greenStrings.label, greenStrings.description, 255))),
              parts.field('blue', FormField.sketch(renderTextField(isRgbaComponent, 'blue', blueStrings.label, blueStrings.description, 255))),
              parts.field('hex', FormField.sketch(renderTextField(isHexString, 'hex', hexStrings.label, hexStrings.description, 'ffffff'))),
              memPreview.asSpec()
            ],
            formBehaviours: derive$1([
              Invalidating.config({ invalidClass: getClass('form-invalid') }),
              config('rgb-form-events', [
                run(validInput, onValidInput),
                run(invalidInput, onInvalidInput),
                run(validatingInput, onInvalidInput)
              ])
            ])
          };
        }), {
          apis: {
            updateHex: function (form, hex) {
              Representing.setValue(form, { hex: hex.value() });
              copyHexToRgb(form, hex);
              updatePreview(form, hex);
            }
          }
        });
      };
      var RgbForm = single$2({
        factory: factory,
        name: 'RgbForm',
        configFields: [],
        apis: {
          updateHex: function (apis, form, hex) {
            apis.updateHex(form, hex);
          }
        },
        extraApis: {}
      });
      return RgbForm;
    };
    var RgbForm = { rgbFormFactory: rgbFormFactory };

    var hsvColour = function (hue, saturation, value) {
      return {
        hue: constant(hue),
        saturation: constant(saturation),
        value: constant(value)
      };
    };
    var fromRgb = function (rgbaColour) {
      var r, g, b, h, s, v, d, minRGB, maxRGB;
      h = 0;
      s = 0;
      v = 0;
      r = rgbaColour.red() / 255;
      g = rgbaColour.green() / 255;
      b = rgbaColour.blue() / 255;
      minRGB = Math.min(r, Math.min(g, b));
      maxRGB = Math.max(r, Math.max(g, b));
      if (minRGB === maxRGB) {
        v = minRGB;
        return hsvColour(0, 0, v * 100);
      }
      d = r === minRGB ? g - b : b === minRGB ? r - g : b - r;
      h = r === minRGB ? 3 : b === minRGB ? 1 : 5;
      h = 60 * (h - d / (maxRGB - minRGB));
      s = (maxRGB - minRGB) / maxRGB;
      v = maxRGB;
      return hsvColour(Math.round(h), Math.round(s * 100), Math.round(v * 100));
    };

    var calcHex = function (value) {
      var hue = (100 - value / 100) * 360;
      var hsv = hsvColour(hue, 100, 100);
      var rgb = fromHsv(hsv);
      return fromRgba(rgb);
    };

    var makeFactory = function (translate, getClass) {
      var factory = function (detail) {
        var rgbForm = RgbForm.rgbFormFactory(translate, getClass, detail.onValidHex, detail.onInvalidHex);
        var sbPalette = SaturationBrightnessPalette.paletteFactory(translate, getClass);
        var state = { paletteRgba: constant(Cell(red())) };
        var memPalette = record(sbPalette.sketch({}));
        var memRgb = record(rgbForm.sketch({}));
        var updatePalette = function (anyInSystem, hex) {
          memPalette.getOpt(anyInSystem).each(function (palette) {
            var rgba = fromHex(hex);
            state.paletteRgba().set(rgba);
            sbPalette.setRgba(palette, rgba);
          });
        };
        var updateFields = function (anyInSystem, hex) {
          memRgb.getOpt(anyInSystem).each(function (form) {
            rgbForm.updateHex(form, hex);
          });
        };
        var runUpdates = function (anyInSystem, hex, updates) {
          each(updates, function (update) {
            update(anyInSystem, hex);
          });
        };
        var paletteUpdates = function () {
          var updates = [updateFields];
          return function (form, simulatedEvent) {
            var value = simulatedEvent.event().value();
            var oldRgb = state.paletteRgba().get();
            var hsvColour$$1 = fromRgb(oldRgb);
            var newHsvColour = hsvColour(hsvColour$$1.hue(), value.x(), 100 - value.y());
            var rgb = fromHsv(newHsvColour);
            var nuHex = fromRgba(rgb);
            runUpdates(form, nuHex, updates);
          };
        };
        var sliderUpdates = function () {
          var updates = [
            updatePalette,
            updateFields
          ];
          return function (form, simulatedEvent) {
            var value = simulatedEvent.event().value();
            var hex = calcHex(value.y());
            runUpdates(form, hex, updates);
          };
        };
        return {
          uid: detail.uid,
          dom: detail.dom,
          components: [
            memPalette.asSpec(),
            HueSlider.sliderFactory(translate, getClass),
            memRgb.asSpec()
          ],
          behaviours: derive$1([
            config('colour-picker-events', [
              run(paletteUpdate(), paletteUpdates()),
              run(sliderUpdate(), sliderUpdates())
            ]),
            Composing.config({
              find: function (comp) {
                return memRgb.getOpt(comp);
              }
            }),
            Keying.config({ mode: 'acyclic' })
          ])
        };
      };
      var ColourPicker = single$2({
        name: 'ColourPicker',
        configFields: [
          defaulted$1('onValidHex', noop),
          defaulted$1('onInvalidHex', noop),
          optionString('formChangeEvent')
        ],
        factory: factory
      });
      return ColourPicker;
    };
    var ColourPicker = { makeFactory: makeFactory };

    var self = function () {
      return Composing.config({ find: Option.some });
    };
    var memento = function (mem) {
      return Composing.config({ find: mem.getOpt });
    };
    var childAt = function (index) {
      return Composing.config({
        find: function (comp) {
          return child(comp.element(), index).bind(function (element) {
            return comp.getSystem().getByDom(element).toOption();
          });
        }
      });
    };
    var ComposingConfigs = {
      self: self,
      memento: memento,
      childAt: childAt
    };

    var english = {
      'colorcustom.rgb.red.label': 'R',
      'colorcustom.rgb.red.description': 'Red component',
      'colorcustom.rgb.green.label': 'G',
      'colorcustom.rgb.green.description': 'Green component',
      'colorcustom.rgb.blue.label': 'B',
      'colorcustom.rgb.blue.description': 'Blue component',
      'colorcustom.rgb.hex.label': '#',
      'colorcustom.rgb.hex.description': 'Hex color code',
      'colorcustom.rgb.range': 'Range 0 to 255',
      'colorcustom.sb.saturation': 'Saturation',
      'colorcustom.sb.brightness': 'Brightness',
      'colorcustom.sb.picker': 'Saturation and Brightness Picker',
      'colorcustom.sb.palette': 'Saturation and Brightness Palette',
      'colorcustom.sb.instructions': 'Use arrow keys to select saturation and brightness, on x and y axes',
      'colorcustom.hue.hue': 'Hue',
      'colorcustom.hue.slider': 'Hue Slider',
      'colorcustom.hue.palette': 'Hue Palette',
      'colorcustom.hue.instructions': 'Use arrow keys to select a hue',
      'aria.color.picker': 'Color Picker',
      'aria.input.invalid': 'Invalid input'
    };
    var getEnglishText = function (key) {
      return english[key];
    };
    var translate$1 = function (key) {
      return getEnglishText(key);
    };
    var renderColorPicker = function (spec) {
      var getClass = function (key) {
        return 'tox-' + key;
      };
      var colourPickerFactory = ColourPicker.makeFactory(translate$1, getClass);
      var onValidHex = function (form) {
        emitWith(form, formActionEvent, {
          name: 'hex-valid',
          value: true
        });
      };
      var onInvalidHex = function (form) {
        emitWith(form, formActionEvent, {
          name: 'hex-valid',
          value: false
        });
      };
      var memPicker = record(colourPickerFactory.sketch({
        dom: {
          tag: 'div',
          classes: [getClass('color-picker-container')],
          attributes: { role: 'presentation' }
        },
        onValidHex: onValidHex,
        onInvalidHex: onInvalidHex
      }));
      return {
        dom: { tag: 'div' },
        components: [memPicker.asSpec()],
        behaviours: derive$1([
          Representing.config({
            store: {
              mode: 'manual',
              getValue: function (comp) {
                var picker = memPicker.get(comp);
                var optRgbForm = Composing.getCurrent(picker);
                var optHex = optRgbForm.bind(function (rgbForm) {
                  var formValues = Representing.getValue(rgbForm);
                  return formValues.hex;
                });
                return optHex.map(function (hex) {
                  return '#' + hex;
                }).getOr('');
              },
              setValue: function (comp, newValue) {
                var pattern = /^#([a-fA-F0-9]{3}(?:[a-fA-F0-9]{3})?)/;
                var m = pattern.exec(newValue);
                var picker = memPicker.get(comp);
                var optRgbForm = Composing.getCurrent(picker);
                optRgbForm.fold(function () {
                  console.log('Can not find form');
                }, function (rgbForm) {
                  Representing.setValue(rgbForm, { hex: Option.from(m[1]).getOr('') });
                  Form.getField(rgbForm, 'hex').each(function (hexField) {
                    emit(hexField, input());
                  });
                });
              }
            }
          }),
          ComposingConfigs.self()
        ])
      };
    };

    var renderCustomEditor = function (spec) {
      var editorApi = Cell(Option.none());
      var memReplaced = record({ dom: { tag: spec.tag } });
      var initialValue = Cell(Option.none());
      return {
        dom: {
          tag: 'div',
          classes: ['tox-custom-editor']
        },
        behaviours: derive$1([
          config('editor-foo-events', [runOnAttached(function (component) {
              memReplaced.getOpt(component).each(function (ta) {
                spec.init(ta.element().dom()).then(function (ea) {
                  initialValue.get().each(function (cvalue) {
                    ea.setValue(cvalue);
                  });
                  initialValue.set(Option.none());
                  editorApi.set(Option.some(ea));
                });
              });
            })]),
          Representing.config({
            store: {
              mode: 'manual',
              getValue: function () {
                return editorApi.get().fold(function () {
                  return initialValue.get().getOr('');
                }, function (ed) {
                  return ed.getValue();
                });
              },
              setValue: function (component, value) {
                editorApi.get().fold(function () {
                  initialValue.set(Option.some(value));
                }, function (ed) {
                  return ed.setValue(value);
                });
              }
            }
          }),
          ComposingConfigs.self()
        ]),
        components: [memReplaced.asSpec()]
      };
    };

    var processors = objOf([
      defaulted$1('preprocess', identity),
      defaulted$1('postprocess', identity)
    ]);
    var memento$1 = function (mem, rawProcessors) {
      var ps = asRawOrDie('RepresentingConfigs.memento processors', processors, rawProcessors);
      return Representing.config({
        store: {
          mode: 'manual',
          getValue: function (comp) {
            var other = mem.get(comp);
            var rawValue = Representing.getValue(other);
            return ps.postprocess(rawValue);
          },
          setValue: function (comp, rawValue) {
            var newValue = ps.preprocess(rawValue);
            var other = mem.get(comp);
            Representing.setValue(other, newValue);
          }
        }
      });
    };
    var withComp = function (optInitialValue, getter, setter) {
      return Representing.config(deepMerge({
        store: {
          mode: 'manual',
          getValue: getter,
          setValue: setter
        }
      }, optInitialValue.map(function (initialValue) {
        return { store: { initialValue: initialValue } };
      }).getOr({})));
    };
    var withElement = function (initialValue, getter, setter) {
      return withComp(initialValue, function (c) {
        return getter(c.element());
      }, function (c, v) {
        return setter(c.element(), v);
      });
    };
    var domValue = function (optInitialValue) {
      return withElement(optInitialValue, get$6, set$3);
    };
    var domHtml = function (optInitialValue) {
      return withElement(optInitialValue, get$1, set);
    };
    var memory$1 = function (initialValue) {
      return Representing.config({
        store: {
          mode: 'memory',
          initialValue: initialValue
        }
      });
    };
    var RepresentingConfigs = {
      memento: memento$1,
      withElement: withElement,
      withComp: withComp,
      domValue: domValue,
      domHtml: domHtml,
      memory: memory$1
    };

    var extensionsAccepted = '.jpg,.jpeg,.png,.gif';
    var filterByExtension = function (files) {
      var re = new RegExp('(' + extensionsAccepted.split(/\s*,\s*/).join('|') + ')$', 'i');
      return filter(from$1(files), function (file) {
        return re.test(file.name);
      });
    };
    var renderDropZone = function (spec, providersBackstage) {
      var stopper$$1 = function (_, se) {
        se.stop();
      };
      var sequence = function (actions) {
        return function (comp, se) {
          each(actions, function (a) {
            a(comp, se);
          });
        };
      };
      var onDrop = function (comp, se) {
        if (!Disabling.isDisabled(comp)) {
          var transferEvent = se.event().raw();
          handleFiles(comp, transferEvent.dataTransfer.files);
        }
      };
      var onSelect = function (component, simulatedEvent) {
        var files = simulatedEvent.event().raw().target.files;
        handleFiles(component, files);
      };
      var handleFiles = function (component, files) {
        Representing.setValue(component, filterByExtension(files));
        emitWith(component, formChangeEvent, { name: spec.name });
      };
      var memInput = record({
        dom: {
          tag: 'input',
          attributes: {
            type: 'file',
            multiple: 'multiple'
          },
          styles: { display: 'none' }
        },
        behaviours: derive$1([config('input-file-events', [cutter(click())])])
      });
      var renderField = function (s) {
        return {
          uid: s.uid,
          dom: {
            tag: 'div',
            classes: ['tox-dropzone-container']
          },
          behaviours: derive$1([
            RepresentingConfigs.memory([]),
            ComposingConfigs.self(),
            Disabling.config({}),
            Toggling.config({
              toggleClass: 'dragenter',
              toggleOnExecute: false
            }),
            config('dropzone-events', [
              run('dragenter', sequence([
                stopper$$1,
                Toggling.toggle
              ])),
              run('dragleave', sequence([
                stopper$$1,
                Toggling.toggle
              ])),
              run('dragover', stopper$$1),
              run('drop', sequence([
                stopper$$1,
                onDrop
              ])),
              run(change(), onSelect)
            ])
          ]),
          components: [{
              dom: {
                tag: 'div',
                classes: ['tox-dropzone'],
                styles: {}
              },
              components: [
                {
                  dom: {
                    tag: 'p',
                    innerHtml: providersBackstage.translate('Drop an image here')
                  }
                },
                Button.sketch({
                  dom: {
                    tag: 'button',
                    innerHtml: providersBackstage.translate('Browse for an image'),
                    styles: { position: 'relative' },
                    classes: [
                      'tox-button',
                      'tox-button--secondary'
                    ]
                  },
                  components: [memInput.asSpec()],
                  action: function (comp) {
                    var inputComp = memInput.get(comp);
                    inputComp.element().dom().click();
                  },
                  buttonBehaviours: derive$1([Tabstopping.config({})])
                })
              ]
            }]
        };
      };
      var pLabel = spec.label.map(function (label) {
        return renderLabel(label, providersBackstage);
      });
      var pField = FormField.parts().field({ factory: { sketch: renderField } });
      return renderFormFieldWith(pLabel, pField, ['tox-form__group--stretched']);
    };

    var renderGrid = function (spec, backstage) {
      return {
        dom: {
          tag: 'div',
          classes: [
            'tox-form__grid',
            'tox-form__grid--' + spec.columns + 'col'
          ]
        },
        components: map(spec.items, backstage.interpreter)
      };
    };

    var beforeObject = generate$1('alloy-fake-before-tabstop');
    var afterObject = generate$1('alloy-fake-after-tabstop');
    var craftWithClasses = function (classes) {
      return {
        dom: {
          tag: 'div',
          styles: {
            width: '1px',
            height: '1px',
            outline: 'none'
          },
          attributes: { tabindex: '0' },
          classes: classes
        },
        behaviours: derive$1([
          Focusing.config({ ignore: true }),
          Tabstopping.config({})
        ])
      };
    };
    var craft = function (spec) {
      return {
        dom: {
          tag: 'div',
          classes: ['tox-navobj']
        },
        components: [
          craftWithClasses([beforeObject]),
          spec,
          craftWithClasses([afterObject])
        ],
        behaviours: derive$1([ComposingConfigs.childAt(1)])
      };
    };
    var triggerTab = function (placeholder, shiftKey) {
      emitWith(placeholder, keydown(), {
        raw: {
          which: 9,
          shiftKey: shiftKey
        }
      });
    };
    var onFocus$1 = function (container, targetComp) {
      var target = targetComp.element();
      if (has$2(target, beforeObject)) {
        triggerTab(container, true);
      } else if (has$2(target, afterObject)) {
        triggerTab(container, false);
      }
    };
    var isPseudoStop = function (element) {
      return closest$4(element, [
        '.' + beforeObject,
        '.' + afterObject
      ].join(','), constant(false));
    };
    var NavigableObject = {
      isPseudoStop: isPseudoStop,
      onFocus: onFocus$1,
      craft: craft
    };

    var platformNeedsSandboxing = !(PlatformDetection$1.detect().browser.isIE() || PlatformDetection$1.detect().browser.isEdge());
    var getDynamicSource = function (isSandbox) {
      var cachedValue = Cell('');
      return {
        getValue: function (frameComponent) {
          return cachedValue.get();
        },
        setValue: function (frameComponent, html) {
          if (!isSandbox) {
            set$1(frameComponent.element(), 'src', 'javascript:\'\'');
            var doc = frameComponent.element().dom().contentWindow.document;
            doc.open();
            doc.write(html);
            doc.close();
          } else {
            set$1(frameComponent.element(), 'src', 'data:text/html;charset=utf-8,' + encodeURIComponent(html));
          }
          cachedValue.set(html);
        }
      };
    };
    var renderIFrame = function (spec, providersBackstage) {
      var isSandbox = platformNeedsSandboxing && spec.sandboxed;
      var attributes = __assign({}, spec.label.map(function (title) {
        return { title: title };
      }).getOr({}), isSandbox ? { sandbox: 'allow-scripts' } : {});
      var sourcing = getDynamicSource(isSandbox);
      var pLabel = spec.label.map(function (label) {
        return renderLabel(label, providersBackstage);
      });
      var factory = function (newSpec) {
        return NavigableObject.craft({
          uid: newSpec.uid,
          dom: {
            tag: 'iframe',
            attributes: attributes
          },
          behaviours: derive$1([
            Tabstopping.config({}),
            Focusing.config({}),
            RepresentingConfigs.withComp(Option.none(), sourcing.getValue, sourcing.setValue)
          ])
        });
      };
      var pField = FormField.parts().field({ factory: { sketch: factory } });
      return renderFormFieldWith(pLabel, pField, ['tox-form__group--stretched']);
    };

    function create$6(width, height) {
      return resize(document.createElement('canvas'), width, height);
    }
    function clone$3(canvas) {
      var tCanvas, ctx;
      tCanvas = create$6(canvas.width, canvas.height);
      ctx = get2dContext(tCanvas);
      ctx.drawImage(canvas, 0, 0);
      return tCanvas;
    }
    function get2dContext(canvas) {
      return canvas.getContext('2d');
    }
    function get3dContext(canvas) {
      var gl = null;
      try {
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      } catch (e) {
      }
      if (!gl) {
        gl = null;
      }
      return gl;
    }
    function resize(canvas, width, height) {
      canvas.width = width;
      canvas.height = height;
      return canvas;
    }
    var Canvas = {
      create: create$6,
      clone: clone$3,
      resize: resize,
      get2dContext: get2dContext,
      get3dContext: get3dContext
    };

    function getWidth(image) {
      return image.naturalWidth || image.width;
    }
    function getHeight(image) {
      return image.naturalHeight || image.height;
    }
    var ImageSize = {
      getWidth: getWidth,
      getHeight: getHeight
    };

    var promise = function () {
      var Promise = function (fn) {
        if (typeof this !== 'object')
          throw new TypeError('Promises must be constructed via new');
        if (typeof fn !== 'function')
          throw new TypeError('not a function');
        this._state = null;
        this._value = null;
        this._deferreds = [];
        doResolve(fn, bind(resolve, this), bind(reject, this));
      };
      var asap = Promise.immediateFn || typeof window.setImmediate === 'function' && window.setImmediate || function (fn) {
        setTimeout(fn, 1);
      };
      function bind(fn, thisArg) {
        return function () {
          fn.apply(thisArg, arguments);
        };
      }
      var isArray = Array.isArray || function (value) {
        return Object.prototype.toString.call(value) === '[object Array]';
      };
      function handle(deferred) {
        var me = this;
        if (this._state === null) {
          this._deferreds.push(deferred);
          return;
        }
        asap(function () {
          var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
          if (cb === null) {
            (me._state ? deferred.resolve : deferred.reject)(me._value);
            return;
          }
          var ret;
          try {
            ret = cb(me._value);
          } catch (e) {
            deferred.reject(e);
            return;
          }
          deferred.resolve(ret);
        });
      }
      function resolve(newValue) {
        try {
          if (newValue === this)
            throw new TypeError('A promise cannot be resolved with itself.');
          if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
            var then = newValue.then;
            if (typeof then === 'function') {
              doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
              return;
            }
          }
          this._state = true;
          this._value = newValue;
          finale.call(this);
        } catch (e) {
          reject.call(this, e);
        }
      }
      function reject(newValue) {
        this._state = false;
        this._value = newValue;
        finale.call(this);
      }
      function finale() {
        for (var i = 0, len = this._deferreds.length; i < len; i++) {
          handle.call(this, this._deferreds[i]);
        }
        this._deferreds = null;
      }
      function Handler(onFulfilled, onRejected, resolve, reject) {
        this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
        this.onRejected = typeof onRejected === 'function' ? onRejected : null;
        this.resolve = resolve;
        this.reject = reject;
      }
      function doResolve(fn, onFulfilled, onRejected) {
        var done = false;
        try {
          fn(function (value) {
            if (done)
              return;
            done = true;
            onFulfilled(value);
          }, function (reason) {
            if (done)
              return;
            done = true;
            onRejected(reason);
          });
        } catch (ex) {
          if (done)
            return;
          done = true;
          onRejected(ex);
        }
      }
      Promise.prototype['catch'] = function (onRejected) {
        return this.then(null, onRejected);
      };
      Promise.prototype.then = function (onFulfilled, onRejected) {
        var me = this;
        return new Promise(function (resolve, reject) {
          handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
        });
      };
      Promise.all = function () {
        var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);
        return new Promise(function (resolve, reject) {
          if (args.length === 0)
            return resolve([]);
          var remaining = args.length;
          function res(i, val) {
            try {
              if (val && (typeof val === 'object' || typeof val === 'function')) {
                var then = val.then;
                if (typeof then === 'function') {
                  then.call(val, function (val) {
                    res(i, val);
                  }, reject);
                  return;
                }
              }
              args[i] = val;
              if (--remaining === 0) {
                resolve(args);
              }
            } catch (ex) {
              reject(ex);
            }
          }
          for (var i = 0; i < args.length; i++) {
            res(i, args[i]);
          }
        });
      };
      Promise.resolve = function (value) {
        if (value && typeof value === 'object' && value.constructor === Promise) {
          return value;
        }
        return new Promise(function (resolve) {
          resolve(value);
        });
      };
      Promise.reject = function (value) {
        return new Promise(function (resolve, reject) {
          reject(value);
        });
      };
      Promise.race = function (values) {
        return new Promise(function (resolve, reject) {
          for (var i = 0, len = values.length; i < len; i++) {
            values[i].then(resolve, reject);
          }
        });
      };
      return Promise;
    };
    var Promise$2 = window.Promise ? window.Promise : promise();

    function Blob (parts, properties) {
      var f = Global$1.getOrDie('Blob');
      return new f(parts, properties);
    }

    function FileReader () {
      var f = Global$1.getOrDie('FileReader');
      return new f();
    }

    function Uint8Array (arr) {
      var f = Global$1.getOrDie('Uint8Array');
      return new f(arr);
    }

    var requestAnimationFrame = function (callback) {
      var f = Global$1.getOrDie('requestAnimationFrame');
      f(callback);
    };
    var atob = function (base64) {
      var f = Global$1.getOrDie('atob');
      return f(base64);
    };
    var Window$1 = {
      atob: atob,
      requestAnimationFrame: requestAnimationFrame
    };

    function imageToBlob(image) {
      var src = image.src;
      if (src.indexOf('data:') === 0) {
        return dataUriToBlob(src);
      }
      return anyUriToBlob(src);
    }
    function blobToImage(blob) {
      return new Promise$2(function (resolve, reject) {
        var blobUrl = URL.createObjectURL(blob);
        var image = new Image();
        var removeListeners = function () {
          image.removeEventListener('load', loaded);
          image.removeEventListener('error', error);
        };
        function loaded() {
          removeListeners();
          resolve(image);
        }
        function error() {
          removeListeners();
          reject('Unable to load data of type ' + blob.type + ': ' + blobUrl);
        }
        image.addEventListener('load', loaded);
        image.addEventListener('error', error);
        image.src = blobUrl;
        if (image.complete) {
          loaded();
        }
      });
    }
    function anyUriToBlob(url) {
      return new Promise$2(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function () {
          if (this.status == 200) {
            resolve(this.response);
          }
        };
        xhr.onerror = function () {
          var _this = this;
          var corsError = function () {
            var obj = new Error('No access to download image');
            obj.code = 18;
            obj.name = 'SecurityError';
            return obj;
          };
          var genericError = function () {
            return new Error('Error ' + _this.status + ' downloading image');
          };
          reject(this.status === 0 ? corsError() : genericError());
        };
        xhr.send();
      });
    }
    function dataUriToBlobSync(uri) {
      var data = uri.split(',');
      var matches = /data:([^;]+)/.exec(data[0]);
      if (!matches)
        return Option.none();
      var mimetype = matches[1];
      var base64 = data[1];
      var sliceSize = 1024;
      var byteCharacters = Window$1.atob(base64);
      var bytesLength = byteCharacters.length;
      var slicesCount = Math.ceil(bytesLength / sliceSize);
      var byteArrays = new Array(slicesCount);
      for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);
        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
          bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = Uint8Array(bytes);
      }
      return Option.some(Blob(byteArrays, { type: mimetype }));
    }
    function dataUriToBlob(uri) {
      return new Promise$2(function (resolve, reject) {
        dataUriToBlobSync(uri).fold(function () {
          reject('uri is not base64: ' + uri);
        }, resolve);
      });
    }
    function uriToBlob(url) {
      if (url.indexOf('blob:') === 0) {
        return anyUriToBlob(url);
      }
      if (url.indexOf('data:') === 0) {
        return dataUriToBlob(url);
      }
      return null;
    }
    function canvasToBlob(canvas, type, quality) {
      type = type || 'image/png';
      if (HTMLCanvasElement.prototype.toBlob) {
        return new Promise$2(function (resolve) {
          canvas.toBlob(function (blob) {
            resolve(blob);
          }, type, quality);
        });
      } else {
        return dataUriToBlob(canvas.toDataURL(type, quality));
      }
    }
    function canvasToDataURL(getCanvas, type, quality) {
      type = type || 'image/png';
      return getCanvas.then(function (canvas) {
        return canvas.toDataURL(type, quality);
      });
    }
    function blobToCanvas(blob) {
      return blobToImage(blob).then(function (image) {
        revokeImageUrl(image);
        var context, canvas;
        canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image));
        context = Canvas.get2dContext(canvas);
        context.drawImage(image, 0, 0);
        return canvas;
      });
    }
    function blobToDataUri(blob) {
      return new Promise$2(function (resolve) {
        var reader = FileReader();
        reader.onloadend = function () {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    }
    function blobToArrayBuffer(blob) {
      return new Promise$2(function (resolve) {
        var reader = FileReader();
        reader.onloadend = function () {
          resolve(reader.result);
        };
        reader.readAsArrayBuffer(blob);
      });
    }
    function blobToBase64(blob) {
      return blobToDataUri(blob).then(function (dataUri) {
        return dataUri.split(',')[1];
      });
    }
    function revokeImageUrl(image) {
      URL.revokeObjectURL(image.src);
    }
    var Conversions = {
      blobToImage: blobToImage,
      imageToBlob: imageToBlob,
      blobToArrayBuffer: blobToArrayBuffer,
      blobToDataUri: blobToDataUri,
      blobToBase64: blobToBase64,
      dataUriToBlobSync: dataUriToBlobSync,
      canvasToBlob: canvasToBlob,
      canvasToDataURL: canvasToDataURL,
      blobToCanvas: blobToCanvas,
      uriToBlob: uriToBlob
    };

    function create$7(getCanvas, blob, uri) {
      var initialType = blob.type;
      var getType = constant(initialType);
      function toBlob() {
        return Promise$2.resolve(blob);
      }
      function toDataURL() {
        return uri;
      }
      function toBase64() {
        return uri.split(',')[1];
      }
      function toAdjustedBlob(type, quality) {
        return getCanvas.then(function (canvas) {
          return Conversions.canvasToBlob(canvas, type, quality);
        });
      }
      function toAdjustedDataURL(type, quality) {
        return getCanvas.then(function (canvas) {
          return Conversions.canvasToDataURL(canvas, type, quality);
        });
      }
      function toAdjustedBase64(type, quality) {
        return toAdjustedDataURL(type, quality).then(function (dataurl) {
          return dataurl.split(',')[1];
        });
      }
      function toCanvas() {
        return getCanvas.then(Canvas.clone);
      }
      return {
        getType: getType,
        toBlob: toBlob,
        toDataURL: toDataURL,
        toBase64: toBase64,
        toAdjustedBlob: toAdjustedBlob,
        toAdjustedDataURL: toAdjustedDataURL,
        toAdjustedBase64: toAdjustedBase64,
        toCanvas: toCanvas
      };
    }
    function fromBlob(blob) {
      return Conversions.blobToDataUri(blob).then(function (uri) {
        return create$7(Conversions.blobToCanvas(blob), blob, uri);
      });
    }
    function fromCanvas(canvas, type) {
      return Conversions.canvasToBlob(canvas, type).then(function (blob) {
        return create$7(Promise$2.resolve(canvas), blob, canvas.toDataURL());
      });
    }
    function fromImage(image) {
      return Conversions.imageToBlob(image).then(function (blob) {
        return fromBlob(blob);
      });
    }
    var fromBlobAndUrlSync = function (blob, url) {
      return create$7(Conversions.blobToCanvas(blob), blob, url);
    };
    var ImageResult = {
      fromBlob: fromBlob,
      fromCanvas: fromCanvas,
      fromImage: fromImage,
      fromBlobAndUrlSync: fromBlobAndUrlSync
    };

    var blobToImageResult = function (blob) {
      return ImageResult.fromBlob(blob);
    };
    var fromBlobAndUrlSync$1 = function (blob, uri) {
      return ImageResult.fromBlobAndUrlSync(blob, uri);
    };
    var imageToImageResult = function (image) {
      return ImageResult.fromImage(image);
    };
    var imageResultToBlob = function (ir, type, quality) {
      if (type === undefined && quality === undefined) {
        return imageResultToOriginalBlob(ir);
      } else {
        return ir.toAdjustedBlob(type, quality);
      }
    };
    var imageResultToOriginalBlob = function (ir) {
      return ir.toBlob();
    };
    var imageResultToDataURL = function (ir) {
      return ir.toDataURL();
    };
    var ResultConversions = {
      blobToImageResult: blobToImageResult,
      fromBlobAndUrlSync: fromBlobAndUrlSync$1,
      imageToImageResult: imageToImageResult,
      imageResultToBlob: imageResultToBlob,
      imageResultToOriginalBlob: imageResultToOriginalBlob,
      imageResultToDataURL: imageResultToDataURL
    };

    function clamp(value, min, max) {
      value = parseFloat(value);
      if (value > max) {
        value = max;
      } else if (value < min) {
        value = min;
      }
      return value;
    }
    function identity$1() {
      return [
        1,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1
      ];
    }
    var DELTA_INDEX = [
      0,
      0.01,
      0.02,
      0.04,
      0.05,
      0.06,
      0.07,
      0.08,
      0.1,
      0.11,
      0.12,
      0.14,
      0.15,
      0.16,
      0.17,
      0.18,
      0.2,
      0.21,
      0.22,
      0.24,
      0.25,
      0.27,
      0.28,
      0.3,
      0.32,
      0.34,
      0.36,
      0.38,
      0.4,
      0.42,
      0.44,
      0.46,
      0.48,
      0.5,
      0.53,
      0.56,
      0.59,
      0.62,
      0.65,
      0.68,
      0.71,
      0.74,
      0.77,
      0.8,
      0.83,
      0.86,
      0.89,
      0.92,
      0.95,
      0.98,
      1,
      1.06,
      1.12,
      1.18,
      1.24,
      1.3,
      1.36,
      1.42,
      1.48,
      1.54,
      1.6,
      1.66,
      1.72,
      1.78,
      1.84,
      1.9,
      1.96,
      2,
      2.12,
      2.25,
      2.37,
      2.5,
      2.62,
      2.75,
      2.87,
      3,
      3.2,
      3.4,
      3.6,
      3.8,
      4,
      4.3,
      4.7,
      4.9,
      5,
      5.5,
      6,
      6.5,
      6.8,
      7,
      7.3,
      7.5,
      7.8,
      8,
      8.4,
      8.7,
      9,
      9.4,
      9.6,
      9.8,
      10
    ];
    function multiply(matrix1, matrix2) {
      var i, j, k, val, col = [], out = new Array(10);
      for (i = 0; i < 5; i++) {
        for (j = 0; j < 5; j++) {
          col[j] = matrix2[j + i * 5];
        }
        for (j = 0; j < 5; j++) {
          val = 0;
          for (k = 0; k < 5; k++) {
            val += matrix1[j + k * 5] * col[k];
          }
          out[j + i * 5] = val;
        }
      }
      return out;
    }
    function adjust(matrix, adjustValue) {
      adjustValue = clamp(adjustValue, 0, 1);
      return matrix.map(function (value, index) {
        if (index % 6 === 0) {
          value = 1 - (1 - value) * adjustValue;
        } else {
          value *= adjustValue;
        }
        return clamp(value, 0, 1);
      });
    }
    function adjustContrast(matrix, value) {
      var x;
      value = clamp(value, -1, 1);
      value *= 100;
      if (value < 0) {
        x = 127 + value / 100 * 127;
      } else {
        x = value % 1;
        if (x === 0) {
          x = DELTA_INDEX[value];
        } else {
          x = DELTA_INDEX[Math.floor(value)] * (1 - x) + DELTA_INDEX[Math.floor(value) + 1] * x;
        }
        x = x * 127 + 127;
      }
      return multiply(matrix, [
        x / 127,
        0,
        0,
        0,
        0.5 * (127 - x),
        0,
        x / 127,
        0,
        0,
        0.5 * (127 - x),
        0,
        0,
        x / 127,
        0,
        0.5 * (127 - x),
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1
      ]);
    }
    function adjustSaturation(matrix, value) {
      var x, lumR, lumG, lumB;
      value = clamp(value, -1, 1);
      x = 1 + (value > 0 ? 3 * value : value);
      lumR = 0.3086;
      lumG = 0.6094;
      lumB = 0.082;
      return multiply(matrix, [
        lumR * (1 - x) + x,
        lumG * (1 - x),
        lumB * (1 - x),
        0,
        0,
        lumR * (1 - x),
        lumG * (1 - x) + x,
        lumB * (1 - x),
        0,
        0,
        lumR * (1 - x),
        lumG * (1 - x),
        lumB * (1 - x) + x,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1
      ]);
    }
    function adjustHue(matrix, angle) {
      var cosVal, sinVal, lumR, lumG, lumB;
      angle = clamp(angle, -180, 180) / 180 * Math.PI;
      cosVal = Math.cos(angle);
      sinVal = Math.sin(angle);
      lumR = 0.213;
      lumG = 0.715;
      lumB = 0.072;
      return multiply(matrix, [
        lumR + cosVal * (1 - lumR) + sinVal * -lumR,
        lumG + cosVal * -lumG + sinVal * -lumG,
        lumB + cosVal * -lumB + sinVal * (1 - lumB),
        0,
        0,
        lumR + cosVal * -lumR + sinVal * 0.143,
        lumG + cosVal * (1 - lumG) + sinVal * 0.14,
        lumB + cosVal * -lumB + sinVal * -0.283,
        0,
        0,
        lumR + cosVal * -lumR + sinVal * -(1 - lumR),
        lumG + cosVal * -lumG + sinVal * lumG,
        lumB + cosVal * (1 - lumB) + sinVal * lumB,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1
      ]);
    }
    function adjustBrightness(matrix, value) {
      value = clamp(255 * value, -255, 255);
      return multiply(matrix, [
        1,
        0,
        0,
        0,
        value,
        0,
        1,
        0,
        0,
        value,
        0,
        0,
        1,
        0,
        value,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1
      ]);
    }
    function adjustColors(matrix, adjustR, adjustG, adjustB) {
      adjustR = clamp(adjustR, 0, 2);
      adjustG = clamp(adjustG, 0, 2);
      adjustB = clamp(adjustB, 0, 2);
      return multiply(matrix, [
        adjustR,
        0,
        0,
        0,
        0,
        0,
        adjustG,
        0,
        0,
        0,
        0,
        0,
        adjustB,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1
      ]);
    }
    function adjustSepia(matrix, value) {
      value = clamp(value, 0, 1);
      return multiply(matrix, adjust([
        0.393,
        0.769,
        0.189,
        0,
        0,
        0.349,
        0.686,
        0.168,
        0,
        0,
        0.272,
        0.534,
        0.131,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1
      ], value));
    }
    function adjustGrayscale(matrix, value) {
      value = clamp(value, 0, 1);
      return multiply(matrix, adjust([
        0.33,
        0.34,
        0.33,
        0,
        0,
        0.33,
        0.34,
        0.33,
        0,
        0,
        0.33,
        0.34,
        0.33,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1
      ], value));
    }
    var ColorMatrix = {
      identity: identity$1,
      adjust: adjust,
      multiply: multiply,
      adjustContrast: adjustContrast,
      adjustBrightness: adjustBrightness,
      adjustSaturation: adjustSaturation,
      adjustHue: adjustHue,
      adjustColors: adjustColors,
      adjustSepia: adjustSepia,
      adjustGrayscale: adjustGrayscale
    };

    function colorFilter(ir, matrix) {
      return ir.toCanvas().then(function (canvas) {
        return applyColorFilter(canvas, ir.getType(), matrix);
      });
    }
    function applyColorFilter(canvas, type, matrix) {
      var context = Canvas.get2dContext(canvas);
      var pixels;
      function applyMatrix(pixels, m) {
        var d = pixels.data, r, g, b, a, i, m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7], m8 = m[8], m9 = m[9], m10 = m[10], m11 = m[11], m12 = m[12], m13 = m[13], m14 = m[14], m15 = m[15], m16 = m[16], m17 = m[17], m18 = m[18], m19 = m[19];
        for (i = 0; i < d.length; i += 4) {
          r = d[i];
          g = d[i + 1];
          b = d[i + 2];
          a = d[i + 3];
          d[i] = r * m0 + g * m1 + b * m2 + a * m3 + m4;
          d[i + 1] = r * m5 + g * m6 + b * m7 + a * m8 + m9;
          d[i + 2] = r * m10 + g * m11 + b * m12 + a * m13 + m14;
          d[i + 3] = r * m15 + g * m16 + b * m17 + a * m18 + m19;
        }
        return pixels;
      }
      pixels = applyMatrix(context.getImageData(0, 0, canvas.width, canvas.height), matrix);
      context.putImageData(pixels, 0, 0);
      return ImageResult.fromCanvas(canvas, type);
    }
    function convoluteFilter(ir, matrix) {
      return ir.toCanvas().then(function (canvas) {
        return applyConvoluteFilter(canvas, ir.getType(), matrix);
      });
    }
    function applyConvoluteFilter(canvas, type, matrix) {
      var context = Canvas.get2dContext(canvas);
      var pixelsIn, pixelsOut;
      function applyMatrix(pixelsIn, pixelsOut, matrix) {
        var rgba, drgba, side, halfSide, x, y, r, g, b, cx, cy, scx, scy, offset, wt, w, h;
        function clamp(value, min, max) {
          if (value > max) {
            value = max;
          } else if (value < min) {
            value = min;
          }
          return value;
        }
        side = Math.round(Math.sqrt(matrix.length));
        halfSide = Math.floor(side / 2);
        rgba = pixelsIn.data;
        drgba = pixelsOut.data;
        w = pixelsIn.width;
        h = pixelsIn.height;
        for (y = 0; y < h; y++) {
          for (x = 0; x < w; x++) {
            r = g = b = 0;
            for (cy = 0; cy < side; cy++) {
              for (cx = 0; cx < side; cx++) {
                scx = clamp(x + cx - halfSide, 0, w - 1);
                scy = clamp(y + cy - halfSide, 0, h - 1);
                offset = (scy * w + scx) * 4;
                wt = matrix[cy * side + cx];
                r += rgba[offset] * wt;
                g += rgba[offset + 1] * wt;
                b += rgba[offset + 2] * wt;
              }
            }
            offset = (y * w + x) * 4;
            drgba[offset] = clamp(r, 0, 255);
            drgba[offset + 1] = clamp(g, 0, 255);
            drgba[offset + 2] = clamp(b, 0, 255);
          }
        }
        return pixelsOut;
      }
      pixelsIn = context.getImageData(0, 0, canvas.width, canvas.height);
      pixelsOut = context.getImageData(0, 0, canvas.width, canvas.height);
      pixelsOut = applyMatrix(pixelsIn, pixelsOut, matrix);
      context.putImageData(pixelsOut, 0, 0);
      return ImageResult.fromCanvas(canvas, type);
    }
    function functionColorFilter(colorFn) {
      var filterImpl = function (canvas, type, value) {
        var context = Canvas.get2dContext(canvas);
        var pixels, i, lookup = new Array(256);
        function applyLookup(pixels, lookup) {
          var d = pixels.data, i;
          for (i = 0; i < d.length; i += 4) {
            d[i] = lookup[d[i]];
            d[i + 1] = lookup[d[i + 1]];
            d[i + 2] = lookup[d[i + 2]];
          }
          return pixels;
        }
        for (i = 0; i < lookup.length; i++) {
          lookup[i] = colorFn(i, value);
        }
        pixels = applyLookup(context.getImageData(0, 0, canvas.width, canvas.height), lookup);
        context.putImageData(pixels, 0, 0);
        return ImageResult.fromCanvas(canvas, type);
      };
      return function (ir, value) {
        return ir.toCanvas().then(function (canvas) {
          return filterImpl(canvas, ir.getType(), value);
        });
      };
    }
    function complexAdjustableColorFilter(matrixAdjustFn) {
      return function (ir, adjust) {
        return colorFilter(ir, matrixAdjustFn(ColorMatrix.identity(), adjust));
      };
    }
    function basicColorFilter(matrix) {
      return function (ir) {
        return colorFilter(ir, matrix);
      };
    }
    function basicConvolutionFilter(kernel) {
      return function (ir) {
        return convoluteFilter(ir, kernel);
      };
    }
    var Filters = {
      invert: basicColorFilter([
        -1,
        0,
        0,
        0,
        255,
        0,
        -1,
        0,
        0,
        255,
        0,
        0,
        -1,
        0,
        255,
        0,
        0,
        0,
        1,
        0
      ]),
      brightness: complexAdjustableColorFilter(ColorMatrix.adjustBrightness),
      hue: complexAdjustableColorFilter(ColorMatrix.adjustHue),
      saturate: complexAdjustableColorFilter(ColorMatrix.adjustSaturation),
      contrast: complexAdjustableColorFilter(ColorMatrix.adjustContrast),
      grayscale: complexAdjustableColorFilter(ColorMatrix.adjustGrayscale),
      sepia: complexAdjustableColorFilter(ColorMatrix.adjustSepia),
      colorize: function (ir, adjustR, adjustG, adjustB) {
        return colorFilter(ir, ColorMatrix.adjustColors(ColorMatrix.identity(), adjustR, adjustG, adjustB));
      },
      sharpen: basicConvolutionFilter([
        0,
        -1,
        0,
        -1,
        5,
        -1,
        0,
        -1,
        0
      ]),
      emboss: basicConvolutionFilter([
        -2,
        -1,
        0,
        -1,
        1,
        1,
        0,
        1,
        2
      ]),
      gamma: functionColorFilter(function (color, value) {
        return Math.pow(color / 255, 1 - value) * 255;
      }),
      exposure: functionColorFilter(function (color, value) {
        return 255 * (1 - Math.exp(-(color / 255) * value));
      }),
      colorFilter: colorFilter,
      convoluteFilter: convoluteFilter
    };

    function scale(image, dW, dH) {
      var sW = ImageSize.getWidth(image);
      var sH = ImageSize.getHeight(image);
      var wRatio = dW / sW;
      var hRatio = dH / sH;
      var scaleCapped = false;
      if (wRatio < 0.5 || wRatio > 2) {
        wRatio = wRatio < 0.5 ? 0.5 : 2;
        scaleCapped = true;
      }
      if (hRatio < 0.5 || hRatio > 2) {
        hRatio = hRatio < 0.5 ? 0.5 : 2;
        scaleCapped = true;
      }
      var scaled = _scale(image, wRatio, hRatio);
      return !scaleCapped ? scaled : scaled.then(function (tCanvas) {
        return scale(tCanvas, dW, dH);
      });
    }
    function _scale(image, wRatio, hRatio) {
      return new Promise$2(function (resolve) {
        var sW = ImageSize.getWidth(image);
        var sH = ImageSize.getHeight(image);
        var dW = Math.floor(sW * wRatio);
        var dH = Math.floor(sH * hRatio);
        var canvas = Canvas.create(dW, dH);
        var context = Canvas.get2dContext(canvas);
        context.drawImage(image, 0, 0, sW, sH, 0, 0, dW, dH);
        resolve(canvas);
      });
    }
    var ImageResizerCanvas = { scale: scale };

    function rotate(ir, angle) {
      return ir.toCanvas().then(function (canvas) {
        return applyRotate(canvas, ir.getType(), angle);
      });
    }
    function applyRotate(image, type, angle) {
      var canvas = Canvas.create(image.width, image.height);
      var context = Canvas.get2dContext(canvas);
      var translateX = 0, translateY = 0;
      angle = angle < 0 ? 360 + angle : angle;
      if (angle == 90 || angle == 270) {
        Canvas.resize(canvas, canvas.height, canvas.width);
      }
      if (angle == 90 || angle == 180) {
        translateX = canvas.width;
      }
      if (angle == 270 || angle == 180) {
        translateY = canvas.height;
      }
      context.translate(translateX, translateY);
      context.rotate(angle * Math.PI / 180);
      context.drawImage(image, 0, 0);
      return ImageResult.fromCanvas(canvas, type);
    }
    function flip(ir, axis) {
      return ir.toCanvas().then(function (canvas) {
        return applyFlip(canvas, ir.getType(), axis);
      });
    }
    function applyFlip(image, type, axis) {
      var canvas = Canvas.create(image.width, image.height);
      var context = Canvas.get2dContext(canvas);
      if (axis == 'v') {
        context.scale(1, -1);
        context.drawImage(image, 0, -canvas.height);
      } else {
        context.scale(-1, 1);
        context.drawImage(image, -canvas.width, 0);
      }
      return ImageResult.fromCanvas(canvas, type);
    }
    function crop(ir, x, y, w, h) {
      return ir.toCanvas().then(function (canvas) {
        return applyCrop(canvas, ir.getType(), x, y, w, h);
      });
    }
    function applyCrop(image, type, x, y, w, h) {
      var canvas = Canvas.create(w, h);
      var context = Canvas.get2dContext(canvas);
      context.drawImage(image, -x, -y);
      return ImageResult.fromCanvas(canvas, type);
    }
    function resize$1(ir, w, h) {
      return ir.toCanvas().then(function (canvas) {
        return ImageResizerCanvas.scale(canvas, w, h).then(function (newCanvas) {
          return ImageResult.fromCanvas(newCanvas, ir.getType());
        });
      });
    }
    var ImageTools = {
      rotate: rotate,
      flip: flip,
      crop: crop,
      resize: resize$1
    };

    var BinaryReader = function () {
      function BinaryReader(ar) {
        this.littleEndian = false;
        this._dv = new DataView(ar);
      }
      BinaryReader.prototype.readByteAt = function (idx) {
        return this._dv.getUint8(idx);
      };
      BinaryReader.prototype.read = function (idx, size) {
        if (idx + size > this.length()) {
          return null;
        }
        var mv = this.littleEndian ? 0 : -8 * (size - 1);
        for (var i = 0, sum = 0; i < size; i++) {
          sum |= this.readByteAt(idx + i) << Math.abs(mv + i * 8);
        }
        return sum;
      };
      BinaryReader.prototype.BYTE = function (idx) {
        return this.read(idx, 1);
      };
      BinaryReader.prototype.SHORT = function (idx) {
        return this.read(idx, 2);
      };
      BinaryReader.prototype.LONG = function (idx) {
        return this.read(idx, 4);
      };
      BinaryReader.prototype.SLONG = function (idx) {
        var num = this.read(idx, 4);
        return num > 2147483647 ? num - 4294967296 : num;
      };
      BinaryReader.prototype.CHAR = function (idx) {
        return String.fromCharCode(this.read(idx, 1));
      };
      BinaryReader.prototype.STRING = function (idx, count) {
        return this.asArray('CHAR', idx, count).join('');
      };
      BinaryReader.prototype.SEGMENT = function (idx, size) {
        var ar = this._dv.buffer;
        switch (arguments.length) {
        case 2:
          return ar.slice(idx, idx + size);
        case 1:
          return ar.slice(idx);
        default:
          return ar;
        }
      };
      BinaryReader.prototype.asArray = function (type, idx, count) {
        var values = [];
        for (var i = 0; i < count; i++) {
          values[i] = this[type](idx + i);
        }
        return values;
      };
      BinaryReader.prototype.length = function () {
        return this._dv ? this._dv.byteLength : 0;
      };
      return BinaryReader;
    }();

    var tags = {
      tiff: {
        274: 'Orientation',
        270: 'ImageDescription',
        271: 'Make',
        272: 'Model',
        305: 'Software',
        34665: 'ExifIFDPointer',
        34853: 'GPSInfoIFDPointer'
      },
      exif: {
        36864: 'ExifVersion',
        40961: 'ColorSpace',
        40962: 'PixelXDimension',
        40963: 'PixelYDimension',
        36867: 'DateTimeOriginal',
        33434: 'ExposureTime',
        33437: 'FNumber',
        34855: 'ISOSpeedRatings',
        37377: 'ShutterSpeedValue',
        37378: 'ApertureValue',
        37383: 'MeteringMode',
        37384: 'LightSource',
        37385: 'Flash',
        37386: 'FocalLength',
        41986: 'ExposureMode',
        41987: 'WhiteBalance',
        41990: 'SceneCaptureType',
        41988: 'DigitalZoomRatio',
        41992: 'Contrast',
        41993: 'Saturation',
        41994: 'Sharpness'
      },
      gps: {
        0: 'GPSVersionID',
        1: 'GPSLatitudeRef',
        2: 'GPSLatitude',
        3: 'GPSLongitudeRef',
        4: 'GPSLongitude'
      },
      thumb: {
        513: 'JPEGInterchangeFormat',
        514: 'JPEGInterchangeFormatLength'
      }
    };
    var tagDescs = {
      'ColorSpace': {
        1: 'sRGB',
        0: 'Uncalibrated'
      },
      'MeteringMode': {
        0: 'Unknown',
        1: 'Average',
        2: 'CenterWeightedAverage',
        3: 'Spot',
        4: 'MultiSpot',
        5: 'Pattern',
        6: 'Partial',
        255: 'Other'
      },
      'LightSource': {
        1: 'Daylight',
        2: 'Fliorescent',
        3: 'Tungsten',
        4: 'Flash',
        9: 'Fine weather',
        10: 'Cloudy weather',
        11: 'Shade',
        12: 'Daylight fluorescent (D 5700 - 7100K)',
        13: 'Day white fluorescent (N 4600 -5400K)',
        14: 'Cool white fluorescent (W 3900 - 4500K)',
        15: 'White fluorescent (WW 3200 - 3700K)',
        17: 'Standard light A',
        18: 'Standard light B',
        19: 'Standard light C',
        20: 'D55',
        21: 'D65',
        22: 'D75',
        23: 'D50',
        24: 'ISO studio tungsten',
        255: 'Other'
      },
      'Flash': {
        0: 'Flash did not fire',
        1: 'Flash fired',
        5: 'Strobe return light not detected',
        7: 'Strobe return light detected',
        9: 'Flash fired, compulsory flash mode',
        13: 'Flash fired, compulsory flash mode, return light not detected',
        15: 'Flash fired, compulsory flash mode, return light detected',
        16: 'Flash did not fire, compulsory flash mode',
        24: 'Flash did not fire, auto mode',
        25: 'Flash fired, auto mode',
        29: 'Flash fired, auto mode, return light not detected',
        31: 'Flash fired, auto mode, return light detected',
        32: 'No flash function',
        65: 'Flash fired, red-eye reduction mode',
        69: 'Flash fired, red-eye reduction mode, return light not detected',
        71: 'Flash fired, red-eye reduction mode, return light detected',
        73: 'Flash fired, compulsory flash mode, red-eye reduction mode',
        77: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',
        79: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',
        89: 'Flash fired, auto mode, red-eye reduction mode',
        93: 'Flash fired, auto mode, return light not detected, red-eye reduction mode',
        95: 'Flash fired, auto mode, return light detected, red-eye reduction mode'
      },
      'ExposureMode': {
        0: 'Auto exposure',
        1: 'Manual exposure',
        2: 'Auto bracket'
      },
      'WhiteBalance': {
        0: 'Auto white balance',
        1: 'Manual white balance'
      },
      'SceneCaptureType': {
        0: 'Standard',
        1: 'Landscape',
        2: 'Portrait',
        3: 'Night scene'
      },
      'Contrast': {
        0: 'Normal',
        1: 'Soft',
        2: 'Hard'
      },
      'Saturation': {
        0: 'Normal',
        1: 'Low saturation',
        2: 'High saturation'
      },
      'Sharpness': {
        0: 'Normal',
        1: 'Soft',
        2: 'Hard'
      },
      'GPSLatitudeRef': {
        N: 'North latitude',
        S: 'South latitude'
      },
      'GPSLongitudeRef': {
        E: 'East longitude',
        W: 'West longitude'
      }
    };
    var ExifReader = function () {
      function ExifReader(ar) {
        this._offsets = {
          tiffHeader: 10,
          IFD0: null,
          IFD1: null,
          exifIFD: null,
          gpsIFD: null
        };
        this._tiffTags = {};
        var self = this;
        self._reader = new BinaryReader(ar);
        self._idx = self._offsets.tiffHeader;
        if (self.SHORT(0) !== 65505 || self.STRING(4, 5).toUpperCase() !== 'EXIF\0') {
          throw new Error('Exif data cannot be read or not available.');
        }
        self._reader.littleEndian = self.SHORT(self._idx) == 18761;
        if (self.SHORT(self._idx += 2) !== 42) {
          throw new Error('Invalid Exif data.');
        }
        self._offsets.IFD0 = self._offsets.tiffHeader + self.LONG(self._idx += 2);
        self._tiffTags = self.extractTags(self._offsets.IFD0, tags.tiff);
        if ('ExifIFDPointer' in self._tiffTags) {
          self._offsets.exifIFD = self._offsets.tiffHeader + self._tiffTags.ExifIFDPointer;
          delete self._tiffTags.ExifIFDPointer;
        }
        if ('GPSInfoIFDPointer' in self._tiffTags) {
          self._offsets.gpsIFD = self._offsets.tiffHeader + self._tiffTags.GPSInfoIFDPointer;
          delete self._tiffTags.GPSInfoIFDPointer;
        }
        var IFD1Offset = self.LONG(self._offsets.IFD0 + self.SHORT(self._offsets.IFD0) * 12 + 2);
        if (IFD1Offset) {
          self._offsets.IFD1 = self._offsets.tiffHeader + IFD1Offset;
        }
      }
      ExifReader.prototype.BYTE = function (idx) {
        return this._reader.BYTE(idx);
      };
      ExifReader.prototype.SHORT = function (idx) {
        return this._reader.SHORT(idx);
      };
      ExifReader.prototype.LONG = function (idx) {
        return this._reader.LONG(idx);
      };
      ExifReader.prototype.SLONG = function (idx) {
        return this._reader.SLONG(idx);
      };
      ExifReader.prototype.CHAR = function (idx) {
        return this._reader.CHAR(idx);
      };
      ExifReader.prototype.STRING = function (idx, count) {
        return this._reader.STRING(idx, count);
      };
      ExifReader.prototype.SEGMENT = function (idx, size) {
        return this._reader.SEGMENT(idx, size);
      };
      ExifReader.prototype.asArray = function (type, idx, count) {
        var values = [];
        for (var i = 0; i < count; i++) {
          values[i] = this[type](idx + i);
        }
        return values;
      };
      ExifReader.prototype.length = function () {
        return this._reader.length();
      };
      ExifReader.prototype.UNDEFINED = function () {
        return this.BYTE.apply(this, arguments);
      };
      ExifReader.prototype.RATIONAL = function (idx) {
        return this.LONG(idx) / this.LONG(idx + 4);
      };
      ExifReader.prototype.SRATIONAL = function (idx) {
        return this.SLONG(idx) / this.SLONG(idx + 4);
      };
      ExifReader.prototype.ASCII = function (idx) {
        return this.CHAR(idx);
      };
      ExifReader.prototype.TIFF = function () {
        return this._tiffTags;
      };
      ExifReader.prototype.EXIF = function () {
        var self = this;
        var Exif = null;
        if (self._offsets.exifIFD) {
          try {
            Exif = self.extractTags(self._offsets.exifIFD, tags.exif);
          } catch (ex) {
            return null;
          }
          if (Exif.ExifVersion && Array.isArray(Exif.ExifVersion)) {
            for (var i = 0, exifVersion = ''; i < Exif.ExifVersion.length; i++) {
              exifVersion += String.fromCharCode(Exif.ExifVersion[i]);
            }
            Exif.ExifVersion = exifVersion;
          }
        }
        return Exif;
      };
      ExifReader.prototype.GPS = function () {
        var self = this;
        var GPS = null;
        if (self._offsets.gpsIFD) {
          try {
            GPS = self.extractTags(self._offsets.gpsIFD, tags.gps);
          } catch (ex) {
            return null;
          }
          if (GPS.GPSVersionID && Array.isArray(GPS.GPSVersionID)) {
            GPS.GPSVersionID = GPS.GPSVersionID.join('.');
          }
        }
        return GPS;
      };
      ExifReader.prototype.thumb = function () {
        var self = this;
        if (self._offsets.IFD1) {
          try {
            var IFD1Tags = self.extractTags(self._offsets.IFD1, tags.thumb);
            if ('JPEGInterchangeFormat' in IFD1Tags) {
              return self.SEGMENT(self._offsets.tiffHeader + IFD1Tags.JPEGInterchangeFormat, IFD1Tags.JPEGInterchangeFormatLength);
            }
          } catch (ex) {
          }
        }
        return null;
      };
      ExifReader.prototype.extractTags = function (IFD_offset, tags2extract) {
        var self = this;
        var length, i, tag, type, count, size, offset, value, values = [], hash = {};
        var types = {
          1: 'BYTE',
          7: 'UNDEFINED',
          2: 'ASCII',
          3: 'SHORT',
          4: 'LONG',
          5: 'RATIONAL',
          9: 'SLONG',
          10: 'SRATIONAL'
        };
        var sizes = {
          'BYTE': 1,
          'UNDEFINED': 1,
          'ASCII': 1,
          'SHORT': 2,
          'LONG': 4,
          'RATIONAL': 8,
          'SLONG': 4,
          'SRATIONAL': 8
        };
        length = self.SHORT(IFD_offset);
        for (i = 0; i < length; i++) {
          values = [];
          offset = IFD_offset + 2 + i * 12;
          tag = tags2extract[self.SHORT(offset)];
          if (tag === undefined) {
            continue;
          }
          type = types[self.SHORT(offset += 2)];
          count = self.LONG(offset += 2);
          size = sizes[type];
          if (!size) {
            throw new Error('Invalid Exif data.');
          }
          offset += 4;
          if (size * count > 4) {
            offset = self.LONG(offset) + self._offsets.tiffHeader;
          }
          if (offset + size * count >= self.length()) {
            throw new Error('Invalid Exif data.');
          }
          if (type === 'ASCII') {
            hash[tag] = self.STRING(offset, count).replace(/\0$/, '').trim();
            continue;
          } else {
            values = self.asArray(type, offset, count);
            value = count == 1 ? values[0] : values;
            if (tagDescs.hasOwnProperty(tag) && typeof value != 'object') {
              hash[tag] = tagDescs[tag][value];
            } else {
              hash[tag] = value;
            }
          }
        }
        return hash;
      };
      return ExifReader;
    }();

    var extractFrom = function (blob) {
      return Conversions.blobToArrayBuffer(blob).then(function (ar) {
        try {
          var br = new BinaryReader(ar);
          if (br.SHORT(0) === 65496) {
            var headers = extractHeaders(br);
            var app1 = headers.filter(function (header) {
              return header.name === 'APP1';
            });
            var meta = {};
            if (app1.length) {
              var exifReader = new ExifReader(app1[0].segment);
              meta = {
                tiff: exifReader.TIFF(),
                exif: exifReader.EXIF(),
                gps: exifReader.GPS(),
                thumb: exifReader.thumb()
              };
            } else {
              return Promise$2.reject('Headers did not include required information');
            }
            meta.rawHeaders = headers;
            return meta;
          }
          return Promise$2.reject('Image was not a jpeg');
        } catch (ex) {
          return Promise$2.reject('Unsupported format or not an image: ' + blob.type + ' (Exception: ' + ex.message + ')');
        }
      });
    };
    var extractHeaders = function (br) {
      var headers = [], idx, marker, length = 0;
      idx = 2;
      while (idx <= br.length()) {
        marker = br.SHORT(idx);
        if (marker >= 65488 && marker <= 65495) {
          idx += 2;
          continue;
        }
        if (marker === 65498 || marker === 65497) {
          break;
        }
        length = br.SHORT(idx + 2) + 2;
        if (marker >= 65505 && marker <= 65519) {
          headers.push({
            hex: marker,
            name: 'APP' + (marker & 15),
            start: idx,
            length: length,
            segment: br.SEGMENT(idx, length)
          });
        }
        idx += length;
      }
      return headers;
    };
    var JPEGMeta = { extractFrom: extractFrom };

    var invert = function (ir) {
      return Filters.invert(ir);
    };
    var sharpen = function (ir) {
      return Filters.sharpen(ir);
    };
    var emboss = function (ir) {
      return Filters.emboss(ir);
    };
    var gamma = function (ir, value) {
      return Filters.gamma(ir, value);
    };
    var exposure = function (ir, value) {
      return Filters.exposure(ir, value);
    };
    var colorize = function (ir, adjustR, adjustG, adjustB) {
      return Filters.colorize(ir, adjustR, adjustG, adjustB);
    };
    var brightness = function (ir, adjust) {
      return Filters.brightness(ir, adjust);
    };
    var hue = function (ir, adjust) {
      return Filters.hue(ir, adjust);
    };
    var saturate = function (ir, adjust) {
      return Filters.saturate(ir, adjust);
    };
    var contrast = function (ir, adjust) {
      return Filters.contrast(ir, adjust);
    };
    var grayscale = function (ir, adjust) {
      return Filters.grayscale(ir, adjust);
    };
    var sepia = function (ir, adjust) {
      return Filters.sepia(ir, adjust);
    };
    var flip$1 = function (ir, axis) {
      return ImageTools.flip(ir, axis);
    };
    var crop$1 = function (ir, x, y, w, h) {
      return ImageTools.crop(ir, x, y, w, h);
    };
    var resize$2 = function (ir, w, h) {
      return ImageTools.resize(ir, w, h);
    };
    var rotate$1 = function (ir, angle) {
      return ImageTools.rotate(ir, angle);
    };
    var exifRotate = function (ir) {
      var ROTATE_90 = 6;
      var ROTATE_180 = 3;
      var ROTATE_270 = 8;
      var checkRotation = function (data) {
        var orientation = data.tiff.Orientation;
        switch (orientation) {
        case ROTATE_90:
          return rotate$1(ir, 90);
        case ROTATE_180:
          return rotate$1(ir, 180);
        case ROTATE_270:
          return rotate$1(ir, 270);
        default:
          return ir;
        }
      };
      var notJpeg = function () {
        return ir;
      };
      return ir.toBlob().then(JPEGMeta.extractFrom).then(checkRotation, notJpeg);
    };
    var ImageTransformations = {
      invert: invert,
      sharpen: sharpen,
      emboss: emboss,
      brightness: brightness,
      hue: hue,
      saturate: saturate,
      contrast: contrast,
      grayscale: grayscale,
      sepia: sepia,
      colorize: colorize,
      gamma: gamma,
      exposure: exposure,
      flip: flip$1,
      crop: crop$1,
      resize: resize$2,
      rotate: rotate$1,
      exifRotate: exifRotate
    };

    var renderIcon$1 = function (iconHtml) {
      return {
        dom: {
          tag: 'span',
          innerHtml: iconHtml,
          classes: [
            'tox-icon',
            'tox-tbtn__icon-wrap'
          ]
        }
      };
    };
    var renderIconFromPack = function (iconName, iconsProvider) {
      return renderIcon$1(get$e(iconName, iconsProvider));
    };
    var renderLabel$1 = function (text, prefix, providersBackstage) {
      return {
        dom: {
          tag: 'span',
          innerHtml: providersBackstage.translate(text),
          classes: [prefix + '__select-label']
        },
        behaviours: derive$1([Replacing.config({})])
      };
    };

    var renderCommon = function (spec, action, extraBehaviours, dom, components) {
      if (extraBehaviours === void 0) {
        extraBehaviours = [];
      }
      var common = {
        buttonBehaviours: derive$1([
          DisablingConfigs.button(spec.disabled),
          Tabstopping.config({}),
          config('button press', [
            preventDefault('click'),
            preventDefault('mousedown')
          ])
        ].concat(extraBehaviours)),
        eventOrder: {
          click: [
            'button press',
            'alloy.base.behaviour'
          ],
          mousedown: [
            'button press',
            'alloy.base.behaviour'
          ]
        },
        action: action
      };
      var domFinal = deepMerge(common, { dom: dom });
      var specFinal = deepMerge(domFinal, { components: components });
      return Button.sketch(specFinal);
    };
    var renderIconButton = function (spec, action, providersBackstage, extraBehaviours) {
      if (extraBehaviours === void 0) {
        extraBehaviours = [];
      }
      var tooltipAttributes = spec.tooltip.map(function (tooltip) {
        return {
          'aria-label': providersBackstage.translate(tooltip),
          'title': providersBackstage.translate(tooltip)
        };
      }).getOr({});
      var dom = {
        tag: 'button',
        classes: ['tox-tbtn'],
        attributes: tooltipAttributes
      };
      var icon = spec.icon.map(function (iconName) {
        return renderIconFromPack(iconName, providersBackstage.icons);
      });
      var components = componentRenderPipeline([icon]);
      return renderCommon(spec, action, extraBehaviours, dom, components);
    };
    var renderButton = function (spec, action, providersBackstage, extraBehaviours) {
      if (extraBehaviours === void 0) {
        extraBehaviours = [];
      }
      var translatedText = providersBackstage.translate(spec.text);
      var icon = spec.icon ? spec.icon.map(function (iconName) {
        return renderIconFromPack(iconName, providersBackstage.icons);
      }) : Option.none();
      var components = icon.isSome() ? componentRenderPipeline([icon]) : [];
      var innerHtml = icon.isSome() ? {} : { innerHtml: translatedText };
      var classes = (spec.primary ? ['tox-button'] : [
        'tox-button',
        'tox-button--secondary'
      ]).concat(icon.isSome() ? ['tox-button--icon'] : []);
      var dom = __assign({
        tag: 'button',
        classes: classes
      }, innerHtml, { attributes: { title: translatedText } });
      return renderCommon(spec, action, extraBehaviours, dom, components);
    };
    var getAction = function (name, buttonType) {
      return function (comp) {
        if (buttonType === 'custom') {
          emitWith(comp, formActionEvent, {
            name: name,
            value: {}
          });
        } else if (buttonType === 'submit') {
          emit(comp, formSubmitEvent);
        } else if (buttonType === 'cancel') {
          emit(comp, formCancelEvent);
        } else {
          console.error('Unknown button type: ', buttonType);
        }
      };
    };
    var renderFooterButton = function (spec, buttonType, providersBackstage) {
      var action = getAction(spec.name, buttonType);
      return renderButton(spec, action, providersBackstage, []);
    };
    var renderDialogButton = function (spec, providersBackstage) {
      var action = getAction(spec.name, 'custom');
      return renderButton(spec, action, providersBackstage, [
        RepresentingConfigs.memory(''),
        ComposingConfigs.self()
      ]);
    };

    var schema$i = constant([
      defaulted$1('field1Name', 'field1'),
      defaulted$1('field2Name', 'field2'),
      onStrictHandler('onLockedChange'),
      markers(['lockClass']),
      defaulted$1('locked', false),
      SketchBehaviours.field('coupledFieldBehaviours', [
        Composing,
        Representing
      ])
    ]);
    var getField = function (comp, detail, partName) {
      return getPart(comp, detail, partName).bind(Composing.getCurrent);
    };
    var coupledPart = function (selfName, otherName) {
      return required({
        factory: FormField,
        name: selfName,
        overrides: function (detail) {
          return {
            fieldBehaviours: derive$1([config('coupled-input-behaviour', [run(input(), function (me) {
                  getField(me, detail, otherName).each(function (other) {
                    getPart(me, detail, 'lock').each(function (lock) {
                      if (Toggling.isOn(lock)) {
                        detail.onLockedChange(me, other, lock);
                      }
                    });
                  });
                })])])
          };
        }
      });
    };
    var parts$6 = constant([
      coupledPart('field1', 'field2'),
      coupledPart('field2', 'field1'),
      required({
        factory: Button,
        schema: [strict$1('dom')],
        name: 'lock',
        overrides: function (detail) {
          return {
            buttonBehaviours: derive$1([Toggling.config({
                selected: detail.locked,
                toggleClass: detail.markers.lockClass,
                aria: { mode: 'pressed' }
              })])
          };
        }
      })
    ]);

    var factory$7 = function (detail, components$$1, spec, externals) {
      return {
        uid: detail.uid,
        dom: detail.dom,
        components: components$$1,
        behaviours: SketchBehaviours.augment(detail.coupledFieldBehaviours, [
          Composing.config({ find: Option.some }),
          Representing.config({
            store: {
              mode: 'manual',
              getValue: function (comp) {
                var _a;
                var parts = getPartsOrDie(comp, detail, [
                  'field1',
                  'field2'
                ]);
                return _a = {}, _a[detail.field1Name] = Representing.getValue(parts.field1()), _a[detail.field2Name] = Representing.getValue(parts.field2()), _a;
              },
              setValue: function (comp, value) {
                var parts = getPartsOrDie(comp, detail, [
                  'field1',
                  'field2'
                ]);
                if (hasKey$1(value, detail.field1Name)) {
                  Representing.setValue(parts.field1(), value[detail.field1Name]);
                }
                if (hasKey$1(value, detail.field2Name)) {
                  Representing.setValue(parts.field2(), value[detail.field2Name]);
                }
              }
            }
          })
        ]),
        apis: {
          getField1: function (component) {
            return getPart(component, detail, 'field1');
          },
          getField2: function (component) {
            return getPart(component, detail, 'field2');
          },
          getLock: function (component) {
            return getPart(component, detail, 'lock');
          }
        }
      };
    };
    var FormCoupledInputs = composite$1({
      name: 'FormCoupledInputs',
      configFields: schema$i(),
      partFields: parts$6(),
      factory: factory$7,
      apis: {
        getField1: function (apis, component) {
          return apis.getField1(component);
        },
        getField2: function (apis, component) {
          return apis.getField2(component);
        },
        getLock: function (apis, component) {
          return apis.getLock(component);
        }
      }
    });

    var formatSize = function (size) {
      var unitDec = {
        '': 0,
        'px': 0,
        'pt': 1,
        'mm': 1,
        'pc': 2,
        'ex': 2,
        'em': 2,
        'ch': 2,
        'rem': 2,
        'cm': 3,
        'in': 4,
        '%': 4
      };
      var maxDecimal = function (unit) {
        return unit in unitDec ? unitDec[unit] : 1;
      };
      var numText = size.value.toFixed(maxDecimal(size.unit));
      if (numText.indexOf('.') !== -1) {
        numText = numText.replace(/\.?0*$/, '');
      }
      return numText + size.unit;
    };
    var parseSize = function (sizeText) {
      var numPattern = /^\s*(\d+(?:\.\d+)?)\s*(|cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)\s*$/;
      var match = numPattern.exec(sizeText);
      if (match !== null) {
        var value = parseFloat(match[1]);
        var unit = match[2];
        return Result.value({
          value: value,
          unit: unit
        });
      } else {
        return Result.error(sizeText);
      }
    };
    var convertUnit = function (size, unit) {
      var inInch = {
        '': 96,
        'px': 96,
        'pt': 72,
        'cm': 2.54,
        'pc': 12,
        'mm': 25.4,
        'in': 1
      };
      var supported = function (u) {
        return Object.prototype.hasOwnProperty.call(inInch, u);
      };
      if (size.unit === unit) {
        return Option.some(size.value);
      } else if (supported(size.unit) && supported(unit)) {
        if (inInch[size.unit] === inInch[unit]) {
          return Option.some(size.value);
        } else {
          return Option.some(size.value / inInch[size.unit] * inInch[unit]);
        }
      } else {
        return Option.none();
      }
    };
    var noSizeConversion = function (input) {
      return Option.none();
    };
    var ratioSizeConversion = function (scale, unit) {
      return function (size) {
        return convertUnit(size, unit).map(function (value) {
          return {
            value: value * scale,
            unit: unit
          };
        });
      };
    };
    var makeRatioConverter = function (currentFieldText, otherFieldText) {
      var cValue = parseSize(currentFieldText).toOption();
      var oValue = parseSize(otherFieldText).toOption();
      return liftN([
        cValue,
        oValue
      ], function (cSize, oSize) {
        return convertUnit(cSize, oSize.unit).map(function (val) {
          return oSize.value / val;
        }).map(function (r) {
          return ratioSizeConversion(r, oSize.unit);
        }).getOr(noSizeConversion);
      }).getOr(noSizeConversion);
    };

    var renderSizeInput = function (spec, providersBackstage) {
      var converter = noSizeConversion;
      var ratioEvent = generate$1('ratio-event');
      var pLock = FormCoupledInputs.parts().lock({
        dom: {
          tag: 'button',
          classes: [
            'tox-lock',
            'tox-button',
            'tox-button--naked',
            'tox-button--icon'
          ],
          attributes: { title: providersBackstage.translate(spec.label.getOr('Constrain proportions')) }
        },
        components: [
          {
            dom: {
              tag: 'span',
              classes: [
                'tox-icon',
                'tox-lock-icon__lock'
              ],
              innerHtml: get$e('lock', providersBackstage.icons)
            }
          },
          {
            dom: {
              tag: 'span',
              classes: [
                'tox-icon',
                'tox-lock-icon__unlock'
              ],
              innerHtml: get$e('unlock', providersBackstage.icons)
            }
          }
        ],
        buttonBehaviours: derive$1([Tabstopping.config({})])
      });
      var formGroup = function (components) {
        return {
          dom: {
            tag: 'div',
            classes: ['tox-form__group']
          },
          components: components
        };
      };
      var getFieldPart = function (isField1) {
        return FormField.parts().field({
          factory: Input,
          inputClasses: ['tox-textfield'],
          inputBehaviours: derive$1([
            Tabstopping.config({}),
            config('size-input-events', [
              run(focusin(), function (component, simulatedEvent) {
                emitWith(component, ratioEvent, { isField1: isField1 });
              }),
              run(change(), function (component, simulatedEvent) {
                emitWith(component, formChangeEvent, { name: spec.name });
              })
            ])
          ]),
          selectOnFocus: false
        });
      };
      var getLabelPart = function (label) {
        return FormField.parts().label({
          dom: {
            tag: 'label',
            classes: ['tox-label'],
            innerHtml: providersBackstage.translate(label)
          }
        });
      };
      var widthField = FormCoupledInputs.parts().field1(formGroup([
        getLabelPart('Width'),
        getFieldPart(true)
      ]));
      var hStack = function (components) {
        return {
          dom: {
            tag: 'div',
            classes: ['tox-form__controls-h-stack']
          },
          components: components
        };
      };
      var heightField = FormCoupledInputs.parts().field2(formGroup([
        getLabelPart('Height'),
        hStack([
          getFieldPart(false),
          pLock
        ])
      ]));
      return FormCoupledInputs.sketch({
        dom: {
          tag: 'div',
          classes: ['tox-form__group']
        },
        components: [hStack([
            widthField,
            heightField
          ])],
        field1Name: 'width',
        field2Name: 'height',
        locked: true,
        markers: { lockClass: 'tox-locked' },
        onLockedChange: function (current, other, lock) {
          parseSize(Representing.getValue(current)).each(function (size) {
            converter(size).each(function (newSize) {
              Representing.setValue(other, formatSize(newSize));
            });
          });
        },
        coupledFieldBehaviours: derive$1([config('size-input-events2', [run(ratioEvent, function (component, simulatedEvent) {
              var isField1 = simulatedEvent.event().isField1();
              var optCurrent = isField1 ? FormCoupledInputs.getField1(component) : FormCoupledInputs.getField2(component);
              var optOther = isField1 ? FormCoupledInputs.getField2(component) : FormCoupledInputs.getField1(component);
              var value1 = optCurrent.map(Representing.getValue).getOr('');
              var value2 = optOther.map(Representing.getValue).getOr('');
              converter = makeRatioConverter(value1, value2);
            })])])
      });
    };

    var undo = constant(generate$1('undo'));
    var redo = constant(generate$1('redo'));
    var zoom = constant(generate$1('zoom'));
    var back = constant(generate$1('back'));
    var apply$1 = constant(generate$1('apply'));
    var swap = constant(generate$1('swap'));
    var transform = constant(generate$1('transform'));
    var tempTransform = constant(generate$1('temp-transform'));
    var transformApply = constant(generate$1('transform-apply'));
    var internal = {
      undo: undo,
      redo: redo,
      zoom: zoom,
      back: back,
      apply: apply$1,
      swap: swap,
      transform: transform,
      tempTransform: tempTransform,
      transformApply: transformApply
    };
    var saveState = constant('save-state');
    var disable$1 = constant('disable');
    var enable$1 = constant('enable');
    var external$2 = {
      formActionEvent: formActionEvent,
      saveState: saveState,
      disable: disable$1,
      enable: enable$1
    };

    var renderEditPanel = function (imagePanel, providersBackstage) {
      var createButton = function (text, action, disabled, primary) {
        return renderButton({
          name: text,
          text: text,
          disabled: disabled,
          primary: primary
        }, action, providersBackstage);
      };
      var createIconButton = function (icon, tooltip, action, disabled) {
        return renderIconButton({
          name: icon,
          icon: Option.some(icon),
          tooltip: Option.some(tooltip),
          disabled: disabled
        }, action, providersBackstage);
      };
      var panelDom = {
        tag: 'div',
        classes: [
          'tox-image-tools__toolbar',
          'tox-image-tools-edit-panel'
        ]
      };
      var none = Option.none();
      var noop$$1 = noop;
      var emit$$1 = function (comp, event, data) {
        emitWith(comp, event, data);
      };
      var emitTransform = function (comp, transform) {
        emit$$1(comp, internal.transform(), { transform: transform });
      };
      var emitTempTransform = function (comp, transform) {
        emit$$1(comp, internal.tempTransform(), { transform: transform });
      };
      var getBackSwap = function (anyInSystem) {
        return function () {
          memContainer.getOpt(anyInSystem).each(function (container) {
            Replacing.set(container, [ButtonPanel]);
          });
        };
      };
      var emitTransformApply = function (comp, transform) {
        emit$$1(comp, internal.transformApply(), {
          transform: transform,
          swap: getBackSwap(comp)
        });
      };
      var createBackButton = function () {
        return createButton('Back', function (button) {
          return emit$$1(button, internal.back(), { swap: getBackSwap(button) });
        }, false, false);
      };
      var createSpacer = function () {
        return {
          dom: {
            tag: 'div',
            classes: ['tox-spacer']
          }
        };
      };
      var createApplyButton = function () {
        return createButton('Apply', function (button) {
          return emit$$1(button, internal.apply(), { swap: getBackSwap(button) });
        }, true, true);
      };
      var makeCropTransform = function () {
        return function (ir) {
          var rect = imagePanel.getRect();
          return ImageTransformations.crop(ir, rect.x, rect.y, rect.w, rect.h);
        };
      };
      var CropPanel = Container.sketch({
        dom: panelDom,
        components: [
          createBackButton(),
          createSpacer(),
          createButton('Apply', function (button) {
            var transform = makeCropTransform();
            emitTransformApply(button, transform);
            imagePanel.hideCrop();
          }, false, true)
        ]
      });
      var memSize = record(renderSizeInput({
        name: 'size',
        label: none,
        type: 'sizeinput',
        constrain: true
      }, providersBackstage));
      var makeResizeTransform = function (width, height) {
        return function (ir) {
          return ImageTransformations.resize(ir, width, height);
        };
      };
      var ResizePanel = Container.sketch({
        dom: panelDom,
        components: [
          createBackButton(),
          createSpacer(),
          memSize.asSpec(),
          createSpacer(),
          createButton('Apply', function (button) {
            memSize.getOpt(button).each(function (sizeInput) {
              var value = Representing.getValue(sizeInput);
              var width = parseInt(value.width, 10);
              var height = parseInt(value.height, 10);
              var transform = makeResizeTransform(width, height);
              emitTransformApply(button, transform);
            });
          }, false, true)
        ]
      });
      var makeValueTransform = function (transform, value) {
        return function (ir) {
          return transform(ir, value);
        };
      };
      var horizontalFlip = makeValueTransform(ImageTransformations.flip, 'h');
      var verticalFlip = makeValueTransform(ImageTransformations.flip, 'v');
      var counterclockwiseRotate = makeValueTransform(ImageTransformations.rotate, -90);
      var clockwiseRotate = makeValueTransform(ImageTransformations.rotate, 90);
      var FlipRotatePanel = Container.sketch({
        dom: panelDom,
        components: [
          createBackButton(),
          createSpacer(),
          createIconButton('flip-horizontally', 'Flip horizontally', function (button) {
            emitTempTransform(button, horizontalFlip);
          }, false),
          createIconButton('flip-vertically', 'Flip vertically', function (button) {
            emitTempTransform(button, verticalFlip);
          }, false),
          createIconButton('rotate-left', 'Rotate counterclockwise', function (button) {
            emitTempTransform(button, counterclockwiseRotate);
          }, false),
          createIconButton('rotate-right', 'Rotate clockwise', function (button) {
            emitTempTransform(button, clockwiseRotate);
          }, false),
          createSpacer(),
          createApplyButton()
        ]
      });
      var makeSlider = function (label, onChoose, min, value, max) {
        var labelPart = Slider.parts().label({
          dom: {
            tag: 'label',
            innerHtml: providersBackstage.translate(label)
          }
        });
        var spectrum = Slider.parts().spectrum({
          dom: {
            tag: 'div',
            classes: ['tox-slider__rail'],
            attributes: { role: 'presentation' }
          }
        });
        var thumb = Slider.parts().thumb({
          dom: {
            tag: 'div',
            classes: ['tox-slider__handle'],
            attributes: { role: 'presentation' }
          }
        });
        return Slider.sketch({
          dom: {
            tag: 'div',
            classes: ['tox-slider'],
            attributes: { role: 'presentation' }
          },
          model: {
            mode: 'x',
            minX: min,
            maxX: max,
            getInitialValue: constant({ x: constant(value) })
          },
          components: [
            labelPart,
            spectrum,
            thumb
          ],
          sliderBehaviours: derive$1([Focusing.config({})]),
          onChoose: onChoose
        });
      };
      var makeVariableSlider = function (label, transform, min, value, max) {
        var onChoose = function (slider, thumb, value) {
          var valTransform = makeValueTransform(transform, value.x() / 100);
          emitTransform(slider, valTransform);
        };
        return makeSlider(label, onChoose, min, value, max);
      };
      var createVariableFilterPanel = function (label, transform, min, value, max) {
        return Container.sketch({
          dom: panelDom,
          components: [
            createBackButton(),
            makeVariableSlider(label, transform, min, value, max),
            createApplyButton()
          ]
        });
      };
      var FilterPanel = Container.sketch({
        dom: panelDom,
        components: [
          createBackButton(),
          createSpacer(),
          createApplyButton()
        ]
      });
      var BrightnessPanel = createVariableFilterPanel('Brightness', ImageTransformations.brightness, -100, 0, 100);
      var ContrastPanel = createVariableFilterPanel('Contrast', ImageTransformations.contrast, -100, 0, 100);
      var GammaPanel = createVariableFilterPanel('Gamma', ImageTransformations.gamma, -100, 0, 100);
      var makeColorTransform = function (red, green, blue) {
        return function (ir) {
          return ImageTransformations.colorize(ir, red, green, blue);
        };
      };
      var makeColorSlider = function (label) {
        var onChoose = function (slider, thumb, value) {
          var redOpt = memRed.getOpt(slider);
          var blueOpt = memBlue.getOpt(slider);
          var greenOpt = memGreen.getOpt(slider);
          redOpt.each(function (red) {
            blueOpt.each(function (blue) {
              greenOpt.each(function (green) {
                var r = Representing.getValue(red).x() / 100;
                var g = Representing.getValue(green).x() / 100;
                var b = Representing.getValue(blue).x() / 100;
                var transform = makeColorTransform(r, g, b);
                emitTransform(slider, transform);
              });
            });
          });
        };
        return makeSlider(label, onChoose, 0, 100, 200);
      };
      var memRed = record(makeColorSlider('R'));
      var memGreen = record(makeColorSlider('G'));
      var memBlue = record(makeColorSlider('B'));
      var ColorizePanel = Container.sketch({
        dom: panelDom,
        components: [
          createBackButton(),
          memRed.asSpec(),
          memGreen.asSpec(),
          memBlue.asSpec(),
          createApplyButton()
        ]
      });
      var getTransformPanelEvent = function (panel, transform, update) {
        return function (button) {
          var swap = function () {
            memContainer.getOpt(button).each(function (container) {
              Replacing.set(container, [panel]);
              update(container);
            });
          };
          emit$$1(button, internal.swap(), {
            transform: transform,
            swap: swap
          });
        };
      };
      var cropPanelUpdate = function (_anyInSystem) {
        imagePanel.showCrop();
      };
      var resizePanelUpdate = function (anyInSystem) {
        memSize.getOpt(anyInSystem).each(function (sizeInput) {
          var measurements = imagePanel.getMeasurements();
          var width = measurements.width;
          var height = measurements.height;
          Representing.setValue(sizeInput, {
            width: width,
            height: height
          });
        });
      };
      var sharpenTransform = Option.some(ImageTransformations.sharpen);
      var invertTransform = Option.some(ImageTransformations.invert);
      var ButtonPanel = Container.sketch({
        dom: panelDom,
        components: [
          createIconButton('crop', 'Crop', getTransformPanelEvent(CropPanel, none, cropPanelUpdate), false),
          createIconButton('resize', 'Resize', getTransformPanelEvent(ResizePanel, none, resizePanelUpdate), false),
          createIconButton('orientation', 'Orientation', getTransformPanelEvent(FlipRotatePanel, none, noop$$1), false),
          createIconButton('brightness', 'Brightness', getTransformPanelEvent(BrightnessPanel, none, noop$$1), false),
          createIconButton('sharpen', 'Sharpen', getTransformPanelEvent(FilterPanel, sharpenTransform, noop$$1), false),
          createIconButton('contrast', 'Contrast', getTransformPanelEvent(ContrastPanel, none, noop$$1), false),
          createIconButton('color-levels', 'Color levels', getTransformPanelEvent(ColorizePanel, none, noop$$1), false),
          createIconButton('gamma', 'Gamma', getTransformPanelEvent(GammaPanel, none, noop$$1), false),
          createIconButton('invert', 'Invert', getTransformPanelEvent(FilterPanel, invertTransform, noop$$1), false)
        ]
      });
      var container = Container.sketch({
        dom: { tag: 'div' },
        components: [ButtonPanel],
        containerBehaviours: derive$1([Replacing.config({})])
      });
      var memContainer = record(container);
      var getApplyButton = function (anyInSystem) {
        return memContainer.getOpt(anyInSystem).map(function (container) {
          var panel = container.components()[0];
          return panel.components()[panel.components().length - 1];
        });
      };
      return {
        memContainer: memContainer,
        getApplyButton: getApplyButton
      };
    };

    var global$7 = tinymce.util.Tools.resolve('tinymce.dom.DomQuery');

    var global$8 = tinymce.util.Tools.resolve('tinymce.geom.Rect');

    var global$9 = tinymce.util.Tools.resolve('tinymce.util.Observable');

    var global$a = tinymce.util.Tools.resolve('tinymce.util.Tools');

    var global$b = tinymce.util.Tools.resolve('tinymce.util.VK');

    function getDocumentSize(doc) {
      var documentElement, body, scrollWidth, clientWidth;
      var offsetWidth, scrollHeight, clientHeight, offsetHeight;
      var max = Math.max;
      documentElement = doc.documentElement;
      body = doc.body;
      scrollWidth = max(documentElement.scrollWidth, body.scrollWidth);
      clientWidth = max(documentElement.clientWidth, body.clientWidth);
      offsetWidth = max(documentElement.offsetWidth, body.offsetWidth);
      scrollHeight = max(documentElement.scrollHeight, body.scrollHeight);
      clientHeight = max(documentElement.clientHeight, body.clientHeight);
      offsetHeight = max(documentElement.offsetHeight, body.offsetHeight);
      return {
        width: scrollWidth < offsetWidth ? clientWidth : scrollWidth,
        height: scrollHeight < offsetHeight ? clientHeight : scrollHeight
      };
    }
    function updateWithTouchData(e) {
      var keys, i;
      if (e.changedTouches) {
        keys = 'screenX screenY pageX pageY clientX clientY'.split(' ');
        for (i = 0; i < keys.length; i++) {
          e[keys[i]] = e.changedTouches[0][keys[i]];
        }
      }
    }
    function DragHelper (id, settings) {
      var $eventOverlay;
      var doc = settings.document || document;
      var downButton;
      var start, stop$$1, drag, startX, startY;
      settings = settings || {};
      var handleElement = doc.getElementById(settings.handle || id);
      start = function (e) {
        var docSize = getDocumentSize(doc);
        var handleElm, cursor;
        updateWithTouchData(e);
        e.preventDefault();
        downButton = e.button;
        handleElm = handleElement;
        startX = e.screenX;
        startY = e.screenY;
        if (window.getComputedStyle) {
          cursor = window.getComputedStyle(handleElm, null).getPropertyValue('cursor');
        } else {
          cursor = handleElm.runtimeStyle.cursor;
        }
        $eventOverlay = global$7('<div></div>').css({
          position: 'absolute',
          top: 0,
          left: 0,
          width: docSize.width,
          height: docSize.height,
          zIndex: 2147483647,
          opacity: 0.0001,
          cursor: cursor
        }).appendTo(doc.body);
        global$7(doc).on('mousemove touchmove', drag).on('mouseup touchend', stop$$1);
        settings.start(e);
      };
      drag = function (e) {
        updateWithTouchData(e);
        if (e.button !== downButton) {
          return stop$$1(e);
        }
        e.deltaX = e.screenX - startX;
        e.deltaY = e.screenY - startY;
        e.preventDefault();
        settings.drag(e);
      };
      stop$$1 = function (e) {
        updateWithTouchData(e);
        global$7(doc).off('mousemove touchmove', drag).off('mouseup touchend', stop$$1);
        $eventOverlay.remove();
        if (settings.stop) {
          settings.stop(e);
        }
      };
      this.destroy = function () {
        global$7(handleElement).off();
      };
      global$7(handleElement).on('mousedown touchstart', start);
    }

    var count = 0;
    function CropRect (currentRect, viewPortRect, clampRect, containerElm, action) {
      var instance;
      var handles;
      var dragHelpers;
      var blockers;
      var prefix = 'tox-';
      var id = prefix + 'crid-' + count++;
      handles = [
        {
          name: 'move',
          xMul: 0,
          yMul: 0,
          deltaX: 1,
          deltaY: 1,
          deltaW: 0,
          deltaH: 0,
          label: 'Crop Mask'
        },
        {
          name: 'nw',
          xMul: 0,
          yMul: 0,
          deltaX: 1,
          deltaY: 1,
          deltaW: -1,
          deltaH: -1,
          label: 'Top Left Crop Handle'
        },
        {
          name: 'ne',
          xMul: 1,
          yMul: 0,
          deltaX: 0,
          deltaY: 1,
          deltaW: 1,
          deltaH: -1,
          label: 'Top Right Crop Handle'
        },
        {
          name: 'sw',
          xMul: 0,
          yMul: 1,
          deltaX: 1,
          deltaY: 0,
          deltaW: -1,
          deltaH: 1,
          label: 'Bottom Left Crop Handle'
        },
        {
          name: 'se',
          xMul: 1,
          yMul: 1,
          deltaX: 0,
          deltaY: 0,
          deltaW: 1,
          deltaH: 1,
          label: 'Bottom Right Crop Handle'
        }
      ];
      blockers = [
        'top',
        'right',
        'bottom',
        'left'
      ];
      function getAbsoluteRect(outerRect, relativeRect) {
        return {
          x: relativeRect.x + outerRect.x,
          y: relativeRect.y + outerRect.y,
          w: relativeRect.w,
          h: relativeRect.h
        };
      }
      function getRelativeRect(outerRect, innerRect) {
        return {
          x: innerRect.x - outerRect.x,
          y: innerRect.y - outerRect.y,
          w: innerRect.w,
          h: innerRect.h
        };
      }
      function getInnerRect() {
        return getRelativeRect(clampRect, currentRect);
      }
      function moveRect(handle, startRect, deltaX, deltaY) {
        var x, y, w, h, rect;
        x = startRect.x;
        y = startRect.y;
        w = startRect.w;
        h = startRect.h;
        x += deltaX * handle.deltaX;
        y += deltaY * handle.deltaY;
        w += deltaX * handle.deltaW;
        h += deltaY * handle.deltaH;
        if (w < 20) {
          w = 20;
        }
        if (h < 20) {
          h = 20;
        }
        rect = currentRect = global$8.clamp({
          x: x,
          y: y,
          w: w,
          h: h
        }, clampRect, handle.name === 'move');
        rect = getRelativeRect(clampRect, rect);
        instance.fire('updateRect', { rect: rect });
        setInnerRect(rect);
      }
      function render() {
        function createDragHelper(handle) {
          var startRect;
          return new DragHelper(id, {
            document: containerElm.ownerDocument,
            handle: id + '-' + handle.name,
            start: function () {
              startRect = currentRect;
            },
            drag: function (e) {
              moveRect(handle, startRect, e.deltaX, e.deltaY);
            }
          });
        }
        global$7('<div id="' + id + '" class="' + prefix + 'croprect-container"' + ' role="grid" aria-dropeffect="execute">').appendTo(containerElm);
        global$a.each(blockers, function (blocker) {
          global$7('#' + id, containerElm).append('<div id="' + id + '-' + blocker + '"class="' + prefix + 'croprect-block" style="display: none" data-mce-bogus="all">');
        });
        global$a.each(handles, function (handle) {
          global$7('#' + id, containerElm).append('<div id="' + id + '-' + handle.name + '" class="' + prefix + 'croprect-handle ' + prefix + 'croprect-handle-' + handle.name + '"' + 'style="display: none" data-mce-bogus="all" role="gridcell" tabindex="-1"' + ' aria-label="' + handle.label + '" aria-grabbed="false" title="' + handle.label + '">');
        });
        dragHelpers = global$a.map(handles, createDragHelper);
        repaint(currentRect);
        global$7(containerElm).on('focusin focusout', function (e) {
          global$7(e.target).attr('aria-grabbed', e.type === 'focus');
        });
        global$7(containerElm).on('keydown', function (e) {
          var activeHandle;
          global$a.each(handles, function (handle) {
            if (e.target.id === id + '-' + handle.name) {
              activeHandle = handle;
              return false;
            }
          });
          function moveAndBlock(evt, handle, startRect, deltaX, deltaY) {
            evt.stopPropagation();
            evt.preventDefault();
            moveRect(activeHandle, startRect, deltaX, deltaY);
          }
          switch (e.keyCode) {
          case global$b.LEFT:
            moveAndBlock(e, activeHandle, currentRect, -10, 0);
            break;
          case global$b.RIGHT:
            moveAndBlock(e, activeHandle, currentRect, 10, 0);
            break;
          case global$b.UP:
            moveAndBlock(e, activeHandle, currentRect, 0, -10);
            break;
          case global$b.DOWN:
            moveAndBlock(e, activeHandle, currentRect, 0, 10);
            break;
          case global$b.ENTER:
          case global$b.SPACEBAR:
            e.preventDefault();
            action();
            break;
          }
        });
      }
      function toggleVisibility(state) {
        var selectors;
        selectors = global$a.map(handles, function (handle) {
          return '#' + id + '-' + handle.name;
        }).concat(global$a.map(blockers, function (blocker) {
          return '#' + id + '-' + blocker;
        })).join(',');
        if (state) {
          global$7(selectors, containerElm).show();
        } else {
          global$7(selectors, containerElm).hide();
        }
      }
      function repaint(rect) {
        function updateElementRect(name, rect) {
          if (rect.h < 0) {
            rect.h = 0;
          }
          if (rect.w < 0) {
            rect.w = 0;
          }
          global$7('#' + id + '-' + name, containerElm).css({
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h
          });
        }
        global$a.each(handles, function (handle) {
          global$7('#' + id + '-' + handle.name, containerElm).css({
            left: rect.w * handle.xMul + rect.x,
            top: rect.h * handle.yMul + rect.y
          });
        });
        updateElementRect('top', {
          x: viewPortRect.x,
          y: viewPortRect.y,
          w: viewPortRect.w,
          h: rect.y - viewPortRect.y
        });
        updateElementRect('right', {
          x: rect.x + rect.w,
          y: rect.y,
          w: viewPortRect.w - rect.x - rect.w + viewPortRect.x,
          h: rect.h
        });
        updateElementRect('bottom', {
          x: viewPortRect.x,
          y: rect.y + rect.h,
          w: viewPortRect.w,
          h: viewPortRect.h - rect.y - rect.h + viewPortRect.y
        });
        updateElementRect('left', {
          x: viewPortRect.x,
          y: rect.y,
          w: rect.x - viewPortRect.x,
          h: rect.h
        });
        updateElementRect('move', rect);
      }
      function setRect(rect) {
        currentRect = rect;
        repaint(currentRect);
      }
      function setViewPortRect(rect) {
        viewPortRect = rect;
        repaint(currentRect);
      }
      function setInnerRect(rect) {
        setRect(getAbsoluteRect(clampRect, rect));
      }
      function setClampRect(rect) {
        clampRect = rect;
        repaint(currentRect);
      }
      function destroy() {
        global$a.each(dragHelpers, function (helper) {
          helper.destroy();
        });
        dragHelpers = [];
      }
      render();
      instance = global$a.extend({
        toggleVisibility: toggleVisibility,
        setClampRect: setClampRect,
        setRect: setRect,
        getInnerRect: getInnerRect,
        setInnerRect: setInnerRect,
        setViewPortRect: setViewPortRect,
        destroy: destroy
      }, global$9);
      return instance;
    }

    var loadImage$1 = function (image) {
      return new global$1(function (resolve) {
        var loaded = function () {
          image.removeEventListener('load', loaded);
          resolve(image);
        };
        if (image.complete) {
          resolve(image);
        } else {
          image.addEventListener('load', loaded);
        }
      });
    };
    var renderImagePanel = function (initialUrl) {
      var memBg = record({
        dom: {
          tag: 'div',
          classes: ['tox-image-tools__image-bg'],
          attributes: { role: 'presentation' }
        }
      });
      var zoomState = Cell(1);
      var cropRect = Cell(Option.none());
      var rectState = Cell({
        x: 0,
        y: 0,
        w: 1,
        h: 1
      });
      var viewRectState = Cell({
        x: 0,
        y: 0,
        w: 1,
        h: 1
      });
      var repaintImg = function (anyInSystem, img) {
        memContainer.getOpt(anyInSystem).each(function (panel) {
          var zoom = zoomState.get();
          var panelW = get$8(panel.element());
          var panelH = get$9(panel.element());
          var width = img.dom().naturalWidth * zoom;
          var height = img.dom().naturalHeight * zoom;
          var left = Math.max(0, panelW / 2 - width / 2);
          var top = Math.max(0, panelH / 2 - height / 2);
          var css = {
            left: left.toString() + 'px',
            top: top.toString() + 'px',
            width: width.toString() + 'px',
            height: height.toString() + 'px',
            position: 'absolute'
          };
          setAll$1(img, css);
          memBg.getOpt(panel).each(function (bg) {
            setAll$1(bg.element(), css);
          });
          cropRect.get().each(function (cRect) {
            var rect = rectState.get();
            cRect.setRect({
              x: rect.x * zoom + left,
              y: rect.y * zoom + top,
              w: rect.w * zoom,
              h: rect.h * zoom
            });
            cRect.setClampRect({
              x: left,
              y: top,
              w: width,
              h: height
            });
            cRect.setViewPortRect({
              x: 0,
              y: 0,
              w: panelW,
              h: panelH
            });
          });
        });
      };
      var zoomFit = function (anyInSystem, img) {
        memContainer.getOpt(anyInSystem).each(function (panel) {
          var panelW = get$8(panel.element());
          var panelH = get$9(panel.element());
          var width = img.dom().naturalWidth;
          var height = img.dom().naturalHeight;
          var zoom = Math.min(panelW / width, panelH / height);
          if (zoom >= 1) {
            zoomState.set(1);
          } else {
            zoomState.set(zoom);
          }
        });
      };
      var updateSrc = function (anyInSystem, url) {
        var img = Element$$1.fromTag('img');
        set$1(img, 'src', url);
        return loadImage$1(img.dom()).then(function () {
          return memContainer.getOpt(anyInSystem).map(function (panel) {
            var aImg = external({ element: img });
            Replacing.replaceAt(panel, 1, Option.some(aImg));
            var lastViewRect = viewRectState.get();
            var viewRect = {
              x: 0,
              y: 0,
              w: img.dom().naturalWidth,
              h: img.dom().naturalHeight
            };
            viewRectState.set(viewRect);
            var rect = global$8.inflate(viewRect, -20, -20);
            rectState.set(rect);
            if (lastViewRect.w !== viewRect.w || lastViewRect.h !== viewRect.h) {
              zoomFit(panel, img);
            }
            repaintImg(panel, img);
            return img;
          });
        });
      };
      var zoom = function (anyInSystem, direction) {
        var currentZoom = zoomState.get();
        var newZoom = direction > 0 ? Math.min(2, currentZoom + 0.1) : Math.max(0.1, currentZoom - 0.1);
        zoomState.set(newZoom);
        memContainer.getOpt(anyInSystem).each(function (panel) {
          var img = panel.components()[1].element();
          repaintImg(panel, img);
        });
      };
      var showCrop = function () {
        cropRect.get().each(function (cRect) {
          cRect.toggleVisibility(true);
        });
      };
      var hideCrop = function () {
        cropRect.get().each(function (cRect) {
          cRect.toggleVisibility(false);
        });
      };
      var getRect = function () {
        return rectState.get();
      };
      var container = Container.sketch({
        dom: {
          tag: 'div',
          classes: ['tox-image-tools__image']
        },
        components: [
          memBg.asSpec(),
          {
            dom: {
              tag: 'img',
              attributes: { src: initialUrl }
            }
          },
          {
            dom: { tag: 'div' },
            behaviours: derive$1([config('image-panel-crop-events', [runOnAttached(function (comp) {
                  memContainer.getOpt(comp).each(function (container) {
                    var el = container.element().dom();
                    var cRect = CropRect({
                      x: 10,
                      y: 10,
                      w: 100,
                      h: 100
                    }, {
                      x: 0,
                      y: 0,
                      w: 200,
                      h: 200
                    }, {
                      x: 0,
                      y: 0,
                      w: 200,
                      h: 200
                    }, el, function () {
                    });
                    cRect.toggleVisibility(false);
                    cRect.on('updateRect', function (e) {
                      var rect = e.rect;
                      var zoom = zoomState.get();
                      var newRect = {
                        x: Math.round(rect.x / zoom),
                        y: Math.round(rect.y / zoom),
                        w: Math.round(rect.w / zoom),
                        h: Math.round(rect.h / zoom)
                      };
                      rectState.set(newRect);
                    });
                    cropRect.set(Option.some(cRect));
                  });
                })])])
          }
        ],
        containerBehaviours: derive$1([
          Replacing.config({}),
          config('image-panel-events', [runOnAttached(function (comp) {
              updateSrc(comp, initialUrl);
            })])
        ])
      });
      var memContainer = record(container);
      var getMeasurements = function () {
        var viewRect = viewRectState.get();
        return {
          width: viewRect.w,
          height: viewRect.h
        };
      };
      return {
        memContainer: memContainer,
        updateSrc: updateSrc,
        zoom: zoom,
        showCrop: showCrop,
        hideCrop: hideCrop,
        getRect: getRect,
        getMeasurements: getMeasurements
      };
    };

    var createButton = function (innerHtml, icon, disabled, action, providersBackstage) {
      return renderIconButton({
        name: innerHtml,
        icon: Option.some(icon),
        disabled: disabled,
        tooltip: Option.some(innerHtml)
      }, action, providersBackstage);
    };
    var setButtonEnabled = function (button, enabled) {
      if (enabled) {
        Disabling.enable(button);
      } else {
        Disabling.disable(button);
      }
    };
    var renderSideBar = function (providersBackstage) {
      var updateButtonUndoStates = function (anyInSystem, undoEnabled, redoEnabled) {
        memUndo.getOpt(anyInSystem).each(function (undo) {
          setButtonEnabled(undo, undoEnabled);
        });
        memRedo.getOpt(anyInSystem).each(function (redo) {
          setButtonEnabled(redo, redoEnabled);
        });
      };
      var memUndo = record(createButton('Undo', 'undo', true, function (button) {
        emitWith(button, internal.undo(), { direction: 1 });
      }, providersBackstage));
      var memRedo = record(createButton('Redo', 'redo', true, function (button) {
        emitWith(button, internal.redo(), { direction: 1 });
      }, providersBackstage));
      var container = Container.sketch({
        dom: {
          tag: 'div',
          classes: [
            'tox-image-tools__toolbar',
            'tox-image-tools__sidebar'
          ]
        },
        components: [
          memUndo.asSpec(),
          memRedo.asSpec(),
          createButton('Zoom in', 'zoom-in', false, function (button) {
            emitWith(button, internal.zoom(), { direction: 1 });
          }, providersBackstage),
          createButton('Zoom out', 'zoom-out', false, function (button) {
            emitWith(button, internal.zoom(), { direction: -1 });
          }, providersBackstage)
        ]
      });
      return {
        container: container,
        updateButtonUndoStates: updateButtonUndoStates
      };
    };

    var url = function () {
      return Global$1.getOrDie('URL');
    };
    var createObjectURL = function (blob) {
      return url().createObjectURL(blob);
    };
    var revokeObjectURL = function (u) {
      url().revokeObjectURL(u);
    };
    var URL$1 = {
      createObjectURL: createObjectURL,
      revokeObjectURL: revokeObjectURL
    };

    function UndoStack () {
      var data = [];
      var index = -1;
      function add(state) {
        var removed;
        removed = data.splice(++index);
        data.push(state);
        return {
          state: state,
          removed: removed
        };
      }
      function undo() {
        if (canUndo()) {
          return data[--index];
        }
      }
      function redo() {
        if (canRedo()) {
          return data[++index];
        }
      }
      function canUndo() {
        return index > 0;
      }
      function canRedo() {
        return index !== -1 && index < data.length - 1;
      }
      return {
        data: data,
        add: add,
        undo: undo,
        redo: redo,
        canUndo: canUndo,
        canRedo: canRedo
      };
    }

    var makeState = function (initialState) {
      var blobState = Cell(initialState);
      var tempState = Cell(Option.none());
      var undoStack = UndoStack();
      undoStack.add(initialState);
      var getBlobState = function () {
        return blobState.get();
      };
      var setBlobState = function (state) {
        blobState.set(state);
      };
      var getTempState = function () {
        return tempState.get().fold(function () {
          return blobState.get();
        }, function (temp) {
          return temp;
        });
      };
      var updateTempState = function (blob) {
        var newTempState = createState(blob);
        destroyTempState();
        tempState.set(Option.some(newTempState));
        return newTempState.url;
      };
      var createState = function (blob) {
        return {
          blob: blob,
          url: URL$1.createObjectURL(blob)
        };
      };
      var destroyState = function (state) {
        URL$1.revokeObjectURL(state.url);
      };
      var destroyStates = function (states) {
        global$a.each(states, destroyState);
      };
      var destroyTempState = function () {
        tempState.get().each(destroyState);
        tempState.set(Option.none());
      };
      var addBlobState = function (blob) {
        var newState = createState(blob);
        setBlobState(newState);
        var removed = undoStack.add(newState).removed;
        destroyStates(removed);
        return newState.url;
      };
      var addTempState = function (blob) {
        var newState = createState(blob);
        tempState.set(Option.some(newState));
        return newState.url;
      };
      var applyTempState = function (postApply) {
        return tempState.get().fold(function () {
        }, function (temp) {
          addBlobState(temp.blob);
          postApply();
        });
      };
      var undo = function () {
        var currentState = undoStack.undo();
        setBlobState(currentState);
        return currentState.url;
      };
      var redo = function () {
        var currentState = undoStack.redo();
        setBlobState(currentState);
        return currentState.url;
      };
      var getHistoryStates = function () {
        var undoEnabled = undoStack.canUndo();
        var redoEnabled = undoStack.canRedo();
        return {
          undoEnabled: undoEnabled,
          redoEnabled: redoEnabled
        };
      };
      return {
        getBlobState: getBlobState,
        setBlobState: setBlobState,
        addBlobState: addBlobState,
        getTempState: getTempState,
        updateTempState: updateTempState,
        addTempState: addTempState,
        applyTempState: applyTempState,
        destroyTempState: destroyTempState,
        undo: undo,
        redo: redo,
        getHistoryStates: getHistoryStates
      };
    };

    var renderImageTools = function (detail, providersBackstage) {
      var state = makeState(detail.currentState);
      var zoom = function (anyInSystem, simulatedEvent) {
        var direction = simulatedEvent.event().direction();
        imagePanel.zoom(anyInSystem, direction);
      };
      var updateButtonUndoStates = function (anyInSystem) {
        var historyStates = state.getHistoryStates();
        sideBar.updateButtonUndoStates(anyInSystem, historyStates.undoEnabled, historyStates.redoEnabled);
        emitWith(anyInSystem, external$2.formActionEvent, {
          name: external$2.saveState(),
          value: historyStates.undoEnabled
        });
      };
      var disableUndoRedo = function (anyInSystem) {
        sideBar.updateButtonUndoStates(anyInSystem, false, false);
      };
      var undo = function (anyInSystem, _simulatedEvent) {
        var url = state.undo();
        updateSrc(anyInSystem, url).then(function (oImg) {
          unblock(anyInSystem);
          updateButtonUndoStates(anyInSystem);
        });
      };
      var redo = function (anyInSystem, _simulatedEvent) {
        var url = state.redo();
        updateSrc(anyInSystem, url).then(function (oImg) {
          unblock(anyInSystem);
          updateButtonUndoStates(anyInSystem);
        });
      };
      var imageResultToBlob = function (ir) {
        return ir.toBlob();
      };
      var block = function (anyInSystem) {
        emitWith(anyInSystem, external$2.formActionEvent, {
          name: external$2.disable(),
          value: {}
        });
      };
      var unblock = function (anyInSystem) {
        editPanel.getApplyButton(anyInSystem).each(function (applyButton) {
          Disabling.enable(applyButton);
        });
        emitWith(anyInSystem, external$2.formActionEvent, {
          name: external$2.enable(),
          value: {}
        });
      };
      var updateSrc = function (anyInSystem, src) {
        block(anyInSystem);
        return imagePanel.updateSrc(anyInSystem, src);
      };
      var blobManipulate = function (anyInSystem, blob, filter, action, swap) {
        block(anyInSystem);
        return ResultConversions.blobToImageResult(blob).then(filter).then(imageResultToBlob).then(action).then(function (url) {
          return updateSrc(anyInSystem, url).then(function (oImg) {
            updateButtonUndoStates(anyInSystem);
            swap();
            unblock(anyInSystem);
            return oImg;
          });
        }).catch(function (err) {
          console.log(err);
          unblock(anyInSystem);
        });
      };
      var manipulate = function (anyInSystem, filter, swap) {
        var blob = state.getBlobState().blob;
        var action = function (blob) {
          return state.updateTempState(blob);
        };
        blobManipulate(anyInSystem, blob, filter, action, swap);
      };
      var tempManipulate = function (anyInSystem, filter) {
        var blob = state.getTempState().blob;
        var action = function (blob) {
          return state.addTempState(blob);
        };
        blobManipulate(anyInSystem, blob, filter, action, noop);
      };
      var manipulateApply = function (anyInSystem, filter, swap) {
        var blob = state.getBlobState().blob;
        var action = function (blob) {
          var url = state.addBlobState(blob);
          destroyTempState(anyInSystem);
          return url;
        };
        blobManipulate(anyInSystem, blob, filter, action, swap);
      };
      var apply$$1 = function (anyInSystem, simulatedEvent) {
        var postApply = function () {
          destroyTempState(anyInSystem);
          var swap = simulatedEvent.event().swap();
          swap();
        };
        state.applyTempState(postApply);
      };
      var destroyTempState = function (anyInSystem) {
        var currentUrl = state.getBlobState().url;
        state.destroyTempState();
        updateButtonUndoStates(anyInSystem);
        return currentUrl;
      };
      var cancel = function (anyInSystem) {
        var currentUrl = destroyTempState(anyInSystem);
        updateSrc(anyInSystem, currentUrl).then(function (oImg) {
          unblock(anyInSystem);
        });
      };
      var back = function (anyInSystem, simulatedEvent) {
        cancel(anyInSystem);
        var swap = simulatedEvent.event().swap();
        swap();
        imagePanel.hideCrop();
      };
      var transform = function (anyInSystem, simulatedEvent) {
        return manipulate(anyInSystem, simulatedEvent.event().transform(), noop);
      };
      var tempTransform = function (anyInSystem, simulatedEvent) {
        return tempManipulate(anyInSystem, simulatedEvent.event().transform());
      };
      var transformApply = function (anyInSystem, simulatedEvent) {
        return manipulateApply(anyInSystem, simulatedEvent.event().transform(), simulatedEvent.event().swap());
      };
      var imagePanel = renderImagePanel(detail.currentState.url);
      var sideBar = renderSideBar(providersBackstage);
      var editPanel = renderEditPanel(imagePanel, providersBackstage);
      var swap = function (anyInSystem, simulatedEvent) {
        disableUndoRedo(anyInSystem);
        var transform = simulatedEvent.event().transform();
        var swap = simulatedEvent.event().swap();
        transform.fold(function () {
          swap();
        }, function (transform) {
          manipulate(anyInSystem, transform, swap);
        });
      };
      return {
        dom: {
          tag: 'div',
          attributes: { role: 'presentation' }
        },
        components: [
          editPanel.memContainer.asSpec(),
          imagePanel.memContainer.asSpec(),
          sideBar.container
        ],
        behaviours: derive$1([
          Representing.config({
            store: {
              mode: 'manual',
              getValue: function () {
                return state.getBlobState();
              }
            }
          }),
          config('image-tools-events', [
            run(internal.undo(), undo),
            run(internal.redo(), redo),
            run(internal.zoom(), zoom),
            run(internal.back(), back),
            run(internal.apply(), apply$$1),
            run(internal.transform(), transform),
            run(internal.tempTransform(), tempTransform),
            run(internal.transformApply(), transformApply),
            run(internal.swap(), swap)
          ]),
          ComposingConfigs.self()
        ])
      };
    };

    var factory$8 = function (detail, spec) {
      var options = map(detail.options, function (option$$1) {
        return {
          dom: {
            tag: 'option',
            value: option$$1.value,
            innerHtml: option$$1.text
          }
        };
      });
      var initialValues = detail.data.map(function (v) {
        return wrap$1('initialValue', v);
      }).getOr({});
      return {
        uid: detail.uid,
        dom: {
          tag: 'select',
          classes: detail.selectClasses,
          attributes: detail.selectAttributes
        },
        components: options,
        behaviours: augment(detail.selectBehaviours, [
          Focusing.config({}),
          Representing.config({
            store: __assign({
              mode: 'manual',
              getValue: function (select) {
                return get$6(select.element());
              },
              setValue: function (select, newValue) {
                var found = find(detail.options, function (opt) {
                  return opt.value === newValue;
                });
                if (found.isSome()) {
                  set$3(select.element(), newValue);
                }
              }
            }, initialValues)
          })
        ])
      };
    };
    var HtmlSelect = single$2({
      name: 'HtmlSelect',
      configFields: [
        strict$1('options'),
        field$1('selectBehaviours', [
          Focusing,
          Representing
        ]),
        defaulted$1('selectClasses', []),
        defaulted$1('selectAttributes', {}),
        option('data')
      ],
      factory: factory$8
    });

    var renderSelectBox = function (spec, providersBackstage) {
      var pLabel = spec.label.map(function (label) {
        return renderLabel(label, providersBackstage);
      });
      var pField = FormField.parts().field({
        dom: {},
        selectAttributes: { size: spec.size },
        options: spec.items,
        factory: HtmlSelect,
        selectBehaviours: derive$1([
          Tabstopping.config({}),
          config('selectbox-change', [run(change(), function (component, _) {
              emitWith(component, formChangeEvent, { name: spec.name });
            })])
        ])
      });
      var chevron = spec.size > 1 ? Option.none() : Option.some({
        dom: {
          tag: 'div',
          classes: ['tox-selectfield__icon-js'],
          innerHtml: get$e('chevron-down', providersBackstage.icons)
        }
      });
      var selectWrap = {
        dom: {
          tag: 'div',
          classes: ['tox-selectfield']
        },
        components: flatten([
          [pField],
          chevron.toArray()
        ])
      };
      return FormField.sketch({
        dom: {
          tag: 'div',
          classes: ['tox-form__group']
        },
        components: flatten([
          pLabel.toArray(),
          [selectWrap]
        ])
      });
    };

    var renderTextField = function (spec, providersBackstage) {
      var pLabel = spec.label.map(function (label) {
        return renderLabel(label, providersBackstage);
      });
      var baseInputBehaviours = [
        Keying.config({
          mode: 'execution',
          useEnter: spec.multiline !== true,
          useControlEnter: spec.multiline === true,
          execute: function (comp) {
            emit(comp, formSubmitEvent);
            return Option.some(true);
          }
        }),
        config('textfield-change', [
          run(input(), function (component, _) {
            emitWith(component, formChangeEvent, { name: spec.name });
          }),
          run(paste(), function (component, _) {
            emitWith(component, formChangeEvent, { name: spec.name });
          })
        ]),
        Tabstopping.config({})
      ];
      var validatingBehaviours = spec.validation.map(function (vl) {
        return Invalidating.config({
          getRoot: function (input$$1) {
            return parent(input$$1.element());
          },
          invalidClass: 'tox-invalid',
          validator: {
            validate: function (input$$1) {
              var v = Representing.getValue(input$$1);
              var result = vl.validator(v);
              return Future.pure(result === true ? Result.value(v) : Result.error(result));
            },
            validateOnLoad: vl.validateOnLoad
          }
        });
      }).toArray();
      var pField = FormField.parts().field({
        tag: spec.multiline === true ? 'textarea' : 'input',
        inputAttributes: spec.placeholder.fold(function () {
        }, function (placeholder) {
          return { placeholder: providersBackstage.translate(placeholder) };
        }),
        inputClasses: [spec.classname],
        inputBehaviours: derive$1(flatten([
          baseInputBehaviours,
          validatingBehaviours
        ])),
        selectOnFocus: false,
        factory: Input
      });
      var extraClasses = spec.flex ? ['tox-form__group--stretched'] : [];
      return renderFormFieldWith(pLabel, pField, extraClasses);
    };
    var renderInput = function (spec, providersBackstage) {
      return renderTextField({
        name: spec.name,
        multiline: false,
        label: spec.label,
        placeholder: spec.placeholder,
        flex: false,
        classname: 'tox-textfield',
        validation: Option.none()
      }, providersBackstage);
    };
    var renderTextarea = function (spec, providersBackstage) {
      return renderTextField({
        name: spec.name,
        multiline: true,
        label: spec.label,
        placeholder: spec.placeholder,
        flex: true,
        classname: 'tox-textarea',
        validation: Option.none()
      }, providersBackstage);
    };

    var wrap$3 = function (delegate) {
      var toCached = function () {
        return wrap$3(delegate.toCached());
      };
      var bindFuture = function (f) {
        return wrap$3(delegate.bind(function (resA) {
          return resA.fold(function (err) {
            return Future.pure(Result.error(err));
          }, function (a) {
            return f(a);
          });
        }));
      };
      var bindResult = function (f) {
        return wrap$3(delegate.map(function (resA) {
          return resA.bind(f);
        }));
      };
      var mapResult = function (f) {
        return wrap$3(delegate.map(function (resA) {
          return resA.map(f);
        }));
      };
      var mapError = function (f) {
        return wrap$3(delegate.map(function (resA) {
          return resA.mapError(f);
        }));
      };
      var foldResult = function (whenError, whenValue) {
        return delegate.map(function (res) {
          return res.fold(whenError, whenValue);
        });
      };
      var withTimeout = function (timeout, errorThunk) {
        return wrap$3(Future.nu(function (callback) {
          var timedOut = false;
          var timer = window.setTimeout(function () {
            timedOut = true;
            callback(Result.error(errorThunk()));
          }, timeout);
          delegate.get(function (result) {
            if (!timedOut) {
              window.clearTimeout(timer);
              callback(result);
            }
          });
        }));
      };
      return __assign({}, delegate, {
        toCached: toCached,
        bindFuture: bindFuture,
        bindResult: bindResult,
        mapResult: mapResult,
        mapError: mapError,
        foldResult: foldResult,
        withTimeout: withTimeout
      });
    };
    var nu$c = function (worker) {
      return wrap$3(Future.nu(worker));
    };
    var value$3 = function (value) {
      return wrap$3(Future.pure(Result.value(value)));
    };
    var error$1 = function (error) {
      return wrap$3(Future.pure(Result.error(error)));
    };
    var fromResult$1 = function (result) {
      return wrap$3(Future.pure(result));
    };
    var fromFuture = function (future) {
      return wrap$3(future.map(Result.value));
    };
    var fromPromise = function (promise) {
      return nu$c(function (completer) {
        promise.then(function (value) {
          completer(Result.value(value));
        }, function (error) {
          completer(Result.error(error));
        });
      });
    };
    var FutureResult = {
      nu: nu$c,
      wrap: wrap$3,
      pure: value$3,
      value: value$3,
      error: error$1,
      fromResult: fromResult$1,
      fromFuture: fromFuture,
      fromPromise: fromPromise
    };

    var separator$2 = { type: 'separator' };
    var toMenuItem = function (target) {
      return {
        type: 'menuitem',
        value: target.url,
        text: target.title,
        meta: { attach: target.attach },
        onAction: function () {
        }
      };
    };
    var staticMenuItem = function (title, url) {
      return {
        type: 'menuitem',
        value: url,
        text: title,
        meta: { attach: noop },
        onAction: function () {
        }
      };
    };
    var toMenuItems = function (targets) {
      return map(targets, toMenuItem);
    };
    var filterLinkTargets = function (type, targets) {
      return filter(targets, function (target) {
        return target.type === type;
      });
    };
    var filteredTargets = function (type, targets) {
      return toMenuItems(filterLinkTargets(type, targets));
    };
    var headerTargets = function (linkInfo) {
      return filteredTargets('header', linkInfo.targets);
    };
    var anchorTargets = function (linkInfo) {
      return filteredTargets('anchor', linkInfo.targets);
    };
    var anchorTargetTop = function (linkInfo) {
      return linkInfo.anchorTop.map(function (url) {
        return staticMenuItem('<top>', url);
      }).toArray();
    };
    var anchorTargetBottom = function (linkInfo) {
      return linkInfo.anchorBottom.map(function (url) {
        return staticMenuItem('<bottom>', url);
      }).toArray();
    };
    var historyTargets = function (history) {
      return map(history, function (url) {
        return staticMenuItem(url, url);
      });
    };
    var joinMenuLists = function (items) {
      return foldl(items, function (a, b) {
        var bothEmpty = a.length === 0 || b.length === 0;
        return bothEmpty ? a.concat(b) : a.concat(separator$2, b);
      }, []);
    };
    var filterByQuery = function (term, menuItems) {
      var lowerCaseTerm = term.toLowerCase();
      return filter(menuItems, function (item) {
        var text = item.meta !== undefined && item.meta.text !== undefined ? item.meta.text : item.text;
        return contains$1(text.toLowerCase(), lowerCaseTerm) || contains$1(item.value.toLowerCase(), lowerCaseTerm);
      });
    };

    var getItems = function (fileType, input$$1, urlBackstage) {
      var urlInputValue = Representing.getValue(input$$1);
      var term = urlInputValue.meta.text !== undefined ? urlInputValue.meta.text : urlInputValue.value;
      var info = urlBackstage.getLinkInformation();
      return info.fold(function () {
        return [];
      }, function (linkInfo) {
        var history = filterByQuery(term, historyTargets(urlBackstage.getHistory(fileType)));
        return fileType === 'file' ? joinMenuLists([
          history,
          filterByQuery(term, headerTargets(linkInfo)),
          filterByQuery(term, flatten([
            anchorTargetTop(linkInfo),
            anchorTargets(linkInfo),
            anchorTargetBottom(linkInfo)
          ]))
        ]) : history;
      });
    };
    var renderInputButton = function (label, eventName, className, iconName, providersBackstage) {
      return Button.sketch({
        dom: {
          tag: 'button',
          classes: [
            'tox-tbtn',
            className
          ],
          innerHtml: get$e(iconName, providersBackstage.icons),
          attributes: { title: providersBackstage.translate(label.getOr('')) }
        },
        buttonBehaviours: derive$1([Tabstopping.config({})]),
        action: function (component) {
          emit(component, eventName);
        }
      });
    };
    var renderUrlInput = function (spec, sharedBackstage, urlBackstage) {
      var _a;
      var updateHistory = function (component) {
        var urlEntry = Representing.getValue(component);
        urlBackstage.addToHistory(urlEntry.value, spec.filetype);
      };
      var pField = FormField.parts().field({
        factory: Typeahead,
        dismissOnBlur: true,
        inputClasses: ['tox-textfield'],
        sandboxClasses: ['tox-dialog__popups'],
        minChars: 0,
        responseTime: 0,
        fetch: function (input$$1) {
          var items = getItems(spec.filetype, input$$1, urlBackstage);
          var tdata = build$2(items, ItemResponse$1.BUBBLE_TO_SANDBOX, sharedBackstage.providers);
          return Future.pure(tdata);
        },
        getHotspot: function (comp) {
          return memUrlBox.getOpt(comp);
        },
        onSetValue: function (comp, newValue) {
          if (comp.hasConfigured(Invalidating)) {
            Invalidating.run(comp).get(noop);
          }
        },
        typeaheadBehaviours: derive$1(flatten([
          urlBackstage.getValidationHandler().map(function (handler) {
            return Invalidating.config({
              getRoot: function (comp) {
                return parent(comp.element());
              },
              invalidClass: 'tox-control-wrap--status-invalid',
              notify: {},
              validator: {
                validate: function (input$$1) {
                  var urlEntry = Representing.getValue(input$$1);
                  return FutureResult.nu(function (completer) {
                    handler({
                      type: spec.filetype,
                      url: urlEntry.value
                    }, function (validation) {
                      memUrlBox.getOpt(input$$1).each(function (urlBox) {
                        var toggle = function (component, clazz, b) {
                          (b ? add$2 : remove$4)(component.element(), clazz);
                        };
                        toggle(urlBox, 'tox-control-wrap--status-valid', validation.status === 'valid');
                        toggle(urlBox, 'tox-control-wrap--status-unknown', validation.status === 'unknown');
                      });
                      completer((validation.status === 'invalid' ? Result.error : Result.value)(validation.message));
                    });
                  });
                },
                validateOnLoad: false
              }
            });
          }).toArray(),
          [
            Tabstopping.config({}),
            config('urlinput-events', flatten([
              spec.filetype === 'file' ? [run(input(), function (comp) {
                  emitWith(comp, formChangeEvent, { name: spec.name });
                })] : [],
              [
                run(change(), function (comp) {
                  emitWith(comp, formChangeEvent, { name: spec.name });
                  updateHistory(comp);
                }),
                run(paste(), function (comp) {
                  emitWith(comp, formChangeEvent, { name: spec.name });
                  updateHistory(comp);
                })
              ]
            ]))
          ]
        ])),
        eventOrder: (_a = {}, _a[input()] = [
          'streaming',
          'urlinput-events',
          'invalidating'
        ], _a),
        model: {
          getDisplayText: function (itemData) {
            return itemData.value;
          },
          selectsOver: false,
          populateFromBrowse: false
        },
        markers: { openClass: 'dog' },
        lazySink: sharedBackstage.getSink,
        parts: { menu: part(false, 1, 'normal') },
        onExecute: function (_menu, component, _entry) {
          emitWith(component, formSubmitEvent, {});
        },
        onItemExecute: function (typeahead, _sandbox, _item, _value) {
          updateHistory(typeahead);
          emitWith(typeahead, formChangeEvent, { name: spec.name });
        }
      });
      var pLabel = spec.label.map(function (label) {
        return renderLabel(label, sharedBackstage.providers);
      });
      var makeIcon = function (name, icon, label) {
        if (icon === void 0) {
          icon = name;
        }
        if (label === void 0) {
          label = name;
        }
        return {
          dom: {
            tag: 'div',
            classes: [
              'tox-icon',
              'tox-control-wrap__status-icon-' + name
            ],
            innerHtml: get$e(icon, sharedBackstage.providers.icons),
            attributes: { title: sharedBackstage.providers.translate(label) }
          }
        };
      };
      var memStatus = record({
        dom: {
          tag: 'div',
          classes: ['tox-control-wrap__status-icon-wrap']
        },
        components: [
          makeIcon('valid', 'checkmark', 'valid'),
          makeIcon('unknown', 'warning'),
          makeIcon('invalid', 'warning')
        ]
      });
      var optUrlPicker = urlBackstage.getUrlPicker(spec.filetype);
      var browseUrlEvent = generate$1('browser.url.event');
      var memUrlBox = record({
        dom: {
          tag: 'div',
          classes: ['tox-control-wrap']
        },
        components: [
          pField,
          memStatus.asSpec()
        ]
      });
      var controlHWrapper = function () {
        return {
          dom: {
            tag: 'div',
            classes: ['tox-form__controls-h-stack']
          },
          components: flatten([
            [memUrlBox.asSpec()],
            optUrlPicker.map(function () {
              return renderInputButton(spec.label, browseUrlEvent, 'tox-browse-url', 'browse', sharedBackstage.providers);
            }).toArray()
          ])
        };
      };
      var openUrlPicker = function (comp) {
        Composing.getCurrent(comp).each(function (field) {
          var urlData = Representing.getValue(field);
          optUrlPicker.each(function (picker) {
            picker(urlData).get(function (chosenData) {
              Representing.setValue(field, chosenData);
              emitWith(comp, formChangeEvent, { name: spec.name });
            });
          });
        });
      };
      return FormField.sketch({
        dom: renderFormFieldDom(),
        components: pLabel.toArray().concat([controlHWrapper()]),
        fieldBehaviours: derive$1([config('url-input-events', [run(browseUrlEvent, openUrlPicker)])])
      });
    };

    var renderCheckbox = function (spec, providerBackstage) {
      var repBehaviour = Representing.config({
        store: {
          mode: 'manual',
          getValue: function (comp) {
            var el = comp.element().dom();
            return el.indeterminate ? 'indeterminate' : el.checked ? 'checked' : 'unchecked';
          },
          setValue: function (comp, value) {
            var el = comp.element().dom();
            switch (value) {
            case 'indeterminate':
              el.indeterminate = true;
              break;
            case 'checked':
              el.checked = true;
              el.indeterminate = false;
              break;
            default:
              el.checked = false;
              el.indeterminate = false;
              break;
            }
          }
        }
      });
      var toggleCheckboxHandler = function (comp) {
        comp.element().dom().click();
        return Option.some(true);
      };
      var pField = FormField.parts().field({
        factory: { sketch: identity },
        dom: {
          tag: 'input',
          classes: ['tox-checkbox__input'],
          attributes: { type: 'checkbox' }
        },
        behaviours: derive$1([
          ComposingConfigs.self(),
          Tabstopping.config({}),
          Focusing.config({}),
          repBehaviour,
          Keying.config({
            mode: 'special',
            onEnter: toggleCheckboxHandler,
            onSpace: toggleCheckboxHandler
          }),
          config('checkbox-events', [run(change(), function (component, _) {
              emitWith(component, formChangeEvent, { name: spec.name });
            })])
        ])
      });
      var pLabel = FormField.parts().label({
        dom: {
          tag: 'span',
          classes: ['tox-checkbox__label'],
          innerHtml: providerBackstage.translate(spec.label)
        },
        behaviours: derive$1([Unselecting.config({})])
      });
      var makeIcon = function (className) {
        var iconName = className === 'checked' ? 'selected' : className === 'unchecked' ? 'unselected' : 'indeterminate';
        return {
          dom: {
            tag: 'span',
            classes: [
              'tox-icon',
              'tox-checkbox-icon__' + className
            ],
            innerHtml: get$e(iconName, providerBackstage.icons)
          }
        };
      };
      var memIcons = record({
        dom: {
          tag: 'div',
          classes: ['tox-checkbox__icons']
        },
        components: [
          makeIcon('checked'),
          makeIcon('unchecked'),
          makeIcon('indeterminate')
        ]
      });
      return FormField.sketch({
        dom: {
          tag: 'label',
          classes: ['tox-checkbox']
        },
        components: [
          pField,
          memIcons.asSpec(),
          pLabel
        ]
      });
    };

    var renderHtmlPanel = function (spec) {
      return Container.sketch({
        dom: {
          tag: 'div',
          innerHtml: spec.html
        },
        containerBehaviours: derive$1([
          Tabstopping.config({}),
          Focusing.config({})
        ])
      });
    };

    var renderListbox = function (spec, providersBackstage) {
      var pLabel = renderLabel(spec.label, providersBackstage);
      var pField = FormField.parts().field({
        factory: HtmlSelect,
        dom: { classes: ['mce-select-field'] },
        selectBehaviours: derive$1([Tabstopping.config({})]),
        options: spec.values,
        data: spec.initialValue.getOr(undefined)
      });
      return renderFormField(Option.some(pLabel), pField);
    };

    var renderLabel$2 = function (spec, backstageShared) {
      var label = {
        dom: {
          tag: 'label',
          innerHtml: backstageShared.providers.translate(spec.label),
          classes: ['tox-label']
        }
      };
      var comps = map(spec.items, backstageShared.interpreter);
      return {
        dom: {
          tag: 'div',
          classes: ['tox-form__group']
        },
        components: [label].concat(comps),
        behaviours: derive$1([
          ComposingConfigs.self(),
          Replacing.config({}),
          RepresentingConfigs.domHtml(Option.none()),
          Keying.config({ mode: 'acyclic' })
        ])
      };
    };

    var renderCollection = function (spec, providersBackstage) {
      var pLabel = spec.label.map(function (label) {
        return renderLabel(label, providersBackstage);
      });
      var runOnItem = function (f) {
        return function (comp, se) {
          closest$3(se.event().target(), '[data-collection-item-value]').each(function (target) {
            f(comp, target, get$2(target, 'data-collection-item-value'));
          });
        };
      };
      var escapeAttribute = function (ch) {
        if (ch === '"') {
          return '&quot;';
        }
        return ch;
      };
      var setContents = function (comp, items) {
        var htmlLines = map(items, function (item) {
          var textContent = spec.columns === 1 ? item.text.map(function (text) {
            return '<span class="tox-collection__item-label">' + text + '</span>';
          }).getOr('') : '';
          var iconContent = item.icon.map(function (icon) {
            return '<span class="tox-collection__item-icon">' + icon + '</span>';
          }).getOr('');
          var mapItemName = {
            '_': ' ',
            ' - ': ' ',
            '-': ' '
          };
          var ariaLabel = item.text.getOr('').replace(/\_| \- |\-/g, function (match) {
            return mapItemName[match];
          });
          return '<div class="tox-collection__item" tabindex="-1" data-collection-item-value="' + escapeAttribute(item.value) + '" title="' + ariaLabel + '" aria-label="' + ariaLabel + '">' + iconContent + textContent + '</div>';
        });
        var chunks = spec.columns > 1 && spec.columns !== 'auto' ? chunk(htmlLines, spec.columns) : [htmlLines];
        var html = map(chunks, function (ch) {
          return '<div class="tox-collection__group">' + ch.join('') + '</div>';
        });
        set(comp.element(), html.join(''));
      };
      var collectionEvents = [
        run(mouseover(), runOnItem(function (comp, tgt) {
          focus$2(tgt);
        })),
        run(click(), runOnItem(function (comp, tgt, itemValue) {
          emitWith(comp, formActionEvent, {
            name: spec.name,
            value: itemValue
          });
        })),
        run(focusin(), runOnItem(function (comp, tgt, itemValue) {
          descendant$2(comp.element(), '.' + activeClass).each(function (currentActive) {
            remove$4(currentActive, activeClass);
          });
          add$2(tgt, activeClass);
        })),
        run(focusout(), runOnItem(function (comp, tgt, itemValue) {
          descendant$2(comp.element(), '.' + activeClass).each(function (currentActive) {
            remove$4(currentActive, activeClass);
          });
        })),
        runOnExecute(runOnItem(function (comp, tgt, itemValue) {
          emitWith(comp, formActionEvent, {
            name: spec.name,
            value: itemValue
          });
        }))
      ];
      var pField = FormField.parts().field({
        dom: {
          tag: 'div',
          classes: ['tox-collection'].concat(spec.columns !== 1 ? ['tox-collection--grid'] : ['tox-collection--list'])
        },
        components: [],
        factory: { sketch: identity },
        behaviours: derive$1([
          Replacing.config({}),
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: []
            },
            onSetValue: function (comp, items) {
              setContents(comp, items);
              if (spec.columns === 'auto') {
                detectSize(comp, 5, 'tox-collection__item').each(function (_a) {
                  var numRows = _a.numRows, numColumns = _a.numColumns;
                  Keying.setGridSize(comp, numRows, numColumns);
                });
              }
              emit(comp, formResizeEvent);
            }
          }),
          Tabstopping.config({}),
          Keying.config(deriveCollectionMovement(spec.columns, 'normal')),
          config('collection-events', collectionEvents)
        ])
      });
      var extraClasses = ['tox-form__group--collection'];
      return renderFormFieldWith(pLabel, pField, extraClasses);
    };

    var renderTable = function (spec, providersBackstage) {
      var renderTh = function (text) {
        return {
          dom: {
            tag: 'th',
            innerHtml: providersBackstage.translate(text)
          }
        };
      };
      var renderHeader = function (header) {
        return {
          dom: { tag: 'thead' },
          components: [{
              dom: { tag: 'tr' },
              components: map(header, renderTh)
            }]
        };
      };
      var renderTd = function (text) {
        return {
          dom: {
            tag: 'td',
            innerHtml: providersBackstage.translate(text)
          }
        };
      };
      var renderTr = function (row) {
        return {
          dom: { tag: 'tr' },
          components: map(row, renderTd)
        };
      };
      var renderRows = function (rows) {
        return {
          dom: { tag: 'tbody' },
          components: map(rows, renderTr)
        };
      };
      return {
        dom: {
          tag: 'table',
          classes: ['tox-dialog__table']
        },
        components: [
          renderHeader(spec.header),
          renderRows(spec.cells)
        ],
        behaviours: derive$1([
          Tabstopping.config({}),
          Focusing.config({})
        ])
      };
    };

    var make$5 = function (render) {
      return function (parts, spec, backstage) {
        return readOptFrom$1(spec, 'name').fold(function () {
          return render(spec, backstage);
        }, function (fieldName) {
          return parts.field(fieldName, render(spec, backstage));
        });
      };
    };
    var makeIframe = function (render) {
      return function (parts, spec, backstage) {
        var iframeSpec = deepMerge(spec, { source: 'dynamic' });
        return make$5(render)(parts, iframeSpec, backstage);
      };
    };
    var factories = {
      bar: make$5(function (spec, backstage) {
        return renderBar(spec, backstage.shared);
      }),
      collection: make$5(function (spec, backstage) {
        return renderCollection(spec, backstage.shared.providers);
      }),
      alloy: make$5(identity),
      alertbanner: make$5(function (spec, backstage) {
        return renderAlertBanner(spec, backstage.shared.providers);
      }),
      input: make$5(function (spec, backstage) {
        return renderInput(spec, backstage.shared.providers);
      }),
      textarea: make$5(function (spec, backstage) {
        return renderTextarea(spec, backstage.shared.providers);
      }),
      listbox: make$5(function (spec, backstage) {
        return renderListbox(spec, backstage.shared.providers);
      }),
      label: make$5(function (spec, backstage) {
        return renderLabel$2(spec, backstage.shared);
      }),
      iframe: makeIframe(function (spec, backstage) {
        return renderIFrame(spec, backstage.shared.providers);
      }),
      autocomplete: make$5(function (spec, backstage) {
        return renderAutocomplete(spec, backstage.shared);
      }),
      button: make$5(function (spec, backstage) {
        return renderDialogButton(spec, backstage.shared.providers);
      }),
      checkbox: make$5(function (spec, backstage) {
        return renderCheckbox(spec, backstage.shared.providers);
      }),
      colorinput: make$5(function (spec, backstage) {
        return renderColorInput(spec, backstage.shared, backstage.colorinput);
      }),
      colorpicker: make$5(renderColorPicker),
      dropzone: make$5(function (spec, backstage) {
        return renderDropZone(spec, backstage.shared.providers);
      }),
      grid: make$5(function (spec, backstage) {
        return renderGrid(spec, backstage.shared);
      }),
      selectbox: make$5(function (spec, backstage) {
        return renderSelectBox(spec, backstage.shared.providers);
      }),
      sizeinput: make$5(function (spec, backstage) {
        return renderSizeInput(spec, backstage.shared.providers);
      }),
      urlinput: make$5(function (spec, backstage) {
        return renderUrlInput(spec, backstage.shared, backstage.urlinput);
      }),
      customeditor: make$5(renderCustomEditor),
      htmlpanel: make$5(renderHtmlPanel),
      imagetools: make$5(function (spec, backstage) {
        return renderImageTools(spec, backstage.shared.providers);
      }),
      table: make$5(function (spec, backstage) {
        return renderTable(spec, backstage.shared.providers);
      })
    };
    var noFormParts = {
      field: function (_name, spec) {
        return spec;
      }
    };
    var interpretInForm = function (parts, spec, oldBackstage) {
      var newBackstage = deepMerge(oldBackstage, {
        shared: {
          interpreter: function (childSpec) {
            return interpretParts(parts, childSpec, newBackstage);
          }
        }
      });
      return interpretParts(parts, spec, newBackstage);
    };
    var interpretParts = function (parts, spec, backstage) {
      return readOptFrom$1(factories, spec.type).fold(function () {
        console.error('Unknown factory type "' + spec.type + '", defaulting to container: ', spec);
        return spec;
      }, function (factory) {
        return factory(parts, spec, backstage);
      });
    };
    var interpretWithoutForm = function (spec, backstage) {
      var parts = noFormParts;
      return interpretParts(parts, spec, backstage);
    };

    var colorPicker = function (editor) {
      return function (callback, value) {
        var dialog = ColorSwatch.colorPickerDialog(editor);
        dialog(callback, value);
      };
    };
    var hasCustomColors$1 = function (editor) {
      return function () {
        return Settings.hasCustomColors(editor);
      };
    };
    var getColors$1 = function (editor) {
      return function () {
        return Settings.getColors(editor);
      };
    };
    var ColorInputBackstage = function (editor) {
      return {
        colorPicker: colorPicker(editor),
        hasCustomColors: hasCustomColors$1(editor),
        getColors: getColors$1(editor)
      };
    };

    var defaultStyleFormats = [
      {
        title: 'Headings',
        items: [
          {
            title: 'Heading 1',
            format: 'h1'
          },
          {
            title: 'Heading 2',
            format: 'h2'
          },
          {
            title: 'Heading 3',
            format: 'h3'
          },
          {
            title: 'Heading 4',
            format: 'h4'
          },
          {
            title: 'Heading 5',
            format: 'h5'
          },
          {
            title: 'Heading 6',
            format: 'h6'
          }
        ]
      },
      {
        title: 'Inline',
        items: [
          {
            title: 'Bold',
            icon: 'bold',
            format: 'bold'
          },
          {
            title: 'Italic',
            icon: 'italic',
            format: 'italic'
          },
          {
            title: 'Underline',
            icon: 'underline',
            format: 'underline'
          },
          {
            title: 'Strikethrough',
            icon: 'strike-through',
            format: 'strikethrough'
          },
          {
            title: 'Superscript',
            icon: 'superscript',
            format: 'superscript'
          },
          {
            title: 'Subscript',
            icon: 'subscript',
            format: 'subscript'
          },
          {
            title: 'Code',
            icon: 'code',
            format: 'code'
          }
        ]
      },
      {
        title: 'Blocks',
        items: [
          {
            title: 'Paragraph',
            format: 'p'
          },
          {
            title: 'Blockquote',
            format: 'blockquote'
          },
          {
            title: 'Div',
            format: 'div'
          },
          {
            title: 'Pre',
            format: 'pre'
          }
        ]
      },
      {
        title: 'Alignment',
        items: [
          {
            title: 'Left',
            icon: 'align-left',
            format: 'alignleft'
          },
          {
            title: 'Center',
            icon: 'align-center',
            format: 'aligncenter'
          },
          {
            title: 'Right',
            icon: 'align-right',
            format: 'alignright'
          },
          {
            title: 'Justify',
            icon: 'align-justify',
            format: 'alignjustify'
          }
        ]
      }
    ];
    var isNestedFormat = function (format) {
      return has(format, 'items');
    };
    var isBlockFormat = function (format) {
      return has(format, 'block');
    };
    var isInlineFormat = function (format) {
      return has(format, 'inline');
    };
    var isSelectorFormat = function (format) {
      return has(format, 'selector');
    };
    var mapFormats = function (userFormats) {
      return foldl(userFormats, function (acc, fmt) {
        if (isNestedFormat(fmt)) {
          var result = mapFormats(fmt.items);
          return {
            customFormats: acc.customFormats.concat(result.customFormats),
            formats: acc.formats.concat([{
                title: fmt.title,
                items: result.formats
              }])
          };
        } else if (isInlineFormat(fmt) || isBlockFormat(fmt) || isSelectorFormat(fmt)) {
          var formatName = 'custom-' + fmt.title.toLowerCase();
          return {
            customFormats: acc.customFormats.concat([{
                name: formatName,
                format: fmt
              }]),
            formats: acc.formats.concat([{
                title: fmt.title,
                format: formatName,
                icon: fmt.icon
              }])
          };
        } else {
          return __assign({}, acc, { formats: acc.formats.concat(fmt) });
        }
      }, {
        customFormats: [],
        formats: []
      });
    };
    var registerCustomFormats = function (editor, userFormats) {
      var result = mapFormats(userFormats);
      var registerFormats = function (customFormats) {
        each(customFormats, function (fmt) {
          if (!editor.formatter.has(fmt.name)) {
            editor.formatter.register(fmt.name, fmt.format);
          }
        });
      };
      if (editor.formatter) {
        registerFormats(result.customFormats);
      } else {
        editor.on('init', function () {
          registerFormats(result.customFormats);
        });
      }
      return result.formats;
    };
    var getStyleFormats = function (editor) {
      return getUserStyleFormats(editor).map(function (userFormats) {
        var registeredUserFormats = registerCustomFormats(editor, userFormats);
        return isMergeStyleFormats(editor) ? defaultStyleFormats.concat(registeredUserFormats) : registeredUserFormats;
      }).getOr(defaultStyleFormats);
    };

    var processBasic = function (item, isSelectedFor, getPreviewFor) {
      var formatterSpec = {
        type: 'formatter',
        isSelected: isSelectedFor(item.format),
        getStylePreview: getPreviewFor(item.format)
      };
      return deepMerge(item, formatterSpec);
    };
    var register$3 = function (editor, formats, isSelectedFor, getPreviewFor) {
      var enrichSupported = function (item) {
        return processBasic(item, isSelectedFor, getPreviewFor);
      };
      var enrichMenu = function (item) {
        var submenuSpec = {
          type: 'submenu',
          isSelected: constant(false),
          getStylePreview: function () {
            return Option.none();
          }
        };
        return deepMerge(item, submenuSpec);
      };
      var enrichCustom = function (item) {
        var formatName = generate$1(item.title);
        var customSpec = {
          type: 'formatter',
          format: formatName,
          isSelected: isSelectedFor(formatName),
          getStylePreview: getPreviewFor(formatName)
        };
        var newItem = deepMerge(item, customSpec);
        editor.formatter.register(formatName, newItem);
        return newItem;
      };
      var doEnrich = function (items) {
        return map(items, function (item) {
          var keys$$1 = keys(item);
          if (hasKey$1(item, 'items')) {
            var newItems_1 = doEnrich(item.items);
            return deepMerge(enrichMenu(item), {
              getStyleItems: function () {
                return newItems_1;
              }
            });
          } else if (hasKey$1(item, 'format')) {
            return enrichSupported(item);
          } else if (keys$$1.length === 1 && contains(keys$$1, 'title')) {
            return deepMerge(item, { type: 'separator' });
          } else {
            return enrichCustom(item);
          }
        });
      };
      return doEnrich(formats);
    };

    var init$7 = function (editor) {
      var isSelectedFor = function (format) {
        return function () {
          return editor.formatter.match(format);
        };
      };
      var getPreviewFor = function (format) {
        return function () {
          var fmt = editor.formatter.get(format);
          return fmt !== undefined ? Option.some({
            tag: fmt.length > 0 ? fmt[0].inline || fmt[0].block || 'div' : 'div',
            styleAttr: editor.formatter.getCssText(format)
          }) : Option.none();
        };
      };
      var flatten$$1 = function (fmt) {
        var subs = fmt.items;
        return subs !== undefined && subs.length > 0 ? bind(subs, flatten$$1) : [fmt.format];
      };
      var settingsFormats = Cell([]);
      var settingsFlattenedFormats = Cell([]);
      var eventsFormats = Cell([]);
      var eventsFlattenedFormats = Cell([]);
      var replaceSettings = Cell(false);
      editor.on('init', function () {
        var formats = getStyleFormats(editor);
        var enriched = register$3(editor, formats, isSelectedFor, getPreviewFor);
        settingsFormats.set(enriched);
        settingsFlattenedFormats.set(bind(enriched, flatten$$1));
      });
      editor.on('addStyleModifications', function (e) {
        var modifications = register$3(editor, e.items, isSelectedFor, getPreviewFor);
        eventsFormats.set(modifications);
        replaceSettings.set(e.replace);
        eventsFlattenedFormats.set(bind(modifications, flatten$$1));
      });
      var getData = function () {
        var fromSettings = replaceSettings.get() ? [] : settingsFormats.get();
        var fromEvents = eventsFormats.get();
        return fromSettings.concat(fromEvents);
      };
      var getFlattenedKeys = function () {
        var fromSettings = replaceSettings.get() ? [] : settingsFlattenedFormats.get();
        var fromEvents = eventsFlattenedFormats.get();
        return fromSettings.concat(fromEvents);
      };
      return {
        getData: getData,
        getFlattenedKeys: getFlattenedKeys
      };
    };

    var trim$1 = global$a.trim;
    var hasContentEditableState = function (value) {
      return function (node) {
        if (node && node.nodeType === 1) {
          if (node.contentEditable === value) {
            return true;
          }
          if (node.getAttribute('data-mce-contenteditable') === value) {
            return true;
          }
        }
        return false;
      };
    };
    var isContentEditableTrue = hasContentEditableState('true');
    var isContentEditableFalse = hasContentEditableState('false');
    var create$8 = function (type, title, url, level, attach) {
      return {
        type: type,
        title: title,
        url: url,
        level: level,
        attach: attach
      };
    };
    var isChildOfContentEditableTrue = function (node) {
      while (node = node.parentNode) {
        var value = node.contentEditable;
        if (value && value !== 'inherit') {
          return isContentEditableTrue(node);
        }
      }
      return false;
    };
    var select = function (selector, root) {
      return map(descendants$1(Element$$1.fromDom(root), selector), function (element) {
        return element.dom();
      });
    };
    var getElementText = function (elm) {
      return elm.innerText || elm.textContent;
    };
    var getOrGenerateId = function (elm) {
      return elm.id ? elm.id : generate$1('h');
    };
    var isAnchor = function (elm) {
      return elm && elm.nodeName === 'A' && (elm.id || elm.name) !== undefined;
    };
    var isValidAnchor = function (elm) {
      return isAnchor(elm) && isEditable(elm);
    };
    var isHeader = function (elm) {
      return elm && /^(H[1-6])$/.test(elm.nodeName);
    };
    var isEditable = function (elm) {
      return isChildOfContentEditableTrue(elm) && !isContentEditableFalse(elm);
    };
    var isValidHeader = function (elm) {
      return isHeader(elm) && isEditable(elm);
    };
    var getLevel = function (elm) {
      return isHeader(elm) ? parseInt(elm.nodeName.substr(1), 10) : 0;
    };
    var headerTarget = function (elm) {
      var headerId = getOrGenerateId(elm);
      var attach = function () {
        elm.id = headerId;
      };
      return create$8('header', getElementText(elm), '#' + headerId, getLevel(elm), attach);
    };
    var anchorTarget = function (elm) {
      var anchorId = elm.id || elm.name;
      var anchorText = getElementText(elm);
      return create$8('anchor', anchorText ? anchorText : '#' + anchorId, '#' + anchorId, 0, noop);
    };
    var getHeaderTargets = function (elms) {
      return map(filter(elms, isValidHeader), headerTarget);
    };
    var getAnchorTargets = function (elms) {
      return map(filter(elms, isValidAnchor), anchorTarget);
    };
    var getTargetElements = function (elm) {
      var elms = select('h1,h2,h3,h4,h5,h6,a:not([href])', elm);
      return elms;
    };
    var hasTitle = function (target) {
      return trim$1(target.title).length > 0;
    };
    var find$6 = function (elm) {
      var elms = getTargetElements(elm);
      return filter(getHeaderTargets(elms).concat(getAnchorTargets(elms)), hasTitle);
    };
    var LinkTargets = { find: find$6 };

    var STORAGE_KEY = 'tinymce-url-history';
    var HISTORY_LENGTH = 5;
    var isHttpUrl = function (url) {
      return isString(url) && /^https?/.test(url);
    };
    var isArrayOfUrl = function (a) {
      return isArray(a) && a.length <= HISTORY_LENGTH && forall(a, isHttpUrl);
    };
    var isRecordOfUrlArray = function (r) {
      return isObject(r) && find$1(r, function (value) {
        return !isArrayOfUrl(value);
      }).isNone();
    };
    var getAllHistory = function () {
      var unparsedHistory = localStorage.getItem(STORAGE_KEY);
      if (unparsedHistory === null) {
        return {};
      }
      var history$$1;
      try {
        history$$1 = JSON.parse(unparsedHistory);
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.log('Local storage ' + STORAGE_KEY + ' was not valid JSON', e);
          return {};
        }
        throw e;
      }
      if (!isRecordOfUrlArray(history$$1)) {
        console.log('Local storage ' + STORAGE_KEY + ' was not valid format', history$$1);
        return {};
      }
      return history$$1;
    };
    var setAllHistory = function (history$$1) {
      if (!isRecordOfUrlArray(history$$1)) {
        throw new Error('Bad format for history:\n' + JSON.stringify(history$$1));
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history$$1));
    };
    var getHistory = function (fileType) {
      var history$$1 = getAllHistory();
      return Object.prototype.hasOwnProperty.call(history$$1, fileType) ? history$$1[fileType] : [];
    };
    var addToHistory = function (url, fileType) {
      if (!isHttpUrl(url)) {
        return;
      }
      var history$$1 = getAllHistory();
      var items = Object.prototype.hasOwnProperty.call(history$$1, fileType) ? history$$1[fileType] : [];
      var itemsWithoutUrl = filter(items, function (item) {
        return item !== url;
      });
      history$$1[fileType] = [url].concat(itemsWithoutUrl).slice(0, HISTORY_LENGTH);
      setAllHistory(history$$1);
    };

    var hasOwnProperty$2 = Object.prototype.hasOwnProperty;
    var isTruthy = function (value) {
      return !!value;
    };
    var makeMap = function (value) {
      return map$1(global$a.makeMap(value, /[, ]/), isTruthy);
    };
    var getOpt$1 = function (obj, key) {
      return hasOwnProperty$2.call(obj, key) ? Option.some(obj[key]) : Option.none();
    };
    var getTextSetting = function (settings, name, defaultValue) {
      var value = getOpt$1(settings, name).getOr(defaultValue);
      return isString(value) ? Option.some(value) : Option.none();
    };
    var getPickerSetting = function (settings, filetype) {
      var optFileTypes = Option.some(settings.file_picker_types).filter(isTruthy);
      var optLegacyTypes = Option.some(settings.file_browser_callback_types).filter(isTruthy);
      var optTypes = optFileTypes.or(optLegacyTypes).map(makeMap);
      var on = optTypes.fold(function () {
        return true;
      }, function (types) {
        return getOpt$1(types, filetype).getOr(false);
      });
      var optPicker = Option.some(settings.file_picker_callback).filter(isFunction);
      return !on ? Option.none() : optPicker;
    };
    var getLinkInformation = function (editor) {
      return function () {
        if (editor.settings.typeahead_urls === false) {
          return Option.none();
        }
        return Option.some({
          targets: LinkTargets.find(editor.getBody()),
          anchorTop: getTextSetting(editor.settings, 'anchor_top', '#top'),
          anchorBottom: getTextSetting(editor.settings, 'anchor_bottom', '#bottom')
        });
      };
    };
    var getValidationHandler = function (editor) {
      return function () {
        var validatorHandler = editor.settings.filepicker_validator_handler;
        return isFunction(validatorHandler) ? Option.some(validatorHandler) : Option.none();
      };
    };
    var getUrlPicker = function (editor) {
      return function (filetype) {
        return getPickerSetting(editor.settings, filetype).map(function (picker) {
          return function (entry) {
            return Future.nu(function (completer) {
              var handler = function (value, meta) {
                if (!isString(value)) {
                  throw new Error('Expected value to be string');
                }
                if (meta !== undefined && !isObject(meta)) {
                  throw new Error('Expected meta to be a object');
                }
                var r = {
                  value: value,
                  meta: meta
                };
                completer(r);
              };
              var meta = global$a.extend({ filetype: filetype }, Option.from(entry.meta).getOr({}));
              picker.call(editor, handler, entry.value, meta);
            });
          };
        });
      };
    };
    var UrlInputBackstage = function (editor) {
      return {
        getHistory: getHistory,
        addToHistory: addToHistory,
        getLinkInformation: getLinkInformation(editor),
        getValidationHandler: getValidationHandler(editor),
        getUrlPicker: getUrlPicker(editor)
      };
    };

    var bubbleAlignments = {
      valignCentre: [],
      alignCentre: [],
      alignLeft: [],
      alignRight: [],
      right: [],
      left: [],
      bottom: [],
      top: []
    };
    var init$8 = function (sink, editor, lazyAnchorbar) {
      var backstage = {
        shared: {
          providers: {
            icons: function () {
              return editor.ui.registry.getAll().icons;
            },
            menuItems: function () {
              return editor.ui.registry.getAll().menuItems;
            },
            translate: global$2.translate
          },
          interpreter: function (s) {
            return interpretWithoutForm(s, backstage);
          },
          anchors: {
            toolbar: function () {
              return {
                anchor: 'hotspot',
                hotspot: lazyAnchorbar(),
                bubble: nu$7(-12, 12, bubbleAlignments),
                layouts: {
                  onRtl: function () {
                    return [southeast$1];
                  },
                  onLtr: function () {
                    return [southwest$1];
                  }
                }
              };
            },
            banner: function () {
              return {
                anchor: 'hotspot',
                hotspot: lazyAnchorbar(),
                layouts: {
                  onRtl: function () {
                    return [south$1];
                  },
                  onLtr: function () {
                    return [south$1];
                  }
                }
              };
            },
            cursor: function () {
              return {
                anchor: 'selection',
                root: Element$$1.fromDom(editor.getBody()),
                getSelection: function () {
                  var rng = editor.selection.getRng();
                  return Option.some(range$1(Element$$1.fromDom(rng.startContainer), rng.startOffset, Element$$1.fromDom(rng.endContainer), rng.endOffset));
                }
              };
            },
            node: function (element) {
              return {
                anchor: 'node',
                root: Element$$1.fromDom(editor.getBody()),
                node: element
              };
            }
          },
          getSink: function () {
            return Result.value(sink);
          }
        },
        urlinput: UrlInputBackstage(editor),
        styleselect: init$7(editor),
        colorinput: ColorInputBackstage(editor)
      };
      return backstage;
    };

    var global$c = tinymce.util.Tools.resolve('tinymce.util.Delay');

    var showContextToolbarEvent = 'contexttoolbar-show';

    var schema$j = constant([
      defaulted$1('shell', true),
      field$1('toolbarBehaviours', [Replacing])
    ]);
    var enhanceGroups = function (detail) {
      return { behaviours: derive$1([Replacing.config({})]) };
    };
    var parts$7 = constant([optional({
        name: 'groups',
        overrides: enhanceGroups
      })]);

    var factory$9 = function (detail, components$$1, spec, _externals) {
      var setGroups = function (toolbar$$1, groups) {
        getGroupContainer(toolbar$$1).fold(function () {
          console.error('Toolbar was defined to not be a shell, but no groups container was specified in components');
          throw new Error('Toolbar was defined to not be a shell, but no groups container was specified in components');
        }, function (container) {
          Replacing.set(container, groups);
        });
      };
      var getGroupContainer = function (component) {
        return detail.shell ? Option.some(component) : getPart(component, detail, 'groups');
      };
      var extra = detail.shell ? {
        behaviours: [Replacing.config({})],
        components: []
      } : {
        behaviours: [],
        components: components$$1
      };
      return {
        uid: detail.uid,
        dom: detail.dom,
        components: extra.components,
        behaviours: augment(detail.toolbarBehaviours, extra.behaviours),
        apis: { setGroups: setGroups },
        domModification: { attributes: { role: 'group' } }
      };
    };
    var Toolbar = composite$1({
      name: 'Toolbar',
      configFields: schema$j(),
      partFields: parts$7(),
      factory: factory$9,
      apis: {
        setGroups: function (apis, toolbar$$1, groups) {
          apis.setGroups(toolbar$$1, groups);
        }
      }
    });

    var schema$k = constant([
      strict$1('items'),
      markers(['itemSelector']),
      field$1('tgroupBehaviours', [Keying])
    ]);
    var parts$8 = constant([group({
        name: 'items',
        unit: 'item'
      })]);

    var factory$a = function (detail, components, spec, _externals) {
      return {
        'uid': detail.uid,
        'dom': detail.dom,
        'components': components,
        'behaviours': augment(detail.tgroupBehaviours, [Keying.config({
            mode: 'flow',
            selector: detail.markers.itemSelector
          })]),
        domModification: { attributes: { role: 'toolbar' } }
      };
    };
    var ToolbarGroup = composite$1({
      name: 'ToolbarGroup',
      configFields: schema$k(),
      partFields: parts$8(),
      factory: factory$a
    });

    var renderToolbarGroup = function (foo) {
      var attributes = foo.title.fold(function () {
        return {};
      }, function (title) {
        return { attributes: { title: title } };
      });
      return ToolbarGroup.sketch({
        dom: __assign({
          tag: 'div',
          classes: ['tox-toolbar__group']
        }, attributes),
        components: [ToolbarGroup.parts().items({})],
        items: foo.items,
        markers: { itemSelector: '*:not(.tox-split-button) > .tox-tbtn:not([disabled]), .tox-split-button:not([disabled]), .tox-toolbar-nav-js:not([disabled])' },
        tgroupBehaviours: derive$1([
          Tabstopping.config({}),
          Focusing.config({})
        ])
      });
    };
    var renderToolbar = function (foo) {
      var modeName = foo.cyclicKeying ? 'cyclic' : 'acyclic';
      return Toolbar.sketch({
        uid: foo.uid,
        dom: {
          tag: 'div',
          classes: ['tox-toolbar']
        },
        components: [Toolbar.parts().groups({})],
        toolbarBehaviours: derive$1([
          Keying.config({
            mode: modeName,
            onEscape: foo.onEscape,
            selector: '.tox-toolbar__group'
          }),
          config('toolbar-events', [runOnAttached(function (component) {
              var groups = map(foo.initGroups, renderToolbarGroup);
              Toolbar.setGroups(component, groups);
            })])
        ])
      });
    };

    var baseToolbarButtonFields = [
      defaultedBoolean('disabled', false),
      optionString('tooltip'),
      optionString('icon'),
      optionString('text'),
      defaultedFunction('onSetup', function () {
        return noop;
      })
    ];
    var toolbarButtonSchema = objOf([
      strictString('type'),
      strictFunction('onAction')
    ].concat(baseToolbarButtonFields));
    var createToolbarButton = function (spec) {
      return asRaw('toolbarbutton', toolbarButtonSchema, spec);
    };

    var MenuButtonSchema = objOf([
      strictString('type'),
      optionString('tooltip'),
      optionString('icon'),
      optionString('text'),
      strictFunction('fetch'),
      defaultedFunction('onSetup', function () {
        return noop;
      })
    ]);
    var createMenuButton = function (spec) {
      return asRaw('menubutton', MenuButtonSchema, spec);
    };

    var splitButtonSchema = objOf([
      strictString('type'),
      optionString('tooltip'),
      optionString('icon'),
      optionString('text'),
      optionFunction('select'),
      strictFunction('fetch'),
      defaultedFunction('onSetup', function () {
        return noop;
      }),
      defaultedStringEnum('presets', 'normal', [
        'normal',
        'color',
        'toolbar'
      ]),
      defaulted$1('columns', 1),
      strictFunction('onAction'),
      strictFunction('onItemAction')
    ]);
    var createSplitButton = function (spec) {
      return asRaw('SplitButton', splitButtonSchema, spec);
    };

    var baseToolbarToggleButtonFields = [defaultedBoolean('active', false)].concat(baseToolbarButtonFields);
    var toggleButtonSchema = objOf(baseToolbarToggleButtonFields.concat([
      strictString('type'),
      strictFunction('onAction')
    ]));
    var createToggleButton = function (spec) {
      return asRaw('ToggleButton', toggleButtonSchema, spec);
    };

    var contextBarFields = [
      defaultedFunction('predicate', function () {
        return false;
      }),
      defaultedStringEnum('scope', 'node', [
        'node',
        'editor'
      ]),
      defaultedStringEnum('position', 'selection', [
        'node',
        'selection',
        'line'
      ])
    ];
    var contextButtonFields = baseToolbarButtonFields.concat([
      defaulted$1('type', 'contextformbutton'),
      defaulted$1('primary', false),
      strictFunction('onAction'),
      state$1('original', identity)
    ]);
    var contextToggleButtonFields = baseToolbarToggleButtonFields.concat([
      defaulted$1('type', 'contextformbutton'),
      defaulted$1('primary', false),
      strictFunction('onAction'),
      state$1('original', identity)
    ]);
    var launchButtonFields = baseToolbarButtonFields.concat([defaulted$1('type', 'contextformbutton')]);
    var launchToggleButtonFields = baseToolbarToggleButtonFields.concat([defaulted$1('type', 'contextformtogglebutton')]);
    var toggleOrNormal = choose$1('type', {
      contextformbutton: contextButtonFields,
      contextformtogglebutton: contextToggleButtonFields
    });
    var contextFormSchema = objOf([
      defaulted$1('type', 'contextform'),
      defaultedFunction('initValue', function () {
        return '';
      }),
      optionString('label'),
      strictArrayOf('commands', toggleOrNormal),
      optionOf('launch', choose$1('type', {
        contextformbutton: launchButtonFields,
        contextformtogglebutton: launchToggleButtonFields
      }))
    ].concat(contextBarFields));
    var contextToolbarSchema = objOf([
      defaulted$1('type', 'contexttoolbar'),
      strictString('items')
    ].concat(contextBarFields));
    var createContextToolbar = function (spec) {
      return asRaw('ContextToolbar', contextToolbarSchema, spec);
    };
    var createContextForm = function (spec) {
      return asRaw('ContextForm', contextFormSchema, spec);
    };

    var internalToolbarButtonExecute = generate$1('toolbar.button.execute');
    var onToolbarButtonExecute = function (info) {
      return runOnExecute(function (comp, simulatedEvent) {
        runWithApi(info, comp)(function (itemApi) {
          emitWith(comp, internalToolbarButtonExecute, { buttonApi: itemApi });
          info.onAction(itemApi);
        });
      });
    };
    var toolbarButtonEventOrder = {
      'alloy.execute': [
        'disabling',
        'alloy.base.behaviour',
        'toggling',
        'toolbar-button-events'
      ]
    };

    var getState$2 = function (component, replaceConfig, reflectState) {
      return reflectState;
    };

    var ReflectingApis = /*#__PURE__*/Object.freeze({
        getState: getState$2
    });

    var events$c = function (reflectingConfig, reflectingState) {
      var update = function (component, data) {
        reflectingConfig.updateState.each(function (updateState) {
          var newState = updateState(component, data);
          reflectingState.set(newState);
        });
        reflectingConfig.renderComponents.each(function (renderComponents) {
          var newComponents = renderComponents(data, reflectingState.get());
          detachChildren(component);
          each(newComponents, function (c) {
            attach(component, component.getSystem().build(c));
          });
        });
      };
      return derive([
        run(receive(), function (component, message) {
          var channel = reflectingConfig.channel;
          if (contains(message.channels(), channel)) {
            update(component, message.data());
          }
        }),
        runOnAttached(function (comp, se) {
          reflectingConfig.initialData.each(function (rawData) {
            update(comp, rawData);
          });
        })
      ]);
    };

    var ActiveReflecting = /*#__PURE__*/Object.freeze({
        events: events$c
    });

    var init$9 = function (spec) {
      var cell = Cell(Option.none());
      var set = function (optS) {
        return cell.set(optS);
      };
      var clear = function () {
        return cell.set(Option.none());
      };
      var get = function () {
        return cell.get();
      };
      var readState = function () {
        return cell.get().getOr('none');
      };
      return {
        readState: readState,
        get: get,
        set: set,
        clear: clear
      };
    };

    var ReflectingState = /*#__PURE__*/Object.freeze({
        init: init$9
    });

    var ReflectingSchema = [
      strict$1('channel'),
      option('renderComponents'),
      option('updateState'),
      option('initialData')
    ];

    var Reflecting = create$1({
      fields: ReflectingSchema,
      name: 'reflecting',
      active: ActiveReflecting,
      apis: ReflectingApis,
      state: ReflectingState
    });

    var schema$l = constant([
      strict$1('toggleClass'),
      strict$1('fetch'),
      onStrictHandler('onExecute'),
      defaulted$1('getHotspot', Option.some),
      defaulted$1('layouts', Option.none()),
      onStrictHandler('onItemExecute'),
      option('lazySink'),
      strict$1('dom'),
      onHandler('onOpen'),
      field$1('splitDropdownBehaviours', [
        Coupling,
        Keying,
        Focusing
      ]),
      defaulted$1('matchWidth', false),
      defaulted$1('useMinWidth', false),
      defaulted$1('eventOrder', {}),
      option('role')
    ].concat(sandboxFields()));
    var arrowPart = required({
      factory: Button,
      schema: [strict$1('dom')],
      name: 'arrow',
      defaults: function (detail) {
        return { buttonBehaviours: derive$1([Focusing.revoke()]) };
      },
      overrides: function (detail) {
        return {
          dom: {
            tag: 'span',
            attributes: { role: 'presentation' }
          },
          action: function (arrow) {
            arrow.getSystem().getByUid(detail.uid).each(emitExecute);
          },
          buttonBehaviours: derive$1([Toggling.config({
              toggleOnExecute: false,
              toggleClass: detail.toggleClass
            })])
        };
      }
    });
    var buttonPart = required({
      factory: Button,
      schema: [strict$1('dom')],
      name: 'button',
      defaults: function (detail) {
        return { buttonBehaviours: derive$1([Focusing.revoke()]) };
      },
      overrides: function (detail) {
        return {
          dom: {
            tag: 'span',
            attributes: { role: 'presentation' }
          },
          action: function (btn) {
            btn.getSystem().getByUid(detail.uid).each(function (splitDropdown) {
              detail.onExecute(splitDropdown, btn);
            });
          }
        };
      }
    });
    var parts$9 = constant([
      arrowPart,
      buttonPart,
      optional({
        factory: {
          sketch: function (spec) {
            return {
              uid: spec.uid,
              dom: {
                tag: 'span',
                styles: { display: 'none' },
                attributes: { 'aria-hidden': 'true' },
                innerHtml: spec.text
              }
            };
          }
        },
        schema: [strict$1('text')],
        name: 'aria-descriptor'
      }),
      external$1({
        schema: [tieredMenuMarkers()],
        name: 'menu',
        defaults: function (detail) {
          return {
            onExecute: function (tmenu, item) {
              tmenu.getSystem().getByUid(detail.uid).each(function (splitDropdown) {
                detail.onItemExecute(splitDropdown, tmenu, item);
              });
            }
          };
        }
      }),
      partType()
    ]);

    var factory$b = function (detail, components$$1, spec, externals) {
      var switchToMenu = function (sandbox) {
        Composing.getCurrent(sandbox).each(function (current) {
          Highlighting.highlightFirst(current);
          Keying.focusIn(current);
        });
      };
      var action = function (component) {
        var onOpenSync = switchToMenu;
        togglePopup(detail, function (x) {
          return x;
        }, component, externals, onOpenSync, HighlightOnOpen.HighlightFirst).get(noop);
      };
      var openMenu = function (comp) {
        action(comp);
        return Option.some(true);
      };
      var executeOnButton = function (comp) {
        var button = getPartOrDie(comp, detail, 'button');
        emitExecute(button);
        return Option.some(true);
      };
      var buttonEvents = merge(derive([runOnAttached(function (component, simulatedEvent) {
          var ariaDescriptor = getPart(component, detail, 'aria-descriptor');
          ariaDescriptor.each(function (descriptor) {
            var descriptorId = generate$1('aria');
            set$1(descriptor.element(), 'id', descriptorId);
            set$1(component.element(), 'aria-describedby', descriptorId);
          });
        })]), events$7(Option.some(action)));
      return {
        uid: detail.uid,
        dom: detail.dom,
        components: components$$1,
        eventOrder: __assign({}, detail.eventOrder, {
          'alloy.execute': [
            'disabling',
            'toggling',
            'alloy.base.behaviour'
          ]
        }),
        events: buttonEvents,
        behaviours: augment(detail.splitDropdownBehaviours, [
          Coupling.config({
            others: {
              sandbox: function (hotspot) {
                var arrow = getPartOrDie(hotspot, detail, 'arrow');
                var extras = {
                  onOpen: function () {
                    Toggling.on(arrow);
                    Toggling.on(hotspot);
                  },
                  onClose: function () {
                    Toggling.off(arrow);
                    Toggling.off(hotspot);
                  }
                };
                return makeSandbox(detail, hotspot, extras);
              }
            }
          }),
          Keying.config({
            mode: 'special',
            onSpace: executeOnButton,
            onEnter: executeOnButton,
            onDown: openMenu
          }),
          Focusing.config({}),
          Toggling.config({
            toggleOnExecute: false,
            aria: { mode: 'expanded' }
          })
        ]),
        domModification: {
          attributes: {
            role: detail.role.getOr('button'),
            'aria-haspopup': true
          }
        }
      };
    };
    var SplitDropdown = composite$1({
      name: 'SplitDropdown',
      configFields: schema$l(),
      partFields: parts$9(),
      factory: factory$b
    });

    var getButtonApi = function (component) {
      return {
        isDisabled: function () {
          return Disabling.isDisabled(component);
        },
        setDisabled: function (state) {
          return state ? Disabling.disable(component) : Disabling.enable(component);
        }
      };
    };
    var getToggleApi = function (component) {
      return {
        setActive: function (state) {
          Toggling.set(component, state);
        },
        isActive: function () {
          return Toggling.isOn(component);
        },
        isDisabled: function () {
          return Disabling.isDisabled(component);
        },
        setDisabled: function (state) {
          return state ? Disabling.disable(component) : Disabling.enable(component);
        }
      };
    };
    var getTooltipAttributes = function (tooltip, providersBackstage) {
      return tooltip.map(function (tooltip) {
        return {
          'aria-label': providersBackstage.translate(tooltip),
          'title': providersBackstage.translate(tooltip)
        };
      }).getOr({});
    };
    var focusButtonEvent = generate$1('focus-button');
    var renderCommonStructure = function (icon, text, tooltip, receiver, behaviours, providersBackstage) {
      var _a;
      return {
        dom: {
          tag: 'button',
          classes: ['tox-tbtn'].concat(text.isSome() ? ['tox-tbtn--select'] : []),
          attributes: getTooltipAttributes(tooltip, providersBackstage)
        },
        components: componentRenderPipeline([
          icon.map(function (iconName) {
            return renderIconFromPack(iconName, providersBackstage.icons);
          }),
          text.map(function (text) {
            return renderLabel$1(text, 'tox-tbtn', providersBackstage);
          })
        ]),
        eventOrder: (_a = {}, _a[mousedown()] = [
          'focusing',
          'alloy.base.behaviour',
          'common-button-display-events'
        ], _a),
        buttonBehaviours: derive$1([config('common-button-display-events', [run(mousedown(), function (button, se) {
              se.event().prevent();
              emit(button, focusButtonEvent);
            })])].concat(receiver.map(function (r) {
          return Reflecting.config({
            channel: r,
            initialData: {
              icon: icon,
              text: text
            },
            renderComponents: function (data, _state) {
              return componentRenderPipeline([
                data.icon.map(function (iconName) {
                  return renderIconFromPack(iconName, providersBackstage.icons);
                }),
                data.text.map(function (text) {
                  return renderLabel$1(text, 'tox-tbtn', providersBackstage);
                })
              ]);
            }
          });
        }).toArray()).concat(behaviours.getOr([])))
      };
    };
    var renderCommonToolbarButton = function (spec, specialisation, providersBackstage) {
      var editorOffCell = Cell(noop);
      var structure = renderCommonStructure(spec.icon, spec.text, spec.tooltip, Option.none(), Option.none(), providersBackstage);
      return Button.sketch({
        dom: structure.dom,
        components: structure.components,
        eventOrder: toolbarButtonEventOrder,
        buttonBehaviours: derive$1([
          config('toolbar-button-events', [
            onToolbarButtonExecute({
              onAction: spec.onAction,
              getApi: specialisation.getApi
            }),
            onControlAttached(specialisation, editorOffCell),
            onControlDetached(specialisation, editorOffCell)
          ]),
          DisablingConfigs.button(spec.disabled)
        ].concat(specialisation.toolbarButtonBehaviours))
      });
    };
    var renderToolbarButton = function (spec, providersBackstage) {
      return renderToolbarButtonWith(spec, providersBackstage, []);
    };
    var renderToolbarButtonWith = function (spec, providersBackstage, bonusEvents) {
      return renderCommonToolbarButton(spec, {
        toolbarButtonBehaviours: [].concat(bonusEvents.length > 0 ? [config('toolbarButtonWith', bonusEvents)] : []),
        getApi: getButtonApi,
        onSetup: spec.onSetup
      }, providersBackstage);
    };
    var renderToolbarToggleButton = function (spec, providersBackstage) {
      return renderToolbarToggleButtonWith(spec, providersBackstage, []);
    };
    var renderToolbarToggleButtonWith = function (spec, providersBackstage, bonusEvents) {
      return deepMerge(renderCommonToolbarButton(spec, {
        toolbarButtonBehaviours: [
          Replacing.config({}),
          Toggling.config({
            toggleClass: 'tox-tbtn--enabled',
            aria: { mode: 'pressed' },
            toggleOnExecute: false
          })
        ].concat(bonusEvents.length > 0 ? [config('toolbarToggleButtonWith', bonusEvents)] : []),
        getApi: getToggleApi,
        onSetup: spec.onSetup
      }, providersBackstage));
    };
    var fetchChoices = function (getApi, spec, providersBackstage) {
      return function (comp) {
        return Future.nu(function (callback) {
          return spec.fetch(callback);
        }).map(function (items) {
          return createTieredDataFrom(deepMerge(createPartialChoiceMenu(generate$1('menu-value'), items, function (value) {
            spec.onItemAction(getApi(comp), value);
          }, spec.columns, spec.presets, ItemResponse$1.CLOSE_ON_EXECUTE, spec.select.getOr(function () {
            return false;
          }), providersBackstage), {
            movement: deriveMenuMovement(spec.columns, spec.presets),
            menuBehaviours: SimpleBehaviours.unnamedEvents(spec.columns !== 'auto' ? [] : [runOnAttached(function (comp, se) {
                detectSize(comp, 4, classForPreset(spec.presets)).each(function (_a) {
                  var numRows = _a.numRows, numColumns = _a.numColumns;
                  Keying.setGridSize(comp, numRows, numColumns);
                });
              })])
          }));
        });
      };
    };
    var renderSplitButton = function (spec, sharedBackstage) {
      var _a;
      var displayChannel = generate$1('channel-update-split-dropdown-display');
      var getApi = function (comp) {
        return {
          isDisabled: function () {
            return true;
          },
          setDisabled: function () {
          },
          setIconFill: function (id, value) {
            descendant$2(comp.element(), 'svg path[id="' + id + '"], rect[id="' + id + '"]').each(function (underlinePath) {
              set$1(underlinePath, 'fill', value);
            });
          },
          setIconStroke: function (id, value) {
            descendant$2(comp.element(), 'svg path[id="' + id + '"], rect[id="' + id + '"]').each(function (underlinePath) {
              set$1(underlinePath, 'stroke', value);
            });
          },
          setActive: function (state) {
            set$1(comp.element(), 'aria-pressed', state);
            descendant$2(comp.element(), 'span').each(function (button) {
              comp.getSystem().getByDom(button).each(function (buttonComp) {
                return Toggling.set(buttonComp, state);
              });
            });
          },
          isActive: function () {
            return descendant$2(comp.element(), 'span').exists(function (button) {
              return comp.getSystem().getByDom(button).exists(Toggling.isOn);
            });
          }
        };
      };
      var editorOffCell = Cell(noop);
      var specialisation = {
        getApi: getApi,
        onSetup: spec.onSetup
      };
      return SplitDropdown.sketch({
        dom: {
          tag: 'div',
          classes: ['tox-split-button'],
          attributes: merge({ 'aria-pressed': false }, getTooltipAttributes(spec.tooltip, sharedBackstage.providers))
        },
        onExecute: function (button) {
          spec.onAction(getApi(button));
        },
        onItemExecute: function (a, b, c) {
        },
        splitDropdownBehaviours: derive$1([
          DisablingConfigs.splitButton(false),
          config('split-dropdown-events', [
            run(focusButtonEvent, Focusing.focus),
            onControlAttached(specialisation, editorOffCell),
            onControlDetached(specialisation, editorOffCell)
          ])
        ]),
        eventOrder: (_a = {}, _a[attachedToDom()] = [
          'alloy.base.behaviour',
          'split-dropdown-events'
        ], _a),
        toggleClass: 'tox-tbtn--enabled',
        lazySink: sharedBackstage.getSink,
        fetch: fetchChoices(getApi, spec, sharedBackstage.providers),
        parts: { menu: part(false, spec.columns, spec.presets) },
        components: [
          SplitDropdown.parts().button(renderCommonStructure(spec.icon, spec.text, Option.none(), Option.some(displayChannel), Option.some([Toggling.config({
              toggleClass: 'tox-tbtn--enabled',
              toggleOnExecute: false
            })]), sharedBackstage.providers)),
          SplitDropdown.parts().arrow({
            dom: {
              tag: 'button',
              classes: [
                'tox-tbtn',
                'tox-split-button__chevron'
              ],
              innerHtml: get$e('chevron-down', sharedBackstage.providers.icons)
            }
          }),
          SplitDropdown.parts()['aria-descriptor']({ text: sharedBackstage.providers.translate('To open the popup, press Shift+Enter') })
        ]
      });
    };

    var getFormApi = function (input) {
      return {
        hide: function () {
          return emit(input, sandboxClose());
        },
        getValue: function () {
          return Representing.getValue(input);
        }
      };
    };
    var runOnExecute$1 = function (memInput, original) {
      return run(internalToolbarButtonExecute, function (comp, se) {
        var input = memInput.get(comp);
        var formApi = getFormApi(input);
        original.onAction(formApi, se.event().buttonApi());
      });
    };
    var renderContextButton = function (memInput, button, extras) {
      var _a = button.original, primary = _a.primary, rest = __rest(_a, ['primary']);
      var bridged = getOrDie$1(createToolbarButton(__assign({}, rest, {
        type: 'button',
        onAction: function () {
        }
      })));
      return renderToolbarButtonWith(bridged, extras.backstage.shared.providers, [runOnExecute$1(memInput, button)]);
    };
    var renderContextToggleButton = function (memInput, button, extras) {
      var _a = button.original, primary = _a.primary, rest = __rest(_a, ['primary']);
      var bridged = getOrDie$1(createToggleButton(__assign({}, rest, {
        type: 'togglebutton',
        onAction: function () {
        }
      })));
      return renderToolbarToggleButtonWith(bridged, extras.backstage.shared.providers, [runOnExecute$1(memInput, button)]);
    };
    var generateOne$1 = function (memInput, button, providersBackstage) {
      var extras = { backstage: { shared: { providers: providersBackstage } } };
      if (button.type === 'contextformtogglebutton') {
        return renderContextToggleButton(memInput, button, extras);
      } else {
        return renderContextButton(memInput, button, extras);
      }
    };
    var generate$6 = function (memInput, buttons, providersBackstage) {
      var mementos = map(buttons, function (button) {
        return record(generateOne$1(memInput, button, providersBackstage));
      });
      var asSpecs = function () {
        return map(mementos, function (mem) {
          return mem.asSpec();
        });
      };
      var findPrimary = function (compInSystem) {
        return findMap(buttons, function (button, i) {
          if (button.primary) {
            return Option.from(mementos[i]).bind(function (mem) {
              return mem.getOpt(compInSystem);
            }).filter(not(Disabling.isDisabled));
          } else {
            return Option.none();
          }
        });
      };
      return {
        asSpecs: asSpecs,
        findPrimary: findPrimary
      };
    };

    var renderContextForm = function (ctx, providersBackstage) {
      var inputAttributes = ctx.label.fold(function () {
        return {};
      }, function (label) {
        return { 'aria-label': label };
      });
      var memInput = record(Input.sketch({
        inputClasses: [
          'tox-toolbar-textfield',
          'tox-toolbar-nav-js'
        ],
        data: ctx.initValue(),
        inputAttributes: inputAttributes,
        selectOnFocus: true,
        inputBehaviours: derive$1([Keying.config({
            mode: 'special',
            onEnter: function (input) {
              return commands.findPrimary(input).map(function (primary) {
                emitExecute(primary);
                return true;
              });
            },
            onLeft: function (comp, se) {
              se.cut();
              return Option.none();
            },
            onRight: function (comp, se) {
              se.cut();
              return Option.none();
            }
          })])
      }));
      var commands = generate$6(memInput, ctx.commands, providersBackstage);
      return renderToolbar({
        uid: generate$1('context-toolbar'),
        initGroups: [
          {
            title: Option.none(),
            items: [memInput.asSpec()]
          },
          {
            title: Option.none(),
            items: commands.asSpecs()
          }
        ],
        onEscape: Option.none,
        cyclicKeying: true
      });
    };
    var ContextForm = { renderContextForm: renderContextForm };

    var forwardSlideEvent = generate$1('forward-slide');
    var backSlideEvent = generate$1('backward-slide');
    var changeSlideEvent = generate$1('change-slide-event');
    var resizingClass = 'tox-pop--resizing';
    var renderContextToolbar = function (spec) {
      var stack = Cell([]);
      return InlineView.sketch({
        dom: {
          tag: 'div',
          classes: ['tox-pop']
        },
        fireDismissalEventInstead: { event: 'doNotDismissYet' },
        onShow: function (comp) {
          stack.set([]);
          InlineView.getContent(comp).each(function (c) {
            remove$6(c.element(), 'visibility');
          });
          remove$4(comp.element(), resizingClass);
          remove$6(comp.element(), 'width');
        },
        inlineBehaviours: derive$1([
          config('context-toolbar-events', [
            runOnSource(transitionend(), function (comp, se) {
              InlineView.getContent(comp).each(function (c) {
              });
              remove$4(comp.element(), resizingClass);
              remove$6(comp.element(), 'width');
            }),
            run(changeSlideEvent, function (comp, se) {
              remove$6(comp.element(), 'width');
              var currentWidth = get$8(comp.element());
              InlineView.setContent(comp, se.event().contents());
              add$2(comp.element(), resizingClass);
              var newWidth = get$8(comp.element());
              set$2(comp.element(), 'width', currentWidth + 'px');
              InlineView.getContent(comp).each(function (newContents) {
                se.event().focus().bind(function (f) {
                  focus$2(f);
                  return search$1(comp.element());
                }).orThunk(function () {
                  Keying.focusIn(newContents);
                  return active();
                });
              });
              setTimeout(function () {
                set$2(comp.element(), 'width', newWidth + 'px');
              }, 0);
            }),
            run(forwardSlideEvent, function (comp, se) {
              InlineView.getContent(comp).each(function (oldContents) {
                stack.set(stack.get().concat([{
                    bar: oldContents,
                    focus: active()
                  }]));
              });
              emitWith(comp, changeSlideEvent, {
                contents: se.event().forwardContents(),
                focus: Option.none()
              });
            }),
            run(backSlideEvent, function (comp, se) {
              last(stack.get()).each(function (last$$1) {
                stack.set(stack.get().slice(0, stack.get().length - 1));
                emitWith(comp, changeSlideEvent, {
                  contents: premade$1(last$$1.bar),
                  focus: last$$1.focus
                });
              });
            })
          ]),
          Keying.config({
            mode: 'special',
            onEscape: function (comp) {
              return last(stack.get()).fold(function () {
                return spec.onEscape();
              }, function (_) {
                emit(comp, backSlideEvent);
                return Option.some(true);
              });
            }
          })
        ]),
        lazySink: function () {
          return Result.value(spec.sink);
        }
      });
    };

    var ancestor$4 = function (scope, transform, isRoot) {
      var element = scope.dom();
      var stop = isFunction(isRoot) ? isRoot : constant(false);
      while (element.parentNode) {
        element = element.parentNode;
        var el = Element$$1.fromDom(element);
        var transformed = transform(el);
        if (transformed.isSome()) {
          return transformed;
        } else if (stop(el)) {
          break;
        }
      }
      return Option.none();
    };

    var matchTargetWith = function (elem, toolbars) {
      return findMap(toolbars, function (toolbarApi) {
        return toolbarApi.predicate(elem.dom()) ? Option.some({
          toolbarApi: toolbarApi,
          elem: elem
        }) : Option.none();
      });
    };
    var lookup$1 = function (scopes, editor) {
      var isRoot = function (elem) {
        return elem.dom() === editor.getBody();
      };
      var startNode = Element$$1.fromDom(editor.selection.getNode());
      return matchTargetWith(startNode, scopes.inNodeScope).orThunk(function () {
        return matchTargetWith(startNode, scopes.inEditorScope).orThunk(function () {
          return ancestor$4(startNode, function (elem) {
            return matchTargetWith(elem, scopes.inNodeScope);
          }, isRoot);
        });
      });
    };
    var ToolbarLookup = { lookup: lookup$1 };

    var categorise = function (contextToolbars, navigate) {
      var forms = {};
      var inNodeScope = [];
      var inEditorScope = [];
      var formNavigators = {};
      var lookupTable = {};
      var registerForm = function (key, toolbarApi) {
        var contextForm = getOrDie$1(createContextForm(toolbarApi));
        forms[key] = contextForm;
        contextForm.launch.map(function (launch) {
          formNavigators['form:' + key + ''] = __assign({}, toolbarApi.launch, {
            type: launch.type === 'contextformtogglebutton' ? 'togglebutton' : 'button',
            onAction: function () {
              navigate(contextForm);
            }
          });
        });
        if (contextForm.scope === 'editor') {
          inEditorScope.push(contextForm);
        } else {
          inNodeScope.push(contextForm);
        }
        lookupTable[key] = contextForm;
      };
      var registerToolbar = function (key, toolbarApi) {
        createContextToolbar(toolbarApi).each(function (contextToolbar) {
          if (toolbarApi.scope === 'editor') {
            inEditorScope.push(contextToolbar);
          } else {
            inNodeScope.push(contextToolbar);
          }
          lookupTable[key] = contextToolbar;
        });
      };
      var keys$$1 = keys(contextToolbars);
      each(keys$$1, function (key) {
        var toolbarApi = contextToolbars[key];
        if (toolbarApi.type === 'contextform') {
          registerForm(key, toolbarApi);
        } else if (toolbarApi.type === 'contexttoolbar') {
          registerToolbar(key, toolbarApi);
        }
      });
      return {
        forms: forms,
        inNodeScope: inNodeScope,
        inEditorScope: inEditorScope,
        lookupTable: lookupTable,
        formNavigators: formNavigators
      };
    };
    var ToolbarScopes = { categorise: categorise };

    var updateMenuText = generate$1('update-menu-text');
    var renderCommonDropdown = function (spec, prefix, sharedBackstage) {
      var optMemDisplayText = spec.text.map(function (text$$1) {
        return record(renderLabel$1(text$$1, prefix, sharedBackstage.providers));
      });
      var onLeftOrRightInMenu = function (comp, se) {
        var dropdown = Representing.getValue(comp);
        Focusing.focus(dropdown);
        emitWith(dropdown, 'keydown', { raw: se.event().raw() });
        Dropdown.close(dropdown);
        return Option.some(true);
      };
      var role = spec.role.fold(function () {
        return {};
      }, function (role) {
        return { role: role };
      });
      var memDropdown = record(Dropdown.sketch(__assign({}, role, {
        dom: {
          tag: 'button',
          classes: [
            prefix,
            prefix + '--select'
          ].concat(map(spec.classes, function (c) {
            return prefix + '--' + c;
          })),
          attributes: spec.tooltip.fold(function () {
            return {};
          }, function (tooltip) {
            var translatedTooltip = sharedBackstage.providers.translate(tooltip);
            return {
              'title': translatedTooltip,
              'aria-label': translatedTooltip
            };
          })
        },
        components: componentRenderPipeline([
          spec.icon.map(function (iconName) {
            return renderIconFromPack(iconName, sharedBackstage.providers.icons);
          }),
          optMemDisplayText.map(function (mem) {
            return mem.asSpec();
          }),
          Option.some({
            dom: {
              tag: 'div',
              classes: [prefix + '__select-chevron'],
              innerHtml: get$e('chevron-down', sharedBackstage.providers.icons)
            }
          })
        ]),
        matchWidth: true,
        useMinWidth: true,
        dropdownBehaviours: derive$1([
          DisablingConfigs.button(spec.disabled),
          Unselecting.config({}),
          Replacing.config({}),
          config('menubutton-update-display-text', [
            runOnAttached(spec.onAttach),
            runOnDetached(spec.onDetach),
            run(updateMenuText, function (comp, se) {
              optMemDisplayText.bind(function (mem) {
                return mem.getOpt(comp);
              }).each(function (displayText) {
                Replacing.set(displayText, [text(sharedBackstage.providers.translate(se.event().text()))]);
              });
            })
          ])
        ]),
        eventOrder: deepMerge(toolbarButtonEventOrder, {
          mousedown: [
            'focusing',
            'alloy.base.behaviour',
            'item-type-events',
            'normal-dropdown-events'
          ]
        }),
        sandboxBehaviours: derive$1([Keying.config({
            mode: 'special',
            onLeft: onLeftOrRightInMenu,
            onRight: onLeftOrRightInMenu
          })]),
        lazySink: sharedBackstage.getSink,
        toggleClass: prefix + '--active',
        parts: { menu: part(false, spec.columns, spec.presets) },
        fetch: function () {
          return Future.nu(spec.fetch);
        }
      })));
      return memDropdown.asSpec();
    };

    var generateSelectItems = function (editor, backstage, spec) {
      var generateItem = function (rawItem, response, disabled) {
        var translatedText = backstage.shared.providers.translate(rawItem.title);
        if (rawItem.type === 'separator') {
          return {
            type: 'separator',
            text: translatedText
          };
        } else if (rawItem.type === 'submenu') {
          return {
            type: 'nestedmenuitem',
            text: translatedText,
            disabled: disabled,
            getSubmenuItems: function () {
              return bind(rawItem.getStyleItems(), function (si) {
                return validate(si, response);
              });
            }
          };
        } else {
          return rawItem.getStylePreview().fold(function () {
            return {
              type: 'togglemenuitem',
              text: translatedText,
              active: rawItem.isSelected(),
              disabled: disabled,
              onAction: spec.onAction(rawItem)
            };
          }, function (preview) {
            return {
              type: 'styleitem',
              item: {
                type: 'togglemenuitem',
                text: translatedText,
                disabled: disabled,
                active: rawItem.isSelected(),
                onAction: spec.onAction(rawItem),
                meta: preview
              }
            };
          });
        }
      };
      var validate = function (item, response) {
        var invalid = item.type === 'formatter' && spec.isInvalid(item);
        if (response === 0) {
          return invalid ? [] : [generateItem(item, response, false)];
        } else {
          return [generateItem(item, response, invalid)];
        }
      };
      var validateItems = function (preItems) {
        var response = spec.shouldHide ? 0 : 1;
        return bind(preItems, function (item) {
          return validate(item, response);
        });
      };
      var getFetch = function (backstage, getStyleItems) {
        return function (callback) {
          var preItems = getStyleItems();
          var items = validateItems(preItems);
          var menu = build$2(items, ItemResponse$1.CLOSE_ON_EXECUTE, backstage.shared.providers);
          callback(menu);
        };
      };
      return {
        validateItems: validateItems,
        getFetch: getFetch
      };
    };
    var createMenuItems = function (editor, backstage, dataset, spec) {
      var getStyleItems = dataset.type === 'basic' ? function () {
        return map(dataset.data, function (d) {
          return processBasic(d, spec.isSelectedFor, spec.getPreviewFor);
        });
      } : dataset.getData;
      return {
        items: generateSelectItems(editor, backstage, spec),
        getStyleItems: getStyleItems
      };
    };
    var createSelectButton = function (editor, backstage, dataset, spec) {
      var _a = createMenuItems(editor, backstage, dataset, spec), items = _a.items, getStyleItems = _a.getStyleItems;
      return renderCommonDropdown({
        text: Option.some(''),
        icon: Option.none(),
        tooltip: Option.from(spec.tooltip),
        role: Option.none(),
        fetch: items.getFetch(backstage, getStyleItems),
        onAttach: spec.nodeChangeHandler.map(function (f) {
          return function (comp) {
            return editor.on('nodeChange', f(comp));
          };
        }).getOr(function () {
        }),
        onDetach: spec.nodeChangeHandler.map(function (f) {
          return function (comp) {
            return editor.off('nodeChange', f(comp));
          };
        }).getOr(function () {
        }),
        columns: 1,
        presets: 'normal',
        classes: ['bespoke']
      }, 'tox-tbtn', backstage.shared);
    };

    var process = function (rawFormats) {
      return map(rawFormats, function (item) {
        var title = item, format = item;
        var values = item.split('=');
        if (values.length > 1) {
          title = values[0];
          format = values[1];
        }
        return {
          title: title,
          format: format
        };
      });
    };
    var buildBasicStaticDataset = function (data) {
      return {
        type: 'basic',
        data: data
      };
    };
    var Delimiter;
    (function (Delimiter) {
      Delimiter[Delimiter['SemiColon'] = 0] = 'SemiColon';
      Delimiter[Delimiter['Space'] = 1] = 'Space';
    }(Delimiter || (Delimiter = {})));
    var split = function (rawFormats, delimiter) {
      if (delimiter === Delimiter.SemiColon) {
        return rawFormats.replace(/;$/, '').split(';');
      } else {
        return rawFormats.split(' ');
      }
    };
    var buildBasicSettingsDataset = function (editor, settingName, defaults, delimiter) {
      var rawFormats = readOptFrom$1(editor.settings, settingName).getOr(defaults);
      var data = process(split(rawFormats, delimiter));
      return {
        type: 'basic',
        data: data
      };
    };

    var alignMenuItems = [
      {
        title: 'Left',
        icon: 'align-left',
        format: 'alignleft'
      },
      {
        title: 'Center',
        icon: 'align-center',
        format: 'aligncenter'
      },
      {
        title: 'Right',
        icon: 'align-right',
        format: 'alignright'
      },
      {
        title: 'Justify',
        icon: 'align-justify',
        format: 'alignjustify'
      }
    ];
    var createAlignSelect = function (editor, backstage) {
      var getMatchingValue = function () {
        return find(alignMenuItems, function (item) {
          return editor.formatter.match(item.format);
        });
      };
      var isSelectedFor = function (format) {
        return function () {
          return editor.formatter.match(format);
        };
      };
      var getPreviewFor = function (format) {
        return function () {
          return Option.none();
        };
      };
      var onAction = function (rawItem) {
        return function () {
          editor.undoManager.transact(function () {
            editor.focus();
            if (editor.formatter.match(rawItem.format)) {
              editor.formatter.remove(rawItem.format);
            } else {
              editor.formatter.apply(rawItem.format);
            }
          });
        };
      };
      var nodeChangeHandler = Option.some(function (comp) {
        return function () {
          var match = getMatchingValue();
          var text = match.fold(function () {
            return 'Align';
          }, function (item) {
            return item.title;
          });
          emitWith(comp, updateMenuText, { text: backstage.shared.providers.translate(text) });
        };
      });
      var dataset = buildBasicStaticDataset(alignMenuItems);
      return createSelectButton(editor, backstage, dataset, {
        tooltip: 'Align',
        isSelectedFor: isSelectedFor,
        getPreviewFor: getPreviewFor,
        onAction: onAction,
        nodeChangeHandler: nodeChangeHandler,
        shouldHide: false,
        isInvalid: function (item) {
          return !editor.formatter.canApply(item.format);
        }
      });
    };

    var defaultFontsFormats = 'Andale Mono=andale mono,monospace;' + 'Arial=arial,helvetica,sans-serif;' + 'Arial Black=arial black,sans-serif;' + 'Book Antiqua=book antiqua,palatino,serif;' + 'Comic Sans MS=comic sans ms,sans-serif;' + 'Courier New=courier new,courier,monospace;' + 'Georgia=georgia,palatino,serif;' + 'Helvetica=helvetica,arial,sans-serif;' + 'Impact=impact,sans-serif;' + 'Symbol=symbol;' + 'Tahoma=tahoma,arial,helvetica,sans-serif;' + 'Terminal=terminal,monaco,monospace;' + 'Times New Roman=times new roman,times,serif;' + 'Trebuchet MS=trebuchet ms,geneva,sans-serif;' + 'Verdana=verdana,geneva,sans-serif;' + 'Webdings=webdings;' + 'Wingdings=wingdings,zapf dingbats';
    var systemStackFonts = [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'sans-serif'
    ];
    var isSystemFontStack = function (fontFamily) {
      var matchesSystemStack = function () {
        var fonts = fontFamily.toLowerCase().split(/['"]?\s*,\s*['"]?/);
        return forall(systemStackFonts, function (font) {
          return fonts.indexOf(font.toLowerCase()) > -1;
        });
      };
      return fontFamily.indexOf('-apple-system') === 0 && matchesSystemStack();
    };
    var getSpec = function (editor) {
      var getMatchingValue = function () {
        var getFirstFont = function (fontFamily) {
          return fontFamily ? fontFamily.split(',')[0] : '';
        };
        var fontFamily = editor.queryCommandValue('FontName');
        var items = dataset.data;
        var font = fontFamily ? fontFamily.toLowerCase() : '';
        return find(items, function (item) {
          var format = item.format;
          return format.toLowerCase() === font || getFirstFont(format).toLowerCase() === getFirstFont(font).toLowerCase();
        }).orThunk(function () {
          if (isSystemFontStack(font)) {
            return Option.from({
              title: 'System Font',
              format: font
            });
          } else {
            return Option.none();
          }
        });
      };
      var isSelectedFor = function (item) {
        return function () {
          return getMatchingValue().exists(function (match) {
            return match.format === item;
          });
        };
      };
      var getPreviewFor = function (item) {
        return function () {
          return Option.some({
            tag: 'div',
            styleAttr: item.indexOf('dings') === -1 ? 'font-family:' + item : ''
          });
        };
      };
      var onAction = function (rawItem) {
        return function () {
          editor.undoManager.transact(function () {
            editor.focus();
            editor.execCommand('FontName', false, rawItem.format);
          });
        };
      };
      var nodeChangeHandler = Option.some(function (comp) {
        return function () {
          var fontFamily = editor.queryCommandValue('FontName');
          var match = getMatchingValue();
          var text = match.fold(function () {
            return fontFamily;
          }, function (item) {
            return item.title;
          });
          emitWith(comp, updateMenuText, { text: text });
        };
      });
      var dataset = buildBasicSettingsDataset(editor, 'font_formats', defaultFontsFormats, Delimiter.SemiColon);
      return {
        tooltip: 'Fonts',
        isSelectedFor: isSelectedFor,
        getPreviewFor: getPreviewFor,
        onAction: onAction,
        nodeChangeHandler: nodeChangeHandler,
        dataset: dataset,
        shouldHide: false,
        isInvalid: function () {
          return false;
        }
      };
    };
    var createFontSelect = function (editor, backstage) {
      var spec = getSpec(editor);
      return createSelectButton(editor, backstage, spec.dataset, spec);
    };
    var fontSelectMenu = function (editor, backstage) {
      var spec = getSpec(editor);
      var menuItems = createMenuItems(editor, backstage, spec.dataset, spec);
      return {
        type: 'nestedmenuitem',
        text: backstage.shared.providers.translate('Fonts'),
        getSubmenuItems: function () {
          return menuItems.items.validateItems(menuItems.getStyleItems());
        }
      };
    };

    var defaultFontsizeFormats = '8pt 10pt 12pt 14pt 18pt 24pt 36pt';
    var round$1 = function (number, precision) {
      var factor = Math.pow(10, precision);
      return Math.round(number * factor) / factor;
    };
    var toPt = function (fontSize, precision) {
      if (/[0-9.]+px$/.test(fontSize)) {
        return round$1(parseInt(fontSize, 10) * 72 / 96, precision || 0) + 'pt';
      }
      return fontSize;
    };
    var getSpec$1 = function (editor) {
      var getMatchingValue = function () {
        var matchOpt = Option.none();
        var items = dataset.data;
        var px = editor.queryCommandValue('FontSize');
        if (px) {
          var _loop_1 = function (precision) {
            var pt = toPt(px, precision);
            matchOpt = find(items, function (item) {
              return item.format === px || item.format === pt;
            });
          };
          for (var precision = 3; matchOpt.isNone() && precision >= 0; precision--) {
            _loop_1(precision);
          }
        }
        return {
          matchOpt: matchOpt,
          px: px
        };
      };
      var isSelectedFor = function (item) {
        return function () {
          var matchOpt = getMatchingValue().matchOpt;
          return matchOpt.exists(function (match) {
            return match.format === item;
          });
        };
      };
      var getPreviewFor = function () {
        return function () {
          return Option.none();
        };
      };
      var onAction = function (rawItem) {
        return function () {
          editor.undoManager.transact(function () {
            editor.focus();
            editor.execCommand('FontSize', false, rawItem.format);
          });
        };
      };
      var nodeChangeHandler = Option.some(function (comp) {
        return function () {
          var _a = getMatchingValue(), matchOpt = _a.matchOpt, px = _a.px;
          var text = matchOpt.fold(function () {
            return px;
          }, function (match) {
            return match.title;
          });
          emitWith(comp, updateMenuText, { text: text });
        };
      });
      var dataset = buildBasicSettingsDataset(editor, 'fontsize_formats', defaultFontsizeFormats, Delimiter.Space);
      return {
        tooltip: 'Font Sizes',
        isSelectedFor: isSelectedFor,
        getPreviewFor: getPreviewFor,
        onAction: onAction,
        nodeChangeHandler: nodeChangeHandler,
        dataset: dataset,
        shouldHide: false,
        isInvalid: function () {
          return false;
        }
      };
    };
    var createFontsizeSelect = function (editor, backstage) {
      var spec = getSpec$1(editor);
      return createSelectButton(editor, backstage, spec.dataset, spec);
    };
    var fontsizeSelectMenu = function (editor, backstage) {
      var spec = getSpec$1(editor);
      var menuItems = createMenuItems(editor, backstage, spec.dataset, spec);
      return {
        type: 'nestedmenuitem',
        text: 'Font Sizes',
        getSubmenuItems: function () {
          return menuItems.items.validateItems(menuItems.getStyleItems());
        }
      };
    };

    var findNearest = function (editor, getStyles, nodeChangeEvent) {
      var parents = nodeChangeEvent.parents;
      var styles = getStyles();
      return findMap(parents, function (parent) {
        return find(styles, function (fmt) {
          return editor.formatter.matchNode(parent, fmt.format);
        });
      }).orThunk(function () {
        if (editor.formatter.match('p')) {
          return Option.some({
            title: 'Paragraph',
            format: 'p'
          });
        }
        return Option.none();
      });
    };

    var defaultBlocks = 'Paragraph=p;' + 'Heading 1=h1;' + 'Heading 2=h2;' + 'Heading 3=h3;' + 'Heading 4=h4;' + 'Heading 5=h5;' + 'Heading 6=h6;' + 'Preformatted=pre';
    var getSpec$2 = function (editor) {
      var getMatchingValue = function (nodeChangeEvent) {
        return findNearest(editor, function () {
          return dataset.data;
        }, nodeChangeEvent);
      };
      var isSelectedFor = function (format) {
        return function () {
          return editor.formatter.match(format);
        };
      };
      var getPreviewFor = function (format) {
        return function () {
          var fmt = editor.formatter.get(format);
          return Option.some({
            tag: fmt.length > 0 ? fmt[0].inline || fmt[0].block || 'div' : 'div',
            styleAttr: editor.formatter.getCssText(format)
          });
        };
      };
      var onAction = function (rawItem) {
        return function () {
          editor.undoManager.transact(function () {
            editor.focus();
            if (editor.formatter.match(rawItem.format)) {
              editor.formatter.remove(rawItem.format);
            } else {
              editor.formatter.apply(rawItem.format);
            }
          });
        };
      };
      var nodeChangeHandler = Option.some(function (comp) {
        return function (e) {
          var detectedFormat = getMatchingValue(e);
          var text = detectedFormat.fold(function () {
            return 'Paragraph';
          }, function (fmt) {
            return fmt.title;
          });
          emitWith(comp, updateMenuText, { text: text });
        };
      });
      var dataset = buildBasicSettingsDataset(editor, 'block_formats', defaultBlocks, Delimiter.SemiColon);
      return {
        tooltip: 'Blocks',
        isSelectedFor: isSelectedFor,
        getPreviewFor: getPreviewFor,
        onAction: onAction,
        nodeChangeHandler: nodeChangeHandler,
        dataset: dataset,
        shouldHide: false,
        isInvalid: function (item) {
          return !editor.formatter.canApply(item.format);
        }
      };
    };
    var createFormatSelect = function (editor, backstage) {
      var spec = getSpec$2(editor);
      return createSelectButton(editor, backstage, spec.dataset, spec);
    };
    var formatSelectMenu = function (editor, backstage) {
      var spec = getSpec$2(editor);
      var menuItems = createMenuItems(editor, backstage, spec.dataset, spec);
      return {
        type: 'nestedmenuitem',
        text: 'Blocks',
        getSubmenuItems: function () {
          return menuItems.items.validateItems(menuItems.getStyleItems());
        }
      };
    };

    var getSpec$3 = function (editor) {
      var isSelectedFor = function (format) {
        return function () {
          return editor.formatter.match(format);
        };
      };
      var getPreviewFor = function (format) {
        return function () {
          var fmt = editor.formatter.get(format);
          return fmt !== undefined ? Option.some({
            tag: fmt.length > 0 ? fmt[0].inline || fmt[0].block || 'div' : 'div',
            styleAttr: editor.formatter.getCssText(format)
          }) : Option.none();
        };
      };
      var onAction = function (rawItem) {
        return function () {
          editor.undoManager.transact(function () {
            editor.focus();
            if (editor.formatter.match(rawItem.format)) {
              editor.formatter.remove(rawItem.format);
            } else {
              editor.formatter.apply(rawItem.format);
            }
          });
        };
      };
      var nodeChangeHandler = Option.some(function (comp) {
        var getFormatItems = function (fmt) {
          var subs = fmt.items;
          return subs !== undefined && subs.length > 0 ? bind(subs, getFormatItems) : [{
              title: fmt.title,
              format: fmt.format
            }];
        };
        var flattenedItems = bind(getStyleFormats(editor), getFormatItems);
        return function (e) {
          var detectedFormat = findNearest(editor, function () {
            return flattenedItems;
          }, e);
          var text = detectedFormat.fold(function () {
            return 'Paragraph';
          }, function (fmt) {
            return fmt.title;
          });
          emitWith(comp, updateMenuText, { text: text });
        };
      });
      return {
        tooltip: 'Formats',
        isSelectedFor: isSelectedFor,
        getPreviewFor: getPreviewFor,
        onAction: onAction,
        nodeChangeHandler: nodeChangeHandler,
        shouldHide: editor.getParam('style_formats_autohide', false, 'boolean'),
        isInvalid: function (item) {
          return !editor.formatter.canApply(item.format);
        }
      };
    };
    var createStyleSelect = function (editor, backstage) {
      var data = backstage.styleselect;
      return createSelectButton(editor, backstage, data, getSpec$3(editor));
    };
    var styleSelectMenu = function (editor, backstage) {
      var data = backstage.styleselect;
      var menuItems = createMenuItems(editor, backstage, data, getSpec$3(editor));
      return {
        type: 'nestedmenuitem',
        text: 'Formats',
        getSubmenuItems: function () {
          return menuItems.items.validateItems(menuItems.getStyleItems());
        }
      };
    };

    var defaultMenubar = 'file edit view insert format tools table help';
    var defaultMenus = {
      file: {
        title: 'File',
        items: 'newdocument restoredraft | preview | print | deleteallconversations'
      },
      edit: {
        title: 'Edit',
        items: 'undo redo | cut copy paste pastetext | selectall | searchreplace'
      },
      view: {
        title: 'View',
        items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments'
      },
      insert: {
        title: 'Insert',
        items: 'image link media addcomment pageembed template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime'
      },
      format: {
        title: 'Format',
        items: 'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align | removeformat'
      },
      tools: {
        title: 'Tools',
        items: 'spellchecker spellcheckerlanguage | a11ycheck code wordcount'
      },
      table: {
        title: 'Table',
        items: 'inserttable tableprops deletetable row column cell'
      },
      help: {
        title: 'Help',
        items: 'help'
      }
    };
    var renderMenuButton = function (spec, prefix, sharedBackstage, role) {
      return renderCommonDropdown({
        text: spec.text,
        icon: spec.icon,
        tooltip: spec.tooltip,
        role: role,
        fetch: function (callback) {
          spec.fetch(function (items) {
            callback(build$2(items, ItemResponse$1.CLOSE_ON_EXECUTE, sharedBackstage.providers));
          });
        },
        onAttach: function () {
        },
        onDetach: function () {
        },
        columns: 1,
        presets: 'normal',
        classes: []
      }, prefix, sharedBackstage);
    };
    var bespokeItems = {
      formats: styleSelectMenu,
      blockformats: formatSelectMenu,
      fontformats: fontSelectMenu,
      fontsizes: fontsizeSelectMenu
    };
    var make$6 = function (menu, registry, editor, backstage) {
      var removedMenuItems = getRemovedMenuItems(editor).split(/[ ,]/);
      return {
        text: menu.title,
        getItems: function () {
          return bind(menu.items, function (i) {
            if (i.trim().length === 0) {
              return [];
            } else if (exists(removedMenuItems, function (removedMenuItem) {
                return removedMenuItem === i;
              })) {
              return [];
            } else if (i === 'separator' || i === '|') {
              return [{ type: 'separator' }];
            } else if (registry.menuItems[i]) {
              return [registry.menuItems[i]];
            } else if (bespokeItems[i]) {
              return [bespokeItems[i](editor, backstage)];
            } else {
              return [];
            }
          });
        }
      };
    };
    var parseItemsString = function (items) {
      if (typeof items === 'string') {
        return items.split(' ');
      }
      return items;
    };
    var identifyMenus = function (editor, registry, backstage) {
      var rawMenuData = merge(defaultMenus, registry.menus);
      var userDefinedMenus = keys(registry.menus).length > 0;
      var menubar = registry.menubar === undefined || registry.menubar === true ? parseItemsString(defaultMenubar) : parseItemsString(registry.menubar === false ? '' : registry.menubar);
      var validMenus = filter(menubar, function (menuName) {
        return userDefinedMenus ? registry.menus.hasOwnProperty(menuName) && registry.menus[menuName].hasOwnProperty('items') || defaultMenus.hasOwnProperty(menuName) : defaultMenus.hasOwnProperty(menuName);
      });
      var menus = map(validMenus, function (menuName) {
        var menuData = rawMenuData[menuName];
        return make$6({
          title: menuData.title,
          items: parseItemsString(menuData.items)
        }, registry, editor, backstage);
      });
      return filter(menus, function (menu) {
        return menu.getItems().length > 0;
      });
    };

    var defaultToolbar = [
      {
        name: 'history',
        items: [
          'undo',
          'redo'
        ]
      },
      {
        name: 'styles',
        items: ['styleselect']
      },
      {
        name: 'formatting',
        items: [
          'bold',
          'italic'
        ]
      },
      {
        name: 'alignment',
        items: [
          'alignleft',
          'aligncenter',
          'alignright',
          'alignjustify'
        ]
      },
      {
        name: 'indentation',
        items: [
          'outdent',
          'indent'
        ]
      },
      {
        name: 'permanent pen',
        items: ['permanentpen']
      },
      {
        name: 'comments',
        items: ['addcomment']
      }
    ];
    var renderFromBridge = function (bridgeBuilder, render) {
      return function (spec, extras) {
        var internal = bridgeBuilder(spec).fold(compose(Result.error, formatError), Result.value).getOrDie();
        return render(internal, extras);
      };
    };
    var types = {
      button: renderFromBridge(createToolbarButton, function (s, extras) {
        return renderToolbarButton(s, extras.backstage.shared.providers);
      }),
      togglebutton: renderFromBridge(createToggleButton, function (s, extras) {
        return renderToolbarToggleButton(s, extras.backstage.shared.providers);
      }),
      menubutton: renderFromBridge(createMenuButton, function (s, extras) {
        return renderMenuButton(s, 'tox-tbtn', extras.backstage.shared, Option.none());
      }),
      splitbutton: renderFromBridge(createSplitButton, function (s, extras) {
        return renderSplitButton(s, extras.backstage.shared);
      }),
      styleSelectButton: function (editor, extras) {
        return createStyleSelect(editor, extras.backstage);
      },
      fontsizeSelectButton: function (editor, extras) {
        return createFontsizeSelect(editor, extras.backstage);
      },
      fontSelectButton: function (editor, extras) {
        return createFontSelect(editor, extras.backstage);
      },
      formatButton: function (editor, extras) {
        return createFormatSelect(editor, extras.backstage);
      },
      alignMenuButton: function (editor, extras) {
        return createAlignSelect(editor, extras.backstage);
      }
    };
    var extractFrom$1 = function (spec, extras) {
      return readOptFrom$1(types, spec.type).fold(function () {
        console.error('skipping button defined by', spec);
        return Option.none();
      }, function (render) {
        return Option.some(render(spec, extras));
      });
    };
    var bespokeButtons = {
      styleselect: types.styleSelectButton,
      fontsizeselect: types.fontsizeSelectButton,
      fontselect: types.fontSelectButton,
      formatselect: types.formatButton,
      align: types.alignMenuButton
    };
    var removeUnusedDefaults = function (buttons) {
      var filteredItemGroups = map(defaultToolbar, function (group) {
        var items = filter(group.items, function (subItem) {
          return has(buttons, subItem) || has(bespokeButtons, subItem);
        });
        return {
          name: group.name,
          items: items
        };
      });
      return filter(filteredItemGroups, function (group) {
        return group.items.length > 0;
      });
    };
    var convertStringToolbar = function (strToolbar) {
      var groupsStrings = strToolbar.split('|');
      return map(groupsStrings, function (g) {
        return { items: g.trim().split(' ') };
      });
    };
    var createToolbar = function (toolbarConfig) {
      if (toolbarConfig.toolbar === false) {
        return [];
      } else if (toolbarConfig.toolbar === undefined || toolbarConfig.toolbar === true) {
        return removeUnusedDefaults(toolbarConfig.buttons);
      } else if (isString(toolbarConfig.toolbar)) {
        return convertStringToolbar(toolbarConfig.toolbar);
      } else if (isArray(toolbarConfig.toolbar) && isString(toolbarConfig.toolbar[0])) {
        return convertStringToolbar(toolbarConfig.toolbar.join(' | '));
      } else {
        return toolbarConfig.toolbar;
      }
    };
    var identifyButtons = function (editor, toolbarConfig, extras) {
      var toolbarGroups = createToolbar(toolbarConfig);
      var groups = map(toolbarGroups, function (group) {
        var items = bind(group.items, function (toolbarItem) {
          return toolbarItem.trim().length === 0 ? [] : readOptFrom$1(toolbarConfig.buttons, toolbarItem.toLowerCase()).fold(function () {
            return readOptFrom$1(bespokeButtons, toolbarItem.toLowerCase()).map(function (r) {
              return r(editor, extras);
            }).orThunk(function () {
              console.error('No representation for toolbarItem: ' + toolbarItem);
              return Option.none();
            });
          }, function (spec) {
            return extractFrom$1(spec, extras);
          }).toArray();
        });
        return {
          title: Option.from(editor.translate(group.name)),
          items: items
        };
      });
      return filter(groups, function (group) {
        return group.items.length > 0;
      });
    };

    var register$4 = function (editor, registryContextToolbars, sink, extras) {
      var contextbar = build$1(renderContextToolbar({
        sink: sink,
        onEscape: function () {
          editor.focus();
          return Option.some(true);
        }
      }));
      var getBoxElement = function () {
        return Option.some(Element$$1.fromDom(editor.contentAreaContainer));
      };
      editor.on('init', function () {
        var scroller = editor.getBody().ownerDocument.defaultView;
        var onScroll = bind$3(Element$$1.fromDom(scroller), 'scroll', function () {
          lastAnchor.get().each(function (anchor) {
            var elem = lastElement.get().getOr(editor.selection.getNode());
            var nodeBounds = elem.getBoundingClientRect();
            var contentAreaBounds = editor.contentAreaContainer.getBoundingClientRect();
            var aboveEditor = nodeBounds.bottom < 0;
            var belowEditor = nodeBounds.top > contentAreaBounds.height;
            if (aboveEditor || belowEditor) {
              set$2(contextbar.element(), 'display', 'none');
            } else {
              remove$6(contextbar.element(), 'display');
              Positioning.positionWithin(sink, anchor, contextbar, getBoxElement());
            }
          });
        });
        editor.on('remove', function () {
          onScroll.unbind();
        });
      });
      var lastAnchor = Cell(Option.none());
      var lastElement = Cell(Option.none());
      var timer = Cell(null);
      var wrapInPopDialog = function (toolbarSpec) {
        return {
          dom: {
            tag: 'div',
            classes: ['tox-pop__dialog']
          },
          components: [toolbarSpec],
          behaviours: derive$1([
            Keying.config({ mode: 'acyclic' }),
            config('pop-dialog-wrap-events', [
              runOnAttached(function (comp) {
                editor.shortcuts.add('ctrl+F9', 'focus statusbar', function () {
                  return Keying.focusIn(comp);
                });
              }),
              runOnDetached(function (comp) {
                editor.shortcuts.remove('ctrl+F9');
              })
            ])
          ])
        };
      };
      var getScopes = cached(function () {
        return ToolbarScopes.categorise(registryContextToolbars, function (toolbarApi) {
          var alloySpec = buildToolbar(toolbarApi);
          emitWith(contextbar, forwardSlideEvent, { forwardContents: wrapInPopDialog(alloySpec) });
        });
      });
      var buildToolbar = function (ctx) {
        var buttons = editor.ui.registry.getAll().buttons;
        var scopes = getScopes();
        return ctx.type === 'contexttoolbar' ? function () {
          var allButtons = merge(buttons, scopes.formNavigators);
          var initGroups = identifyButtons(editor, {
            buttons: allButtons,
            toolbar: ctx.items
          }, extras);
          return renderToolbar({
            uid: generate$1('context-toolbar'),
            initGroups: initGroups,
            onEscape: Option.none,
            cyclicKeying: true
          });
        }() : function () {
          return ContextForm.renderContextForm(ctx, extras.backstage.shared.providers);
        }();
      };
      editor.on(showContextToolbarEvent, function (e) {
        var scopes = getScopes();
        readOptFrom$1(scopes.lookupTable, e.toolbarKey).each(function (ctx) {
          launchContext(ctx, e.target === editor ? Option.none() : Option.some(e));
          InlineView.getContent(contextbar).each(Keying.focusIn);
        });
      });
      var bubbleAlignments = {
        valignCentre: [],
        alignCentre: [],
        alignLeft: ['tox-pop--align-left'],
        alignRight: ['tox-pop--align-right'],
        right: ['tox-pop--right'],
        left: ['tox-pop--left'],
        bottom: ['tox-pop--bottom'],
        top: ['tox-pop--top']
      };
      var anchorOverrides = { maxHeightFunction: expandable() };
      var lineAnchorSpec = {
        bubble: nu$7(12, 0, bubbleAlignments),
        layouts: {
          onLtr: function () {
            return [east$1];
          },
          onRtl: function () {
            return [west$1];
          }
        },
        overrides: anchorOverrides
      };
      var anchorSpec = {
        bubble: nu$7(0, 12, bubbleAlignments),
        layouts: {
          onLtr: function () {
            return [
              north$1,
              south$1,
              northeast$1,
              southeast$1,
              northwest$1,
              southwest$1
            ];
          },
          onRtl: function () {
            return [
              north$1,
              south$1,
              northwest$1,
              southwest$1,
              northeast$1,
              southeast$1
            ];
          }
        },
        overrides: anchorOverrides
      };
      var getAnchor = function (position, element) {
        var anchorage = position === 'node' ? extras.backstage.shared.anchors.node(element) : extras.backstage.shared.anchors.cursor();
        var anchor = deepMerge(anchorage, position === 'line' ? lineAnchorSpec : anchorSpec);
        return anchor;
      };
      var launchContext = function (toolbarApi, elem) {
        clearTimer();
        var toolbarSpec = buildToolbar(toolbarApi);
        var sElem = elem.map(Element$$1.fromDom);
        var anchor = getAnchor(toolbarApi.position, sElem);
        lastAnchor.set(Option.some(anchor));
        lastElement.set(elem);
        InlineView.showWithin(contextbar, anchor, wrapInPopDialog(toolbarSpec), getBoxElement());
        remove$6(contextbar.element(), 'display');
      };
      var launchContextToolbar = function () {
        var scopes = getScopes();
        ToolbarLookup.lookup(scopes, editor).fold(function () {
          lastAnchor.set(Option.none());
          InlineView.hide(contextbar);
        }, function (info) {
          launchContext(info.toolbarApi, Option.some(info.elem.dom()));
        });
      };
      var clearTimer = function () {
        var current = timer.get();
        if (current !== null) {
          clearTimeout(current);
          timer.set(null);
        }
      };
      var resetTimer = function (t) {
        clearTimer();
        timer.set(t);
      };
      editor.on('click keyup setContent ObjectResized ResizeEditor', function (e) {
        resetTimer(global$c.setEditorTimeout(editor, launchContextToolbar, 0));
      });
      editor.on('nodeChange', function (e) {
        search$1(contextbar.element()).fold(function () {
          resetTimer(global$c.setEditorTimeout(editor, launchContextToolbar, 0));
        }, function (_) {
        });
      });
    };
    var ContextToolbar = { register: register$4 };

    var setup$3 = function (editor, mothership, uiMothership) {
      var onMousedown = bind$3(Element$$1.fromDom(document), 'mousedown', function (evt) {
        each([
          mothership,
          uiMothership
        ], function (ship) {
          ship.broadcastOn([dismissPopups()], { target: evt.target() });
        });
      });
      var onTouchstart = bind$3(Element$$1.fromDom(document), 'touchstart', function (evt) {
        each([
          mothership,
          uiMothership
        ], function (ship) {
          ship.broadcastOn([dismissPopups()], { target: evt.target() });
        });
      });
      var onMouseup = bind$3(Element$$1.fromDom(document), 'mouseup', function (evt) {
        if (evt.raw().button === 0) {
          each([
            mothership,
            uiMothership
          ], function (ship) {
            ship.broadcastOn([mouseReleased()], { target: evt.target() });
          });
        }
      });
      var onContentMousedown = function (raw) {
        each([
          mothership,
          uiMothership
        ], function (ship) {
          ship.broadcastOn([dismissPopups()], { target: Element$$1.fromDom(raw.target) });
        });
      };
      editor.on('mousedown', onContentMousedown);
      editor.on('touchstart', onContentMousedown);
      var onContentMouseup = function (raw) {
        if (raw.button === 0) {
          each([
            mothership,
            uiMothership
          ], function (ship) {
            ship.broadcastOn([mouseReleased()], { target: Element$$1.fromDom(raw.target) });
          });
        }
      };
      editor.on('mouseup', onContentMouseup);
      var onWindowScroll = bind$3(Element$$1.fromDom(window), 'scroll', function (evt) {
        each([
          mothership,
          uiMothership
        ], function (ship) {
          ship.broadcastEvent(windowScroll(), evt);
        });
      });
      editor.on('remove', function () {
        editor.off('mousedown', onContentMousedown);
        editor.off('touchstart', onContentMousedown);
        editor.off('mouseup', onContentMouseup);
        onMousedown.unbind();
        onTouchstart.unbind();
        onMouseup.unbind();
        onWindowScroll.unbind();
      });
      editor.on('detach', function () {
        detachSystem(mothership);
        detachSystem(uiMothership);
        mothership.destroy();
        uiMothership.destroy();
      });
    };
    var Events = { setup: setup$3 };

    var parts$a = AlloyParts;
    var partType$1 = PartType;

    var factory$c = function (detail, spec) {
      var setMenus = function (comp, menus) {
        var newMenus = map(menus, function (m) {
          var buttonSpec = {
            text: Option.some(m.text),
            icon: Option.none(),
            tooltip: Option.none(),
            fetch: function (callback) {
              callback(m.getItems());
            }
          };
          return renderMenuButton(buttonSpec, 'tox-mbtn', {
            getSink: detail.getSink,
            providers: detail.providers
          }, Option.some('menuitem'));
        });
        Replacing.set(comp, newMenus);
      };
      var apis = {
        focus: Keying.focusIn,
        setMenus: setMenus
      };
      return {
        uid: detail.uid,
        dom: detail.dom,
        components: [],
        behaviours: derive$1([
          Replacing.config({}),
          config('menubar-events', [
            runOnAttached(function (component) {
              detail.onSetup(component);
            }),
            run(mouseover(), function (comp, se) {
              descendant$2(comp.element(), '.' + 'tox-mbtn--active').each(function (activeButton) {
                closest$3(se.event().target(), '.' + 'tox-mbtn').each(function (hoveredButton) {
                  if (!eq(activeButton, hoveredButton)) {
                    comp.getSystem().getByDom(activeButton).each(function (activeComp) {
                      comp.getSystem().getByDom(hoveredButton).each(function (hoveredComp) {
                        Dropdown.expand(hoveredComp);
                        Dropdown.close(activeComp);
                        Focusing.focus(hoveredComp);
                      });
                    });
                  }
                });
              });
            }),
            run(focusShifted(), function (comp, se) {
              se.event().prevFocus().bind(function (prev) {
                return comp.getSystem().getByDom(prev).toOption();
              }).each(function (prev) {
                se.event().newFocus().bind(function (nu) {
                  return comp.getSystem().getByDom(nu).toOption();
                }).each(function (nu) {
                  if (Dropdown.isOpen(prev)) {
                    Dropdown.expand(nu);
                    Dropdown.close(prev);
                  }
                });
              });
            })
          ]),
          Keying.config({
            mode: 'flow',
            selector: '.' + 'tox-mbtn',
            onEscape: function (comp) {
              detail.onEscape(comp);
              return Option.some(true);
            }
          }),
          Tabstopping.config({})
        ]),
        apis: apis,
        domModification: { attributes: { role: 'menubar' } }
      };
    };
    var SilverMenubar = single$2({
      factory: factory$c,
      name: 'silver.Menubar',
      configFields: [
        strict$1('dom'),
        strict$1('uid'),
        strict$1('onEscape'),
        strict$1('getSink'),
        strict$1('providers'),
        defaulted$1('onSetup', noop)
      ],
      apis: {
        focus: function (apis, comp) {
          apis.focus(comp);
        },
        setMenus: function (apis, comp, menus) {
          apis.setMenus(comp, menus);
        }
      }
    });

    var getAnimationRoot = function (component, slideConfig) {
      return slideConfig.getAnimationRoot.fold(function () {
        return component.element();
      }, function (get) {
        return get(component);
      });
    };

    var getDimensionProperty = function (slideConfig) {
      return slideConfig.dimension.property;
    };
    var getDimension = function (slideConfig, elem) {
      return slideConfig.dimension.getDimension(elem);
    };
    var disableTransitions = function (component, slideConfig) {
      var root = getAnimationRoot(component, slideConfig);
      remove$5(root, [
        slideConfig.shrinkingClass,
        slideConfig.growingClass
      ]);
    };
    var setShrunk = function (component, slideConfig) {
      remove$4(component.element(), slideConfig.openClass);
      add$2(component.element(), slideConfig.closedClass);
      set$2(component.element(), getDimensionProperty(slideConfig), '0px');
      reflow(component.element());
    };
    var setGrown = function (component, slideConfig) {
      remove$4(component.element(), slideConfig.closedClass);
      add$2(component.element(), slideConfig.openClass);
      remove$6(component.element(), getDimensionProperty(slideConfig));
    };
    var doImmediateShrink = function (component, slideConfig, slideState, _calculatedSize) {
      slideState.setCollapsed();
      set$2(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
      reflow(component.element());
      disableTransitions(component, slideConfig);
      setShrunk(component, slideConfig);
      slideConfig.onStartShrink(component);
      slideConfig.onShrunk(component);
    };
    var doStartShrink = function (component, slideConfig, slideState, calculatedSize) {
      var size = calculatedSize.getOrThunk(function () {
        return getDimension(slideConfig, component.element());
      });
      slideState.setCollapsed();
      set$2(component.element(), getDimensionProperty(slideConfig), size);
      reflow(component.element());
      var root = getAnimationRoot(component, slideConfig);
      remove$4(root, slideConfig.growingClass);
      add$2(root, slideConfig.shrinkingClass);
      setShrunk(component, slideConfig);
      slideConfig.onStartShrink(component);
    };
    var doStartSmartShrink = function (component, slideConfig, slideState) {
      var size = getDimension(slideConfig, component.element());
      var shrinker = size === '0px' ? doImmediateShrink : doStartShrink;
      shrinker(component, slideConfig, slideState, Option.some(size));
    };
    var doStartGrow = function (component, slideConfig, slideState) {
      var root = getAnimationRoot(component, slideConfig);
      var wasShrinking = has$2(root, slideConfig.shrinkingClass);
      var beforeSize = getDimension(slideConfig, component.element());
      setGrown(component, slideConfig);
      var fullSize = getDimension(slideConfig, component.element());
      var startPartialGrow = function () {
        set$2(component.element(), getDimensionProperty(slideConfig), beforeSize);
        reflow(component.element());
      };
      var startCompleteGrow = function () {
        setShrunk(component, slideConfig);
      };
      var setStartSize = wasShrinking ? startPartialGrow : startCompleteGrow;
      setStartSize();
      remove$4(root, slideConfig.shrinkingClass);
      add$2(root, slideConfig.growingClass);
      setGrown(component, slideConfig);
      set$2(component.element(), getDimensionProperty(slideConfig), fullSize);
      slideState.setExpanded();
      slideConfig.onStartGrow(component);
    };
    var grow = function (component, slideConfig, slideState) {
      if (!slideState.isExpanded()) {
        doStartGrow(component, slideConfig, slideState);
      }
    };
    var shrink = function (component, slideConfig, slideState) {
      if (slideState.isExpanded()) {
        doStartSmartShrink(component, slideConfig, slideState);
      }
    };
    var immediateShrink = function (component, slideConfig, slideState) {
      if (slideState.isExpanded()) {
        doImmediateShrink(component, slideConfig, slideState, Option.none());
      }
    };
    var hasGrown = function (component, slideConfig, slideState) {
      return slideState.isExpanded();
    };
    var hasShrunk = function (component, slideConfig, slideState) {
      return slideState.isCollapsed();
    };
    var isGrowing = function (component, slideConfig, slideState) {
      var root = getAnimationRoot(component, slideConfig);
      return has$2(root, slideConfig.growingClass) === true;
    };
    var isShrinking = function (component, slideConfig, slideState) {
      var root = getAnimationRoot(component, slideConfig);
      return has$2(root, slideConfig.shrinkingClass) === true;
    };
    var isTransitioning = function (component, slideConfig, slideState) {
      return isGrowing(component, slideConfig, slideState) === true || isShrinking(component, slideConfig, slideState) === true;
    };
    var toggleGrow = function (component, slideConfig, slideState) {
      var f = slideState.isExpanded() ? doStartSmartShrink : doStartGrow;
      f(component, slideConfig, slideState);
    };

    var SlidingApis = /*#__PURE__*/Object.freeze({
        grow: grow,
        shrink: shrink,
        immediateShrink: immediateShrink,
        hasGrown: hasGrown,
        hasShrunk: hasShrunk,
        isGrowing: isGrowing,
        isShrinking: isShrinking,
        isTransitioning: isTransitioning,
        toggleGrow: toggleGrow,
        disableTransitions: disableTransitions
    });

    var exhibit$6 = function (base, slideConfig) {
      var expanded = slideConfig.expanded;
      return expanded ? nu$6({
        classes: [slideConfig.openClass],
        styles: {}
      }) : nu$6({
        classes: [slideConfig.closedClass],
        styles: wrap$1(slideConfig.dimension.property, '0px')
      });
    };
    var events$d = function (slideConfig, slideState) {
      return derive([runOnSource(transitionend(), function (component, simulatedEvent) {
          var raw = simulatedEvent.event().raw();
          if (raw.propertyName === slideConfig.dimension.property) {
            disableTransitions(component, slideConfig);
            if (slideState.isExpanded()) {
              remove$6(component.element(), slideConfig.dimension.property);
            }
            var notify = slideState.isExpanded() ? slideConfig.onGrown : slideConfig.onShrunk;
            notify(component);
          }
        })]);
    };

    var ActiveSliding = /*#__PURE__*/Object.freeze({
        exhibit: exhibit$6,
        events: events$d
    });

    var SlidingSchema = [
      strict$1('closedClass'),
      strict$1('openClass'),
      strict$1('shrinkingClass'),
      strict$1('growingClass'),
      option('getAnimationRoot'),
      onHandler('onShrunk'),
      onHandler('onStartShrink'),
      onHandler('onGrown'),
      onHandler('onStartGrow'),
      defaulted$1('expanded', false),
      strictOf('dimension', choose$1('property', {
        width: [
          output$1('property', 'width'),
          output$1('getDimension', function (elem) {
            return get$8(elem) + 'px';
          })
        ],
        height: [
          output$1('property', 'height'),
          output$1('getDimension', function (elem) {
            return get$9(elem) + 'px';
          })
        ]
      }))
    ];

    var init$a = function (spec) {
      var state = Cell(spec.expanded);
      var readState = function () {
        return 'expanded: ' + state.get();
      };
      return nu$5({
        isExpanded: function () {
          return state.get() === true;
        },
        isCollapsed: function () {
          return state.get() === false;
        },
        setCollapsed: curry(state.set, false),
        setExpanded: curry(state.set, true),
        readState: readState
      });
    };

    var SlidingState = /*#__PURE__*/Object.freeze({
        init: init$a
    });

    var Sliding = create$1({
      fields: SlidingSchema,
      name: 'sliding',
      active: ActiveSliding,
      apis: SlidingApis,
      state: SlidingState
    });

    var owner$4 = 'container';
    var schema$m = [field$1('slotBehaviours', [])];
    var getPartName$1 = function (name) {
      return '<alloy.field.' + name + '>';
    };
    var sketch$3 = function (sSpec) {
      var parts = function () {
        var record = [];
        var slot = function (name, config) {
          record.push(name);
          return generateOne(owner$4, getPartName$1(name), config);
        };
        return {
          slot: slot,
          record: function () {
            return record;
          }
        };
      }();
      var spec = sSpec(parts);
      var partNames = parts.record();
      var fieldParts = map(partNames, function (n) {
        return required({
          name: n,
          pname: getPartName$1(n)
        });
      });
      return composite(owner$4, schema$m, fieldParts, make$7, spec);
    };
    var make$7 = function (detail, components$$1, spec) {
      var getSlotNames = function (_) {
        return getAllPartNames(detail);
      };
      var getSlot = function (container, key) {
        return getPart(container, detail, key);
      };
      var onSlot = function (f, def) {
        if (def === void 0) {
          def = undefined;
        }
        return function (container, key) {
          return getPart(container, detail, key).map(function (slot) {
            return f(slot, key);
          }).getOr(def);
        };
      };
      var onSlots = function (f) {
        return function (container, keys$$1) {
          each(keys$$1, function (key) {
            return f(container, key);
          });
        };
      };
      var doShowing = function (comp, key) {
        return get$2(comp.element(), 'aria-hidden') !== 'true';
      };
      var doShow = function (comp, key) {
        if (!doShowing(comp, key)) {
          var element = comp.element();
          remove$6(element, 'display');
          remove$1(element, 'aria-hidden');
          emitWith(comp, slotVisibility(), {
            name: key,
            visible: true
          });
        }
      };
      var doHide = function (comp, key) {
        if (doShowing(comp, key)) {
          var element = comp.element();
          set$2(element, 'display', 'none');
          set$1(element, 'aria-hidden', 'true');
          emitWith(comp, slotVisibility(), {
            name: key,
            visible: false
          });
        }
      };
      var isShowing = onSlot(doShowing, false);
      var hideSlot = onSlot(doHide);
      var hideSlots = onSlots(hideSlot);
      var hideAllSlots = function (container) {
        return hideSlots(container, getSlotNames(container));
      };
      var showSlot = onSlot(doShow);
      var apis = {
        getSlotNames: getSlotNames,
        getSlot: getSlot,
        isShowing: isShowing,
        hideSlot: hideSlot,
        hideAllSlots: hideAllSlots,
        showSlot: showSlot
      };
      return {
        'uid': detail.uid,
        'dom': detail.dom,
        'components': components$$1,
        'behaviours': get$d(detail.slotBehaviours),
        'apis': apis
      };
    };
    var slotApis = map$1({
      getSlotNames: function (apis, c) {
        return apis.getSlotNames(c);
      },
      getSlot: function (apis, c, key) {
        return apis.getSlot(c, key);
      },
      isShowing: function (apis, c, key) {
        return apis.isShowing(c, key);
      },
      hideSlot: function (apis, c, key) {
        return apis.hideSlot(c, key);
      },
      hideAllSlots: function (apis, c) {
        return apis.hideAllSlots(c);
      },
      showSlot: function (apis, c, key) {
        return apis.showSlot(c, key);
      }
    }, makeApi);
    var SlotContainer = __assign({}, slotApis, { sketch: sketch$3 });

    var api$3 = function (comp) {
      return {
        element: function () {
          return comp.element().dom();
        }
      };
    };
    var makePanels = function (parts, panelConfigs) {
      return map(panelConfigs, function (config$$1) {
        var name = config$$1.name;
        var settings = config$$1.settings;
        return parts.slot(name, {
          dom: {
            tag: 'div',
            classes: ['tox-sidebar__pane']
          },
          behaviours: SimpleBehaviours.unnamedEvents([
            runOnAttached(function (sidepanel) {
              if (settings.onrender) {
                settings.onrender(api$3(sidepanel));
              }
            }),
            run(slotVisibility(), function (sidepanel, se) {
              var data = se.event();
              var optSidePanelConfig = find(panelConfigs, function (config$$1) {
                return config$$1.name === data.name();
              });
              optSidePanelConfig.each(function (sidePanelConfig) {
                var settings = sidePanelConfig.settings;
                var handler = data.visible() ? settings.onshow : settings.onhide;
                if (handler) {
                  handler(api$3(sidepanel));
                }
              });
            })
          ])
        });
      });
    };
    var makeSidebar = function (panelConfigs) {
      return SlotContainer.sketch(function (parts) {
        return {
          dom: {
            tag: 'div',
            classes: ['tox-sidebar__pane-container']
          },
          components: makePanels(parts, panelConfigs),
          slotBehaviours: SimpleBehaviours.unnamedEvents([runOnAttached(function (slotContainer) {
              return SlotContainer.hideAllSlots(slotContainer);
            })])
        };
      });
    };
    var setSidebar = function (sidebar, panelConfigs) {
      var optSlider = Composing.getCurrent(sidebar);
      optSlider.each(function (slider) {
        return Replacing.set(slider, [makeSidebar(panelConfigs)]);
      });
    };
    var toggleSidebar = function (sidebar, name) {
      var optSlider = Composing.getCurrent(sidebar);
      optSlider.each(function (slider) {
        var optSlotContainer = Composing.getCurrent(slider);
        optSlotContainer.each(function (slotContainer) {
          if (Sliding.hasGrown(slider)) {
            if (SlotContainer.isShowing(slotContainer, name)) {
              Sliding.shrink(slider);
            } else {
              SlotContainer.hideAllSlots(slotContainer);
              SlotContainer.showSlot(slotContainer, name);
            }
          } else {
            SlotContainer.hideAllSlots(slotContainer);
            SlotContainer.showSlot(slotContainer, name);
            Sliding.grow(slider);
          }
        });
      });
    };
    var whichSidebar = function (sidebar) {
      var optSlider = Composing.getCurrent(sidebar);
      return optSlider.bind(function (slider) {
        var sidebarOpen = Sliding.isGrowing(slider) || Sliding.hasGrown(slider);
        if (sidebarOpen) {
          var optSlotContainer = Composing.getCurrent(slider);
          return optSlotContainer.bind(function (slotContainer) {
            return find(SlotContainer.getSlotNames(slotContainer), function (name) {
              return SlotContainer.isShowing(slotContainer, name);
            });
          });
        } else {
          return Option.none();
        }
      });
    };
    var fixSize = generate$1('FixSizeEvent');
    var autoSize = generate$1('AutoSizeEvent');
    var renderSidebar = function (spec) {
      return {
        uid: spec.uid,
        dom: {
          tag: 'div',
          classes: ['tox-sidebar']
        },
        components: [{
            dom: {
              tag: 'div',
              classes: ['tox-sidebar__slider']
            },
            components: [],
            behaviours: derive$1([
              Tabstopping.config({}),
              Focusing.config({}),
              Sliding.config({
                dimension: { property: 'width' },
                closedClass: 'tox-sidebar--sliding-closed',
                openClass: 'tox-sidebar--sliding-open',
                shrinkingClass: 'tox-sidebar--sliding-shrinking',
                growingClass: 'tox-sidebar--sliding-growing',
                onShrunk: function (slider) {
                  var optSlotContainer = Composing.getCurrent(slider);
                  optSlotContainer.each(SlotContainer.hideAllSlots);
                  emit(slider, autoSize);
                },
                onGrown: function (slider) {
                  emit(slider, autoSize);
                },
                onStartGrow: function (slider) {
                  emitWith(slider, fixSize, { width: getRaw(slider.element(), 'width').getOr('') });
                },
                onStartShrink: function (slider) {
                  emitWith(slider, fixSize, { width: get$8(slider.element()) + 'px' });
                }
              }),
              Replacing.config({}),
              Composing.config({
                find: function (comp) {
                  var children = Replacing.contents(comp);
                  return head(children);
                }
              })
            ])
          }],
        behaviours: derive$1([
          ComposingConfigs.childAt(0),
          config('sidebar-sliding-events', [
            run(fixSize, function (comp, se) {
              set$2(comp.element(), 'width', se.event().width());
            }),
            run(autoSize, function (comp, se) {
              remove$6(comp.element(), 'width');
            })
          ])
        ])
      };
    };
    var Sidebar = {
      setSidebar: setSidebar,
      toggleSidebar: toggleSidebar,
      whichSidebar: whichSidebar,
      renderSidebar: renderSidebar
    };

    var factory$d = function (detail, components, spec) {
      var apis = {
        getSocket: function (comp) {
          return parts$a.getPart(comp, detail, 'socket');
        },
        setSidebar: function (comp, panelConfigs) {
          parts$a.getPart(comp, detail, 'sidebar').each(function (sidebar) {
            return Sidebar.setSidebar(sidebar, panelConfigs);
          });
        },
        toggleSidebar: function (comp, name) {
          parts$a.getPart(comp, detail, 'sidebar').each(function (sidebar) {
            return Sidebar.toggleSidebar(sidebar, name);
          });
        },
        whichSidebar: function (comp) {
          return parts$a.getPart(comp, detail, 'sidebar').bind(Sidebar.whichSidebar).getOrNull();
        },
        getToolbar: function (comp) {
          return parts$a.getPart(comp, detail, 'toolbar');
        },
        setToolbar: function (comp, groups) {
          parts$a.getPart(comp, detail, 'toolbar').each(function (toolbar) {
            Toolbar.setGroups(toolbar, groups);
          });
        },
        focusToolbar: function (comp) {
          parts$a.getPart(comp, detail, 'toolbar').each(function (toolbar) {
            Keying.focusIn(toolbar);
          });
        },
        setMenubar: function (comp, menus) {
          parts$a.getPart(comp, detail, 'menubar').each(function (menubar) {
            SilverMenubar.setMenus(menubar, menus);
          });
        },
        focusMenubar: function (comp) {
          parts$a.getPart(comp, detail, 'menubar').each(function (menubar) {
            SilverMenubar.focus(menubar);
          });
        }
      };
      return {
        uid: detail.uid,
        dom: detail.dom,
        components: components,
        apis: apis,
        behaviours: detail.behaviours
      };
    };
    var partMenubar = partType$1.optional({
      factory: SilverMenubar,
      name: 'menubar',
      schema: [
        strict$1('dom'),
        strict$1('getSink')
      ]
    });
    var partToolbar = partType$1.optional({
      factory: {
        sketch: function (spec) {
          return renderToolbar({
            uid: spec.uid,
            onEscape: function () {
              spec.onEscape();
              return Option.some(true);
            },
            cyclicKeying: false,
            initGroups: []
          });
        }
      },
      name: 'toolbar',
      schema: [
        strict$1('dom'),
        strict$1('onEscape')
      ]
    });
    var partSocket = partType$1.optional({
      name: 'socket',
      schema: [strict$1('dom')]
    });
    var partSidebar = partType$1.optional({
      factory: { sketch: Sidebar.renderSidebar },
      name: 'sidebar',
      schema: [strict$1('dom')]
    });
    var OuterContainer = composite$1({
      name: 'OuterContainer',
      factory: factory$d,
      configFields: [
        strict$1('dom'),
        strict$1('behaviours')
      ],
      partFields: [
        partMenubar,
        partToolbar,
        partSocket,
        partSidebar
      ],
      apis: {
        getSocket: function (apis, comp) {
          return apis.getSocket(comp);
        },
        setSidebar: function (apis, comp, panelConfigs) {
          apis.setSidebar(comp, panelConfigs);
        },
        toggleSidebar: function (apis, comp, name) {
          apis.toggleSidebar(comp, name);
        },
        whichSidebar: function (apis, comp) {
          return apis.whichSidebar(comp);
        },
        getToolbar: function (apis, comp) {
          return apis.getToolbar(comp);
        },
        setToolbar: function (apis, comp, grps) {
          var groups = map(grps, function (grp) {
            return renderToolbarGroup(grp);
          });
          apis.setToolbar(comp, groups);
        },
        setMenubar: function (apis, comp, menus) {
          apis.setMenubar(comp, menus);
        },
        focusMenubar: function (apis, comp) {
          apis.focusMenubar(comp);
        },
        focusToolbar: function (apis, comp) {
          apis.focusToolbar(comp);
        }
      }
    });

    var fireSkinLoaded = function (editor) {
      return editor.fire('SkinLoaded');
    };
    var fireResizeEditor = function (editor) {
      return editor.fire('ResizeEditor');
    };
    var fireBeforeRenderUI = function (editor) {
      return editor.fire('BeforeRenderUI');
    };
    var Events$1 = {
      fireSkinLoaded: fireSkinLoaded,
      fireResizeEditor: fireResizeEditor,
      fireBeforeRenderUI: fireBeforeRenderUI
    };

    var fireSkinLoaded$1 = function (editor) {
      var done = function () {
        editor._skinLoaded = true;
        Events$1.fireSkinLoaded(editor);
      };
      return function () {
        if (editor.initialized) {
          done();
        } else {
          editor.on('init', done);
        }
      };
    };
    var SkinLoaded = { fireSkinLoaded: fireSkinLoaded$1 };

    var loadSkin = function (isInline, editor) {
      var skinUrl = getSkinUrl(editor);
      var skinUiCss;
      if (skinUrl) {
        skinUiCss = skinUrl + '/skin.min.css';
        editor.contentCSS.push(skinUrl + (isInline ? '/content.inline' : '/content') + '.min.css');
      }
      if (isSkinDisabled(editor) === false && skinUiCss) {
        global$4.DOM.styleSheetLoader.load(skinUiCss, SkinLoaded.fireSkinLoaded(editor));
      } else {
        SkinLoaded.fireSkinLoaded(editor)();
      }
    };
    var iframe = curry(loadSkin, false);
    var inline = curry(loadSkin, true);

    var handleSwitchMode = function (uiComponents) {
      return function (e) {
        var outerContainer = uiComponents.outerContainer;
        all('*', outerContainer.element()).forEach(function (elm) {
          outerContainer.getSystem().getByDom(elm).each(function (comp) {
            if (comp.hasConfigured(Disabling)) {
              if (e.mode === 'readonly') {
                Disabling.disable(comp);
              } else {
                Disabling.enable(comp);
              }
            }
          });
        });
      };
    };
    var render = function (editor, uiComponents, rawUiConfig, backstage, args) {
      iframe(editor);
      attachSystemAfter(Element$$1.fromDom(args.targetNode), uiComponents.mothership);
      attachSystem(body(), uiComponents.uiMothership);
      editor.on('init', function () {
        OuterContainer.setToolbar(uiComponents.outerContainer, identifyButtons(editor, rawUiConfig, { backstage: backstage }));
        OuterContainer.setMenubar(uiComponents.outerContainer, identifyMenus(editor, rawUiConfig, backstage));
        OuterContainer.setSidebar(uiComponents.outerContainer, editor.sidebars || []);
        if (editor.readonly) {
          handleSwitchMode(uiComponents)({ mode: 'readonly' });
        }
      });
      var socket = OuterContainer.getSocket(uiComponents.outerContainer).getOrDie('Could not find expected socket element');
      editor.on('SwitchMode', handleSwitchMode(uiComponents));
      if (isReadOnly(editor)) {
        editor.setMode('readonly');
      }
      editor.addCommand('ToggleSidebar', function (ui, value) {
        OuterContainer.toggleSidebar(uiComponents.outerContainer, value);
        editor.fire('ToggleSidebar');
      });
      editor.addQueryValueHandler('ToggleSidebar', function () {
        return OuterContainer.whichSidebar(uiComponents.outerContainer);
      });
      return {
        iframeContainer: socket.element().dom(),
        editorContainer: uiComponents.outerContainer.element().dom()
      };
    };
    var Iframe = {
      render: render,
      getBehaviours: function (_) {
        return [];
      }
    };

    var getOrigin = function (element, scroll) {
      return offsetParent(element).orThunk(function () {
        var marker = Element$$1.fromTag('span');
        before(element, marker);
        var offsetParent$$1 = offsetParent(marker);
        remove(marker);
        return offsetParent$$1;
      }).map(function (offsetP) {
        var loc = absolute(offsetP);
        return loc.translate(-scroll.left(), -scroll.top());
      }).getOrThunk(function () {
        return Position(0, 0);
      });
    };

    var adt$b = Adt.generate([
      {
        offset: [
          'x',
          'y'
        ]
      },
      {
        absolute: [
          'x',
          'y'
        ]
      },
      {
        fixed: [
          'x',
          'y'
        ]
      }
    ]);
    var subtract = function (change) {
      return function (point) {
        return point.translate(-change.left(), -change.top());
      };
    };
    var add$4 = function (change) {
      return function (point) {
        return point.translate(change.left(), change.top());
      };
    };
    var transform$1 = function (changes) {
      return function (x, y) {
        return foldl(changes, function (rest, f) {
          return f(rest);
        }, Position(x, y));
      };
    };
    var asFixed = function (coord, scroll, origin) {
      return coord.fold(transform$1([
        add$4(origin),
        subtract(scroll)
      ]), transform$1([subtract(scroll)]), transform$1([]));
    };
    var asAbsolute = function (coord, scroll, origin) {
      return coord.fold(transform$1([add$4(origin)]), transform$1([]), transform$1([add$4(scroll)]));
    };
    var asOffset = function (coord, scroll, origin) {
      return coord.fold(transform$1([]), transform$1([subtract(origin)]), transform$1([
        add$4(scroll),
        subtract(origin)
      ]));
    };
    var withinRange = function (coord1, coord2, xRange, yRange, scroll, origin) {
      var a1 = asAbsolute(coord1, scroll, origin);
      var a2 = asAbsolute(coord2, scroll, origin);
      return Math.abs(a1.left() - a2.left()) <= xRange && Math.abs(a1.top() - a2.top()) <= yRange;
    };
    var toStyles = function (coord, scroll, origin) {
      return coord.fold(function (x, y) {
        return {
          position: 'absolute',
          left: x + 'px',
          top: y + 'px'
        };
      }, function (x, y) {
        return {
          position: 'absolute',
          left: x - origin.left() + 'px',
          top: y - origin.top() + 'px'
        };
      }, function (x, y) {
        return {
          position: 'fixed',
          left: x + 'px',
          top: y + 'px'
        };
      });
    };
    var translate$2 = function (coord, deltaX, deltaY) {
      return coord.fold(function (x, y) {
        return adt$b.offset(x + deltaX, y + deltaY);
      }, function (x, y) {
        return adt$b.absolute(x + deltaX, y + deltaY);
      }, function (x, y) {
        return adt$b.fixed(x + deltaX, y + deltaY);
      });
    };
    var absorb = function (partialCoord, originalCoord, scroll, origin) {
      var absorbOne = function (stencil, nu) {
        return function (optX, optY) {
          var original = stencil(originalCoord, scroll, origin);
          return nu(optX.getOr(original.left()), optY.getOr(original.top()));
        };
      };
      return partialCoord.fold(absorbOne(asOffset, adt$b.offset), absorbOne(asAbsolute, adt$b.absolute), absorbOne(asFixed, adt$b.fixed));
    };
    var offset = adt$b.offset;
    var absolute$3 = adt$b.absolute;
    var fixed$1 = adt$b.fixed;

    var appear = function (component, contextualInfo) {
      add$2(component.element(), contextualInfo.transitionClass);
      remove$4(component.element(), contextualInfo.fadeOutClass);
      add$2(component.element(), contextualInfo.fadeInClass);
    };
    var disappear = function (component, contextualInfo) {
      add$2(component.element(), contextualInfo.transitionClass);
      remove$4(component.element(), contextualInfo.fadeInClass);
      add$2(component.element(), contextualInfo.fadeOutClass);
    };
    var isPartiallyVisible = function (box$$1, viewport$$1) {
      return box$$1.y() < viewport$$1.bottom() && box$$1.bottom() > viewport$$1.y();
    };
    var isCompletelyVisible = function (box$$1, viewport$$1) {
      return box$$1.y() >= viewport$$1.y() && box$$1.bottom() <= viewport$$1.bottom();
    };
    var getAttr = function (elem, attr) {
      return has$1(elem, attr) ? Option.some(parseInt(get$2(elem, attr), 10)) : Option.none();
    };
    var getPrior = function (component, dockInfo) {
      var elem = component.element();
      return getAttr(elem, dockInfo.leftAttr).bind(function (left) {
        return getAttr(elem, dockInfo.topAttr).map(function (top) {
          var w = get$8(component.element());
          var h = get$9(component.element());
          return bounds(left, top, w, h);
        });
      });
    };
    var setPrior = function (component, dockInfo, absLeft, absTop) {
      var elem = component.element();
      set$1(elem, dockInfo.leftAttr, absLeft);
      set$1(elem, dockInfo.topAttr, absTop);
    };
    var clearPrior = function (component, dockInfo) {
      var elem = component.element();
      remove$1(elem, dockInfo.leftAttr);
      remove$1(elem, dockInfo.topAttr);
    };
    var morphToAbsolute = function (component, dockInfo, viewport$$1) {
      return getPrior(component, dockInfo).bind(function (box$$1) {
        if (isCompletelyVisible(box$$1, viewport$$1)) {
          clearPrior(component, dockInfo);
          return Option.some(absolute$3(box$$1.x(), box$$1.y()));
        } else {
          return Option.none();
        }
      });
    };
    var morphToFixed = function (component, dockInfo, viewport$$1, scroll, origin) {
      var loc = absolute(component.element());
      var box$$1 = bounds(loc.left(), loc.top(), get$8(component.element()), get$9(component.element()));
      if (!isCompletelyVisible(box$$1, viewport$$1)) {
        setPrior(component, dockInfo, loc.left(), loc.top());
        var coord = absolute$3(loc.left(), loc.top());
        var asFixed$$1 = asFixed(coord, scroll, origin);
        var viewportPt = absolute$3(viewport$$1.x(), viewport$$1.y());
        var fixedViewport = asFixed(viewportPt, scroll, origin);
        var fixedY = box$$1.y() <= viewport$$1.y() ? fixedViewport.top() : fixedViewport.top() + viewport$$1.height() - box$$1.height();
        return Option.some(fixed$1(asFixed$$1.left(), fixedY));
      } else {
        return Option.none();
      }
    };
    var getMorph = function (component, dockInfo, viewport$$1, scroll, origin) {
      var isDocked = getRaw(component.element(), 'position').is('fixed');
      return isDocked ? morphToAbsolute(component, dockInfo, viewport$$1) : morphToFixed(component, dockInfo, viewport$$1, scroll, origin);
    };

    var refresh = function (component, config, state) {
      var viewport = config.lazyViewport(component);
      config.contextual.each(function (contextInfo) {
        contextInfo.lazyContext(component).each(function (elem) {
          var box$$1 = box(elem);
          var isVisible = isPartiallyVisible(box$$1, viewport);
          var method = isVisible ? appear : disappear;
          method(component, contextInfo);
        });
      });
      var doc = owner(component.element());
      var scroll = get$7(doc);
      var origin = getOrigin(component.element(), scroll);
      getMorph(component, config, viewport, scroll, origin).each(function (morph) {
        var styles = toStyles(morph, scroll, origin);
        setAll$1(component.element(), styles);
      });
    };

    var DockingApis = /*#__PURE__*/Object.freeze({
        refresh: refresh
    });

    var events$e = function (dockInfo, dockState) {
      return derive([
        run(transitionend(), function (component, simulatedEvent) {
          dockInfo.contextual.each(function (contextInfo) {
            if (eq(component.element(), simulatedEvent.event().target())) {
              remove$4(component.element(), contextInfo.transitionClass);
              simulatedEvent.stop();
            }
          });
        }),
        run(windowScroll(), function (component, _) {
          refresh(component, dockInfo, dockState);
        })
      ]);
    };

    var ActiveDocking = /*#__PURE__*/Object.freeze({
        events: events$e
    });

    var defaultLazyViewport = function (_component) {
      var scroll$$1 = get$7();
      return bounds(scroll$$1.left(), scroll$$1.top(), window.innerWidth, window.innerHeight);
    };
    var DockingSchema = [
      optionObjOf('contextual', [
        strict$1('fadeInClass'),
        strict$1('fadeOutClass'),
        strict$1('transitionClass'),
        strict$1('lazyContext')
      ]),
      defaulted$1('lazyViewport', defaultLazyViewport),
      strict$1('leftAttr'),
      strict$1('topAttr')
    ];

    var Docking = create$1({
      fields: DockingSchema,
      name: 'docking',
      active: ActiveDocking,
      apis: DockingApis
    });

    var render$1 = function (editor, uiComponents, rawUiConfig, backstage, args) {
      var floatContainer;
      var DOM = global$4.DOM;
      inline(editor);
      var setPosition = function () {
        var isDocked = getRaw(floatContainer.element(), 'position').is('fixed');
        if (!isDocked) {
          setAll$1(floatContainer.element(), {
            top: absolute(Element$$1.fromDom(editor.getBody())).top() - get$9(floatContainer.element()) + 'px',
            left: absolute(Element$$1.fromDom(editor.getBody())).left() + 'px'
          });
        }
        Docking.refresh(floatContainer);
      };
      var show = function () {
        set$2(uiComponents.outerContainer.element(), 'display', 'flex');
        DOM.addClass(editor.getBody(), 'mce-edit-focus');
        setPosition();
        Docking.refresh(floatContainer);
      };
      var hide = function () {
        if (uiComponents.outerContainer) {
          set$2(uiComponents.outerContainer.element(), 'display', 'none');
          DOM.removeClass(editor.getBody(), 'mce-edit-focus');
        }
      };
      var render = function () {
        if (floatContainer) {
          show();
          return;
        }
        floatContainer = uiComponents.outerContainer;
        attachSystem(body(), uiComponents.mothership);
        attachSystem(body(), uiComponents.uiMothership);
        OuterContainer.setToolbar(uiComponents.outerContainer, identifyButtons(editor, rawUiConfig, { backstage: backstage }));
        OuterContainer.setMenubar(uiComponents.outerContainer, identifyMenus(editor, rawUiConfig, backstage));
        setAll$1(floatContainer.element(), {
          position: 'absolute',
          top: absolute(Element$$1.fromDom(editor.getBody())).top() - get$9(floatContainer.element()) + 'px',
          left: absolute(Element$$1.fromDom(editor.getBody())).left() + 'px'
        });
        setPosition();
        show();
        editor.on('nodeChange ResizeWindow', setPosition);
        editor.on('activate', show);
        editor.on('deactivate', hide);
        editor.nodeChanged();
      };
      editor.on('focus', render);
      editor.on('blur hide', hide);
      return { editorContainer: uiComponents.outerContainer.element().dom() };
    };
    var getBehaviours$2 = function (editor) {
      return [
        Docking.config({
          leftAttr: 'data-dock-left',
          topAttr: 'data-dock-top',
          contextual: {
            lazyContext: function (_) {
              return Option.from(editor).map(function (ed) {
                return Element$$1.fromDom(ed.getBody());
              });
            },
            fadeInClass: 'tox-toolbar-dock-fadein',
            fadeOutClass: 'tox-toolbar-dock-fadeout',
            transitionClass: 'tox-toolbar-dock-transition'
          }
        }),
        Focusing.config({})
      ];
    };
    var Inline = {
      render: render$1,
      getBehaviours: getBehaviours$2
    };

    var nu$d = function (x, y) {
      return {
        anchor: 'makeshift',
        x: x,
        y: y
      };
    };
    var transpose$1 = function (pos, dx, dy) {
      return nu$d(pos.x + dx, pos.y + dy);
    };
    var fromPageXY = function (e) {
      return nu$d(e.pageX, e.pageY);
    };
    var fromClientXY = function (e) {
      return nu$d(e.clientX, e.clientY);
    };
    var transposeContentAreaContainer = function (element, pos) {
      var containerPos = global$4.DOM.getPos(element);
      return transpose$1(pos, containerPos.x, containerPos.y);
    };
    var getPointAnchor = function (editor, e) {
      if (e.type === 'contextmenu') {
        if (editor.inline) {
          return fromPageXY(e);
        } else {
          return transposeContentAreaContainer(editor.getContentAreaContainer(), fromClientXY(e));
        }
      } else {
        return getSelectionAnchor(editor);
      }
    };
    var getSelectionAnchor = function (editor) {
      return {
        anchor: 'selection',
        root: Element$$1.fromDom(editor.selection.getNode())
      };
    };
    var getNodeAnchor = function (editor) {
      return {
        anchor: 'node',
        node: Option.some(Element$$1.fromDom(editor.selection.getNode())),
        root: Element$$1.fromDom(editor.getBody())
      };
    };

    var patchPipeConfig = function (config) {
      return typeof config === 'string' ? config.split(/[ ,]/) : config;
    };
    var shouldNeverUseNative = function (editor) {
      return editor.settings.contextmenu_never_use_native || false;
    };
    var getMenuItems = function (editor, name, defaultItems) {
      var contextMenus = editor.ui.registry.getAll().contextMenus;
      return get(editor.settings, name).map(patchPipeConfig).getOrThunk(function () {
        return filter(patchPipeConfig(defaultItems), function (item) {
          return has(contextMenus, item);
        });
      });
    };
    var getContextMenu = function (editor) {
      return getMenuItems(editor, 'contextmenu', 'link image imagetools table spellchecker configurepermanentpen');
    };
    var Settings$1 = {
      shouldNeverUseNative: shouldNeverUseNative,
      getContextMenu: getContextMenu
    };

    var isSeparator$1 = function (item) {
      return isString(item) ? item === '|' : item.type === 'separator';
    };
    var separator$3 = { type: 'separator' };
    var makeContextItem = function (item) {
      if (isString(item)) {
        return item;
      } else {
        switch (item.type) {
        case 'separator':
          return separator$3;
        case 'submenu':
          return {
            type: 'nestedmenuitem',
            text: item.text,
            icon: item.icon,
            getSubmenuItems: function () {
              var items = item.getSubmenuItems();
              if (isString(items)) {
                return items;
              } else {
                return map(items, makeContextItem);
              }
            }
          };
        default:
          return {
            type: 'menuitem',
            text: item.text,
            icon: item.icon,
            onAction: noarg(item.onAction)
          };
        }
      }
    };
    var addContextMenuGroup = function (xs, groupItems) {
      if (groupItems.length === 0) {
        return xs;
      }
      var lastMenuItem = last(xs).filter(function (item) {
        return !isSeparator$1(item);
      });
      var before = lastMenuItem.fold(function () {
        return [];
      }, function (_) {
        return [separator$3];
      });
      return xs.concat(before).concat(groupItems).concat([separator$3]);
    };
    var generateContextMenu = function (contextMenus, menuConfig, selectedElement) {
      var items = foldl(menuConfig, function (acc, name) {
        if (has(contextMenus, name)) {
          var items_1 = contextMenus[name].update(selectedElement);
          if (isString(items_1)) {
            return addContextMenuGroup(acc, items_1.split(' '));
          } else if (items_1.length > 0) {
            var allItems = map(items_1, makeContextItem);
            return addContextMenuGroup(acc, allItems);
          } else {
            return acc;
          }
        } else {
          return acc.concat([name]);
        }
      }, []);
      if (items.length > 0 && isSeparator$1(items[items.length - 1])) {
        items.pop();
      }
      return items;
    };
    var isNativeOverrideKeyEvent = function (editor, e) {
      return e.ctrlKey && !Settings$1.shouldNeverUseNative(editor);
    };
    var setup$4 = function (editor, lazySink, sharedBackstage) {
      var contextmenu = build$1(InlineView.sketch({
        dom: { tag: 'div' },
        lazySink: lazySink,
        onEscape: function () {
          return editor.focus();
        }
      }));
      editor.on('contextmenu', function (e) {
        if (isNativeOverrideKeyEvent(editor, e)) {
          return;
        }
        var isTriggeredByKeyboardEvent = e.button !== 2 || e.target === editor.getBody();
        var anchorSpec = isTriggeredByKeyboardEvent ? getNodeAnchor(editor) : getPointAnchor(editor, e);
        var registry = editor.ui.registry.getAll();
        var menuConfig = Settings$1.getContextMenu(editor);
        var selectedElement = isTriggeredByKeyboardEvent ? editor.selection.getStart(true) : e.target;
        var items = generateContextMenu(registry.contextMenus, menuConfig, selectedElement);
        if (items.length > 0) {
          e.preventDefault();
          InlineView.showMenuAt(contextmenu, anchorSpec, {
            menu: { markers: markers$1('normal') },
            data: build$2(items, ItemResponse$1.CLOSE_ON_EXECUTE, sharedBackstage.providers)
          });
        }
      });
    };

    var parseToInt = function (val) {
      var re = /^[0-9\.]+(|px)$/i;
      if (re.test('' + val)) {
        return Option.some(parseInt(val, 10));
      }
      return Option.none();
    };
    var numToPx = function (val) {
      return isNumber(val) ? val + 'px' : val;
    };
    var Utils = {
      parseToInt: parseToInt,
      numToPx: numToPx
    };

    var initialAttribute = 'data-initial-z-index';
    var resetZIndex = function (blocker) {
      parent(blocker.element()).each(function (root) {
        var initZIndex = get$2(root, initialAttribute);
        if (has$1(root, initialAttribute)) {
          set$2(root, 'z-index', initZIndex);
        } else {
          remove$6(root, 'z-index');
        }
        remove$1(root, initialAttribute);
      });
    };
    var changeZIndex = function (blocker) {
      parent(blocker.element()).each(function (root) {
        getRaw(root, 'z-index').each(function (zindex) {
          set$1(root, initialAttribute, zindex);
        });
        set$2(root, 'z-index', get$5(blocker.element(), 'z-index'));
      });
    };
    var instigate = function (anyComponent, blocker) {
      anyComponent.getSystem().addToGui(blocker);
      changeZIndex(blocker);
    };
    var discard = function (blocker) {
      resetZIndex(blocker);
      blocker.getSystem().removeFromGui(blocker);
    };

    var get$f = function (component, snapsInfo) {
      var element = component.element();
      var x = parseInt(get$2(element, snapsInfo.leftAttr), 10);
      var y = parseInt(get$2(element, snapsInfo.topAttr), 10);
      return isNaN(x) || isNaN(y) ? Option.none() : Option.some(Position(x, y));
    };
    var set$9 = function (component, snapsInfo, pt) {
      var element = component.element();
      set$1(element, snapsInfo.leftAttr, pt.left() + 'px');
      set$1(element, snapsInfo.topAttr, pt.top() + 'px');
    };
    var clear$1 = function (component, snapsInfo) {
      var element = component.element();
      remove$1(element, snapsInfo.leftAttr);
      remove$1(element, snapsInfo.topAttr);
    };

    var getCoords = function (component, snapInfo, coord, delta) {
      return get$f(component, snapInfo).fold(function () {
        return coord;
      }, function (fixed) {
        return fixed$1(fixed.left() + delta.left(), fixed.top() + delta.top());
      });
    };
    var moveOrSnap = function (component, snapInfo, coord, delta, scroll, origin) {
      var newCoord = getCoords(component, snapInfo, coord, delta);
      var snap = findSnap(component, snapInfo, newCoord, scroll, origin);
      var fixedCoord = asFixed(newCoord, scroll, origin);
      set$9(component, snapInfo, fixedCoord);
      return snap.fold(function () {
        return {
          coord: fixed$1(fixedCoord.left(), fixedCoord.top()),
          extra: Option.none()
        };
      }, function (spanned) {
        return {
          coord: spanned.output(),
          extra: spanned.extra()
        };
      });
    };
    var stopDrag = function (component, snapInfo) {
      clear$1(component, snapInfo);
    };
    var findSnap = function (component, snapInfo, newCoord, scroll, origin) {
      var snaps = snapInfo.getSnapPoints(component);
      return findMap(snaps, function (snap) {
        var sensor = snap.sensor();
        var inRange = withinRange(newCoord, sensor, snap.range().left(), snap.range().top(), scroll, origin);
        return inRange ? Option.some({
          output: constant(absorb(snap.output(), newCoord, scroll, origin)),
          extra: snap.extra
        }) : Option.none();
      });
    };

    var getCurrentCoord = function (target) {
      return getRaw(target, 'left').bind(function (left) {
        return getRaw(target, 'top').bind(function (top) {
          return getRaw(target, 'position').map(function (position) {
            var nu = position === 'fixed' ? fixed$1 : offset;
            return nu(parseInt(left, 10), parseInt(top, 10));
          });
        });
      }).getOrThunk(function () {
        var location = absolute(target);
        return absolute$3(location.left(), location.top());
      });
    };
    var calcNewCoord = function (component, optSnaps, currentCoord, scroll, origin, delta) {
      return optSnaps.fold(function () {
        var translated = translate$2(currentCoord, delta.left(), delta.top());
        var fixedCoord = asFixed(translated, scroll, origin);
        return fixed$1(fixedCoord.left(), fixedCoord.top());
      }, function (snapInfo) {
        var snapping = moveOrSnap(component, snapInfo, currentCoord, delta, scroll, origin);
        snapping.extra.each(function (extra) {
          snapInfo.onSensor(component, extra);
        });
        return snapping.coord;
      });
    };
    var dragBy = function (component, dragConfig, delta) {
      var target = dragConfig.getTarget(component.element());
      if (dragConfig.repositionTarget) {
        var doc = owner(component.element());
        var scroll = get$7(doc);
        var origin = getOrigin(target, scroll);
        var currentCoord = getCurrentCoord(target);
        var newCoord = calcNewCoord(component, dragConfig.snaps, currentCoord, scroll, origin, delta);
        var styles = toStyles(newCoord, scroll, origin);
        setAll$1(target, styles);
      }
      dragConfig.onDrag(component, target, delta);
    };

    var defaultLazyViewport$1 = function () {
      var scroll$$1 = get$7();
      return {
        x: scroll$$1.left,
        y: scroll$$1.top,
        width: constant(window.innerWidth),
        height: constant(window.innerHeight),
        bottom: constant(scroll$$1.top() + window.innerHeight),
        right: constant(scroll$$1.left() + window.innerWidth)
      };
    };
    var SnapSchema = optionObjOf('snaps', [
      strict$1('getSnapPoints'),
      onHandler('onSensor'),
      strict$1('leftAttr'),
      strict$1('topAttr'),
      defaulted$1('lazyViewport', defaultLazyViewport$1)
    ]);

    var init$b = function (dragApi) {
      return derive([
        run(mousedown(), dragApi.forceDrop),
        run(mouseup(), dragApi.drop),
        run(mousemove(), function (comp, simulatedEvent) {
          dragApi.move(simulatedEvent.event());
        }),
        run(mouseout(), dragApi.delayDrop)
      ]);
    };

    var getData$1 = function (event) {
      return Option.from(Position(event.x(), event.y()));
    };
    var getDelta$1 = function (old, nu) {
      return Position(nu.left() - old.left(), nu.top() - old.top());
    };

    var MouseData = /*#__PURE__*/Object.freeze({
        getData: getData$1,
        getDelta: getDelta$1
    });

    var handlers = function (dragConfig, dragState) {
      return derive([run(mousedown(), function (component, simulatedEvent) {
          var raw = simulatedEvent.event().raw();
          if (raw.button !== 0) {
            return;
          }
          simulatedEvent.stop();
          var dragApi = {
            drop: function () {
              stop();
            },
            delayDrop: function () {
              delayDrop.schedule();
            },
            forceDrop: function () {
              stop();
            },
            move: function (event) {
              delayDrop.cancel();
              var delta = dragState.update(MouseData, event);
              delta.each(function (dlt) {
                dragBy(component, dragConfig, dlt);
              });
            }
          };
          var blocker = component.getSystem().build(Container.sketch({
            dom: {
              styles: {
                'left': '0px',
                'top': '0px',
                'width': '100%',
                'height': '100%',
                'position': 'fixed',
                'z-index': '1000000000000000'
              },
              classes: [dragConfig.blockerClass]
            },
            events: init$b(dragApi)
          }));
          var stop = function () {
            discard(blocker);
            dragConfig.snaps.each(function (snapInfo) {
              stopDrag(component, snapInfo);
            });
            var target = dragConfig.getTarget(component.element());
            dragConfig.onDrop(component, target);
          };
          var delayDrop = DelayedFunction(stop, 200);
          var start = function () {
            dragState.reset();
            instigate(component, blocker);
          };
          start();
        })]);
    };
    var schema$n = [
      defaulted$1('useFixed', false),
      strict$1('blockerClass'),
      defaulted$1('getTarget', identity),
      defaulted$1('onDrag', noop),
      defaulted$1('repositionTarget', true),
      onHandler('onDrop'),
      SnapSchema,
      output$1('dragger', { handlers: handlers })
    ];

    var getDataFrom = function (touches) {
      var touch = touches[0];
      return Option.some(Position(touch.clientX, touch.clientY));
    };
    var getData$2 = function (event) {
      var raw = event.raw();
      var touches = raw.touches;
      return touches.length === 1 ? getDataFrom(touches) : Option.none();
    };
    var getDelta$2 = function (old, nu) {
      return Position(nu.left() - old.left(), nu.top() - old.top());
    };

    var TouchData = /*#__PURE__*/Object.freeze({
        getData: getData$2,
        getDelta: getDelta$2
    });

    var handlers$1 = function (dragConfig, dragState) {
      return derive([
        stopper(touchstart()),
        run(touchmove(), function (component, simulatedEvent) {
          simulatedEvent.stop();
          var delta = dragState.update(TouchData, simulatedEvent.event());
          delta.each(function (dlt) {
            dragBy(component, dragConfig, dlt);
          });
        }),
        run(touchend(), function (component, simulatedEvent) {
          dragConfig.snaps.each(function (snapInfo) {
            stopDrag(component, snapInfo);
          });
          var target = dragConfig.getTarget(component.element());
          dragState.reset();
          dragConfig.onDrop(component, target);
        })
      ]);
    };
    var schema$o = [
      defaulted$1('useFixed', false),
      defaulted$1('getTarget', identity),
      defaulted$1('onDrag', noop),
      defaulted$1('repositionTarget', true),
      defaulted$1('onDrop', noop),
      SnapSchema,
      output$1('dragger', { handlers: handlers$1 })
    ];

    var mouse = schema$n;
    var touch = schema$o;

    var DraggingBranches = /*#__PURE__*/Object.freeze({
        mouse: mouse,
        touch: touch
    });

    var init$c = function () {
      var previous = Option.none();
      var reset = function () {
        previous = Option.none();
      };
      var calculateDelta = function (mode, nu) {
        var result = previous.map(function (old) {
          return mode.getDelta(old, nu);
        });
        previous = Option.some(nu);
        return result;
      };
      var update = function (mode, dragEvent) {
        return mode.getData(dragEvent).bind(function (nuData) {
          return calculateDelta(mode, nuData);
        });
      };
      var readState = constant({});
      return nu$5({
        readState: readState,
        reset: reset,
        update: update
      });
    };

    var DragState = /*#__PURE__*/Object.freeze({
        init: init$c
    });

    var Dragging = createModes$1({
      branchKey: 'mode',
      branches: DraggingBranches,
      name: 'dragging',
      active: {
        events: function (dragConfig, dragState) {
          var dragger = dragConfig.dragger;
          return dragger.handlers(dragConfig, dragState);
        }
      },
      extra: {
        snap: MixedBag([
          'sensor',
          'range',
          'output'
        ], ['extra'])
      },
      state: DragState
    });

    var ResizeTypes;
    (function (ResizeTypes) {
      ResizeTypes[ResizeTypes['None'] = 0] = 'None';
      ResizeTypes[ResizeTypes['Both'] = 1] = 'Both';
      ResizeTypes[ResizeTypes['Vertical'] = 2] = 'Vertical';
    }(ResizeTypes || (ResizeTypes = {})));
    var calcCappedSize = function (originalSize, delta, minSize, maxSize) {
      var newSize = originalSize + delta;
      var minOverride = minSize.filter(function (min) {
        return newSize < min;
      });
      var maxOverride = maxSize.filter(function (max) {
        return newSize > max;
      });
      return minOverride.or(maxOverride).getOr(newSize);
    };
    var getDimensions = function (editor, deltas, resizeType, originalHeight, originalWidth) {
      var dimensions = {};
      dimensions.height = calcCappedSize(originalHeight, deltas.top(), getMinHeightSetting(editor), getMaxHeightSetting(editor));
      if (resizeType === ResizeTypes.Both) {
        dimensions.width = calcCappedSize(originalWidth, deltas.left(), getMinWidthSetting(editor), getMaxWidthSetting(editor));
      }
      return dimensions;
    };
    var resize$3 = function (editor, deltas, resizeType) {
      var container = Element$$1.fromDom(editor.getContainer());
      var dimensions = getDimensions(editor, deltas, resizeType, editor.getContainer().scrollHeight, get$8(container));
      each$1(dimensions, function (val, dim) {
        return set$2(container, dim, val + 'px');
      });
      Events$1.fireResizeEditor(editor);
    };

    var isHidden$1 = function (elm) {
      if (elm.nodeType === 1) {
        if (elm.nodeName === 'BR' || !!elm.getAttribute('data-mce-bogus')) {
          return true;
        }
        if (elm.getAttribute('data-mce-type') === 'bookmark') {
          return true;
        }
      }
      return false;
    };
    var renderElementPath = function (editor, settings) {
      if (!settings.delimiter) {
        settings.delimiter = '\xBB';
      }
      var getDataPath = function (data) {
        var parts = data || [];
        var newPathElements = map(parts, function (part, index) {
          return Button.sketch({
            dom: {
              tag: 'div',
              classes: ['tox-statusbar__path-item'],
              attributes: {
                'role': 'button',
                'data-index': index,
                'tab-index': -1,
                'aria-level': index + 1
              },
              innerHtml: part.name
            },
            action: function (btn) {
              editor.focus();
              editor.selection.select(part.element);
              editor.nodeChanged();
            }
          });
        });
        var divider = {
          dom: {
            tag: 'div',
            classes: ['tox-statusbar__path-divider'],
            attributes: { 'aria-hidden': true },
            innerHtml: ' ' + settings.delimiter + ' '
          }
        };
        return foldl(newPathElements.slice(1), function (acc, element) {
          var newAcc = acc;
          newAcc.push(divider);
          newAcc.push(element);
          return newAcc;
        }, [newPathElements[0]]);
      };
      var updatePath = function (parents) {
        var newPath = [];
        var i = parents.length;
        while (i-- > 0) {
          var parent = parents[i];
          if (parent.nodeType === 1 && !isHidden$1(parent)) {
            var args = editor.fire('ResolveName', {
              name: parent.nodeName.toLowerCase(),
              target: parent
            });
            if (!args.isDefaultPrevented()) {
              newPath.push({
                name: args.name,
                element: parent
              });
            }
            if (args.isPropagationStopped()) {
              break;
            }
          }
        }
        return newPath;
      };
      return {
        dom: {
          tag: 'div',
          classes: ['tox-statusbar__path']
        },
        behaviours: derive$1([
          Keying.config({
            mode: 'flow',
            selector: 'div[role=button]'
          }),
          Tabstopping.config({}),
          Replacing.config({}),
          config('elementPathEvents', [runOnAttached(function (comp, e) {
              editor.shortcuts.add('alt+F11', 'focus statusbar elementpath', function () {
                return Keying.focusIn(comp);
              });
              editor.on('nodeChange', function (e) {
                var newPath = updatePath(e.parents);
                if (newPath.length > 0) {
                  Replacing.set(comp, getDataPath(newPath));
                }
              });
            })])
        ]),
        components: []
      };
    };
    var ElementPath = { renderElementPath: renderElementPath };

    var renderWordCount = function (editor, providersBackstage) {
      var replaceCountText = function (comp, count, mode) {
        return Replacing.set(comp, [text(providersBackstage.translate([
            '{0} ' + mode,
            count[mode]
          ]))]);
      };
      return {
        dom: {
          tag: 'span',
          classes: ['tox-statusbar__wordcount']
        },
        components: [],
        behaviours: derive$1([
          Replacing.config({}),
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: {
                mode: 'words',
                count: {
                  words: 0,
                  characters: 0
                }
              }
            }
          }),
          config('wordcount-events', [
            run(click(), function (comp) {
              var currentVal = Representing.getValue(comp);
              var newMode = currentVal.mode === 'words' ? 'characters' : 'words';
              Representing.setValue(comp, {
                mode: newMode,
                count: currentVal.count
              });
              replaceCountText(comp, currentVal.count, newMode);
            }),
            runOnAttached(function (comp) {
              editor.on('wordCountUpdate', function (e) {
                var mode = Representing.getValue(comp).mode;
                Representing.setValue(comp, {
                  mode: mode,
                  count: e.wordCount
                });
                replaceCountText(comp, e.wordCount, mode);
              });
            })
          ])
        ])
      };
    };

    var renderStatusbar = function (editor, providersBackstage) {
      var renderResizeHandlerIcon = function (resizeType) {
        return {
          dom: {
            tag: 'div',
            classes: ['tox-statusbar__resize-handle'],
            attributes: { title: providersBackstage.translate('Resize') },
            innerHtml: get$e('resize-handle', providersBackstage.icons)
          },
          behaviours: derive$1([Dragging.config({
              mode: 'mouse',
              repositionTarget: false,
              onDrag: function (comp, target, delta) {
                resize$3(editor, delta, resizeType);
              },
              blockerClass: 'tox-blocker'
            })])
        };
      };
      var renderBranding = function () {
        var linkHtml = '<a href="https://www.tiny.cloud/?utm_campaign=editor_referral&amp;utm_medium=poweredby&amp;utm_source=tinymce&amp;utm_content=v5" rel="noopener" target="_blank" tabindex="-1">Tiny</a>';
        var html = global$2.translate([
          'Powered by {0}',
          linkHtml
        ]);
        return {
          dom: {
            tag: 'span',
            classes: ['tox-statusbar__branding'],
            innerHtml: html
          }
        };
      };
      var getResizeType = function (editor) {
        var fallback = !contains$1(editor.settings.plugins, 'autoresize');
        var resize = editor.getParam('resize', fallback);
        if (resize === false) {
          return ResizeTypes.None;
        } else if (resize === 'both') {
          return ResizeTypes.Both;
        } else {
          return ResizeTypes.Vertical;
        }
      };
      var getTextComponents = function () {
        var components = [];
        if (editor.getParam('elementpath', true, 'boolean')) {
          components.push(ElementPath.renderElementPath(editor, {}));
        }
        if (contains$1(editor.settings.plugins, 'wordcount')) {
          components.push(renderWordCount(editor, providersBackstage));
        }
        if (editor.getParam('branding', true, 'boolean')) {
          components.push(renderBranding());
        }
        if (components.length > 0) {
          return [{
              dom: {
                tag: 'div',
                classes: ['tox-statusbar__text-container']
              },
              components: components
            }];
        }
        return [];
      };
      var getComponents = function () {
        var components = getTextComponents();
        var resizeType = getResizeType(editor);
        if (resizeType !== ResizeTypes.None) {
          components.push(renderResizeHandlerIcon(resizeType));
        }
        return components;
      };
      return {
        dom: {
          tag: 'div',
          classes: ['tox-statusbar']
        },
        components: getComponents()
      };
    };

    var setup$5 = function (editor) {
      var isInline = editor.getParam('inline', false, 'boolean');
      var mode = isInline ? Inline : Iframe;
      var lazyOuterContainer = Option.none();
      var dirAttributes = global$2.isRtl() ? { attributes: { dir: 'rtl' } } : {};
      var sink = build$1({
        dom: __assign({
          tag: 'div',
          classes: [
            'tox',
            'tox-silver-sink',
            'tox-tinymce-aux'
          ]
        }, dirAttributes),
        behaviours: derive$1([Positioning.config({ useFixed: false })])
      });
      var memAnchorBar = record({
        dom: {
          tag: 'div',
          classes: ['tox-anchorbar']
        }
      });
      var lazyAnchorBar = function () {
        return lazyOuterContainer.bind(function (container) {
          return memAnchorBar.getOpt(container);
        }).getOrDie('Could not find a toolbar element');
      };
      var backstage = init$8(sink, editor, lazyAnchorBar);
      var lazySink = function () {
        return Result.value(sink);
      };
      var partMenubar = OuterContainer.parts().menubar({
        dom: {
          tag: 'div',
          classes: ['tox-menubar']
        },
        getSink: lazySink,
        providers: backstage.shared.providers,
        onEscape: function () {
          editor.focus();
        }
      });
      var partToolbar = OuterContainer.parts().toolbar({
        dom: {
          tag: 'div',
          classes: ['tox-toolbar']
        },
        onEscape: function () {
          editor.focus();
        }
      });
      var partSocket = OuterContainer.parts().socket({
        dom: {
          tag: 'div',
          classes: ['tox-edit-area']
        }
      });
      var partSidebar = OuterContainer.parts().sidebar({
        dom: {
          tag: 'div',
          classes: ['tox-sidebar']
        }
      });
      var statusbar = editor.getParam('statusbar', true, 'boolean') && !isInline ? Option.some(renderStatusbar(editor, backstage.shared.providers)) : Option.none();
      var socketSidebarContainer = {
        dom: {
          tag: 'div',
          classes: ['tox-sidebar-wrap']
        },
        components: [
          partSocket,
          partSidebar
        ]
      };
      var hasToolbar = isToolbarEnabled(editor) || getMultipleToolbarsSetting(editor).isSome();
      var hasMenubar = isMenubarEnabled(editor);
      var editorComponents = flatten([
        hasMenubar ? [partMenubar] : [],
        hasToolbar ? [partToolbar] : [],
        [memAnchorBar.asSpec()],
        isInline ? [] : [socketSidebarContainer]
      ]);
      var editorContainer = {
        dom: {
          tag: 'div',
          classes: ['tox-editor-container']
        },
        components: editorComponents
      };
      var containerComponents = flatten([
        [editorContainer],
        isInline ? [] : statusbar.toArray()
      ]);
      var attributes = __assign({ role: 'application' }, global$2.isRtl() ? { dir: 'rtl' } : {});
      var outerContainer = build$1(OuterContainer.sketch({
        dom: {
          tag: 'div',
          classes: [
            'tox',
            'tox-tinymce'
          ].concat(isInline ? ['tox-tinymce-inline'] : []),
          styles: { visibility: 'hidden' },
          attributes: attributes
        },
        components: containerComponents,
        behaviours: derive$1(mode.getBehaviours(editor).concat([Keying.config({
            mode: 'cyclic',
            selector: '.tox-menubar, .tox-toolbar, .tox-sidebar--sliding-open, .tox-statusbar__path'
          })]))
      }));
      lazyOuterContainer = Option.some(outerContainer);
      editor.shortcuts.add('alt+F9', 'focus menubar', function () {
        OuterContainer.focusMenubar(outerContainer);
      });
      editor.shortcuts.add('alt+F10', 'focus toolbar', function () {
        OuterContainer.focusToolbar(outerContainer);
      });
      var mothership = takeover(outerContainer);
      var uiMothership = takeover(sink);
      Events.setup(editor, mothership, uiMothership);
      var getUi = function () {
        var channels = {
          broadcastAll: uiMothership.broadcast,
          broadcastOn: uiMothership.broadcastOn,
          register: function () {
          }
        };
        return { channels: channels };
      };
      var setEditorSize = function (elm) {
        var DOM = global$4.DOM;
        var baseWidth = editor.getParam('width', DOM.getStyle(elm, 'width'));
        var baseHeight = getHeightSetting(editor);
        var minWidth = getMinWidthSetting(editor);
        var minHeight = getMinHeightSetting(editor);
        var parsedWidth = Utils.parseToInt(baseWidth).bind(function (w) {
          return Utils.numToPx(minWidth.map(function (mw) {
            return Math.max(w, mw);
          }));
        }).getOr(Utils.numToPx(baseWidth));
        var parsedHeight = Utils.parseToInt(baseHeight).bind(function (h) {
          return minHeight.map(function (mh) {
            return Math.max(h, mh);
          });
        }).getOr(baseHeight);
        var stringWidth = Utils.numToPx(parsedWidth);
        if (isValidValue('div', 'width', stringWidth)) {
          set$2(outerContainer.element(), 'width', stringWidth);
        }
        if (!editor.inline) {
          var stringHeight = Utils.numToPx(parsedHeight);
          if (isValidValue('div', 'height', stringHeight)) {
            set$2(outerContainer.element(), 'height', stringHeight);
          } else {
            set$2(outerContainer.element(), 'height', '200px');
          }
        }
        return parsedHeight;
      };
      var renderUI = function () {
        setup$4(editor, lazySink, backstage.shared);
        var _a = editor.ui.registry.getAll(), buttons = _a.buttons, menuItems = _a.menuItems, contextToolbars = _a.contextToolbars;
        var rawUiConfig = {
          menuItems: menuItems,
          buttons: buttons,
          menus: !editor.settings.menu ? {} : map$1(editor.settings.menu, function (menu) {
            return merge(menu, { items: menu.items });
          }),
          menubar: editor.settings.menubar,
          toolbar: getMultipleToolbarsSetting(editor).getOr(editor.getParam('toolbar', true)),
          sidebar: editor.sidebars ? editor.sidebars : []
        };
        ContextToolbar.register(editor, contextToolbars, sink, { backstage: backstage });
        var elm = editor.getElement();
        var height = setEditorSize(elm);
        var uiComponents = {
          mothership: mothership,
          uiMothership: uiMothership,
          outerContainer: outerContainer
        };
        var args = {
          targetNode: elm,
          height: height
        };
        return mode.render(editor, uiComponents, rawUiConfig, backstage, args);
      };
      return {
        mothership: mothership,
        uiMothership: uiMothership,
        backstage: backstage,
        renderUI: renderUI,
        getUi: getUi
      };
    };
    var Render = { setup: setup$5 };

    var toggleFormat = function (editor, fmt) {
      return function () {
        editor.execCommand('mceToggleFormat', false, fmt);
      };
    };
    var register$5 = function (editor) {
      var defaultAlignIcon = 'align-left';
      var alignMenuItems = [
        {
          type: 'menuitem',
          text: 'Left',
          icon: 'align-left',
          onAction: toggleFormat(editor, 'alignleft')
        },
        {
          type: 'menuitem',
          text: 'Center',
          icon: 'align-center',
          onAction: toggleFormat(editor, 'aligncenter')
        },
        {
          type: 'menuitem',
          text: 'Right',
          icon: 'align-right',
          onAction: toggleFormat(editor, 'alignright')
        },
        {
          type: 'menuitem',
          text: 'Justify',
          icon: 'align-justify',
          onAction: toggleFormat(editor, 'alignjustify')
        }
      ];
      editor.ui.registry.addNestedMenuItem('align', {
        text: 'Align',
        icon: defaultAlignIcon,
        getSubmenuItems: function () {
          return alignMenuItems;
        }
      });
      var alignToolbarButtons = [
        {
          name: 'alignleft',
          text: 'Align left',
          cmd: 'JustifyLeft',
          icon: 'align-left'
        },
        {
          name: 'aligncenter',
          text: 'Align center',
          cmd: 'JustifyCenter',
          icon: 'align-center'
        },
        {
          name: 'alignright',
          text: 'Align right',
          cmd: 'JustifyRight',
          icon: 'align-right'
        },
        {
          name: 'alignjustify',
          text: 'Justify',
          cmd: 'JustifyFull',
          icon: 'align-justify'
        }
      ];
      var onSetup = function (item) {
        return function (api) {
          if (editor.formatter) {
            editor.formatter.formatChanged(item.name, api.setActive);
          } else {
            editor.on('init', function () {
              editor.formatter.formatChanged(item.name, api.setActive);
            });
          }
          return function () {
          };
        };
      };
      global$a.each(alignToolbarButtons, function (item) {
        editor.ui.registry.addToggleButton(item.name, {
          tooltip: item.text,
          onAction: function () {
            return editor.execCommand(item.cmd);
          },
          icon: item.icon,
          onSetup: onSetup(item)
        });
      });
      var alignNoneToolbarButton = {
        name: 'alignnone',
        text: 'No alignment',
        cmd: 'JustifyNone',
        icon: 'align-justify'
      };
      editor.ui.registry.addButton(alignNoneToolbarButton.name, {
        tooltip: alignNoneToolbarButton.text,
        onAction: function () {
          return editor.execCommand(alignNoneToolbarButton.cmd);
        },
        icon: alignNoneToolbarButton.icon,
        onSetup: onSetup(alignNoneToolbarButton)
      });
    };
    var Align = { register: register$5 };

    var toggleFormat$1 = function (editor, fmt) {
      return function () {
        editor.execCommand('mceToggleFormat', false, fmt);
      };
    };
    var addFormatChangedListener = function (editor, name, changed) {
      var handler = function (state) {
        changed(state, name);
      };
      if (editor.formatter) {
        editor.formatter.formatChanged(name, handler);
      } else {
        editor.on('init', function () {
          editor.formatter.formatChanged(name, handler);
        });
      }
    };
    var postRenderFormatToggle = function (editor, name) {
      return function (api) {
        addFormatChangedListener(editor, name, function (state) {
          api.setActive(state);
        });
        return function () {
        };
      };
    };
    var registerFormatButtons = function (editor) {
      global$a.each([
        {
          name: 'bold',
          text: 'Bold',
          icon: 'bold'
        },
        {
          name: 'italic',
          text: 'Italic',
          icon: 'italic'
        },
        {
          name: 'underline',
          text: 'Underline',
          icon: 'underline'
        },
        {
          name: 'strikethrough',
          text: 'Strikethrough',
          icon: 'strike-through'
        },
        {
          name: 'subscript',
          text: 'Subscript',
          icon: 'subscript'
        },
        {
          name: 'superscript',
          text: 'Superscript',
          icon: 'superscript'
        }
      ], function (btn) {
        editor.ui.registry.addToggleButton(btn.name, {
          tooltip: btn.text,
          icon: btn.icon,
          onSetup: postRenderFormatToggle(editor, btn.name),
          onAction: toggleFormat$1(editor, btn.name)
        });
      });
    };
    var registerCommandButtons = function (editor) {
      global$a.each([
        {
          name: 'cut',
          text: 'Cut',
          action: 'Cut',
          icon: 'cut'
        },
        {
          name: 'copy',
          text: 'Copy',
          action: 'Copy',
          icon: 'copy'
        },
        {
          name: 'paste',
          text: 'Paste',
          action: 'Paste',
          icon: 'paste'
        },
        {
          name: 'help',
          text: 'Help',
          action: 'mceHelp',
          icon: 'help'
        },
        {
          name: 'selectall',
          text: 'Select all',
          action: 'SelectAll',
          icon: 'select-all'
        },
        {
          name: 'newdocument',
          text: 'New document',
          action: 'mceNewDocument',
          icon: 'new-document'
        },
        {
          name: 'removeformat',
          text: 'Clear formatting',
          action: 'RemoveFormat',
          icon: 'remove-formatting'
        },
        {
          name: 'remove',
          text: 'Remove',
          action: 'Delete',
          icon: 'remove'
        }
      ], function (btn) {
        editor.ui.registry.addButton(btn.name, {
          tooltip: btn.text,
          icon: btn.icon,
          onAction: function () {
            return editor.execCommand(btn.action);
          }
        });
      });
    };
    var registerCommandToggleButtons = function (editor) {
      global$a.each([{
          name: 'blockquote',
          text: 'Blockquote',
          action: 'mceBlockQuote',
          icon: 'quote'
        }], function (btn) {
        editor.ui.registry.addToggleButton(btn.name, {
          tooltip: btn.text,
          icon: btn.icon,
          onAction: function () {
            return editor.execCommand(btn.action);
          },
          onSetup: postRenderFormatToggle(editor, btn.name)
        });
      });
    };
    var registerButtons = function (editor) {
      registerFormatButtons(editor);
      registerCommandButtons(editor);
      registerCommandToggleButtons(editor);
    };
    var registerMenuItems = function (editor) {
      global$a.each([
        {
          name: 'bold',
          text: 'Bold',
          action: 'Bold',
          icon: 'bold',
          shortcut: 'Meta+B'
        },
        {
          name: 'italic',
          text: 'Italic',
          action: 'Italic',
          icon: 'italic',
          shortcut: 'Meta+I'
        },
        {
          name: 'underline',
          text: 'Underline',
          action: 'Underline',
          icon: 'underline',
          shortcut: 'Meta+U'
        },
        {
          name: 'strikethrough',
          text: 'Strikethrough',
          action: 'Strikethrough',
          icon: 'strike-through',
          shortcut: ''
        },
        {
          name: 'subscript',
          text: 'Subscript',
          action: 'Subscript',
          icon: 'subscript',
          shortcut: ''
        },
        {
          name: 'superscript',
          text: 'Superscript',
          action: 'Superscript',
          icon: 'superscript',
          shortcut: ''
        },
        {
          name: 'removeformat',
          text: 'Clear formatting',
          action: 'RemoveFormat',
          icon: 'remove-formatting',
          shortcut: ''
        },
        {
          name: 'newdocument',
          text: 'New document',
          action: 'mceNewDocument',
          icon: 'new-document',
          shortcut: ''
        },
        {
          name: 'cut',
          text: 'Cut',
          action: 'Cut',
          icon: 'cut',
          shortcut: 'Meta+X'
        },
        {
          name: 'copy',
          text: 'Copy',
          action: 'Copy',
          icon: 'copy',
          shortcut: 'Meta+C'
        },
        {
          name: 'paste',
          text: 'Paste',
          action: 'Paste',
          icon: 'paste',
          shortcut: 'Meta+V'
        },
        {
          name: 'selectall',
          text: 'Select all',
          action: 'SelectAll',
          icon: 'select-all',
          shortcut: 'Meta+A'
        }
      ], function (btn) {
        editor.ui.registry.addMenuItem(btn.name, {
          text: btn.text,
          icon: btn.icon,
          shortcut: btn.shortcut,
          onAction: function () {
            return editor.execCommand(btn.action);
          }
        });
      });
      editor.ui.registry.addMenuItem('codeformat', {
        text: 'Code',
        icon: 'sourcecode',
        onAction: toggleFormat$1(editor, 'code')
      });
    };
    var register$6 = function (editor) {
      registerButtons(editor);
      registerMenuItems(editor);
    };
    var SimpleControls = { register: register$6 };

    var toggleUndoRedoState = function (api, editor, type) {
      var checkState = function () {
        return editor.undoManager ? editor.undoManager[type]() : false;
      };
      var onUndoStateChange = function () {
        api.setDisabled(editor.readonly || !checkState());
      };
      api.setDisabled(!checkState());
      editor.on('Undo Redo AddUndo TypingUndo ClearUndos SwitchMode', onUndoStateChange);
      return function () {
        return editor.off('Undo Redo AddUndo TypingUndo ClearUndos SwitchMode', onUndoStateChange);
      };
    };
    var registerMenuItems$1 = function (editor) {
      editor.ui.registry.addMenuItem('undo', {
        text: 'Undo',
        icon: 'undo',
        shortcut: 'Meta+Z',
        onSetup: function (api) {
          return toggleUndoRedoState(api, editor, 'hasUndo');
        },
        onAction: function () {
          return editor.execCommand('undo');
        }
      });
      editor.ui.registry.addMenuItem('redo', {
        text: 'Redo',
        icon: 'redo',
        shortcut: 'Meta+Y',
        onSetup: function (api) {
          return toggleUndoRedoState(api, editor, 'hasRedo');
        },
        onAction: function () {
          return editor.execCommand('redo');
        }
      });
    };
    var registerButtons$1 = function (editor) {
      editor.ui.registry.addButton('undo', {
        tooltip: 'Undo',
        icon: 'undo',
        onSetup: function (api) {
          return toggleUndoRedoState(api, editor, 'hasUndo');
        },
        onAction: function () {
          return editor.execCommand('undo');
        }
      });
      editor.ui.registry.addButton('redo', {
        tooltip: 'Redo',
        icon: 'redo',
        onSetup: function (api) {
          return toggleUndoRedoState(api, editor, 'hasRedo');
        },
        onAction: function () {
          return editor.execCommand('redo');
        }
      });
    };
    var register$7 = function (editor) {
      registerMenuItems$1(editor);
      registerButtons$1(editor);
    };
    var UndoRedo = { register: register$7 };

    var toggleVisualAidState = function (api, editor) {
      api.setActive(editor.hasVisual);
      var onVisualAid = function (e) {
        api.setActive(e.hasVisual);
      };
      editor.on('VisualAid', onVisualAid);
      return function () {
        return editor.off('VisualAid', onVisualAid);
      };
    };
    var registerMenuItems$2 = function (editor) {
      editor.ui.registry.addToggleMenuItem('visualaid', {
        text: 'Visual aids',
        onSetup: function (api) {
          return toggleVisualAidState(api, editor);
        },
        onAction: function () {
          editor.execCommand('mceToggleVisualAid');
        }
      });
    };
    var registerToolbarButton = function (editor) {
      editor.ui.registry.addButton('visualaid', {
        tooltip: 'Visual aids',
        text: 'Visual aids',
        onAction: function () {
          return editor.execCommand('mceToggleVisualAid');
        }
      });
    };
    var register$8 = function (editor) {
      registerToolbarButton(editor);
      registerMenuItems$2(editor);
    };
    var VisualAid = { register: register$8 };

    var toggleOutdentState = function (api, editor) {
      var onNodeChange = function () {
        api.setDisabled(!editor.queryCommandState('outdent'));
      };
      editor.on('NodeChange', onNodeChange);
      return function () {
        return editor.off('NodeChange', onNodeChange);
      };
    };
    var registerButtons$2 = function (editor) {
      editor.ui.registry.addButton('outdent', {
        tooltip: 'Decrease indent',
        icon: 'outdent',
        onSetup: function (api) {
          return toggleOutdentState(api, editor);
        },
        onAction: function () {
          return editor.execCommand('outdent');
        }
      });
      editor.ui.registry.addButton('indent', {
        tooltip: 'Increase indent',
        icon: 'indent',
        onAction: function () {
          return editor.execCommand('indent');
        }
      });
    };
    var register$9 = function (editor) {
      registerButtons$2(editor);
    };
    var IndentOutdent = { register: register$9 };

    var setup$6 = function (editor) {
      Align.register(editor);
      SimpleControls.register(editor);
      UndoRedo.register(editor);
      ColorSwatch.register(editor);
      VisualAid.register(editor);
      IndentOutdent.register(editor);
    };
    var FormatControls = { setup: setup$6 };

    var AriaLabel = {
      labelledBy: function (labelledElement, labelElement) {
        var labelId = Option.from(get$2(labelledElement, 'id')).fold(function () {
          var id = generate$1('dialog-label');
          set$1(labelElement, 'id', id);
          return id;
        }, identity);
        set$1(labelledElement, 'aria-labelledby', labelId);
      }
    };

    var schema$p = constant([
      strict$1('lazySink'),
      option('dragBlockClass'),
      defaulted$1('useTabstopAt', constant(true)),
      defaulted$1('eventOrder', {}),
      field$1('modalBehaviours', [Keying]),
      onKeyboardHandler('onExecute'),
      onStrictKeyboardHandler('onEscape')
    ]);
    var basic$1 = { sketch: identity };
    var parts$b = constant([
      optional({
        name: 'draghandle',
        overrides: function (detail, spec) {
          return {
            behaviours: derive$1([Dragging.config({
                mode: 'mouse',
                getTarget: function (handle) {
                  return ancestor$2(handle, '[role="dialog"]').getOr(handle);
                },
                blockerClass: detail.dragBlockClass.getOrDie(new Error('The drag blocker class was not specified for a dialog with a drag handle: \n' + JSON$1.stringify(spec, null, 2)).message)
              })])
          };
        }
      }),
      required({
        schema: [strict$1('dom')],
        name: 'title'
      }),
      required({
        factory: basic$1,
        schema: [strict$1('dom')],
        name: 'close'
      }),
      required({
        factory: basic$1,
        schema: [strict$1('dom')],
        name: 'body'
      }),
      required({
        factory: basic$1,
        schema: [strict$1('dom')],
        name: 'footer'
      }),
      external$1({
        factory: {
          sketch: function (spec, detail) {
            return __assign({}, spec, {
              dom: detail.dom,
              components: detail.components
            });
          }
        },
        schema: [
          defaulted$1('dom', {
            tag: 'div',
            styles: {
              position: 'fixed',
              left: '0px',
              top: '0px',
              right: '0px',
              bottom: '0px'
            }
          }),
          defaulted$1('components', [])
        ],
        name: 'blocker'
      })
    ]);

    var factory$e = function (detail, components$$1, spec, externals) {
      var dialogBusyEvent = generate$1('alloy.dialog.busy');
      var dialogIdleEvent = generate$1('alloy.dialog.idle');
      var busyBehaviours = derive$1([
        Keying.config({
          mode: 'special',
          onTab: function () {
            return Option.some(true);
          },
          onShiftTab: function () {
            return Option.some(true);
          }
        }),
        Focusing.config({})
      ]);
      var showDialog = function (dialog) {
        var sink = detail.lazySink(dialog).getOrDie();
        var busyComp = Cell(Option.none());
        var externalBlocker = externals.blocker();
        var blocker = sink.getSystem().build(__assign({}, externalBlocker, {
          components: externalBlocker.components.concat([premade$1(dialog)]),
          behaviours: derive$1([config('dialog-blocker-events', [
              run(dialogIdleEvent, function (blocker, se) {
                if (has$1(dialog.element(), 'aria-busy')) {
                  remove$1(dialog.element(), 'aria-busy');
                  busyComp.get().each(function (bc) {
                    return Replacing.remove(dialog, bc);
                  });
                }
              }),
              run(dialogBusyEvent, function (blocker, se) {
                set$1(dialog.element(), 'aria-busy', 'true');
                var getBusySpec = se.event().getBusySpec();
                busyComp.get().each(function (bc) {
                  Replacing.remove(dialog, bc);
                });
                var busySpec = getBusySpec(dialog, busyBehaviours);
                var busy = blocker.getSystem().build(busySpec);
                busyComp.set(Option.some(busy));
                Replacing.append(dialog, premade$1(busy));
                if (busy.hasConfigured(Keying)) {
                  Keying.focusIn(busy);
                }
              })
            ])])
        }));
        attach(sink, blocker);
        Keying.focusIn(dialog);
      };
      var hideDialog = function (dialog) {
        parent(dialog.element()).each(function (blockerDom) {
          dialog.getSystem().getByDom(blockerDom).each(function (blocker) {
            detach(blocker);
          });
        });
      };
      var getDialogBody = function (dialog) {
        return getPartOrDie(dialog, detail, 'body');
      };
      var getDialogFooter = function (dialog) {
        return getPartOrDie(dialog, detail, 'footer');
      };
      var setBusy = function (dialog, getBusySpec) {
        emitWith(dialog, dialogBusyEvent, { getBusySpec: getBusySpec });
      };
      var setIdle = function (dialog) {
        emit(dialog, dialogIdleEvent);
      };
      var modalEventsId = generate$1('modal-events');
      var eventOrder = __assign({}, detail.eventOrder, { 'alloy.system.attached': [modalEventsId].concat(detail.eventOrder['alloy.system.attached'] || []) });
      return {
        uid: detail.uid,
        dom: detail.dom,
        components: components$$1,
        apis: {
          show: showDialog,
          hide: hideDialog,
          getBody: getDialogBody,
          getFooter: getDialogFooter,
          setIdle: setIdle,
          setBusy: setBusy
        },
        eventOrder: eventOrder,
        domModification: {
          attributes: {
            'role': 'dialog',
            'aria-modal': 'true'
          }
        },
        behaviours: augment(detail.modalBehaviours, [
          Replacing.config({}),
          Keying.config({
            mode: 'cyclic',
            onEnter: detail.onExecute,
            onEscape: detail.onEscape,
            useTabstopAt: detail.useTabstopAt
          }),
          config(modalEventsId, [runOnAttached(function (c) {
              AriaLabel.labelledBy(c.element(), getPartOrDie(c, detail, 'title').element());
            })])
        ])
      };
    };
    var ModalDialog = composite$1({
      name: 'ModalDialog',
      configFields: schema$p(),
      partFields: parts$b(),
      factory: factory$e,
      apis: {
        show: function (apis, dialog) {
          apis.show(dialog);
        },
        hide: function (apis, dialog) {
          apis.hide(dialog);
        },
        getBody: function (apis, dialog) {
          return apis.getBody(dialog);
        },
        getFooter: function (apis, dialog) {
          return apis.getFooter(dialog);
        },
        setBusy: function (apis, dialog, getBusySpec) {
          apis.setBusy(dialog, getBusySpec);
        },
        setIdle: function (apis, dialog) {
          apis.setIdle(dialog);
        }
      }
    });

    var alertBannerFields = [
      strictString('type'),
      strictString('text'),
      strictStringEnum('level', [
        'info',
        'warn',
        'error',
        'success'
      ]),
      strictString('icon'),
      defaulted$1('url', '')
    ];

    var createBarFields = function (itemsField) {
      return [
        strictString('type'),
        itemsField
      ];
    };

    var buttonFields = [
      strictString('type'),
      strictString('text'),
      defaultedBoolean('primary', false),
      field('name', 'name', defaultedThunk(function () {
        return generate$1('button-name');
      }), string),
      optionString('icon')
    ];

    var checkboxFields = [
      strictString('type'),
      strictString('name'),
      strictString('label')
    ];
    var checkboxDataProcessor = boolean;

    var formComponentFields = [
      strictString('type'),
      strictString('name'),
      optionString('label')
    ];

    var colorInputFields = formComponentFields;
    var colorInputDataProcessor = string;

    var colorPickerFields = formComponentFields;
    var colorPickerDataProcessor = string;

    var dropZoneFields = formComponentFields;
    var dropZoneDataProcessor = arrOfVal();

    var createGridFields = function (itemsField) {
      return [
        strictString('type'),
        strictNumber('columns'),
        itemsField
      ];
    };

    var iframeFields = formComponentFields.concat([defaultedBoolean('sandboxed', true)]);
    var iframeDataProcessor = string;

    var inputFields = formComponentFields.concat([optionString('placeholder')]);
    var inputDataProcessor = string;

    var selectBoxFields = formComponentFields.concat([
      strictArrayOfObj('items', [
        strictString('text'),
        strictString('value')
      ]),
      defaultedNumber('size', 1)
    ]);
    var selectBoxDataProcessor = string;

    var sizeInputFields = formComponentFields.concat([defaultedBoolean('constrain', true)]);
    var sizeInputDataProcessor = objOf([
      strictString('width'),
      strictString('height')
    ]);

    var textAreaFields = formComponentFields.concat([optionString('placeholder')]);
    var textAreaDataProcessor = string;

    var urlInputFields = formComponentFields.concat([defaultedStringEnum('filetype', 'file', [
        'image',
        'media',
        'file'
      ])]);
    var urlInputDataProcessor = objOf([
      strictString('value'),
      defaulted$1('meta', {})
    ]);

    var customEditorFields = formComponentFields.concat([
      strictString('type'),
      defaultedString('tag', 'textarea'),
      strictFunction('init')
    ]);
    var customEditorDataProcessor = string;

    var htmlPanelFields = [
      strictString('type'),
      strictString('html')
    ];

    var imageToolsFields = formComponentFields.concat([strictOf('currentState', objOf([
        strict$1('blob'),
        strictString('url')
      ]))]);

    var collectionFields = formComponentFields.concat([defaulted$1('columns', 1)]);
    var collectionDataProcessor = arrOfObj$1([
      strictString('value'),
      optionString('text'),
      optionString('icon')
    ]);

    var createLabelFields = function (itemsField) {
      return [
        strictString('type'),
        strictString('label'),
        itemsField
      ];
    };

    var tableFields = [
      strictString('type'),
      strictArrayOf('header', string),
      strictArrayOf('cells', arrOf(string))
    ];

    var createItemsField = function (name) {
      return field('items', 'items', strict(), arrOf(valueOf(function (v) {
        return asRaw('Checking item of ' + name, itemSchema$2, v).fold(function (sErr) {
          return Result.error(formatError(sErr));
        }, function (passValue) {
          return Result.value(passValue);
        });
      })));
    };
    var itemSchema$2 = choose$1('type', {
      alertbanner: alertBannerFields,
      bar: createBarFields(createItemsField('bar')),
      button: buttonFields,
      checkbox: checkboxFields,
      colorinput: colorInputFields,
      colorpicker: colorPickerFields,
      dropzone: dropZoneFields,
      grid: createGridFields(createItemsField('grid')),
      iframe: iframeFields,
      input: inputFields,
      selectbox: selectBoxFields,
      sizeinput: sizeInputFields,
      textarea: textAreaFields,
      urlinput: urlInputFields,
      customeditor: customEditorFields,
      htmlpanel: htmlPanelFields,
      imagetools: imageToolsFields,
      collection: collectionFields,
      label: createLabelFields(createItemsField('label')),
      table: tableFields
    });

    var panelFields = [
      strictString('type'),
      strictArrayOf('items', itemSchema$2)
    ];

    var tabFields = [
      strictString('title'),
      strictArrayOf('items', itemSchema$2)
    ];
    var tabPanelFields = [
      strictString('type'),
      strictArrayOfObj('tabs', tabFields)
    ];

    var dialogButtonSchema = objOf([
      strictStringEnum('type', [
        'submit',
        'cancel',
        'custom'
      ]),
      field('name', 'name', defaultedThunk(function () {
        return generate$1('button-name');
      }), string),
      strictString('text'),
      optionString('icon'),
      defaultedStringEnum('align', 'end', [
        'start',
        'end'
      ]),
      defaultedBoolean('primary', false),
      defaultedBoolean('disabled', false)
    ]);
    var dialogSchema = objOf([
      strictString('title'),
      strictOf('body', choose$1('type', {
        panel: panelFields,
        tabpanel: tabPanelFields
      })),
      defaultedString('size', 'normal'),
      strictArrayOf('buttons', dialogButtonSchema),
      defaulted$1('initialData', {}),
      defaultedFunction('onAction', noop),
      defaultedFunction('onChange', noop),
      defaultedFunction('onSubmit', noop),
      defaultedFunction('onClose', noop),
      defaultedFunction('onCancel', noop),
      defaulted$1('onTabChange', noop),
      option('readyWhen')
    ]);
    var createDialog = function (spec) {
      return asRaw('dialog', dialogSchema, spec);
    };

    var getAllObjects = function (obj) {
      if (isObject(obj)) {
        return [obj].concat(bind(values(obj), getAllObjects));
      } else if (isArray(obj)) {
        return bind(obj, getAllObjects);
      } else {
        return [];
      }
    };

    var isNamedItem = function (obj) {
      return isString(obj.type) && isString(obj.name);
    };
    var dataProcessors = {
      checkbox: checkboxDataProcessor,
      colorinput: colorInputDataProcessor,
      colorpicker: colorPickerDataProcessor,
      dropzone: dropZoneDataProcessor,
      input: inputDataProcessor,
      iframe: iframeDataProcessor,
      sizeinput: sizeInputDataProcessor,
      selectbox: selectBoxDataProcessor,
      size: sizeInputDataProcessor,
      textarea: textAreaDataProcessor,
      urlinput: urlInputDataProcessor,
      customeditor: customEditorDataProcessor,
      collection: collectionDataProcessor
    };
    var getDataProcessor = function (item) {
      return Option.from(dataProcessors[item.type]);
    };
    var getNamedItems = function (structure) {
      return filter(getAllObjects(structure), isNamedItem);
    };

    var createDataValidator = function (structure) {
      var fields = bind(getNamedItems(structure), function (item) {
        return getDataProcessor(item).fold(function () {
          return [];
        }, function (schema) {
          return [strictOf(item.name, schema)];
        });
      });
      return objOf(fields);
    };

    var extract$1 = function (structure) {
      var internalDialog = getOrDie$1(createDialog(structure));
      var dataValidator = createDataValidator(structure);
      var initialData = structure.initialData;
      return {
        internalDialog: internalDialog,
        dataValidator: dataValidator,
        initialData: initialData
      };
    };
    var DialogManager = {
      open: function (factory, structure) {
        var extraction = extract$1(structure);
        return factory(extraction.internalDialog, extraction.initialData, extraction.dataValidator);
      },
      redial: function (structure) {
        return extract$1(structure);
      }
    };

    var dialogChannel = generate$1('update-dialog');
    var titleChannel = generate$1('update-title');
    var bodyChannel = generate$1('update-body');
    var footerChannel = generate$1('update-footer');

    var toValidValues = function (values$$1) {
      var errors = [];
      var result = {};
      each$1(values$$1, function (value, name) {
        value.fold(function () {
          errors.push(name);
        }, function (v) {
          result[name] = v;
        });
      });
      return errors.length > 0 ? Result.error(errors) : Result.value(result);
    };

    var renderBodyPanel = function (spec, backstage) {
      var memForm = record(Form.sketch(function (parts) {
        return {
          dom: {
            tag: 'div',
            classes: ['tox-dialog__body-content']
          },
          components: map(spec.items, function (item) {
            return interpretInForm(parts, item, backstage);
          })
        };
      }));
      return {
        dom: {
          tag: 'div',
          classes: ['tox-dialog__body']
        },
        components: [memForm.asSpec()],
        behaviours: derive$1([
          Keying.config({
            mode: 'acyclic',
            useTabstopAt: not(NavigableObject.isPseudoStop)
          }),
          ComposingConfigs.memento(memForm),
          RepresentingConfigs.memento(memForm, {
            postprocess: function (formValue) {
              return toValidValues(formValue).fold(function (err) {
                console.error(err);
                return {};
              }, function (vals) {
                return vals;
              });
            }
          })
        ])
      };
    };

    var factory$f = function (detail, spec) {
      return {
        uid: detail.uid,
        dom: detail.dom,
        components: detail.components,
        events: events$7(detail.action),
        behaviours: augment(detail.tabButtonBehaviours, [
          Focusing.config({}),
          Keying.config({
            mode: 'execution',
            useSpace: true,
            useEnter: true
          }),
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: detail.value
            }
          })
        ]),
        domModification: detail.domModification
      };
    };
    var TabButton = single$2({
      name: 'TabButton',
      configFields: [
        defaulted$1('uid', undefined),
        strict$1('value'),
        field('dom', 'dom', mergeWithThunk(function (spec) {
          return {
            attributes: {
              'role': 'tab',
              'id': generate$1('aria'),
              'aria-selected': 'false'
            }
          };
        }), anyValue$1()),
        option('action'),
        defaulted$1('domModification', {}),
        field$1('tabButtonBehaviours', [
          Focusing,
          Keying,
          Representing
        ]),
        strict$1('view')
      ],
      factory: factory$f
    });

    var schema$q = constant([
      strict$1('tabs'),
      strict$1('dom'),
      defaulted$1('clickToDismiss', false),
      field$1('tabbarBehaviours', [
        Highlighting,
        Keying
      ]),
      markers([
        'tabClass',
        'selectedClass'
      ])
    ]);
    var tabsPart = group({
      factory: TabButton,
      name: 'tabs',
      unit: 'tab',
      overrides: function (barDetail, tabSpec) {
        var dismissTab$$1 = function (tabbar, button) {
          Highlighting.dehighlight(tabbar, button);
          emitWith(tabbar, dismissTab(), {
            tabbar: tabbar,
            button: button
          });
        };
        var changeTab$$1 = function (tabbar, button) {
          Highlighting.highlight(tabbar, button);
          emitWith(tabbar, changeTab(), {
            tabbar: tabbar,
            button: button
          });
        };
        return {
          action: function (button) {
            var tabbar = button.getSystem().getByUid(barDetail.uid).getOrDie();
            var activeButton = Highlighting.isHighlighted(tabbar, button);
            var response = function () {
              if (activeButton && barDetail.clickToDismiss) {
                return dismissTab$$1;
              } else if (!activeButton) {
                return changeTab$$1;
              } else {
                return noop;
              }
            }();
            response(tabbar, button);
          },
          domModification: { classes: [barDetail.markers.tabClass] }
        };
      }
    });
    var parts$c = constant([tabsPart]);

    var factory$g = function (detail, components, spec, externals) {
      return {
        'uid': detail.uid,
        'dom': detail.dom,
        'components': components,
        'debug.sketcher': 'Tabbar',
        domModification: { attributes: { role: 'tablist' } },
        'behaviours': augment(detail.tabbarBehaviours, [
          Highlighting.config({
            highlightClass: detail.markers.selectedClass,
            itemClass: detail.markers.tabClass,
            onHighlight: function (tabbar, tab) {
              set$1(tab.element(), 'aria-selected', 'true');
            },
            onDehighlight: function (tabbar, tab) {
              set$1(tab.element(), 'aria-selected', 'false');
            }
          }),
          Keying.config({
            mode: 'flow',
            getInitial: function (tabbar) {
              return Highlighting.getHighlighted(tabbar).map(function (tab) {
                return tab.element();
              });
            },
            selector: '.' + detail.markers.tabClass,
            executeOnMove: true
          })
        ])
      };
    };
    var Tabbar = composite$1({
      name: 'Tabbar',
      configFields: schema$q(),
      partFields: parts$c(),
      factory: factory$g
    });

    var factory$h = function (detail, spec) {
      return {
        uid: detail.uid,
        dom: detail.dom,
        behaviours: augment(detail.tabviewBehaviours, [Replacing.config({})]),
        domModification: { attributes: { role: 'tabpanel' } }
      };
    };
    var Tabview = single$2({
      name: 'Tabview',
      configFields: [field$1('tabviewBehaviours', [Replacing])],
      factory: factory$h
    });

    var schema$r = constant([
      defaulted$1('selectFirst', true),
      onHandler('onChangeTab'),
      onHandler('onDismissTab'),
      defaulted$1('tabs', []),
      field$1('tabSectionBehaviours', [])
    ]);
    var barPart = required({
      factory: Tabbar,
      schema: [
        strict$1('dom'),
        strictObjOf('markers', [
          strict$1('tabClass'),
          strict$1('selectedClass')
        ])
      ],
      name: 'tabbar',
      defaults: function (detail) {
        return { tabs: detail.tabs };
      }
    });
    var viewPart = required({
      factory: Tabview,
      name: 'tabview'
    });
    var parts$d = constant([
      barPart,
      viewPart
    ]);

    var factory$i = function (detail, components$$1, spec, externals) {
      var changeTab$$1 = function (button) {
        var tabValue = Representing.getValue(button);
        getPart(button, detail, 'tabview').each(function (tabview) {
          var tabWithValue = find(detail.tabs, function (t) {
            return t.value === tabValue;
          });
          tabWithValue.each(function (tabData) {
            var panel = tabData.view();
            set$1(tabview.element(), 'aria-labelledby', get$2(button.element(), 'id'));
            Replacing.set(tabview, panel);
            detail.onChangeTab(tabview, button, panel);
          });
        });
      };
      var changeTabBy = function (section, byPred) {
        getPart(section, detail, 'tabbar').each(function (tabbar) {
          byPred(tabbar).each(emitExecute);
        });
      };
      return {
        uid: detail.uid,
        dom: detail.dom,
        components: components$$1,
        behaviours: get$d(detail.tabSectionBehaviours),
        events: derive(flatten([
          detail.selectFirst ? [runOnAttached(function (section, simulatedEvent) {
              changeTabBy(section, Highlighting.getFirst);
            })] : [],
          [
            run(changeTab(), function (section, simulatedEvent) {
              var button = simulatedEvent.event().button();
              changeTab$$1(button);
            }),
            run(dismissTab(), function (section, simulatedEvent) {
              var button = simulatedEvent.event().button();
              detail.onDismissTab(section, button);
            })
          ]
        ])),
        apis: {
          getViewItems: function (section) {
            return getPart(section, detail, 'tabview').map(function (tabview) {
              return Replacing.contents(tabview);
            }).getOr([]);
          },
          showTab: function (section, tabKey) {
            var getTabIfNotActive = function (tabbar) {
              var candidates = Highlighting.getCandidates(tabbar);
              var optTab = find(candidates, function (c) {
                return Representing.getValue(c) === tabKey;
              });
              return optTab.filter(function (tab) {
                return !Highlighting.isHighlighted(tabbar, tab);
              });
            };
            changeTabBy(section, getTabIfNotActive);
          }
        }
      };
    };
    var TabSection = composite$1({
      name: 'TabSection',
      configFields: schema$r(),
      partFields: parts$d(),
      factory: factory$i,
      apis: {
        getViewItems: function (apis, component) {
          return apis.getViewItems(component);
        },
        showTab: function (apis, component, tabKey) {
          apis.showTab(component, tabKey);
        }
      }
    });

    var measureHeights = function (allTabs, tabview, tabviewComp) {
      return map(allTabs, function (tab, i) {
        Replacing.set(tabviewComp, allTabs[i].view());
        var rect = tabview.dom().getBoundingClientRect();
        Replacing.set(tabviewComp, []);
        return rect.height;
      });
    };
    var getMaxHeight = function (heights) {
      return head(sort(heights, function (a, b) {
        if (a > b) {
          return -1;
        } else if (a < b) {
          return +1;
        } else {
          return 0;
        }
      }));
    };
    var showTab = function (allTabs, comp) {
      head(allTabs).each(function (tab) {
        return TabSection.showTab(comp, tab.value);
      });
    };
    var setMode = function (allTabs) {
      var smartTabHeight = function () {
        var extraEvents = [
          runOnAttached(function (comp) {
            descendant$2(comp.element(), '[role="tabpanel"]').each(function (tabview) {
              set$2(tabview, 'visibility', 'hidden');
              var optHeight = comp.getSystem().getByDom(tabview).toOption().bind(function (tabviewComp) {
                var heights = measureHeights(allTabs, tabview, tabviewComp);
                return getMaxHeight(heights);
              });
              optHeight.each(function (height) {
                set$2(tabview, 'height', height + 'px');
              });
              remove$6(tabview, 'visibility');
              showTab(allTabs, comp);
            });
          }),
          run(formResizeEvent, function (comp, se) {
            descendant$2(comp.element(), '[role="tabpanel"]').each(function (tabview) {
              var oldFocus = active();
              set$2(tabview, 'visibility', 'hidden');
              var oldHeight = getRaw(tabview, 'height').map(function (h) {
                return parseInt(h, 10);
              });
              remove$6(tabview, 'height');
              var newHeight = tabview.dom().getBoundingClientRect().height;
              var hasGrown = oldHeight.forall(function (h) {
                return newHeight > h;
              });
              if (hasGrown) {
                set$2(tabview, 'height', newHeight + 'px');
              } else {
                oldHeight.each(function (h) {
                  set$2(tabview, 'height', h + 'px');
                });
              }
              remove$6(tabview, 'visibility');
              oldFocus.each(focus$2);
            });
          })
        ];
        var selectFirst = false;
        return {
          extraEvents: extraEvents,
          selectFirst: selectFirst
        };
      }();
      var naiveTabHeight = function () {
        var extraEvents = [];
        var selectFirst = true;
        return {
          extraEvents: extraEvents,
          selectFirst: selectFirst
        };
      }();
      return {
        smartTabHeight: smartTabHeight,
        naiveTabHeight: naiveTabHeight
      };
    };

    var SendDataToSectionChannel = 'send-data-to-section';
    var SendDataToViewChannel = 'send-data-to-view';
    var renderTabPanel = function (spec, backstage) {
      var storedValue = Cell({});
      var updateDataWithForm = function (form) {
        var formData = Representing.getValue(form);
        var validData = toValidValues(formData).getOr({});
        var currentData = storedValue.get();
        var newData = deepMerge(currentData, validData);
        storedValue.set(newData);
      };
      var setDataOnForm = function (form) {
        var tabData = storedValue.get();
        Representing.setValue(form, tabData);
      };
      var oldTab = Cell(null);
      var allTabs = map(spec.tabs, function (tab) {
        return {
          value: tab.title,
          dom: {
            tag: 'div',
            classes: ['tox-dialog__body-nav-item'],
            innerHtml: backstage.shared.providers.translate(tab.title)
          },
          view: function () {
            return [Form.sketch(function (parts) {
                return {
                  dom: {
                    tag: 'div',
                    classes: ['tox-form']
                  },
                  components: map(tab.items, function (item) {
                    return interpretInForm(parts, item, backstage);
                  }),
                  formBehaviours: derive$1([
                    Keying.config({
                      mode: 'acyclic',
                      useTabstopAt: not(NavigableObject.isPseudoStop)
                    }),
                    config('TabView.form.events', [
                      runOnAttached(setDataOnForm),
                      runOnDetached(updateDataWithForm)
                    ]),
                    Receiving.config({
                      channels: wrapAll$1([
                        {
                          key: SendDataToSectionChannel,
                          value: { onReceive: updateDataWithForm }
                        },
                        {
                          key: SendDataToViewChannel,
                          value: { onReceive: setDataOnForm }
                        }
                      ])
                    })
                  ])
                };
              })];
          }
        };
      });
      var tabMode = setMode(allTabs).smartTabHeight;
      return TabSection.sketch({
        dom: {
          tag: 'div',
          classes: ['tox-dialog__body']
        },
        onChangeTab: function (section, button, _viewItems) {
          var title = Representing.getValue(button);
          emitWith(section, formTabChangeEvent, {
            title: title,
            oldTitle: oldTab.get()
          });
          oldTab.set(title);
        },
        tabs: allTabs,
        components: [
          TabSection.parts().tabbar({
            dom: {
              tag: 'div',
              classes: ['tox-dialog__body-nav']
            },
            components: [Tabbar.parts().tabs({})],
            markers: {
              tabClass: 'tox-tab',
              selectedClass: 'tox-dialog__body-nav-item--active'
            },
            tabbarBehaviours: derive$1([Tabstopping.config({})])
          }),
          TabSection.parts().tabview({
            dom: {
              tag: 'div',
              classes: ['tox-dialog__body-content']
            }
          })
        ],
        selectFirst: tabMode.selectFirst,
        tabSectionBehaviours: derive$1([
          config('tabpanel', tabMode.extraEvents),
          Keying.config({ mode: 'acyclic' }),
          Composing.config({
            find: function (comp) {
              return head(TabSection.getViewItems(comp));
            }
          }),
          Representing.config({
            store: {
              mode: 'manual',
              getValue: function (tsection) {
                tsection.getSystem().broadcastOn([SendDataToSectionChannel], {});
                return storedValue.get();
              },
              setValue: function (tsection, value) {
                storedValue.set(value);
                tsection.getSystem().broadcastOn([SendDataToViewChannel], {});
              }
            }
          })
        ])
      });
    };

    var renderBody = function (foo, backstage) {
      var renderComponents = function (incoming) {
        switch (incoming.body.type) {
        case 'tabpanel': {
            return [renderTabPanel({ tabs: incoming.body.tabs }, backstage)];
          }
        default: {
            return [renderBodyPanel({ items: incoming.body.items }, backstage)];
          }
        }
      };
      var updateState = function (_comp, incoming) {
        return Option.some({
          isTabPanel: function () {
            return incoming.body.type === 'tabpanel';
          }
        });
      };
      return {
        dom: {
          tag: 'div',
          classes: ['tox-dialog__content-js']
        },
        components: [],
        behaviours: derive$1([
          ComposingConfigs.childAt(0),
          Reflecting.config({
            channel: bodyChannel,
            updateState: updateState,
            renderComponents: renderComponents,
            initialData: foo
          })
        ])
      };
    };
    var renderInlineBody = function (foo, backstage) {
      return renderBody(foo, backstage);
    };
    var renderModalBody = function (foo, backstage) {
      return ModalDialog.parts().body(renderBody(foo, backstage));
    };

    var init$d = function (getInstanceApi, extras) {
      var fireApiEvent = function (eventName, f) {
        return run(eventName, function (c, se) {
          withSpec(c, function (spec, _c) {
            f(spec, se.event(), c);
          });
        });
      };
      var withSpec = function (c, f) {
        Reflecting.getState(c).get().each(function (currentDialogInit) {
          f(currentDialogInit.internalDialog, c);
        });
      };
      return [
        runWithTarget(focusin(), NavigableObject.onFocus),
        fireApiEvent(formSubmitEvent, function (spec) {
          return spec.onSubmit(getInstanceApi());
        }),
        fireApiEvent(formChangeEvent, function (spec, event) {
          spec.onChange(getInstanceApi(), { name: event.name() });
        }),
        fireApiEvent(formActionEvent, function (spec, event) {
          spec.onAction(getInstanceApi(), {
            name: event.name(),
            value: event.value()
          });
        }),
        fireApiEvent(formTabChangeEvent, function (spec, event) {
          spec.onTabChange(getInstanceApi(), event.title());
        }),
        fireApiEvent(formCloseEvent, function (spec) {
          extras.onClose();
          spec.onClose();
        }),
        fireApiEvent(formCancelEvent, function (spec, _event, self) {
          spec.onCancel(getInstanceApi());
          emit(self, formCloseEvent);
        }),
        runOnDetached(function (component) {
          var api = getInstanceApi();
          Representing.setValue(component, api.getData());
        }),
        run(formUnblockEvent, function (c, se) {
          return extras.onUnblock();
        }),
        run(formBlockEvent, function (c, se) {
          return extras.onBlock(se.event());
        })
      ];
    };
    var SilverDialogEvents = { init: init$d };

    var makeButton = function (button, providersBackstage) {
      return renderFooterButton(button, button.type, providersBackstage);
    };
    var lookup$2 = function (compInSystem, footerButtons, buttonName) {
      return find(footerButtons, function (button) {
        return button.name === buttonName;
      }).bind(function (memButton) {
        return memButton.memento.getOpt(compInSystem);
      });
    };
    var renderComponents = function (_data, state) {
      var footerButtons = state.map(function (s) {
        return s.footerButtons;
      }).getOr([]);
      var buttonGroups = partition(footerButtons, function (button) {
        return button.align === 'start';
      });
      var makeGroup = function (edge, buttons) {
        return Container.sketch({
          dom: {
            tag: 'div',
            classes: ['tox-dialog__footer-' + edge]
          },
          components: map(buttons, function (button) {
            return button.memento.asSpec();
          })
        });
      };
      var startButtons = makeGroup('start', buttonGroups.pass);
      var endButtons = makeGroup('end', buttonGroups.fail);
      return [
        startButtons,
        endButtons
      ];
    };
    var renderFooter = function (initFoo, providersBackstage) {
      var updateState = function (_comp, data) {
        var footerButtons = map(data.buttons, function (button) {
          var memButton = record(makeButton(button, providersBackstage));
          return {
            name: button.name,
            align: button.align,
            memento: memButton
          };
        });
        var lookupByName = function (compInSystem, buttonName) {
          return lookup$2(compInSystem, footerButtons, buttonName);
        };
        return Option.some({
          lookupByName: lookupByName,
          footerButtons: footerButtons
        });
      };
      return {
        dom: fromHtml$2('<div class="tox-dialog__footer"></div>'),
        components: [],
        behaviours: derive$1([Reflecting.config({
            channel: footerChannel,
            initialData: initFoo,
            updateState: updateState,
            renderComponents: renderComponents
          })])
      };
    };
    var renderInlineFooter = function (initFoo, providersBackstage) {
      return renderFooter(initFoo, providersBackstage);
    };
    var renderModalFooter = function (initFoo, providersBackstage) {
      return ModalDialog.parts().footer(renderFooter(initFoo, providersBackstage));
    };

    var renderClose = function (providersBackstage) {
      return Button.sketch({
        dom: {
          tag: 'button',
          classes: [
            'tox-button',
            'tox-button--icon',
            'tox-button--naked'
          ],
          attributes: {
            'type': 'button',
            'aria-label': providersBackstage.translate('Close'),
            'title': providersBackstage.translate('Close')
          }
        },
        components: [{
            dom: {
              tag: 'div',
              classes: ['tox-icon'],
              innerHtml: '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M17.953 7.453L13.422 12l4.531 4.547-1.406 1.406L12 13.422l-4.547 4.531-1.406-1.406L10.578 12 6.047 7.453l1.406-1.406L12 10.578l4.547-4.531z" fill-rule="evenodd"></path></svg>'
            }
          }],
        action: function (comp) {
          emit(comp, formCancelEvent);
        }
      });
    };
    var renderTitle = function (foo, id, providersBackstage) {
      var renderComponents = function (data) {
        return [text(providersBackstage.translate(data.title))];
      };
      return {
        dom: {
          tag: 'div',
          classes: ['tox-dialog__title'],
          attributes: __assign({}, id.map(function (x) {
            return { id: x };
          }).getOr({}))
        },
        components: renderComponents(foo),
        behaviours: derive$1([Reflecting.config({
            channel: titleChannel,
            renderComponents: renderComponents
          })])
      };
    };
    var renderInlineHeader = function (foo, titleId, providersBackstage) {
      return Container.sketch({
        dom: fromHtml$2('<div class="tox-dialog__header"></div>'),
        components: [
          renderTitle(foo, Option.some(titleId), providersBackstage),
          renderClose(providersBackstage)
        ],
        containerBehaviours: derive$1([Dragging.config({
            mode: 'mouse',
            blockerClass: 'blocker',
            getTarget: function (handle) {
              return closest$3(handle, '[role="dialog"]').getOrDie();
            },
            snaps: {
              getSnapPoints: function () {
                return [];
              },
              leftAttr: 'data-drag-left',
              topAttr: 'data-drag-top'
            }
          })])
      });
    };
    var renderModalHeader = function (foo, providersBackstage) {
      var pTitle = ModalDialog.parts().title(renderTitle(foo, Option.none(), providersBackstage));
      var pHandle = ModalDialog.parts().draghandle({ dom: fromHtml$2('<div class="tox-dialog__draghandle"></div>') });
      var pClose = ModalDialog.parts().close(renderClose(providersBackstage));
      var components = [pTitle].concat(foo.draggable ? [pHandle] : []).concat([pClose]);
      return Container.sketch({
        dom: fromHtml$2('<div class="tox-dialog__header"></div>'),
        components: components
      });
    };

    var getCompByName = function (access, name) {
      var root = access.getRoot();
      if (root.getSystem().isConnected()) {
        var form_1 = Composing.getCurrent(access.getFormWrapper()).getOr(access.getFormWrapper());
        return Form.getField(form_1, name).fold(function () {
          var footer = access.getFooter();
          var footerState = Reflecting.getState(footer);
          return footerState.get().bind(function (f) {
            return f.lookupByName(form_1, name);
          });
        }, function (comp) {
          return Option.some(comp);
        });
      } else {
        return Option.none();
      }
    };
    var validateData = function (access, data) {
      var root = access.getRoot();
      return Reflecting.getState(root).get().map(function (dialogState) {
        return getOrDie$1(asRaw('data', dialogState.dataValidator, data));
      }).getOr(data);
    };
    var getDialogApi = function (access, doRedial) {
      var withRoot = function (f) {
        var root = access.getRoot();
        if (root.getSystem().isConnected()) {
          f(root);
        }
      };
      var getData = function () {
        var root = access.getRoot();
        var valueComp = root.getSystem().isConnected() ? access.getFormWrapper() : root;
        return Representing.getValue(valueComp);
      };
      var setData = function (newData) {
        withRoot(function (_) {
          var prevData = instanceApi.getData();
          var mergedData = merge(prevData, newData);
          var newInternalData = validateData(access, mergedData);
          var form = access.getFormWrapper();
          Representing.setValue(form, newInternalData);
        });
      };
      var disable = function (name) {
        getCompByName(access, name).each(Disabling.disable);
      };
      var enable = function (name) {
        getCompByName(access, name).each(Disabling.enable);
      };
      var focus = function (name) {
        getCompByName(access, name).each(Focusing.focus);
      };
      var block = function (message) {
        withRoot(function (root) {
          emitWith(root, formBlockEvent, { message: message });
        });
      };
      var unblock = function () {
        withRoot(function (root) {
          emit(root, formUnblockEvent);
        });
      };
      var showTab = function (title) {
        withRoot(function (_) {
          var body = access.getBody();
          var bodyState = Reflecting.getState(body);
          if (bodyState.get().exists(function (b) {
              return b.isTabPanel();
            })) {
            Composing.getCurrent(body).each(function (tabSection) {
              TabSection.showTab(tabSection, title);
            });
          }
        });
      };
      var redial = function (d) {
        withRoot(function (root) {
          var dialogInit = doRedial(d);
          root.getSystem().broadcastOn([dialogChannel], dialogInit);
          root.getSystem().broadcastOn([titleChannel], dialogInit.internalDialog);
          root.getSystem().broadcastOn([bodyChannel], dialogInit.internalDialog);
          root.getSystem().broadcastOn([footerChannel], dialogInit.internalDialog);
          instanceApi.setData(dialogInit.initialData);
        });
      };
      var close = function () {
        withRoot(function (root) {
          emit(root, formCloseEvent);
        });
      };
      var instanceApi = {
        getData: getData,
        setData: setData,
        disable: disable,
        enable: enable,
        focus: focus,
        block: block,
        unblock: unblock,
        showTab: showTab,
        redial: redial,
        close: close
      };
      return instanceApi;
    };

    var renderDialog = function (dialogInit, extra, backstage) {
      var _a;
      var updateState = function (_comp, incoming) {
        return Option.some(incoming);
      };
      var header = renderModalHeader({
        title: backstage.shared.providers.translate(dialogInit.internalDialog.title),
        draggable: true
      }, backstage.shared.providers);
      var body = renderModalBody({ body: dialogInit.internalDialog.body }, backstage);
      var footer = renderModalFooter({ buttons: dialogInit.internalDialog.buttons }, backstage.shared.providers);
      var dialogEvents = SilverDialogEvents.init(function () {
        return instanceApi;
      }, {
        onClose: function () {
          return extra.closeWindow();
        },
        onBlock: function (blockEvent) {
          ModalDialog.setBusy(dialog, function (d, bs) {
            return {
              dom: {
                tag: 'div',
                classes: ['tox-dialog__busy-spinner'],
                attributes: { 'aria-label': blockEvent.message() },
                styles: {
                  left: '0px',
                  right: '0px',
                  bottom: '0px',
                  top: '0px',
                  position: 'absolute'
                }
              },
              behaviours: bs,
              components: [{ dom: fromHtml$2('<div class="tox-spinner"><div></div><div></div><div></div></div>') }]
            };
          });
        },
        onUnblock: function () {
          ModalDialog.setIdle(dialog);
        }
      });
      var dialogSize = dialogInit.internalDialog.size !== 'normal' ? dialogInit.internalDialog.size === 'large' ? 'tox-dialog--width-lg' : 'tox-dialog--width-md' : [];
      var dialog = build$1(ModalDialog.sketch({
        lazySink: backstage.shared.getSink,
        onEscape: function (c) {
          emit(c, formCancelEvent);
          return Option.some(true);
        },
        useTabstopAt: function (elem) {
          return !NavigableObject.isPseudoStop(elem) && (name(elem) !== 'button' || get$2(elem, 'disabled') !== 'disabled');
        },
        modalBehaviours: derive$1([
          Reflecting.config({
            channel: dialogChannel,
            updateState: updateState,
            initialData: dialogInit
          }),
          Focusing.config({}),
          config('execute-on-form', dialogEvents.concat([runOnSource(focusin(), function (comp, se) {
              Keying.focusIn(comp);
            })])),
          RepresentingConfigs.memory({})
        ]),
        eventOrder: (_a = {}, _a[execute()] = ['execute-on-form'], _a[attachedToDom()] = [
          'reflecting',
          'execute-on-form'
        ], _a),
        dom: {
          tag: 'div',
          classes: ['tox-dialog'].concat(dialogSize),
          styles: { position: 'relative' }
        },
        components: [
          header,
          body,
          footer
        ],
        dragBlockClass: 'tox-dialog-wrap',
        parts: {
          blocker: {
            dom: fromHtml$2('<div class="tox-dialog-wrap"></div>'),
            components: [{
                dom: {
                  tag: 'div',
                  classes: ['tox-dialog-wrap__backdrop']
                }
              }]
          }
        }
      }));
      var modalAccess = function () {
        var getForm = function () {
          var outerForm = ModalDialog.getBody(dialog);
          return Composing.getCurrent(outerForm).getOr(outerForm);
        };
        return {
          getRoot: function () {
            return dialog;
          },
          getBody: function () {
            return ModalDialog.getBody(dialog);
          },
          getFooter: function () {
            return ModalDialog.getFooter(dialog);
          },
          getFormWrapper: getForm
        };
      }();
      var instanceApi = getDialogApi(modalAccess, extra.redial);
      return {
        dialog: dialog,
        instanceApi: instanceApi
      };
    };

    var renderInlineDialog = function (dialogInit, extra, backstage) {
      var _a, _b;
      var dialogLabelId = generate$1('dialog-label');
      var updateState = function (_comp, incoming) {
        return Option.some(incoming);
      };
      var memHeader = record(renderInlineHeader({
        title: dialogInit.internalDialog.title,
        draggable: true
      }, dialogLabelId, backstage.shared.providers));
      var memBody = record(renderInlineBody({ body: dialogInit.internalDialog.body }, backstage));
      var memFooter = record(renderInlineFooter({ buttons: dialogInit.internalDialog.buttons }, backstage.shared.providers));
      var dialogEvents = SilverDialogEvents.init(function () {
        return instanceApi;
      }, {
        onBlock: function () {
        },
        onUnblock: function () {
        },
        onClose: function () {
          return extra.closeWindow();
        }
      });
      var dialog = build$1({
        dom: {
          tag: 'div',
          classes: ['tox-dialog'],
          attributes: (_a = { role: 'dialog' }, _a['aria-labelledby'] = dialogLabelId, _a)
        },
        eventOrder: (_b = {}, _b[receive()] = [
          Reflecting.name(),
          Receiving.name()
        ], _b[execute()] = ['execute-on-form'], _b[attachedToDom()] = [
          'reflecting',
          'execute-on-form'
        ], _b),
        behaviours: derive$1([
          Keying.config({
            mode: 'cyclic',
            onEscape: function (c) {
              emit(c, formCloseEvent);
              return Option.some(true);
            },
            useTabstopAt: function (elem) {
              return !NavigableObject.isPseudoStop(elem) && (name(elem) !== 'button' || get$2(elem, 'disabled') !== 'disabled');
            }
          }),
          Reflecting.config({
            channel: dialogChannel,
            updateState: updateState,
            initialData: dialogInit
          }),
          config('execute-on-form', dialogEvents),
          RepresentingConfigs.memory({})
        ]),
        components: [
          memHeader.asSpec(),
          memBody.asSpec(),
          memFooter.asSpec()
        ]
      });
      var instanceApi = getDialogApi({
        getRoot: function () {
          return dialog;
        },
        getFooter: function () {
          return memFooter.get(dialog);
        },
        getBody: function () {
          return memBody.get(dialog);
        },
        getFormWrapper: function () {
          var body = memBody.get(dialog);
          return Composing.getCurrent(body).getOr(body);
        }
      }, extra.redial);
      return {
        dialog: dialog,
        instanceApi: instanceApi
      };
    };

    var pClose = function (onClose, providersBackstage) {
      return ModalDialog.parts().close(Button.sketch({
        dom: {
          tag: 'button',
          classes: [
            'tox-button',
            'tox-button--icon',
            'tox-button--naked'
          ],
          attributes: {
            'type': 'button',
            'aria-label': providersBackstage.translate('Close')
          }
        },
        action: onClose,
        buttonBehaviours: derive$1([Tabstopping.config({})])
      }));
    };
    var pUntitled = function () {
      return ModalDialog.parts().title({
        dom: {
          tag: 'div',
          classes: ['tox-dialog__title'],
          innerHtml: '',
          styles: { display: 'none' }
        }
      });
    };
    var pBodyMessage = function (message, providersBackstage) {
      return ModalDialog.parts().body({
        dom: {
          tag: 'div',
          classes: [
            'tox-dialog__body',
            'todo-tox-fit'
          ]
        },
        components: [{ dom: fromHtml$2('<p>' + providersBackstage.translate(message) + '</p>') }]
      });
    };
    var pFooter = function (buttons) {
      return ModalDialog.parts().footer({
        dom: {
          tag: 'div',
          classes: ['tox-dialog__footer']
        },
        components: buttons
      });
    };
    var pFooterGroup = function (startButtons, endButtons) {
      return [
        Container.sketch({
          dom: {
            tag: 'div',
            classes: ['tox-dialog__footer-start']
          },
          components: startButtons
        }),
        Container.sketch({
          dom: {
            tag: 'div',
            classes: ['tox-dialog__footer-end']
          },
          components: endButtons
        })
      ];
    };
    var renderDialog$1 = function (spec) {
      return ModalDialog.sketch({
        lazySink: spec.lazySink,
        onEscape: function () {
          spec.onCancel();
          return Option.some(true);
        },
        dom: {
          tag: 'div',
          classes: ['tox-dialog'].concat(spec.extraClasses)
        },
        components: [
          {
            dom: {
              tag: 'div',
              classes: ['tox-dialog__header']
            },
            components: [
              spec.partSpecs.title,
              spec.partSpecs.close
            ]
          },
          spec.partSpecs.body,
          spec.partSpecs.footer
        ],
        parts: {
          blocker: {
            dom: fromHtml$2('<div class="tox-dialog-wrap"></div>'),
            components: [{
                dom: {
                  tag: 'div',
                  classes: ['tox-dialog-wrap__backdrop']
                }
              }]
          }
        },
        modalBehaviours: derive$1([config('basic-dialog-events', [
            run(formCancelEvent, function (comp, se) {
              spec.onCancel();
            }),
            run(formSubmitEvent, function (comp, se) {
              spec.onSubmit();
            })
          ])])
      });
    };

    var setup$7 = function (extras) {
      var sharedBackstage = extras.backstage.shared;
      var open = function (message, callback) {
        var closeDialog = function () {
          ModalDialog.hide(alertDialog);
          callback();
        };
        var memFooterClose = record(renderFooterButton({
          name: 'close-alert',
          text: 'OK',
          primary: true,
          icon: Option.none()
        }, 'cancel', sharedBackstage.providers));
        var alertDialog = build$1(renderDialog$1({
          lazySink: function () {
            return sharedBackstage.getSink();
          },
          partSpecs: {
            title: pUntitled(),
            close: pClose(function () {
              closeDialog();
            }, sharedBackstage.providers),
            body: pBodyMessage(message, sharedBackstage.providers),
            footer: pFooter(pFooterGroup([], [memFooterClose.asSpec()]))
          },
          onCancel: function () {
            return closeDialog();
          },
          onSubmit: noop,
          extraClasses: ['tox-alert-dialog']
        }));
        ModalDialog.show(alertDialog);
        var footerCloseButton = memFooterClose.get(alertDialog);
        Focusing.focus(footerCloseButton);
      };
      return { open: open };
    };

    var setup$8 = function (extras) {
      var sharedBackstage = extras.backstage.shared;
      var open = function (message, callback) {
        var closeDialog = function (state) {
          ModalDialog.hide(confirmDialog);
          callback(state);
        };
        var memFooterYes = record(renderFooterButton({
          name: 'yes',
          text: 'Yes',
          primary: true,
          icon: Option.none()
        }, 'submit', sharedBackstage.providers));
        var footerNo = renderFooterButton({
          name: 'no',
          text: 'No',
          primary: true,
          icon: Option.none()
        }, 'cancel', sharedBackstage.providers);
        var confirmDialog = build$1(renderDialog$1({
          lazySink: function () {
            return sharedBackstage.getSink();
          },
          partSpecs: {
            title: pUntitled(),
            close: pClose(function () {
              closeDialog(false);
            }, sharedBackstage.providers),
            body: pBodyMessage(message, sharedBackstage.providers),
            footer: pFooter(pFooterGroup([], [
              footerNo,
              memFooterYes.asSpec()
            ]))
          },
          onCancel: function () {
            return closeDialog(false);
          },
          onSubmit: function () {
            return closeDialog(true);
          },
          extraClasses: ['tox-confirm-dialog']
        }));
        ModalDialog.show(confirmDialog);
        var footerYesButton = memFooterYes.get(confirmDialog);
        Focusing.focus(footerYesButton);
      };
      return { open: open };
    };

    var validateData$1 = function (data, validator) {
      return getOrDie$1(asRaw('data', validator, data));
    };
    var setup$9 = function (extras) {
      var alertDialog = setup$7(extras);
      var confirmDialog = setup$8(extras);
      var open = function (config$$1, params, closeWindow) {
        if (params !== undefined && params.inline === 'toolbar') {
          return openInlineDialog(config$$1, extras.backstage.shared.anchors.toolbar(), closeWindow);
        } else if (params !== undefined && params.inline === 'cursor') {
          return openInlineDialog(config$$1, extras.backstage.shared.anchors.cursor(), closeWindow);
        } else {
          return openModalDialog(config$$1, closeWindow);
        }
      };
      var openModalDialog = function (config$$1, closeWindow) {
        var factory = function (contents, internalInitialData, dataValidator) {
          var initialData = internalInitialData;
          var dialogInit = {
            dataValidator: dataValidator,
            initialData: initialData,
            internalDialog: contents
          };
          var dialog = renderDialog(dialogInit, {
            redial: DialogManager.redial,
            closeWindow: function () {
              ModalDialog.hide(dialog.dialog);
              closeWindow(dialog.instanceApi);
            }
          }, extras.backstage);
          ModalDialog.show(dialog.dialog);
          dialog.instanceApi.setData(initialData);
          return dialog.instanceApi;
        };
        return DialogManager.open(factory, config$$1);
      };
      var openInlineDialog = function (config$$1, anchor, closeWindow) {
        var factory = function (contents, internalInitialData, dataValidator) {
          var initialData = validateData$1(internalInitialData, dataValidator);
          var dialogInit = {
            dataValidator: dataValidator,
            initialData: initialData,
            internalDialog: contents
          };
          var dialogUi = renderInlineDialog(dialogInit, {
            redial: DialogManager.redial,
            closeWindow: function () {
              InlineView.hide(inlineDialog);
              closeWindow(dialogUi.instanceApi);
            }
          }, extras.backstage);
          var inlineDialog = build$1(InlineView.sketch({
            lazySink: extras.backstage.shared.getSink,
            dom: {
              tag: 'div',
              classes: []
            },
            fireDismissalEventInstead: {},
            inlineBehaviours: derive$1([config('window-manager-inline-events', [run(dismissRequested(), function (comp, se) {
                  emit(dialogUi.dialog, formCancelEvent);
                })])])
          }));
          InlineView.showAt(inlineDialog, anchor, premade$1(dialogUi.dialog));
          dialogUi.instanceApi.setData(initialData);
          Keying.focusIn(dialogUi.dialog);
          return dialogUi.instanceApi;
        };
        return DialogManager.open(factory, config$$1);
      };
      var confirm = function (message, callback) {
        confirmDialog.open(message, function (state) {
          callback(state);
        });
      };
      var alert = function (message, callback) {
        alertDialog.open(message, function () {
          callback();
        });
      };
      var close = function (instanceApi) {
        instanceApi.close();
      };
      return {
        open: open,
        alert: alert,
        close: close,
        confirm: confirm
      };
    };
    var WindowManager = { setup: setup$9 };

    global.add('silver', function (editor) {
      var _a = Render.setup(editor), mothership = _a.mothership, uiMothership = _a.uiMothership, backstage = _a.backstage, renderUI = _a.renderUI, getUi = _a.getUi;
      FormatControls.setup(editor);
      registerInspector(generate$1('silver-demo'), mothership);
      registerInspector(generate$1('silver-ui-demo'), uiMothership);
      Autocompleter.register(editor, backstage.shared);
      var windowMgr = WindowManager.setup({ backstage: backstage });
      return {
        renderUI: renderUI,
        getWindowManagerImpl: constant(windowMgr),
        getNotificationManagerImpl: function () {
          return NotificationManagerImpl(editor, { backstage: backstage }, uiMothership);
        },
        ui: getUi()
      };
    });
    function Theme () {
    }

    return Theme;

}());
})();
