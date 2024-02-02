"use strict";

/*
ToDo:

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

- JSON mit ""!

https://pokeapi.co/docs/v2#pokemon
de : https://pokeapi.co/api/v2/language/6/

*/

let currentPokemon;


function init() {
	const container = document.getElementById('pokedex');
	container.innerHTML = '';
	for (let i = 1; i <= 10; i++) {
		loadPokemon(i);
	}
}


async function loadPokemon(i) {
	let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
	let response = await fetch(url);
	currentPokemon = await response.json();
	console.log(currentPokemon);
	renderPokemonInfo(currentPokemon);
}


function renderPokemonInfo(currentPokemon) {
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