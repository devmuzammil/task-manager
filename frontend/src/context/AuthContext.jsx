import { createContext } from 'react'

export const AuthContext = createContext({
  auth: { access: null, refresh: null, user: null },
  setAuth: () => {},
})
