// utils/constants.js
export const countries = {
    US: "United States",
    CA: "Canada",
    MX: "Mexico",
    BR: "Brazil",
    AR: "Argentina",
    CO: "Colombia",
    UK: "United Kingdom",
    FR: "France",
    DE: "Germany",
    IT: "Italy",
    ES: "Spain",
    NL: "Netherlands",
    SE: "Sweden",
    CN: "China",
    JP: "Japan",
    KR: "South Korea",
    IN: "India",
    PK: "Pakistan",
    BD: "Bangladesh",
    ID: "Indonesia",
    MY: "Malaysia",
    SG: "Singapore",
    TH: "Thailand",
    VN: "Vietnam",
    PH: "Philippines",
    AE: "United Arab Emirates",
    SA: "Saudi Arabia",
    TR: "Turkey",
    AU: "Australia",
    NZ: "New Zealand",
    ZA: "South Africa",
    NG: "Nigeria",
    EG: "Egypt",
  };
  
  // utils/botUtils.js
  export const generateBotName = (country: string) => {
    const firstNames = {
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
    };
  
    const lastNames = {
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
    };
  
    const countryFirstNames = firstNames[country as keyof typeof firstNames] || firstNames.DEFAULT;
    const countryLastNames = lastNames[country as keyof typeof lastNames] || lastNames.DEFAULT;
  
    const randomFirst = countryFirstNames[Math.floor(Math.random() * countryFirstNames.length)];
    const randomLast = countryLastNames[Math.floor(Math.random() * countryLastNames.length)];
  
    return `${randomFirst} ${randomLast}`;
  };