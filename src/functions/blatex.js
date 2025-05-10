// @flow
import type {AnyParseNode,ParseNode} from "../parseNode";
import {assertNodeType} from "../parseNode";
import SourceLocation from "../SourceLocation";
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import type {MathDomNode} from "../mathMLTree";

defineFunction({
    type: "blatex",
    names: ["\\blatex"],
    props: {
        numOptionalArgs: 1,
        numArgs: 1,
        argTypes: ["raw", "raw"], // optional argument types come first
        allowedInText: true,
    },
    handler({parser, funcName, token}, args, optArgs) {
        if (token === undefined) {
            throw new Error("nodes of type blatex require the lexical token");
        }

        const argNode = assertNodeType(args[0], "raw");
        const value = argNode.string.trim();
        const funcNameTokenLoc = assertLocationSpecified(token.loc);
        const funcCallLoc = SourceLocation.merge(funcNameTokenLoc, argNode.loc);
        const parseNodeArgs: AnyParseNode[] = [
            {
                type: "raw",
                mode: parser.mode,
                string: value,
            },
        ]
        const result: ParseNode<"blatex"> = {
            type: "blatex",
            mode: parser.mode,
            args: parseNodeArgs,
            loc: funcCallLoc,
        };
        return result;
    },

    htmlBuilder(group: ParseNode<"blatex">, options) {
        const element = buildCommon.makeSpan([], [], options);
        const argNode = assertNodeType(group.args[0], "raw");
        const loc = assertLocationSpecified(group.loc);

        element.setAttribute("data-blatex", argNode.string);
        element.setAttribute("data-loc", loc.start + "," + loc.end);

        const wrapper = buildCommon.makeSpan([], [element], options);
        return wrapper;
    },
    mathmlBuilder(group, options) {
        const children: MathDomNode[] = [];
        for (let i = 0; i < group.args.length; i++) {
            const argNode = assertNodeType(group.args[i], "raw");
            children.push(new mathMLTree.TextNode(argNode.string));
        }

        const annotation = new mathMLTree.MathNode("annotation", children);
        return annotation;
    },
});


function assertLocationSpecified(loc: ?SourceLocation): SourceLocation {
    if (!loc) {
        throw new Error("\\blatex expected a non-null, non-undefined loc");
    }
    // for good measure, just clone it:
    return new SourceLocation(loc.lexer, loc.start, loc.end);
}
