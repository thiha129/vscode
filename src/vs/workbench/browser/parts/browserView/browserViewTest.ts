/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IBrowserViewPartsService } from './browserViewParts.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';

export class BrowserViewTest {
	constructor(
		@IBrowserViewPartsService private readonly browserViewPartsService: IBrowserViewPartsService,
		@IInstantiationService private readonly instantiationService: IInstantiationService
	) {}

	async testBrowserViews(): Promise<void> {
		console.log('Testing Browser Views...');

		// Add a test browser view
		const view1 = this.browserViewPartsService.addView('test1', 'Test View 1', 'https://www.google.com');
		console.log('Added view 1:', view1.title);

		// Add another test browser view
		const view2 = this.browserViewPartsService.addView('test2', 'Test View 2', 'https://www.github.com');
		console.log('Added view 2:', view2.title);

		// Switch between views
		this.browserViewPartsService.setActiveView(view1);
		console.log('Active view:', this.browserViewPartsService.activeView?.title);

		this.browserViewPartsService.setActiveView(view2);
		console.log('Active view:', this.browserViewPartsService.activeView?.title);

		// Test view count
		console.log('Total views:', this.browserViewPartsService.count);

		// Test view retrieval
		const retrievedView = this.browserViewPartsService.getView('test1');
		console.log('Retrieved view:', retrievedView?.title);

		// Remove a view
		this.browserViewPartsService.removeView('test1');
		console.log('After removal - Total views:', this.browserViewPartsService.count);

		console.log('Browser Views test completed!');
	}
}
