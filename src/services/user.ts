import { api } from 'boot/axios';

interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
}

export function createUser(userData: CreateUserPayload) {
  return api.post('/api/v1/users/', userData);
}
