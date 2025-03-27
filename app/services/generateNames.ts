import { generateIndianNames } from '@/lib/indianNames';

export interface NameGenerationOptions {
  quantity: number;
  gender?: 'male' | 'female' | 'mixed';
}

export function generateBotNames(options: NameGenerationOptions): string[] {
  const { quantity, gender = 'mixed' } = options;
  
  return generateIndianNames(quantity, gender);
}