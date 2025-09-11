/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/issueReporter.css';
import { safeSetInnerHtml } from '../../../../base/browser/domSanitize.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { isLinux, isWindows } from '../../../../base/common/platform.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IssueReporterData } from '../common/issue.js';
import BaseHtml from './issueReporterPage.js';
import { IssueWebReporter } from './issueReporterService.js';
import product from '../../../../platform/product/common/product.js';

export class IssueReporterControl extends Disposable {

	private dimensions: Dimension | undefined = undefined;
	private issueReporter: IssueWebReporter | undefined = undefined;

	constructor(
		private container: HTMLElement,
		@IInstantiationService private readonly instantiationService: IInstantiationService
	) {
		super();

		this.create();
	}

	private create(): void {
		this.container.classList.add('issue-reporter-body', 'monaco-workbench');

		const platformClass = isWindows ? 'windows' : isLinux ? 'linux' : 'mac';
		this.container.classList.add(platformClass);

		// Create the issue reporter wrapper
		const div = document.createElement('div');
		div.classList.add('monaco-workbench');
		this.container.appendChild(div);

		safeSetInnerHtml(div, BaseHtml(), {
			// Also allow input elements
			allowedTags: {
				augment: [
					'input',
					'select',
					'checkbox',
					'textarea',
				]
			},
			allowedAttributes: {
				augment: [
					'id',
					'class',
					'style',
					'textarea',
				]
			}
		});

		this.layoutContainer();
	}

	public async setData(data: IssueReporterData): Promise<void> {
		if (this.issueReporter) {
			this.issueReporter.dispose();
		}

		// Create the issue reporter with the pane's window context
		this.issueReporter = this._register(this.instantiationService.createInstance(
			IssueWebReporter,
			false,
			data,
			{
				type: navigator.platform || 'Unknown',
				arch: 'Unknown',
				release: navigator.userAgent || 'Unknown'
			},
			product,
			mainWindow // Use the main window since we're in an editor pane
		));

		this.issueReporter.render();
		this.issueReporter.setInitialFocus();
	}

	focus(): void {
		if (this.issueReporter) {
			this.issueReporter.setInitialFocus();
		} else {
			this.container.focus();
		}
	}

	layout(dimension: Dimension): void {
		this.dimensions = dimension;
		this.layoutContainer();
	}

	private layoutContainer(): void {
		if (this.dimensions) {
			this.container.style.width = `${this.dimensions.width}px`;
			this.container.style.height = `${this.dimensions.height}px`;
		}
	}
}
