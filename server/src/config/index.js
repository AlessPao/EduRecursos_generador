import dotenv from 'dotenv';

dotenv.config();

export const dbUrl = process.env.db_url;
export const port = process.env.PORT || 5000;
export const sessionSecret = process.env.SESSION_SECRET;
export const llm_base_url = process.env.llm_base_url;
export const offenrouter_api_key = process.env.offenrouter_api_key;
export const llm_model = process.env.llm_model;
export const nodeEnv = process.env.NODE_ENV || 'development';
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;