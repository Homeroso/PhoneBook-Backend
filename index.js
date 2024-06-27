const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

morgan.token('body', function (req, res) { 
    return JSON.stringify(req.body) 
})

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let data = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const generateId = () => {
    const maxId = Math.floor(Math.random() * 10000);
    return maxId
}

app.get('/api/persons', (request, response) => (
    response.json(data)
))

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = data.find(
        person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    let date = new Date()
    response.send(`<h4>Phonebook has info for ${data.length} people</h4> <p>${date}</p>`)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    data = data.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
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

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    data = data.concat(person)

    response.json(person)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
