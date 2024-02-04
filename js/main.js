"use strict";

/*
ToDo:

Pokedex like:
https://pokemondb.net/pokedex/charmeleon


- Überprüfe per Funktion, ob es die API gibt. Wenn ja, checke, wieviele Pokemon es gibt, die man abrufen kann.
- Rufe alle Pokemon-JSON ab und speichere einige der wichtigesten Daten in ein gesondertes JSON
- Mit diesem gesonerten JSON baue die Pokedex-Übersicht auf. Rendere die erste 20! Füge einen Button unten ein, der die nächsten 20 Lädt und immer so weiter bis alle geladen sind.
- Auf klick einer Karte sollen die exakten Daten von der API geladen werden.
- Header mit Grafik, searchbar und nav
- Footer mit allen wichtigen Daten und Copyright, Impressum, Datenschutz etc.
- Es soll sich ein gesondertes Obverlay öffnen und die Daten detailiert dargestellt werden. Auf klick auf Hintergrund schließt sich das Overlay
- Das Overlay soll wie bei einer Bildergallerei von Pokemon zu Pokemon durchgeschaltet werden können.
- Ladebalken zufügen - wann immer wir warten müssen, wird der angezeigt als Overlay oder so
- CleanCoding! Funktionen kurz, immer nur auf 1 Tätigkeit ausgerichtet, CSS sauber, CSS-Namen und Funktionsnamen aussagekräftig usw.!
- Alle Funktionen mit / * * beschreiben. Alle Funktionen sauber beschreiben

- Ladeleiste:  "1 von 20" also Seitenbreites DIV, dass sich langsam füllt und x von Y reinschreibt! !!!

- JSON mit ""!

https://pokeapi.co/docs/v2#pokemon
de : https://pokeapi.co/api/v2/language/6/


- Datastructure:

Wir machen ein ARRAY, wo wir alle einzelne POKEMON reinpushen dürfen:

let datas = [
	{
		id			<--- https://pokeapi.co/api/v2/pokemon/${i}			.id
		name		<--- https://pokeapi.co/api/v2/pokemon/${i}			.name
		url			https://pokeapi.co/api/v2/pokemon-species/${i}/
		url_species			<--- https://pokeapi.co/api/v2/pokemon/${i}			.species.url
		name_de		<-- https://pokeapi.co/api/v2/pokemon-species/${i}/		["names"][5]["name"]
		types		<--- https://pokeapi.co/api/v2/pokemon/${i}				.types[0].type.name 	UND    .types[1].type.name
		color		<--- https://pokeapi.co/api/v2/pokemon-species/1/ 		.color.name
		weight		<--- https://pokeapi.co/api/v2/pokemon/${i}			.weight
		img_small
		img_big		<--- https://pokeapi.co/api/v2/pokemon/${i}			.sprites.front_default
		moves		<--- https://pokeapi.co/api/v2/pokemon/${i}			.moves	<== array drinne	
		hp					<--- https://pokeapi.co/api/v2/pokemon/${i}			.stats[0].base_stat
		attack				<--- https://pokeapi.co/api/v2/pokemon/${i}			.stats[1].base_stat
		defense				<--- https://pokeapi.co/api/v2/pokemon/${i}			.stats[2].base_stat
		special_attack		<--- https://pokeapi.co/api/v2/pokemon/${i}			.stats[3].base_stat
		special_defense		<--- https://pokeapi.co/api/v2/pokemon/${i}			.stats[4].base_stat
		speed				<--- https://pokeapi.co/api/v2/pokemon/${i}			.stats[5].base_stat
		abilities		<--- https://pokeapi.co/api/v2/pokemon/${i}				.abilities <= array drinne
		habitat			<--- https://pokeapi.co/api/v2/pokemon-species/1/		.habitat.name
  		evolves_from	<--- https://pokeapi.co/api/v2/pokemon-species/1/		.evolves_from_species.name
	},
	{},
	{},
]

Date von:
- https://pokeapi.co/api/v2/pokemon/?offset=0&limit=2500' 		 // shows alle available pokemon
- https://pokeapi.co/api/v2/pokemon/1							 //  ...1 von 1 bis ?? für exakte Daten
- https://pokeapi.co/api/v2/pokemon-species/1/					 // ... für deutsche Namen z.B. von Pokemon #1
- https://pokeapi.co/api/v2/evolution-chain/1/					 // ... für Evolutionen
	.chain.



Deutscher NAME?
Wenn man von der SPRITE-URL ausgeht, kann man den NAMEN finden!
let test = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${i}/`);
		let testJSON = await test.json();
		console.log(testJSON);
		console.log(testJSON["names"][5]["name"]);


*/



let datas = [];
let numerOfAvailablePokemon = 0;
let idNameAndUrlOfAllPokemon = {};
let currentPokemon;


const startID = 1;
const endID = 5;




function createNewDataObject(element, index) {
	return {
		"id": index + 1,

		"technical": {
			"name": `${element['name']}`,
			"name_de": "",
			"url": `${element['url']}`,
			"url_species": "",
			"image_small": "",
			"image_big": "",
		},

		"attribute": {
			"types": "",
			"color": "",
			"weight": 0,
			"moves": "",
			"abilities": "",
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




async function init() {
	await checkNumberOfAvailablePokemon();
	await creatingNewDataArrayWithRootData();
	await fetchingGermanName();

	await fetchingPokemonData();
	
	clearPokedex();
	// renderPokedex();
}



async function fetchingPokemonData() {

	for (let i = startID; i < endID; i++) {
		let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
		let response = await fetch(url);
		let responseJSON = await response.json();

		datas[(i - 1)]["technical"]["name"] = responseJSON["name"];

		// datas[(i - 1)]["technical"]["url"] = responseJSON['sprites']['other']['dream_world']['front_default']

		// console.log(responseJSON);

	}

}







async function creatingNewDataArrayWithRootData() {
	// console.log(idNameAndUrlOfAllPokemon[0]);
	for (let index = 0; index < numerOfAvailablePokemon; index++) {
		const element = idNameAndUrlOfAllPokemon[index];
		const newObject = createNewDataObject(element, index);
		datas.push(newObject);
	}
}




async function fetchingGermanName() {

	for (let i = startID; i < endID; i++) {
		let url = `https://pokeapi.co/api/v2/pokemon-species/${i}/`;
		let response = await fetch(url);
		let responseJSON = await response.json();

		datas[(i - 1)]["technical"]["name_de"] = responseJSON["names"][5]["name"];
		console.log(responseJSON["names"][5]["name"]);
		
	}

}




async function checkNumberOfAvailablePokemon() {

	document.getElementById('loader_container').classList.remove('d-none');

	let url = `https://pokeapi.co/api/v2/pokemon/?offset=0&limit=2500`;
	let response = await fetch(url);
	let responseJSON = await response.json();
	idNameAndUrlOfAllPokemon = responseJSON['results'];
	numerOfAvailablePokemon = responseJSON['count'];
	// console.log(idNameAndUrlOfAllPokemon);
	// console.log("Max available Pokemon: ", numerOfAvailablePokemon);

	document.getElementById('loader_container').classList.add('d-none');
}



function clearPokedex() {
	const container = document.getElementById('pokedex');
	container.innerHTML = '';
}


// async function renderPokedex() {
// 	document.getElementById('loader_container').classList.remove('d-none');
// 	document.getElementById('loadingbar_container').classList.remove('d-none');
// 	const loadingbar = document.getElementById('loadingbar');
// 	loadingbar.style.width = `${0}%`;
// 	const amountToLoad = 5;
// 	const loadingStep = 100 / amountToLoad;
// 	for (let i = 1; i <= amountToLoad; i++) {
// 		await loadPokemon(i);
// 		loadingbar.style.width = `${(loadingStep * i)}%`;
// 		loadingbar.innerHTML = currentPokemon['name'] + " loaded";
// 		// let test = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${i}/`);
// 		// let testJSON = await test.json();
// 		// console.log(testJSON);
// 		// console.log(testJSON["names"][5]["name"]);
// 	}

// 	document.getElementById('loader_container').classList.add('d-none');
// 	document.getElementById('loadingbar_container').classList.add('d-none');
// 	loadingbar.innerHTML = '';
// }




// async function renderPokemonInfo(currentPokemon) {
// 	const container = document.getElementById('pokedex');
// 	const pekomonImage = currentPokemon['sprites']['other']['dream_world']['front_default'];
// 	container.innerHTML += /*html*/ `
// 		<div class="pokedex__card">
//                 <h1 id="pokemonName">${currentPokemon['name']}</h1>
//                 <img id="pokemonPic" src="${pekomonImage}" alt="">
//          </div>
// 		 `

// }





// async function loadPokemon(i) {
// 	let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
// 	let response = await fetch(url);
// 	currentPokemon = await response.json();
// 	// console.log(currentPokemon);
// 	await renderPokemonInfo(currentPokemon);
// }













/* 
API

pokeapi.co


Infos:
https://pokeapi.co/docs/v2#pokemon-section
*/