export interface AuthCredentials {
  username: string;
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  email: string;
}

export async function login(credentials: AuthCredentials): Promise<UserProfile> {
  return Promise.resolve({
    id: 'user-1',
    name: 'Jordan Reyes',
    role: 'Supervisor',
    email: 'jordan.reyes@maintix.ai'
  });
}
