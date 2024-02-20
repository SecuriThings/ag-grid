"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnAnimationService = void 0;
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
let ColumnAnimationService = class ColumnAnimationService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.executeNextFuncs = [];
        this.executeLaterFuncs = [];
        this.active = false;
        this.suppressAnimation = false;
        this.animationThreadCount = 0;
    }
    postConstruct() {
        this.ctrlsService.whenReady(p => this.gridBodyCtrl = p.gridBodyCtrl);
    }
    isActive() {
        return this.active && !this.suppressAnimation;
    }
    setSuppressAnimation(suppress) {
        this.suppressAnimation = suppress;
    }
    start() {
        if (this.active) {
            return;
        }
        if (this.gridOptionsService.get('suppressColumnMoveAnimation')) {
            return;
        }
        // if doing RTL, we don't animate open / close as due to how the pixels are inverted,
        // the animation moves all the row the the right rather than to the left (ie it's the static
        // columns that actually get their coordinates updated)
        if (this.gridOptionsService.get('enableRtl')) {
            return;
        }
        this.ensureAnimationCssClassPresent();
        this.active = true;
    }
    finish() {
        if (!this.active) {
            return;
        }
        this.flush(() => { this.active = false; });
    }
    executeNextVMTurn(func) {
        if (this.active) {
            this.executeNextFuncs.push(func);
        }
        else {
            func();
        }
    }
    executeLaterVMTurn(func) {
        if (this.active) {
            this.executeLaterFuncs.push(func);
        }
        else {
            func();
        }
    }
    ensureAnimationCssClassPresent() {
        // up the count, so we can tell if someone else has updated the count
        // by the time the 'wait' func executes
        this.animationThreadCount++;
        const animationThreadCountCopy = this.animationThreadCount;
        this.gridBodyCtrl.setColumnMovingCss(true);
        this.executeLaterFuncs.push(() => {
            // only remove the class if this thread was the last one to update it
            if (this.animationThreadCount === animationThreadCountCopy) {
                this.gridBodyCtrl.setColumnMovingCss(false);
            }
        });
    }
    flush(callback) {
        if (this.executeNextFuncs.length === 0 && this.executeLaterFuncs.length === 0) {
            callback();
            return;
        }
        const runFuncs = (queue) => {
            while (queue.length) {
                const func = queue.pop();
                if (func) {
                    func();
                }
            }
        };
        this.getFrameworkOverrides().wrapIncoming(() => {
            window.setTimeout(() => runFuncs(this.executeNextFuncs), 0);
            window.setTimeout(() => {
                runFuncs(this.executeLaterFuncs);
                callback();
            }, 200);
        });
    }
};
__decorate([
    (0, context_1.Autowired)('ctrlsService')
], ColumnAnimationService.prototype, "ctrlsService", void 0);
__decorate([
    context_1.PostConstruct
], ColumnAnimationService.prototype, "postConstruct", null);
ColumnAnimationService = __decorate([
    (0, context_1.Bean)('columnAnimationService')
], ColumnAnimationService);
exports.ColumnAnimationService = ColumnAnimationService;
