// Scroll to each section when a page link is clicked
document.querySelectorAll('a[href^="#"]').forEach(function (link) {  //This finds all links that start with # and go to each link 1 by 1
  link.onclick = function (event) { //This runs code when the user clicks that link.
    event.preventDefault(); //This stops the browser from jumping suddenly to the section.
    document.querySelector(link.getAttribute("href")).scrollIntoView(); //This gets the section ID from the link and scrolls to it.
  };
});
