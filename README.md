流程
```html
<table>
    <tr>
        <th>测试</th>
        <td>测试2</td>
        <!-- name -> 测试3 -->
        <td>{{ $('name') }}}</td>
    </tr> 
    <tr v-for="item of tableData">
        <td>item.name</td>
        <td>
            <span v-if="test==1">111</span>
            <span v-if="test==2">2222</span>
        </td>
        <td>CNY(item.code)</td>
    </tr>
</table>
```

```javascript
[
    {
        label: '测试',
        key: 'name'
    },
    {
        label: '测试2',
        key: 'test',
        render: {
            "test==1": {
                tag: "span",
                child: "111"
            },
            "test==2": {
                tag: "span",
                child: "2222"
            }
        }
    },
    {
        label: "测试3",
        key: "???",
        renderFn: "cny(code)"
    }
]
```

```javascript
[
    {
        label: '测试',
        key: 'name'
    },
    {
        label: '测试2',
        key: 'test',
        render({test}) {
            return test==1?<span>111</span>:test==2&&<span>2222</span>
        }
    },
    {
        label: "测试3",
        key: "???",
        render(row) {
            return cny(row.code)
        }
    }
]
```