import 'dotenv/config';

export function getEnvVariable(key: string): string {
  if (!process.env.hasOwnProperty(key)) {
    throw new Error(`Error in getting ${key} value please check .env file`);
  }
  return process.env[key]!;
}

export function getEnvVariableOrEmpty(key: string): string {
  if (!process.env.hasOwnProperty(key)) {
    return '';
  }
  return process.env[key]!;
}
