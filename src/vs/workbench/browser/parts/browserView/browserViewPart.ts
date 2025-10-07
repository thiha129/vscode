/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { Part } from '../../part.js';
import { Dimension, $, getWindow } from '../../../../base/browser/dom.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { Parts, IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { IEditorGroupView } from '../editor/editor.js';

export interface IBrowserView {
	readonly id: string;
	readonly title: string;
	readonly url: string;
	readonly element: HTMLElement;
	readonly onDidChangeTitle: Event<string>;
	readonly onDidChangeUrl: Event<string>;
	readonly onDidDispose: Event<void>;

	dispose(): void;
	loadUrl(url: string): Promise<void>;
	reload(): Promise<void>;
	goBack(): Promise<void>;
	goForward(): Promise<void>;
	canGoBack(): boolean;
	canGoForward(): boolean;
}

export class BrowserView implements IBrowserView {
	private readonly _onDidChangeTitle = new Emitter<string>();
	readonly onDidChangeTitle = this._onDidChangeTitle.event;

	private readonly _onDidChangeUrl = new Emitter<string>();
	readonly onDidChangeUrl = this._onDidChangeUrl.event;

	private readonly _onDidDispose = new Emitter<void>();
	readonly onDidDispose = this._onDidDispose.event;

	private _title: string;
	private _url: string;
	private _canGoBack: boolean = false;
	private _canGoForward: boolean = false;

	constructor(
		public readonly id: string,
		public readonly element: HTMLElement,
		title: string = 'Browser View',
		url: string = 'about:blank'
	) {
		this._title = title;
		this._url = url;
		this.setupBrowserView();
	}

	private setupBrowserView(): void {
		// Create iframe for the browser view
		const iframe = document.createElement('iframe');
		iframe.src = this._url;
		iframe.style.width = '100%';
		iframe.style.height = '100%';
		iframe.style.border = 'none';
		iframe.style.background = 'white';

		this.element.appendChild(iframe);

		// Listen for iframe load events
		iframe.addEventListener('load', () => {
			try {
				// Try to get the title from the iframe document
				const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
				if (iframeDoc) {
					const title = iframeDoc.title || iframeDoc.URL;
					if (title !== this._title) {
						this._title = title;
						this._onDidChangeTitle.fire(this._title);
					}
				}
			} catch (e) {
				// Cross-origin restrictions may prevent access
			}
		});

		// Listen for navigation events
		iframe.addEventListener('load', () => {
			this._url = iframe.src;
			this._onDidChangeUrl.fire(this._url);
		});
	}

	get title(): string {
		return this._title;
	}

	get url(): string {
		return this._url;
	}

	async loadUrl(url: string): Promise<void> {
		this._url = url;
		const iframe = this.element.querySelector('iframe') as HTMLIFrameElement;
		if (iframe) {
			iframe.src = url;
		}
		this._onDidChangeUrl.fire(this._url);
	}

	async reload(): Promise<void> {
		const iframe = this.element.querySelector('iframe') as HTMLIFrameElement;
		if (iframe) {
			iframe.src = iframe.src;
		}
	}

	async goBack(): Promise<void> {
		const iframe = this.element.querySelector('iframe') as HTMLIFrameElement;
		if (iframe && iframe.contentWindow) {
			iframe.contentWindow.history.back();
		}
	}

	async goForward(): Promise<void> {
		const iframe = this.element.querySelector('iframe') as HTMLIFrameElement;
		if (iframe && iframe.contentWindow) {
			iframe.contentWindow.history.forward();
		}
	}

	canGoBack(): boolean {
		return this._canGoBack;
	}

	canGoForward(): boolean {
		return this._canGoForward;
	}

	dispose(): void {
		this._onDidDispose.fire();
		this.element.remove();
	}
}

export class BrowserViewPart extends Part {
	private readonly _onDidFocus = new Emitter<void>();
	readonly onDidFocus = this._onDidFocus.event;

	private readonly _onDidLayout = new Emitter<Dimension>();
	readonly onDidLayout = this._onDidLayout.event;

	private readonly _onDidChangeActiveView = new Emitter<IBrowserView>();
	readonly onDidChangeActiveView = this._onDidChangeActiveView.event;

	private readonly _onDidAddView = new Emitter<IBrowserView>();
	readonly onDidAddView = this._onDidAddView.event;

	private readonly _onDidRemoveView = new Emitter<IBrowserView>();
	readonly onDidRemoveView = this._onDidRemoveView.event;

	private readonly views = new Map<string, IBrowserView>();
	private _activeView: IBrowserView | undefined;

	protected readonly container = $('.content');

	readonly scopedInstantiationService: IInstantiationService;
	private readonly scopedContextKeyService: IContextKeyService;

	constructor(
		id: string,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IStorageService storageService: IStorageService,
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@IHostService private readonly hostService: IHostService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService
	) {
		super(id, { hasTitle: false }, themeService, storageService, layoutService);

		this.scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.container));
		this.scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection(
			[IContextKeyService, this.scopedContextKeyService]
		)));

		this.registerListeners();
	}

	private registerListeners(): void {
		// Add any necessary listeners here
	}

	get activeView(): IBrowserView | undefined {
		return this._activeView;
	}

	get views(): IBrowserView[] {
		return Array.from(this.views.values());
	}

	get count(): number {
		return this.views.size;
	}

	addView(id: string, title: string, url: string): IBrowserView {
		const viewElement = $('.browser-view');
		viewElement.style.width = '100%';
		viewElement.style.height = '100%';
		viewElement.style.display = 'none';

		const view = new BrowserView(id, viewElement, title, url);
		this.views.set(id, view);

		// Listen for view events
		this._register(view.onDidDispose(() => {
			this.removeView(id);
		}));

		this.container.appendChild(viewElement);
		this._onDidAddView.fire(view);

		// If this is the first view, make it active
		if (!this._activeView) {
			this.setActiveView(view);
		}

		return view;
	}

	removeView(id: string): void {
		const view = this.views.get(id);
		if (view) {
			this.views.delete(id);
			view.dispose();
			this._onDidRemoveView.fire(view);

			// If this was the active view, switch to another one
			if (this._activeView === view) {
				const nextView = this.views.values().next().value;
				this.setActiveView(nextView);
			}
		}
	}

	setActiveView(view: IBrowserView | undefined): void {
		if (this._activeView === view) {
			return;
		}

		// Hide current active view
		if (this._activeView) {
			this._activeView.element.style.display = 'none';
		}

		// Show new active view
		if (view) {
			view.element.style.display = 'block';
			this._activeView = view;
			this._onDidChangeActiveView.fire(view);
		} else {
			this._activeView = undefined;
		}
	}

	getView(id: string): IBrowserView | undefined {
		return this.views.get(id);
	}

	//#region Part

	get minimumWidth(): number { return 200; }
	get maximumWidth(): number { return Number.POSITIVE_INFINITY; }
	get minimumHeight(): number { return 200; }
	get maximumHeight(): number { return Number.POSITIVE_INFINITY; }

	readonly priority = 1; // High priority

	override updateStyles(): void {
		this.container.style.backgroundColor = this.getColor('editor.background') || '#ffffff';
	}

	protected override createContentArea(parent: HTMLElement): HTMLElement {
		this.element = parent;
		parent.appendChild(this.container);

		// Create a default browser view
		this.addView('default', 'Browser View', 'about:blank');

		return this.container;
	}

	override layout(width: number, height: number, top: number, left: number): void {
		// Layout the container
		this.container.style.width = `${width}px`;
		this.container.style.height = `${height}px`;
		this.container.style.position = 'absolute';
		this.container.style.top = `${top}px`;
		this.container.style.left = `${left}px`;

		// Layout all views
		for (const view of this.views.values()) {
			view.element.style.width = '100%';
			view.element.style.height = '100%';
		}

		this._onDidLayout.fire(new Dimension(width, height));
	}

	override dispose(): void {
		// Dispose all views
		for (const view of this.views.values()) {
			view.dispose();
		}
		this.views.clear();

		super.dispose();
	}

	//#endregion
}

export class MainBrowserViewPart extends BrowserViewPart {
	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
		@IConfigurationService configurationService: IConfigurationService,
		@IStorageService storageService: IStorageService,
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@IHostService hostService: IHostService,
		@IContextKeyService contextKeyService: IContextKeyService
	) {
		super(Parts.EDITOR_PART, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService);
	}
}
