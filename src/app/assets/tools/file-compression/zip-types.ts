

export type ZipMessage = {
    type: "input" | "output" | "error"
    inputData?: Map<File, string>
    outputData?: Blob
}



