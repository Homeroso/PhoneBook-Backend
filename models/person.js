const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url, '...')

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })
 
const numberCheck = (v) => {
    return /^([0-9]+[-][0-9]+)$/.test(v)
}

const validNumber = (v) => {
    console.log('Position: ', v.search('-'))
    return v.search('-') === 2 || v.search('-') === 3
}

const validators = [
    {validator: numberCheck, message: props => `${props.value} is not a valid phone number!`},
    {validator: validNumber, message: props => `${props.value} is not a valid phone number!`}
]

const personSchema = mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        required: true,
        validate: validators
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

module.exports = mongoose.model('Person', personSchema)