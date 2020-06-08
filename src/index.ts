import axios, { AxiosInstance } from 'axios';

export interface ClientOptions {
	/** This is your api token issued by your company. This will identify you and provide authentication. */
	api_token: string;
	/** Override API Base URL */
	base_url?: string;
	/** Override requests timeout */
	timeout?: number;
	/** Determines if this job should be processed by TwinJet. */
	live?: boolean;
}

export interface Address {
	/** The "Line 1" of an address. Typically the company name, or recipient name. */
	address_name?: string;
	/** The house number + street name. For example: 565 Ellis St */
	street_address: string;
	/** Floor/Suite Number/Apartment Number/Unit */
	floor?: string;
	/** The city name */
	city: string;
	/** The two letter USPS state abbreviation. CA; not California. */
	state: string;
	/** The 5 digit USPS zip code for the address. Do not pass the zip+4, 5 character limit. */
	zip_code?: string;
	/** A contact person located at the address. */
	contact?: string;
	/** A contact phone number for somebody at the address. */
	phone_number?: string;
	/** Any address specific delivery instructions. */
	special_instructions?: string;
}

export interface ValidatedAddress {
	address: string;
	city: string;
	state: string;
	floor: string | null;
	zip: string;
	lat: number;
	lng: number;
}

export interface JobItem {
	/** The quantity of the job item */
	quantity: number;
	/** A description of the item being picked up */
	description?: string;
	/** A SKU/Id of the item being picked up. */
	sku?: string;
}

type DateLike = Date | number | string;
export enum PaymentMethod {
	/** no transaction at delivery */
	INVOICE = 1,
	/** customer pre tips */
	CUSTOMER_PREPAID = 2,
	/** customer tips at delivery */
	CUSTOMER_CC = 4,
	CUSTOMER_CASH = 6,
}
export enum JobStatusCode {
	/** Server Error. */
	ERROR = 30,
	/** Job has been received and is processing. */
	PROCESSING = 40,
	/** Job has been accepted and successfully created. You will now have access to the job_id. */
	ACCEPTED = 50,
	/** Job has been rejected by the courier company. Not yet implemented. */
	REJECTED = 51,
	/** Job has been cancelled. */
	CANCELLED = 52,
	/** Job pick up was attempted, but the order was not ready. */
	ORDER_NOT_READY = 53,
	/** Job has been assigned to courier. */
	DISPATCHED = 60,
	/** Job has been picked up by courier. */
	PICKED_UP = 61,
	/** Job has been delivered by courier. */
	DELIVERED = 62,
	/** Job delivery was unsuccessfully attempted by courier. Additional information will be logged. */
	UNDELIVERABLE = 63,
}

export interface JobInfo {
	job_id: number;
	reference: string;
	request_id: string;
	courier: string | null;
	user?: string;
	external_id: string;
}

export interface JobLocation {
	date: string;
	lat: number;
	lng: number;
	user: string;
	courier: string;
}

export interface JobCurrentStatus {
	last_location: [number, number] | null;
	status_code: JobStatusCode;
	status_string: string;
	user: string | null;
	courier_name: string | null;
	remarks: string;
	status_time: string;
}

export interface JobHistory {
	date: string;
	log: string;
	lat: number | null;
	lng: number | null;
	user: string | null;
	courier?: string;
}

export interface JobStatus {
	job_info: JobInfo;
	job_locations: JobLocation[];
	current_status: JobCurrentStatus;
	job_history: JobHistory[];
}

export interface JobIdentifier {
	/** This is the id obtained when submitting a new job. */
	request_id?: string;
	/** This is the Twinjet job id. */
	job_id?: number;
	/** Your external reference number. */
	external_id?: string;
	/** A job reference for billing purposes. */
	reference?: string;
}
export interface JobPayload {
	/**
	 * Name of a person the courier company can contact if there is a problm with your order.
	 * This should not be the recipient of the delivery,
	 * but rather somebody the courier can contact if something goes wrong with the fulfillment of the job.
	 */
	order_contact_name: string;
	/**
	 * Phone number of a person the courier company can contact if there is a problem with your order.
	 * This should not be the recipient of the delivery,
	 * but rather somebody the courier can contact if something goes wrong with the fulfillment of the job.
	 */
	order_contact_phone: string;
	/** The address where the courier should make the pick up. */
	pick_address?: Address;
	/** The address where the courier should make the delivery. */
	deliver_address?: Address;
	/** The date and time that a job is ready for pick up. */
	ready_time: DateLike;
	/** The date and time representing the beginning of the delivery window */
	deliver_from_time: DateLike;
	/** The date and time representing the end of the delivery window */
	deliver_to_time: DateLike;
	/** URL to receive webhook events. */
	webhook_url?: string;
	/**
	 * A job reference for billing purposes
	 * (If you want something the courier can use to reference your order easily, use external_id).
	 */
	reference?: string;
	/**
	 * The ID for the service level.
	 * This ID would be provided by the courier company and only used for changing the service from the default
	 * (eg: upgrading from the default "Same-Day" service to "1-Hour").
	 */
	service_id?: number;
	/** Payment method for the delivery */
	payment_method?: PaymentMethod;
	/** The order total */
	order_total?: number;
	/** The order delivery fee. */
	delivery_fee?: number;
	/** The order tip */
	tip?: number;
	/** If you went to pass specific information on what the courier should pick up, you may pass an array of Jobitem objects detailed below. */
	job_items?: JobItem[];
	/** Any special instructions may be specified here. */
	special_instructions?: string;
	/** Requires a photo be taken before a job can be marked delivered. */
	photo?: boolean;
	/** A refrence number for the courier to use. This will be displayed to the courier. */
	external_id?: string;
}
export type JobEditionPayload = Partial<Omit<JobPayload, 'reference' | 'photo' | 'external_id'>>;
export interface JobCreationResponse {
	/** A unique identifier associated with that API request. You can the request_id to look up your job. */
	request_id: string;
}
export interface AddressValidationPayload {
	/** The address where the courier should make the pick up. */
	pick_address?: Address;
	/** The address where the courier should make the delivery. */
	deliver_address?: Address;
}
export interface AddressValidationResponse {
	pick_address: ValidatedAddress;
	drop_address: ValidatedAddress;
	pickup_eta: string;
	price: string;
	delivery_eta: string;
}
export interface AddressValidationErrorResponse {
	pick_address: ValidatedAddress;
	drop_address: ValidatedAddress;
	errors: { [key: string]: string }[];
}

/** Client to manage jobs and validate address through the API */
export class Client {
	/** Default options for this client */
	private defaultOptions: Partial<ClientOptions> = {
		base_url: 'https://www.twinjet.co/api/v1',
		timeout: 10000,
		live: true,
	};
	/** Options provided by user merged with defaults options */
	private readonly options: ClientOptions;
	/** HTTP client */
	public readonly http: AxiosInstance;

	constructor(options: ClientOptions) {
		this.options = Object.assign({}, this.defaultOptions, options);
		this.http = axios.create({
			baseURL: this.options.base_url,
			timeout: this.options.timeout,
		});
	}

	/** Create a new job and returns the request ID */
	async create(payload: JobPayload): Promise<string> {
		if (!payload.pick_address && !payload.deliver_address) {
			throw new Error('Pick address and/or deliver address must be defined');
		}

		const data = Object.assign(
			{
				live: this.options.live,
				api_token: this.options.api_token,
			},
			payload
		);

		// Convert dates
		data.ready_time = this.convertDate(data.ready_time);
		data.deliver_from_time = this.convertDate(data.deliver_from_time);
		data.deliver_to_time = this.convertDate(data.deliver_to_time);

		const result = await this.http.post<JobCreationResponse>('/jobs', data);

		return result.data.request_id;
	}

	/** Cancel existing job */
	async cancel(identifier: JobIdentifier): Promise<JobStatus> {
		this.validateIdentifier(identifier);

		const data = Object.assign(
			{
				api_token: this.options.api_token,
			},
			identifier
		);

		const result = await this.http.delete<JobStatus>('/jobs', { data });

		return result.data;
	}

	/** Edit existing job */
	async update(identifier: JobIdentifier, payload: JobEditionPayload): Promise<JobStatus> {
		this.validateIdentifier(identifier);

		const data = Object.assign(
			{
				api_token: this.options.api_token,
			},
			identifier,
			payload
		);

		// Convert dates
		if (data.ready_time) data.ready_time = this.convertDate(data.ready_time);
		if (data.deliver_from_time) data.deliver_from_time = this.convertDate(data.deliver_from_time);
		if (data.deliver_to_time) data.deliver_to_time = this.convertDate(data.deliver_to_time);

		const result = await this.http.patch<JobStatus>('/jobs', data);

		return result.data;
	}

	/** Get status existing job */
	async status(identifier: JobIdentifier): Promise<JobStatus> {
		this.validateIdentifier(identifier);

		const data = Object.assign(
			{
				api_token: this.options.api_token,
			},
			identifier
		);

		const result = await this.http.post<JobStatus>('/status', data);

		return result.data;
	}

	/**
	 * Validates an address within a delivery zone and returns a price quote and estimated
	 * pickup and delivery times along with the available delivery zone in GeoJSON format.
	 */
	async addressValidation(payload: AddressValidationPayload): Promise<AddressValidationResponse> {
		if (!payload.pick_address && !payload.deliver_address) {
			throw new Error('Pick address and/or deliver address must be defined');
		}

		const data = Object.assign(
			{
				api_token: this.options.api_token,
			},
			payload
		);

		const result = await this.http.post<AddressValidationResponse | AddressValidationErrorResponse>('/validate', data);

		const errors = (<AddressValidationErrorResponse>result.data).errors;
		if (errors) {
			const message = errors
				.map((errorObject) =>
					Object.keys(errorObject)
						.map((key) => `${key}: ${errorObject[key]}`)
						.join('. ')
				)
				.join('. ');
			throw new Error(message);
		}

		return result.data as AddressValidationResponse;
	}

	/** Validate identifier payload */
	private validateIdentifier(identifier: JobIdentifier): void {
		if (
			typeof identifier.request_id === 'undefined' &&
			typeof identifier.job_id === 'undefined' &&
			typeof identifier.external_id === 'undefined' &&
			typeof identifier.reference === 'undefined'
		) {
			throw new Error('One of request_id, job_id, external_id or reference must be defined');
		}
	}

	/** Convert date of timestamp to ISO 8601 Localized Datetime */
	private convertDate(date: DateLike): string {
		const toConvert = date instanceof Date ? date : new Date(date);
		return toConvert.toISOString();
	}
}

export default Client;
