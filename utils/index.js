import getZhName from "../static/zh";
import {match} from "./utool";

/**
 * 处理模板{{  }}
 * @param res
 * @param forItem
 * @returns {{key, renderFn: *}|{key: string, renderFn: string}|{key: (string|*), renderFn: (string|*)}}
 */
export function tdMatchRecord(res, forItem) {
    let fn_match = res.content.match(/\(.+?\)/g);
    let filter_match = res.content.indexOf('|');
    // 存在方法
    if (fn_match) {
        // 国际
        if (res.content.includes('$t(')) {
            return {
                key: forItem,
                renderFn: "'" + res.content.match(/\(.+?\)/g).map(l => getZhName[l.slice(2, l.length - 2)]).join('') + "'"
            }
        }

        return {
            key: forItem,
            renderFn: res.content
        };
    }
    // 存在过滤器
    else if (filter_match !== -1) {
        let c = res.content.split('|')
        return {
            key: forItem ? c[0].trim().split(`${forItem}.`).join("") : c[0].trim(),
            renderFn: `${c[1].trim().toLowerCase()}(${c[0].trim()})`
        }
    }

    let lineKey = forItem ? res.content.split(`${forItem}.`).join("") : res.content
    return {
        key: lineKey,
        // 原始值 多children使用
        originalKey: res.content
        // renderFn: lineKey
    };
}


/**
 * 获取th props
 * @param thProps
 * @param checkProps
 * @returns {*}
 */
export function getThProps(thProps = [], checkProps = []) {
    return thProps.reduce((obj, item) => {
        if (checkProps.includes(item.name)) {
            obj[item.name] = item.value.content;
        }
        return obj;
    }, {});
}


/**
 * 处理多children | 暂时不支持多标签嵌套
 * @param record
 * @param forItem
 * @returns {null}
 */
export function templateChildrenRecord(record, forItem) {
    let val = null;

    for (let i = 0; i < record.parent?.children?.length; i++) {
        let {type, content} = record.parent.children[i];
        // 存在模板
        if (type === 5) {
            const {renderFn, key} = tdMatchRecord(content);
            val = `${val || ""}{${renderFn || key}}`;
        } else {
            val = `${val || ""}${content}`
        }
    }
    return val;
}


/**
 * 获取children 转义的Object
 * @param list
 * @param forItem
 * @returns {*}
 */
export function getChildrenRecord(list, forItem) {
    let judgment,
        // 是否在 if", "else", "else-if 标签内
        hasRender = false;
    return list.reduce((o, item) => {
        judgment = item.parent.props?.find(l => ["if", "else", "else-if"].includes(l.name));
        // v-if
        if (judgment) {
            hasRender = true;

            let record = {...(o['render'] || {})};
            if (judgment.name !== "else") {
                o['key'] = match(judgment.exp.content.split(`${forItem}.`)[1]);
                // record[ v-if判断条件 ] = {内容}
                record[judgment.exp.content] = {
                    tag: item.parent.tag,
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
                o['renderFn'] = `${(o['renderFn'] ? o['renderFn'] + '+' : '')} '${renderFn || originalKey}'`;
            }
        }
        return o;
    }, {});
}


/**
 * 获取国际化1配置
 * @param code
 * @returns {string|*}
 */
export function getZhString(code = "'-'") {
    let val = getZhName[code.slice(2, code.length - 2)];
    if (val) return val;
    return code;
}