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


