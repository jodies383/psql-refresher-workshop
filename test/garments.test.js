const PgPromise = require("pg-promise")
const assert = require("assert");
const fs = require("fs");

require('dotenv').config()
describe('As part of the sql refresh workshop', () => {
	const DATABASE_URL = process.env.DATABASE_URL;

	const pgp = PgPromise({});
	const db = pgp(DATABASE_URL);
	// we are explicitly not using an arrow function here to support this.timeout
	before(async function () {
		this.timeout(5000);
		await db.none(`delete from garment`);
		const commandText = fs.readFileSync('./sql/data.sql', 'utf-8');
		await db.none(commandText)
	});

	it('you should create a garment table in the database', async () => {

		// use db.one
		const result = await db.one(`select count(*) from garment`)
		// no changes below this line in this function
		assert.ok(result.count);
	});

	it('there should be 11 garments in the garment table - added using the supplied script', async () => {

		// use db.one as 1 result us expected
		const result = await db.one(`select count(*) from garment`)

		// no changes below this line in this function

		assert.equal(30, result.count);
	});

	it('you should be able to find all the Summer garments', async () => {
		// add some code below
		const result = await db.one(`SELECT count(*) FROM garment WHERE season = 'Summer'`)
		// no changes below this line in this function
		assert.equal(12, result.count);
	});

	it('you should be able to find all the Winter garments', async () => {
		// add some code below
		const result = await db.one(`SELECT count(*) FROM garment WHERE season = 'Winter'`)

		// no changes below this line in this function
		assert.equal(5, result.count);
	});

	it('you should be able to find all the Winter Male garments', async () => {
		// change the code statement below
		const result = await db.one(`SELECT count(*) FROM garment WHERE season = 'Winter' AND gender = 'Male'`)

		// no changes below this line in this function
		assert.equal(3, result.count);
	});

	it('you should be able to change a given Male garment to a Unisex garment', async () => {

		// use db.one with an update sql statement
		await db.none(`update garment set gender = 'Unisex' where gender = 'Male' AND description = 'Red hooded jacket'`)
		// write your code above this line

		const gender_sql = 'select gender from garment where description = $1'
		const gender = await db.one(gender_sql, ['Red hooded jacket'], r => r.gender);
		assert.equal('Unisex', gender);

	});

	it('you should be able to add 2 Male & 3 Female garments', async () => {

		// use db.none - change code below here...
		await db.none(`insert into garment(description, img, season, gender, price) values ('Bunny t-shirt', 'collared-128x128-455119.png', 'Summer', 'Male', '88.24');`)
		await db.none(`insert into garment(description, img, season, gender, price) values ('Christmas t-shirt', 'collared-128x128-455119.png', 'Summer', 'Male', '98.24');`)
		await db.none(`insert into garment(description, img, season, gender, price) values ('Rainbow t-shirt', 'collared-128x128-455119.png', 'Summer', 'Female', '49.24');`)
		await db.none(`insert into garment(description, img, season, gender, price) values ('Flower t-shirt', 'collared-128x128-455119.png', 'Summer', 'Female', '69.24');`)
		await db.none(`insert into garment(description, img, season, gender, price) values ('Graphic t-shirt', 'collared-128x128-455119.png', 'Winter', 'Female', '80.24');`)


		// write your code above this line
		const gender_count_sql = 'select count(*) from garment where gender = $1'
		const maleCount = await db.one(gender_count_sql, ['Male'], r => r.count);
		const femaleCount = await db.one(gender_count_sql, ['Female'], r => r.count);

		// went down 1 as the previous test is changing a male garment to a female one
		assert.equal(15, maleCount);
		assert.equal(16, femaleCount);
	});

	it('you should be group garments by gender and count them', async () => {

		// and below this line for this function will
		const garmentsGrouped = await db.many(`select gender, count(*) from garment group by gender`)
		// write your code above this line

		const expectedResult = [
			{
				count: '4',
				gender: 'Unisex'
			},
			{
				count: '16',
				gender: 'Female'
			},
			{
				count: '15',
				gender: 'Male'
			}
		]
		assert.deepStrictEqual(expectedResult, garmentsGrouped)
	});

	it('you should be able to remove all the Unisex garments', async () => {

		// and below this line for this function will
		const remove = await db.none(`delete from garment where gender = 'Unisex'`)
		// write your code above this line

		const gender_count_sql = 'select count(*) from garment where gender = $1'
		const unisexCount = await db.one(gender_count_sql, ['Unisex'], r => r.count);

		assert.equal(0, unisexCount)
	});



	after(async () => {
		db.$pool.end();
	});


}).timeout(5000);