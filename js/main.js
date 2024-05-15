"use strict";

/**
 * Initializes the application. 
 */
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


/**
 * Retrieves the number of available Pokemon from the PokeAPI.
 */
async function checkNumberOfAvailablePokemon() {
	let url = `https://pokeapi.co/api/v2/pokemon/?offset=0&limit=2500`;
	let response = await fetch(url);
	let responseJSON = await response.json();
	idNameAndUrlOfAllPokemon = responseJSON['results'];
	numerOfAvailablePokemon = responseJSON['count'];
}


/**
 * Creates a new data array with root data.
 */
async function creatingNewDataArrayWithRootData() {
	numerOfAvailablePokemon = endID;							// WARNING! Set numerOfAvailablePokemon = endID	for demonstration purposes!
	for (let index = 0; index < numerOfAvailablePokemon; index++) {
		const element = idNameAndUrlOfAllPokemon[index];
		const newObject = createNewDataObject(element, index);
		datas.push(newObject);
	}
}


/**
 * Fetches Pokemon data from the PokeAPI.
 */
async function fetchingPokemonDataFromSourceV2() {
    loadingSpinner(true);
    const responses = await fetchPokemonData();
    processData(responses);
    loadingSpinner(false);
}


/**
 * Fetches Pokemon data from the PokeAPI.
 */
async function fetchPokemonData() {
    const promises = [];
    for (let i = startID; i <= endID; i++) {
        const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
        promises.push(fetch(url).then(response => response.json()));
    }
    return await Promise.all(promises);
}



/**
 * Processing Pokemon data
 * @param {*} responses 
 */
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


/**
 * Calculates the total stat of a Pokemon.
 * @param {*} pokemonData 
 */
function calculateTotalStat(pokemonData) {
    let statTotal = 0;
    pokemonData.stats.forEach(stat => {
        statTotal += stat.value;
    });
    pokemonData.stats.push({ name: 'total', value: statTotal });
}


/**
 * Fetches species data from the PokeAPI.
 */
async function fetchingPokemonDataFromSourceSpecies() {
    loadingSpinner(true);
    const promises = createPromisesForSpeciesData();
    const results = await Promise.all(promises);
    processSpeciesData(results);
    loadingSpinner(false);
}


/**
 * Creates promises for species data.
 * @returns 
 */
function createPromisesForSpeciesData() {
    const promises = [];
    for (let i = startID; i <= endID; i++) {
        if (datas[i - 1]["technical"]["name_de"] === '') {
            const url = datas[i - 1]["technical"]["url_species"];
            promises.push(fetch(url).then(response => response.json()));
        }
    }
    return promises;
}


/**
 * Processes species data.
  * @param {Array} results The array of species data results.
 */
function processSpeciesData(results) {
    results.forEach((responseJSON, index) => {
        const i = startID + index;
        updateTechnicalData(i, responseJSON);
        updateAttributeData(i, responseJSON);
        updateOriginalDataSpecies(responseJSON);
    });
}


/**
 * Updates technical data for a Pokémon.
 * @param {number} i 
 * @param {object} responseJSON 
 */
function updateTechnicalData(i, responseJSON) {
    datas[i - 1]["technical"]["name_de"] = responseJSON["names"][5]["name"];
    datas[i - 1]["technical"]["url_evolution"] = responseJSON["evolution_chain"]["url"];
}


/**
 * Updates attribute data for a Pokémon.
  * @param {number} i The index of the Pokémon.
 * @param {object} responseJSON The JSON response containing species data.
 */
function updateAttributeData(i, responseJSON) {
    datas[i - 1]["attribute"]["color"] = responseJSON.color.name;
    datas[i - 1]["attribute"]["flavor_text_entries"] = responseJSON.flavor_text_entries[11].flavor_text;
}


/**
 * Updates original data species array.
  * @param {object} responseJSON The JSON response containing species data.
 */
function updateOriginalDataSpecies(responseJSON) {
    originalDatasSpecies.push(responseJSON);
}


/**
 * Toggles the loading spinner.
  * @param {boolean} showing Flag indicating whether to show or hide the spinner.
 */
function loadingSpinner(showing) {
    if (showing == true) {
		document.getElementById('loader_container').classList.remove('d-none');
		document.body.classList.add('no-scroll');
    } else {
		document.getElementById('loader_container').classList.add('d-none');
		document.body.classList.remove('no-scroll');
    }
}


/**
 * Clears the Pokedex container.
 */
function clearPokedex() {
	const container = document.getElementById('pokedex');
	container.innerHTML = '';
}


/**
 * Gets the color for a given name.
  * @param {string} name The name of the color.
 * @returns {string} The color code.
 */
function getColor(name) {
    return colors[name] || '#FFFFFF';
}


/**
 * Lightens a given color.
  * @param {string} hex The hexadecimal color code.
 * @param {number} amount The amount by which to lighten the color.
 * @returns {string} The lightened color code.
 */
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


/**
 * Renders the Pokedex by adding grid items to the container and adding mouse position effect.
 */
function renderPokedex() {
	const container = document.getElementById('pokedex');
	for (let i = startID; i <= endID; i++) {
		container.innerHTML += renderGridItem(i);
	}
	addMousePositionToCssPokemon();
}


/**
 * Loads more Pokémon data and updates the Pokedex accordingly.
 */
async function loadmore() {
	startID = endID + 1;
	endID = endID + 25;
	await fetchingPokemonDataFromSourceV2();
	await fetchingPokemonDataFromSourceSpecies();
	renderPokedex();
	popUpNoShow();
}


/**
 * Hides the detail card.
 */
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


/**
 * Shows the detail card for a specific Pokémon.
  * @param {number} i The index of the Pokémon.
 */
function showDetail(i) {
    PokemonShowDetailOverlay();
    updateItemClass();
    updateDetailHeader(i);
    updateDetailTypeContainer(i);
    updateDetailStyle(i);
    updatePokemonImage(i);
    updateDetailHeaderNav(i);
	detailCardInfoMenu(i);
    updateDetailContent(i);
    const closeButton = item.querySelector('.detail-close-button');
    const pokemonDetail = item.querySelector('.fp-detail-container');
    updateVisibility(closeButton, pokemonDetail);
    addEventListeners(i);
}


/**
 * Updates the class of the detail card item.
 */
function updateItemClass() {
    item.classList.remove('flippingDiv-center', 'd-none');
    item.classList.add('flippingDiv-center');
}


/**
 * Updates the header of the detail card.
  * @param {number} i The index of the Pokémon.
 */
function updateDetailHeader(i) {
    const pokemonName = capitalizeFirstLetter(datas[i - 1]["technical"]["name"]);
    item.querySelector('.detail-header-headline').innerHTML = /*html*/ `
        <div>${pokemonName}</div>
        <div>#${datas[i - 1]['id']}</div>
    `;
}


/**
 * Updates the type container of the detail card.
  * @param {number} i The index of the Pokémon.
 */
function updateDetailTypeContainer(i) {
    item.querySelector('.detail_type_container').innerHTML = /*html*/ `
        ${datas[i - 1].attribute.types.map(type => `<div class="detail_type">${type.type.name}</div>`).join('')}
    `;
}


/**
 * Updates the style of the detail card.
  * @param {number} i The index of the Pokémon.
 */
function updateDetailStyle(i) {
    let color = 'white';
    const colorOptions = ['blue', 'black'];
    if (colorOptions.includes(datas[i - 1].attribute.color)) {
        color = 'white';
    }
    const background = datas[i - 1].attribute.color;
    const backgroundColor = getColor(background);
    const backgroundColorBrighter = lightenColor(backgroundColor, 80);
    item.querySelector('.fp-detail-container').style = `color: ${color};background: linear-gradient(0deg, ${backgroundColor} 0%, ${backgroundColorBrighter} 90%);`;
}


/**
 * Updates the image of the detail card.
 * @param {number} i The index of the Pokémon.
 */
function updatePokemonImage(i) {
    const pokemonImage = datas[i - 1]["technical"]["image_big"];
    item.querySelector('.fb-detail-shadowpic').style = `background: url('${pokemonImage}') center center/contain fixed no-repeat;`;
}


/**
 * Updates the navigation buttons of the detail card.
  * @param {number} i The index of the Pokémon.
 */
function updateDetailHeaderNav(i) {
    const left = (i === 1) ? endID : i - 1;
    const right = (i === endID) ? 1 : i + 1;
    item.querySelector('.detail-header-nav').innerHTML = /*html*/ `
        <p onclick="showDetail(${left})"><</p>
        <div class="detail-close-button d-none" onclick="hideDetail()"><div>ESC</div></div>
        <p onclick="showDetail(${right})">></p>
    `;
}


/**
 * Updates the content of the detail card based on the selected register.
  * @param {number} i The index of the Pokémon.
 */
function updateDetailContent(i) {
    switch (register) {
        case 'info':
            detailCardShowInfo(i);
            break;
        case 'attribute':
            detailCardShowAttribute(i);
            break;
        case 'moves':
            detailCardShowMoves(i);
            break;
        case 'evo':
            detailCardShowEvo(i);
            break;
    }
}


/**
 * Updates the visibility of elements in the detail card.
  * @param {HTMLElement} closeButton The close button element.
 * @param {HTMLElement} pokemonDetail The detail card element.
 */
function updateVisibility(closeButton, pokemonDetail) {
    closeButton.classList.remove('d-none');
    pokemonDetail.classList.remove('d-none');
}


/**
 * Adds event listeners to the detail card.
  * @param {number} i The index of the Pokémon.
 */
function addEventListeners(i) {
	const left = (i === 1) ? endID : i - 1;
	const right = (i === endID) ? 1 : i + 1;
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


/**
 * Changes the font color based on the background color for the detail card.
  * @param {number} i The index of the Pokémon.
 * @returns {string} The font color.
 */
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


/**
 * Shows the info register in the detail card.
  * @param {number} i The index of the Pokémon.
 */
function detailCardShowInfo(i) {
	changeRegisterHeadingStyle('info', 'info', i);
	item.querySelector('.detail-content-stats').innerHTML = detailCardContentStatsTemplate(i);
	item.querySelector('.detail-content-explanation').innerHTML = detailCardContentExplanationTemplate();
}


/**
 * Resets all register styles to default.
 */
function setAllRegisterBack() {
	document.getElementById('info').style = ``;
	document.getElementById('stats').style = ``;
	document.getElementById('moves').style = ``;
	document.getElementById('evo').style = ``;
}


/**
 * Changes the heading style for the detail card register.
  * @param {string} newRegister The new register.
 * @param {string} IdToChange The ID of the element to change.
 * @param {number} i The index of the Pokémon.
 */
function changeRegisterHeadingStyle(newRegister, IdToChange, i) {
	register = newRegister;
	document.getElementById(IdToChange).style = `border: 1px solid rgba(0,0,0,0.9);background-color: ${datas[(i - 1)].attribute.color};color: ${colorChangeATdetailCardShowInfo(i)}`;
}



/**
 * Shows the attribute register in the detail card.
  * @param {number} i The index of the Pokémon.
 */
function detailCardShowAttribute (i) {
	changeRegisterHeadingStyle('attribute', 'stats', i);
	item.querySelector('.detail-content-stats').innerHTML = detailCardStatsTableTemplate();
	const statsTable = item.querySelector('.stats-table');
	statsTable.innerHTML = '';
	datas[i - 1].stats.forEach(stat => {
		let backgroundColor = getColor(datas[(i - 1)].attribute.color);
		statsTable.innerHTML += detailCardStatsTableRowsTemplate(stat, backgroundColor);
	});
	adjustEmptyStatBarsWidth();
	item.querySelector('.detail-content-explanation').innerHTML = detailCardStatsExplanationTemplate();
}


/**
 * Adjusts the width of empty stat bars in the detail card.
 */
function adjustEmptyStatBarsWidth() {
    const statsBarEmpty = document.querySelectorAll('.statsBarEmpty');
    setTimeout(() => {
        statsBarEmpty.forEach (stat => {
			stat.style = `width: auto;`;
		})
    }, 500);
}


/**
 * Calculates the width of a stat bar in the detail card.
  * @param {number} value The value of the stat.
 * @param {string} name The name of the stat.
 * @returns {number} The width of the stat bar.
 */
function getStatsBarWidth(value, name) {
	const adjustedStat = Number((value / stats[name]) * 100)
    return adjustedStat;
}


/**
 * Gets the color for a stat bar in the detail card.
  * @param {number} i The index of the Pokémon.
 * @returns {string} The color code.
 */
function getStatsBarColor(i) {
	return colors[datas[(i - 1)]["attribute"]["color"]];
}


/**
 * Shows the moves register in the detail card.
  * @param {number} i The index of the Pokémon.
 */
function detailCardShowMoves (i) {
	changeRegisterHeadingStyle('moves', 'moves', i);
	item.querySelector('.detail-content-stats').innerHTML = detailCardMovesContainerTemplate();
	item.querySelector('.detail-content-explanation').innerHTML = detailCardMovesExplanationTemplate();
	listMovesToDetailCard(i);
}


/**
 * Capitalizes the first letter of a String.
 * @param {string} name 
 * @returns 
 */
function capitalizeFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}


/**
 * Shows the evolution register in the detail card.
  * @param {number} i The index of the Pokémon.
 */
async function detailCardShowEvo (i) {
	let evoChain = await fetchingPokemonDataFromSourceEvolutionChain(i);
	changeRegisterHeadingStyle('evo', 'evo', i);
	item.querySelector('.detail-content-stats').innerHTML = /*html*/ ``;
	evoChain.forEach(evo => {
		item.querySelector('.detail-content-stats').innerHTML += detailCardEvoTemplate(evo);
	});
	item.querySelector('.detail-content-explanation').innerHTML = detailCardEvoExplanationTemplate();
}



/**
 * Fetches the evolution chain data for a Pokémon.
 * 
 * @param {number} i The index of the Pokémon.
 * @returns {Array} The array containing evolution chain data.
 */
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


/**
 * Pushes evolution data to the evolution chain array.
  * @param {object} data The evolution data.
 * @param {number} i The index of the Pokémon.
 */
function pushEvo(data, i) {
    let name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
    let id = getId(data.url)
    let image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    let evoJson = { 'name': name, 'id': id, 'image': image }
    evoChain.push(evoJson);
}


/**
 * Extracts the ID from a URL link.
  * @param {string} link The URL link.
 * @returns {string} The extracted ID.
 */
function getId(link) {
    return link.slice(-5).replace(/\D/g, '');
}


/**
 * Shows the detail overlay for a Pokémon.
 */
function PokemonShowDetailOverlay() {
	  const overlay = document.getElementById('fp-overlay')
	  overlay.classList.remove('d-none');
	  document.body.classList.add('no-scroll');
}
  
  
/**
 * Hides the detail overlay for a Pokémon.
 */
function hidePokemonOverlay() {
	 const overlay = document.getElementById('fp-overlay');
	 overlay.classList.add('d-none');
	 document.body.classList.remove('no-scroll');
}
  

/**
 * Adds mouse position effect to CSS Pokémon elements.
 */
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


/**
 * Initializes the findShow array with datas.
 */
function initialiseFindShowWithDatas() {
	findShow = [];
	datas.forEach(data => {
		findShow.push(data);
	})
}


/**
 * Starts the search functionality.
 */
function startSearch() {
    const input = document.getElementById('myInput').value.toLowerCase().trim();
    const allPossiblePokemon = document.querySelectorAll('.fp-grid-item');
    allPossiblePokemon.forEach(pokemon => {
        const pokemonName = pokemon.querySelector('.fp-pokemon_card__content-heading').textContent.toLowerCase();
        pokemon.style.display = pokemonName.includes(input) ? 'block' : 'none';
    });
}


/**
 * Adds event listener to the load more button.
 */
function addEventListenerToLoadMoreButton() {
	const button = document.getElementById('btn-load-more');
	button.addEventListener('mouseover', popUpShow);
	button.addEventListener('mouseout', popUpNoShow);
}


/**
 * Adds event listener to the clear button.
 */
function addEventListenerToClearButton() {
	const button = document.getElementById('clear');
	document.querySelector('#myInput').value = ""; 
	startSearch();
}


/**
 * Shows the popup.
 */
function popUpShow() {
    const popUp = document.getElementById("myPopup");
    popUp.classList.add("show");
}


/**
 * Hides the popup.
 */
function popUpNoShow() {
    const popUp = document.getElementById("myPopup");
    popUp.classList.remove("show");
}
