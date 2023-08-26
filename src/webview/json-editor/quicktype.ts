import { InputData, jsonInputForTargetLanguage, quicktype, TargetLanguage } from "quicktype/dist/quicktype-core"

export async function quicktypeJSON (targetLanguage: string | TargetLanguage, typeName: string, jsonString: string) {
    const jsonInput = jsonInputForTargetLanguage(targetLanguage)
  
    // We could add multiple samples for the same desired
    // type, or many sources for other types. Here we're
    // just making one type from one piece of sample JSON.
    await jsonInput.addSource({
      name: typeName,
      samples: [jsonString]
    })
  
    const inputData = new InputData()
    inputData.addInput(jsonInput)
  
    return await quicktype({
      inputData,
      lang: targetLanguage
    })
  }
  
export const resetSchema = async (data: string, name: string) => {
  // 初始化schema然后保存
  const { lines: JsonSchema } = await quicktypeJSON(
    "json-schema",
    name,
    data
  )

  const schemaText = JsonSchema.join("\n")

  return {
    schemaText,
    schema: JSON.parse(schemaText)
  }
}