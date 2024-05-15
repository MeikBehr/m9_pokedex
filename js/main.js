"use strict";


async function init() {
	await checkNumberOfAvailablePokemon();
	await creatingNewDataArrayWithRootData();
	await fetchingPokemonDataFromSourceV2();
	await fetchingPokemonDataFromSourceSpecies();
	addEventListenerToLoadMoreButton();
	initialiseFindShowWithDatas();
	clearPokedex();
	renderPokedex();
}


async function checkNumberOfAvailablePokemon() {
	let url = `https://pokeapi.co/api/v2/pokemon/?offset=0&limit=2500`;
	let response = await fetch(url);
	let responseJSON = await response.json();
	idNameAndUrlOfAllPokemon = responseJSON['results'];
	numerOfAvailablePokemon = responseJSON['count'];
}


// WARNING! Set numerOfAvailablePokemon = endID	for demonstration purposes!
async function creatingNewDataArrayWithRootData() {
	numerOfAvailablePokemon = endID;
	for (let index = 0; index < numerOfAvailablePokemon; index++) {
		const element = idNameAndUrlOfAllPokemon[index];
		const newObject = createNewDataObject(element, index);
		datas.push(newObject);
	}
}




//////////////////////////////////////////////////////////////////////




async function fetchingPokemonDataFromSourceV2() {
    loadingSpinner(true);
    const responses = await fetchPokemonData();
    processData(responses);
    loadingSpinner(false);
}


async function fetchPokemonData() {
    const promises = [];
    for (let i = startID; i <= endID; i++) {
        const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
        promises.push(fetch(url).then(response => response.json()));
    }
    return await Promise.all(promises);
}


function processData(responses) {
    responses.forEach((response, index) => {
        const pokemonID = startID + index;
        const name = capitalizeFirstLetter(response.name);
        const image = response.sprites.other.dream_world.front_default;
        const image2 = response.sprites.other.home.front_default;
        const image_small = response.sprites.other.showdown.front_default;
        originalDatasV2.push(response);
        datas[pokemonID - 1] = createPokemonData(response, pokemonID, name, image, image2, image_small);
        calculateTotalStat(datas[pokemonID - 1]);
    });
}


function capitalizeFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}



function calculateTotalStat(pokemonData) {
    let statTotal = 0;
    pokemonData.stats.forEach(stat => {
        statTotal += stat.value;
    });
    pokemonData.stats.push({ name: 'total', value: statTotal });
}




async function fetchingPokemonDataFromSourceSpecies() {
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
        });
    });

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
    let [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));

    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);

    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}


function renderPokedex() {
	const container = document.getElementById('pokedex');
	for (let i = startID; i <= endID; i++) {
		container.innerHTML += renderGridItem(i);
	}
	addMousePositionToCssPokemon();
}




async function loadmore() {
	startID = endID + 1;
	endID = endID + 25;
	await fetchingPokemonDataFromSourceV2();
	await fetchingPokemonDataFromSourceSpecies();
	renderPokedex();
	popUpNoShow();
}



  
  
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


////////////////////////////////////////////////////////////////////////////







// function showDetail(i) {
// 	PokemonShowDetailOverlay();

// 	item.classList.remove('flippingDiv-center', 'd-none');
// 	item.classList.add('flippingDiv-center');


// 	const pokemonName = datas[(i - 1)]["technical"]["name"];
// 	item.querySelector('.detail-header-headline').innerHTML = /*html*/ `
// 		<div>${pokemonName}</div>
//         <div>#${datas[(i - 1)]['id']}</div>
// 	`;

// 	item.querySelector('.detail_type_container').innerHTML = /*html*/ `
// 		${datas[i - 1].attribute.types.map(type => `<div class="detail_type">${type.type.name}</div>`).join('')}
// 	`;


// 	let color = 'white';
// 	if (datas[(i - 1)].attribute.color == 'blue' ||
// 		datas[(i - 1)].attribute.color == 'black') {
// 		color = 'white';
// 	}
// 	const background = datas[(i - 1)].attribute.color;
// 	let backgroundColor = getColor(background);
// 	let backgroundColorBrighter = lightenColor(backgroundColor, 80)
// 	item.querySelector('.fp-detail-container').style = `color: ${color};background: linear-gradient(0deg, ${backgroundColor} 0%, ${backgroundColorBrighter} 90%);`;


// 	const pokemonImage = datas[(i - 1)]["technical"]["image_big"];
// 	item.querySelector('.fb-detail-shadowpic').style = `background: url('${pokemonImage}') center center/contain fixed no-repeat;`;
	
	
// 	const left = (i === 1) ? endID : i - 1;
// 	const right = (i === endID) ? 1 : i + 1;

// 	item.querySelector('.detail-header-nav').innerHTML = /*html*/ `
// 		<p onclick="showDetail(${left})"><</p>
// 		<div class="detail-close-button d-none" onclick="hideDetail()"><div>ESC</div></div>
// 		<p onclick="showDetail(${right})">></p>
// 	`;


// 	detailCardInfoMenu(i);

// 	if (register === 'info') {
// 		detailCardShowInfo(i);
// 	}

// 	if (register === 'attribute') {
// 		detailCardShowAttribute(i);
// 	}

// 	if (register === 'moves') {
// 		detailCardShowMoves(i);
// 	}

// 	if (register === 'evo') {
// 		detailCardShowEvo(i);
// 	}


// 	const closeButton = item.querySelector('.detail-close-button');
//     const pokemonDetail = item.querySelector('.fp-detail-container');
//     closeButton.classList.remove('d-none');
//     pokemonDetail.classList.remove('d-none');
	
// 	document.addEventListener('keydown', (event) => {
//     	if (event.key === "Escape") {
// 		  hideDetail();
// 		}

// 		if (event.key === "ArrowLeft") {
// 			showDetail(left);
// 		}

// 		if (event.key === "ArrowRight") {
// 			showDetail(right);
// 		}
// 	}, {once: true});
// }





////////////////////////////////////////////////////////////////////////////


function colorChangeATdetailCardShowInfo(i) {
	let backgroundColor = datas[(i - 1)].attribute.color;
	let fontColor = '#000000';
	if (backgroundColor === 'black' || 
		backgroundColor === 'blue') {
			fontColor = '#FFFFFF';
	} 
	if (backgroundColor === 'white' || 
		backgroundColor === 'yellow') {
			fontColor = '#000000';
	}
	return fontColor;
}



function detailCardShowInfo(i) {
	changeRegisterHeadingStyle('info', 'info', i);
	item.querySelector('.detail-content-stats').innerHTML = detailCardContentStatsTemplate(i);
	item.querySelector('.detail-content-explanation').innerHTML = detailCardContentExplanationTemplate();
}


function setAllRegisterBack() {
	document.getElementById('info').style = ``;
	document.getElementById('stats').style = ``;
	document.getElementById('moves').style = ``;
	document.getElementById('evo').style = ``;
}





function changeRegisterHeadingStyle(newRegister, IdToChange, i) {
	register = newRegister;
	document.getElementById(IdToChange).style = `border: 1px solid rgba(0,0,0,0.9);background-color: ${datas[(i - 1)].attribute.color};color: ${colorChangeATdetailCardShowInfo(i)}`;
}




function detailCardShowAttribute (i) {
	changeRegisterHeadingStyle('attribute', 'stats', i);
	item.querySelector('.detail-content-stats').innerHTML = detailCardStatsTableTemplate();
	const statsTable = item.querySelector('.stats-table');
	statsTable.innerHTML = '';
	datas[i - 1].stats.forEach(stat => {
		let backgroundColor = getColor(datas[(i - 1)].attribute.color);
		statsTable.innerHTML += detailCardStatsTableRowsTemplate(stat, backgroundColor);
	});
	const statsBarEmpty = document.querySelectorAll('.statsBarEmpty');
	setTimeout(() => {
        statsBarEmpty.forEach (stat => {
			stat.style = `width: auto;`;
		})
    }, 500);
	item.querySelector('.detail-content-explanation').innerHTML = detailCardStatsExplanationTemplate();
}



function getStatsBarWidth(value, name) {
	const adjustedStat = Number((value / stats[name]) * 100)
    return adjustedStat;
}


function getStatsBarColor(i) {
	return colors[datas[(i - 1)]["attribute"]["color"]];
}



function detailCardShowMoves (i) {
	changeRegisterHeadingStyle('moves', 'moves', i);
	item.querySelector('.detail-content-stats').innerHTML = detailCardMovesContainerTemplate();
	item.querySelector('.detail-content-explanation').innerHTML = detailCardMovesExplanationTemplate();
	listMovesToDetailCard(i);
}






function CapitaliseFirstLetter(word) {
    return word[0].toUpperCase() + word.slice(1);
}




async function detailCardShowEvo (i) {
	let evoChain = await fetchingPokemonDataFromSourceEvolutionChain(i);
	changeRegisterHeadingStyle('evo', 'evo', i);
	item.querySelector('.detail-content-stats').innerHTML = /*html*/ ``;
	evoChain.forEach(evo => {
		item.querySelector('.detail-content-stats').innerHTML += detailCardEvoTemplate(evo);
	});
	
	item.querySelector('.detail-content-explanation').innerHTML = detailCardEvoExplanationTemplate();
}




async function fetchingPokemonDataFromSourceEvolutionChain(i) {	
	const index = getId(datas[i-1]["technical"]["url_evolution"]);
	const url = datas[i-1]["technical"]["url_evolution"];
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


function pushEvo(data, i) {
    let name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
    let id = getId(data.url)
    let image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    let evoJson = { 'name': name, 'id': id, 'image': image }
    evoChain.push(evoJson);
}


function getId(link) {
    return link.slice(-5).replace(/\D/g, '');
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
  


function initialiseFindShowWithDatas() {
	findShow = [];
	datas.forEach(data => {
		findShow.push(data);
	})
}





function startSearch() {
	let input, substring;
	input = document.getElementById('myInput').value;

	if (input.length > 0) {
		substring = input.toLowerCase();
		const allPossiblePokemon = document.querySelectorAll('.fp-grid-item');
		allPossiblePokemon.forEach(pokemon => {

			let pokemonName = pokemon.querySelector('.fp-pokemon_card__content-heading').innerHTML;
			if (pokemonName.toLowerCase().includes(substring)) {
				pokemon.style.display = 'block';
			} else {
				pokemon.style.display = 'none';
			}
		});

	} else {
			const allPossiblePokemon = document.querySelectorAll('.fp-grid-item');
			allPossiblePokemon.forEach(pokemon => {
				pokemon.style.display = 'block';
		});
	}

}


function addEventListenerToLoadMoreButton() {
	const button = document.getElementById('btn-load-more');
	button.addEventListener('mouseover', popUpShow);
	button.addEventListener('mouseout', popUpNoShow);
}


function addEventListenerToClearButton() {
	const button = document.getElementById('clear');
	document.querySelector('#myInput').value = ""; 
	startSearch();
}


function popUpShow() {
    const popUp = document.getElementById("myPopup");
    popUp.classList.add("show");
}


function popUpNoShow() {
    const popUp = document.getElementById("myPopup");
    popUp.classList.remove("show");
}


