require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
// eslint-disable-next-line no-unused-vars
morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('dist'))

let data = [
  {
    'id': 1,
    'name': 'Arto Hellas',
    'number': '040-123456'
  },
  {
    'id': 2,
    'name': 'Ada Lovelace',
    'number': '39-44-5323523'
  },
  {
    'id': 3,
    'name': 'Dan Abramov',
    'number': '12-43-234345'
  },
  {
    'id': 4,
    'name': 'Mary Poppendieck',
    'number': '39-23-6423122'
  }
]

app.get('/api/persons', (request, response) => (
  Person.find({}).then(persons => {
    response.json(persons)
  })
))

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person){
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => {
      next(error)
    })
})

app.get('/info', (request, response) => {
  let date = new Date()
  let count = Person.find({}).countDocuments()

  response.send(`<h4>Phonebook has info for ${count} people</h4> <p>${date}</p>`)
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    // eslint-disable-next-line no-unused-vars
    .then(_result => {
      response.status(204).end()
    })
    .catch(error => {
      next(error)
    })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name){
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (!body.number){
    return response.status(400).json({
      error: 'number missing'
    })
  }
  if (data.find(person => person.name === body.name)){
    return response.status(400).json({
      error: 'name is already in the phonebook'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save({ runValidators: true }).then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => {
    next(error)
  })

})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => {
      next(error)
    })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})