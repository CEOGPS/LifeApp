type Row = Record<string, unknown> & { id?: string };

function entityApi() {
  return {
    list: async (_order?: string): Promise<Row[]> => [],
    filter: async (_query?: unknown): Promise<Row[]> => [],
    get: async (_id?: string): Promise<Row | null> => null,
    create: async (data: Row = {}): Promise<Row> => ({ id: crypto.randomUUID(), ...data }),
    update: async (_id: string, data: Row = {}): Promise<Row> => data,
    delete: async (_id?: string): Promise<void> => {},
  };
}

export const db = {
  auth: {
    isAuthenticated: async () => false,
    me: async () => null,
    logout: (_redirect?: string) => {},
    redirectToLogin: (_redirect?: string) => {},
  },
  entities: new Proxy(
    {},
    {
      get: () => entityApi(),
    },
  ),
};

export function useAuth() {
  return {
    user: null,
    isAuthenticated: false,
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    authError: null as null,
    appPublicSettings: null as null,
    authChecked: true,
    logout: (_redirect?: boolean) => {},
    navigateToLogin: () => {},
    checkUserAuth: async () => {},
    checkAppState: async () => {},
  };
}
