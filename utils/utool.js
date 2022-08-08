import {parse} from "@vue/compiler-dom";
import * as types from "@babel/types";
import {parse as babelParser} from "@babel/parser";
import traverse from "@babel/traverse";

// 特殊字符
let markSymbol = ["("];

export function VueToAst(vueString) {
    const {children} = parse(vueString);

    this.template = children[0];
    this.script = children[1];
    this.style = children[2];

    /**
     * 提供一个获取AST content 的方法
     * @param data
     * @param record
     * @returns {(*&{parent, isProps: (boolean)})|*[]}
     */
    this.getAstContent = (data, record) => {
        let arr = [];
        switch (data.type.toString()) {
            // obj
            case "5": {
                if (!data.content) {
                    return {...data, parent: record, isProps: record.props ? !!record.length : false}
                }

                arr = arr.concat(this.getAstContent(data.content, data));
                break;
            }
            default: {
                if (!data.children) {
                    return {...data, parent: record, isProps: record.props ? !!record.length : false}
                }

                for (let i = 0; i < data.children.length; i++) {
                    arr = arr.concat(this.getAstContent(data.children[i], data));
                }
            }
        }

        return arr;
    }

    /**
     * 生成 table JSON
     * 访问者模式 option 分离不同tag 处理逻辑
     * @param option 处理不同tag
     * @returns {{label: *, key: string}|{label: string, key: null}|*[]}
     */
    this.traverse_template = (option = {}) => {
        /**
         * 深度优先遍历
         * @param data
         * @param tagName
         * @param preData
         * @param forItem v-for="(item) in data" 中的 item
         * @param index
         * @returns {{label: *, key: string}|null|*[]|{label: string, key: null}}
         */
        const dfs = (data, tagName = null, preData = null, forItem = null) => {
            if (!data.children) {
                switch (tagName) {
                    case "th": {
                        return {label: data.content, key: "???"};
                    }
                    case "td": {
                        let content = null;
                        if (data.type === 5) {
                            content = data.content.content;
                        }
                        // 字符串
                        else if (data.type === 2) {
                            content = data.content;
                        }
                        return {
                            label: forItem,
                            key: content
                        }
                    }
                    default: {
                        return preData;
                    }
                }
            }


            let list = preData || [];
            for (let i = 0; i < data.children?.length; i++) {
                let childRecord = data.children[i], calcData = {};

                switch (childRecord.tag) {
                    case "th": {
                        let thData = void 0;
                        if (option.td) {
                            thData = option.th(childRecord, forItem);
                            calcData = thData;
                        }
                        if (!thData) {
                            calcData = dfs(childRecord, childRecord.tag, forItem);
                        }
                        list = list.concat(calcData)
                        break
                    }
                    case "td": {
                        if (option.td) {
                            let lineData = (option.td(childRecord, forItem) || [{}])[0];
                            let listIndexInit = {...list[i], ...lineData};
                            if (list[i].render) {
                                if (lineData.render) {
                                    listIndexInit = {
                                        ...list[i],
                                        ...lineData,
                                        render: {
                                            ...list[i].render,
                                            ...lineData.render
                                        }
                                    }
                                }
                            }
                            list[i] = listIndexInit;
                        } else {
                            calcData = dfs(childRecord, childRecord.tag, list, forItem);
                            list[i].key = calcData.key;
                        }
                        break
                    }
                    case "tr": {
                        // 判断 for
                        if (childRecord.props.length) {
                            childRecord.props.forEach((item) => {
                                if (item.name === "for") {
                                    forItem = item.exp.content.split(" ").filter(l => l && !markSymbol.includes(l))[0];
                                }
                            });
                        }
                    }
                    default: {
                        let tagData;
                        if (option[childRecord.tag]) {
                            tagData = option[childRecord.tag](childRecord, forItem);
                            list = tagData;
                        }
                        if (!tagData) {
                            list = dfs(childRecord, tagName, list, forItem);
                        }
                    }
                }
            }
            return list;
        }

        return dfs(this.template);
    }


    this.traverse_script = (option = {}) => {
        const scriptAst = babelParser(children[1].children[0].content, {
            sourceType: 'unambiguous',
        });
        // console.log(scriptAst);

        traverse(scriptAst, {
            ImportDeclaration(path) {
                const {node} = path;
                const {specifiers, source} = node;
                let fnList = specifiers.map(({imported}) => ({name: imported.name, url: source.value}));
            },
            ObjectMethod(path) {
                const {key} = path.node
                // console.log(path.node)
                switch (key.name.toString()) {
                    case "data": {
                        // console.log(path.node.body.body[0].argument.properties, 'data')
                    }
                }
                // if (['data'].includes(key.name)) {
                // console.log(path.node, '????????');
                // }
            },
            ObjectProperty(path) {
                // console.log(path.node, '.......')
            },
            ExpressionStatement(path) {
                // console.log(path.node, 'lll')
            }
        });
    }
}


export function match(str) {
    let strList = ['=', '<', '>', '!', '&'];
    let val = "";
    for (let i = 0; i < str.length; i++) {
        let s = str[i];
        if (!strList.includes(s)) {
            val += s;
        } else {
            return val.trim();
        }
    }

    return val.trim();
}

/**
 * 三元表达式 转化 render AST
 *
 * "state === 1": {
 *     tag: 'div',
 *     child: '111'
 * },
 * "state === 2": {
 *     tag: 'span',
 *     child: '2222'
 * }
 *
 * 转化
 *
 * state === 1? <div>111</div>: state === 2 && <span>2222</span>
 *
 * @param data
 * @param name
 */
export function renderJsx(data, name) {
    let arr = [];
    for (let i = 0; i < data.length; i++) {
        let {key, value} = data[i];
        // key 'test === 1' ——> ast
        let binary = babelParser(key.value, {sourceType: 'unambiguous'}).program.body;

        if (binary.length) {
            binary = binary[0].expression;
        }

        // 拼装表达式 好像步骤重复了
        // let binary = types.binaryExpression(
        //     keyAst.operator, // '==='
        //     types.identifier(keyAst.left.name),
        //     types.identifier(keyAst.right.value.toString())
        // );

        /**
         * {
                tag: 'div',
                child: '111'  ->   ast 版 <div>111</div>
            }
         */
        let valueAst;
        // 枚举 对象每项 | 当前局限字符串
        for (let j = 0; j < value.properties.length; j++) {
            let valueData = value.properties[j]

            valueAst = renderValue(valueData, valueAst);
        }
        // 生成jsx ast
        let childAst = types.jsxElement(
            valueAst.openTag,
            valueAst.closeTag,
            valueAst.childAst
        );
        arr.push({binary, childAst});
    }

    // 返回 render ast
    return types.objectMethod(
        'method',
        types.identifier('render'), [types.identifier('row')],
        // [types.objectPattern([
        //     types.objectProperty(
        //         types.identifier(name),
        //         types.identifier(name)
        //     )
        // ])],
        types.blockStatement([types.returnStatement(
            renderArr(arr)
        )]));
}

// type ObjToJsxAst = {
//     openTag: JSXOpeningElement,
//     closeTag: JSXClosingElement,
//     childAst: JSXText[]
// }

/**
 *
 * @param key
 * @param value
 * @param oldData
 */
function renderValue({key, value}, oldData = {}) {
    let obj = {...oldData};
    switch (key.value) {
        case "tag": {
            // 开口标签Ast
            obj.openTag = types.jsxOpeningElement(types.jsxIdentifier(value.value), []);
            // 闭口标签Ast
            obj.closeTag = types.jsxClosingElement(types.jsxIdentifier(value.value));
            break;
        }
        case "child": {
            // 标签内容
            obj.childAst = [types.jsxText(value.value)];
            break;
        }
    }
    return obj;
}


/**
 * 递归渲染完整的  三元ast
 * @param recordList
 */
function renderArr(recordList) {
    // 最后俩组 && | -> test == 1 && div
    if (recordList.length <= 2) {
        return types.conditionalExpression(
            recordList[0].binary,
            recordList[0].childAst,
            recordList[1].binary.length ? types.logicalExpression(
                '&&',
                recordList[1].binary,
                recordList[1].childAst,
            ) : recordList[1].childAst
        );
    }
    // 三元 a?1:b?2:c?3:d?:4 -> r(a, r(b, r(c, r(d))))
    return types.conditionalExpression(
        recordList[0].binary,
        recordList[0].childAst,
        addConditional(recordList, 1)
    );
}


/**
 * 生成 三元 右端AST
 * @param arr
 * @param index
 */
function addConditional(arr, index) {
    // 最后俩组处理
    if (index + 2 >= arr.length) return renderArr(arr.slice(index));

    return types.conditionalExpression(
        arr[index].binary,
        arr[index].childAst,
        addConditional(arr, index + 1)
    );
}