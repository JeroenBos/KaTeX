// @flow
import {assertNodeType} from "../parseNode";
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import type {MathDomNode} from "../mathMLTree";

defineFunction({
    type: "raw",
    names: ["\\blatex"],
    props: {
        numOptionalArgs: 0,
        numArgs: 1,
        argTypes: ["raw"], // optional argument types come first
        allowedInText: true,
    },
    handler({parser, funcName, token}, args, optArgs) {
        const rawArgNode = assertNodeType(args[0], "raw");
        const value = rawArgNode.string.trim();
        const loc = rawArgNode.loc;
        if (!loc) {
            throw new Error("\\blatex expected a non-null, non-undefined loc");
        }
        const argLoc = {start: loc.start, end: loc.end};

        return {
            type: "blatex",
            mode: parser.mode,
            args: [
                {
                    type: "raw",
                    mode: parser.mode,
                    string: value,
                    loc: argLoc,
                },
            ],
        };
    },
    htmlBuilder(group, options) {  // group is of type ParseNodeTypes["raw"]
        const element = buildCommon.makeSpan([], [], options);
        const argNode = group.args[0];
        element.setAttribute("data-blatex", argNode.string);
        element.setAttribute("data-loc", argNode.loc.start + "," + argNode.loc.end);

        const wrapper = buildCommon.makeSpan([], [element], options);
        return wrapper;
    },
    mathmlBuilder(group, options) {
        const children: MathDomNode[] = group.loc && group.string
            ? [new mathMLTree.TextNode(group.arg)]
            : [];
        const annotation = new mathMLTree.MathNode("annotation", children);
        return annotation;
    },
});
