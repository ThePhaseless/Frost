import {
  appendToDeepestKey,
  connectTwoJsons,
  generateJsonFromString as generateJsonFromStrings,
} from "./helpers";
import { OpenAPIV3 } from "openapi-types";

export async function apiv3SchemaToJson(
  schemas: OpenAPIV3.ComponentsObject["schemas"]
) {
  let types = {};
  for (const schemaName in schemas as {
    [key: string]: OpenAPIV3.SchemaObject;
  }) {
    let json = generateJsonFromStrings(schemaName.split("."));
    json = appendToDeepestKey(json, "schema", schemas![schemaName]);
    types = connectTwoJsons(types, json);
  }
  return types;
}

export function generateModuleFile(json: { [key: string]: unknown }) {
  let fileContent = "";
  if (typeof json !== "object") {
    return fileContent;
  }
  for (const key in json) {
    if (key == "schema") {
      fileContent += generateClassFile(json);
      continue;
    }
    fileContent += `export namespace ${key} { \n`;
    fileContent += generateModuleFile(json[key] as { [key: string]: unknown });
    fileContent += "}\n";
  }
  return fileContent;
}

export function generateClassFile(json: { [key: string]: unknown }) {
  const fileContent = "";
  json = json["schema"] as { [key: string]: unknown };
  if (json == undefined) {
    return fileContent;
  }
  for (const key in json) {
    switch (key) {
      case "object":
        break;
      case "additionalProperties":
        break;
      case "properties":
        break;
      case "enum":
        break;
      default:
        console.log("Unknown key: " + json);
        continue;
    }
    break;
  }
  return fileContent;
}
