class MyFrame extends HTMLElement {
    id;
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() { }

    static get observedAttributes() {
        return ["uri"];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        let [, , id] = newVal.split(":");
        const uri = this.getAttribute("uri");
        const type = uri.split(":")[1];
        this.id = id;
        this.type = type;
        this.shadowRoot.innerHTML = `
            <iframe class="spotify-iframe" width="100%" height="100%" src="https://open.spotify.com/embed/${this.type}/${this.id}" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
        `;
        if (type === "track") {
            this.shadowRoot.innerHTML = `
                <iframe class="spotify-iframe" width="70%" height="400" src="https://open.spotify.com/embed/${this.type}/${this.id}" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
            `;
        }
    }
}
customElements.define("my-frame", MyFrame);
const listarTrack = document.querySelector('#listarTrack');
const listarAlbum = document.querySelector('#listarAlbum');
const listarPlayList = document.querySelector('#listarPlayList');
const searchInput = document.querySelector('.search-header__input');

const codes = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const randomCode = codes[Math.floor(Math.random() * codes.length)];
const code = randomCode.replace(" ", "%20");

document.addEventListener('DOMContentLoaded', () => {
    mostrarAlbums(code);
});


searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            const formattedQuery = query.replace(" ", "%20");
            mostrarAlbums(formattedQuery);
        }
    }
});

const API_KEY = 'eb7eca7bdfmsh796ea08925fa743p1adfefjsn271c806bbb42';
const API_HOST = 'spotify23.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}`;

async function mostrarAlbums(code) {
    const url = `${BASE_URL}/search/?q=${code}&type=albums&offset=0&limit=10&numberOfTopResults=5`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': API_HOST
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        const albums = result.albums.items;
        renderAlbums(albums);
    } catch (error) {
        console.error(error);
    }
}

function renderAlbums(albums) {
    const listarAlbum = document.querySelector('#listarAlbum');
    listarAlbum.innerHTML = '';

    albums.forEach(album => {
        const image = album.data.coverArt.sources.find(source => source.url)?.url || '';
        const name = album.data.name;
        const artist = album.data.artists.items.find(item => item.profile.name)?.profile.name || '';
        const year = album.data.date.year;
        const uri = album.data.uri;

        const div = document.createElement("div");
        div.classList.add("album");
        div.innerHTML = `
            <div class="album_order" data-uri="${uri}">
                <div class="imagen_album">
                    <img src="${image}" alt="${name}" class="portada">
                </div>
                <div class="info_album">
                    <h3>${name}</h3>
                    <p>${artist}</p>
                </div>
            </div>
        `;

        listarAlbum.append(div);

        div.querySelector('.album_order').addEventListener('click', async () => {
            await reproducirPrimerTrack(uri);
            mostrarTracks(uri);
        });
    });
}

async function reproducirPrimerTrack(albumUri) {
    const albumId = albumUri.split(":")[2];
    const url = `${BASE_URL}/albums/?ids=${albumId}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': API_HOST
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        const uri = result.albums[0].tracks.items[0]?.uri;
        const frame = document.querySelector("my-frame");
        if (uri) {
            frame.setAttribute("uri", uri);
        } else {
            console.warn("No se encontró ninguna pista en el álbum.");
        }
    } catch (error) {
        console.error(error);
    }
}

async function mostrarTracks(albumUri) {
    const albumId = albumUri.split(":")[2];
    const url = `${BASE_URL}/albums/?ids=${albumId}`;
    const options = getFetchOptions();

    try {
        const result = await fetchJson(url, options);
        const tracks = result.albums[0].tracks.items;
        renderTracks(tracks, result.albums[0].images[0].url);
    } catch (error) {
        console.error(error);
    }
}

const searchInput2 = document.querySelector('#search-header__input');

document.addEventListener('DOMContentLoaded', () => {
    buscarTrack(code);
});


searchInput2.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput2.value.trim();
        if (query) {
            const formattedQuery = query.replace(" ", "%20");
            buscarTrack(formattedQuery);
        }
    }
});



async function buscarTrack(code) {
    const url = `${BASE_URL}/search/?q=${code}&type=tracks&offset=0&limit=10&numberOfTopResults=5`;
    const options = getFetchOptions();

    try {
        const result = await fetchJson(url, options);
        const tracks = result.tracks?.items;
        renderTracks(tracks.map(item => item.data), null);
    } catch (error) {
        console.error(error);
    }
}

function getFetchOptions() {
    return {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': API_HOST
        }
    };
}

async function fetchJson(url, options = getFetchOptions()) {
    const response = await fetch(url, options);
    return response.json();
}

function renderTracks(tracks, albumImage = null) {
    const listarTrack = document.querySelector('#listarTrack');
    listarTrack.innerHTML = '';

    tracks.forEach(track => {
        const image = track.albumOfTrack.coverArt.sources[0]?.url || '';
        const name = track.name;
        const artist = track.artists.items[0]?.profile.name || '';
        const uri = track.uri;

        const div = document.createElement("div");
        div.classList.add("track_Recomendations");
        div.innerHTML = `
            <div class="track_order" data-id="${uri}">
                <i class='bx bx-play'></i>
                <div class="imagen_track">
                    <img src="${image || albumImage}" alt="${name}" class="portada">
                </div>
                <div class="info_track">
                    <h3>${name}</h3>
                    <p>${artist}</p>
                </div>
            </div>
        `;
        listarTrack.append(div);
        div.querySelector('.track_order').addEventListener('click', () => {
            const frame = document.querySelector("my-frame");
            frame.setAttribute("uri", uri);
        });
    });
}


const urlRecommendations = `https://spotify23.p.rapidapi.com/recommendations/?limit=20&seed_tracks=0c6xIDDpzE81m2q797ordA&seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_genres=classical%2Ccountry`;
const optionsRecommendations = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': 'eb7eca7bdfmsh796ea08925fa743p1adfefjsn271c806bbb42',
        'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
    }
};

try {
    const response = await fetch(urlRecommendations, optionsRecommendations);
    const result = await response.json();
    const tracks = result.tracks;
    for (let i = 0; i < 10; i++) {
        const img = tracks[i]?.album.images[0]?.url;
        const img2 = tracks[i]?.album.images[i]?.url;
        const imagen = img ?? img2;
        const nombre = tracks[i].name;
        const nombreArtista = tracks[i].artists[0].name;
        const uri = tracks[i].uri;
        const div = document.createElement("div");
        div.classList.add("track_Recomendations");
        div.innerHTML = `
                <div class="track_order" data-id="${uri}">
                    <i class='bx bx-play'></i>
                    <div class="imagen_track">
                        <img src="${imagen}" alt="" class="portada">
                    </div>
                    <div class="info_track">
                        <h3>${nombre}</h3>
                        <p>${nombreArtista}</p>
                    </div>
                </div>
            `;
        listarPlayList.append(div);
        div.querySelector('.track_order').addEventListener('click', () => {
            const frame = document.querySelector("my-frame");
            frame.setAttribute("uri", uri);
        });
    }
} catch (error) {
    console.error(error);
}

const containers = document.querySelectorAll('.container');
const search = document.querySelectorAll('.search-header__input');
const leftHeaders = document.querySelectorAll('.left header');
const mediumHeaders = document.querySelectorAll('.medium header');
const rightHeaders = document.querySelectorAll('.right header');
const titles = document.querySelectorAll('.title');
const contenedores = document.querySelectorAll('.contenedor');
const trackMusic = document.querySelectorAll('.track_music');
const albumOrders = document.querySelectorAll('.album_order');
const trackOrders = document.querySelectorAll('.track_order');
const iframe = document.querySelectorAll('.iframe');
const movile = document.querySelectorAll('.menu__mobile');


function setStyles(elements, backgroundColor, color) {
    elements.forEach(function (element) {
        element.style.background = backgroundColor;
        element.style.color = color;
    });
}

function resetStyles(elements) {
    elements.forEach(function (element) {
        element.style.background = '';
        element.style.color = '';
    });
}

function addHoverStyles(elements) {
    elements.forEach(function (element) {
        element.classList.add('hover-active');
    });
}

function removeHoverStyles(elements) {
    elements.forEach(function (element) {
        element.classList.remove('hover-active');
    });
}