import mongoose from "mongoose";

// Increase timeout for database operations
jest.setTimeout(30000);

// Connect to test database before all tests
beforeAll(async () => {
	const mongoUri = process.env.MONGO_URI_TEST ||
		"mongodb+srv://kegzpeach:hlHe8HN2m8TgOB1F@tangomanagement.ngouqxc.mongodb.net/tcms_project_test";

	if (mongoose.connection.readyState === 0) {
		await mongoose.connect(mongoUri);
	}
});

// Clean up database after each test
afterEach(async () => {
	if (mongoose.connection.readyState !== 0) {
		const collections = mongoose.connection.collections;
		for (const key in collections) {
			await collections[key].deleteMany({});
		}
	}
});

// Disconnect after all tests
afterAll(async () => {
	if (mongoose.connection.readyState !== 0) {
		await mongoose.connection.close();
	}
});
