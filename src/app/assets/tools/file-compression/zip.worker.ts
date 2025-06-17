
import JSZip from "jszip"
import { ZipMessage } from "./zip-types"

async function zip(input: Map<File, string>): Promise<Blob> {

    const zip = new JSZip()

    function addFilesToZip(entries: Map<File, string>) {
        entries.forEach((path, entry) => {
            zip.file(path, entry)
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

    zip(inputData.inputData as Map<File, string>).then(
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
            self.postMessage(err)
        }
    )

}