// @flow
import {assertNodeType} from "../parseNode";
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import type {MathDomNode} from "../mathMLTree";

// syntax: \\blatex{f_name} ( { optional_arg } )?
// where
//    f_name: the name of the blatex component to render here
//    optional_arg: a string argument to be passed to the component

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
        const value = assertNodeType(args[0], "raw").string.trim();

        return {
            type: "raw",
            mode: parser.mode,
            string: value,
        };
    },
    htmlBuilder(group, options) {  // group is of type ParseNodeTypes["raw"]
        const span = buildCommon.makeSpan([], [], options);
        span.setAttribute("data-blatex", group.string);
        return span;
    },
    mathmlBuilder(group, options) {
        const children: MathDomNode[] = group.loc && group.arg
            ? [new mathMLTree.TextNode(group.arg)]
            : [];
        const annotation = new mathMLTree.MathNode("annotation", children);
        return annotation;
    },
});
