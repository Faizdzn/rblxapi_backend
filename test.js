async function logMovies() {
  const response = await fetch("http://char-api.faizda.my.id");
  const movies = await response;
  console.log(movies);
}

logMovies()
