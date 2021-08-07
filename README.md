# Cowin API Wrapper Library

- A Node.js Cowin Wrapper library to manage vaccination.

### Features

- Access to all endpoints
- Can use both Private/Public APIs
- With JSDoc

### How to use

1. Firstly clone the repo

```sh
git clone https://github.com/SwapnilSoni1999/cowin-wrapper.git
```

2. Include the lib in your js file

```js
const cowin = require('./cowin-wrapper')

(async () => {
    const number = "Your 10 digit number"
    const txnId = await cowin.sendOtp(number)

    const otp = "Your otp"
    const otp = await scanf('Enter OTP:')
    const token = await cowin.verifyOtp(txnId, otp)
    const benef = await cowin.getBeneficiaries(token)
    console.log('Token', token)
    console.log('Beneficiaries', benef)
    process.exit()
})()
```

3. Run the file

<hr>

<b>You can use test file to check if the api is working or not.</b>

<hr>

#### License
Swapnil Soni &copy;
