

export type ZipMessage = {
    type: "input" | "output" | "error" | "update"
    inputData?: Map<string, Blob>
    outputData?: Blob | number
}



