import 'text-encoding';

// Polyfill for DOMMatrix (required by pdfjs-dist)
if (!global.DOMMatrix) {
    global.DOMMatrix = class DOMMatrix {
        constructor(arg) {
            this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
            if (Array.isArray(arg)) {
                this.a = arg[0]; this.b = arg[1]; this.c = arg[2]; this.d = arg[3]; this.e = arg[4]; this.f = arg[5];
            }
        }

        translate(tx, ty) {
            return this;
        }

        scale(sx, sy) {
            return this;
        }

        multiply(other) {
            return this;
        }

        toString() {
            return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
        }
    };
}

// Polyfill for console.assert (sometimes missing or behaves differently)
if (!console.assert) {
    console.assert = (condition, ...data) => {
        if (!condition) {
            console.error(...data);
        }
    };
}

// Polyfill for Promise.withResolvers (ES2024, required by newer pdfjs-dist)
if (!Promise.withResolvers) {
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}
