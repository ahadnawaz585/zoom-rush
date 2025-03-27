export const maleFirstNames = [
    "Aarav", "Aditya", "Arjun", "Rohan", "Vikram", "Amit", "Rahul", "Sanjay", 
    "Raj", "Vishal", "Kartik", "Nikhil", "Varun", "Karthik", "Mohit", "Vivek", 
    "Abhishek", "Deepak", "Gaurav", "Ravi", "Shubham", "Akash", "Sachin", "Rajesh", 
    "Suresh", "Prakash", "Naveen", "Manoj", "Ankit", "Sandeep", "Harsh", "Yash", "Akhil", "Ujjwal", 
    "Vikas", "Dev", "Nitin", "Tarun", "Rohit", "Siddharth", "Rajat", "Prateek", "Lokesh", "Bhavesh", 
    "Jatin", "Kushal", "Omkar", "Tushar", "Suraj", "Adarsh", "Chetan", "Sameer", "Tejas", "Ashwin",
    "Kunal", "Sagar", "Dinesh", "Hemant", "Sharad", "Ishaan", "Madhav", "Rakesh", "Saket", "Saurabh", 
    "Parth", "Vibhav", "Chirag", "Keshav", "Devansh", "Aayush", "Harshit", "Shivam", "Yuvraj", "Tanmay", 
    "Anshul", "Shashank", "Vinay", "Avinash", "Bhaskar", "Lalit", "Raman", "Satyam", "Arpit", "Nishant"
  ];
  
  export const femaleFirstNames = [
    "Priya", "Anjali", "Neha", "Kavya", "Shreya", "Divya", "Pooja", "Aarti", 
    "Swati", "Nisha", "Deepa", "Aruna", "Meera", "Sonia", "Rekha", "Lakshmi", 
    "Archana", "Ananya", "Kritika", "Ritu", "Nandini", "Smita", "Vidya", "Pallavi", 
    "Mamta", "Sangita", "Jyoti", "Sarita", "Aparna", "Rashmi", "Isha", "Tanya", "Sneha", "Esha", 
    "Komal", "Simran", "Payal", "Bhavana", "Namrata", "Kirti", "Megha", "Richa", "Ayesha", "Aakriti", 
    "Sonali", "Radhika", "Trisha", "Gargi", "Chandni", "Harshita", "Avani", "Sanya", "Rupali", "Aditi",
    "Deepti", "Mahima", "Rina", "Tanisha", "Purnima", "Mitali", "Sunita", "Shanaya", "Vibha", "Suhani",
    "Srishti", "Aparajita", "Saumya", "Ashwini", "Ankita", "Khushboo", "Manisha", "Vaishnavi", "Rupinder", "Tina"
  ];
  
  export const lastNames = [
    "Singh", "Kumar", "Sharma", "Patel", "Gupta", "Gandhi", "Joshi", "Desai", 
    "Mehta", "Rajput", "Verma", "Malhotra", "Agarwal", "Iyer", "Naidu", "Reddy", 
    "Chowdhury", "Bose", "Hegde", "Nair", "Bhatt", "Trivedi", "Dutta", "Chakraborty", 
    "Menon", "Shetty", "Bhandari", "Kapoor", "Saxena", "Bajaj", "Puri", "Ahluwalia", 
    "Thakur", "Yadav", "Das", "Mukherjee", "Sinha", "Pandey", "Ghosh", "Goel", "Poddar", 
    "Dwivedi", "Pathak", "Chaturvedi", "Bansal", "Mahajan", "Rastogi", "Joshi", "Srivastava"
  ];

  
  export function generateUniqueIndianNames(quantity: number, gender: 'male' | 'female' | 'mixed' = 'mixed'): string[] {
    const usedNames = new Set<string>();
    const names: string[] = [];
  
    const availableFirstNames = gender === 'male' 
      ? maleFirstNames 
      : gender === 'female' 
        ? femaleFirstNames 
        : [...maleFirstNames, ...femaleFirstNames];
  
    while (names.length < quantity) {
      const firstName = availableFirstNames[Math.floor(Math.random() * availableFirstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
  
      if (!usedNames.has(fullName)) {
        usedNames.add(fullName);
        names.push(fullName);
      }
  
      // Prevent infinite loop if we run out of unique combinations
      if (usedNames.size >= availableFirstNames.length * lastNames.length) {
        break;
      }
    }
  
    return names;
  }
  
  // Fallback in case we run out of unique combinations
  function addNumberSuffix(names: string[], quantity: number): string[] {
    const uniqueNames = new Set<string>();
    
    while (uniqueNames.size < quantity) {
      for (const name of names) {
        if (uniqueNames.size >= quantity) break;
        
        let suffixedName = name;
        let suffix = 1;
        
        while (uniqueNames.has(suffixedName)) {
          suffixedName = `${name} ${suffix}`;
          suffix++;
        }
        
        uniqueNames.add(suffixedName);
      }
    }
    
    return Array.from(uniqueNames).slice(0, quantity);
  }
  
  export function generateIndianNames(quantity: number, gender: 'male' | 'female' | 'mixed' = 'mixed'): string[] {
    let names = generateUniqueIndianNames(quantity, gender);
    
    if (names.length < quantity) {
      names = addNumberSuffix(names, quantity);
    }
    
    return names;
  }