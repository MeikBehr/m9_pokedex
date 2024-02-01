"use strict";

let currentPokemon;


function init() {
	loadPokemon();
}


async function loadPokemon() {
	let url = `https://pokeapi.co/api/v2/pokemon/1`;
	let response = await fetch(url);
	currentPokemon = await response.json();
	console.log(currentPokemon);

	renderPokemonInfo();
}


function renderPokemonInfo() {
	document.getElementById('pokemonName').innerHTML = currentPokemon['name'];

	const pekomonImage = currentPokemon['sprites']['other']['dream_world']['front_default'];
	document.getElementById('pokemonPic').src = pekomonImage;
}











/* 
API

pokeapi.co


Infos:
https://pokeapi.co/docs/v2#pokemon-section
*/