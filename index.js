import vueStr from "./static/vueCode";
import {match, renderJsx, VueToAst} from "./utils/utool";
import {parse as babelParser} from "@babel/parser";
import traverse from "@babel/traverse"
import * as types from "@babel/types";
import template from "@babel/template";
import generate from "@babel/generator";
import getZhName from './static/zh';
import {getThProps, tdMatchRecord, templateChildrenRecord} from "./utils";


let AstOption = new VueToAst(vueStr);

let Ast = AstOption.traverse_template({
    'th': (data) => {
        let thProps = data.props;
        let props = getThProps(thProps);
        return AstOption.getAstContent(data).map(res => {
            // 匹配国际化
            if (res.type === 4) {
                return {
                    ...props,
                    label: res.content.match(/\(.+?\)/g).map(l => getZhName[l.slice(2, l.length - 2)]).join('')
                }
            }
            return {
                ...props,
                label: res.content
            };
        });
    },
    'td': (data, forItem) => {

        let contentList = AstOption.getAstContent(data);
        // 单个children
        if (contentList.length === 1) {
            return contentList.map(res => {
                let {originalKey, ...arg} = tdMatchRecord(res, forItem);
                return arg;
            })
        }
        // 会有边界问题
        else if (contentList.length > 1) {

            let judgment,
                // 是否在 if", "else", "else-if 标签内
                hasRender = false;

            return [contentList.reduce((o, item) => {
                judgment = item.parent.props?.find(l => ["if", "else", "else-if"].includes(l.name));

                // v-if
                if (judgment) {

                    hasRender = true;

                    let record = {...(o['render'] || {})};
                    if (judgment.name !== "else") {
                        o['key'] = match(judgment.exp.content.split(`${forItem}.`)[1]);
                        // record[ v-if判断条件 ] = {内容}
                        record[judgment.exp.content.split(`${forItem}.`).join('')] = {
                            tag: item.parent.tag,
                            // child: item.parent.children[0].content
                            child: templateChildrenRecord(item, forItem)
                        }
                        // v-else
                    } else {
                        record[""] = {
                            tag: item.parent.tag,
                            child: templateChildrenRecord(item, forItem)
                        }
                    }

                    o['render'] = record;
                    // 非if", "else", "else-if 子标签
                } else if (!hasRender) {
                    o['key'] = forItem;
                    let {renderFn, originalKey} = tdMatchRecord(item, forItem);
                    if (item.type === 4) {
                        o['renderFn'] = `${(o['renderFn'] ? o['renderFn'] + '+' : '')} ${renderFn || originalKey}`;
                    }
                    // 字符串
                    else {
                        o['renderFn'] = `${o['renderFn']} + '${renderFn || originalKey}'`;
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
    ObjectProperty(path) {
        const {key, value} = path.node;
        if (key.value === 'key') {
            Key = value.value
        }
        if (key.value === 'render' && value.properties.length) {
            const renderAst = renderJsx(value.properties, Key);
            path.replaceInline(renderAst);
        }
        if (key.value === 'renderFn' && value.value) {
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


AstOption.traverse_script({});

