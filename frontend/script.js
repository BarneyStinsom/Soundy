const API_URL = 'http://localhost:3000';

async function getArtists() {
  const response = await fetch(`${API_URL}/artists`);
  const artists = await response.json();

  const container = document.querySelector('#artists');

  artists.forEach((artist) => {
    const element = document.createElement('p');

    element.textContent = artist.name;

    container.appendChild(element);
  });
}

getArtists();