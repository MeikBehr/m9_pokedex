"use strict";




let originalDatasV2 = [];
let originalDatasSpecies = [];
let originalDatasEvolution = [];
let datas = [];
let numerOfAvailablePokemon = 0;
let idNameAndUrlOfAllPokemon = {};
let item = document.getElementById(`flippingCard`);


let startID = 1;
// let endID = 25;
let endID = 5;




async function init() {
	await checkNumberOfAvailablePokemon();
	await creatingNewDataArrayWithRootData();
	await fetchingPokemonDataFromSourceV2();
	await fetchingPokemonDataFromSourceSpecies();
	// await fetchingPokemonDataFromSourceEvolutionChain();

	
	clearPokedex();
	renderPokedex();

	// setEventListener();

}






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
			"abilities": [],	// link to abilities => text in en/de z.B. https://pokeapi.co/api/v2/ability/65/
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



async function checkNumberOfAvailablePokemon() {
	let url = `https://pokeapi.co/api/v2/pokemon/?offset=0&limit=2500`;
	let response = await fetch(url);
	let responseJSON = await response.json();
	// dieses JSON beinhaltet schon die Englischen NAMEN und die URL!
	// console.log(responseJSON);
	idNameAndUrlOfAllPokemon = responseJSON['results'];
	numerOfAvailablePokemon = responseJSON['count'];
	// console.log(numerOfAvailablePokemon);
}



async function creatingNewDataArrayWithRootData() {
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
				height: response.height,
                abilities: response.abilities
            },
			stats: [
				{ name: 'hp', value: response.stats[0].base_stat },
				{ name: 'attack', value: response.stats[1].base_stat },
				{ name: 'defense', value: response.stats[2].base_stat },
				{ name: 'special-attack', value: response.stats[3].base_stat },
				{ name: 'special-defense', value: response.stats[4].base_stat },
				{ name: 'speed', value: response.stats[5].base_stat },
			]
        };

		let statTotal = 0;
		datas[pokemonID - 1].stats.forEach(stat => {
			statTotal = statTotal + stat.value;
		})
		datas[pokemonID - 1].stats.push({ name: 'total', value: statTotal})

    });

	loadingSpinner(false);
	// console.log(originalDatasV2);
}




async function fetchingPokemonDataFromSourceSpecies() {
    // console.log("Fetching German Names...");
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
			datas[(i - 1)]["attribute"]["flavor_text_entries"] = responseJSON.flavor_text_entries[11].flavor_text;
			originalDatasSpecies.push(responseJSON);

            // console.log(responseJSON["names"][5]["name"]);
        });
    });

	// console.log("Species", originalDatasSpecies);
	loadingSpinner(false);
}



// Evolution Chain has to be redone - not working right now
// async function fetchingPokemonDataFromSourceEvolutionChain() {
//     console.log("Fetching EvolutionChain Names...");
// 	loadingSpinner(true);

// 	const promises = [];

// 	for (let i = startID; i <= endID; i++) {
//         let url = datas[(i - 1)]["technical"]["url_evolution"];
//         promises.push(fetch(url).then(response => response.json()));
//     }
//     await Promise.all(promises).then(results => {
//         results.forEach((responseJSON, index) => {
//             const i = startID + index;

// 			if (responseJSON["chain"]["evolves_to"].length > 0) {
// 			  datas[(i - 1)]["technical"]["evolves_to"] = responseJSON["chain"]["evolves_to"][0]["species"]["name"];
// 			}

// 			originalDatasEvolution.push(responseJSON);
//         });
//     });

// 	console.log("Evolution", originalDatasEvolution);
// 	loadingSpinner(false);
// }





function loadingSpinner(showing) {
    if (showing == true) {
		document.getElementById('loader_container').classList.remove('d-none');
		document.body.classList.add('no-scroll');
    } else {
		document.getElementById('loader_container').classList.add('d-none');
		document.body.classList.remove('no-scroll');
    }
}





function clearPokedex() {
	const container = document.getElementById('pokedex');
	container.innerHTML = '';
}





function getColor(name) {
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
    return colors[name] || '#FFFFFF';
}




function lightenColor(hex, amount) {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
        throw new Error('Invalid color format. Please provide a color in the format #RRGGBB.');
    }

    // Farbwerte extrahieren
    let [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));

    // Farben aufhellen und Grenzwerte für RGB sicherstellen
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);

    // Neue Farbe zurückgeben
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}








function renderPokedex() {
	const container = document.getElementById('pokedex');

	for (let i = startID; i <= endID; i++) {
		const pokemonImage2 = datas[(i - 1)]["technical"]["image_big2"];
		const pokemonName = datas[(i - 1)]["technical"]["name"];
		const pokemonNameDE = datas[(i - 1)]["technical"]["name_de"];
		const background = datas[(i - 1)].attribute.color;

		let color = 'white';
		if (datas[(i - 1)].attribute.color == 'blue' ||
			datas[(i - 1)].attribute.color == 'black') {
			color = 'white';
			// console.log("color is ", color)
		}

		let backgroundColor = getColor(background);
		let backgroundColorBrighter = lightenColor(backgroundColor, 80)

		container.innerHTML += /*html*/ `

			<!-- Karte ${i}-->
			<div class="fp-grid-item" id="card-${i}" style="background-color: ${datas[(i - 1)].attribute.color};color: ${color};">
				<div class="fp-card-container fp-pokemon_card-container--3d-hover">
					<div class="fp-pokemon_card">
						<div class="fp-pokemon_card-under" style="background: linear-gradient(0deg, ${backgroundColor} 0%, ${backgroundColorBrighter} 70%);">
							<div class="fp-pokemon_card__content">
								<h4 class="fp-pokemon_card__content-heading">#${datas[(i - 1)]['id']} ${pokemonName}</h4>
								<p class="fp-pokemon_card__content-subhead">(${pokemonNameDE})</p>
								<div class="fp-pokemon_type_container">
									${datas[i - 1].attribute.types.map(type => `<div class="fp-pokemon_type">${type.type.name}</div>`).join('')}
								</div>
							</div>
						</div>
						<div class="fp-pokemon_card-over"  onclick="showDetail(${i})">
							<div>
								<div class="fp-pokemon_card-link">
									<img class="fp-pokemon_card__image-pokemon" src="${pokemonImage2}"  alt="Bild vom Pokemon ${pokemonName}">
									<p class="fp-pokemon_card-link-text">Click me!</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			 `
	}

	addMousePositionToCssPokemon();

}




async function loadmore() {
	startID = endID + 1;
	endID = endID + 25;
	await fetchingPokemonDataFromSourceV2();
	await fetchingPokemonDataFromSourceSpecies();
	renderPokedex();
}




////////////////////////////////////////////////////////////////////////////////////


  
  
function hideDetail() {
	register = 'info';
	const item = document.getElementById(`flippingCard`);
	item.classList.add('d-none');
	item.style.transform = '';
	item.classList.remove('flippingDiv-center');
	setTimeout(() => {
		const closeButton = item.querySelector('.detail-close-button');
		closeButton.classList.add('d-none');
		hidePokemonOverlay();
	}, 100);
}


let register = 'info';

function showDetail(i) {
	PokemonShowDetailOverlay();

	item.classList.remove('flippingDiv-center', 'd-none');
	item.classList.add('flippingDiv-center');


	const pokemonName = datas[(i - 1)]["technical"]["name"];
	item.querySelector('.detail-header-headline').innerHTML = /*html*/ `
		<div>${pokemonName}</div>
        <div>#${datas[(i - 1)]['id']}</div>
	`;

	item.querySelector('.detail_type_container').innerHTML = /*html*/ `
		${datas[i - 1].attribute.types.map(type => `<div class="detail_type">${type.type.name}</div>`).join('')}
	`;


	let color = 'white';
	if (datas[(i - 1)].attribute.color == 'blue' ||
		datas[(i - 1)].attribute.color == 'black') {
		color = 'white';
		// console.log("color is ", color)
	}
	const background = datas[(i - 1)].attribute.color;
	let backgroundColor = getColor(background);
	let backgroundColorBrighter = lightenColor(backgroundColor, 80)
	item.querySelector('.fp-detail-container').style = `color: ${color};background: linear-gradient(0deg, ${backgroundColor} 0%, ${backgroundColorBrighter} 90%);`;


	const pokemonImage = datas[(i - 1)]["technical"]["image_big"];
	item.querySelector('.fb-detail-shadowpic').style = `background: url('${pokemonImage}') center center/contain fixed no-repeat;`;
	
	
	const left = (i === 1) ? endID : i - 1;
	const right = (i === endID) ? 1 : i + 1;

	item.querySelector('.detail-header-nav').innerHTML = /*html*/ `
		<p onclick="showDetail(${left})"><</p>
		<div class="detail-close-button d-none" onclick="hideDetail()"><div>ESC</div></div>
		<p onclick="showDetail(${right})">></p>
	`;


	detailCardInfoMenu(i);

	if (register === 'info') {
		detailCardShowInfo(i);
	}

	if (register === 'attribute') {
		detailCardShowAttribute(i);
	}

	if (register === 'moves') {
		detailCardShowMoves(i);
	}

	if (register === 'evo') {
		detailCardShowEvo(i);
	}


	const closeButton = item.querySelector('.detail-close-button');
    const pokemonDetail = item.querySelector('.fp-detail-container');
    closeButton.classList.remove('d-none');
    pokemonDetail.classList.remove('d-none');
	
	document.addEventListener('keydown', (event) => {
    	if (event.key === "Escape") {
		  hideDetail();
		}

		if (event.key === "ArrowLeft") {
			showDetail(left);
		}

		if (event.key === "ArrowRight") {
			showDetail(right);
		}
	}, {once: true});
}





function detailCardInfoMenu(i) {
	item.querySelector('.detail-content-headline').innerHTML = /*html*/ `
		<div id="info" class="detail-content-tab" onclick="detailCardShowInfo(${i})">Info</div>
        <div id="stats" class="detail-content-tab" onclick="detailCardShowAttribute(${i})">Attribute</div>
        <div id="moves" class="detail-content-tab" onclick="detailCardShowMoves(${i})">Moves</div>
        <div id="evo" class="detail-content-tab" onclick="detailCardShowEvo(${i})">Evolution</div>
	`;
}


function detailCardShowInfo(i) {
	register = 'info';
	item.querySelector('.detail-content-stats').innerHTML = /*html*/ `
		<div>Spezie: Speed Pokemon</div>
        <div>Größe: ${(datas[(i - 1)].attribute.height / 10).toFixed(1)} m</div>
        <div>Gewicht: ${(datas[(i - 1)].attribute.weight / 10).toFixed(1)} kg</div>
        <div>Fertigkeiten: ${datas[i - 1].attribute.abilities.map(type => type.ability.name).join(', ')}</div>
	`;

	item.querySelector('.detail-content-explanation').innerHTML = /*html*/ `
		<div>${datas[(i - 1)]["attribute"]["flavor_text_entries"]}</div>
		<div class="detail-content-image">
			<img src="${datas[(i - 1)]["technical"]["image_small"]}" alt="Animiertes Bild von ${datas[(i - 1)]["technical"]["name"]}">
		</div>
	`;

}



function detailCardShowAttribute (i) {
	register = 'attribute';
	item.querySelector('.detail-content-stats').innerHTML = /*html*/ `
		<table>
            <tbody class="stats-table">
            </tbody>
        </table>

	`;



	const statsTable = item.querySelector('.stats-table');
	statsTable.innerHTML = '';
	// console.log(statsTable);
	datas[i - 1].stats.forEach(stat => {
		// console.log(stat.name, ":", stat.value);
		statsTable.innerHTML += /*html*/ `
			<tr>
				<td class="stats-table-firstTD">${stat.name}:</td>
        		<td class="stats-table-secondTD">${stat.value}</td>
        		<td class="stats-table-thirdTD"> 
					<div class="statsBarEmpty">
                		<div id="statsBar" class="statsBar" style="width: ${getStatsBarWidth(stat.value, stat.name)}%;"></div>
            		</div>
        		</td>
            </tr>
		`;

	});

	const statsBarEmpty = document.querySelectorAll('.statsBarEmpty');
	setTimeout(() => {
        statsBarEmpty.forEach (stat => {
			stat.style = `width: auto;`;
		})
    }, 500);





	item.querySelector('.detail-content-explanation').innerHTML = /*html*/ `
		<div>Eventuelle Explanations</div>
	`;
}



// https://www.serebii.net/pokedex-sm/stat/
// Highest HP				= 255
// Highest attack Value 	= 190
// Highest defense Value 	= 230
// Highest Speed		 	= 180
// Highest special attack Value 	= 194
// Highest special defense Value 	= 230
// Highest total			= 780


function getStatsBarWidth(value, name) {

	const stats = {
		"hp": 255,
		"attack": 190,
		"defense": 230,
		"speed": 180,
		"special-attack": 194,
		"special-defense": 230,
		"total": 780,
		
	};

	const adjustedStat = Number((value / stats[name]) * 100)
	// console.log(name, " ", value, " wid zu ", adjustedStat);
    return adjustedStat;
}







function detailCardShowMoves (i) {
	register = 'moves';
	item.querySelector('.detail-content-stats').innerHTML = /*html*/ `
		<div>Moves</div>
	`;

	item.querySelector('.detail-content-explanation').innerHTML = /*html*/ `
		<div>Eventuelle Explanations</div>
	`;
}

function detailCardShowEvo (i) {
	register = 'evo';
	item.querySelector('.detail-content-stats').innerHTML = /*html*/ `
		<div>Evo</div>
	`;

	item.querySelector('.detail-content-explanation').innerHTML = /*html*/ `
	<div>Eventuelle Explanations</div>
`;
}








  
function PokemonShowDetailOverlay() {
	  const overlay = document.getElementById('fp-overlay')
	  overlay.classList.remove('d-none');
	  document.body.classList.add('no-scroll');
}
  
  
  
function hidePokemonOverlay() {
	 const overlay = document.getElementById('fp-overlay');
	 overlay.classList.add('d-none');
	 document.body.classList.remove('no-scroll');
}
  
  
  
  
  
function addMousePositionToCssPokemon() {
	const elements = document.querySelectorAll(".fp-grid-item");
	for(const element of elements) {
		element.addEventListener("mousemove", function(e) {
			let rect = element.getBoundingClientRect();
			let x = e.clientX - rect.left; 
			let y = e.clientY - rect.top;
			element.style = "--mouse-x:" + (x / element.offsetWidth) + ";--mouse-y:" + (y / element.offsetHeight) + ";";
		});
		element.addEventListener("mouseout", function(e) {
			element.style = "";
		});
	}
}
  
// if (document.readyState === "complete" || document.readyState === "interactive") {
// 	setTimeout(addMousePositionToCssPokemon, 1);
// } else {
// 	document.addEventListener("DOMContentLoaded", addMousePositionToCssPokemon, false);
// }
  



