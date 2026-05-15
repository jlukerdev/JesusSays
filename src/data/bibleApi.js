import { ApiBibleClient } from './ApiBibleClient.js'

const apiKey = import.meta.env.VITE_BIBLE_API_KEY ?? ''

export const bibleApi = new ApiBibleClient(apiKey)
