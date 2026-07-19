import { delay } from './client'
import { mockUsers } from '@/constants/mockData'

let users = [...mockUsers]

export async function getUsers(params = {}) {
  await delay(500)
  let filtered = [...users]

  if (params.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
    )
  }

  if (params.role) {
    filtered = filtered.filter((u) => u.role === params.role)
  }

  return { data: filtered, total: filtered.length }
}

export async function getUserById(id) {
  await delay(300)
  const user = users.find((u) => u.id === id)
  if (!user) throw new Error('User not found')
  return user
}

export async function updateUser(id, data) {
  await delay(500)
  users = users.map((u) => (u.id === id ? { ...u, ...data } : u))
  return users.find((u) => u.id === id)
}

export async function deleteUser(id) {
  await delay(400)
  users = users.filter((u) => u.id !== id)
  return { message: 'User removed' }
}

export async function inviteUser(data) {
  await delay(600)
  const newUser = {
    id: String(Date.now()),
    ...data,
    status: 'active',
    lastActive: new Date().toISOString(),
  }
  users.push(newUser)
  return newUser
}
