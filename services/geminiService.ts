import { GoogleGenAI, Type } from "@google/genai";
import type { ComparisonResult, Tool, SourcingInfo, SuggestedSubstitution, PurchasePlanItem, MaintenanceTask } from '../types';

let ai: GoogleGenAI | null = null;

function getAi(): GoogleGenAI {
    if (!ai) {
        if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
            console.error("Gemini API key is not configured. AI features will be disabled.");
            throw new Error("API Key is not configured.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}


/**
 * Cleans and parses a JSON string that might be wrapped in markdown or have other anomalies.
 * @param rawText The raw string response from the AI.
 * @returns The parsed JSON object.
 */
export function cleanAndParseJson<T>(rawText: string): T {
    // Remove markdown ```json ... ``` wrapper
    let textToParse = rawText.replace(/^```json\s*|```$/g, '');

    // Attempt to find the outermost JSON object or array
    const firstBracket = textToParse.indexOf('[');
    const firstBrace = textToParse.indexOf('{');
    const lastBracket = textToParse.lastIndexOf(']');
    const lastBrace = textToParse.lastIndexOf('}');

    let start = -1;
    let end = -1;

    if (firstBracket !== -1 && lastBracket !== -1 && (firstBracket < firstBrace || firstBrace === -1)) {
        start = firstBracket;
        end = lastBracket;
    } else if (firstBrace !== -1 && lastBrace !== -1) {
        start = firstBrace;
        end = lastBrace;
    }

    if (start !== -1 && end !== -1) {
        textToParse = textToParse.substring(start, end + 1);
    } else {
        console.error("Could not find a valid JSON object or array structure in the response string:", textToParse);
        throw new Error("Invalid JSON response: No JSON object/array found.");
    }
    
    // Heuristic check for truncation by validating brace/bracket balance
    const openBraces = (textToParse.match(/{/g) || []).length;
    const closeBraces = (textToParse.match(/}/g) || []).length;
    const openBrackets = (textToParse.match(/\[/g) || []).length;
    const closeBrackets = (textToParse.match(/]/g) || []).length;

    if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
        console.error("Truncated or malformed JSON detected due to unbalanced braces/brackets:", textToParse);
        throw new Error("Invalid JSON response: Potentially truncated or malformed.");
    }

    try {
        // A more robust way to remove trailing commas before parsing
        const cleanedForParsing = textToParse.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(cleanedForParsing) as T;
    } catch (e) {
        console.error("Failed to parse JSON from AI response:", e);
        console.error("Raw response text received from API:", rawText);
        console.error("Cleaned text that failed to parse:", textToParse);
        throw new Error(`Invalid JSON response format from AI. Error: ${(e as Error).message}`);
    }
}


const toolSchema = {
  type: Type.OBJECT,
  properties: {
    toolId: { type: Type.STRING, description: "The unique identifier for the tool, from the 'Name' column in the CSV (e.g., 'BJC-001')." },
    name: { type: Type.STRING, description: "The primary name of the tool, from the 'Description' column in the CSV." },
    description: { type: Type.STRING, description: "A brief description from the 'Details' column. If 'Details' is empty, use the value from 'Description'. Use 'N/A' if not provided." },
    manufacturer: { type: Type.STRING, description: "The manufacturer of the tool, from the 'Make' column. Use 'N/A' if not provided or unknown." },
    model: { type: Type.STRING, description: "The model of the tool. Should be 'N/A'." },
    partNumber: { type: Type.STRING, description: "The part number of the tool, from the 'Model' column in the CSV. Use 'N/A' if not provided or unknown." },
    serialNumber: { type: Type.STRING, description: "The serial number of the tool, from the 'Serial' column. Should be 'N/A' if not applicable." },
    calibrationStatus: { type: Type.STRING, description: "The derived calibration status ('Good', 'Needs Calibration', 'N/A')." },
    calibrationDueDays: { type: Type.NUMBER, description: "Days until calibration is due, from 'CalibrationDueDays' column. Can be null." },
    location: { type: Type.STRING, description: "The location code of the tool, extracted from the 'ToolRoom' column (e.g. 'BJC')." },
  },
  required: ['toolId', 'name', 'manufacturer', 'partNumber', 'serialNumber'],
};

const substitutionSchema = {
  type: Type.OBJECT,
  properties: {
    suggestedSubstitutions: {
      type: Type.ARRAY,
      description: "An optional list of potential substitutes for tools in the shortage list.",
      items: {
        type: Type.OBJECT,
        properties: {
          neededTool: { ...toolSchema, description: "The full tool object from the shortage list." },
          suggestedTool: { ...toolSchema, description: "The full tool object from the master inventory that is a potential substitute." },
          confidence: { type: Type.STRING, description: "A confidence level for the suggestion ('High', 'Medium', 'Low')." },
          reason: { type: Type.STRING, description: "A brief explanation for why this is a good substitution (e.g., 'Superseded part number', 'Equivalent functionality')." },
        },
        required: ['neededTool', 'suggestedTool', 'confidence', 'reason'],
      }
    }
  },
  required: ['suggestedSubstitutions'],
};

const csvSchema = {
  type: Type.OBJECT,
  properties: {
    tools: {
      type: Type.ARRAY,
      description: "A cleaned, alphabetized, and deduplicated list of tool objects extracted from the provided text.",
      items: toolSchema,
    },
  },
  required: ['tools'],
};

export async function processCsvInventory(csvContent: string): Promise<Tool[]> {
  const model = 'gemini-2.5-flash';
  
  const prompt = `You are an inventory data processing expert. Your task is to analyze the following text from a tool inventory CSV file and extract a clean list of tool objects.

  The CSV has many columns. Here are the important ones and how they map to the JSON output:
  - 'Name' column (e.g., "BJC-001") maps to 'toolId'.
  - 'Description' column (e.g., "Citation X Door Purge") maps to 'name'.
  - 'Details' column maps to 'description'. If 'Details' is empty, use the value from 'Description'.
  - 'Make' column maps to 'manufacturer'.
  - 'Model' column maps to 'partNumber'.
  - 'Serial' column maps to 'serialNumber'.
  - 'ToolRoom' column (e.g., "BJC Tool Room") maps to 'location'. Extract just the location code (e.g., "BJC").
  - 'CalibrationDueDays' column maps to 'calibrationDueDays'.
  - The 'model' field in the JSON should be set to "N/A".

  **Instructions:**
  1.  Identify the header row and map columns to the correct fields as specified above.
  2.  For each data row, create a JSON object.
  3.  Handle missing or ambiguous values by using the string "N/A" for string fields and null for number fields. This includes empty cells.
  4.  Derive 'calibrationStatus' from 'CalibrationDueDays'. If 'CalibrationDueDays' > 0, status is 'Good'. If 'CalibrationDueDays' <= 0, status is 'Needs Calibration'. If 'CalibrationDueDays' is empty or not a number, status is 'N/A'.
  5.  Clean the data: trim all whitespace. Standardize Part Numbers to be uppercase. Use Title Case for names and manufacturers.
  6.  If multiple rows have the exact same non-'N/A' serial number, process only the first one you encounter and ignore the duplicates.
  7.  Sort the final list of objects alphabetically by the 'name' field.
  
  **CRITICAL OUTPUT FORMAT:**
  Your response MUST be ONLY a single, raw JSON object that strictly matches the provided schema. Do not include any markdown (like \`\`\`json), text, greetings, or explanations.

  ---
  CSV CONTENT:
  ${csvContent}
  ---
  `;

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: csvSchema,
        temperature: 0.0,
      },
    });

    const parsed = cleanAndParseJson<{ tools: Tool[] }>(response.text);
    if (Array.isArray(parsed.tools)) {
        return parsed.tools;
    }
    throw new Error('Parsed JSON does not contain a "tools" array.');

  } catch (error) {
    console.error("Error calling Gemini API for CSV processing:", error);
    throw new Error("Failed to process the inventory file with the AI model.");
  }
}

export async function processNeededToolsCsv(csvContent: string): Promise<Tool[]> {
  const model = 'gemini-2.5-flash';
  
  const prompt = `You are an inventory data processing expert. Your task is to analyze the following text from a CSV file listing required tools and extract a clean list of tool objects. The list may contain other data, but you must only extract the tool information.

  The CSV should contain at least a Tool Name and a Part Number. Manufacturer is optional.

  **Instructions:**
  1.  Identify and extract data for each tool. Ignore header rows.
  2.  For each tool, create a JSON object with keys: "name", "manufacturer", "partNumber".
  3.  For the "serialNumber" field, always use the string "N/A" for these needed tool lists.
  4.  Handle missing or empty values for 'manufacturer' gracefully by using the string "N/A".
  5.  Clean the data: trim whitespace, and standardize Part Numbers to be uppercase.
  
  **CRITICAL OUTPUT FORMAT:**
  Your response MUST be ONLY a single, raw JSON object that strictly matches the provided schema. Do not include any markdown (like \`\`\`json), text, greetings, or explanations.

  ---
  CSV CONTENT:
  ${csvContent}
  ---
  `;

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: csvSchema,
        temperature: 0.0,
      },
    });

    const parsed = cleanAndParseJson<{ tools: Tool[] }>(response.text);
    if (Array.isArray(parsed.tools)) {
        return parsed.tools;
    }
    throw new Error('Parsed JSON does not contain a "tools" array for needed tools.');

  } catch (error) {
    console.error("Error calling Gemini API for needed tools CSV processing:", error);
    throw new Error("Failed to process the needed tools file with the AI model.");
  }
}

export async function compareInventories(masterInventory: Tool[], neededTools: Tool[], purchasePlan: PurchasePlanItem[]): Promise<ComparisonResult> {
  const masterPartNumberMap = new Map<string, Tool>();
  masterInventory.forEach(tool => {
    if (tool.partNumber && tool.partNumber !== 'N/A') {
      const partNumbers = tool.partNumber.split(',').map(pn => pn.trim().toUpperCase());
      partNumbers.forEach(pn => {
        if (pn) {
            masterPartNumberMap.set(pn, tool);
        }
      });
    }
  });
  
  const purchasePlanMap = new Map<string, PurchasePlanItem>();
    purchasePlan.forEach(item => {
        const partNumber = item.partNumber.split('(')[0].trim().toUpperCase();
        if (partNumber) {
            purchasePlanMap.set(partNumber, item);
        }
    });

  const available: Tool[] = [];
  const onOrder: Tool[] = [];
  const shortage: Tool[] = [];
  const neededToolsMap = new Map<string, Tool>();

  neededTools.forEach(tool => {
      const partNumber = (tool.partNumber?.split('(')[0] || '').trim().toUpperCase();
      if (partNumber && partNumber !== 'N/A') {
          if (!neededToolsMap.has(partNumber)) {
              neededToolsMap.set(partNumber, tool);
          }
      } else {
          const existing = masterInventory.find(t => t.name.toLowerCase() === tool.name.toLowerCase());
          if (existing) {
              available.push(existing);
          } else {
              shortage.push(tool);
          }
      }
  });

  for (const [partNumber, tool] of neededToolsMap.entries()) {
      if (masterPartNumberMap.has(partNumber)) {
          available.push(masterPartNumberMap.get(partNumber)!);
      } else if (purchasePlanMap.has(partNumber)) {
           const purchaseItem = purchasePlanMap.get(partNumber)!;
            const onOrderTool: Tool = {
                ...tool,
                name: purchaseItem.name,
                manufacturer: purchaseItem.manufacturer,
                quantity: purchaseItem.quantity,
                unitPrice: purchaseItem.unitPrice,
                totalPrice: purchaseItem.totalPrice,
                sourcingLink: purchaseItem.sourcingLink,
            };
            onOrder.push(onOrderTool);
      } else {
          shortage.push(tool);
      }
  }

  const suggestedSubstitutions = await findSubstitutions(shortage, masterInventory);

  return { available, onOrder, shortage, suggestedSubstitutions };
}


async function findSubstitutions(shortage: Tool[], masterInventory: Tool[]): Promise<SuggestedSubstitution[]> {
    if (shortage.length === 0) {
        return [];
    }

    const model = 'gemini-2.5-flash';

    const shortageKeywords = new Set<string>();
    shortage.forEach(tool => {
        tool.name.toLowerCase().split(/[\s-/()]+/).forEach(word => {
            if (word.length > 2 && !/\d/.test(word)) shortageKeywords.add(word);
        });
    });

    const relevantMasterTools = masterInventory.filter(masterTool => {
        if (shortage.some(s => s.manufacturer !== 'N/A' && s.manufacturer.toLowerCase() === masterTool.manufacturer.toLowerCase())) {
            return true;
        }
        const masterKeywords = new Set(masterTool.name.toLowerCase().split(/[\s-/()]+/).filter(w => w.length > 2));
        for (const keyword of shortageKeywords) {
            if (masterKeywords.has(keyword)) return true;
        }
        return false;
    }).slice(0, 250);

    const relevantInventoryString = JSON.stringify(relevantMasterTools);
    const shortageString = JSON.stringify(shortage);

    const prompt = `You are an Expert Tool Equivalency Database. Your task is to find potential substitutions for a list of missing tools ('SHORTAGE TOOLS') from a curated list of available tools ('RELEVANT MASTER INVENTORY').

  **Goal: Suggest Substitutions**
  1.  For each tool in 'SHORTAGE TOOLS', search the 'RELEVANT MASTER INVENTORY' to find a suitable substitute.
  2.  A good substitute has similar functionality. Pay close attention to part numbers.
      -   **High Confidence:** Part numbers are nearly identical, differing only by a suffix, prefix, or minor revision (e.g., 'CJMD8A27-003' vs 'CJMD8A27-004', '02-0526-0100' vs '02-0526-C0110').
      -   **Medium Confidence:** Names are very similar (e.g., 'Nose Jack' vs 'Nose Gear Jack') and manufacturers match, but part numbers differ.
      -   **Low Confidence:** Names are similar, but manufacturers are different.
  3.  For each valid substitution you identify, provide a clear 'reason'. Examples: "Superseded part number.", "Alternative part number for the same tool.", "Functionally equivalent jack from same manufacturer."
  4.  If no suitable substitute exists for a tool, DO NOT include it in the results.
  
  **CRITICAL OUTPUT FORMAT:**
  - Your response MUST be ONLY a single, raw JSON object that strictly matches the provided schema.
  - Do not include any markdown (like \`\`\`json\`), text, greetings, or explanations.
  - If no substitutions are found, return an object with an empty 'suggestedSubstitutions' array: \`{"suggestedSubstitutions": []}\`.

  ---
  RELEVANT MASTER INVENTORY:
  ${relevantInventoryString}
  ---
  SHORTAGE TOOLS:
  ${shortageString}
  ---
  `;

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: substitutionSchema,
                temperature: 0.1,
            },
        });

        const parsed = cleanAndParseJson<{ suggestedSubstitutions?: SuggestedSubstitution[] }>(response.text);
        return parsed.suggestedSubstitutions || [];
    } catch (error: any) {
        console.error("Error calling Gemini API for substitutions:", error);
        if (error.toString().includes('429') || (error.message && error.message.includes('RESOURCE_EXHAUSTED'))) {
            throw new Error("API rate limit exceeded while finding substitutions. Please wait a moment and try again.");
        }
        throw new Error("Failed to get tool substitutions from the AI model.");
    }
}


export async function getToolSourcingInfo(tool: Tool): Promise<SourcingInfo> {
    const model = 'gemini-2.5-flash';
    
    const prompt = `You are an expert procurement agent for specialized aviation maintenance tools. Your task is to use Google Search to find sourcing information for the following tool.

    **Tool to Source:**
    - Name: "${tool.name}"
    - Manufacturer: "${tool.manufacturer}"
    - Part Number: "${tool.partNumber}"

    **Instructions:**
    1.  **Prioritize Official Sources:** First, search for verified aviation distributors (e.g., Tronair, Textron Aviation Parts, Aircraft Spruce, SkyGeek, PilotJohn, AeroVal) or major electronics suppliers (e.g., Mouser, Digi-Key).
    2.  **Find Price:** Determine an estimated purchase price range in USD (e.g., "$500 - $600 USD"). If no price is listed, state "Price on Request". If the tool cannot be found for sale, state "Not Available for Purchase".
    3.  **Find Purchase Links:** Find up to THREE direct, working links to product pages where this tool can be purchased. For each, provide the 'url', 'sourceName', and current 'availability' (e.g., "In Stock", "Backordered", "Lead time: 2-3 weeks", "Check Website"). If no links are found, return an empty array.
    4.  **Find Rental Links:** Find up to TWO direct, working links where this tool can be rented. If none are found, return an empty array.
    5.  **Add Notes:** Provide brief, helpful "sourcingNotes". Mention if it's a legacy part, has been superseded by a new part number, or requires a special quote.
    6.  **Confidence Score:** Provide a 'confidence' level ('High', 'Medium', 'Low') based on how certain you are that the found links and prices are for the exact part number specified. 'High' confidence requires a direct match on a reputable distributor's site.
    
    **CRITICAL OUTPUT FORMAT:**
    - Your entire response MUST be a single, raw JSON object without any markdown formatting (like \`\`\`json\`), comments, or other text.
    - The response must be immediately parsable by \`JSON.parse()\`.
    - If you cannot find any information, return a JSON object with "Not Available" for price, empty arrays for links, and relevant notes.
    
    **Example of a perfect response:**
    {
      "estimatedPrice": "$4,724.12",
      "purchaseLinks": [
        { "url": "https://pilotjohn.com/new/tronair/02-0517c0140", "sourceName": "PilotJohn", "availability": "In Stock" },
        { "url": "https://www.tronair.com/products/02-0517c0140", "sourceName": "Tronair", "availability": "Contact for Lead Time" }
      ],
      "rentalLinks": [],
      "sourcingNotes": "This is a standard main jack for several Cessna Citation models.",
      "confidence": "High"
    }
    `;
    
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                temperature: 0.1,
            },
        });

        return cleanAndParseJson<SourcingInfo>(response.text);

    } catch (error: any) {
        console.error("Error calling Gemini API for sourcing info:", error);
        
        if (error.toString().includes('429') || (error.message && error.message.includes('RESOURCE_EXHAUSTED'))) {
            throw new Error("API rate limit exceeded. Please wait a moment and try again.");
        }
        if (error.message && error.message.includes('Invalid JSON')) {
            throw new Error('Invalid JSON response format from sourcing API.');
        }
        
        throw new Error("Failed to get sourcing information from the AI model.");
    }
}

const queryInventorySchema = {
    type: Type.OBJECT,
    properties: {
        matchingTools: {
            type: Type.ARRAY,
            description: "A list of tool objects from the master inventory that match the user's natural language query.",
            items: toolSchema,
        },
    },
    required: ['matchingTools'],
};

export async function queryInventory(query: string, inventory: Tool[]): Promise<Tool[]> {
  const model = 'gemini-2.5-flash';
  // Use a smaller, representative sample for the prompt context, but the AI will conceptually search the whole list.
  const inventorySample = inventory.length > 300 ? inventory.slice(0, 300) : inventory;
  const inventoryString = JSON.stringify(inventorySample);

  const prompt = `You are a sophisticated database query engine that understands natural language. Your task is to analyze a user's query and filter a master list of tools provided as a JSON array.

  **Instructions:**
  1.  Carefully read the user's query to understand their intent. The query may involve tool names, manufacturers, part numbers, or descriptive characteristics (e.g., "jacks under 10 tons", "all Tronair towbars", "battery chargers").
  2.  Scan the entire 'MASTER TOOL INVENTORY' provided below.
  3.  Identify all tool objects that accurately match the user's query. The match can be on any field (name, manufacturer, partNumber) and should interpret descriptive terms correctly.
  4.  Return a new JSON array containing ONLY the full tool objects that match the query.
  5.  **CRITICAL:** The structure of the returned tool objects must be identical to the structure in the master inventory. Do not add, remove, or alter any keys.
  6.  If no tools match the query, return an empty array.
  
  **CRITICAL OUTPUT FORMAT:**
  Your entire response must be ONLY the final JSON object that matches the provided schema. Do not include any explanations, greetings, or markdown formatting.

  ---
  USER QUERY:
  "${query}"
  ---
  MASTER TOOL INVENTORY:
  ${inventoryString}
  ---
  `;

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: queryInventorySchema,
        temperature: 0.0,
      },
    });

    const parsed = cleanAndParseJson<{ matchingTools: Tool[] }>(response.text);
    if (Array.isArray(parsed.matchingTools)) {
        return parsed.matchingTools;
    }
    throw new Error('Parsed JSON does not contain a "matchingTools" array.');

  } catch (error) {
    console.error("Error calling Gemini API for inventory query:", error);
    throw new Error("Failed to query inventory with the AI model.");
  }
}

const predictiveToolingSchema = {
    type: Type.OBJECT,
    properties: {
        tools: {
            type: Type.ARRAY,
            description: "A list of probable tool objects required for the described maintenance job.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The primary name of the tool." },
                    manufacturer: { type: Type.STRING, description: "The likely manufacturer. Use 'N/A' if unknown or generic." },
                    partNumber: { type: Type.STRING, description: "The likely part number. Use 'N/A' if not applicable." },
                    quantity: { type: Type.INTEGER, description: "The recommended quantity of this tool for the job." },
                    justification: { type: Type.STRING, description: "A brief reason why this tool is needed for the specified job." },
                    category: { 
                        type: Type.STRING, 
                        description: "A logical category for the tool from a predefined list." ,
                        enum: ["Jacking & Lifting", "Avionics Test Equipment", "Engine Maintenance", "Airframe & Rigging", "Hydraulics & Pneumatics", "General Support Equipment", "Uncategorized"]
                    }
                },
                required: ['name', 'manufacturer', 'partNumber', 'quantity', 'justification', 'category'],
            },
        },
    },
    required: ['tools'],
};


export async function predictToolsForJob(jobDescription: string): Promise<Tool[]> {
    const model = 'gemini-2.5-flash';

    const prompt = `You are an expert, FAA-certified aircraft mechanic with decades of experience on a wide range of general aviation and business jets, including Cessna, Bombardier, and Hawker models.

    Your task is to analyze the following maintenance job description and generate a probable list of specialized tools required to complete the job.

    **Instructions:**
    1.  Read the job description carefully to understand the aircraft model and the scope of work.
    2.  Generate a list of specialized tools. Do NOT include common hand tools like standard wrenches, sockets, or screwdrivers.
    3.  Focus on items like jacks, stands, specialized test equipment, rigging tools, and ground support equipment (GSE).
    4.  For each tool, provide a 'name', 'manufacturer', 'partNumber', a recommended 'quantity', a brief 'justification' explaining its use in this job, and a 'category'.
    5.  The 'category' must be one of: "Jacking & Lifting", "Avionics Test Equipment", "Engine Maintenance", "Airframe & Rigging", "Hydraulics & Pneumatics", "General Support Equipment", or "Uncategorized".
    6.  If a common manufacturer is known (e.g., Tronair), use it. Otherwise, use 'N/A'.
    7.  If a specific part number is common for this job, provide it. Otherwise, use 'N/A'.
    
    **CRITICAL OUTPUT FORMAT:**
    Your entire response MUST be a single, raw JSON object that strictly matches the provided schema. Do not include any other text, markdown, or explanations.

    ---
    MAINTENANCE JOB DESCRIPTION:
    "${jobDescription}"
    ---
    `;

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: predictiveToolingSchema,
                temperature: 0.3,
            },
        });

        const parsed = cleanAndParseJson<{ tools: { name: string; manufacturer: string; partNumber: string; category: string; }[] }>(response.text);
        
        if (Array.isArray(parsed.tools)) {
            // Add the missing serialNumber property
            return parsed.tools.map(tool => ({ ...tool, serialNumber: 'N/A' }));
        }
        throw new Error('Parsed JSON does not contain a "tools" array for prediction.');


    } catch (error) {
        console.error("Error calling Gemini API for tool prediction:", error);
        throw new Error("Failed to predict tools with the AI model.");
    }
}


const maintenanceAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        tasks: {
            type: Type.ARRAY,
            description: "A list of maintenance tasks derived from the work order.",
            items: {
                type: Type.OBJECT,
                properties: {
                    task: { type: Type.STRING, description: "A concise description of the maintenance task or step." },
                    toolPartNumbers: {
                        type: Type.ARRAY,
                        description: "A list of part numbers from the provided tool list that are required for this specific task.",
                        items: { type: Type.STRING }
                    }
                },
                required: ['task', 'toolPartNumbers'],
            }
        }
    },
    required: ['tasks']
}

export async function analyzeMaintenanceTasks(maintenanceEvent: string, toolList: Tool[]): Promise<any> {
    const model = 'gemini-2.5-pro'; // Using a more powerful model for this complex task.

    const toolListString = JSON.stringify(toolList.map(t => ({ name: t.name, partNumber: t.partNumber })));

    const prompt = `You are an expert aviation maintenance planner. Your task is to analyze a maintenance event title and a corresponding list of required tools, then break the event down into logical tasks and assign the necessary tools to each task.

    **Context:**
    -   **Maintenance Event:** "${maintenanceEvent}"
    -   **Provided Tool List (JSON):** ${toolListString}

    **Instructions:**
    1.  Based on the 'Maintenance Event' title (e.g., a work order number or inspection type), deduce the primary steps or tasks involved.
    2.  For each task you identify, create a concise description.
    3.  From the 'Provided Tool List', identify which specific tools (by their part number) are required for each task. A tool can be associated with multiple tasks.
    4.  Structure the output as a list of tasks, where each task object contains the task description and a list of the part numbers of the tools required for it.
    5.  If a tool from the list doesn't logically fit into any specific task you've identified, you may omit it from the task breakdown.
    
    **CRITICAL OUTPUT FORMAT:**
    - Your entire response MUST be a single, raw JSON object that strictly matches the provided schema.
    - Do not include any markdown (like \`\`\`json\`), text, greetings, or explanations.
    - For the 'toolPartNumbers' array, only include part numbers that exist in the 'Provided Tool List'.

    **Example Output Structure:**
    {
      "tasks": [
        {
          "task": "Prepare aircraft for jacking",
          "toolPartNumbers": ["03-5815-0000"]
        },
        {
          "task": "Perform pitot-static system leak check",
          "toolPartNumbers": ["6520", "P86892-4", "33410FFAB-125-4"]
        },
        {
          "task": "Service main landing gear struts",
          "toolPartNumbers": ["CJMDX12-001"]
        }
      ]
    }
    `;

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: maintenanceAnalysisSchema,
                temperature: 0.2,
            },
        });

        const parsed = cleanAndParseJson<{ tasks: { task: string, toolPartNumbers: string[] }[] }>(response.text);
        
        // Map part numbers back to full tool objects
        const toolMap = new Map(toolList.map(t => [t.partNumber, t]));
        const tasksWithTools: MaintenanceTask[] = parsed.tasks.map(task => ({
            task: task.task,
            tools: task.toolPartNumbers.map(pn => toolMap.get(pn)).filter((t): t is Tool => t !== undefined)
        }));
        
        return tasksWithTools;

    } catch (error) {
        console.error("Error calling Gemini API for maintenance analysis:", error);
        throw new Error("Failed to analyze maintenance event with the AI model.");
    }
}

const purchasePlanItemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "A unique identifier for the item, can be derived from the part number and a counter." },
        aircraft: { type: Type.STRING, description: "From the 'Aircraft Type' column." },
        itemType: { type: Type.STRING, description: "From the 'Type' column (e.g., 'Tool', 'Part', 'Consumable')." },
        name: { type: Type.STRING, description: "From the 'Description' column." },
        partNumber: { type: Type.STRING, description: "From the 'Part Number' column." },
        manufacturer: { type: Type.STRING, description: "From the 'Manufacture' column." },
        reason: { type: Type.STRING, description: "From the 'Need Type' column." },
        stage: { type: Type.STRING, description: "From the 'Priority' column." },
        unitPrice: { type: Type.STRING, description: "From the 'Price as Listed' column." },
        quantity: { type: Type.STRING, description: "From the 'Qty' column." },
        totalPrice: { type: Type.STRING, description: "From the 'Total Cost' column." },
        sourcingLink: { type: Type.STRING, description: "From the 'Web links' column." },
        requestId: { type: Type.STRING, description: "From the 'PO Number' column." },
        status: { type: Type.STRING, description: "From the 'Status' column." },
        notes: { type: Type.STRING, description: "From the 'Comments' column." },
        received: { type: Type.BOOLEAN, description: "Derived from the 'Recieved?' column. True if 'yes' or a date is present, otherwise false." },
    },
    required: ['id'],
};

const purchasePlanSchema = {
    type: Type.OBJECT,
    properties: {
        items: {
            type: Type.ARRAY,
            description: "A list of purchasing plan items extracted from the text.",
            items: purchasePlanItemSchema,
        },
    },
    required: ['items'],
};

export async function processPurchasePlanCsv(csvContent: string): Promise<PurchasePlanItem[]> {
    const model = 'gemini-2.5-flash';

    const prompt = `You are an expert data processor for an aviation maintenance company. Your task is to analyze the following tab-separated text from a purchasing plan file and convert it into a structured JSON array.

    The data has the following columns. Map them to the JSON fields as specified:
    - 'Aircraft Type' -> 'aircraft'
    - 'Type' -> 'itemType' (e.g., 'Tool', 'Part', 'Consumable')
    - 'Description' -> 'name'
    - 'Part Number' -> 'partNumber'
    - 'Manufacture' -> 'manufacturer'
    - 'Need Type' -> 'reason'
    - 'Priority' -> 'stage'
    - 'Price as Listed' -> 'unitPrice'
    - 'Qty' -> 'quantity'
    - 'Total Cost' -> 'totalPrice'
    - 'Web links' -> 'sourcingLink'
    - 'PO Number' -> 'requestId'
    - 'Status' -> 'status'
    - 'Comments' -> 'notes'
    - 'Recieved?' -> 'received' (boolean: true if 'yes' or a date is present, otherwise false)

    **Instructions:**
    1.  Parse each row of the tab-separated data, ignoring the header row.
    2.  Create a unique 'id' for each item. You can use the partNumber combined with the row index.
    3.  Clean the data: trim all whitespace from each field.
    4.  If a field is empty, represent it as an empty string ("").
    5.  Handle the 'received' field by converting values like 'yes' or any date into a boolean 'true'. Empty or other values should be 'false'.
    6.  Some rows might be empty or placeholders (e.g., "MRO Tooling Wishlist"). Filter these out. Only include rows that have at least a name or part number.
    7.  Process every row that contains meaningful data. Ensure the final output is a clean JSON array representing all valid items from the source file.

    **CRITICAL OUTPUT FORMAT:**
    Your response MUST be ONLY a single, raw JSON object that strictly matches the provided schema. Do not include any markdown (like \`\`\`json), text, greetings, or explanations.

    ---
    FILE CONTENT:
    ${csvContent}
    ---
    `;

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: purchasePlanSchema,
                temperature: 0.0,
            },
        });

        const parsed = cleanAndParseJson<{ items: PurchasePlanItem[] }>(response.text);
        if (Array.isArray(parsed.items)) {
            return parsed.items;
        }
        throw new Error('Parsed JSON does not contain an "items" array for the purchase plan.');

    } catch (error) {
        console.error("Error calling Gemini API for purchase plan CSV processing:", error);
        throw new Error("Failed to process the purchase plan file with the AI model.");
    }
}