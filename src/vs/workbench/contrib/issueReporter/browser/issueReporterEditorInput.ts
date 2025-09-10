/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { EditorInputCapabilities, IUntypedEditorInput } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { ProcessExplorerEditorInput } from '../../processExplorer/browser/processExplorerEditorInput.js';
import { ISSUE_REPORTER_INPUT_ID } from './issueReporterEditor.js';

export class IssueReporterEditorInput extends EditorInput {
	static readonly ID: string = ISSUE_REPORTER_INPUT_ID;

	static readonly RESOURCE = URI.from({
		scheme: 'issue-reporter',
		path: 'default'
	});

	private static _instance: IssueReporterEditorInput;
	static get instance() {
		if (!IssueReporterEditorInput._instance || IssueReporterEditorInput._instance.isDisposed()) {
			IssueReporterEditorInput._instance = new IssueReporterEditorInput();
		}

		return IssueReporterEditorInput._instance;
	}

	override get typeId(): string { return IssueReporterEditorInput.ID; }
	override get resource(): URI | undefined { return IssueReporterEditorInput.RESOURCE; }
	override get capabilities() { return EditorInputCapabilities.Singleton; }

	override getName(): string {
		return localize('issueReporterInputName', "Issue Reporter");
	}

	// TODO
	// override getIcon(): ThemeIcon {	}

	override matches(other: EditorInput | IUntypedEditorInput): boolean {
		if (super.matches(other)) {
			return true;
		}

		return other instanceof ProcessExplorerEditorInput;
	}
}
