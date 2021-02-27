import path from 'path'
import fs from 'fs'

class database {
    private rootDir = path.resolve('.')
    private pathDatabase = `${this.rootDir}/database.json`

    init() {
        try {
            const existDatabase = fs.existsSync(this.pathDatabase)

            if (!existDatabase) {
                fs.writeFileSync(this.pathDatabase, '{"schedules": []}')
            }

            return true
        } catch { return false }
    }

    get() {
        try {
            const existDatabase = fs.existsSync(this.pathDatabase)

            if (!existDatabase) {
                fs.writeFileSync(this.pathDatabase, '{"schedules": []}')
            }

            const fileBuffer = fs.readFileSync(this.pathDatabase, 'utf-8')
            return JSON.parse(fileBuffer)
        } catch { return false }
    }

    update(data: []) {
        try {
            const existDatabase = fs.existsSync(this.pathDatabase)

            if (!existDatabase) {
                fs.writeFileSync(this.pathDatabase, '{"schedules": []}')
            }

            const schedules = `{"schedules": ${JSON.stringify(data)}}`
            fs.writeFileSync(this.pathDatabase, schedules)

            return true
        } catch { return false }
    }
}
export default new database()