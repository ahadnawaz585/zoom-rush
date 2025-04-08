// utils/botUtils.ts
import { CountryCode } from '@/app/data/constants';
import { generateUniqueIndianNames } from './indianNames'; // Adjust path as needed
 // Adjust path as needed

export const generateBotName = (country: CountryCode | string): string => {
  const firstNames: Record<CountryCode | "DEFAULT", string[]> = {
    US: ["John", "Mary", "James", "Sarah", "Michael", "Elizabeth"],
    UK: ["Oliver", "Emma", "Harry", "Sophie", "William", "Charlotte"],
    CA: ["Liam", "Olivia", "Noah", "Emma", "Lucas", "Sophia"],
    FR: ["Lucas", "Emma", "Gabriel", "Léa", "Louis", "Chloé"],
    DE: ["Paul", "Marie", "Felix", "Sophie", "Max", "Anna"],
    IT: ["Leonardo", "Sofia", "Francesco", "Aurora", "Alessandro", "Giulia"],
    ES: ["Hugo", "Lucia", "Martin", "Sofia", "Pablo", "Maria"],
    JP: ["Haruto", "Yui", "Yuto", "Aoi", "Sota", "Akari"],
    CN: ["Wei", "Xia", "Ming", "Hui", "Li", "Yan"],
    IN: ["Arjun", "Priya", "Arun", "Divya", "Raj", "Anjali"],
    PK: ["Ali", "Fatima", "Hassan", "Ayesha", "Ahmed", "Zara"],
    BD: ["Rahman", "Aisha", "Kamal", "Nadia", "Hasan", "Mim"],
    ID: ["Budi", "Siti", "Dian", "Putri", "Adi", "Maya"],
    MY: ["Ahmad", "Nurul", "Ibrahim", "Siti", "Mohammed", "Fatimah"],
    SG: ["Wei Ming", "Hui Ling", "Jun Jie", "Li Mei", "Zhi Wei", "Xiu Ying"],
    TH: ["Somchai", "Malee", "Chai", "Siri", "Pitch", "Nim"],
    VN: ["Minh", "Linh", "Duc", "Mai", "Tuan", "Hoa"],
    PH: ["Juan", "Maria", "Jose", "Rosa", "Miguel", "Clara"],
    BR: ["Pedro", "Ana", "João", "Maria", "Lucas", "Julia"],
    AR: ["Santiago", "Sofia", "Mateo", "Isabella", "Benjamin", "Valentina"],
    AU: ["Jack", "Charlotte", "William", "Olivia", "Noah", "Ava"],
    DEFAULT: ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey"],
    // Add missing countries with defaults or specific names if needed
    MX: ["Juan", "Maria", "Jose", "Rosa", "Miguel", "Clara"],
    CO: ["Santiago", "Sofia", "Mateo", "Isabella", "Juan", "Valentina"],
    NL: ["Lars", "Sophie", "Jan", "Emma", "Thomas", "Julia"],
    SE: ["Erik", "Anna", "Lars", "Emma", "Johan", "Sofia"],
    KR: ["Min-jun", "Ji-woo", "Seo-jun", "Ha-yoon", "Joon-ho", "Ye-jin"],
    AE: ["Mohammed", "Fatima", "Ahmed", "Aisha", "Ali", "Zainab"],
    SA: ["Khalid", "Noura", "Fahad", "Laila", "Abdullah", "Sara"],
    TR: ["Ahmet", "Ayşe", "Mehmet", "Fatma", "Mustafa", "Elif"],
    NZ: ["Jack", "Charlotte", "James", "Sophie", "William", "Olivia"],
    ZA: ["Sipho", "Lerato", "Thabo", "Nomsa", "Jabu", "Thandi"],
    NG: ["Chukwu", "Ngozi", "Emeka", "Amina", "Tunde", "Fatima"],
    EG: ["Ahmed", "Fatima", "Mohamed", "Aisha", "Hassan", "Sara"],
  };

  const lastNames: Record<CountryCode | "DEFAULT", string[]> = {
    US: ["Smith", "Johnson", "Brown", "Davis", "Wilson", "Anderson"],
    UK: ["Smith", "Jones", "Williams", "Taylor", "Brown", "Davies"],
    CA: ["Smith", "Brown", "Tremblay", "Martin", "Roy", "Wilson"],
    FR: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard"],
    DE: ["Mueller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer"],
    IT: ["Rossi", "Ferrari", "Russo", "Romano", "Colombo", "Ricci"],
    ES: ["Garcia", "Rodriguez", "Martinez", "Lopez", "Sanchez", "Gonzalez"],
    JP: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Yamamoto"],
    CN: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang"],
    IN: ["Kumar", "Singh", "Sharma", "Patel", "Verma", "Gupta"],
    PK: ["Khan", "Ahmed", "Ali", "Malik", "Qureshi", "Syed"],
    BD: ["Islam", "Rahman", "Hossain", "Ahmed", "Akter", "Begum"],
    ID: ["Wijaya", "Suharto", "Sukarno", "Kusuma", "Santoso", "Hidayat"],
    MY: ["Tan", "Lee", "Wong", "Abdullah", "Kumar", "Singh"],
    SG: ["Tan", "Lim", "Lee", "Ng", "Wong", "Chan"],
    TH: ["Saetang", "Srisuk", "Chaiyasit", "Somboon", "Ratanakul", "Chaisuwan"],
    VN: ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Phan"],
    PH: ["Santos", "Reyes", "Cruz", "Garcia", "Torres", "Lim"],
    BR: ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira"],
    AR: ["Gonzalez", "Rodriguez", "Fernandez", "Lopez", "Martinez", "Garcia"],
    AU: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor"],
    DEFAULT: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia"],
    // Add missing countries with defaults or specific names if needed
    MX: ["Garcia", "Rodriguez", "Martinez", "Lopez", "Hernandez", "Gonzalez"],
    CO: ["Rodriguez", "Gomez", "Martinez", "Lopez", "Garcia", "Hernandez"],
    NL: ["De Vries", "Van Dijk", "Jansen", "De Boer", "Visser", "Smit"],
    SE: ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson"],
    KR: ["Kim", "Lee", "Park", "Choi", "Jung", "Kang"],
    AE: ["Al Maktoum", "Al Nahyan", "Hassan", "Ali", "Ahmed", "Mohammed"],
    SA: ["Al Saud", "Al Rajhi", "Bin Laden", "Al Ghamdi", "Al Qahtani", "Al Harbi"],
    TR: ["Yilmaz", "Kaya", "Demir", "Celik", "Sahin", "Ozturk"],
    NZ: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor"],
    ZA: ["Nkosi", "Ndlovu", "Mkhize", "Dlamini", "Khoza", "Mabaso"],
    NG: ["Adebayo", "Okafor", "Bello", "Abdullahi", "Eze", "Ibrahim"],
    EG: ["Hassan", "Mohamed", "Ahmed", "Ali", "Ibrahim", "Khalil"],
  };

  const countryFirstNames = firstNames[country as CountryCode] || firstNames.DEFAULT;
  const countryLastNames = lastNames[country as CountryCode] || lastNames.DEFAULT;

  const randomFirst = countryFirstNames[Math.floor(Math.random() * countryFirstNames.length)];
  const randomLast = countryLastNames[Math.floor(Math.random() * countryLastNames.length)];

  return `${randomFirst} ${randomLast}`;
};

export const generateUniqueBotNames = (country: CountryCode | string, quantity: number): string[] => {
  if (country === "IN") {
    return generateUniqueIndianNames(quantity, "mixed"); // Use Indian dataset for IN
  }

  const firstNames: Record<CountryCode | "DEFAULT", string[]> = {
    US: ["John", "Mary", "James", "Sarah", "Michael", "Elizabeth"],
    UK: ["Oliver", "Emma", "Harry", "Sophie", "William", "Charlotte"],
    CA: ["Liam", "Olivia", "Noah", "Emma", "Lucas", "Sophia"],
    FR: ["Lucas", "Emma", "Gabriel", "Léa", "Louis", "Chloé"],
    DE: ["Paul", "Marie", "Felix", "Sophie", "Max", "Anna"],
    IT: ["Leonardo", "Sofia", "Francesco", "Aurora", "Alessandro", "Giulia"],
    ES: ["Hugo", "Lucia", "Martin", "Sofia", "Pablo", "Maria"],
    JP: ["Haruto", "Yui", "Yuto", "Aoi", "Sota", "Akari"],
    CN: ["Wei", "Xia", "Ming", "Hui", "Li", "Yan"],
    IN: ["Arjun", "Priya", "Arun", "Divya", "Raj", "Anjali"],
    PK: ["Ali", "Fatima", "Hassan", "Ayesha", "Ahmed", "Zara"],
    BD: ["Rahman", "Aisha", "Kamal", "Nadia", "Hasan", "Mim"],
    ID: ["Budi", "Siti", "Dian", "Putri", "Adi", "Maya"],
    MY: ["Ahmad", "Nurul", "Ibrahim", "Siti", "Mohammed", "Fatimah"],
    SG: ["Wei Ming", "Hui Ling", "Jun Jie", "Li Mei", "Zhi Wei", "Xiu Ying"],
    TH: ["Somchai", "Malee", "Chai", "Siri", "Pitch", "Nim"],
    VN: ["Minh", "Linh", "Duc", "Mai", "Tuan", "Hoa"],
    PH: ["Juan", "Maria", "Jose", "Rosa", "Miguel", "Clara"],
    BR: ["Pedro", "Ana", "João", "Maria", "Lucas", "Julia"],
    AR: ["Santiago", "Sofia", "Mateo", "Isabella", "Benjamin", "Valentina"],
    AU: ["Jack", "Charlotte", "William", "Olivia", "Noah", "Ava"],
    DEFAULT: ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey"],
    MX: ["Juan", "Maria", "Jose", "Rosa", "Miguel", "Clara"],
    CO: ["Santiago", "Sofia", "Mateo", "Isabella", "Juan", "Valentina"],
    NL: ["Lars", "Sophie", "Jan", "Emma", "Thomas", "Julia"],
    SE: ["Erik", "Anna", "Lars", "Emma", "Johan", "Sofia"],
    KR: ["Min-jun", "Ji-woo", "Seo-jun", "Ha-yoon", "Joon-ho", "Ye-jin"],
    AE: ["Mohammed", "Fatima", "Ahmed", "Aisha", "Ali", "Zainab"],
    SA: ["Khalid", "Noura", "Fahad", "Laila", "Abdullah", "Sara"],
    TR: ["Ahmet", "Ayşe", "Mehmet", "Fatma", "Mustafa", "Elif"],
    NZ: ["Jack", "Charlotte", "James", "Sophie", "William", "Olivia"],
    ZA: ["Sipho", "Lerato", "Thabo", "Nomsa", "Jabu", "Thandi"],
    NG: ["Chukwu", "Ngozi", "Emeka", "Amina", "Tunde", "Fatima"],
    EG: ["Ahmed", "Fatima", "Mohamed", "Aisha", "Hassan", "Sara"],
  };

  const lastNames: Record<CountryCode | "DEFAULT", string[]> = {
    US: ["Smith", "Johnson", "Brown", "Davis", "Wilson", "Anderson"],
    UK: ["Smith", "Jones", "Williams", "Taylor", "Brown", "Davies"],
    CA: ["Smith", "Brown", "Tremblay", "Martin", "Roy", "Wilson"],
    FR: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard"],
    DE: ["Mueller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer"],
    IT: ["Rossi", "Ferrari", "Russo", "Romano", "Colombo", "Ricci"],
    ES: ["Garcia", "Rodriguez", "Martinez", "Lopez", "Sanchez", "Gonzalez"],
    JP: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Yamamoto"],
    CN: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang"],
    IN: ["Kumar", "Singh", "Sharma", "Patel", "Verma", "Gupta"],
    PK: ["Khan", "Ahmed", "Ali", "Malik", "Qureshi", "Syed"],
    BD: ["Islam", "Rahman", "Hossain", "Ahmed", "Akter", "Begum"],
    ID: ["Wijaya", "Suharto", "Sukarno", "Kusuma", "Santoso", "Hidayat"],
    MY: ["Tan", "Lee", "Wong", "Abdullah", "Kumar", "Singh"],
    SG: ["Tan", "Lim", "Lee", "Ng", "Wong", "Chan"],
    TH: ["Saetang", "Srisuk", "Chaiyasit", "Somboon", "Ratanakul", "Chaisuwan"],
    VN: ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Phan"],
    PH: ["Santos", "Reyes", "Cruz", "Garcia", "Torres", "Lim"],
    BR: ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira"],
    AR: ["Gonzalez", "Rodriguez", "Fernandez", "Lopez", "Martinez", "Garcia"],
    AU: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor"],
    DEFAULT: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia"],
    MX: ["Garcia", "Rodriguez", "Martinez", "Lopez", "Hernandez", "Gonzalez"],
    CO: ["Rodriguez", "Gomez", "Martinez", "Lopez", "Garcia", "Hernandez"],
    NL: ["De Vries", "Van Dijk", "Jansen", "De Boer", "Visser", "Smit"],
    SE: ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson"],
    KR: ["Kim", "Lee", "Park", "Choi", "Jung", "Kang"],
    AE: ["Al Maktoum", "Al Nahyan", "Hassan", "Ali", "Ahmed", "Mohammed"],
    SA: ["Al Saud", "Al Rajhi", "Bin Laden", "Al Ghamdi", "Al Qahtani", "Al Harbi"],
    TR: ["Yilmaz", "Kaya", "Demir", "Celik", "Sahin", "Ozturk"],
    NZ: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor"],
    ZA: ["Nkosi", "Ndlovu", "Mkhize", "Dlamini", "Khoza", "Mabaso"],
    NG: ["Adebayo", "Okafor", "Bello", "Abdullahi", "Eze", "Ibrahim"],
    EG: ["Hassan", "Mohamed", "Ahmed", "Ali", "Ibrahim", "Khalil"],
  };

  const countryFirstNames = firstNames[country as CountryCode] || firstNames.DEFAULT;
  const countryLastNames = lastNames[country as CountryCode] || lastNames.DEFAULT;

  const usedNames = new Set<string>();
  const names: string[] = [];

  while (names.length < quantity) {
    const firstName = countryFirstNames[Math.floor(Math.random() * countryFirstNames.length)];
    const lastName = countryLastNames[Math.floor(Math.random() * countryLastNames.length)];
    const fullName = `${firstName} ${lastName}`;

    if (!usedNames.has(fullName)) {
      usedNames.add(fullName);
      names.push(fullName);
    }

    // If we've exhausted unique combinations, add a suffix
    if (usedNames.size >= countryFirstNames.length * countryLastNames.length) {
      for (let i = 1; names.length < quantity; i++) {
        names.push(`${firstName} ${lastName} ${i}`);
      }
      break;
    }
  }

  return names.slice(0, quantity);
};