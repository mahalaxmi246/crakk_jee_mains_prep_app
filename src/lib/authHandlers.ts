import { supabase } from './supabaseClient'

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  name?: string;
  email: string;
  password: string;
}

export const authHandlers = {
  login: async (data: LoginData): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      throw new Error(error.message)
    }
  },

  signup: async (data: SignupData): Promise<void> => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name || '',
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }
  }
};