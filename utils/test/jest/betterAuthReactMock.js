const createAuthClient = () => ({
  useSession: () => ({
    data: null,
    error: null,
    isPending: false,
    isRefetching: false,
    refetch: async () => undefined,
  }),
  getAccessToken: async () => ({
    data: null,
    error: null,
  }),
  getSession: async () => ({
    data: null,
    error: null,
  }),
  signIn: {
    oauth2: async () => undefined,
  },
  signOut: async () => undefined,
  $store: {
    notify: () => undefined,
  },
})

module.exports = { createAuthClient }
