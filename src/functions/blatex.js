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
    type: "blatex",
    names: ["\\blatex"],
    props: {
        // two arguments: key for the blatex component, arg for component
        numOptionalArgs: 1,
        numArgs: 1,
        argTypes: ["text", "text"],
    },
    handler({parser}, args, optArgs) {
        const ord = assertNodeType(args[0], "ordgroup");

        const key = ord.body.length !== 0
            ? assertNodeType(ord.body[0], "textord").text
            : "";

        // const arg = ord.body.length >= 2
        //     ? assertNodeType(ord.body[1], "textord").text
        //     : "";

        const result = {
            type: "blatex",
            mode: parser.mode,
            key: key,
        };

        return result;
    },
    htmlBuilder(group, options) {
        const span = buildCommon.makeSpan([], [], options);
        span.setAttribute("data-arg", group.arg);
        return span;
    },
    mathmlBuilder(group, options) {
        const children: MathDomNode[] = group.loc
            ? [new mathMLTree.TextNode(group.arg)]
            : [];
        const annotation = new mathMLTree.MathNode("annotation", children);
        return annotation;
    },
});
