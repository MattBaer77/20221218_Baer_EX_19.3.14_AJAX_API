"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $episodesList = $("#episodes-list");
const $searchForm = $("#search-form");

const defaultImage = 'https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300'


/* Given a search term, search for tv shows that match that query.
*
*  Returns (promise) array of show objects: [show, show, ...].
*    Each show object should contain exactly: {id, name, summary, image}
*    (if no image URL given by API, put in a default image URL)
*/

// Makes API call to TV maze - returns an array of objects containing key-value pairs for id, name, summary, and image. Placeholder text or image provided if any of the values do not exist.

async function getShowsByTerm(term) {

  const res = await axios.get('https://api.tvmaze.com/search/shows', {params: {q: term}}); //API Call

  // Defines the format of the data to be returned. Selects appropriate data from the JSON element.
  return res.data.map(function(each){return {
    id: each.show.id? each.show.id : 'NO ID Available',
    name: each.show.name? each.show.name: 'NO NAME Available',
    summary: each.show.summary? each.show.summary : 'NO SUMMARY Available',
    image: each.show.image? each.show.image.medium : defaultImage
  }});

}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty(); // Emptys the show list if already populated.

  // Loops over shows and creates appropriate HTML for each show.
  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="Bletchly Circle San Francisco" 
              class="w-25 mr-10">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show); // Appends each show to the DOM
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  // const term = $("#searchForm-term").val(); // Origianl line which did not correctly function.
  const term = $("#search-query").val(); // Corrected line to extract the search term from the search box on the page
  const shows = await getShowsByTerm(term); // Calls the getShowsByTerm in order to make API call to tvmaze

  $episodesArea.hide(); // Hides episodesArea for new search so that incorrect episode data from last search does not remain after new search initiated.
  populateShows(shows); // Calls populateShows to populate DOM with appropriate markup
}

// Event listener created for form submission. Prevents default and runs searchForShowAndDisplay()
$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


// ADDING EPISODES


/** Given a show ID, get from API and return (promise) array of episodes:
*      { id, name, season, number }
*/

async function getEpisodesOfShow(id) {

  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`); // API Call

  // Defines the format of the data to be returned. Selects appropriate data from the JSON element.
  return (res.data.map(function(each){
    return {
      id: each.id ? each.id : 'NO ID',
      name: each.name ? each.name : 'NO NAME',
      season: each.season ? each.season : 'ONLY 1 SEASON',
      number: each.number ? each.number : 'NO NUMBER'
    };
  }))

}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {

  $episodesList.empty() //Emptys episode list if already populated

  // Loops over episodes and creates appropriate HTML for each episode.
  for (let episode of episodes) {
    const $episode = $(`<li>(${episode.season} : ${episode.number}) ${episode.name} ID: ${episode.id} </li>`);
    $episodesList.append($episode); // Appends each show to the DOM
  }

  $episodesArea.show(); // Shows the episodesArea if hidden

}

// Creates event listener for "Episodes Button" of nearest show. Selects nearest show's ID to pass into getEpisodesOfShow. Populates episodes to page by running "populateEpisodes function"
$($showsList).on("click", ".Show-getEpisodes", async function handleEpClick(e) {
  const showId = $(e.target).closest(".Show").data("show-id"); // Reference this line for "Ask Mikael" question below.
  let episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
})

// Questions - Ask Mikael

// This approach relys on the DOM to reference data to handle the episodes event. Would a more robust approach be to hold the list of shows in memory and have the DOM elements reference that memory, so that one could not manipulate the DOM through the console and therefore change possible outcomes of functions. For instance, if someone manipulates the "show-id" in the DOM, then clicking on that show's Episodes button would yield a different-than-expected result. This use case is probably less of an issue than in the memory game application as this manipulation would only cheat the end user by returning incorrect values.