import {assertNodeType} from "../src/parseNode";
import parseTree from "../src/parseTree";
import {nonstrictSettings} from "./helpers";
import {renderToString} from "../katex";

describe("blatex", function() {
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

    it("should render", function() {
        const html = renderToString("\\blatex{}");

        expect(html.length !== 0);
    });

});
