const fs = require('fs');
const path = require('path');
const express = require('express');
//route that the front-end can request data from
const { animals } = require('./data/animals');


const PORT = process.env.PORT || 3001;
//instantiate the server and tell it to listen for requests
const app = express();

// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());

//we're breaking the Query selector into its own function. This will keep our code maintainable and clean.
function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
      // Save personalityTraits as a dedicated array.
      // If personalityTraits is a string, place it into a new array and save.
      if (typeof query.personalityTraits === 'string') {
        personalityTraitsArray = [query.personalityTraits];
      } else {
        personalityTraitsArray = query.personalityTraits;
      }
      // Loop through each trait in the personalityTraits array:
      personalityTraitsArray.forEach(trait => {
        filteredResults = filteredResults.filter(
          animal => animal.personalityTraits.indexOf(trait) !== -1
        );
      });
    }
    if (query.diet) {
      filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
      filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
      filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    // return the filtered results:
    return filteredResults;
  }
  //function find by ID
  function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
  }
  function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(_dirnames, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );
  
    // return finished code to post route for response
    return animal;
  }

  //validation for new animals
  function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
      return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
      return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
      return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
      return false;
    }
    return true;
  }

//get method: first is a string that describes the route the client will have to fetch from. The second is a callback function that will execute every time that route is accessed with a GET request.
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
      results = filterByQuery(req.query, results);
    }
    res.json(results);
  });
  //specific animals 
  app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {  
    res.json(result);
    } else {
        res.send(404);
    }
  });
  
//defined a route that listens for POST requests
  app.post('/api/animals', (req, res) => {
      req.body.id = animals.length.toString();

//validation if data is incorrect in req.body, send back 400 error
if (!validateAnimal(req.body)){
    res.status(400).send('the animal is not properly formatted.');
}else {
    const animal = createNewAnimal(req.body, animals);
    res.json(animal);
}
});
//method to make the server listen
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
  });