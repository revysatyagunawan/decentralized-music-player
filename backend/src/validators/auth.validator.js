import { z } from 'zod';

export const exchangeSchema = z.object({
  id_token: z.string().min(20, 'id_token too short'),
});
