const API_URL = 'http://localhost:3000';

const userId = localStorage.getItem('userId');

if (userId) {
  window.location.href = 'menu/albums.html';
}