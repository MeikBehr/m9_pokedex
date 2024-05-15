"use strict";


/**
 * Renders the grid item for a Pokémon.
 * @param {number} i - The index of the Pokémon.
 * @returns {string} - The HTML code for the grid item.
 */
function renderGridItem(i) {
    const background = datas[(i - 1)].attribute.color;
	let backgroundColor = getColor(background);
	let backgroundColorBrighter = lightenColor(backgroundColor, 80);
    let color = 'white';
    return /*html*/ `
    <!-- Karte ${i}-->
    <div class="fp-grid-item" id="card-${i}" style="background-color: ${datas[(i - 1)].attribute.color};color: ${color};">
        <div class="fp-card-container fp-pokemon_card-container--3d-hover">
            <div class="fp-pokemon_card">
                <div class="fp-pokemon_card-under" style="background: linear-gradient(0deg, ${backgroundColor} 0%, ${backgroundColorBrighter} 70%);">
                    <div class="fp-pokemon_card__content">
                        <h4 class="fp-pokemon_card__content-heading">#${datas[(i - 1)]['id']} ${datas[(i - 1)]["technical"]["name"]}</h4>
                        <p class="fp-pokemon_card__content-subhead">(${datas[(i - 1)]["technical"]["name_de"]})</p>
                        <div class="fp-pokemon_type_container">
                            ${datas[i - 1].attribute.types.map(type => `<div class="fp-pokemon_type">${type.type.name}</div>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="fp-pokemon_card-over"  onclick="showDetail(${i})">
                    <div>
                        <div class="fp-pokemon_card-link">
                            <img class="fp-pokemon_card__image-pokemon" src="${datas[(i - 1)]["technical"]["image_big2"]}"  alt="Bild vom Pokemon ${datas[(i - 1)]["technical"]["name"]}">
                            <p class="fp-pokemon_card-link-text">Click me!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
 `
}


/**
 * Updates the detail card info menu.
 * @param {number} i - The index of the Pokémon.
 */
function detailCardInfoMenu(i) {
	item.querySelector('.detail-content-headline').innerHTML = /*html*/ `
		<div id="info" class="detail-content-tab" onclick="setAllRegisterBack(), detailCardShowInfo(${i})">Info</div>
        <div id="stats" class="detail-content-tab" onclick="setAllRegisterBack(), detailCardShowAttribute(${i})">Stats</div>
        <div id="moves" class="detail-content-tab" onclick="setAllRegisterBack(), detailCardShowMoves(${i})">Moves</div>
        <div id="evo" class="detail-content-tab" onclick="setAllRegisterBack(), detailCardShowEvo(${i})">Evolution</div>
	`;
}


/**
 * Generates the HTML template for the stats content in the detail card.
 * @param {number} i - The index of the Pokémon.
 * @returns {string} - The HTML template.
 */
function detailCardContentStatsTemplate(i) {
    return /*html*/ `
        <div class="detailcard-info">
            <div>
                <div class="detailcard-info-element">Species: ${originalDatasSpecies[(i - 1)].genera[7].genus}</div>
                <div class="detailcard-info-element">Height: ${(datas[(i - 1)].attribute.height / 10).toFixed(1)} m</div>
                <div class="detailcard-info-element">Weight: ${(datas[(i - 1)].attribute.weight / 10).toFixed(1)} kg</div>
                <div class="detailcard-info-element">Abilities: ${datas[i - 1].attribute.abilities.map(type => type.ability.name).join(', ')}</div>
            </div>

            <div class="detail-content-image">
                <img src="${datas[(i - 1)]["technical"]["image_small"]}" alt="Animiertes Bild von ${datas[(i - 1)]["technical"]["name"]}">
            </div>
        </div>
    `;
}


/**
 * Generates the HTML template for the explanation content in the detail card.
 * @returns {string} - The HTML template.
 */
function detailCardContentExplanationTemplate() {
    return  /*html*/ `
        <div><i>Pokémon have existed since ancient times. It's said that Arceus, is known to be the first Pokémon in existence, while Mew is known to be a common a ancestor among all naturally born Pokémon. Pokémon in the dinosauric past have since fossilized and gone extinct, but many can still be revived in the modern day. 
        <a href="https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_(species)" target="_blank">(https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_(species))</a></i></div>
    `;
}


/**
 * Generates the HTML template for the stats table in the detail card.
 * @returns {string} - The HTML template.
 */
function detailCardStatsTableTemplate() {
    return /*html*/ `
        <table>
            <tbody class="stats-table">
            </tbody>
        </table>
    `;
}


/**
 * Generates the HTML template for the rows in the stats table.
 * @param {Object} stat - The stat data.
 * @param {string} backgroundColor - The background color.
 * @returns {string} - The HTML template.
 */
function detailCardStatsTableRowsTemplate(stat, backgroundColor) {
    return /*html*/ `
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
}


/**
 * Generates the HTML template for the stats explanation in the detail card.
 * @returns {string} - The HTML template.
 */
function detailCardStatsExplanationTemplate() {
    return /*html*/ `
        <div><em>Stats max values taken from <a href="https://www.serebii.net/pokedex-sv/stat/hp.shtml" target="_blank">https://www.serebii.net/pokedex-sm/stat/</a> Gen VII Dex</em></div>
    `;
}


/**
 * Generates the HTML template for the moves container in the detail card.
 * @returns {string} - The HTML template.
 */
function detailCardMovesContainerTemplate() {
    return /*html*/ `
        <div id="moves-container" class="container-moves"></div>
    `;
}


/**
 * Generates the HTML template for the moves explanation in the detail card.
 * @returns {string} - The HTML template.
 */
function detailCardMovesExplanationTemplate() {
    return /*html*/ `
        <div class="overflow-nohi"><i>A Pokémon can only know four moves at a time. In order to learn new moves once four have been learned, it must forget one old move for every new move. Some moves cannot be forgotten naturally, such as moves learned by HM. To remove these, a Trainer must incorporate the help of a Move Deleter. Here, as example, are shown up to 10 possible moves.</i></div>
    `;
}


/**
 * Lists moves to the detail card.
 * @param {number} i - The index of the Pokémon.
 */
function listMovesToDetailCard(i) {
	let content = document.getElementById('moves-container');
    content.innerHTML = '';

	if(datas[(i - 1)]['moves'].length < 10){
        for (let j = 0; j < datas[(i - 1)]['moves'].length; j++) {
            const move = datas[(i - 1)]['moves'][j]['move']['name'];
            content.innerHTML += /*html*/ `
				<div class="container-move">${CapitaliseFirstLetter(move)}</div>
			`;
        }
    } else {
        for (let j = 0; j < 10; j++) {
            const move = datas[(i - 1)]['moves'][j]['move']['name'];
            content.innerHTML += /*html*/ `
			<div class="container-move">${CapitaliseFirstLetter(move)}</div>
		`;
        }
    }
}


/**
 * Generates the HTML template for the evolution chain in the detail card.
 * @param {Object} evo - The evolution data.
 * @returns {string} - The HTML template.
 */
function detailCardEvoTemplate(evo) {
    return /*html*/ `
        <div class="evo-chain-link-container">
            <div class="evo-chain-link-title">#${evo["id"]} ${evo["name"]}</div>
            <img class="evo-chain-link-img" src="${evo["image"]}">
        </div>
    `;
}


/**
 * Generates the HTML template for the evolution explanation in the detail card.
 * @returns {string} - The HTML template.
 */
function detailCardEvoExplanationTemplate() {
    return /*html*/ `
        <div><i>A Pokémon can evolve in a variety of different ways, such as gaining a level or gaining a new owner, or if it just really likes you.</i></div>
    `;
}

