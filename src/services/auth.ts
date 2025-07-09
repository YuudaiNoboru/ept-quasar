import { api } from 'boot/axios';

interface LoginPayload {
  email: string;
  password: string;
}

export async function login(credentials: LoginPayload) {
  const formData = new URLSearchParams();

  formData.append('username', credentials.email);
  formData.append('password', credentials.password);

  const response = await api.post('api/v1/auth/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response;
}
