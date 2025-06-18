
import JSZip from "jszip"
import { ZipMessage } from "./zip-types"

async function zip(input: Map<string, Blob>): Promise<Blob> {

    const zip = new JSZip()

    function addFilesToZip(entries: Map<string, Blob>) {
        entries.forEach((file, path) => {
            zip.file(path, file)
        })
    }

    await addFilesToZip(input)
    return zip.generateAsync({ type: "blob" })

}

self.onmessage = function (event: MessageEvent<ZipMessage>) {

    const inputData = event.data;

    if (inputData.type !== "input") {
        self.postMessage(
            {
                type: "error"
            } as ZipMessage
        )
    }

    if (!inputData.inputData) {
        self.postMessage(
            {
                type: "error"
            } as ZipMessage
        )
    }

    zip(inputData.inputData as Map<string, Blob>).then(
        output => {
            const result: ZipMessage = {
                type: "output", 
                outputData: output
            }
            self.postMessage(result)
        }
    ).catch(
        err => {
            const result: ZipMessage = {
                type: "error"
            }
            self.postMessage(result)
        }
    )

}