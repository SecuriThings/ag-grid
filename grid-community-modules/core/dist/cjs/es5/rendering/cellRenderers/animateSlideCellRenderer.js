"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimateSlideCellRenderer = void 0;
var context_1 = require("../../context/context");
var component_1 = require("../../widgets/component");
var dom_1 = require("../../utils/dom");
var generic_1 = require("../../utils/generic");
var AnimateSlideCellRenderer = /** @class */ (function (_super) {
    __extends(AnimateSlideCellRenderer, _super);
    function AnimateSlideCellRenderer() {
        var _this = _super.call(this) || this;
        _this.refreshCount = 0;
        var template = document.createElement('span');
        var slide = document.createElement('span');
        slide.setAttribute('class', 'ag-value-slide-current');
        template.appendChild(slide);
        _this.setTemplateFromElement(template);
        _this.eCurrent = _this.queryForHtmlElement('.ag-value-slide-current');
        return _this;
    }
    AnimateSlideCellRenderer.prototype.init = function (params) {
        this.refresh(params, true);
    };
    AnimateSlideCellRenderer.prototype.addSlideAnimation = function () {
        var _this = this;
        this.refreshCount++;
        // below we keep checking this, and stop working on the animation
        // if it no longer matches - this means another animation has started
        // and this one is stale.
        var refreshCountCopy = this.refreshCount;
        // if old animation, remove it
        if (this.ePrevious) {
            this.getGui().removeChild(this.ePrevious);
        }
        var prevElement = document.createElement('span');
        prevElement.setAttribute('class', 'ag-value-slide-previous ag-value-slide-out');
        this.ePrevious = prevElement;
        this.ePrevious.textContent = this.eCurrent.textContent;
        this.getGui().insertBefore(this.ePrevious, this.eCurrent);
        // having timeout of 0 allows use to skip to the next css turn,
        // so we know the previous css classes have been applied. so the
        // complex set of setTimeout below creates the animation
        this.getFrameworkOverrides().wrapIncoming(function () {
            window.setTimeout(function () {
                if (refreshCountCopy !== _this.refreshCount) {
                    return;
                }
                _this.ePrevious.classList.add('ag-value-slide-out-end');
            }, 50);
            window.setTimeout(function () {
                if (refreshCountCopy !== _this.refreshCount) {
                    return;
                }
                _this.getGui().removeChild(_this.ePrevious);
                _this.ePrevious = null;
            }, 3000);
        });
    };
    AnimateSlideCellRenderer.prototype.refresh = function (params, isInitialRender) {
        if (isInitialRender === void 0) { isInitialRender = false; }
        var value = params.value;
        if ((0, generic_1.missing)(value)) {
            value = '';
        }
        if (value === this.lastValue) {
            return false;
        }
        // we don't show the delta if we are in the middle of a filter. see comment on FilterManager
        // with regards processingFilterChange
        if (this.filterManager.isSuppressFlashingCellsBecauseFiltering()) {
            return false;
        }
        if (!isInitialRender) {
            this.addSlideAnimation();
        }
        this.lastValue = value;
        if ((0, generic_1.exists)(params.valueFormatted)) {
            this.eCurrent.textContent = params.valueFormatted;
        }
        else if ((0, generic_1.exists)(params.value)) {
            this.eCurrent.textContent = value;
        }
        else {
            (0, dom_1.clearElement)(this.eCurrent);
        }
        return true;
    };
    __decorate([
        (0, context_1.Autowired)('filterManager')
    ], AnimateSlideCellRenderer.prototype, "filterManager", void 0);
    return AnimateSlideCellRenderer;
}(component_1.Component));
exports.AnimateSlideCellRenderer = AnimateSlideCellRenderer;
