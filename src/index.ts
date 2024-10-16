import { promises as fs } from "node:fs";
import axios from "axios";
import pMap from "p-map";
import pThrottle from "p-throttle";
import fetchRandomPackages from "./fetchRandomPackages";

async function findPackagesWithoutLicenseInPackageJson(
	packages: string[],
): Promise<string[]> {
	const result: string[] = [];

	const throttle = pThrottle({
		limit: 10,
		interval: 10000,
	});

	const checkPackage = throttle(async (pkg: string) => {
		try {
			const response = await axios.get(
				`https://registry.npmjs.org/${pkg}/latest`,
			);
			const data = response.data;

			if (!data.license) {
				result.push(pkg);
				console.log(`Package ${pkg} has no license in package.json.`);
			}
		} catch (error) {
			console.error(`Error fetching package ${pkg}:`, error.message);
		}
	});

	await pMap(packages, checkPackage, { concurrency: 10 });

	return result;
}

async function savePackagesToFile(packages: string[], filename: string) {
	try {
		await fs.writeFile(`./${filename}.txt`, packages.join("\n"), "utf8");
		console.log(`Saved ${packages.length} packages to ${filename}`);
	} catch (error) {
		console.error(`Error saving packages to file ${filename}:`, error);
	}
}

// Example usage
async function main() {
	try {
		const allPackagesWithoutLicense: string[] = [];

		for (let i = 0; i < 10; i++) {
			console.log(`Round ${i + 1} of 10`);
			const randomPackages = await fetchRandomPackages(100);
			console.log("Fetched random packages:", randomPackages);

			const packagesWithoutLicense =
				await findPackagesWithoutLicenseInPackageJson(randomPackages);
			console.log("Packages without license in package.json:");
			console.log(packagesWithoutLicense);

			allPackagesWithoutLicense.push(...packagesWithoutLicense);
		}

		if (allPackagesWithoutLicense.length > 0) {
			await savePackagesToFile(
				allPackagesWithoutLicense,
				"packages_without_license.txt",
			);
		} else {
			console.log("No packages found without license in package.json.");
		}
	} catch (error) {
		console.error("An error occurred:", error);
	}
}

main();
