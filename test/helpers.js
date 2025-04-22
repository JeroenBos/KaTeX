import katex from "../katex";
import ParseError from "../src/ParseError";
import parseTree from "../src/parseTree";
import Settings from "../src/Settings";

import {diff} from 'jest-diff';
import {RECEIVED_COLOR, printReceived, printExpected} from 'jest-matcher-utils';
import {formatStackTrace, separateMessageFromStack} from 'jest-message-util';

export function ConsoleWarning(message) {
    Error.captureStackTrace(this, global.console.warn);
    this.name = this.constructor.name;
    this.message = message;
}
Object.setPrototypeOf(ConsoleWarning.prototype, Error.prototype);

/**
 * Return the first raw string if x is tagged literal. Otherwise return x.
 */
export const r = x => x != null && x.hasOwnProperty('raw') ? x.raw[0] : x;

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This function is from https://github.com/facebook/jest/blob/9867e16e518d50c79
 * 492f7f0d2bc1ef8dff37db4/packages/expect/src/to_throw_matchers.js and licensed
 * under the MIT license found in the https://github.com/facebook/jest/blob/master/LICENSE.
 */
const printActualErrorMessage = error => {
    if (error) {
        const {message, stack} = separateMessageFromStack(error.stack);
        return (
            'Instead, it threw:\n' +
            /* eslint-disable-next-line new-cap */
            RECEIVED_COLOR(
                `  ${message}` +
                formatStackTrace(
                    // remove KaTeX internal stack entries
                    stack.split('\n')
                        .filter(line => line.indexOf('new ParseError') === -1)
                        .join('\n'),
                    {
                        rootDir: process.cwd(),
                        testMatch: [],
                    },
                    {
                        noStackTrace: false,
                    },
                ),
            )
        );
    }
    return 'But it didn\'t throw anything.';
};

const printExpectedResult = (mode, isNot, expectedError) => expectedError == null
    ? (isNot ? 'fail ' : 'success ') + mode
    : (isNot ? 'not throw a ' : `fail ${mode} with a `) +
        (expectedError.name || `ParseError matching "${expectedError}"`);

export const nonstrictSettings = new Settings({strict: false});
export const strictSettings = new Settings({strict: true});
export const trustSettings = new Settings({trust: true});

/**
 * Return the root node of the rendered HTML.
 * @param expr
 * @param settings
 * @returns {Object}
 */
export function getBuilt(expr, settings = new Settings()) {
    expr = r(expr); // support tagging literals

    let rootNode = katex.__renderToDomTree(expr, settings);

    if (rootNode.classes.indexOf('katex-error') >= 0) {
        return rootNode;
    }

    if (rootNode.classes.indexOf('katex-display') >= 0) {
        rootNode = rootNode.children[0];
    }

    // grab the root node of the HTML rendering
    // rootNode.children[0] is the MathML rendering
    const builtHTML = rootNode.children[1];

    // combine the non-strut children of all base spans
    const children = [];
    for (let i = 0; i < builtHTML.children.length; i++) {
        children.push(...builtHTML.children[i].children.filter(
            (node) => node.classes.indexOf("strut") < 0));
    }
    return children;
}

/**
 * Return the root node of the parse tree.
 * @param expr
 * @param settings
 * @returns {Object}
 */
export function getParsed(expr, settings = new Settings()) {
    expr = r(expr); // support tagging literals
    return parseTree(expr, settings);
}

export const stripPositions = expr => {
    if (typeof expr !== "object" || expr === null) {
        return expr;
    }
    if (expr.loc && expr.loc.lexer && typeof expr.loc.start === "number") {
        delete expr.loc;
    }
    if (expr['data-loc']) {
        delete expr['data-loc'];
    }
    Object.keys(expr).forEach(function(key) {
        stripPositions(expr[key]);
    });
    return expr;
};

export const Mode = {
    PARSE: {
        apply: getParsed,
        noun: 'parsing',
        Verb: 'Parse',
    },
    BUILD: {
        apply: getBuilt,
        noun: 'building',
        Verb: 'Build',
    },
};

export const expectKaTeX = (expr, settings, mode, isNot, expectedError) => {
    let pass = expectedError == null;
    let error;
    try {
        mode.apply(expr, settings);
    } catch (e) {
        error = e;
        if (e instanceof ParseError) {
            pass = expectedError === ParseError || (typeof expectedError ===
                "string" && e.message === `KaTeX parse error: ${expectedError}`);
        } else if (e instanceof ConsoleWarning) {
            pass = expectedError === ConsoleWarning;
        } else {
            pass = !!isNot; // always fail
        }
    }
    return {
        pass,
        message: () => 'Expected the expression to ' +
            printExpectedResult(mode.noun, isNot, expectedError) +
            `:\n  ${printReceived(r(expr))}\n` +
            printActualErrorMessage(error),
    };
};

export const expectEquivalent = (actual, expected, settings, mode, expand) => {
    const actualTree = stripPositions(mode.apply(actual, settings));
    const expectedTree = stripPositions(mode.apply(expected, settings));
    const pass = JSON.stringify(actualTree) === JSON.stringify(expectedTree);

    return {
        pass,
        message: pass
            ? () =>
                `${mode.Verb} trees of ${printReceived(r(actual))} and ` +
                `${printExpected(r(expected))} are equivalent`
            : () => {
                const diffString = diff(expectedTree, actualTree, {
                    expand,
                });

                return `${mode.Verb} trees of ${printReceived(r(actual))} and ` +
                `${printExpected(r(expected))} are not equivalent` +
                (diffString ? `:\n\n${diffString}` : '');
            },
    };
};

const ignoredChars = [' ', '\n', '\t', '\r'];
export const assertEquivalentHtml = (actual, expected) => {
    // asserts that the two strings are equivalent,
    // except that 'expected' can contain extra ignoredChars anywhere

    let e = 0;
    let actualLineStartIndex = 0;
    let lineCount = 0;
    let lineStartIndex = 0;
    for (let i = 0; i < actual.length; i++) {
        const char = actual.charAt(i);
        do {
            if (e >= expected.length) {
                log("End of expected sequence reached");
                throw new Error("HTML not equivalent");
            }
            const eChar = expected.charAt(e);
            if (eChar === char) {
                e++;
                break;
            }
            if (eChar === '\n') {
                lineStartIndex = e + 1;
                actualLineStartIndex = i;
                lineCount++;
            }
            if (ignoredChars.includes(eChar)) {
                e++;
                continue;
            }
            const failedLine = substringToFirstOccurrenceOrEnd(expected,
                                                               lineStartIndex,
                                                               '\n').trim();
            const actualFailed = actual.substring(actualLineStartIndex,
                                                  Math.min(actual.length, i + 50));
            // eslint-disable-next-line max-len
            log(`HTML not equivalent at line ${lineCount.toString()}: '${failedLine}'. Instead got: '${actualFailed}'`);
            throw new Error("HTML not equivalent");
            // eslint-disable-next-line no-constant-condition
        } while (true);
    }
    for (let e2 = e; e2 < expected.length; e2++) {
        if (!ignoredChars.includes(expected.charAt(e2))) {
            // eslint-disable-next-line max-len
            log(`expected sequence contains more characters: ${expected.substring(e)}`);
            throw new Error("HTML not equivalent");
        }
    }
};

const substringToFirstOccurrenceOrEnd = (string, startIndex, item) => {
    const endIndex = indexOfOrEnd(string, item, startIndex);
    return string.substring(startIndex, endIndex);
};
const indexOfOrEnd = (string, item, startIndex) => {
    const index = string.indexOf(item, startIndex);
    return index === -1 ? length : index;
};

const log = (string) => {
    // eslint-disable-next-line no-console
    console.log(string);
};
