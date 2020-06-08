"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = exports.JobStatusCode = exports.PaymentMethod = void 0;
const axios_1 = __importDefault(require("axios"));
var PaymentMethod;
(function (PaymentMethod) {
    /** no transaction at delivery */
    PaymentMethod[PaymentMethod["INVOICE"] = 1] = "INVOICE";
    /** customer pre tips */
    PaymentMethod[PaymentMethod["CUSTOMER_PREPAID"] = 2] = "CUSTOMER_PREPAID";
    /** customer tips at delivery */
    PaymentMethod[PaymentMethod["CUSTOMER_CC"] = 4] = "CUSTOMER_CC";
    PaymentMethod[PaymentMethod["CUSTOMER_CASH"] = 6] = "CUSTOMER_CASH";
})(PaymentMethod = exports.PaymentMethod || (exports.PaymentMethod = {}));
var JobStatusCode;
(function (JobStatusCode) {
    /** Server Error. */
    JobStatusCode[JobStatusCode["ERROR"] = 30] = "ERROR";
    /** Job has been received and is processing. */
    JobStatusCode[JobStatusCode["PROCESSING"] = 40] = "PROCESSING";
    /** Job has been accepted and successfully created. You will now have access to the job_id. */
    JobStatusCode[JobStatusCode["ACCEPTED"] = 50] = "ACCEPTED";
    /** Job has been rejected by the courier company. Not yet implemented. */
    JobStatusCode[JobStatusCode["REJECTED"] = 51] = "REJECTED";
    /** Job has been cancelled. */
    JobStatusCode[JobStatusCode["CANCELLED"] = 52] = "CANCELLED";
    /** Job pick up was attempted, but the order was not ready. */
    JobStatusCode[JobStatusCode["ORDER_NOT_READY"] = 53] = "ORDER_NOT_READY";
    /** Job has been assigned to courier. */
    JobStatusCode[JobStatusCode["DISPATCHED"] = 60] = "DISPATCHED";
    /** Job has been picked up by courier. */
    JobStatusCode[JobStatusCode["PICKED_UP"] = 61] = "PICKED_UP";
    /** Job has been delivered by courier. */
    JobStatusCode[JobStatusCode["DELIVERED"] = 62] = "DELIVERED";
    /** Job delivery was unsuccessfully attempted by courier. Additional information will be logged. */
    JobStatusCode[JobStatusCode["UNDELIVERABLE"] = 63] = "UNDELIVERABLE";
})(JobStatusCode = exports.JobStatusCode || (exports.JobStatusCode = {}));
/** Client to manage jobs and validate address through the API */
class Client {
    constructor(options) {
        /** Default options for this client */
        this.defaultOptions = {
            base_url: 'https://www.twinjet.co/api/v1',
            timeout: 10000,
            live: true,
        };
        this.options = Object.assign({}, this.defaultOptions, options);
        this.http = axios_1.default.create({
            baseURL: this.options.base_url,
            timeout: this.options.timeout,
        });
    }
    /** Create a new job and returns the request ID */
    create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload.pick_address && !payload.deliver_address) {
                throw new Error('Pick address and/or deliver address must be defined');
            }
            const data = Object.assign({
                live: this.options.live,
                api_token: this.options.api_token,
            }, payload);
            // Convert dates
            data.ready_time = this.convertDate(data.ready_time);
            data.deliver_from_time = this.convertDate(data.deliver_from_time);
            data.deliver_to_time = this.convertDate(data.deliver_to_time);
            const result = yield this.http.post('/jobs', data);
            return result.data.request_id;
        });
    }
    /** Cancel existing job */
    cancel(identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateIdentifier(identifier);
            const data = Object.assign({
                api_token: this.options.api_token,
            }, identifier);
            const result = yield this.http.delete('/jobs', { data });
            return result.data;
        });
    }
    /** Edit existing job */
    update(identifier, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateIdentifier(identifier);
            const data = Object.assign({
                api_token: this.options.api_token,
            }, identifier, payload);
            // Convert dates
            if (data.ready_time)
                data.ready_time = this.convertDate(data.ready_time);
            if (data.deliver_from_time)
                data.deliver_from_time = this.convertDate(data.deliver_from_time);
            if (data.deliver_to_time)
                data.deliver_to_time = this.convertDate(data.deliver_to_time);
            const result = yield this.http.patch('/jobs', data);
            return result.data;
        });
    }
    /** Get status existing job */
    status(identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateIdentifier(identifier);
            const data = Object.assign({
                api_token: this.options.api_token,
            }, identifier);
            const result = yield this.http.post('/status', data);
            return result.data;
        });
    }
    /**
     * Validates an address within a delivery zone and returns a price quote and estimated
     * pickup and delivery times along with the available delivery zone in GeoJSON format.
     */
    addressValidation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload.pick_address && !payload.deliver_address) {
                throw new Error('Pick address and/or deliver address must be defined');
            }
            const data = Object.assign({
                api_token: this.options.api_token,
            }, payload);
            const result = yield this.http.post('/validate', data);
            const errors = result.data.errors;
            if (errors) {
                const message = errors
                    .map((errorObject) => Object.keys(errorObject)
                    .map((key) => `${key}: ${errorObject[key]}`)
                    .join('. '))
                    .join('. ');
                throw new Error(message);
            }
            return result.data;
        });
    }
    /** Validate identifier payload */
    validateIdentifier(identifier) {
        if (typeof identifier.request_id === 'undefined' &&
            typeof identifier.job_id === 'undefined' &&
            typeof identifier.external_id === 'undefined' &&
            typeof identifier.reference === 'undefined') {
            throw new Error('One of request_id, job_id, external_id or reference must be defined');
        }
    }
    /** Convert date of timestamp to ISO 8601 Localized Datetime */
    convertDate(date) {
        const toConvert = date instanceof Date ? date : new Date(date);
        return toConvert.toISOString();
    }
}
exports.Client = Client;
exports.default = Client;
//# sourceMappingURL=index.js.map