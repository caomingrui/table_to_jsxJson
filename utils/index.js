/**
 * 处理th 内模板{{  }}
 * @param res
 * @param forItem
 * @returns {{key, renderFn: *}|{key: string, renderFn: string}|{key: (string|*), renderFn: (string|*)}}
 */
export function tdMatchRecord(res, forItem) {
    let fn_match = res.content.match(/\(.+?\)/g);
    let filter_match = res.content.indexOf('|');
    // 存在方法
    if (fn_match) {
        return {key: forItem, renderFn: res.content};
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