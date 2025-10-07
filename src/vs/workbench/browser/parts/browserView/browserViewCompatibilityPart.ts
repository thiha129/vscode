/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BrowserViewPart, IBrowserView } from './browserViewPart.js';
import { IEditorGroupView, IEditorSideGroup } from '../editor/editor.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';

// Mock IEditorGroupView for compatibility
class MockEditorGroupView implements IEditorGroupView {
	readonly id = 1;
	readonly scopedContextKeyService = this.browserViewPart.scopedContextKeyService;
	readonly scopedInstantiationService = this.browserViewPart.scopedInstantiationService;

	private readonly _onDidFocus = new Emitter<void>();
	readonly onDidFocus = this._onDidFocus.event;

	private readonly _onDidChangeActiveEditor = new Emitter<void>();
	readonly onDidChangeActiveEditor = this._onDidChangeActiveEditor.event;

	constructor(private readonly browserViewPart: BrowserViewPart) {}

	focus(): void {
		this._onDidFocus.fire();
	}

	dispose(): void {
		// No-op
	}
}

export class BrowserViewCompatibilityPart extends BrowserViewPart {
	private readonly mockGroupView: MockEditorGroupView;
	private readonly _onDidChangeActiveGroup = new Emitter<IEditorGroupView>();
	readonly onDidChangeActiveGroup = this._onDidChangeActiveGroup.event;

	get activePart(): BrowserViewCompatibilityPart {
		return this;
	}

	get sideGroup(): IEditorSideGroup {
		return this.mockGroupView as any;
	}

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
		@IConfigurationService configurationService: IConfigurationService,
		@IStorageService storageService: IStorageService,
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@IHostService hostService: IHostService,
		@IContextKeyService contextKeyService: IContextKeyService
	) {
		super('browser-view-compatibility', instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService);

		this.mockGroupView = new MockEditorGroupView(this);

		// Listen for active view changes and fire group change events
		this._register(this.onDidChangeActiveView(() => {
			this._onDidChangeActiveGroup.fire(this.mockGroupView);
		}));
	}

	get activeGroup(): IEditorGroupView {
		return this.mockGroupView;
	}

	get groups(): IEditorGroupView[] {
		return [this.mockGroupView];
	}

	get count(): number {
		return 1;
	}

	getGroups(): IEditorGroupView[] {
		return [this.mockGroupView];
	}

	getGroup(): IEditorGroupView | undefined {
		return this.mockGroupView;
	}

	hasGroup(): boolean {
		return true;
	}

	activateGroup(): IEditorGroupView {
		return this.mockGroupView;
	}

	getSize(): { width: number; height: number } {
		return { width: 800, height: 600 };
	}

	setSize(): void {
		// No-op
	}

	arrangeGroups(): void {
		// No-op
	}

	toggleMaximizeGroup(): void {
		// No-op
	}

	toggleExpandGroup(): void {
		// No-op
	}

	restoreGroup(): IEditorGroupView {
		return this.mockGroupView;
	}

	applyLayout(): void {
		// No-op
	}

	getLayout(): any {
		return {};
	}

	get orientation(): any {
		return 'horizontal';
	}

	setGroupOrientation(): void {
		// No-op
	}

	findGroup(): IEditorGroupView | undefined {
		return this.mockGroupView;
	}

	addGroup(): IEditorGroupView {
		return this.mockGroupView;
	}

	removeGroup(): void {
		// No-op
	}

	moveGroup(): IEditorGroupView {
		return this.mockGroupView;
	}

	mergeGroup(): boolean {
		return false;
	}

	mergeAllGroups(): boolean {
		return false;
	}

	copyGroup(): IEditorGroupView {
		return this.mockGroupView;
	}

	createEditorDropTarget(): IDisposable {
		return { dispose: () => {} };
	}

	// Browser view specific methods
	addView(id: string, title: string, url: string): IBrowserView {
		return super.addView(id, title, url);
	}

	removeView(id: string): void {
		super.removeView(id);
	}

	setActiveView(view: IBrowserView | undefined): void {
		super.setActiveView(view);
	}

	getView(id: string): IBrowserView | undefined {
		return super.getView(id);
	}
}
