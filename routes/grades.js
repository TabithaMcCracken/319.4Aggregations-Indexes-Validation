import express from 'express'

import db from '../db/conn.js'

import {ObjectId} from 'mongodb'
const router = express.Router()


//Slack assignment with airbnb listings
// Route Endpoints:
// 	Get /listings: Get all listings from the database.
// 	Get /listings/:id: Get a specific listing by its ID.
// 	Get /listings/query: Get listings based on specific query parameters.
	
// Query Parameters:
// 	property_type: Filter listings by property type (e.g., "Apartment", "Condominium").
// 	accommodates: Filter listings by the number of people accommodated.
// 	price: Filter listings by price range.
// 	min_reviews: Filter listings by minimum number of reviews.

// Add other params such sort…
// 	Post /listings: add a new document to the db
// 	Delete /listings/:id : Delete a document using id
// 	Put /listings/:id : update a document using the body
	
// Extra
// 	Instead of sending data raw, send it in html format, where you only have the name of each listing, and make it clickable, if you click on it. It takes you to the listing page   /listings/:id Where you have all information
// 	Add button to delete and update
// 	Add update page where you have a form that update the document







export default router