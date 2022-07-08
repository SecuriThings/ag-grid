/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.0.2
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, PreConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { NumberSequence } from "../utils";
import { isNodeOrElement, copyNodeList, iterateNamedNodeMap, loadTemplate, setVisible, setDisplayed } from '../utils/dom';
import { getFunctionName } from '../utils/function';
import { CustomTooltipFeature } from "./customTooltipFeature";
import { CssClassManager } from "../rendering/cssClassManager";
const compIdSequence = new NumberSequence();
export class Component extends BeanStub {
    constructor(template) {
        super();
        // if false, then CSS class "ag-hidden" is applied, which sets "display: none"
        this.displayed = true;
        // if false, then CSS class "ag-invisible" is applied, which sets "visibility: hidden"
        this.visible = true;
        // unique id for this row component. this is used for getting a reference to the HTML dom.
        // we cannot use the RowNode id as this is not unique (due to animation, old rows can be lying
        // around as we create a new rowComp instance for the same row node).
        this.compId = compIdSequence.next();
        this.cssClassManager = new CssClassManager(() => this.eGui);
        if (template) {
            this.setTemplate(template);
        }
    }
    preConstructOnComponent() {
        this.usingBrowserTooltips = this.gridOptionsWrapper.isEnableBrowserTooltips();
    }
    getCompId() {
        return this.compId;
    }
    getTooltipParams() {
        return {
            value: this.tooltipText,
            location: 'UNKNOWN'
        };
    }
    setTooltip(newTooltipText) {
        const removeTooltip = () => {
            if (this.usingBrowserTooltips) {
                this.getGui().removeAttribute('title');
            }
            else {
                this.tooltipFeature = this.destroyBean(this.tooltipFeature);
            }
        };
        const addTooltip = () => {
            if (this.usingBrowserTooltips) {
                this.getGui().setAttribute('title', this.tooltipText);
            }
            else {
                this.tooltipFeature = this.createBean(new CustomTooltipFeature(this));
            }
        };
        if (this.tooltipText != newTooltipText) {
            if (this.tooltipText) {
                removeTooltip();
            }
            if (newTooltipText != null) {
                this.tooltipText = newTooltipText;
                if (this.tooltipText) {
                    addTooltip();
                }
            }
        }
    }
    // for registered components only, eg creates AgCheckbox instance from ag-checkbox HTML tag
    createChildComponentsFromTags(parentNode, paramsMap) {
        // we MUST take a copy of the list first, as the 'swapComponentForNode' adds comments into the DOM
        // which messes up the traversal order of the children.
        const childNodeList = copyNodeList(parentNode.childNodes);
        childNodeList.forEach(childNode => {
            if (!(childNode instanceof HTMLElement)) {
                return;
            }
            const childComp = this.createComponentFromElement(childNode, childComp => {
                // copy over all attributes, including css classes, so any attributes user put on the tag
                // wll be carried across
                const childGui = childComp.getGui();
                if (childGui) {
                    this.copyAttributesFromNode(childNode, childComp.getGui());
                }
            }, paramsMap);
            if (childComp) {
                if (childComp.addItems && childNode.children.length) {
                    this.createChildComponentsFromTags(childNode, paramsMap);
                    // converting from HTMLCollection to Array
                    const items = Array.prototype.slice.call(childNode.children);
                    childComp.addItems(items);
                }
                // replace the tag (eg ag-checkbox) with the proper HTMLElement (eg 'div') in the dom
                this.swapComponentForNode(childComp, parentNode, childNode);
            }
            else if (childNode.childNodes) {
                this.createChildComponentsFromTags(childNode, paramsMap);
            }
        });
    }
    createComponentFromElement(element, afterPreCreateCallback, paramsMap) {
        const key = element.nodeName;
        const componentParams = paramsMap ? paramsMap[element.getAttribute('ref')] : undefined;
        const ComponentClass = this.agStackComponentsRegistry.getComponentClass(key);
        if (ComponentClass) {
            Component.elementGettingCreated = element;
            const newComponent = new ComponentClass(componentParams);
            newComponent.setParentComponent(this);
            this.createBean(newComponent, null, afterPreCreateCallback);
            return newComponent;
        }
        return null;
    }
    copyAttributesFromNode(source, dest) {
        iterateNamedNodeMap(source.attributes, (name, value) => dest.setAttribute(name, value));
    }
    swapComponentForNode(newComponent, parentNode, childNode) {
        const eComponent = newComponent.getGui();
        parentNode.replaceChild(eComponent, childNode);
        parentNode.insertBefore(document.createComment(childNode.nodeName), eComponent);
        this.addDestroyFunc(this.destroyBean.bind(this, newComponent));
        this.swapInComponentForQuerySelectors(newComponent, childNode);
    }
    swapInComponentForQuerySelectors(newComponent, childNode) {
        const thisNoType = this;
        this.iterateOverQuerySelectors((querySelector) => {
            if (thisNoType[querySelector.attributeName] === childNode) {
                thisNoType[querySelector.attributeName] = newComponent;
            }
        });
    }
    iterateOverQuerySelectors(action) {
        let thisPrototype = Object.getPrototypeOf(this);
        while (thisPrototype != null) {
            const metaData = thisPrototype.__agComponentMetaData;
            const currentProtoName = getFunctionName(thisPrototype.constructor);
            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].querySelectors) {
                metaData[currentProtoName].querySelectors.forEach((querySelector) => action(querySelector));
            }
            thisPrototype = Object.getPrototypeOf(thisPrototype);
        }
    }
    setTemplate(template, paramsMap) {
        const eGui = loadTemplate(template);
        this.setTemplateFromElement(eGui, paramsMap);
    }
    setTemplateFromElement(element, paramsMap) {
        this.eGui = element;
        this.eGui.__agComponent = this;
        this.wireQuerySelectors();
        // context will not be available when user sets template in constructor
        if (!!this.getContext()) {
            this.createChildComponentsFromTags(this.getGui(), paramsMap);
        }
    }
    createChildComponentsPreConstruct() {
        // ui exists if user sets template in constructor. when this happens, we have to wait for the context
        // to be autoWired first before we can create child components.
        if (!!this.getGui()) {
            this.createChildComponentsFromTags(this.getGui());
        }
    }
    wireQuerySelectors() {
        if (!this.eGui) {
            return;
        }
        const thisNoType = this;
        this.iterateOverQuerySelectors((querySelector) => {
            const setResult = (result) => thisNoType[querySelector.attributeName] = result;
            // if it's a ref selector, and match is on top level component, we return
            // the element. otherwise no way of components putting ref=xxx on the top
            // level element as querySelector only looks at children.
            const topLevelRefMatch = querySelector.refSelector
                && this.eGui.getAttribute('ref') === querySelector.refSelector;
            if (topLevelRefMatch) {
                setResult(this.eGui);
            }
            else {
                // otherwise use querySelector, which looks at children
                const resultOfQuery = this.eGui.querySelector(querySelector.querySelector);
                if (resultOfQuery) {
                    setResult(resultOfQuery.__agComponent || resultOfQuery);
                }
            }
        });
    }
    getGui() {
        return this.eGui;
    }
    getFocusableElement() {
        return this.eGui;
    }
    setParentComponent(component) {
        this.parentComponent = component;
    }
    getParentComponent() {
        return this.parentComponent;
    }
    // this method is for older code, that wants to provide the gui element,
    // it is not intended for this to be in ag-Stack
    setGui(eGui) {
        this.eGui = eGui;
    }
    queryForHtmlElement(cssSelector) {
        return this.eGui.querySelector(cssSelector);
    }
    queryForHtmlInputElement(cssSelector) {
        return this.eGui.querySelector(cssSelector);
    }
    appendChild(newChild, container) {
        if (!container) {
            container = this.eGui;
        }
        if (newChild == null) {
            return;
        }
        if (isNodeOrElement(newChild)) {
            container.appendChild(newChild);
        }
        else {
            const childComponent = newChild;
            container.appendChild(childComponent.getGui());
            this.addDestroyFunc(this.destroyBean.bind(this, childComponent));
        }
    }
    isDisplayed() {
        return this.displayed;
    }
    setVisible(visible) {
        if (visible !== this.visible) {
            this.visible = visible;
            setVisible(this.eGui, visible);
        }
    }
    setDisplayed(displayed) {
        if (displayed !== this.displayed) {
            this.displayed = displayed;
            setDisplayed(this.eGui, displayed);
            const event = {
                type: Component.EVENT_DISPLAYED_CHANGED,
                visible: this.displayed
            };
            this.dispatchEvent(event);
        }
    }
    destroy() {
        if (this.tooltipFeature) {
            this.tooltipFeature = this.destroyBean(this.tooltipFeature);
        }
        super.destroy();
    }
    addGuiEventListener(event, listener) {
        this.eGui.addEventListener(event, listener);
        this.addDestroyFunc(() => this.eGui.removeEventListener(event, listener));
    }
    addCssClass(className) {
        this.cssClassManager.addCssClass(className);
    }
    removeCssClass(className) {
        this.cssClassManager.removeCssClass(className);
    }
    containsCssClass(className) {
        return this.cssClassManager.containsCssClass(className);
    }
    addOrRemoveCssClass(className, addOrRemove) {
        this.cssClassManager.addOrRemoveCssClass(className, addOrRemove);
    }
    getAttribute(key) {
        const { eGui } = this;
        return eGui ? eGui.getAttribute(key) : null;
    }
    getRefElement(refName) {
        return this.queryForHtmlElement(`[ref="${refName}"]`);
    }
}
Component.EVENT_DISPLAYED_CHANGED = 'displayedChanged';
__decorate([
    Autowired('agStackComponentsRegistry')
], Component.prototype, "agStackComponentsRegistry", void 0);
__decorate([
    PreConstruct
], Component.prototype, "preConstructOnComponent", null);
__decorate([
    PreConstruct
], Component.prototype, "createChildComponentsPreConstruct", null);
