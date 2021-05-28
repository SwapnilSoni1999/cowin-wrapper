const { default: axios } = require('axios')
const crypto = require('crypto')

const sha256 = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex')
}

const httpCowinPrivate = axios.create({
    baseURL: 'http://cdn-api.co-vin.in',
    headers: {
        'authority': 'cdn-api.co-vin.in',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
        'accept': 'application/json, text/plain, */*',
        'sec-ch-ua-mobile': '?0',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
        'content-type': 'application/json',
        'origin': 'http://cdn-api.co-vin.in',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'accept-language': 'en-US,en-IN;q=0.9,en;q=0.8',
        'x-api-key': '3sjOr2rmM52GzhpMHjDEE1kpQeRxwFDr4YcBEimi'
    }
})

const httpCowinDemo = axios.create({
    baseURL: 'http://cdndemo-api.co-vin.in',
    headers: {
        'authority': 'cdndemo-api.co-vin.in',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
        'accept': 'application/json, text/plain, */*',
        'sec-ch-ua-mobile': '?0',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
        'content-type': 'application/json',
        'origin': 'http://cdndemo-api.co-vin.in',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
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
     * @param {'private'|'demo'} api choose api
     * @returns {Promise<string>} Txn ID
     */
    static async sendOtp(number, api='demo') {
        const config = {
            method: 'POST',
            url: `/api/v2/auth/${api === 'private' ? 'generateMobileOTP' : 'generateOTP'}`,
            data: {
                mobile: number
            }
        }
        if (api === 'private') {
            config.data.secret = 'U2FsdGVkX19gg1fHCWvmS/3a8YterUFO8gpnXGCile+XwRAIcUa6UsxGPxrc4KE6g4Ne4ewcvKYhs+1ObNBTPQ=='
        }
        switch (api) {
            case 'private': {
                const res = await httpCowinPrivate(config)
                return res.data.txnId
            }
            default: {
                const res = await httpCowinDemo(config)
                return res.data.txnId
            }
        }
    }

    /**
     * @param {string} txnId Transaction id from sendOtp
     * @param {number} otp otp number
     * @param {'private'|'demo'} api choose api
     * @returns {Promise<string>} JWT Token
     */
    static async verifyOtp(txnId, otp, api='demo') {
        const config = {
            method: 'POST',
            url: `/api/v2/auth/${api === 'demo' ? 'confirmOTP' : 'validateMobileOtp'}`,
            data: {
                otp: sha256(otp),
                txnId
            }
        }
        switch(api) {
            case 'private': {
                const res = await httpCowinPrivate(config)
                return res.data.token
            }
            default: {
                const res = await httpCowinDemo(config)
                return res.data.token
            }
        }
    }
    
    /**
     * @param {string} token JWT token
     * @param {'private'|'demo'} api choose api
     * @returns {Promise<Array>} beneficiaries
     */
    static async getBeneficiaries(token, api='demo') {
        const config = {
            method: 'GET',
            url: '/api/v2/appointment/beneficiaries',
            headers: {
                authorization: 'Bearer ' + token
            }
        }
        switch(api) {
            case 'private': {
                const res = await httpCowinPrivate(config)
                return res.data.beneficiaries
            }
            default: {
                const res = await httpCowinDemo(config)
                return res.data.beneficiaries
            }
        }
    }

    /**
     * @returns {Promise<Array>} ID types
     */
    static async getIdTypes() {
        const res = await httpCowinDemo({
            method: 'GET',
            url: '/api/v2/registration/beneficiary/idTypes',
        })
        return res.data.types
    }

    /**
     * @returns {Promise<Array>} Gender types
     */
    static async getGenders() {
        const res = await httpCowinDemo({
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
        const res = await httpCowinDemo({
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
        const res = await httpCowinDemo({
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
    static async getCentersByPincode (pincode, token) {
        const res = await httpCowinDemo({
            method: 'GET',
            url: '/api/v2/appointment/sessions/calendarByPin',
            params: {
                pincode,
                date: this._getToday()
            },
            headers: {
                authorization: 'Bearer ' + token
            }
        })
        return res.data.centers
    }

    /**
     * @param {string} token JWT Token
     * @param {'private'|'demo'} api choose api
     * @returns {Promise<ArrayBuffer>} arraybuffer of pdf file
     */
    static async downloadCertificatae (token, beneficiary_reference_id, api='demo') {
        const config = {
            method: 'GET',
            url: '/api/v2/registration/certificate/download',
            params: {
                beneficiary_reference_id
            },
            headers: {
                authorization: 'Bearer ' + token
            },
            responseType: 'arraybuffer'
        }
        switch(api) {
            case 'private': {
                const res = await httpCowinPrivate(config)
                return res.data
            }
            default: {
                const res = await httpCowinDemo(config)
                return res.data
            }
        }
    }
    
    /**
     * Schedules appointment for beneficiary
     * @param {string} token JWT token
     * @param {{beneficiaries: Array<string>, dose: number, slot: string, session_id: string}} payload required payload
     * @returns {Promise<string>} appointment id
     */
    static async schedule (token, payload={ beneficiaries, dose, slot, session_id }) {
        const res = await httpCowinDemo({
            method: 'POST',
            url: '/api/v2/appointment/schedule',
            data: payload,
            headers: {
                authorization: 'Bearer ' + token
            }
        })
        return res.data
    }

    /**
     * @param {string} token JWT token
     * @param {{appointment_id: string, beneficiariesToCancel: Array<string>}} payload payload to cancel for
     * @param {'demo'|'private'} api Private API
     * @returns {Promise<number>} status code 204
     */
    static async cancelAppointment (token, payload={ appointment_id, beneficiariesToCancel }, api='demo') {
        const config = {
            method: 'POST',
            url: '/api/v2/appointment/cancel',
            data: payload,
            headers: {
                authorization: 'Bearer ' + token
            }
        }
        switch (api) {
            case 'private': {
                const res = await httpCowinPrivate(config)
                return res.status
            }
            default: {
                const res = await httpCowinDemo(config)
                return res.status
            }
        }
    }
}

module.exports = Cowin
