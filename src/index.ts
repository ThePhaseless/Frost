/* eslint-disable @typescript-eslint/no-unused-vars */
import SwaggerParser from "@apidevtools/swagger-parser";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { OpenAPIV3 } from "openapi-types";
import "dotenv/config";

const swaggerUrl =
  process.env.SWAGGER_URL || "http://localhost:8080/v3/api-docs";
async function getSwaggerJson(): Promise<OpenAPIV3.Document> {
  console.log("Downloading Swagger file...");
  const rawJson = await axios.get(swaggerUrl);
  console.log("Downloaded Swagger file");

  // Save the Swagger file to disk
  const filePath = path.join(__dirname, "swagger.json");
  fs.writeFileSync(filePath, JSON.stringify(rawJson.data, null, 2));
  console.log(`Saving Swagger file to ${filePath}...`);

  // Check Swagger json file
  console.log("Parsing Swagger file...");
  const api = await SwaggerParser.validate(rawJson.data);
  console.log("Parsed Swagger file");

  if (api as OpenAPIV3.Document) {
    console.log("API is OpenAPIV3.Document");
    return api as OpenAPIV3.Document;
  }
  throw new Error("This API version is not supported");
}

async function generateTypes(schemas: OpenAPIV3.ComponentsObject["schemas"]) {
  let types = {};
  for (const schemaName in schemas as {
    [key: string]: OpenAPIV3.SchemaObject;
  }) {
    const schema = schemaName as string;
    let json = generateJsonFromString(schemaName);
    json = appendToDeepestKey(json, "schema", schemas![schemaName]);
    types = connectTwoJsons(types, json);
  }
  console.log(types);
}

function appendToDeepestKey(
  json: { [key: string]: unknown },
  key: string,
  value: unknown
): { [key: string]: unknown } {
  for (const k in json) {
    if (json[k] !== null) {
      appendToDeepestKey(json[k] as { [key: string]: unknown }, key, value);
    } else {
      json[k] = { [key]: value };
    }
    return json;
  }
  console.log(json);
  return json;
}

function connectTwoJsons(
  json1: { [key: string]: unknown },
  json2: { [key: string]: unknown }
) {
  for (const key in json2) {
    if (json1[key]) {
      if (typeof json1[key] === "object" && typeof json2[key] === "object") {
        connectTwoJsons(
          json1[key] as { [key: string]: unknown },
          json2[key] as { [key: string]: unknown }
        );
      }
    } else {
      json1[key] = json2[key];
    }
  }
  return json1;
}

function generateJsonFromString(jsonString: string) {
  const mainJson = {} as { [key: string]: unknown };
  const keys = jsonString.split(".");
  let currentJson = mainJson;
  for (let i = 0; i < keys.length; i++) {
    if (i === keys.length - 1) {
      currentJson[keys[i]] = null;
    } else {
      currentJson[keys[i]] = {};
      currentJson = currentJson[keys[i]] as { [key: string]: unknown };
    }
  }
  return mainJson;
}

async function main() {
  // Download the Swagger file
  const jsonApi = await getSwaggerJson();
  console.log("Swagger file downloaded");
  console.log(jsonApi);

  // Generate types for each schema
  if (!jsonApi.components) {
    console.error("No components in Swagger file");
    return;
  }
  if (jsonApi.components.schemas) {
    generateTypes(jsonApi.components.schemas);
  }

  // // Generate methods for each endpoint
  // if (jsonApi.paths) {
  //   const paths = jsonApi.paths;
  //   for (const path in paths) {
  //     for (const method in paths[path]) {
  //       console.log(`Generating method for ${method} ${path}...`);
  //     }
  //   }
  // }

  // Wait indefinitely
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

main();
