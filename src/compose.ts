
import * as Q from "q";


export type AppFunc<AppEnvironmnet> = (context: AppEnvironmnet) => PromiseLike<AppEnvironmnet>;
export type Middleware<AppEnvironmnet> = (context: AppEnvironmnet, next: AppFunc<AppEnvironmnet>) => void|AppEnvironmnet | PromiseLike<AppEnvironmnet>;


interface middleware {
  
    _called?: boolean;
}


function throwIfHasBeenCalled(fn: middleware) {
    if (fn._called) {
        throw new Error('Cannot call next more than once')
    }
    return fn._called = true
}

function throwIfNotFunction<T>(x: T) {
    if ('function' !== typeof x) {
        throw new TypeError(`${x}, middleware must be a function`)
    }
    return x
}
function isPromiseALike<T>(x: any): x is PromiseLike<T> {
    return Q.isPromiseAlike(x);
}
function tryInvokeMiddleware<AppEnvironmnet>(
    context: AppEnvironmnet,
    middleware?: Middleware<AppEnvironmnet>,
    next: AppFunc<AppEnvironmnet> = (ctx: AppEnvironmnet) => Q.resolve(ctx)): PromiseLike<AppEnvironmnet|void> {

    try {
         

        if (middleware) {
            let a = middleware(context, next);
            
            if (isPromiseALike(a)) {
                return a;
            } else {
                
                return Q.resolve(a || context);
            }
        }

        return Q.resolve(context);

        
    } catch (error) {
        return Q.reject<AppEnvironmnet>(error) as PromiseLike<AppEnvironmnet>
    }
}

function middlewareReducer<AppEnvironmnet>(composed: (ctx: AppEnvironmnet, next: Middleware<AppEnvironmnet>) => PromiseLike<AppEnvironmnet>, mw: Middleware<AppEnvironmnet>) {
    return function (context: AppEnvironmnet, nextFn: Middleware<AppEnvironmnet>) {
        const next = (ctx:AppEnvironmnet) => throwIfHasBeenCalled(next) && composed(context, nextFn)
        return tryInvokeMiddleware(context, mw, next)
    }
}

/**
 * Create a function to invoke all passed middleware functions
 * with a single argument and context
 * @param {...Array<Function>} middleware, groups of middleware functions
 * @return {Function} Invoke the middleware pipeline
 */
export function compose<AppEnvironmnet>(...middleware: Array<Middleware<AppEnvironmnet>>): AppFunc<AppEnvironmnet> {
    return [].concat(...middleware)
        .filter(throwIfNotFunction)
        .reduceRight(middlewareReducer, tryInvokeMiddleware)
}