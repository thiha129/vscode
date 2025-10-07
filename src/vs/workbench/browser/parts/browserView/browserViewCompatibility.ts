/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IEditorGroupsService, IEditorGroup, GroupsOrder, GroupDirection, GroupLocation, GroupsArrangement, GroupOrientation, IEditorWorkingSet, IEditorWorkingSetOptions, IFindGroupScope, IMergeGroupOptions, IEditorDropTargetDelegate, IEditorGroupContextKeyProvider, IEditorSideGroup, IEditorPart, IEditorGroupsContainer, IEditorReplacement, ICloseEditorOptions, ICloseEditorsFilter, ICloseAllEditorsOptions, IAuxiliaryEditorPart, GroupIdentifier, IEditorGroupView, IEditorPartOptions, IEditorPartOptionsChangeEvent } from '../../../services/editor/common/editorGroupsService.js';
import { IBrowserViewPartsService, IBrowserView } from './browserViewParts.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IEditorInput, IUntypedEditorInput, EditorInputWithOptions, IEditorInputWithOptions } from '../../../common/editor.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';

export class BrowserViewCompatibilityService implements IEditorGroupsService {
	declare readonly _serviceBrand: undefined;

	constructor(
		@IBrowserViewPartsService private readonly browserViewPartsService: IBrowserViewPartsService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IThemeService private readonly themeService: IThemeService,
		@IStorageService private readonly storageService: IStorageService,
		@IWorkbenchLayoutService private readonly layoutService: IWorkbenchLayoutService,
		@IHostService private readonly hostService: IHostService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService,
		@IInstantiationService private readonly instantiationService: IInstantiationService
	) {}

	//#region IEditorGroupsContainer

	readonly mainPart = this.browserViewPartsService.mainPart as any;
	readonly activeGroup = this.browserViewPartsService.mainPart as any;
	readonly groups = [this.browserViewPartsService.mainPart as any];
	readonly count = 1;
	readonly partOptions = {} as IEditorPartOptions;
	readonly onDidChangeEditorPartOptions = Event.None;

	//#endregion

	//#region IEditorGroupsService

	readonly onDidChangeActiveGroup = this.browserViewPartsService.onDidChangeActiveView;
	readonly onDidAddGroup = this.browserViewPartsService.onDidAddView;
	readonly onDidRemoveGroup = this.browserViewPartsService.onDidRemoveView;
	readonly onDidMoveGroup = Event.None;
	readonly onDidActivateGroup = this.browserViewPartsService.onDidChangeActiveView;
	readonly onDidChangeGroupIndex = Event.None;
	readonly onDidChangeGroupLocked = Event.None;
	readonly onDidChangeGroupMaximized = Event.None;

	getGroups(order = GroupsOrder.CREATION_TIME): IEditorGroup[] {
		return [this.browserViewPartsService.mainPart as any];
	}

	getGroup(identifier: GroupIdentifier): IEditorGroup | undefined {
		return this.browserViewPartsService.mainPart as any;
	}

	hasGroup(identifier: GroupIdentifier): boolean {
		return true;
	}

	activateGroup(group: IEditorGroup | GroupIdentifier): IEditorGroup {
		return this.browserViewPartsService.mainPart as any;
	}

	restoreGroup(group: IEditorGroup | GroupIdentifier): IEditorGroup {
		return this.browserViewPartsService.mainPart as any;
	}

	getSize(group: IEditorGroup | GroupIdentifier): { width: number; height: number } {
		return { width: 800, height: 600 };
	}

	setSize(group: IEditorGroup | GroupIdentifier, size: { width: number; height: number }): void {
		// Browser views don't support resizing individual groups
	}

	arrangeGroups(arrangement: GroupsArrangement, group: IEditorGroup | GroupIdentifier = this.activeGroup): void {
		// Browser views don't support group arrangement
	}

	toggleMaximizeGroup(group: IEditorGroup | GroupIdentifier = this.activeGroup): void {
		// Browser views don't support group maximization
	}

	toggleExpandGroup(group: IEditorGroup | GroupIdentifier = this.activeGroup): void {
		// Browser views don't support group expansion
	}

	findGroup(scope: IFindGroupScope, source: IEditorGroup | GroupIdentifier = this.activeGroup, wrap?: boolean): IEditorGroup | undefined {
		return this.browserViewPartsService.mainPart as any;
	}

	addGroup(location: IEditorGroup | GroupIdentifier, direction: GroupDirection): IEditorGroup {
		return this.browserViewPartsService.mainPart as any;
	}

	removeGroup(group: IEditorGroup | GroupIdentifier): void {
		// Browser views don't support removing groups
	}

	moveGroup(group: IEditorGroup | GroupIdentifier, location: IEditorGroup | GroupIdentifier, direction: GroupDirection): IEditorGroup {
		return this.browserViewPartsService.mainPart as any;
	}

	copyGroup(group: IEditorGroup | GroupIdentifier, location: IEditorGroup | GroupIdentifier, direction: GroupDirection): IEditorGroup {
		return this.browserViewPartsService.mainPart as any;
	}

	mergeGroup(group: IEditorGroup | GroupIdentifier, target: IEditorGroup | GroupIdentifier, options?: IMergeGroupOptions): boolean {
		return true;
	}

	mergeAllGroups(target: IEditorGroup | GroupIdentifier, options?: IMergeGroupOptions): boolean {
		return true;
	}

	createEditorDropTarget(container: HTMLElement, delegate: IEditorDropTargetDelegate): IDisposable {
		return { dispose: () => {} };
	}

	//#endregion

	//#region Additional methods

	get hasRestorableState(): boolean {
		return false;
	}

	get isReady(): boolean {
		return true;
	}

	readonly whenReady = Promise.resolve();
	readonly whenRestored = Promise.resolve();

	enforcePartOptions(options: Partial<IEditorPartOptions>): IDisposable {
		return { dispose: () => {} };
	}

	//#endregion
}

registerSingleton(IEditorGroupsService, BrowserViewCompatibilityService, InstantiationType.Eager);
