import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cckdwmrronsfuovsimtq.supabase.co';
const supabaseAnonKey = 'sb_publishable_HGFxUmUQVW3aRhbFDSH0vA_BQMd7MnI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);