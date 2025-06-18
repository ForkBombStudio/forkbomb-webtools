

export type ZipMessage = {
    type: "input" | "output" | "error"
    inputData?: Map<string, Blob>
    outputData?: Blob
}



