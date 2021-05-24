const { default: axios } = require('axios')
const adharValidator = require('aadhaar-validator')
const crypto = require('crypto')

const sha256 = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex')
}

const headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
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

}
