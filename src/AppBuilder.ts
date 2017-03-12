import { compose,AppFunc,Middleware } from './compose'

export class AppBuilder<T> {

    private middleware = new Array<Middleware<T>>();
    constructor() {

    }

    build() {
        if (!this.middleware.length) {
            throw new Error('Usage error: must have at least one middleware')
        }
        return compose.apply(this, this.middleware) as AppFunc<T>;
    }

    use(mw: Middleware<T>) {
        if ('function' !== typeof mw) {
            throw new TypeError(`${mw}, middleware must be a function`)
        }
        this.middleware.push(mw)
        return this
    }
}

export default function <T>() {
    return new AppBuilder<T>()
}
