const { default: axios } = require('axios')
const adharValidator = require('aadhaar-validator')
const crypto = require('crypto')

const sha256 = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex')
}

const headers = {
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
    'accept-language': 'en-US,en-IN;q=0.9,en;q=0.8'
}

class Cowin {
    /**
     * @param {number} number Mobile number 10digit
     * @returns {string} Txn ID
     */
    static async sendOtp(number) {
        const res = await axios({
            method: 'POST',
            url: 'http://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP',
            data: {
                mobile: number,
                secret: "U2FsdGVkX19at5EJPMYRe6TTDK4WWA2Nyb6b6c+QAmcYQjuhurrk6+CUqmMKHtSeaETDAIuXC+7Jz+ioZvkG+Q=="
            },
            headers
        })

        return res.data.txnId
    }

    /**
     * @param {string} txnId Transaction id from sendOtp
     * @param {number} otp otp number
     * @returns {Array} JWT Token
     */
    static async verifyOtp(txnId, otp) {
        const res = await axios({
            method: 'POST',
            url: 'http://cdn-api.co-vin.in/api/v2/auth/validateMobileOtp',
            data: {
                otp: sha256(otp),
                txnId: txnId
            },
            headers
        })
        return res.data.token
    }
    
    /**
     * @param {string} token JWT token
     * @returns {Array}
     */
    static async getBeneficiaries(token) {
        const res = await axios({
            method: 'GET',
            url: 'http://cdn-api.co-vin.in/api/v2/appointment/beneficiaries',
            headers: {
                ...headers,
                authorization: 'Bearer ' + token
            }
        })
        return res.data.beneficiaries
    }

    /**
     * @returns {Array} ID types
     */
    static async getIdTypes() {
        const res = await axios({
            method: 'GET',
            url: ' https://cdn-api.co-vin.in/api/v2/registration/beneficiary/idTypes',
            headers
        })
        return res.data.types
    }

    /**
     * @returns {Array} Gender types
     */
    static async getGenders() {
        const res = await axios({
            method: 'GET',
            url: 'https://cdn-api.co-vin.in/api/v2/registration/beneficiary/genders',
            headers
        })
        return res.data.genders
    }

    /**
     * @param {Object} {Data}
     * @param {string} token JWT
     * @returns 
     */
    static async addBeneficiary({ name, birth_year, gender_id, photo_id_type, photo_id_number }, token) {
        const res = await axios({
            method: 'POST',
            url: 'http://cdn-api.co-vin.in/api/v2/registration/beneficiary/new',
            headers: {
                ...headers,
                authorization: 'Bearer ' + token
            },
            data: {
                name,
                birth_year,
                gender_id,
                photo_id_type,
                photo_id_number,
                comorbidity_ind: "Y",
                consent_version: "V1"
            }
        })
        return res.data.beneficiary_reference_id
    }

    /**
     * @param {string} token JWT Token
     * @param {string} beneficiary_reference_id Beneficiary ID
     * @returns {number} status code 204
     */
    static async deleteBeneficiary (token, beneficiary_reference_id) {
        const res = await axios({
            method: 'POST',
            url: ' https://www.cowin.gov.in/api/v2/registration/beneficiary/delete',
            headers: {
                ...headers,
                authorization: 'Bearer ' + token
            },
            data: {
                beneficiary_reference_id
            }
        })
        return res.status
    }
}

module.exports = Cowin
