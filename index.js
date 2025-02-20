require("dotenv").config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')


const Person = require('./models/person')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(url)
    .then(result => {
        console.log("Connected to MongoDB")
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB: ", error.message)
    })

app.use(cors())
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url - :response-time[3] ms :body'))

app.use(express.json())

let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "040-1239-44-52526"
    },
    {
        id: "3",
        name: "Dan Abramob",
        number: "12-23-455678"
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-23-64442424"
    }
]

app.use(express.static('dist'))

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (body.name === undefined) {
        return response.status(400).json({
            error: 'name is missing'
        })
    } else if (body.number === undefined) {
        return response.status(400).json({
            error: 'number is missing'
        })
    } else if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'Name already in Phonebook'
        })
    }
    const person = new Person({
        name: body.name,
        number: body.number
    })
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.get('/', (request, response) => {
    response.send('<h1>Persons frontpage<h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({})
        .then(persons => {
            response.json(persons)
        })
        .catch(error => {
            console.log(error)
            response.status(500).json({ error: 'something went wrong fetching from database' })
        })
})

app.get('/info', (request, response) => {
    const d = new Date()
    response.send(`<p>Phonebook has info for ${persons.length} people<p> 
                    <p> ${d}`)
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(note => {
        if (person) {
            response.json(note)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        if (result) {
            response.status(204).end()
        } else {
            response.status(404).json({error: "person not found"})
        }
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)

// Important to implement error handler after every other middleware!
const errorHandler = (error,request,response,next) => {
    console.error(error.message)
    if (error.name === "CastError") {
        return response.status(400).send({error: "malformatted id"})
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})