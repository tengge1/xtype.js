import Control from './Control';

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

    if (this.cls) {
        this.dom.className = this.cls;
    }

    if (this.data) {
        Object.assign(this.dom, this.data);
    }

    if (this.style) {
        Object.assign(this.dom.style, this.style);
    }

    if (this.listeners) {
        Object.keys(this.listeners).forEach(n => {
            this.dom['on' + n] = this.listeners[n];
        });
    }

    if (this.userData) {
        this.dom.userData = {};
        Object.assign(this.dom.userData, this.userData);
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

export default SvgControl;