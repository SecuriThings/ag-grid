/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.0.2
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CssClassManager {
    constructor(getGui) {
        // to minimise DOM hits, we only apply CSS classes if they have changed. as adding a CSS class that is already
        // there, or removing one that wasn't present, all takes CPU.
        this.cssClassStates = {};
        this.getGui = getGui;
    }
    addCssClass(className) {
        const list = (className || '').split(' ');
        if (list.length > 1) {
            list.forEach(cls => this.addCssClass(cls));
            return;
        }
        const updateNeeded = this.cssClassStates[className] !== true;
        if (updateNeeded && className.length) {
            this.getGui().classList.add(className);
            this.cssClassStates[className] = true;
        }
    }
    removeCssClass(className) {
        const list = (className || '').split(' ');
        if (list.length > 1) {
            list.forEach(cls => this.removeCssClass(cls));
            return;
        }
        const updateNeeded = this.cssClassStates[className] !== false;
        if (updateNeeded && className.length) {
            this.getGui().classList.remove(className);
            this.cssClassStates[className] = false;
        }
    }
    containsCssClass(className) {
        return this.getGui().classList.contains(className);
    }
    addOrRemoveCssClass(className, addOrRemove) {
        if (!className) {
            return;
        }
        // we check for spaces before doing the split, as doing the split
        // created a performance problem (on windows only, see AG-6765)
        if (className.indexOf(' ') >= 0) {
            const list = (className || '').split(' ');
            if (list.length > 1) {
                list.forEach(cls => this.addOrRemoveCssClass(cls, addOrRemove));
                return;
            }
        }
        const updateNeeded = this.cssClassStates[className] !== addOrRemove;
        if (updateNeeded && className.length) {
            this.getGui().classList.toggle(className, addOrRemove);
            this.cssClassStates[className] = addOrRemove;
        }
    }
}
exports.CssClassManager = CssClassManager;
