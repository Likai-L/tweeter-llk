/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
*/

// escape function for safely inserting user text into HTML elements
const escape = function (str) {
  let div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

const createTweetElement = function(tweetObj) {
  const $tweet = $(`<article class="tweet">
  <header>
    <div class="tweet-author" >
      <img src=${tweetObj.user.avatars} alt="lana">
      <p>${tweetObj.user.name}</p>
    </div>
    <p>${tweetObj.user.handle}</p>
  </header>
  <div class="tweet-text">
  <p>${escape(tweetObj.content.text)}</p>
  </div>
  <footer>
    <p>${timeago.format(tweetObj["created_at"])}</p>
    <div class="interactions">
      <i class="fa-solid fa-flag"></i>
      <i class="fa-solid fa-retweet"></i>
      <i class="fa-solid fa-heart"></i>
    </div>
  </footer>
</article>`);
  return $tweet;
};

const renderTweets = function(tweetsArr) {
  for (let tweetObj of tweetsArr) {
    const $tweet = createTweetElement(tweetObj);
    $('#tweets-container').prepend($tweet);
  }
};

const loadTweets = function() {
  $.ajax({
    url: "/tweets/",
    method: "GET"
  })
    .then((tweets) => {
      renderTweets(tweets);
    })
    .catch((error) => {
      console.log(error);
    });
};

// looping hover animation
const hoverAnimation = function(position, duration, cb) {
  $(".fa-angles-down").animate({
    bottom: `${position}px`
  }, {
    duration: duration,
    easing: "linear",
    complete: cb
  });
};

const continuousHoverAnimation = function(upPosition, downPosition, duration) {
  console.log("called");
  const bot = $(".fa-angles-down").css("bottom");
  const midPosition = (upPosition + downPosition) / 2;
  if (bot === `${upPosition}px` || bot === `${midPosition}px`) {
    hoverAnimation(downPosition, duration, () => {
      continuousHoverAnimation(upPosition, downPosition, duration);
    });
  }
  if (bot === `${downPosition}px`) {
    hoverAnimation(upPosition, duration, () => {
      continuousHoverAnimation(upPosition, downPosition, duration);
    });
  }
};

$(document).ready(function() {
  loadTweets();
  $("#new-tweet-form").submit(function(event) {
    event.preventDefault();
    const textBox = $(this).find("textarea");

    // hide the error message before validation
    $("#error-message").css("display", "none");

    // form validation
    if (textBox.val().length === 0) {
      $("#error-message").find("p").text("Your tweet cannot be empty.");
      $("#error-message").slideDown();
      return;
    }
    if (textBox.val().length > 140) {
      $("#error-message").find("p").text("Your tweet is too long.");
      $("#error-message").slideDown();
      return;
    }

    // sned the tweet content using ajax
    $.ajax({
      url: "/tweets/",
      method: "POST",
      data: textBox.serialize()
    })
      .then(() => {
        console.log("Tweet sent!");
        textBox.val("");
        $(".counter").val(140);
        loadTweets();
      })
      .catch((error) => {
        console.log(error);
      });
  });

  $(".nav-left").children().click(function() {
    $(".new-tweet").slideToggle(function() { // the toggle slid is jumpy at the end, my guess is that when the elements disappears the margin calculation is changed and so the position is reclaculated
      if ($(this).is(":visible")) {
        $(".new-tweet").find("textarea").focus();
      }
    });
  });

  $(".nav-left").children().hover(function() { // must be passed in as an function(callback), not function excution(callback()), or it would immediately excute
    continuousHoverAnimation(10, 20, 200);
  }, function() {
    $(".fa-angles-down").stop();
    $(".fa-angles-down").css("bottom", "15px");
  });

});