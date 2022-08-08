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
 * @returns {*}
 */
export function getThProps(thProps = []) {
    return thProps.reduce((obj, item) => {
        obj[item.name] = item.value.content;
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