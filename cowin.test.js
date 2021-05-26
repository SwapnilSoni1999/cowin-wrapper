const cowin = require('./index')
const readline = require('readline')
const fs = require('fs')

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

    const pincode = await scanf('Enter your pincode (eg. 388061):')
    const centers = await cowin.getCentersByPincode(pincode)
    console.log(centers)

    const mappedBenef = benef.map((b, c) => ((b.dose1_date || b.dose2_date) ? `${++c}. ${b.name}` : null), 0)
    if (mappedBenef.length) {
        console.log(
            'Choose beneficiary to download certificate from:\n\t',
            mappedBenef.join('\n\t')
        )
    
        const index = await scanf('Choose Beneficiary to download Certificate:')
        const buf = await cowin.downloadCertificatae(token, benef[+index -1].beneficiary_reference_id)
        fs.writeFileSync('certificate.pdf', buf, { encoding: 'binary' })
        console.log('Saved certificate!')
    } else {
        console.log('None of the beneficiaries got vaccinated. Hence, No certificate is there to download.')
    }

    process.exit()
})()
