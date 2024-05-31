const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require('pg');
const pool = new Pool({
  user: "labber",
  password: "labber",
  host: "localhost",

});



/// Users

const getUserWithEmail = function(email) {
  const queryStr = `
  SELECT * FROM users
  WHERE email = $1;
  `;
  const queryArgs = [email];
  return pool.query(queryStr, queryArgs)
    .then((result) => {
      const user = result.rows[0];
      let resolvedUser = null;
      
      if (user && user.email.toLowerCase() === email.toLowerCase()) {
        resolvedUser = user;
        console.log("resolveduser", resolvedUser);
      }
      return resolvedUser;
    })
    .catch((err) => {
      console.log(err.message);
    });
};



const getUserWithId = function(id) {
  const queryStr = `
  SELECT * FROM users
  WHERE id = $1;
  `;
  const queryArgs = [id];
  return pool.query(queryStr, queryArgs)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });

};


const addUser = function(user) {
  const queryStr = `
  INSERT INTO users (name, email, password) 
  VALUES ($1, $2, $3)  
  `;
  const queryArgs = [user.name, user.email, user.password];
  return pool.query(queryStr, queryArgs)
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};


/// Reservations

const getAllReservations = function(guest_id, limit = 10) {
  return getAllProperties(null, 2);
};



/// Properties

const getAllProperties = (options, limit = 10) => {
  return pool
    .query(`SELECT * FROM properties LIMIT $1`, [limit])
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
