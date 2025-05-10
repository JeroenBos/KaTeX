/* eslint-disable max-len */
import {assertNodeType} from "../src/parseNode";
import parseTree from "../src/parseTree";
import {nonstrictSettings, assertEquivalentHtml} from "./helpers";
import katex from "../katex";

describe("\\blatex{}", function() {
    it("should parse without arg", function() {
        const tree = parseTree("\\blatex{}", nonstrictSettings);

        expect(tree.length).toBe(1);
        const root = assertNodeType(tree[0], "blatex");
        expect(root.type).toBe("blatex");
        expect(root.loc.start).toBe(0);
        expect(root.loc.end).toBe(7);
        expect(root.args.length).toBe(1);
        expect(root.args[0].type).toBe("raw");
        expect(root.args[0].string).toBe("");
    });
    it("should parse with arg", function() {
        const tree = parseTree("\\blatex{arg}", nonstrictSettings);

        expect(tree.length).toBe(1);
        const root = assertNodeType(tree[0], "blatex");
        expect(root.type).toBe("blatex");
        expect(root.loc.start).toBe(0);
        expect(root.loc.end).toBe(7); // hm ideally more like 12
        expect(root.args.length).toBe(1);
        expect(root.args[0].type).toBe("raw");
        expect(root.args[0].string).toBe("arg");
    });
    it("should parse with arg and optional arg", function() {
        const tree = parseTree("\\blatex[optArg]{arg}", nonstrictSettings);

        expect(tree.length).toBe(1);
        const root = assertNodeType(tree[0], "blatex");
        expect(root.type).toBe("blatex");
        expect(root.loc.start).toBe(0);
        expect(root.loc.end).toBe(7);
        expect(root.args.length).toBe(2);
        expect(root.args[1].type).toBe("raw");
        expect(root.args[1].string).toBe("optArg");
    });

    it("renders arg", function() {
        const html = katex.renderToString("\\blatex{arg}");

        assertEquivalentHtml(html, `
            <span class="katex">
                <span class="katex-mathml">
                    <math xmlns="http://www.w3.org/1998/Math/MathML">
                        <semantics><mrow><annotation>arg</annotation></mrow>
                            <annotation encoding="application/x-tex">\\blatex{arg}</annotation>
                        </semantics>
                    </math>
                </span>
                <span class="katex-html" aria-hidden="true">
                    <span class="base">
                        <span class="strut" style="height:0.4306em;">
                        </span>
                        <span data-loc="0,7">
                            arg
                        </span>
                    </span>
                </span>
            </span>`
        );
    });
    it("renders arg and optional arg", function() {
        const html = katex.renderToString("\\blatex[optArg]{arg}");

        assertEquivalentHtml(html, `
            <span class="katex">
                <span class="katex-mathml">
                    <math xmlns="http://www.w3.org/1998/Math/MathML">
                        <semantics><mrow><annotation>argoptArg</annotation></mrow>
                            <annotation encoding="application/x-tex">\\blatex[optArg]{arg}</annotation>
                        </semantics>
                    </math>
                </span>
                <span class="katex-html" aria-hidden="true">
                    <span class="base">
                        <span class="strut" style="height:0.4306em;">
                        </span>
                        <span data-blatex="optArg" data-loc="0,7">
                            arg
                        </span>
                    </span>
                </span>
            </span>`
        );
    });
});
