import { expect } from '@hapi/code';
import 'mocha';
import { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { AddressValidationErrorResponse, AddressValidationResponse, JobsClient, JobStatus } from '../src';

const JobsClientOptions = {
	live: false,
	api_token: 'Ahngohsieb5aijooghugheF6iel0AeGh',
	base_url: 'http://0.0.0.0',
};
const Client = new JobsClient(JobsClientOptions);

// ---------------------------------------------------------------------
//  Axios interceptor util
let InterceptedConfig: AxiosRequestConfig;
let InterceptedError: Error;
Client.http.interceptors.request.use(
	function (config) {
		InterceptedConfig = config;
		return config;
	},
	function (error) {
		InterceptedError = error;
		return Promise.reject(error);
	}
);
function GetLastRequest(): AxiosRequestConfig {
	if (InterceptedError) {
		throw InterceptedError;
	}
	if (typeof InterceptedConfig.data === 'string') {
		InterceptedConfig.data = JSON.parse(InterceptedConfig.data);
	}
	return InterceptedConfig;
}
// ---------------------------------------------------------------------

const JobStatusExample: JobStatus = {
	job_info: {
		reference: '8MQXS0L84T',
		external_id: '',
		job_id: 3640041,
		courier: null,
		request_id: '8MQXS0L84T',
	},
	job_locations: [],
	current_status: {
		last_location: null,
		status_code: 52,
		status_string: 'cancelled',
		user: null,
		courier_name: null,
		remarks: 'Canceled Testing',
		status_time: '2020-06-08T01:00:54.178815',
	},
	job_history: [
		{
			date: '2020-06-08T00:43:27.849792+00:00',
			lat: null,
			lng: null,
			log: 'Job was created via the TwinJet API v1.',
			user: null,
		},
		{
			date: '2020-06-08T00:43:27.884726+00:00',
			lat: 45.52169,
			lng: -73.58406,
			log: 'Worker Routed',
			user: null,
		},
		{
			date: '2020-06-08T01:00:53.997215+00:00',
			lat: null,
			lng: null,
			log: 'Job was cancelled via the TwinJet API v1.',
			user: null,
		},
	],
};

describe('create', () => {
	it('success', async () => {
		const mock = new MockAdapter(Client.http);
		mock.onPost('/jobs').reply(200, {
			request_id: 'A1B2C3D4E5',
		});

		const response = await Client.create({
			order_contact_name: 'Larry Bluejeans',
			order_contact_phone: '5555555555',
			pick_address: {
				address_name: 'TCB Courier',
				street_address: '565 Ellis St',
				floor: 'Unit B',
				city: 'San Francisco',
				state: 'CA',
				zip_code: '94109',
				contact: 'Larry Bluejeans',
				special_instructions: 'Come right in',
			},
			deliver_address: {
				address_name: 'Important Office Building',
				street_address: '560 Mission St',
				floor: '13th floor',
				city: 'San Francisco',
				state: 'CA',
				zip_code: '94105',
				contact: 'P. Pete',
				special_instructions: 'Go to the messenger center',
			},
			ready_time: new Date(),
			deliver_from_time: Date.now(),
			deliver_to_time: '2014-08-04T14:54:28.630613-07:00',
			service_id: 21,
			order_total: 20.0,
			tip: 5.0,
			webhook_url: 'https://www.myawesomecompany.io/order/1234/',
			job_items: [
				{
					quantity: 4,
					description: 'Fried Chickens',
				},
				{
					quantity: 1,
					description: 'Coke',
				},
			],
		});

		const config = GetLastRequest();
		expect(config.data.api_token).to.equal(JobsClientOptions.api_token);
		expect(config.data.live).to.equal(JobsClientOptions.live);
		expect(config.data.ready_time).to.be.a.string();
		expect(config.data.deliver_from_time).to.be.a.string();
		expect(config.data.deliver_to_time).to.be.a.string();
		expect(response).to.equal('A1B2C3D4E5');

		mock.restore();
	});
	it('error', async () => {
		expect(
			Client.create({
				order_contact_name: 'Larry Bluejeans',
				order_contact_phone: '5555555555',
				ready_time: new Date(),
				deliver_from_time: Date.now(),
				deliver_to_time: '2014-08-04T14:54:28.630613-07:00',
				service_id: 21,
				order_total: 20.0,
				tip: 5.0,
				webhook_url: 'https://www.myawesomecompany.io/order/1234/',
				job_items: [
					{
						quantity: 4,
						description: 'Fried Chickens',
					},
					{
						quantity: 1,
						description: 'Coke',
					},
				],
			})
		).to.reject('Pick address and/or deliver address must be defined');
	});
});

describe('cancel', () => {
	it('success', async () => {
		const id = 'hp7Oshiech0';
		let config, response;

		const mock = new MockAdapter(Client.http);
		mock.onDelete('/jobs').reply(200, JobStatusExample);

		//-----------------------------------------------
		response = await Client.cancel({
			request_id: id,
		});
		config = GetLastRequest();
		expect(config.data.api_token).to.equal(JobsClientOptions.api_token);
		expect(config.data.request_id).to.equal(id);
		expect(response).to.equal(JobStatusExample);

		//-----------------------------------------------
		response = await Client.cancel({
			external_id: id,
		});
		config = GetLastRequest();
		expect(config.data.api_token).to.equal(JobsClientOptions.api_token);
		expect(config.data.external_id).to.equal(id);
		expect(response).to.equal(JobStatusExample);

		//-----------------------------------------------
		response = await Client.cancel({
			job_id: 100,
		});
		config = GetLastRequest();
		expect(config.data.api_token).to.equal(JobsClientOptions.api_token);
		expect(config.data.job_id).to.equal(100);
		expect(response).to.equal(JobStatusExample);

		mock.restore();
	});
	it('error', async () => {
		expect(Client.cancel({})).to.reject('One of request_id, job_id, external_id or reference must be defined');
	});
});

describe('update', () => {
	const payload = {
		order_contact_name: 'Larry Bluejeans',
		order_contact_phone: '5555555555',
		ready_time: new Date(),
		deliver_from_time: Date.now(),
		deliver_to_time: '2014-08-04T14:54:28.630613-07:00',
		webhook_url: 'https://www.myawesomecompany.io/order/1234/',
		job_items: [
			{
				quantity: 4,
				description: 'Fried Chickens',
			},
			{
				quantity: 1,
				description: 'Coke',
			},
		],
	};

	it('success', async () => {
		const id = 'hp7Oshiech0';
		let config, response;

		const mock = new MockAdapter(Client.http);
		mock.onPatch('/jobs').reply(200, JobStatusExample);

		//-----------------------------------------------
		response = await Client.update(
			{
				request_id: id,
			},
			payload
		);
		config = GetLastRequest();
		expect(config.data.api_token).to.equal(JobsClientOptions.api_token);
		expect(config.data.request_id).to.equal(id);
		expect(config.data.ready_time).to.be.a.string();
		expect(config.data.deliver_from_time).to.be.a.string();
		expect(config.data.deliver_to_time).to.be.a.string();
		expect(response).to.equal(JobStatusExample);

		//-----------------------------------------------
		response = await Client.update(
			{
				external_id: id,
			},
			payload
		);
		config = GetLastRequest();
		expect(config.data.api_token).to.equal(JobsClientOptions.api_token);
		expect(config.data.external_id).to.equal(id);
		expect(response).to.equal(JobStatusExample);

		//-----------------------------------------------
		response = await Client.update(
			{
				job_id: 100,
			},
			payload
		);
		config = GetLastRequest();
		expect(config.data.api_token).to.equal(JobsClientOptions.api_token);
		expect(config.data.job_id).to.equal(100);
		expect(response).to.equal(JobStatusExample);

		mock.restore();
	});
	it('error', async () => {
		expect(Client.update({}, payload)).to.reject('One of request_id, job_id, external_id or reference must be defined');
	});
});

describe('status', () => {
	it('success', async () => {
		const id = 'hp7Oshiech0';
		let config, response;

		const mock = new MockAdapter(Client.http);
		mock.onPost('/status').reply(200, JobStatusExample);

		//-----------------------------------------------
		response = await Client.status({
			request_id: id,
		});
		config = GetLastRequest();
		expect(config.data.api_token).to.equal(JobsClientOptions.api_token);
		expect(config.data.request_id).to.equal(id);
		expect(response).to.equal(JobStatusExample);

		//-----------------------------------------------
		response = await Client.status({
			external_id: id,
		});
		config = GetLastRequest();
		expect(config.data.api_token).to.equal(JobsClientOptions.api_token);
		expect(config.data.external_id).to.equal(id);
		expect(response).to.equal(JobStatusExample);

		//-----------------------------------------------
		response = await Client.status({
			job_id: 100,
		});
		config = GetLastRequest();
		expect(config.data.api_token).to.equal(JobsClientOptions.api_token);
		expect(config.data.job_id).to.equal(100);
		expect(response).to.equal(JobStatusExample);

		mock.restore();
	});
	it('error', async () => {
		expect(Client.status({})).to.reject('One of request_id, job_id, external_id or reference must be defined');
	});
});

describe('address validation', () => {
	it('success', async () => {
		const responseData: AddressValidationResponse = {
			pick_address: {
				address: '565 Ellis Street',
				city: 'San Francisco',
				state: 'CA',
				floor: 'Unit B',
				zip: '94109',
				lat: 37.7843461905875,
				lng: -122.415412005654,
			},
			drop_address: {
				address: '560 Mission Street',
				city: 'San Francisco',
				state: 'CA',
				floor: '13th floor',
				zip: '94105',
				lat: 37.7888061913173,
				lng: -122.399442005392,
			},
			pickup_eta: '2016-01-22T17:53:40.730-08:00',
			price: '8.00',
			delivery_eta: '2016-01-22T18:00:54.508-08:00',
		};
		let config, response;

		const mock = new MockAdapter(Client.http);
		mock.onPost('/validate').reply(200, responseData);

		response = await Client.addressValidation({
			pick_address: {
				address_name: 'TCB Courier',
				street_address: '565 Ellis St',
				floor: 'Unit B',
				city: 'San Francisco',
				state: 'CA',
				zip_code: '94109',
				contact: 'Larry Bluejeans',
				special_instructions: 'Come right in',
			},
			deliver_address: {
				address_name: 'Important Office Building',
				street_address: '560 Mission St',
				floor: '13th floor',
				city: 'San Francisco',
				state: 'CA',
				zip_code: '94105',
				contact: 'P. Pete',
				special_instructions: 'Go to the messenger center',
			},
		});

		config = GetLastRequest();
		expect(config.data.api_token).to.equal(JobsClientOptions.api_token);
		expect(config.data.pick_address).to.be.an.object();
		expect(config.data.deliver_address).to.be.an.object();
		expect(response).to.equal(responseData);

		response = await Client.addressValidation({
			pick_address: {
				address_name: 'TCB Courier',
				street_address: '565 Ellis St',
				floor: 'Unit B',
				city: 'San Francisco',
				state: 'CA',
				zip_code: '94109',
				contact: 'Larry Bluejeans',
				special_instructions: 'Come right in',
			},
		});

		config = GetLastRequest();
		expect(config.data.api_token).to.equal(JobsClientOptions.api_token);
		expect(config.data.pick_address).to.be.an.object();
		expect(config.data.deliver_address).to.be.undefined();
		expect(response).to.equal(responseData);

		response = await Client.addressValidation({
			deliver_address: {
				address_name: 'TCB Courier',
				street_address: '565 Ellis St',
				floor: 'Unit B',
				city: 'San Francisco',
				state: 'CA',
				zip_code: '94109',
				contact: 'Larry Bluejeans',
				special_instructions: 'Come right in',
			},
		});

		config = GetLastRequest();
		expect(config.data.api_token).to.equal(JobsClientOptions.api_token);
		expect(config.data.pick_address).to.be.undefined();
		expect(config.data.deliver_address).to.be.an.object();
		expect(response).to.equal(responseData);

		mock.restore();
	});
	it('fail', async () => {
		const responseData: AddressValidationErrorResponse = {
			errors: [
				{
					pick_address: 'Outside of available delivery area',
					drop_address: 'Outside of available delivery area',
				},
				{
					other: 'Something else',
				},
			],
			pick_address: {
				address: '544 19th Avenue',
				city: 'San Francisco',
				state: 'CA',
				floor: 'Unit B',
				zip: '94121',
				lat: 37.7776461894887,
				lng: -122.477902006678,
			},
			drop_address: {
				address: '560 Mission Street',
				city: 'San Francisco',
				state: 'CA',
				floor: '13th floor',
				zip: '94105',
				lat: 37.7888061913173,
				lng: -122.399442005392,
			},
		};

		const mock = new MockAdapter(Client.http);
		mock.onPost('/validate').reply(200, responseData);

		expect(
			Client.addressValidation({
				pick_address: {
					address_name: 'TCB Courier',
					street_address: '565 Ellis St',
					floor: 'Unit B',
					city: 'San Francisco',
					state: 'CA',
					zip_code: '94109',
					contact: 'Larry Bluejeans',
					special_instructions: 'Come right in',
				},
				deliver_address: {
					address_name: 'Important Office Building',
					street_address: '560 Mission St',
					floor: '13th floor',
					city: 'San Francisco',
					state: 'CA',
					zip_code: '94105',
					contact: 'P. Pete',
					special_instructions: 'Go to the messenger center',
				},
			})
		).to.reject('pick_address: Outside of available delivery area. drop_address: Outside of available delivery area. other: Something else');

		mock.restore();
	});
	it('error', async () => {
		expect(Client.addressValidation({})).to.reject('Pick address and/or deliver address must be defined');
	});
});
