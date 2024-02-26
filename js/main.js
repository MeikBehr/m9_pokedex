"use strict";

/*
ToDo:

Pokedex like:
https://pokemondb.net/pokedex/charmeleon


-> als erstes vollständige Datenerfassung bei "fetchingPokemonData()" durchführen! Bisher sind da nur einige wenige Daten erfasst worden!!!!

- Auf klick einer Karte sollen die exakten Daten von der API geladen werden.
- Header mit Grafik, searchbar und nav
- Footer mit allen wichtigen Daten und Copyright, Impressum, Datenschutz etc.
- Es soll sich ein gesondertes Overlay öffnen und die Daten detailiert dargestellt werden. Auf klick auf Hintergrund schließt sich das Overlay
- Das Overlay soll wie bei einer Bildergallerei von Pokemon zu Pokemon durchgeschaltet werden können.
- Ladebalken zufügen - wann immer wir warten müssen, wird der angezeigt als Overlay oder so
- CleanCoding! Funktionen kurz, immer nur auf 1 Tätigkeit ausgerichtet, CSS sauber, CSS-Namen und Funktionsnamen aussagekräftig usw.!
- Alle Funktionen mit / * * beschreiben. Alle Funktionen sauber beschreiben

- Ladeleiste:  "1 von 20" also Seitenbreites DIV, dass sich langsam füllt und x von Y reinschreibt! !!!

- JSON mit ""!

https://pokeapi.co/docs/v2#pokemon
de : https://pokeapi.co/api/v2/language/6/



*/



let datas = [];
let numerOfAvailablePokemon = 0;
let idNameAndUrlOfAllPokemon = {};
let currentPokemon;


const startID = 1;
const endID = 20;




function createNewDataObject(element, index) {
	return {
		"id": index + 1,
		"loaded": false,

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

	await fetchingPokemonData();

	await fetchingGermanName();
	
	clearPokedex();
	renderPokedex();

	console.log(datas);
}



async function checkNumberOfAvailablePokemon() {
	const loadingBar = document.getElementById('loadingbar');
	loadingBar.classList.remove('d-none');
	loadingBar.innerHTML = `checking available number of Pokemon...`;

	let url = `https://pokeapi.co/api/v2/pokemon/?offset=0&limit=2500`;
	let response = await fetch(url);
	let responseJSON = await response.json();

	// dieses JSON beinhaltet schon die Englischen NAMEN und die URL!
	console.log(responseJSON);

	idNameAndUrlOfAllPokemon = responseJSON['results'];
	numerOfAvailablePokemon = responseJSON['count'];

	console.log(numerOfAvailablePokemon);

	loadingBar.innerHTML = `checking available number of Pokemon... ${numerOfAvailablePokemon}`;
	loadingBar.classList.add('d-none');
}



async function creatingNewDataArrayWithRootData() {
	// console.log(idNameAndUrlOfAllPokemon[0]);
	numerOfAvailablePokemon = endID;											// WARNING! Set  numerOfAvailablePokemon = endID	for demonstration purposes!
	for (let index = 0; index < numerOfAvailablePokemon; index++) {
		const element = idNameAndUrlOfAllPokemon[index];
		const newObject = createNewDataObject(element, index);
		datas.push(newObject);
	}
}




// diese Funktion umschreiben um ALLE gleichzeitig zu laden!
async function fetchingPokemonData() {

	document.getElementById('loader_container').classList.remove('d-none');


	for (let i = startID; i <= endID; i++) {

		if (!datas[(i - 1)]["loaded"]) {
			let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
			let response = await fetch(url);
			let responseJSON = await response.json();
			
			let name = responseJSON["name"];
			name = name.charAt(0).toUpperCase() + name.slice(1);

			datas[(i - 1)]["technical"]["name"] = name;
			datas[(i - 1)]["technical"]["image_big"] = responseJSON['sprites']['other']['dream_world']['front_default'];
			datas[(i - 1)]["loaded"] = true;
			datas[(i - 1)]["technical"]["url_species"] = `https://pokeapi.co/api/v2/pokemon-species/${i}/`;

			datas[(i - 1)]["stats"]["hp"] = responseJSON.stats[0].base_stat
			datas[(i - 1)]["stats"]["attack"] =  responseJSON.stats[1].base_stat
			datas[(i - 1)]["stats"]["defense"] =  responseJSON.stats[2].base_stat
			datas[(i - 1)]["stats"]["special-attack"] =  responseJSON.stats[3].base_stat
			datas[(i - 1)]["stats"]["special-defense"] =  responseJSON.stats[4].base_stat
			datas[(i - 1)]["stats"]["speed"] =  responseJSON.stats[5].base_stat

			datas[(i - 1)]["attribute"]["types"] = responseJSON.types;
			datas[(i - 1)]["attribute"]["weight"] = responseJSON.weight;
			datas[(i - 1)]["attribute"]["abilities"] = responseJSON.abilities;

			console.log(responseJSON);
		}
		// console.log(responseJSON);
	}

	document.getElementById('loader_container').classList.add('d-none');
}




async function fetchingGermanName() {
	document.getElementById('loader_container').classList.remove('d-none');
	const loadingBar = document.getElementById('loadingbar');
	loadingBar.classList.remove('d-none');
	loadingBar.style.width = `${0}%`;
	loadingBar.innerHTML = '';
	const amountToLoad = 5;
	const loadingStep = 100 / amountToLoad;

	for (let i = startID; i <= endID; i++) {

		if (datas[(i - 1)]["technical"]["name_de"] === '') {
			// let url = `https://pokeapi.co/api/v2/pokemon-species/${i}/`;
			let url = datas[(i - 1)]["technical"]["url_species"];
			let response = await fetch(url);
			let responseJSON = await response.json();
			loadingBar.style.width = `${(loadingStep * i)}%`;
			datas[(i - 1)]["technical"]["name_de"] = responseJSON["names"][5]["name"];
			datas[(i - 1)]["attribute"]["color"] = responseJSON.color.name;
			console.log(responseJSON["names"][5]["name"]);	
		}
		
	}
	
	document.getElementById('loadingbar_container').classList.add('d-none');
	loadingBar.innerHTML = '';
	document.getElementById('loader_container').classList.add('d-none');
}





function clearPokedex() {
	const container = document.getElementById('pokedex');
	container.innerHTML = '';
}






function renderPokedex() {
	const container = document.getElementById('pokedex');

	for (let i = startID; i <= endID; i++) {
		const pokemonImage = datas[(i - 1)]["technical"]["image_big"];
		const pokemonName = datas[(i - 1)]["technical"]["name"];
		const pokemonNameDE = datas[(i - 1)]["technical"]["name_de"];
		container.innerHTML += /*html*/ `
			<div id="id${i}" class="pokedex__card" onclick="console.log('u clicked me')" style="background-color: ${datas[(i - 1)].attribute.color};">
	                <h1 id="pokemonName">${pokemonName}</h1>
					<h3>(${pokemonNameDE})</h3>
					<h2>ID# ${datas[(i - 1)]['id']}</h2>
	                <img id="pokemonPic" src="${pokemonImage}" alt="">
	         </div>
			 `
	}

}









/* 
API

pokeapi.co


Infos:
https://pokeapi.co/docs/v2#pokemon-section



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