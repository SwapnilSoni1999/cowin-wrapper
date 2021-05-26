const cowin = require('./index')
const readline = require('readline')

const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function scanf (question) {
    return new Promise((resolve, reject) => {
        interface.question(question, (ans) => resolve(ans))
    })
}

(async () => {
    const number = await scanf('Enter your number (10 digit):')
    const txnId = await cowin.sendOtp(number)
    const otp = await scanf('Enter OTP:')
    const token = await cowin.verifyOtp(txnId, otp)

    const benef = await cowin.getBeneficiaries(token)
    console.log(benef)
    process.exit()
})()
