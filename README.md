# xtype.js

渐进式开发框架xtype.js，使用js替代html，对svg同样适用。

## 原理

通过js创建dom，并将属性、数据、样式和事件赋值给dom。

xtype.js并未实现任何属性或事件，仅提供xtype和控件实例管理。

## API

`UI`：用于xtype注册、控件的创建和管理。

`UI.addXType(name, cls)`：将控件类型注册为xtype，例如`UI.addXType('html', Html)`。

`UI.removeXType(name)`：移除控件xtype。

`UI.getXType(name)`：通过xtype获取控件类型

`UI.add(id, obj, scope = "global");`：添加控件实例，global是命名空间。

`UI.remove(id, scope = 'global');`：移除控件实例。

`UI.get(id, scope = 'global')`：通过id和命名空间获取控件实例。

`UI.create(config)`：通过json对象创建页面，json中的元素可以是带xtype的对象或控件实例。xtype必须事先注册。

## 示例

```javascript
// 自定义控件
function Div(options = {}) {
    XType.Control.call(this, options);
}

Div.prototype = Object.create(XType.Control.prototype);
Div.prototype.constructor = Div;

Div.prototype.render = function () {
    // 通过createElement或createElementNS创建dom或svg
    this.dom = document.createElement('div');
    this.parent.appendChild(this.dom);

    // 属性，通过setAttribute给节点赋值
    if (this.attr) {
        Object.keys(this.attr).forEach(n => {
            this.dom.setAttribute(n, this.attr[n]);
        });
    }

    // 数据，直接赋值给dom
    if (this.data) {
        Object.assign(this.dom, this.data);
    }

    // 样式，赋值给dom.style
    if (this.style) {
        Object.assign(this.dom.style, this.style);
    }

    // 监听器，赋值给dom
    if (this.listeners) {
        Object.assign(this.dom, this.listeners);
    }

    // 渲染子节点
    this.children.forEach(n => {
        var control = UI.create(n);
        control.parent = this.dom;
        control.render();
    });
};

// 注册xtype
UI.addXType('div', Div);

// 渲染自定义控件
var control = UI.create({
    xtype: 'div',
    id: 'div1',
    parent: document.body,
    style: {
        width: '100px',
        height: '100px',
        backgroundColor: '#f00'
    },
    listeners: {
        onclick: () => {
            alert('You clicked!');
        }
    }
});
control.render();
```

## 链接

源码：https://github.com/tengge1/xtype.js