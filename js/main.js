"use strict";

/*
ToDo:

Pokedex like:
https://pokemondb.net/pokedex/charmeleon


-> als erstes vollständige Datenerfassung bei "fetchingPokemonDataFromSourceV2()" durchführen! Bisher sind da nur einige wenige Daten erfasst worden!!!!

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


let originalDatasV2 = [];
let originalDatasSpecies = [];
let originalDatasEvolution = [];
let datas = [];
let numerOfAvailablePokemon = 0;
let idNameAndUrlOfAllPokemon = {};
let currentPokemon;


let startID = 1;
let endID = 25;




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
			"evolves_from": "",
			"evolves_to": "",
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

	await fetchingPokemonDataFromSourceV2();
	await fetchingPokemonDataFromSourceSpecies();

	await fetchingPokemonDataFromSourceEvolutionChain();

	
	clearPokedex();
	renderPokedex();

	setEventListener();

	console.log(datas);
}



async function checkNumberOfAvailablePokemon() {
	let url = `https://pokeapi.co/api/v2/pokemon/?offset=0&limit=2500`;
	let response = await fetch(url);
	let responseJSON = await response.json();

	// dieses JSON beinhaltet schon die Englischen NAMEN und die URL!
	console.log(responseJSON);

	idNameAndUrlOfAllPokemon = responseJSON['results'];
	numerOfAvailablePokemon = responseJSON['count'];

	console.log(numerOfAvailablePokemon);
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





async function fetchingPokemonDataFromSourceV2() {

	loadingSpinner(true);

	const promises = [];
	for (let i = startID; i <= endID; i++) {
		const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
		promises.push(fetch(url).then(response => response.json()));
	}
    const responses = await Promise.all(promises);

    responses.forEach((response, index) => {
        const pokemonID = startID + index;
        const name = response.name.charAt(0).toUpperCase() + response.name.slice(1);
        const image = response.sprites.other.dream_world.front_default;			// standard
		const image2 = response.sprites.other.home.front_default;				// modern
		const image_small = response.sprites.other.showdown.front_default;		// animated one
		
		originalDatasV2.push(response);

        datas[pokemonID - 1] = {
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
                abilities: response.abilities
            },
            stats: {
                hp: response.stats[0].base_stat,
                attack: response.stats[1].base_stat,
                defense: response.stats[2].base_stat,
                'special-attack': response.stats[3].base_stat,
                'special-defense': response.stats[4].base_stat,
                speed: response.stats[5].base_stat
            }
        };
    });

	loadingSpinner(false);

	console.log(originalDatasV2);
}






/*
SPECIES enthält..:

- deutschen Namen		datas[(i - 1)]["technical"]["name_de"]
- Farbe					datas[(i - 1)]["attribute"]["color"]
- egg-groups			Array, z.B. ["monster", "plant"]
- url evolutionchains	z.B. "https://pokeapi.co/api/v2/evolution-chain/1/"
- habitat				z.B. Grassland
- id					z.B. 1
- evolves_from_species.name		z.B. bei Pikachu steht da Pichu



*/
async function fetchingPokemonDataFromSourceSpecies() {
    console.log("Fetching German Names...");
	loadingSpinner(true);

	const promises = [];

	for (let i = startID; i <= endID; i++) {
        if (datas[(i - 1)]["technical"]["name_de"] === '') {
            let url = datas[(i - 1)]["technical"]["url_species"];
            promises.push(fetch(url).then(response => response.json()));
        }
    }
    await Promise.all(promises).then(results => {
        results.forEach((responseJSON, index) => {
            const i = startID + index;
            datas[(i - 1)]["technical"]["name_de"] = responseJSON["names"][5]["name"];
			datas[(i - 1)]["technical"]["url_evolution"] = responseJSON["evolution_chain"]["url"];
			datas[(i - 1)]["attribute"]["color"] = responseJSON.color.name;
			originalDatasSpecies.push(responseJSON);

            // console.log(responseJSON["names"][5]["name"]);
        });
    });

	console.log(originalDatasSpecies);
	loadingSpinner(false);
}



async function fetchingPokemonDataFromSourceEvolutionChain() {
    console.log("Fetching EvolutionChain Names...");
	loadingSpinner(true);

	const promises = [];

	for (let i = startID; i <= endID; i++) {
        let url = datas[(i - 1)]["technical"]["url_evolution"];
        promises.push(fetch(url).then(response => response.json()));
    }
    await Promise.all(promises).then(results => {
        results.forEach((responseJSON, index) => {
            const i = startID + index;

			if (responseJSON["chain"]["evolves_to"].length > 0) {
			  datas[(i - 1)]["technical"]["evolves_to"] = responseJSON["chain"]["evolves_to"][0]["species"]["name"];
			}

			originalDatasEvolution.push(responseJSON);
            // console.log(responseJSON["names"][5]["name"]);
        });
    });

	console.log(originalDatasEvolution);
	loadingSpinner(false);
}







function loadingSpinner(showing) {
    if (showing == true) {
		document.getElementById('loader_container').classList.remove('d-none');
    } else {
		document.getElementById('loader_container').classList.add('d-none');
    }
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


		let color = 'black';
		if (datas[(i - 1)].attribute.color == 'blue' ||
			datas[(i - 1)].attribute.color == 'black') {
			color = 'white';
		}

		container.innerHTML += /*html*/ `
			<div id="id${i}" class="pokedex__card" onclick="showOnePokemonInOverlay(${i})" style="background-color: ${datas[(i - 1)].attribute.color};color: ${color};">
	                <h1 id="pokemonName">${pokemonName}</h1>
					<h3>(${pokemonNameDE})</h3>
					<h2>ID# ${datas[(i - 1)]['id']}</h2>
	                <img id="pokemonPic" src="${pokemonImage}" alt="">
	         </div>
			 `
	}

	// hoverPokedexCSSEffects();

}




async function loadmore() {
	startID = endID + 1;
	endID = endID + 25;
	await fetchingPokemonDataFromSourceV2();
	await fetchingPokemonDataFromSourceSpecies();
	renderPokedex();
}



function showOnePokemonInOverlay(i) {
	console.log('u clicked me! My ID is ', i);
	console.log("showOnePokemonInOverlay");

	document.getElementById('card_overlay').classList.remove('d-none');
	document.body.classList.add('no-scroll');

	const container = document.getElementById('card_container');
	container.innerHTML = '';

	const pokemonImage = datas[(i - 1)]["technical"]["image_big"];
	const pokemonImage2 = datas[(i - 1)]["technical"]["image_big2"];
	const pokemonImageSmall = datas[(i - 1)]["technical"]["image_small"];
	const pokemonName = datas[(i - 1)]["technical"]["name"];
	const pokemonNameDE = datas[(i - 1)]["technical"]["name_de"];
	let color = 'black';
	if (datas[(i - 1)].attribute.color == 'blue' ||
		datas[(i - 1)].attribute.color == 'black') {
		color = 'white';
	}

	container.innerHTML += /*html*/ `
		<div id="over__id${i}" class="over__pokedex__card" style="background-color: ${datas[(i - 1)].attribute.color};color: ${color};">
                <h1 id="over__pokemonName">${pokemonName}</h1>
				<h2>(${pokemonNameDE})</h2>
				<h2>ID# ${datas[(i - 1)]['id']}</h2>
				<div class="multipleImage">
					<img id="over__pokemonPic" src="${pokemonImage}" alt="">
					<img id="over__pokemonPic-2" src="${pokemonImage2}" alt="">
					<img id="over__pokemonPic-small" src="${pokemonImageSmall}" alt="">
				</div>
         </div>
		 `
}






function setEventListener() {
	const close = document.getElementById(`card_overlay_close`);
	closeOverlay(close);
}



function closeOverlay(close) {
	close.addEventListener('click', hideOverlay);
	document.addEventListener('keydown', (event) => {
		if (event.key === "Escape") {
			hideOverlay();
		}
	});
}


function hideOverlay() {
	const card_overlay = document.getElementById('card_overlay');
	card_overlay.classList.add('d-none');
	document.body.classList.remove('no-scroll');
}

















// function hoverPokedexCSSEffects() {
// 	const cards = document.querySelectorAll('.pokedex__card');

// 	cards.forEach(card => {
// 	card.addEventListener('mouseover', () => {
// 		cards.forEach(otherCard => {
// 		if (otherCard !== card) {
// 			otherCard.classList.add('blur');
// 		}
// 		});
// 	});

// 	card.addEventListener('mouseout', () => {
// 		cards.forEach(otherCard => {
// 		if (otherCard !== card) {
// 			otherCard.classList.remove('blur');
// 		}
// 		});
// 	});
// 	});
// }









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