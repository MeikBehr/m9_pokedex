"use strict";




let originalDatasV2 = [];
let originalDatasSpecies = [];
let originalDatasEvolution = [];
let datas = [];
let evoChain = [];
let numerOfAvailablePokemon = 0;
let idNameAndUrlOfAllPokemon = {};
let item = document.getElementById(`flippingCard`);

let register = 'info';


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




let startID = 1;
// let endID = 25;
let endID = 13;




async function init() {
	await checkNumberOfAvailablePokemon();
	await creatingNewDataArrayWithRootData();
	await fetchingPokemonDataFromSourceV2();
	await fetchingPokemonDataFromSourceSpecies();
	
	
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
		let backgroundColorBrighter = lightenColor(backgroundColor, 80);

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
		<div id="info" class="detail-content-tab" onclick="setAllRegisterBack(), detailCardShowInfo(${i})">Info</div>
        <div id="stats" class="detail-content-tab" onclick="setAllRegisterBack(), detailCardShowAttribute(${i})">Stats</div>
        <div id="moves" class="detail-content-tab" onclick="setAllRegisterBack(), detailCardShowMoves(${i})">Moves</div>
        <div id="evo" class="detail-content-tab" onclick="setAllRegisterBack(), detailCardShowEvo(${i})">Evolution</div>
	`;
}



function colorChangeATdetailCardShowInfo(i) {
	let backgroundColor = datas[(i - 1)].attribute.color;
	let fontColor = '#000000';
	if (backgroundColor === 'black' || 
		backgroundColor === 'blue') {
			fontColor = '#FFFFFF';
			// console.log("ist black oder blue");
			// console.log(fontColor, backgroundColor);
	} 
	if (backgroundColor === 'white' || 
		backgroundColor === 'yellow') {
			// console.log("ist white oder yellow");
			fontColor = '#000000';
			// console.log(fontColor, backgroundColor);
	}
	return fontColor;
}



function detailCardShowInfo(i) {
	register = 'info';

	document.getElementById('info').style = `border: 1px solid rgba(0,0,0,0.9);background-color: ${datas[(i - 1)].attribute.color};color: ${colorChangeATdetailCardShowInfo(i)}`;
	item.querySelector('.detail-content-stats').innerHTML = /*html*/ `
		<div>Species: Speed Pokemon</div>
        <div>Height: ${(datas[(i - 1)].attribute.height / 10).toFixed(1)} m</div>
        <div>Weight: ${(datas[(i - 1)].attribute.weight / 10).toFixed(1)} kg</div>
        <div>Abilities: ${datas[i - 1].attribute.abilities.map(type => type.ability.name).join(', ')}</div>
	`;

	item.querySelector('.detail-content-explanation').innerHTML = /*html*/ `
		<div>${datas[(i - 1)]["attribute"]["flavor_text_entries"]}</div>
		<div class="detail-content-image">
			<img src="${datas[(i - 1)]["technical"]["image_small"]}" alt="Animiertes Bild von ${datas[(i - 1)]["technical"]["name"]}">
		</div>
	`;

}


function setAllRegisterBack() {
	document.getElementById('info').style = ``;
	document.getElementById('stats').style = ``;
	document.getElementById('moves').style = ``;
	document.getElementById('evo').style = ``;
}





function detailCardShowAttribute (i) {
	register = 'attribute';
	document.getElementById('stats').style = `border: 1px solid rgba(0,0,0,0.9);background-color: ${datas[(i - 1)].attribute.color};color: ${colorChangeATdetailCardShowInfo(i)}`;
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

		let backgroundColor = getColor(datas[(i - 1)].attribute.color);
		statsTable.innerHTML += /*html*/ `
			<tr>
				<td class="stats-table-firstTD">${stat.name}:</td>
        		<td class="stats-table-secondTD">${stat.value}</td>
				<td class="stats-table-thirdTD">&nbsp;/ ${stats[stat.name]}</td>
        		<td class="stats-table-fourthTD"> 
					<div class="statsBarEmpty">
						<div id="statsBar" class="statsBar" style="width: ${getStatsBarWidth(stat.value, stat.name)}%;background: linear-gradient(0deg, ${backgroundColor} 0%, ${lightenColor(backgroundColor, 80)} 70%);"></div>
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
		<div><em>Stats max values taken from <a href="https://www.serebii.net/pokedex-sv/stat/hp.shtml" target="_blank">https://www.serebii.net/pokedex-sm/stat/</a> Gen VII Dex</em></div>
	`;
}


function getStatsBarWidth(value, name) {
	const adjustedStat = Number((value / stats[name]) * 100)
    return adjustedStat;
}


function getStatsBarColor(i) {
	return colors[datas[(i - 1)]["attribute"]["color"]];
}





function detailCardShowMoves (i) {

	register = 'moves';
	document.getElementById('moves').style = `border: 1px solid rgba(0,0,0,0.9);background-color: ${datas[(i - 1)].attribute.color};color: ${colorChangeATdetailCardShowInfo(i)}`;
	item.querySelector('.detail-content-stats').innerHTML = /*html*/ `
		<div id="moves-container" class="container-moves"></div>
	`;

	item.querySelector('.detail-content-explanation').innerHTML = /*html*/ `
		<div class="overflow-nohi"><i>A Pokémon can only know four moves at a time. In order to learn new moves once four have been learned, it must forget one old move for every new move. Some moves cannot be forgotten naturally, such as moves learned by HM. To remove these, a Trainer must incorporate the help of a Move Deleter. Here, as example, are shown up to 10 possible moves.</i></div>
	`;

	listMovesToDetailCard(i);
}





function listMovesToDetailCard(i) {

	// Hier noch ändern, dass bei mehr als 10 Moves, die Moves random ausgesucht werden!
	// Dann noch das CSS anpassen, damit alles hübsch aussieht!

	let content = document.getElementById('moves-container');
    content.innerHTML = '';

	if(datas[(i - 1)]['moves'].length < 10){
		console.log("Kleiner 10!");
        for (let j = 0; j < datas[(i - 1)]['moves'].length; j++) {
            const move = datas[(i - 1)]['moves'][j]['move']['name'];
			console.log(move);
            content.innerHTML += /*html*/ `
				<div class="container-move">${CapitaliseFirstLetter(move)}</div>
			`;
        }
    } else {
		console.log("Größer 10!)");
        for (let j = 0; j < 10; j++) {
            const move = datas[(i - 1)]['moves'][j]['move']['name'];
			console.log(move);
            content.innerHTML += /*html*/ `
			<div class="container-move">${CapitaliseFirstLetter(move)}</div>
		`;
        }
    }
}



function CapitaliseFirstLetter(word) {
    return word[0].toUpperCase() + word.slice(1);
}









async function detailCardShowEvo (i) {

	// XXX
	let evoChain = await fetchingPokemonDataFromSourceEvolutionChain(i);

	console.log(evoChain);

	register = 'evo';
	document.getElementById('evo').style = `border: 1px solid rgba(0,0,0,0.9);background-color: ${datas[(i - 1)].attribute.color};color: ${colorChangeATdetailCardShowInfo(i)}`;

	item.querySelector('.detail-content-stats').innerHTML = /*html*/ ``;
	
	evoChain.forEach(evo => {
		item.querySelector('.detail-content-stats').innerHTML += /*html*/ `
			<div class="evo-chain-link-container">
				<div class="evo-chain-link-title">ID${evo["id"]} ${evo["name"]}</div>
				<img class="evo-chain-link-img" src="${evo["sprite"]}">
			</div>
		`;
	});
	

	item.querySelector('.detail-content-explanation').innerHTML = /*html*/ `
		<div>Eventuelle Explanations</div>
	`;
}







//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////



/* gets the evolution data from the PokeApi */

async function fetchingPokemonDataFromSourceEvolutionChain(i) {	

	const index = getId(datas[i-1]["technical"]["url_evolution"]);
	// console.log(index);
	// let url = `https://pokeapi.co/api/v2/evolution-chain/${index}/`;
	const url = datas[i-1]["technical"]["url_evolution"];
	// console.log(url);
    let response = await fetch(url);
    let responseAsJson = await response.json();
    evoChain = [];
    pushEvo(responseAsJson.chain.species, index);

    if (responseAsJson.chain.evolves_to.length > 0) {
        pushEvo(responseAsJson.chain.evolves_to[0].species);

        if (responseAsJson.chain.evolves_to[0].evolves_to.length > 0) {
            pushEvo(responseAsJson.chain.evolves_to[0].evolves_to[0].species);
        }
    }

	return evoChain;
}


/* pushes the evolution data (name, id, sprite) into the evolution json */
function pushEvo(data, i) {
    let name = data.name.charAt(0).toUpperCase() + data.name.slice(1);

	// const name = response.name.charAt(0).toUpperCase() + response.name.slice(1);

    let id = getId(data.url)
    let sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    let evoJson = { 'name': name, 'id': id, 'sprite': sprite }

    evoChain.push(evoJson);
}


function getId(link) {
    return link.slice(-5).replace(/\D/g, '');
}






//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////



  
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
  





