import { Payment, YooCheckout } from '@a2seven/yoo-checkout';
import crypto from 'crypto'

class YooModule {
    /**
     * @param {number} shopId
     * @param {string} secretKey
     */
    constructor(shopId, secretKey) {
        this.checkout = new YooCheckout({ shopId, secretKey });
    }

    /**
     * Генерирует уникальный идентификатор UUID v4
     * @returns {string} UUID v4
     */
    generateUUID() {
        const bytes = crypto.randomBytes(16);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = bytes.toString('hex');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }

    /**
     * Создает платеж
     * @param {Object} params
     * @param {string} params.amount
     * @param {string} params.currency
     * @param {string} params.paymentType
     * @param {string} params.returnUrl
     * @param {string} [params.idempotenceKey]
     * @returns {Promise<Object>} The payment response
     */
    async createPayment({
        amount,
        currency,
        paymentType,
        returnUrl,
        idempotenceKey = this.generateUUID()
    }) {
        /** @type {PaymentPayload} */
        const payload = {
            amount: {
                value: amount,
                currency: currency
            },
            payment_method_data: {
                type: paymentType
            },
            confirmation: {
                type: 'redirect',
                return_url: returnUrl
            }
        };

        try {
            return await this.checkout.createPayment(payload, idempotenceKey);
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    }

    /**
     * Получает информацию о платеже
     * @param {string} paymentId
     * @returns {Promise<Payment>} Платежные данные
     */
    async getPayment(paymentId) {
        try {
            return await this.checkout.getPayment(paymentId);
        } catch (error) {
            console.error("Error getting payment:", error);
            throw error;
        }
    }

    /**
     * Захватывает платеж
     * @param {string} paymentId
     * @param {CapturePaymentPayload} payload
     * @param {string} [idempotenceKey]
     * @returns {Promise<Payment>}
     */
    async capturePayment(paymentId, payload, idempotenceKey = this.generateUUID()) {
        try {
            return await this.checkout.capturePayment(paymentId, payload, idempotenceKey);
        } catch (error) {
            console.error('Error capturing payment:', error);
            throw error;
        }
    }

    /**
     * Получить список платежей с фильтрацией
     * @param {Object} filters
     * @returns {Promise<IPaymentList>}
     */
    async getPaymentList(filters = {}) {
        try {
            return await this.checkout.getPaymentList(filters);
        } catch (error) {
            console.error('Error getting payment list:', error);
            throw error;
        }
    }

    /**
     * Создает возврат платежа
     * @param {Object} payload
     * @param {string} payload.payment_id
     * @param {Object} payload.amount
     * @param {string} payload.amount.value
     * @param {string} payload.amount.currency
     * @param {string} [idempotenceKey]
     * @returns {Promise<Refund>}
     */
    async createRefund(payload, idempotenceKey = this.generateUUID()) {
        try {
            return await this.checkout.createRefund(payload, idempotenceKey);
        } catch (error) {
            console.error('Error creating refund:', error);
            throw error;
        }
    }
}

export default YooModule;
