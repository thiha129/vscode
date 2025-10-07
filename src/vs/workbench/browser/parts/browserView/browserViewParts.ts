/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { Emitter } from '../../../../base/common/event.js';
import { DisposableStore, IDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { BrowserViewPart, IBrowserView, MainBrowserViewPart } from './browserViewPart.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Parts } from '../../../services/layout/browser/layoutService.js';

export interface IBrowserViewPartsService {
	readonly _serviceBrand: undefined;
	readonly mainPart: MainBrowserViewPart;
	readonly onDidChangeActiveView: Event<IBrowserView>;
	readonly onDidAddView: Event<IBrowserView>;
	readonly onDidRemoveView: Event<IBrowserView>;

	readonly activeView: IBrowserView | undefined;
	readonly views: IBrowserView[];
	readonly count: number;

	addView(id: string, title: string, url: string): IBrowserView;
	removeView(id: string): void;
	setActiveView(view: IBrowserView | undefined): void;
	getView(id: string): IBrowserView | undefined;
}

export class BrowserViewParts implements IBrowserViewPartsService {
	declare readonly _serviceBrand: undefined;

	readonly mainPart: MainBrowserViewPart;

	constructor(
		@IInstantiationService protected readonly instantiationService: IInstantiationService,
		@IStorageService private readonly storageService: IStorageService,
		@IThemeService themeService: IThemeService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService
	) {
		this.mainPart = this._register(this.createMainBrowserViewPart());
		this.registerListeners();
	}

	private registerListeners(): void {
		// Register listeners for the main part
		this._register(this.mainPart.onDidChangeActiveView(view => this._onDidChangeActiveView.fire(view)));
		this._register(this.mainPart.onDidAddView(view => this._onDidAddView.fire(view)));
		this._register(this.mainPart.onDidRemoveView(view => this._onDidRemoveView.fire(view)));
	}

	protected createMainBrowserViewPart(): MainBrowserViewPart {
		return this.instantiationService.createInstance(MainBrowserViewPart);
	}

	//#region Events

	private readonly _onDidChangeActiveView = this._register(new Emitter<IBrowserView>());
	readonly onDidChangeActiveView = this._onDidChangeActiveView.event;

	private readonly _onDidAddView = this._register(new Emitter<IBrowserView>());
	readonly onDidAddView = this._onDidAddView.event;

	private readonly _onDidRemoveView = this._register(new Emitter<IBrowserView>());
	readonly onDidRemoveView = this._onDidRemoveView.event;

	//#endregion

	//#region View Management

	get activeView(): IBrowserView | undefined {
		return this.mainPart.activeView;
	}

	get views(): IBrowserView[] {
		return this.mainPart.views;
	}

	get count(): number {
		return this.mainPart.count;
	}

	addView(id: string, title: string, url: string): IBrowserView {
		return this.mainPart.addView(id, title, url);
	}

	removeView(id: string): void {
		this.mainPart.removeView(id);
	}

	setActiveView(view: IBrowserView | undefined): void {
		this.mainPart.setActiveView(view);
	}

	getView(id: string): IBrowserView | undefined {
		return this.mainPart.getView(id);
	}

	//#endregion
}

registerSingleton(IBrowserViewPartsService, BrowserViewParts, InstantiationType.Eager);
