// Focus div based on nav button click
const home = document.getElementById("homenav");
home.addEventListener("click", activeHome);
function activeHome() {
    document.getElementById("home").className = "active";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "hidden";
}

const single = document.getElementById("singlenav");
single.addEventListener("click", activeSingle);
function activeSingle() {
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "active";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "hidden";
}

const multiple = document.getElementById("multinav");
multiple.addEventListener("click", activeMultiple);
function activeMultiple() {
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "active";
    document.getElementById("guess").className = "hidden";

}

const guess = document.getElementById("guessnav");
guess.addEventListener("click", activeGuess);
function activeGuess() {
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "active";
}

// Flip one coin and show coin image to match result when button clicked

const coin = document.getElementById("coin")
// Add event listener for coin button
coin.addEventListener("click", flipCoin)
async function flipCoin() {
    // Build up the endpoint URL
    const endpoint = "app/flip/"
    // DOM knows what the URI is so that we don't have to hard code it.
    const url = document.baseURI+endpoint
    await fetch (url)
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            console.log(result);


            document.getElementById("singleFlipRresult").innerHTML = result.flip;
            document.getElementById("quarter").setAttribute("src", "./assets/img/" + result.flip + ".png");
            // coin.disabled = true
        })
}

const coins = document.getElementById("coins");
coins.addEventListener("submit", flipCoins)

//function to flip multiple coins
async function flipCoins(event) {
        event.preventDefault();
    // Build up the endpoint URL
        const endpoint = "app/flip/coins/"
        const url = document.baseURI+endpoint
    // This extracts the data object from the form so we can run it through the FormData API
        const formEvent = event.currentTarget
    // Give the data to FormData and wait for a response or log an error to console.
        try {
            const formData = new FormData(formEvent);
    // Hand the form data off to the function that is actually going to interact with the API.
            const flips = await sendFlips({ url, formData });
    // Process the response and manipulate some elements in div#multi.
            console.log(flips);
    // Present the summary information.
            document.getElementById("heads").innerHTML = "Heads: "+flips.summary.heads;
            document.getElementById("tails").innerHTML = "Tails: "+flips.summary.tails;
    // This calls a function what will make a list of coin images based on the array of coin flip results.
    // See below for coinList() function.
        document.getElementById("coinlist").innerHTML = coinList(flips.raw);
        } catch (error) {
            console.log(error);
        }
    }
// Guess a coin flip by making a selection and pressing the button.
// This uses a form in div#guesscoin with a selector to input the value to be sent to the API.
const call = document.getElementById("call")


coins.addEventListener("submit", flipCall)

async function flipCall(event) {
    // Prevent the default reload on event.
        event.preventDefault();
    // Build the url string.
        const endpoint = "app/flip/call/"
        const url = document.baseURI+endpoint
    // Extract the data from the form.
        const formEvent = event.currentTarget
    // Give the data to FormData and wait for a response or log an error to console.
        try {
            const formData = new FormData(formEvent); 
    // Hand the form data off to the function that is actually going to interact with the API.
            const results = await sendFlips({ url, formData });
    // Process the results.
            console.log(results);
    // Present the text results
            document.getElementById("choice").innerHTML = "Guess: "+results.call;
            document.getElementById("actual").innerHTML = "Actual: "+results.flip;
            document.getElementById("results").innerHTML = "Result: "+results.result;
    // Assemble a list containing images corresponding to the game results
        document.getElementById("coingame").innerHTML = '<li><img src="assets/img/'+results.call+'.png" class="bigcoin" id="callcoin"></li><li><img src="assets/img/'+results.flip+'.png" class="bigcoin"></li><li><img src="assets/img/'+results.result+'.png" class="bigcoin"></li>';
        } catch (error) {
            console.log(error);
        }
    }
    // Create a data sender to sent POST request objects from FormData to send to the API using fetch()
    async function sendFlips({ url, formData }) {
    // Extract the form data from the FormData object
        const plainFormData = Object.fromEntries(formData.entries());
    // Turn the FormData into JSON
        const formDataJson = JSON.stringify(plainFormData);
    // Show the console what is going to be sent in the API message body
        console.log(formDataJson);
    // Set up the request object for fetch()
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: formDataJson
        };
    // Send the request and wait for the response
        const response = await fetch(url, options);
    // Pass the response back to the event handler
        return response.json()
    }



// const flip_one_coin = document.getElementById("singlenav")
// // Add event listener for coin button
// flip_one_coin.addEventListener("click", revealSinglenav)
// function revealSinglenav() {
//     document.getElementById("single").setAttribute("class", "display: normal");

// }

// // Flip multiple coins and show coin images in table as well as summary results
// // Enter number and press button to activate coin flip series

// // Guess a flip by clicking either heads or tails button
// const guess_the_result = document.getElementById("guessnav")
// // Add event listener for coin button
// guess_the_result.addEventListener("click", revealGuessnav)
// function revealGuessnav() {
//     document.getElementById("guess").setAttribute("class", "display: normal");

// }

// const guessHeads = document.getElementById("guessHeads")
// // Add event listener for coin button
// guessHeads.addEventListener("click", guessHeadsFunc)
// function guessHeadsFunc() {
//     fetch('http://localhost:5555/app/flip/call', {
//         method: 'POST', // *GET, POST, PUT, DELETE, etc.
//         mode: 'cors', // no-cors, *cors, same-origin
//         cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//         credentials: 'same-origin', // include, *same-origin, omit
//         headers: {
//             'Content-Type': 'application/json'
//             // 'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         redirect: 'follow', // manual, *follow, error
//         referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
//         body: JSON.stringify({guess: "heads"}) // body data type must match "Content-Type" header
//     },
//         { mode: 'cors' })
//         .then(function (response) {
//             return response.json();
//         })
//         .then(function (result) {
//             console.log(result);
//             // document.getElementById("result").innerHTML = result.flip;
//             document.getElementById("guessIMG").setAttribute("src", "./assets/img/" + "heads.png")
//             document.getElementById("resultIMG").setAttribute("src", "./assets/img/" + result.flip + ".png");
//             if (result.flip === "heads"){
//                 document.getElementById("win").innerHTML = "you win";
//             }
//             else{
//                 document.getElementById("win").innerHTML = "you lose"; 
//             }
//         })
// }

// const guessTails = document.getElementById("guessTails")
// // Add event listener for coin button
// guessTails.addEventListener("click", guessTailsFunc)
// function guessTailsFunc() {
//     // document.getElementById("quarter").setAttribute("style", "display: true");

//     fetch('http://localhost:5555/app/flip/call', {
//         method: 'POST', // *GET, POST, PUT, DELETE, etc.
//         mode: 'cors', // no-cors, *cors, same-origin
//         cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//         credentials: 'same-origin', // include, *same-origin, omit
//         headers: {
//             'Content-Type': 'application/json'
//             // 'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         redirect: 'follow', // manual, *follow, error
//         referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
//         body: JSON.stringify({guess: "tails"}) // body data type must match "Content-Type" header
//     },
//         { mode: 'cors' })
//         .then(function (response) {
//             return response.json();
//         })
//         .then(function (result) {
//             console.log(result);
//             // document.getElementById("result").innerHTML = result.flip;
//             document.getElementById("guessIMG").setAttribute("src", "./assets/img/" + "tails.png")
//             document.getElementById("resultIMG").setAttribute("src", "./assets/img/" + result.flip + ".png");
//             if (result.flip === "tails"){
//                 document.getElementById("win").innerHTML = "you win";
//             }
//             else{
//                 document.getElementById("win").innerHTML = "you lose"; 
//             }
//         })
// }
