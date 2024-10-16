import axios from "axios";

interface SearchResponse {
	objects: Array<{
		package: {
			name: string;
		};
	}>;
}

async function fetchRandomPackages(count = 100): Promise<string[]> {
	try {
		const response = await axios.get<SearchResponse>(
			"https://registry.npmjs.org/-/v1/search",
			{
				params: {
					text: "node",
					size: count,
					from: Math.floor(Math.random() * 1000), // Add some randomness to the starting point
				},
			},
		);

		const packages = response.data.objects.map((obj) => obj.package.name);

		return packages;
	} catch (error) {
		console.error("Error fetching random packages:", error);
		return [];
	}
}

export default fetchRandomPackages;
