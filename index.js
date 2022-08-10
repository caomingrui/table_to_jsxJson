import vueStr from "./static/vueCode";
import {renderJsx, VueToAst} from "./utils/utool";
import {parse as babelParser} from "@babel/parser";
import traverse from "@babel/traverse"
import * as types from "@babel/types";
import template from "@babel/template";
import generate from "@babel/generator";
import getZhName from './static/zh';
import {getChildrenRecord, getThProps} from "./utils";


let AstOption = new VueToAst(vueStr), tableItem = null;

let Ast = AstOption.traverse_template({
    'th': (data) => {
        let thProps = data.props;
        let props = getThProps(thProps, ['width']);
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
        tableItem = forItem;
        let contentList = AstOption.getAstContent(data);
        // 单个children
        if (contentList.length === 1) {
            return contentList.map(res => {
                return getChildrenRecord([res], forItem);
            })
        }
        // 会有边界问题
        else if (contentList.length > 1) {
            return [getChildrenRecord(contentList, forItem)];
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
            const renderAst = renderJsx(value.properties, tableItem);
            path.replaceInline(renderAst);
        }
        if (key.value === 'renderFn' && value.value) {
            let Ast = types.objectMethod(
                'method',
                types.identifier('render'),
                [types.identifier(tableItem)],
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