/* eslint-disable max-len */
import {assertNodeType} from "../src/parseNode";
import parseTree from "../src/parseTree";
import {nonstrictSettings, assertEquivalentHtml} from "./helpers";
import katex from "../katex";

describe("\\blatex{}", function() {
    it("should parse", function() {
        const tree = parseTree("\\blatex{}", nonstrictSettings);

        expect(tree.length === 1);
        const root = assertNodeType(tree[0], "blatex");
        expect(root.type === "blatex");
        expect(root.loc.start === 8);
        expect(root.loc.end === 8);
        expect(root.args.length === 1);
        expect(root.args[0].type === "raw");
        expect(root.args[0].string === "");
    });

    it("render not equivalent", function() {
        const html = katex.renderToString("\\blatex{}");

        assertEquivalentHtml(html, `
            <span class="katex">
                <span class="katex-mathml">
                    <math xmlns="http://www.w3.org/1998/Math/MathML">
                        <semantics><mrow><annotation></annotation></mrow>
                            <annotation encoding="application/x-tex">\\blatex{}</annotation>
                        </semantics>
                    </math>
                </span>
                <span class="katex-html" aria-hidden="true">
                    <span class="base">
                        <span class="strut" style="height:0em;vertical-align:0em;">
                        </span>
                        <span data-loc="0,8">
                            <span data-blatex="" data-loc="0,8">
                            </span>
                        </span>
                    </span>
                </span>
            </span>`
        );
    });
});
