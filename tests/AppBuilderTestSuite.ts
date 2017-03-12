
import {AppBuilder, Middleware, AppFunc} from "si-appbuilder";

import * as Q from "q";

interface DummyContext {
    steps: number[];
}

describe("AppBuilder", () => {

    it("expects single middleware to run", (done) => {

        let appBuilder = new AppBuilder<DummyContext>();

        appBuilder.use((ctx, next) => {
            ctx.steps.push(0);
            return next(ctx);
        });


        let app = appBuilder.build();

        return app({ steps: [] }).then(ctx => {

            expect(ctx.steps.length).toBe(1);
            expect(ctx.steps[0]).toBe(0);

            done();
        });
    });

    it("expects two middleware to run", (done) => {

        let appBuilder = new AppBuilder<DummyContext>();

        appBuilder.use((ctx, next) => {
            ctx.steps.push(0);
            return next(ctx);
        });

        appBuilder.use((ctx, next) => {
            ctx.steps.push(1);
            return next(ctx);
        });


        let app = appBuilder.build();

        return app({ steps: [] }).then(ctx => {

            expect(ctx.steps.length).toBe(2);
            expect(ctx.steps[0]).toBe(0);
            expect(ctx.steps[1]).toBe(1);


            done();
        });
    });


    it("expects first middleware to break out", (done) => {

        let appBuilder = new AppBuilder<DummyContext>();

        appBuilder.use((ctx, next) => {
            ctx.steps.push(0);
            //setTimeout(() => {
            //    next(ctx);
            //},1000);
           
        });

        appBuilder.use((ctx, next) => {
            console.log("next");
            fail("Should not get invoked");
            
            return next(ctx);
        });


        let app = appBuilder.build();

        return app({ steps: [] }).then(ctx => {
            
            expect(ctx.steps.length).toBe(1);
            expect(ctx.steps[0]).toBe(0);
         
        }).then(
            () => {
                done();
            },
            err => {
                fail("error in pipelien: " + err);
                done();
        });
    });



    it("expects two middlewares to be slow", (done) => {

        let appBuilder = new AppBuilder<DummyContext>();

        appBuilder.use((ctx, next) => {
            ctx.steps.push(0);
            let a = Q.defer<DummyContext>();


            setTimeout(() => {
                ctx.steps.push(1);
                a.resolve(ctx);
            }, 2000);

            return a.promise.then(ctx => next(ctx));

        });

        appBuilder.use((ctx, next) => {
            ctx.steps.push(2);

            return next(ctx);
        });


        let app = appBuilder.build();

        return app({ steps: [] }).then(ctx => {

            expect(ctx.steps.length).toBe(3);
            expect(ctx.steps[0]).toBe(0);
            expect(ctx.steps[1]).toBe(1);
            expect(ctx.steps[2]).toBe(2);

        }).then(
            () => {
                done();
            },
            err => {
                fail("error in pipelien: " + err);
                done();
            });
    });
});