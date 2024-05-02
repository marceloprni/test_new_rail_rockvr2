// eslind-disable-next-line
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    user: {
      id: string
      user: string
      usersession_id: string
    }
    refeicao: {
      id: string
      refeicao: string
      created_at: datetime
      dieta: boolean
      user_id: string
    }
  }
}
