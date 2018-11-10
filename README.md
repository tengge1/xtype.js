# xtype.js

渐进式开发框架xtype.js，使用js代替html，对svg同样适用。

```javascript
const UI = new Manager();
const SVG = new Manager();
```

## 原理

通过js创建dom，并将属性、样式和事件赋值给dom。

xtype.js并未实现任何属性或事件，仅提供xtype和控件实例管理。

## 安装

通过npm，

```bash
npm install @tengge1/xtype.js
```

直接下载，

[XType.js](dist/XType.js)

## API

### XType.Control

控件基类，所有其他控件都应该继承该类。

**使用方法：**

```javascript
// 自定义控件
function CustomControl(options = {}) {
    XType.Control.call(this, options);
}

CustomControl.prototype = Object.create(XType.Control.prototype);
CustomControl.prototype.constructor = CustomControl;

CustomControl.prototype.render = function () {
    // 自定义渲染函数
};

// 注册xtype
UI.addXType('customxtype', CustomControl);
```

**options参数**

* id: 自定义id，不可更改，可选。
* scope: 命名空间，不可更改，可选。
* parent: 父控件`dom`，默认`document.body`。
* children: 子元素列表。子元素可为xtype对象或控件。
* html: `dom`的`innerHTML`属性。如果同时存在`children`属性，优先使用`children`。
* attr: 属性，通过`setAttribute`给`dom`赋值。
* prop: `dom`属性，通过`Object.assign`给`dom`赋值。
* cls: `dom`的`class`属性。
* style: `dom`样式，使用`Object.assign`给`dom.style`赋值。
* listeners: 监听器，使用`Object.assign`给`dom`赋值，前面不带`on`。
* data: 自定义数据，使用`Object.assign`给`dom.data`赋值。

**创建要素帮助函数**

```javascript
// html
Control.prototype.createElement = function (tag) {
    return document.createElement(tag);
};

// svg
const xlinkNS = "http://www.w3.org/1999/xlink";

SvgControl.prototype.createElement = function (tag) {
    return document.createElementNS(svgNS, tag);
};
```

**渲染dom帮助函数**

xtype.js提供了渲染帮助函数，方便渲染函数编写。

```javascript
// html
Control.prototype.renderDom = function (dom) {
    this.dom = dom;
    this.parent.appendChild(this.dom);

    // 属性，通过setAttribute给节点赋值
    if (this.attr) {
        Object.keys(this.attr).forEach(n => {
            this.dom.setAttribute(n, this.attr[n]);
        });
    }

    // 属性，直接赋值给dom
    if (this.prop) {
        Object.assign(this.dom, this.prop);
    }

    // class属性
    if (this.cls) {
        this.dom.className = this.cls;
    }

    // 样式，赋值给dom.style
    if (this.style) {
        Object.assign(this.dom.style, this.style);
    }

    // 监听器，赋值给dom
    if (this.listeners) {
        Object.keys(this.listeners).forEach(n => {
            this.dom['on' + n] = this.listeners[n];
        });
    }

    // 自定义数据，赋值给dom.data
    if (this.data) {
        this.dom.data = {};
        Object.assign(this.dom.data, this.data);
    }

    // innerHTML属性
    if (this.html) {
        this.dom.innerHTML = this.html;
    }

    // 渲染子节点
    this.children.forEach(n => {
        var control = window.UI.create(n);
        control.parent = this.dom;
        control.render();
    });
};

// svg
const xlinkNS = "http://www.w3.org/1999/xlink";

SvgControl.prototype.renderDom = function (dom) {
    this.dom = dom;
    this.parent.appendChild(this.dom);

    if (this.attr) {
        Object.keys(this.attr).forEach(n => {
            if (n.startsWith('xlink')) {
                this.dom.setAttributeNS(xlinkNS, n, this.attr[n]);
            } else {
                this.dom.setAttribute(n, this.attr[n]);
            }
        });
    }

    if (this.prop) {
        Object.assign(this.dom, this.prop);
    }

    if (this.cls) {
        this.dom.className = this.cls;
    }

    if (this.style) {
        Object.assign(this.dom.style, this.style);
    }

    if (this.listeners) {
        Object.keys(this.listeners).forEach(n => {
            this.dom['on' + n] = this.listeners[n];
        });
    }

    if (this.data) {
        this.dom.data = {};
        Object.assign(this.dom.data, this.data);
    }

    if (this.html) {
        this.dom.innerHTML = this.html;
    }

    this.children.forEach(n => {
        var control = this.manager.create(n);
        control.parent = this.dom;
        control.render();
    });
};
```

自定义控件的渲染函数通常可写作：

```javascript
CustomControl.prototype.render = function () {
    this.renderDom(this.createElement('div')); // div可以换成任何tag
};
```

### XType.Manager

`Manager`：用于xtype注册、控件的创建和管理。

`Manager.addXType(name, cls)`：将控件类型注册为xtype，例如`Manager.addXType('html', Html)`。

`Manager.removeXType(name)`：移除控件xtype。

`Manager.getXType(name)`：通过xtype获取控件类型

`Manager.add(id, obj, scope = "global");`：添加控件实例，global是命名空间。

`Manager.remove(id, scope = 'global');`：移除控件实例。

`Manager.get(id, scope = 'global')`：通过id和命名空间获取控件实例。

`Manager.create(config)`：通过json对象创建页面，json中的元素可以是带xtype的对象或控件实例。xtype必须事先注册。

## 示例

**html示例**

```javascript
// 创建管理器
var UI = new XType.Manager();

// 自定义控件
function Div(options = {}) {
    XType.Control.call(this, options);
}

Div.prototype = Object.create(XType.Control.prototype);
Div.prototype.constructor = Div;

Div.prototype.render = function () {
    var dom = this.createElement('div');
    this.renderDom(dom);
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
        click: () => {
            alert('You clicked!');
        }
    }
});
control.render();
```

**svg示例**

```javascript
// 创建管理器
var SVG = new XType.Manager();

// SVG文档
function SvgDom(options = {}) {
    XType.SvgControl.call(this, options);
}

SvgDom.prototype = Object.create(XType.SvgControl.prototype);
SvgDom.prototype.constructor = SvgDom;

SvgDom.prototype.render = function () {
    var dom = this.createElement('svg');
    this.renderDom(dom);
};

SVG.addXType('dom', SvgDom);

// SVG圆
function SvgCircle(options = {}) {
    XType.SvgControl.call(this, options);
}

SvgCircle.prototype = Object.create(XType.SvgControl.prototype);
SvgCircle.prototype.constructor = SvgCircle;

SvgCircle.prototype.render = function () {
    var dom = this.createElement('circle');
    this.renderDom(dom);
};

SVG.addXType('circle', SvgCircle);

// 渲染svg文档
var dom = SVG.create({
    xtype: 'dom',
    id: 'dom1',
    attr: {
        width: 800,
        height: 600,
    },
    parent: document.body,
    children: [{
        xtype: 'circle',
        attr: {
            cx: 100,
            cy: 100,
            r: 40,
            fill: '#f00',
            stroke: '#000',
            'stroke-width': 2
        },
        listeners: {
            click: () => {
                alert('You clicked');
            }
        }
    }]
});

dom.render();
```

## 链接

源码：https://github.com/tengge1/xtype.js