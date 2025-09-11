/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/issueReporter.css';
import { $, Dimension, IDomPosition } from '../../../../base/browser/dom.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { escape } from '../../../../base/common/strings.js';
import { localize } from '../../../../nls.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { IssueReporterModel } from './issueReporterModel.js';

export const ISSUE_REPORTER_EDITOR_ID = 'workbench.editor.issueReporter';

export class IssueReporterEditor extends EditorPane {

	static readonly ID: string = ISSUE_REPORTER_EDITOR_ID;

	protected issueReporterControl: IssueReporterControl | undefined = undefined;

	constructor(
		group: IEditorGroup,
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IInstantiationService protected readonly instantiationService: IInstantiationService
	) {
		super(IssueReporterEditor.ID, group, telemetryService, themeService, storageService);
	}

	protected override createEditor(parent: HTMLElement): void {
		this.issueReporterControl = this._register(this.instantiationService.createInstance(IssueReporterControl, parent));
	}

	override focus(): void {
		this.issueReporterControl?.focus();
	}

	override layout(dimension: Dimension, position?: IDomPosition): void {
		this.issueReporterControl?.layout(dimension, position);
	}
}

export class IssueReporterControl extends Disposable {

	private dimensions: Dimension | undefined = undefined;
	private readonly model: IssueReporterModel;
	private container: HTMLElement;

	constructor(parent: HTMLElement) {
		super();
		this.container = parent;
		this.model = new IssueReporterModel();
		this.create(parent);
	}


	focus(): void {
		// Focus on the first input element if available
		const firstInput = this.container.querySelector('.issue-reporter input, .issue-reporter select, .issue-reporter textarea') as HTMLElement;
		if (firstInput) {
			firstInput.focus();
		}
	}

	layout(dimension: Dimension, position?: IDomPosition): void {
		this.dimensions = dimension;
		// Layout implementation can be added here if needed
		// The dimensions will be used for responsive layout adjustments
		if (this.dimensions) {
			// Future: Implement responsive behavior based on dimensions
		}
	}

	protected create(parent: HTMLElement): void {
		this.createIssueReporterPage(parent);
	}

	public getModel(): IssueReporterModel {
		return this.model;
	}

	private createIssueReporterPage(parent: HTMLElement): void {
		parent.innerHTML = '';
		parent.classList.add('issue-reporter-body', 'monaco-workbench');


		// Localized strings (grouped for easier maintenance)
		const strings = {
			completeInEnglish: localize('completeInEnglish', "Please complete the form in English."),
			reviewGuidance: localize({
				key: 'reviewGuidanceLabel',
				comment: ['{Locked="<a href=\"https://github.com/microsoft/vscode/wiki/Submitting-Bugs-and-Suggestions\" target=\"_blank\">"}', '{Locked="</a>"}']
			}, 'Before you report an issue here please <a href="https://github.com/microsoft/vscode/wiki/Submitting-Bugs-and-Suggestions" target="_blank">review the guidance we provide</a>. Please complete the form in English.'),
			issueType: localize('issueTypeLabel', "This is a"),
			issueSource: localize('issueSourceLabel', "For"),
			chooseExtension: localize('chooseExtension', "Extension"),
			issueTitle: localize('issueTitleLabel', "Title"),
			details: localize('details', "Please enter details."),
			show: localize('show', "show"),
			systemInfo: localize('sendSystemInfo', "Include my system information"),
			processInfo: localize('sendProcessInfo', "Include my currently running processes"),
			workspaceInfo: localize('sendWorkspaceInfo', "Include my workspace metadata"),
			extensions: localize('sendExtensions', "Include my enabled extensions"),
			experiments: localize('sendExperiments', "Include A/B experiment info"),
			extensionData: localize('sendExtensionData', "Include additional extension info"),
			downloadExtensionData: localize('downloadExtensionData', "Download Extension Data"),
			acknowledgements: localize('acknowledgements', "I acknowledge that my VS Code version is not updated and this issue may be closed."),
			// Validation messages
			sourceRequired: localize('issueSourceEmptyValidation', "An issue source is required."),
			titleRequired: localize('titleEmptyValidation', "A title is required."),
			titleTooLong: localize('titleLengthValidation', "The title is too long."),
			descriptionRequired: localize('descriptionEmptyValidation', "A description is required."),
			descriptionTooShort: localize('descriptionTooShortValidation', "Please provide a longer description."),
			extensionNonstandardBugs: localize('extensionWithNonstandardBugsUrl', "The issue reporter is unable to create issues for this extension. Please visit {0} to report an issue."),
			extensionNoBugs: localize('extensionWithNoBugsUrl', "The issue reporter is unable to create issues for this extension, as it does not specify a URL for reporting issues. Please check the marketplace page of this extension to see if other instructions are available."),
			disableExtensionsHelp: localize('disableExtensionsLabelText', "Try to reproduce the problem after {0}. If the problem only reproduces when extensions are active, it is likely an issue with an extension."),
			disableExtensions: localize('disableExtensions', "disabling all extensions and reloading the window"),
			titlePlaceholder: localize('issueTitleRequired', "Please enter a title."),
			extensionDataPlaceholder: localize('extensionData', "Extension does not have additional data to include.")
		};

		// Main structure
		const updateBanner = $<HTMLDivElement>('div#update-banner.issue-reporter-update-banner.hidden');
		const updateBannerText = $<HTMLSpanElement>('span.update-banner-text#update-banner-text');
		updateBanner.appendChild(updateBannerText);

		const issueReporter = $<HTMLDivElement>('div.issue-reporter#issue-reporter');

		// English notice
		const englishDiv = this.div('english', 'input-group hidden', strings.completeInEnglish);
		issueReporter.appendChild(englishDiv);

		// Review guidance
		const reviewDiv = this.div('review-guidance-help-text', 'input-group', strings.reviewGuidance, true);
		issueReporter.appendChild(reviewDiv);

		// Main form section
		const mainSection = $<HTMLDivElement>('div.section');

		// Issue type
		const issueTypeGroup = this.inputGroup([
			this.label('issue-type', strings.issueType),
			$<HTMLSelectElement>('select#issue-type.inline-form-control')
		]);
		mainSection.appendChild(issueTypeGroup);

		// Problem source
		const problemSourceGroup = this.inputGroup([
			this.label('issue-source', strings.issueSource, true),
			$<HTMLSelectElement>('select#issue-source.inline-form-control', { required: true }),
			this.validationError('issue-source-empty-error', strings.sourceRequired),
			this.createProblemSourceHelp(strings),
			this.createExtensionSelection(strings)
		], 'problem-source');
		mainSection.appendChild(problemSourceGroup);

		// Issue title
		const issueTitleGroup = this.inputGroup([
			this.label('issue-title', strings.issueTitle, true),
			$<HTMLInputElement>('input#issue-title.inline-form-control', {
				type: 'text',
				placeholder: escape(strings.titlePlaceholder),
				required: true
			}),
			this.validationError('issue-title-empty-error', strings.titleRequired),
			this.validationError('issue-title-length-validation-error', strings.titleTooLong),
			$<HTMLElement>('small#similar-issues')
		], 'issue-title-container');
		mainSection.appendChild(issueTitleGroup);

		issueReporter.appendChild(mainSection);

		// Description section
		const descriptionGroup = this.inputGroup([
			$<HTMLLabelElement>('label', { for: 'description', id: 'issue-description-label' }),
			$<HTMLDivElement>('div.instructions#issue-description-subtitle'),
			this.createDescriptionContainer(strings),
			this.validationError('description-empty-error', strings.descriptionRequired),
			this.validationError('description-short-error', strings.descriptionTooShort)
		], 'description-section');
		issueReporter.appendChild(descriptionGroup);

		// System info container
		const systemInfoContainer = $<HTMLDivElement>('div.system-info#block-container');

		// Extension data block (special structure)
		const extensionDataBlock = this.createExtensionDataBlock(strings);
		systemInfoContainer.appendChild(extensionDataBlock);

		// Standard system info blocks
		systemInfoContainer.appendChild(this.systemInfoBlock('block-system', 'includeSystemInfo', strings.systemInfo));
		systemInfoContainer.appendChild(this.systemInfoBlock('block-process', 'includeProcessInfo', strings.processInfo, 'pre'));
		systemInfoContainer.appendChild(this.systemInfoBlock('block-workspace', 'includeWorkspaceInfo', strings.workspaceInfo, 'pre', 'systemInfo'));
		systemInfoContainer.appendChild(this.systemInfoBlock('block-extensions', 'includeExtensions', strings.extensions, 'div', 'systemInfo'));
		systemInfoContainer.appendChild(this.systemInfoBlock('block-experiments', 'includeExperiments', strings.experiments, 'pre'));

		// Acknowledgements block
		const acknowledgementsBlock = $<HTMLDivElement>('div.block.block-acknowledgements.hidden#version-acknowledgements');
		const ackCheckbox = $<HTMLInputElement>('input.sendData', {
			'aria-label': escape(strings.acknowledgements),
			type: 'checkbox',
			id: 'includeAcknowledgement'
		});
		acknowledgementsBlock.appendChild(ackCheckbox);
		const ackLabel = $<HTMLLabelElement>('label.caption', { for: 'includeAcknowledgement' });
		ackLabel.textContent = escape(strings.acknowledgements);
		acknowledgementsBlock.appendChild(ackLabel);
		systemInfoContainer.appendChild(acknowledgementsBlock);

		issueReporter.appendChild(systemInfoContainer);

		parent.appendChild(updateBanner);
		parent.appendChild(issueReporter);
	}

	// Helper methods for complex structures
	private createProblemSourceHelp(strings: any): HTMLElement {
		const helpText = $<HTMLDivElement>('div#problem-source-help-text.instructions.hidden');
		const disableText = strings.disableExtensionsHelp.replace('{0}',
			`<span tabIndex=0 role="button" id="disableExtensions" class="workbenchCommand">${escape(strings.disableExtensions)}</span>`);
		helpText.innerHTML = disableText;
		return helpText;
	}

	private createExtensionSelection(strings: any): HTMLElement {
		const extensionSelection = $<HTMLDivElement>('div#extension-selection');
		extensionSelection.appendChild(this.label('extension-selector', strings.chooseExtension, true));
		extensionSelection.appendChild($<HTMLSelectElement>('select#extension-selector.inline-form-control'));

		const extensionError = this.validationError('extension-selection-validation-error',
			strings.extensionNonstandardBugs.replace('{0}',
				'<span tabIndex=0 role="button" id="extensionBugsLink" class="workbenchCommand"><!-- To be dynamically filled --></span>'), true);
		extensionSelection.appendChild(extensionError);
		extensionSelection.appendChild(this.validationError('extension-selection-validation-error-no-url', strings.extensionNoBugs));
		return extensionSelection;
	}

	private createDescriptionContainer(strings: any): HTMLElement {
		const blockInfoText = $<HTMLDivElement>('div.block-info-text');
		const textarea = $<HTMLTextAreaElement>('textarea#description', {
			name: 'description',
			placeholder: escape(strings.details),
			required: true
		});
		blockInfoText.appendChild(textarea);
		return blockInfoText;
	}

	private createExtensionDataBlock(strings: any): HTMLElement {
		const extensionDataBlock = $<HTMLDivElement>('div.block.block-extension-data');
		const checkbox = $<HTMLInputElement>('input.send-extension-data', {
			'aria-label': escape(strings.extensionData),
			type: 'checkbox',
			id: 'includeExtensionData',
			checked: true
		});
		extensionDataBlock.appendChild(checkbox);

		const label = $<HTMLLabelElement>('label.extension-caption#extension-caption', { for: 'includeExtensionData' });
		label.textContent = escape(strings.extensionData);

		// Add extension elements
		const extLoading = $<HTMLSpanElement>('span#ext-loading');
		extLoading.hidden = true;
		label.appendChild(extLoading);

		const parens1 = $<HTMLSpanElement>('span.ext-parens');
		parens1.textContent = '(';
		parens1.hidden = true;
		label.appendChild(parens1);

		const showLink = $<HTMLAnchorElement>('a.showInfo#extension-id', { href: '#' });
		showLink.textContent = escape(strings.show);
		label.appendChild(showLink);

		const parens2 = $<HTMLSpanElement>('span.ext-parens');
		parens2.textContent = ')';
		parens2.hidden = true;
		label.appendChild(parens2);

		const downloadLink = $<HTMLAnchorElement>('a#extension-data-download');
		downloadLink.textContent = escape(strings.downloadExtensionData);
		label.appendChild(downloadLink);

		extensionDataBlock.appendChild(label);

		const extensionDataPre = $<HTMLPreElement>('pre.block-info#extension-data', {
			placeholder: escape(strings.extensionDataPlaceholder),
			style: 'white-space: pre-wrap; user-select: text;'
		});
		extensionDataBlock.appendChild(extensionDataPre);

		return extensionDataBlock;
	}

	// Concise helper methods
	private div(id: string, className: string, content: string, useInnerHTML = false): HTMLElement {
		const div = $<HTMLDivElement>('div', { id, class: className });
		if (useInnerHTML) {
			div.innerHTML = content;
		} else {
			div.textContent = content;
		}
		return div;
	}

	private inputGroup(children: Node[], id?: string): HTMLElement {
		const group = $<HTMLDivElement>('div.input-group', id ? { id } : {});
		children.forEach(child => group.appendChild(child));
		return group;
	}

	private validationError(id: string, message: string, useInnerHTML = false): HTMLElement {
		const div = $<HTMLDivElement>('div.validation-error.hidden', { id, role: 'alert' });
		if (useInnerHTML) {
			div.innerHTML = message;
		} else {
			div.textContent = message;
		}
		return div;
	}

	private label(forId: string, text: string, required = false): HTMLElement {
		const label = $<HTMLLabelElement>('label.inline-label', { for: forId });
		label.textContent = text;
		if (required) {
			const requiredSpan = $<HTMLSpanElement>('span.required-input');
			requiredSpan.textContent = ' *';
			label.appendChild(requiredSpan);
		}
		return label;
	}

	private systemInfoBlock(className: string, checkboxId: string, ariaLabel: string, infoType = 'div', infoId?: string): HTMLElement {
		const block = $<HTMLDivElement>(`div.block.${className}`);

		const checkbox = $<HTMLInputElement>('input.sendData', {
			'aria-label': ariaLabel,
			type: 'checkbox',
			id: checkboxId,
			checked: true
		});
		block.appendChild(checkbox);

		const label = $<HTMLLabelElement>('label.caption', { for: checkboxId });
		label.textContent = ariaLabel;
		label.appendChild(document.createTextNode(' ('));
		const showLink = $<HTMLAnchorElement>('a.showInfo', { href: '#' });
		showLink.textContent = escape(localize('show', "show"));
		label.appendChild(showLink);
		label.appendChild(document.createTextNode(')'));
		block.appendChild(label);

		let infoElement: HTMLElement;
		if (infoType === 'pre') {
			infoElement = $<HTMLPreElement>('pre.block-info.hidden', { style: 'user-select: text;' });
			if (infoId) {
				infoElement.id = infoId;
			}
			const codeElement = $<HTMLElement>('code');
			infoElement.appendChild(codeElement);
		} else {
			infoElement = $<HTMLElement>('div.block-info.hidden', { style: 'user-select: text;' });
			if (infoId) {
				infoElement.id = infoId;
			}
		}

		block.appendChild(infoElement);
		return block;
	}
}
