import { ref, provide, inject } from 'vue'

const currentUserKey = Symbol('currentUser')

const currentUser = ref({
  name: '运维员',
  avatar: '运'
})

export const provideCurrentUser = () => {
  provide(currentUserKey, currentUser)
}

export const useCurrentUser = () => {
  const user = inject(currentUserKey)
  if (!user) {
    return currentUser
  }
  return user
}