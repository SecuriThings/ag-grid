var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgMenuItemComponent, AgMenuList, Autowired, Bean, BeanStub, Component, ModuleNames, ModuleRegistry, Optional, PostConstruct } from "@ag-grid-community/core";
const CSS_MENU = 'ag-menu';
const CSS_CONTEXT_MENU_OPEN = 'ag-context-menu-open';
let ContextMenuFactory = class ContextMenuFactory extends BeanStub {
    hideActiveMenu() {
        this.destroyBean(this.activeMenu);
    }
    getMenuItems(node, column, value) {
        const defaultMenuOptions = [];
        if (_.exists(node) && ModuleRegistry.__isRegistered(ModuleNames.ClipboardModule, this.context.getGridId())) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                if (!this.gridOptionsService.get('suppressCutToClipboard')) {
                    defaultMenuOptions.push('cut');
                }
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'copyWithGroupHeaders', 'paste', 'separator');
            }
        }
        if (this.gridOptionsService.get('enableCharts') && ModuleRegistry.__isRegistered(ModuleNames.GridChartsModule, this.context.getGridId())) {
            if (this.columnModel.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }
            if (this.rangeService && !this.rangeService.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }
        if (_.exists(node)) {
            // if user clicks a cell
            const csvModuleMissing = !ModuleRegistry.__isRegistered(ModuleNames.CsvExportModule, this.context.getGridId());
            const excelModuleMissing = !ModuleRegistry.__isRegistered(ModuleNames.ExcelExportModule, this.context.getGridId());
            const suppressExcel = this.gridOptionsService.get('suppressExcelExport') || excelModuleMissing;
            const suppressCsv = this.gridOptionsService.get('suppressCsvExport') || csvModuleMissing;
            const onIPad = _.isIOSUserAgent();
            const anyExport = !onIPad && (!suppressExcel || !suppressCsv);
            if (anyExport) {
                defaultMenuOptions.push('export');
            }
        }
        const defaultItems = defaultMenuOptions.length ? defaultMenuOptions : undefined;
        const columnContextMenuItems = column === null || column === void 0 ? void 0 : column.getColDef().contextMenuItems;
        if (Array.isArray(columnContextMenuItems)) {
            return columnContextMenuItems;
        }
        else if (typeof columnContextMenuItems === 'function') {
            return columnContextMenuItems(this.gridOptionsService.addGridCommonParams({
                column, node, value, defaultItems
            }));
        }
        else {
            const userFunc = this.gridOptionsService.getCallback('getContextMenuItems');
            if (userFunc) {
                return userFunc({ column, node, value, defaultItems });
            }
            else {
                return defaultMenuOptions;
            }
        }
    }
    onContextMenu(mouseEvent, touchEvent, rowNode, column, value, anchorToElement) {
        this.menuUtils.onContextMenu(mouseEvent, touchEvent, (eventOrTouch) => this.showMenu(rowNode, column, value, eventOrTouch, anchorToElement));
    }
    showMenu(node, column, value, mouseEvent, anchorToElement) {
        const menuItems = this.getMenuItems(node, column, value);
        const eGridBodyGui = this.ctrlsService.getGridBodyCtrl().getGui();
        if (menuItems === undefined || _.missingOrEmpty(menuItems)) {
            return false;
        }
        const menu = new ContextMenu(menuItems, column, node, value);
        this.createBean(menu);
        const eMenuGui = menu.getGui();
        const positionParams = {
            column: column,
            rowNode: node,
            type: 'contextMenu',
            mouseEvent: mouseEvent,
            ePopup: eMenuGui,
            // move one pixel away so that accidentally double clicking
            // won't show the browser's contextmenu
            nudgeY: 1
        };
        const translate = this.localeService.getLocaleTextFunc();
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: () => {
                eGridBodyGui.classList.remove(CSS_CONTEXT_MENU_OPEN);
                this.destroyBean(menu);
            },
            click: mouseEvent,
            positionCallback: () => {
                const isRtl = this.gridOptionsService.get('enableRtl');
                this.popupService.positionPopupUnderMouseEvent(Object.assign(Object.assign({}, positionParams), { nudgeX: isRtl ? (eMenuGui.offsetWidth + 1) * -1 : 1 }));
            },
            // so when browser is scrolled down, or grid is scrolled, context menu stays with cell
            anchorToElement: anchorToElement,
            ariaLabel: translate('ariaLabelContextMenu', 'Context Menu')
        });
        if (addPopupRes) {
            eGridBodyGui.classList.add(CSS_CONTEXT_MENU_OPEN);
            menu.afterGuiAttached({ container: 'contextMenu', hidePopup: addPopupRes.hideFunc });
        }
        // there should never be an active menu at this point, however it was found
        // that you could right click a second time just 1 or 2 pixels from the first
        // click, and another menu would pop up. so somehow the logic for closing the
        // first menu (clicking outside should close it) was glitchy somehow. an easy
        // way to avoid this is just remove the old context menu here if it exists.
        if (this.activeMenu) {
            this.hideActiveMenu();
        }
        this.activeMenu = menu;
        menu.addEventListener(BeanStub.EVENT_DESTROYED, () => {
            if (this.activeMenu === menu) {
                this.activeMenu = null;
            }
        });
        // hide the popup if something gets selected
        if (addPopupRes) {
            menu.addEventListener(AgMenuItemComponent.EVENT_CLOSE_MENU, addPopupRes.hideFunc);
        }
        return true;
    }
};
__decorate([
    Autowired('popupService')
], ContextMenuFactory.prototype, "popupService", void 0);
__decorate([
    Optional('rangeService')
], ContextMenuFactory.prototype, "rangeService", void 0);
__decorate([
    Autowired('ctrlsService')
], ContextMenuFactory.prototype, "ctrlsService", void 0);
__decorate([
    Autowired('columnModel')
], ContextMenuFactory.prototype, "columnModel", void 0);
__decorate([
    Autowired('menuUtils')
], ContextMenuFactory.prototype, "menuUtils", void 0);
ContextMenuFactory = __decorate([
    Bean('contextMenuFactory')
], ContextMenuFactory);
export { ContextMenuFactory };
class ContextMenu extends Component {
    constructor(menuItems, column, node, value) {
        super(/* html */ `<div class="${CSS_MENU}" role="presentation"></div>`);
        this.menuItems = menuItems;
        this.column = column;
        this.node = node;
        this.value = value;
        this.menuList = null;
        this.focusedCell = null;
    }
    addMenuItems() {
        const menuList = this.createManagedBean(new AgMenuList(0, {
            column: this.column,
            node: this.node,
            value: this.value
        }));
        const menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null, () => this.getGui());
        menuList.addMenuItems(menuItemsMapped);
        this.appendChild(menuList);
        this.menuList = menuList;
        menuList.addEventListener(AgMenuItemComponent.EVENT_CLOSE_MENU, (e) => this.dispatchEvent(e));
    }
    afterGuiAttached(params) {
        if (params.hidePopup) {
            this.addDestroyFunc(params.hidePopup);
        }
        this.focusedCell = this.focusService.getFocusedCell();
        if (this.menuList) {
            this.focusService.focusInto(this.menuList.getGui());
        }
    }
    restoreFocusedCell() {
        const currentFocusedCell = this.focusService.getFocusedCell();
        if (currentFocusedCell && this.focusedCell && this.cellPositionUtils.equals(currentFocusedCell, this.focusedCell)) {
            const { rowIndex, rowPinned, column } = this.focusedCell;
            const doc = this.gridOptionsService.getDocument();
            if (doc.activeElement === doc.body) {
                this.focusService.setFocusedCell({ rowIndex, column, rowPinned, forceBrowserFocus: true });
            }
        }
    }
    destroy() {
        this.restoreFocusedCell();
        super.destroy();
    }
}
__decorate([
    Autowired('menuItemMapper')
], ContextMenu.prototype, "menuItemMapper", void 0);
__decorate([
    Autowired('focusService')
], ContextMenu.prototype, "focusService", void 0);
__decorate([
    Autowired('cellPositionUtils')
], ContextMenu.prototype, "cellPositionUtils", void 0);
__decorate([
    PostConstruct
], ContextMenu.prototype, "addMenuItems", null);
