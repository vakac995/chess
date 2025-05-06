import { z } from 'zod';
import { createFormAtom } from '../../hooks/useJotaiForm';
import { loginSchema } from './schemas';

export type LoginFormData = z.infer<typeof loginSchema>;

export const loginFormAtoms = createFormAtom<LoginFormData>();
