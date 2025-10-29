import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class OneHealth implements INodeType {
	description: INodeTypeDescription = {
		displayName: '1Health',
		name: 'oneHealth',
		icon: 'file:onehealth.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Patient management and search',
		defaults: {
			name: '1Health',
		},
		inputs: ['main'],
		outputs: ['main'],
		codex: {
			categories: ['1Health'],
			subcategories: {
				'1Health': ['Healthcare']
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.1health.io/',
					},
				],
			},
		},
		credentials: [
			{
				name: 'oneHealthApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// Resource selector
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Patient',
						value: 'patient',
					},
				],
				default: 'patient',
			},
			// Operation selector
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['patient'],
					},
				},
				options: [
					{
						name: 'Find Patient Full Text',
						value: 'find',
						description: 'Search patients by firstName, lastName, or birthDate',
						action: 'Find patient using full text search',
					},
				],
				default: 'find',
			},
			// Search parameter for Find
			{
				displayName: 'Full Text Search On Person',
				name: 'fullTextSearchOnPerson',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['patient'],
						operation: ['find'],
					},
				},
				default: '',
				placeholder: 'John Doe',
				description: 'Search patients by firstName, lastName, or birthDate',
			},

			// Additional parameters for Find
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['patient'],
						operation: ['find'],
					},
				},
				options: [
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						default: 50,
						description: 'Max number of results to return',
						typeOptions: {
							minValue: 1,
							maxValue: 1000,
						},
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 0,
						description: 'Page number to retrieve',
						typeOptions: {
							minValue: 0,
						},
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('oneHealthApi');

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				const baseUrl = credentials.baseUrl as string;
				const apiKey = credentials.apiKey as string;

				// Find operation - POST with query parameters
				const fullTextSearchOnPerson = this.getNodeParameter('fullTextSearchOnPerson', i, '') as string;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;
				const qs: IDataObject = {};

				// Add search parameter if provided
				if (fullTextSearchOnPerson) {
					qs.fullTextSearchOnPerson = fullTextSearchOnPerson;
				}

				// Add pagination options
				if (options.limit) {
					qs.size = options.limit;
				}
				if (options.page) {
					qs.page = options.page;
				}

				responseData = await this.helpers.httpRequest({
					method: 'POST',
					url: `${baseUrl}/api/v2/health/organization/patient`,
					headers: {
						Authorization: `Bearer ${apiKey}`,
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					qs,
					json: true,
				});

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}

