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

