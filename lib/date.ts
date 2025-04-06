export const formatDate = (dateObj: any) => {
    if (!dateObj) return 'N/A';
  
    // If it's a Firestore Timestamp object
    if (dateObj.seconds) {
      const date = new Date(dateObj.seconds * 1000);
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
    }
  
    // Fallback for ISO strings or normal Date strings
    const date = new Date(dateObj);
    if (isNaN(date.getTime())) return 'Invalid Date';
  
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
  };
  