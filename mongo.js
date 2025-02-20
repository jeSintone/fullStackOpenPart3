const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as requirement')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
`mongodb+srv://sintonejesse:${password}@phonebook.897vp.mongodb.net/?retryWrites=true&w=majority&appName=Phonebook`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const generateId = () => {
  const randomNumber = Math.floor(Math.random() * 999999)
  console.log(randomNumber)
  return randomNumber
}

if (process.argv.length === 3) {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
}

if (process.argv.length === 6 ) {
  const person = new Person({
    id:  generateId(),
    name: name,
    number: number
  })
  person.save().then(() => {
    console.log(`Added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}