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

    this.attr = options.attr || null; // 控件属性
    this.cls = options.cls || null; // class属性
    this.data = options.data || null; // 控件数据
    this.style = options.style || null; // 控件样式
    this.listeners = options.listeners || null; // 监听器
    this.userData = options.userData || null; // 自定义数据

    UI.add(this._id, this, this._scope);
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
        this.children.splice(index, 1);
    }
};

/**
 * 渲染控件
 */
Control.prototype.render = function () {
    this.children.forEach(n => {
        var obj = UI.create(n);
        obj.parent = this.parent;
        obj.render();
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
                UI.remove(n.id, n.scope);
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
        UI.remove(this._id, this._scope);
    }
};

export default Control;