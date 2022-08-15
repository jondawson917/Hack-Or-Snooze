"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, displayRemoveBtn = false) {
  // console.debug("generateStoryMarkup", story);
  console.debug("generateStoryMarkup");

  const showHeart = Boolean(currentUser);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${displayRemoveBtn ? constructRemoveBtnHTML() : ""}
        ${showHeart ? getHeartHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/* Construct the delete button HTML, given the Boolean response*/
function constructRemoveBtnHTML() {
  return `
      <span class="recycling">
        <i class="fa-solid fa-trash"></i>
      </span>`;
}

function getHeartHTML(story, user) {
  const isFavorite = user.isItFavorite(story);
  const heartType = isFavorite ? "solid" : "regular";
  return `
      <span class="heart">
        <i class="fa-${heartType} fa-heart"></i>
      </span>`;
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function deleteStory(evt) {
  console.debug("deleteStory");
  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  await putUserStoriesOnPage();
}

$ownStories.on("click", ".recycling", deleteStory);

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    // loop through all of users favorites and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}

async function getStoryInput(evt) {
  evt.preventDefault();
  console.debug("getStoryInput");

  //Collect info from the UI
  let storyInput = {
    author: $("#author-name").val(),
    title: $("#title").val(),
    url: $("#url").val(),
  };
  const story = await storyList.addStory(currentUser, storyInput);
  generateStoryMarkup(story);
  hidePageComponents();
  putStoriesOnPage();
}

$addStory.on("submit", getStoryInput);

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    // loop through all of users stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $target = $(evt.target);
  const $closestLi = $target.closest("li");
  const storyId = $closestLi.attr("id");
  console.log(storyId);
  const story = storyList.stories.find((s) => s.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($target.hasClass("fa-solid fa-heart")) {
    // currently a favorite: remove from user's fav list and change star
    await currentUser.removeFavorite(story);
    $target.closest("i").toggleClass("fa-solid fa-heart fa-regular fa-heart");
  } else {
    // currently not a favorite: do the opposite
    await currentUser.addFavorite(story);
    $target.closest("i").toggleClass("fa-solid fa-heart fa-regular fa-heart");
  }
}

$storiesLists.on("click", ".heart", toggleStoryFavorite);

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    // loop through all of users stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}
