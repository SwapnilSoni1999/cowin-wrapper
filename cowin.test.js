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

    // try {
        // await cowin.addBeneficiary({ name: 'Swapnil SONI', birth_year: '1999', gender_id: 1, photo_id_type: 1, photo_id_number: '6069' }, token)
    // } catch (err) {
    //     console.log(err.response)
    // }
    const benef = await cowin.getBeneficiaries(token)
    console.log(benef)
    
    const pincode = await scanf('Enter your pincode (eg. 388061):')
    const centers = await cowin.getCentersByPincode(pincode, token)
    console.log(centers)
    
    const allBen = benef.map((b, c) => `${++c}. ${b.name}`)
    console.log(
        `Choose beneficiary to delete.\n\t`,
        allBen.join('\n\t')
    )

    const di = await scanf('Choose beneficiary to book:')
    // console.log('beneficiary:', benef[+di - 1].beneficiary_reference_id)
    // await cowin.deleteBeneficiary(token, benef[+di - 1].beneficiary_reference_id)

    // console.log('Added beneficiary!')
    // await cowin.downloadCertificatae(token, benef[+di - 1].beneficiary_reference_id)
    // try {
    //     const appointmentId = await cowin.schedule(token, { beneficiaries: [benef[+di - 1].beneficiary_reference_id], slot: '03:00PM-06:00PM', session_id: '33f72d3e-43e6-4708-b0de-f78a55324cb8', dose: 1 })
    //     console.log('Successfully booked appointment.', appointmentId)
    // } catch (err) {
    //     console.log(err.response.data)
    // }
    // const mappedBenef = benef.map((b, c) => ((b.dose1_date || b.dose2_date) ? `${++c}. ${b.name}` : null), 0)
    // if (mappedBenef.length) {
    //     console.log(
    //         'Choose beneficiary to download certificate from:\n\t',
    //         mappedBenef.join('\n\t')
    //     )
    
    //     const index = await scanf('Choose Beneficiary to download Certificate:')
    try {
        const buf = await cowin.downloadCertificatae(token, benef[+di -1].beneficiary_reference_id)
        fs.writeFileSync('certificate.pdf', buf, { encoding: 'binary' })
        console.log('Saved certificate!')
    } catch (err) {
        console.log(err.response.data.toString())
    }
    // } else {
    //     console.log('None of the beneficiaries got vaccinated. Hence, No certificate is there to download.')
    // }

    process.exit()
})()
