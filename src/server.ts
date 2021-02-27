import express from 'express'
import database from './utils/database'
import router from './routes'

process.env.TZ = 'America/Bahia'

database.init()

const app = express()

app.use(express.json())
app.use(router)

app.listen(3333, () => console.log('Server Started'))