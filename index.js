const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')


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

const unknownEndpoint = (request,response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

const generateId = () => {
    const randomNumber = Math.floor(Math.random() * 999999)
    console.log(randomNumber)
    return randomNumber
}
app.post('/api/persons', (request,response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    } else if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'Name already in Phonebook'
        })
    }
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number,
    }
    persons = persons.concat(person)

    response.json(person)
})

app.get('/', (request,response) => {
    response.send('<h1>Persons frontpage<h1>')
})
app.get('/api/persons' ,(request,response) => {
    response.json(persons)
})
app.get('/info', (request, response) => {
    const d = new Date()
    response.send(`<p>Phonebook has info for ${persons.length} people<p> 
                    <p> ${d}`)
})
app.get('/api/persons/:id', (request,response) => {
    const id = request.params.id
    const person = persons.find(note => note.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})
app.delete('/api/persons/:id', (request,response) => {
    const id = Number(request.params.id)
    persons = persons.filter(note => note.id !== id)

    response.status(204).end()
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})