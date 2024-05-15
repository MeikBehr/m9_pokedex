"use strict";


let originalDatasV2 = [];
let originalDatasSpecies = [];
let originalDatasEvolution = [];
let datas = [];
let findShow = [];
let evoChain = [];
let numerOfAvailablePokemon = 0;
let idNameAndUrlOfAllPokemon = {};
let item = document.getElementById(`flippingCard`);
let register = 'info';
let startID = 1;
let endID = 25;


// https://www.serebii.net/pokedex-sv/stat/hp.shtml
const stats = {
	"hp": 255,
	"attack": 190,
	"defense": 230,
	"speed": 180,
	"special-attack": 194,
	"special-defense": 230,
	"total": 780,
};


const colors = {
	green: '#006400',
	red: '#FF0000',
	blue: '#0000FF',
	white: '#FFFFFF',
	yellow: '#FFFF00',
	brown: '#A52A2A',
	purple: '#800080',
	pink: '#FFC0CB',
	gray: '#808080',
	black: '#000000'
};


function createNewDataObject(element, index) {
	return {
		"id": index + 1,
		"loaded": false,

		"technical": {
			"name": `${element['name']}`,
			"name_de": "",
			"url": `${element['url']}`,
			"url_species": "",
			"url_evolution": "",
			"image_small": "",
			"image_big": "",
			"image_big2": "",
			"evolves_from": "",
			"evolves_to": "",
		},

		"attribute": {
			"abilities": [],
			"color": "",
			"flavor_text_entries": "",
			"height": 0,
			"types": "",
			"weight": 0,
		},

		"stats": {
			"hp" : 0,
			"attack" : 0,
			"defense" : 0,
			"special-attack" : 0,
			"special-defense" : 0,
			"speed" : 0,
		}
	}
}


function createPokemonData(response, pokemonID, name, image, image2, image_small) {
    return {
        id: pokemonID,
        loaded: false,
        technical: {
            name: name,
            name_de: "",
            url: response.url,
            url_species: `https://pokeapi.co/api/v2/pokemon-species/${pokemonID}/`,
            image_small: image_small,
            image_big: image,
            image_big2: image2,
        },
        attribute: {
            types: response.types,
            color: "",
            weight: response.weight,
            height: response.height,
            abilities: response.abilities,
        },
        stats: [
            { name: 'hp', value: response.stats[0].base_stat },
            { name: 'attack', value: response.stats[1].base_stat },
            { name: 'defense', value: response.stats[2].base_stat },
            { name: 'special-attack', value: response.stats[3].base_stat },
            { name: 'special-defense', value: response.stats[4].base_stat },
            { name: 'speed', value: response.stats[5].base_stat },
        ],
        moves: response.moves,
    };
}