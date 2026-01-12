import { io } from 'socket.io-client'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'

const socket = io('http://localhost:5000')

export const useSocket = () => {
  const user = useSelector(state => state.auth.user)
  
  useEffect(() => {
    if (user) {
      socket.emit('join', user.id)
    }
  }, [user])

  return socket
}

export default socket
