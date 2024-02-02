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


let pokemonInformations = {

		1: {
			id: "1",
			name : "Pokemon",
			url : "https://pokeapi.co/",
			abilities : [],
			types
		},
		2: {},
		3: {},
		...
		...
		425: {},



function eventListenerOverlay(i) {
    document.getElementById(`ol_button`).addEventListener('click', () => {
        const option = document.getElementById('overlay_select').selectedIndex;
        const addToCart = createAddToCartObject(i, option);
        const existingItem = findExistingItem(i, option);
        existingItem ? existingItem.amount += addToCart.amount : cart.push(addToCart);
        renderCartItems();
        hideOptions();
    }, { once: true });
}



	function createAddToCartObject(i, option) {
    	return {
        id: i,
        options: menus[i].options[option],
        name: menus[i].name,
        price: menus[i].price[option],
        amount: parseInt(document.getElementById('ol_amount').textContent),
    };
}

}


Deutscher NAME?

Wenn man von der SPRITE-URL ausgeht, kann man den NAMEN finden!

let test = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${i}/`);
		let testJSON = await test.json();
		console.log(testJSON);
		console.log(testJSON["names"][5]["name"]);


*/

let pokemonDatas = {};



let currentPokemon;


function creatAddToPokedexObject(currentPokemon, i, url) {
	return {
		"id": currentPokemon['id'],
		"name": currentPokemon['name'],
		"name_de": '',
		"url": currentPokemon['species']['url'],
		"image_small": "",
		"image_big": "",
		"abilities": currentPokemon['abilities'],
		"types": "",
		"weight": 0,

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
	const container = document.getElementById('pokedex');
	container.innerHTML = '';
	for (let i = 1; i <= 5; i++) {
		await loadPokemon(i);

		let test = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${i}/`);
		let testJSON = await test.json();
		console.log(testJSON);
		console.log(testJSON["names"][5]["name"]);
	
	}

	let test = await fetch("https://pokeapi.co/api/v2/pokemon-species/1/");
	let testJSON = await test.json();
	console.log(testJSON);
	console.log(testJSON["names"][5]["name"]);
	
}


async function loadPokemon(i) {
	let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
	let response = await fetch(url);
	currentPokemon = await response.json();
	console.log(currentPokemon);
	await renderPokemonInfo(currentPokemon);
}


async function renderPokemonInfo(currentPokemon) {
	const container = document.getElementById('pokedex');
	const pekomonImage = currentPokemon['sprites']['other']['dream_world']['front_default'];
	container.innerHTML += /*html*/ `
		<div class="pokedex__overview__card">
                <h1 id="pokemonName">${currentPokemon['name']}</h1>
                <img id="pokemonPic" src="${pekomonImage}" alt="">
         </div>
		 `

}




/* 
API

pokeapi.co


Infos:
https://pokeapi.co/docs/v2#pokemon-section
*/