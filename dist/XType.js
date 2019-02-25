(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.XType = {})));
}(this, (function (exports) { 'use strict';

	var ID = -1;

	/**
	 * 所有控件基类
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Control(options = {}) {
	    this.parent = options.parent || document.body;
	    this._id = options.id || this.constructor.name + ID--;
	    this._scope = options.scope || 'global';

	    this.children = options.children || [];
	    this.html = options.html || null;

	    this.attr = options.attr || null; // 控件属性(setAttribute)
	    this.prop = options.prop || null; // 控件属性(使用等号赋值)
	    this.cls = options.cls || null; // class属性
	    this.style = options.style || null; // 控件样式
	    this.listeners = options.listeners || null; // 监听器
	    this.data = options.data || null; // 自定义数据

	    this.manager = null; // Manager.create时自动赋值
	}

	Object.defineProperties(Control.prototype, {
	    /**
	     * 控件id
	     */
	    id: {
	        get: function () {
	            return this._id;
	        },
	        set: function (id) {
	            console.warn(`Control: It is not allowed to assign new value to id.`);
	            this._id = id;
	        }
	    },

	    /**
	     * 命名空间
	     */
	    scope: {
	        get: function () {
	            return this._scope;
	        },
	        set: function (scope) {
	            console.warn(`Control: It is not allowed to assign new value to scope.`);
	            this._scope = scope;
	        }
	    }
	});

	/**
	 * 添加子控件
	 * @param {*} obj 
	 */
	Control.prototype.add = function (obj) {
	    this.children.push(obj);
	};

	/**
	 * 插入子控件
	 * @param {*} index 
	 * @param {*} obj 
	 */
	Control.prototype.insert = function (index, obj) {
	    this.children.splice(index, 0, obj);
	};

	/**
	 * 移除子控件
	 * @param {*} obj 
	 */
	Control.prototype.remove = function (obj) {
	    var index = this.children.indexOf(obj);
	    if (index > -1) {
	        this.children[index].manager = null;
	        this.children.splice(index, 1);
	    }
	};

	/**
	 * 渲染控件
	 */
	Control.prototype.render = function () {
	    this.children.forEach(n => {
	        var obj = this.manager.create(n);
	        obj.parent = this.parent;
	        obj.render();
	    });
	};

	/**
	 * 创建元素
	 * @param {*} tag 标签
	 */
	Control.prototype.createElement = function (tag) {
	    return document.createElement(tag);
	};

	/**
	 * 渲染dom，将dom添加到父dom并给dom赋值，然后循环渲染子dom
	 * @param {*} dom 
	 */
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
	        var control = this.manager.create(n);
	        control.parent = this.dom;
	        control.render();
	    });
	};

	/**
	 * 清空控件（可调用render函数重新渲染）
	 */
	Control.prototype.clear = function () {
	    (function remove(items) {
	        if (items == null || items.length === 0) {
	            return;
	        }

	        items.forEach(n => {
	            if (n.id) {
	                this.manager.remove(n.id, n.scope);
	            }
	            if (n.listeners) {
	                Object.keys(n.listeners).forEach(m => {
	                    if (n.dom) {
	                        n.dom['on' + m] = null;
	                    }
	                });
	            }
	            remove(n.children);
	        });
	    })(this.children);

	    this.children.length = 0;

	    if (this.dom) {
	        this.parent.removeChild(this.dom);

	        if (this.listeners) {
	            this.listeners.forEach(n => {
	                this.dom['on' + n] = null;
	            });
	        }

	        this.dom = null;
	    }
	};

	/**
	 * 摧毁控件
	 */
	Control.prototype.destroy = function () {
	    this.clear();
	    if (this.parent) {
	        this.parent = null;
	    }
	    if (this.id) {
	        this.manager.remove(this._id, this._scope);
	    }
	    this.manager = null;
	};

	const svgNS = 'http://www.w3.org/2000/svg';
	const xlinkNS = "http://www.w3.org/1999/xlink";

	/**
	 * SVG控件
	 * @param {*} options 选项
	 */
	function SvgControl(options = {}) {
	    Control.call(this, options);
	}

	SvgControl.prototype = Object.create(Control.prototype);
	SvgControl.prototype.constructor = SvgControl;

	SvgControl.prototype.createElement = function (tag) {
	    return document.createElementNS(svgNS, tag);
	};

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

	/**
	 * Manager类
	 * @author tengge / https://github.com/tengge1
	 */
	function Manager() {
	    this.xtypes = {};
	    this.objects = {};
	}

	/**
	 * 添加xtype
	 * @param {*} name xtype字符串
	 * @param {*} cls xtype对应类
	 */
	Manager.prototype.addXType = function (name, cls) {
	    if (this.xtypes[name] === undefined) {
	        this.xtypes[name] = cls;
	    } else {
	        console.warn(`Manager: xtype named ${name} has already been added.`);
	    }
	};

	/**
	 * 删除xtype
	 * @param {*} name xtype字符串
	 */
	Manager.prototype.removeXType = function (name) {
	    if (this.xtypes[name] !== undefined) {
	        delete this.xtypes[name];
	    } else {
	        console.warn(`Manager: xtype named ${name} is not defined.`);
	    }
	};

	/**
	 * 获取xtype
	 * @param {*} name xtype字符串
	 */
	Manager.prototype.getXType = function (name) {
	    if (this.xtypes[name] === undefined) {
	        console.warn(`Manager: xtype named ${name} is not defined.`);
	    }
	    return this.xtypes[name];
	};

	/**
	 * 添加一个对象到缓存
	 * @param {*} id 对象id
	 * @param {*} obj 对象
	 * @param {*} scope 对象作用域（默认为global）
	 */
	Manager.prototype.add = function (id, obj, scope = "global") {
	    var key = `${scope}:${id}`;
	    if (this.objects[key] !== undefined) {
	        console.warn(`Manager: object named ${id} has already been added.`);
	    }

	    obj.manager = this;
	    this.objects[key] = obj;
	};

	/**
	 * 从缓存中移除一个对象
	 * @param {*} id 对象id
	 * @param {*} scope 对象作用域（默认为global）
	 */
	Manager.prototype.remove = function (id, scope = 'global') {
	    var key = `${scope}:${id}`;
	    if (this.objects[key] != undefined) {
	        this.objects[key].manager = null;
	        delete this.objects[key];
	    } else {
	        console.warn(`Manager: object named ${id} is not defined.`);
	    }
	};

	/**
	 * 从缓存中获取一个对象
	 * @param {*} id 控件id
	 * @param {*} scope 对象作用域（默认为global）
	 */
	Manager.prototype.get = function (id, scope = 'global') {
	    var key = `${scope}:${id}`;
	    return this.objects[key];
	};

	/**
	 * 通过json配置创建Control实例，并自动将包含id的控件添加到缓存
	 * @param {*} config xtype配置
	 */
	Manager.prototype.create = function (config) {
	    if (config instanceof Control) { // config是Control实例

	        this.add(config.id, config, config.scope);
	        return config;
	    }

	    // config是json配置
	    if (config == null || config.xtype == null) {
	        console.warn('Manager: config is undefined.');
	    }

	    if (config.xtype === undefined) {
	        console.warn('Manager: config.xtype is undefined.');
	    }

	    var cls = this.xtypes[config.xtype];
	    if (cls == null) {
	        console.warn(`Manager: xtype named ${config.xtype} is undefined.`);
	    }

	    var control = new cls(config);

	    this.add(control.id, control, control.scope);

	    return control;
	};

	exports.Control = Control;
	exports.SvgControl = SvgControl;
	exports.Manager = Manager;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
