const { default: axios } = require('axios')
const crypto = require('crypto')

const sha256 = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex')
}

const httpCowin = axios.create({
    baseURL: 'http://cdndemo-api.co-vin.in',
    headers: {
        'authority': 'cdn-api.co-vin.in',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
        'accept': 'application/json, text/plain, */*',
        'sec-ch-ua-mobile': '?0',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
        'content-type': 'application/json',
        'origin': 'https://selfregistration.cowin.gov.in',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://selfregistration.cowin.gov.in/',
        'accept-language': 'en-US,en-IN;q=0.9,en;q=0.8',
        'x-api-key': '3sjOr2rmM52GzhpMHjDEE1kpQeRxwFDr4YcBEimi'
    }
})

class Cowin {

    /**
     * @private
     */
    static _getToday () {
        const dateObj = new Date()
        return `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth()+1).padStart(2, '0')}-${dateObj.getFullYear()}`
    }

    /**
     * @param {number} number Mobile number 10digit
     * @returns {Promise<string>} Txn ID
     */
    static async sendOtp(number) {
        const res = await httpCowin({
            method: 'POST',
            url: '/api/v2/auth/generateMobileOTP',
            data: {
                mobile: number,
                secret: "U2FsdGVkX19at5EJPMYRe6TTDK4WWA2Nyb6b6c+QAmcYQjuhurrk6+CUqmMKHtSeaETDAIuXC+7Jz+ioZvkG+Q=="
            }
        })

        return res.data.txnId
    }

    /**
     * @param {string} txnId Transaction id from sendOtp
     * @param {number} otp otp number
     * @returns {Promise<string>} JWT Token
     */
    static async verifyOtp(txnId, otp) {
        const res = await httpCowin({
            method: 'POST',
            url: '/api/v2/auth/validateMobileOtp',
            data: {
                otp: sha256(otp),
                txnId: txnId
            }
        })
        return res.data.token
    }
    
    /**
     * @param {string} token JWT token
     * @returns {Promise<Array>} beneficiaries
     */
    static async getBeneficiaries(token) {
        const res = await httpCowin({
            method: 'GET',
            url: '/api/v2/appointment/beneficiaries',
            headers: {
                authorization: 'Bearer ' + token
            }
        })
        return res.data.beneficiaries
    }

    /**
     * @returns {Promise<Array>} ID types
     */
    static async getIdTypes() {
        const res = await httpCowin({
            method: 'GET',
            url: '/api/v2/registration/beneficiary/idTypes',
        })
        return res.data.types
    }

    /**
     * @returns {Promise<Array>} Gender types
     */
    static async getGenders() {
        const res = await httpCowin({
            method: 'GET',
            url: '/api/v2/registration/beneficiary/genders',
        })
        return res.data.genders
    }

    /**
     * @param {Object} {Data}
     * @param {string} token JWT
     * @returns {Promise<string>} beneficiary_reference_id
     */
    static async addBeneficiary({ name, birth_year, gender_id, photo_id_type, photo_id_number }, token) {
        const res = await httpCowin({
            method: 'POST',
            url: '/api/v2/registration/beneficiary/new',
            headers: {
                authorization: 'Bearer ' + token
            },
            data: {
                name,
                birth_year,
                gender_id,
                photo_id_type,
                photo_id_number,
                comorbidity_ind: "N",
                consent_version: "1"
            }
        })
        return res.data.beneficiary_reference_id
    }

    /**
     * @param {string} token JWT Token
     * @param {string} beneficiary_reference_id Beneficiary ID
     * @returns {Promise<number>} status code 204
     */
    static async deleteBeneficiary (token, beneficiary_reference_id) {
        const res = await httpCowin({
            method: 'POST',
            url: '/api/v2/registration/beneficiary/delete',
            headers: {
                authorization: 'Bearer ' + token
            },
            data: {
                beneficiary_reference_id
            }
        })
        return res.status
    }

    /**
     * Get Centers by Pincode
     * @param {number} pincode 6 digit pincode
     * @returns {Promise<Array>} list of centers
     */
    static async getCentersByPincode (pincode) {
        const res = await httpCowin({
            method: 'GET',
            url: '/api/v2/appointment/sessions/public/calendarByPin',
            params: {
                pincode,
                date: this._getToday()
            }
        })
        return res.data.centers
    }

    /**
     * @param {string} token JWT Token 
     * @returns {Promise<ArrayBuffer>} arraybuffer of pdf file
     */
    static async downloadCertificatae (token, beneficiary_reference_id) {
        const res = await httpCowin({
            method: 'GET',
            url: '/api/v2/registration/certificate/download',
            params: {
                beneficiary_reference_id
            },
            headers: {
                authorization: 'Bearer ' + token
            },
            responseType: 'arraybuffer'
        })
        return res.data
    }
    
    /**
     * Schedules appointment for beneficiary
     * @param {string} token JWT token
     * @param {Object} payload required payload
     * @returns {Promise<string>} appointment id
     */
    static async schedule (token, payload={ beneficiaries, dose, slot, session_id }) {
        const res = await httpCowin({
            method: 'POST',
            url: '/api/v2/appointment/schedule',
            data: payload,
            headers: {
                authorization: 'Bearer ' + token
            }
        })
        return res.data.appointment_id
    }
}

module.exports = Cowin
