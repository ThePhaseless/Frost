import SwaggerParser from "@apidevtools/swagger-parser";
import axios from "axios";
import { OpenAPIV3 } from "openapi-types";
import * as fs from "fs";
import path from "path";

export async function getSwaggerJson(
  swaggerUrl: string
): Promise<OpenAPIV3.Document> {
  console.log("Downloading Swagger file...");
  const rawJson = await axios.get(swaggerUrl);
  console.log("Downloaded Swagger file");

  // Check Swagger json file
  console.log("Parsing Swagger file...");
  const api = await SwaggerParser.dereference(rawJson.data);

  console.log("Parsed Swagger file");

  // Save the Swagger file to disk
  const filePath = path.join(__dirname, "swagger.json");
  fs.writeFileSync(filePath, JSON.stringify(rawJson.data, null, 2));
  console.log(`Saving Swagger file to ${filePath}...`);

  if (api as OpenAPIV3.Document) {
    console.log("API is OpenAPIV3.Document");
    return api as OpenAPIV3.Document;
  }
  throw new Error("This API version is not supported");
}

export function connectTwoJsons(
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

export function generateJsonFromString(keys: string[]) {
  const mainJson = {} as { [key: string]: unknown };
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

export async function waitInfinity() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export function appendToDeepestKey(
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
  return json;
}
