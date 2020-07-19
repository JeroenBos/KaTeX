// @flow
import {assertNodeType} from "../parseNode";
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import type {MathDomNode} from "../mathMLTree";

defineFunction({
    type: "blatex",
    names: ["\\blatex"],
    props: {
        numOptionalArgs: 0,
        numArgs: 1,
        argTypes: ["text"],
    },
    handler({parser}, args, optArgs) {
        const ord = assertNodeType(args[0], "ordgroup");

        if (ord.body.length > 1) {
            throw new Error('ord.body.length > 1');
        }

        const arg = ord.body.length !== 0
            ? assertNodeType(ord.body[0], "textord").text
            : "";

        return {
            type: "blatex",
            mode: parser.mode,
            arg: arg,
        };
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
