import vueStr from "./vueCode";
import {match, renderJsx, VueToAst} from "./utool";
import {parse as babelParser} from "@babel/parser";
import traverse from "@babel/traverse"
import * as types from "@babel/types";
import template from "@babel/template";
import generate from "@babel/generator";
import getZhName from './zh';


let AstOption = new VueToAst(vueStr);

let Ast = AstOption.traverse_template({
    'th': (data) => {
        return AstOption.getAstContent(data).map(res => {
            // 匹配国际化
            if (res.type === 4) {
                return {label: res.content.match(/\(.+?\)/g).map(l => getZhName[l.slice(2, l.length - 2)]).join('')}
            }
            return {
                label: res.content
            };
        });
    },
    'td': (data, forItem) => {
        let contentList = AstOption.getAstContent(data);

        if (contentList.length === 1) {
            return contentList.map(res => {
                let fn_match = res.content.match(/\(.+?\)/g);
                let filter_match = res.content.indexOf('|');
                // 存在方法
                if (fn_match) {
                    return {key: '???', renderFn: res.content};
                }
                // 存在过滤器
                else if (filter_match != -1) {
                    let c = res.content.split('|')
                    return {
                        key: forItem ? c[0].trim().split(`${forItem}.`).join("") : c[0].trim(),
                        renderFn: `${c[1].trim().toLowerCase()}(${c[0].trim()})`
                    }
                }

                return {key: forItem ? res.content.split(`${forItem}.`).join("") : res.content};
            })
        }
        // 会有边界问题
        else if (contentList.length > 1) {
            let judgment;
            return [contentList.reduce((o, item) => {
                judgment = item.parent.props.find(l => l.name === "if");
                o['key'] = match(judgment.exp.content.split(`${forItem}.`)[1]);
                o['render'] = {
                    ...(o['render'] || {}),
                    [judgment.exp.content.split(`${forItem}.`).join('')]: {
                        tag: item.parent.tag,
                        child: item.parent.children[0].content
                    }
                }
                return o;
            }, {})];
        }
    },
    'table': (data) => {
        console.log(data, 'print____table')
    }
});

console.log(Ast, 'vueTemplateTable');


/**
 * table JSON -> AST render
 */
let tableJsonToAst = babelParser(`let column = ${JSON.stringify(Ast)}`, {
    sourceType: 'unambiguous',
    plugins: ['jsx']
}), Key;


/**
 * AST -> transform -> AST render
 */
traverse(tableJsonToAst, {
    ObjectProperty(path, state) {
        const {key, value} = path.node;
        if (key.value === 'key') {
            Key = value.value
        }
        if (key.value === 'render' && value.properties.length) {
            const renderAst = renderJsx(value.properties, Key);
            path.replaceInline(renderAst);
        }
        if (key.value === 'renderFn') {
            let Ast = types.objectMethod(
                'method',
                types.identifier('render'),
                [types.identifier('row')],
                types.blockStatement([types.returnStatement(
                    template.ast(`${value.value}`).expression
                )]));
            path.replaceInline(Ast);
        }
    }
});


/**
 * AST render -> render Code
 */
const {code} = generate(tableJsonToAst);
console.log('start---------start---------start');
console.log(code);
console.log('END---------END---------END');


