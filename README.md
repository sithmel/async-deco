# async-deco

[![Build Status](https://travis-ci.org/sithmel/async-deco.svg?branch=master)](https://travis-ci.org/sithmel/async-deco)
[![npm version](https://img.shields.io/npm/v/async-deco.svg)](https://www.npmjs.com/package/async-deco)

async-deco is a collection of decorators for asynchronous functions (functions returning a promise). It allows to add features such as timeout, retry, dedupe, limit and much more!
They can be combined together using the "compose" function (included).

Here is the list of the decorators:

* [addLogger](#add-logger)
* [atomic](#atomic)
* [balance](#balance)
* [cache](#cache)
* [dedupe](#dedupe)
* [fallback](#fallback)
* [fallbackCache](#fallback-cache)
* [guard](#guard)
* [limit](#limit)
* [log](#log)
* [onFulfilled](#on-fulfilled)
* [onRejected](#on-rejected)
* [purgeCache](#purge-cache)
* [retry](#retry)
* [timeout](#timeout)

## Javascript support
Every module is available in 2 ecmascript editions: ES5, ES2015 (native).

The individual modules can be required either using named imports, or by importing the specific submodule you need. Using named imports will include the entire library and thus should only be done when bundle weight is not a concern (node) or when using a es2015+ module versions in combination with webpack3+ or rollup.

Here are some examples:

```js
// es5 is default
const log = require('async-deco').log;
import { log } from 'async-deco');

// es5
const log = require('async-deco/es5/log');
import log from 'async-deco/es5';

// es2015
const log = require('async-deco/es2015/log');
import log from 'async-deco/es2015';
```

Note: **file names are all lowercase, dash separated. Module names are camelcase.**

**All decorators are designed to work on both node.js and browsers.**

## Decorator for asynchronous functions?
"decorator" is a pattern where you run a function on an object (in this case a function) to extend or change its behaviour. For example:
```js
// decorator
const addHello = (func) =>
  (name) => return `hello ${func(name)}!`;

// function to extend
const echo = (name) => name;

const helloEcho = addHello(echo)
```
Where addHello is a decorator that enhances the "echo" function.

Let's see another example:
```js
const memoize = (func) => {
  const previousResults = new Map();
  return (n) => {
    if (previousResults.has(n)) {
      return previousResults.get(n);
    }
    const result = func(n);
    previousResults.set(n, result);
    return result
  }
}
```
The memoize decorator can be used to store previous results of an expensive function call, and can make an function much faster.
```js
const fastFunction = memoize(sloFunction);
```
The decorator pattern allows to extract a feature in a function.

This library aims to give a set of decorators that adds useful features to asynchronous functions. For example this decorator waits a second before execute the decorated function:
```js
const delay1sec = (func) => {
  return (...args) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        func(...args)
        .then(resolve)
        .catch(reject);
      }, 1000);
    })
}

const delayedMyFunction = delay1sec(myfunction);

delayedMyFunction() // this takes an extra second to execute ...
```

## Logging
Logging what happen inside a decorator, especially if it is working asynchronously, is a bit tricky.

To do it, I use a "logging context" added using the decorator returned by **add-logger**. This logger takes as argument a function used for logging:
```js
import { addLogger } = from 'async-deco';
const logger = addLogger((evt, payload, timestamp, id) => {
  // ...
});
```
This decorator should wrap all the others.
```js
logger(decorator2(decorator1(myfunction))) // You can also use compose as explained below.
```
The log function is called with the following arguments:
* evt: the name of the event
* payload: an object with additional information about this event
* timestamp: the time stamp for this event (in ms)
* id: this is an id that changes everytime the function is executed. You can use it to track the execution.

Here's an example decorator that uses logging.
```js
import { getLogger } = from 'async-deco';

function exampleDecorator(func) {
  // note: you have to use a named function because you need "this"
  return function (...args) {
    const logger = getLogger(this);
    return func(...args)
      .then((response) => {
        logger('response-successful', { response });
        return response
      });
  }
}
```
And then you decorate the function and enable the logging:
```js
logger(exampleDecorator(myfunction))
```

## Composing decorators
Decorator can be composed using the function provided. So instead of writing:
```js
const retry = retryDecorator();
const timeout = timeoutDecorator({ ms: 20 })

const myNewFunction = retry(timeout(myfunction));
```
You can
```js
import { compose } from 'async-deco';

const decorator = compose(
  retryDecorator(),
  timeoutDecorator({ ms: 20 })
);

const myNewFunction = decorator(myfunction);
```
**Note**: compose applies the decorators right to left!

## AddLogger
It enables the logging for the whole chain of decorators. Read the description in the [Logging  section](#logging).

## atomic
The decorated function can't be called concurrently. Here's what happen, in order:
* the "getKey" (passed in the option) is called against the arguments.
* If the result is null the function is called normally
* if getKey is not defined the key is always **_default**
* the resource called "key" gets locked
* the decorated function is executed
* the lock "key" is released when the function returns a result

The default locking mechanism is very simple and works "in the same process". Its interface is compatible with node-redlock a distributed locking mechanism backed by redis.
```js
import { atomic } from 'async-deco';

var atomicDecorator = atomic(options);
```
Options:
* getKey [optional]: a function for calculate a key from the given arguments.
* ttl [optional]: the maximum time to live for the lock. In ms. It defaults to 1000ms.
* lock [optional]: an instance of the locking object. You can pass any object compatible with the Lock instance (node-redlock for example). If not passed simple in-process lock will be used.

Here's how to use redlock with the decorator:
```js
import { atomic } from 'async-deco';
import redis from 'redis';
import Redlock from 'redlock';

var client = redis.createClient();
var redlock = new Redlock([client]);
var atomicDecorator = atomic({ lock: redlock, ttl: 1000 });
```
#### logs
| event             |    payload    |
|-------------------|---------------|
| atomic-lock-error |    { err }    |

* err: the return returned by the lock

## balance
This decorator allows to distribute the load between a group of functions.
The functions should take the same arguments.
```js
import { balance } from 'async-deco';

const balanceDecorator = balance();

const func = balanceDecorator([...list of functions]);
```
You can initialise the decorator with different policies:
```js
import { balance, policyRoundRobin, policyRandom, policyIdlest } from 'async-deco';

const balanceDecorator = balance(policyRoundRobin);
```
There are 3 policies available in the "balance-policies" package:

* policyRoundRobin: it rotates the execution between the functions
* policyRandom: it picks up a random function
* policyIdlest (default): it tracks the load of each function and use the idlest

You can also define your own policy:
```js
const mypolicy = (counter, loads, args) => {
  // "counter" is the number of times I have called the function
  // "loads" is an array with length equal to the number of functions.
  //         it contains how many concurrent calls are currently running for that function
  // "args" is an array containing the arguments of the current function call
  // the function should return the index of the function I want to run
});
```
#### logs
| event             |    payload          |
|-------------------|---------------------|
|  balance-execute  | {loads, executing } |

* loads: loads array
* executing: number of the function to execute

## cache
This decorator adds a caching layer to a function. It can use multiple caching engines. You can follow the respective README for their configuration:

#### cacheRAM
[memoize-cache](https://github.com/sithmel/memoize-cache) (version >= 6.0.2)
```js
import CacheRAM from 'memoize-cache/cache-ram';
```
This is a full featured in-RAM implementation. It works in any environment. It can take any value as cache key (other engines might have different constraints).

#### redis
[memoize-cache-redis](https://github.com/sithmel/memoize-cache-redis) (version >= 2.0.1)
```js
import CacheRedis from 'memoize-cache-redis';
```
To use with node.js, backed by redis. It can take only ascii strings as cache key.

#### cache-manager
[memoize-cache-manager](https://github.com/sithmel/memoize-cache-manager)  (version >= 2.0.2).
```js
import CacheManager from 'memoize-cache-manager';
```
It uses the library [cache-manager](https://github.com/BryanDonovan/node-cache-manager) to support multiple backends (node.js). It supports all features except "tags". It can take only ascii strings as cache key.

#### Use the default cache engine
If you don't specify the "cache" object, cacheRAM will be used and argument will be used for its configuration. Here's a couple of examples:
```js
import { cache } from 'async-deco'

// the result of the function will be cached in RAM forever, no matter the arguments used
const cacheDecorator = cache();

// the getKey function will take the same arguments passed to the decorated function and will return the key used as cache key
const cacheDecorator = cache({ getKey });
```
Here's a list of all arguments:
* getKey: a function returning the cacheKey. By default it returns always the same cacheKey.
* maxLen: the maximum number of item cached
* maxAge: the maximum age of the items stored in the cache (in seconds)
* maxValidity: the maximum age of the item stored in the cache (in seconds) to be considered "not stale" (the fallbackCache decorator can use stale items optionally).
* serialize: it is an optional function that serialize the value stored (takes a value, returns a value). It can be used for pruning part of the object we don't want to save
* deserialize: it is an optional function that deserialize the value stored (takes a value, returns a value).
* getTags: a function that returns an array of tags. You can use that for purging a set of items from the cache (see the purgeCache decorator). To use this option you should pass the cache object rather than rely on the default (see the section below).

#### Use a specific cache engine
If you define the cache engine externally you can share between multiple decorators (cache, purgeCache, fallbackCache). These are equivalent:
```js
const cacheDecorator = cache({ getKey, maxLen: 100 });
```
```js
import CacheRAM from 'memoize-cache/cache-ram';

const cacheRAM = new CacheRAM({ getKey, maxLen: 100 });
const cacheDecorator = cache({ cache: cacheRAM });
```

#### errors
Errors are not cached. If a function fails, it will not be cached.

#### logs
| event       |    payload    |
|-------------|---------------|
| cache-error |    { err }    |
| cache-hit   | { key, info } |
| cache-miss  | { key, info } |
| cache-set   | { key, tags } |

* err: the error instance (from the caching engine)
* key: the cache key
* info: some stats from the caching engine
* tags: the tags used for this cached item

## dedupe
It manages multiple concurrent calls to the same function, calling the decorated only once.
It can use the "getKey" function and execute a function once for each key.
```js
import { dedupe } from 'async-deco';

var dedupe = dedupeDecorator(options);
```
Options:
* getKey function [optional]: it runs against the original arguments and returns the key used for creating different queues of execution. If it is missing there will be only one execution queue. If the key is null, the function is executed normally.
* functionBus [optional]: this object is used to group functions by key and run them. The default implementation is able to group functions belonging to the same process.
* lock [optional]: this object is used to lock a function execution (by key).
* ttl [optional]: the maximum time to live for the lock (in ms). Default to 1000ms.

Using redis backed version of [functionBus](https://github.com/sithmel/function-bus-redis) and [lock](https://github.com/mike-marcacci/node-redlock) it is possible to implement a distributed version of the of the deduplication. Example:
```js
import { dedupe } from 'async-deco';
import redis from 'redis';
import Lock from 'redis-redlock';
import FunctionBus from 'function-bus-redis';

const lock = new Lock([redis.createClient()]);
const functionBus = new FunctionBus({
  pub: redis.createClient(),
  sub:redis.createClient()
});

const dedupeDecorator = dedupe({
  lock: lock,
  functionBus: functionBus
});
```
#### logs
| event          |    payload    |
|----------------|---------------|
| dedupe-execute | { key, len }  |

* key: cache key
* len: number of invocations

## fallback
If a function fails, it calls another one as fallback or use a value.
```js
import { fallback } from 'async-deco';

const fallbackDecorator = fallback({ func, value });
```
It takes either one of these 2 arguments:
* func: it is a function that takes the same arguments of the original function. This is invoked if the original function returns an error.
* value: this will be the return value of the decorated function if it throws an error

#### logs
| event       | payload |
|-------------|---------|
|  fallback   | { err } |

* err: the error returned by the original function

## fallbackCache
If the decorated function throws an error, it tries to use a previous cached result. This uses the same cache objects used by the [cache decorator](#cache).
```js
import { fallbackCache } from 'async-deco';

const fallbackDecorator = fallbackCache();
```
Just like the cache decorators it can either take a **cache** object or the cacheRAM object will be used with the options provided. So these 2 are equivalent:
```js
const fallbackDecorator = fallbackCache({ getKey, maxLen: 100 });
```
```js
import CacheRAM from 'memoize-cache/cache-ram';

const cacheRAM = new CacheRAM({ getKey, maxLen: 100 });
const fallbackDecorator = fallbackCache({ cache: cacheRAM });
```
If you use this decorator together the the cache decorator you might want to use 2 additional options:
* useStale: if true it will use "stale" cache items as valid [optional, defaults to false]
* noPush: it true it won't put anything in the cache [optional, defaults to false]

For example:
```js
const cacheRAM = new CacheRAM({ getKey, maxAge: 600, maxValidity: 3600 });
const fallbackDecorator = fallbackCache({ cache: cacheRAM });
const cacheDecorator = cache({ cache: cacheRAM });
const cachedFunction = fallbackDecorator(cacheDecorator(myfunction))
```
This cached function will cache values for 10 minutes, but if for any reason the decorated function fails, it will use a stale value from the cache (up to one hour old).

#### logs
| event                |    payload        |
|----------------------|-------------------|
| fallback-cache-error | { err, cacheErr } |
| fallback-cache-hit   |  { key, info }    |
| fallback-cache-miss  |  { key, info }    |
| fallback-cache-set   |  { key, tags }    |

* err: error from the decorated function
* cacheErr: error from the caching engine
* key: the cache key
* info: info from the caching engine
* tags: tags used for storing the cache item

## guard
It executes a "check function" before the decorated function. If it returns an error it will use this error as the return value of the decorated function.
It is useful if you want to run a function only if it passes some condition (access control).
```js
import { guard } 'async-deco';

const guardDecorator = guard({ check });
```
It takes 1 argument:
* check [mandatory]. It is a function that takes the same arguments of the decorated function. If it returns an error (it can be either synchronous or return a promise) the original function won't be called and that error will be returned.

#### logs
| event        | payload |
|--------------|---------|
| guard-denied | { err } |

* err: error returned by the guard function

## limit
Limit the concurrency of a function. Every function call that excedees the limit will be queued. If the maximum queue size is reached, the function at the bottom of the queue will return an error.
```js
import { limit } from 'async-deco';

const limitTwo = limitDecorator({ concurrency: 2 });
```
You can initialise the decorator with 1 argument:
* concurrency: number of parallel execution [optional, default to 1]
* queueSize: is the size of the queue. If the queue reaches this size the function at the bottom of the queue will return an "OverflowError" [optional, default Infinity]
* getKey: a function that runs against the original arguments and returns the key used for creating different queues of execution. If it is missing there will be only one execution queue. If it returns null or undefined, the limit will be ignored [optional]
* a comparator function: this function is a comparator that can be used for [Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort). It can be used to give priority to the functions that ends up in the queue. [optional, default first in first out]

The comparator has this form:
```js
const comparator = (a, b) => {
// a.func, b.func are the functions in the queue
// a.args, b.args are arrays with the arguments
})
```
#### logs
| event        | payload |
|--------------|---------|
| limit-queue  | { key } |
| limit-drop   | { key } |

* key: the key for this item, as calculated by the getKey function

## log
It logs when a function **start**, **end** and **fail**. It requires the addLogger decorator.
```js
import { log, addLogger } from 'async-deco';
const logger = addLogger((evt, payload, ts, id) => {
  console.log(evt, payload);
});
const addLogs = log();
const loggedfunc = logger(addLogs(myfunc));
```
Running "myfunc" you will have:
```
log-start {}
log-end { res } // "res" is the output of myfunc
```
or
```
log-start {}
log-error { err } // "err" is the exception returned by myfunc
```
When using multiple decorator, it can be useful to attach this decorator multiple times, to give an insight about when the original function starts/ends and when the decorated function is called. To tell what log is called you can add a prefix to the logs. For example:
```js
import { log, addLogger, cache } from 'async-deco';
const logger = addLogger((evt, payload, ts, id) => {
  console.log(evt, payload);
});
const addInnerLogs = log('inner-');
const addOuterLogs = log('outer-');
const cacheDecorator = cache();

const myfunc =  logger(addOuterLogs(cacheDecorator(addInnerLogs(myfunc))));
```
In this example outer-log-start and outer-log-end (or outer-log-error) will be always called. The inner logs only in case of cache miss.

## onFulfilled
It executes this function on the result once it is fulfilled.
```js
import { onFulfilled } from 'async-deco';

onFulfilled((res) => ...)
```
This
```js
const multiplyBy2 = onFulfilled((res) => res * 2)
const myNewFunc = multiplyBy2(myfunc)
```
is equivalent to:
```js
myfunc
  .then((res) => res * 2)
```
But being wrapped in a decorator helps to abstract away the logic.

## onRejected
It executes this function on the error, once is rejected.
```js
import { onRejected } from 'async-deco';

onRejected((err) => ...)
```
This
```js
const removeReferenceErrors = onRejected((err) => {
  if (err instanceof ReferenceError) {
    return null
  }
  throw err
});
const myNewFunc = removeReferenceErrors(myfunc)
```
is equivalent to:
```js
myfunc
  .catch((err) => {
    if (err instanceof ReferenceError) {
      return null
    }
    throw err
  })
```
But being wrapped in a decorator helps to abstract away the logic.

## purgeCache
When the decorated function succeed, it purges the corresponding cache entry/entries.
```js
import { purgeCache } from 'async-deco';

const purgeCacheDecorator = purgeCache({ cache, getKeys, getTags });
```
Here's the arguments:
* cache: a cache object [mandatory]. The interface should be compatible with [memoize-cache](https://github.com/sithmel/memoize-cache)
* getKeys: a function returning the list of cache keys to remove. It takes the decorated function arguments as its own arguments
* getTags: a function returning the lst of tags to remove (you can mark a cache item with a tag to remove group of them easily). It takes the decorated function arguments as its own arguments

You should use at least one of getKeys of getTags.

#### logs
| event             |    payload     |
|-------------------|----------------|
| purge-cache-error |    { err }     |
| purge-cache       | { keys, tags } |

* err: error from the cache
* keys: list of cache keys purged
* tags: list of tags purged

## retry
If a function fails, it retry it again
```js
import { retry } from 'async-deco';

const retryTenTimes = retry({ times: 10, interval: 1000 });
```
You can initialise the decorator with 2 arguments:
* times: number of retries [optional, it defaults to Infinity]
* interval: how long to wait before running the function again. It can be a number of milliseconds or a function returning a number of milliseconds (the function takes the current attempt as argument) [optional, it defaults to 0]

#### logs
| event |    payload     |
|-------|----------------|
| retry | { times, err } |

* times: the attempt number
* the error returned by the function

## timeout
If a function takes to much, returns a timeout exception.
```js
import { timeout } from 'async-deco';

const timeoutOneSec = timeout({ ms: 1000 });
```
This will wait one second before returning a TimeoutError.
It takes 1 argument:
* time in ms [mandatory]

#### logs
| event   |    payload   |
|---------|--------------|
| timeout |    { ms }    |

* ms: the timeout is ms

## Examples recipes

### Smart cache
Using "cache" on an asynchronous function has a conceptual flaw. Let's say for example I have a function with 100ms latency. I call this function every 10 ms:
```
executed            ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇          
          ------------------------------
requested ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆
```
What happen is that while I am still waiting for the first result (to cache) I regularly execute other 9 functions.
What if I compose cache with dedupe?
```js
const decorator = compose(dedupe(), cache());

const newfunc = decorator(...);
```
dedupe should fill the gap:
```
executed            ⬇
          ------------------------------
requested ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆
```

### Reliable function
Imagine a case in which you want to be sure you did everything to get a result, and in case is not possible you want to return a good fallback:
```js
const decorator = compose(
  fallback({ value: null }), // last resort fallback
  fallbackCache(),           // try to use a previous cached output
  retry({ times: 3 }),       // it retry 3 times
  timeout({ ms: 5000 }));    // it times out after 5 seconds

const newfunc = decorator(...);
```

### Queue
If you want to preserve the sequence used to call a function. For example, sending commands a service and be sure they are executed in the right order.
```js
const queue = limit({ concurrency: 1 });
const myfunc = queue(...);
```
