const cowin = require('../index')
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

    const beneficiaries = await cowin.getBeneficiaries(token,'demo')
    console.log('Listing beneficiaries.')
    console.log(beneficiaries.map((b, c) => `${++c}. ${b.name}`).join('\n'))
    
    for (const b of beneficiaries) {
        console.log(`Deleting ${b.name}...`)
        try {
            await cowin.deleteBeneficiary(token, b.beneficiary_reference_id)
            console.log(`Deleted ${b.name}!`)
        } catch (err) {
            if (err.response.data.errorCode === 'BENDOC0040') {
                console.log('Appointment detected! Removing all existing appointments...')
                for (const appointment of b.appointments) {
                    await cowin.cancelAppointment(token, { appointment_id: appointment.appointment_id, beneficiariesToCancel: [b.beneficiary_reference_id] })
                }
                console.log('Cleared all appointments.')
                await cowin.deleteBeneficiary(token, b.beneficiary_reference_id)
                console.log(`Deleted ${b.name}!`)   
            }
        }
    }

    console.log('Deleted all beneficiaries!')
    process.exit()
})()
