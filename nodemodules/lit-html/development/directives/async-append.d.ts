/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { ChildPart, noChange } from '../lit-html.js';
import { DirectiveParameters, PartInfo } from '../directive.js';
import { AsyncDirective } from '../async-directive.js';
declare type Mapper<T> = (v: T, index?: number) => unknown;
declare class AsyncAppendDirective extends AsyncDirective {
    private _value?;
    private _reconnectResolver?;
    private _reconnectPromise?;
    constructor(partInfo: PartInfo);
    render<T>(value: AsyncIterable<T>, _mapper?: Mapper<T>): symbol;
    update(part: ChildPart, [value, mapper]: DirectiveParameters<this>): typeof noChange | undefined;
    private __iterate;
    disconnected(): void;
    reconnected(): void;
}
/**
 * A directive that renders the items of an async iterable[1], appending new
 * values after previous values, similar to the built-in support for iterables.
 * This directive is usable only in child expressions.
 *
 * Async iterables are objects with a [Symbol.asyncIterator] method, which
 * returns an iterator who's `next()` method returns a Promise. When a new
 * value is available, the Promise resolves and the value is appended to the
 * Part controlled by the directive. If another value other than this
 * directive has been set on the Part, the iterable will no longer be listened
 * to and new values won't be written to the Part.
 *
 * [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
 *
 * @param value An async iterable
 * @param mapper An optional function that maps from (value, index) to another
 *     value. Useful for generating templates for each item in the iterable.
 */
export declare const asyncAppend: (value: AsyncIterable<unknown>, _mapper?: Mapper<unknown> | undefined) => import("../directive.js").DirectiveResult<typeof AsyncAppendDirective>;
/**
 * The type of the class that powers this directive. Necessary for naming the
 * directive's return type.
 */
export type { AsyncAppendDirective };
//# sourceMappingURL=async-append.d.ts.map