export const searchGoogleBooks = (query: any) => {
    return fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
  };