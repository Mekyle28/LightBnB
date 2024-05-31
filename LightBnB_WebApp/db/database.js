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
  RETURNING *;
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
  const queryStr = `
  SELECT reservations.*, properties.*, AVG(property_reviews.rating) AS average_rating
  FROM reservations
  JOIN properties ON properties.id = reservations.property_id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY start_date
  LIMIT $2;
  `;
  const queryArgs = [guest_id, limit];
  return pool.query(queryStr, queryArgs)
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};



/// Properties

const getAllProperties = function(options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;
  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    if (queryParams.length === 1) {
      queryString += `WHERE city LIKE $${queryParams.length} `;
    }
    if (queryParams.length > 1) {
      queryString += `AND city LIKE $${queryParams.length} `;
    }
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    if (queryParams.length === 1) {
      queryString += `WHERE owner_id = $${queryParams.length} `;
    }
    if (queryParams.length > 1) {
      queryString += `AND owner_id = $${queryParams.length} `;
    }
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    if (queryParams.length === 1) {
      queryString += `WHERE cost_per_night >= $${queryParams.length} `;
    }
    if (queryParams.length > 1) {
      queryString += `AND cost_per_night >= $${queryParams.length} `;
    }
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    if (queryParams.length === 1) {
      queryString += `WHERE cost_per_night <= $${queryParams.length} `;
    }
    if (queryParams.length > 1) {
      queryString += `AND cost_per_night <= $${queryParams.length} `;
    }
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `
  GROUP BY properties.id 
  HAVING AVG(property_reviews.rating) >= $${queryParams.length} `;
  } else {
    queryString += `
  GROUP BY properties.id `;
  }
  // 4
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  console.log("queryString, queryParams", queryString, queryParams);
  return pool.query(queryString, queryParams)
    .then((res) => res.rows)
    .catch((err) => console.log(err.message));
};



//Add a property to the database
const addProperty = function(property) {
  const queryStr = `
  INSERT INTO properties (
    owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, province, city, country, street, post_code, parking_spaces, number_of_bathrooms, number_of_bedrooms) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)  
    RETURNING *;
  `;
  const queryArgs = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.province, property.city, property.country, property.street, property.post_code, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms];
  return pool.query(queryStr, queryArgs)
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
