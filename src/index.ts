/* eslint-disable @typescript-eslint/no-unused-vars */

import * as fs from "fs";
import * as path from "path";
import "dotenv/config";
import { getSwaggerJson, waitInfinity } from "./helpers";
import { apiv3SchemaToJson, generateModuleFile } from "./types";

const swaggerUrl =
  process.env.SWAGGER_URL || "http://localhost:8080/v3/api-docs";


async function main() {
  // Download the Swagger file
  const jsonApi = await getSwaggerJson(swaggerUrl);
  console.log("Swagger file downloaded");
  console.log(jsonApi);

  // Create gen folder in src folder
  const genFolder = path.join(__dirname, "gen");
  if (!fs.existsSync(genFolder)) {
    fs.mkdirSync(genFolder);
  }

  // Generate types for each schema
  if (jsonApi.components) {
    console.log("Found components in Swagger file, generating types...");
    const json = await apiv3SchemaToJson(jsonApi.components.schemas);
    console.log("Types tree generated");
    console.log(json);

    console.log("Generating types file...");
    const modulesFile = generateModuleFile(json);
    console.log("Types file generated");

    console.log("Trying to save types file...");
    const filePath = path.join(genFolder, "types.ts");
    // Remove existing file
    if (fs.existsSync(filePath)) {
      console.log(`Removing existing types file at ${filePath}`);
      fs.unlinkSync(filePath);
    }

    // Save the file
    console.log("Saving types file...");
    fs.writeFileSync(filePath, modulesFile);
    console.log(`Types file saved to ${filePath}`);
  }

  waitInfinity();
}

main();
