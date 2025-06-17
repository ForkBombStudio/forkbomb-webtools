"use client"

import React, { useState, useRef, useEffect } from "react"
import FileCard from "@/app/components/file-card"
import { motion } from "framer-motion"
import { ZipMessage } from "./zip-types"


export default function Zip() {

    const [showDone, setShowDone] = useState(false)
    const [outputFile, setOutputFile] = useState<Blob | null>(null)
    const [inputFiles, setInputFiles] = useState<FileSystemEntry[]>([])
    const workerRef = useRef<Worker | null>(null)

    /* File Drop Functionality */
    function handleFileDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault()
        const fileItems = Array.from(event.dataTransfer.items)
        const fileEntries = fileItems.filter(
            item => item.kind === "file"
            ).map(item => item.webkitGetAsEntry())
        if (fileEntries) 
            setInputFiles(inputFiles.concat((fileEntries as FileSystemEntry[])));
    }

    function handlePickFiles() {
        const input = document.createElement("input")
        document.body.appendChild(input)
        input.type = "file"
        input.click()
        document.body.removeChild(input)
    }

    function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault()
        event.dataTransfer.dropEffect = "copy" // Show copy cursor
    };

    function resetFiles() {
        setInputFiles([])
        setShowDone(false)
    }

    /* Mount Worker */
    useEffect(
        () => {
            const worker = new Worker(new URL("./zip.worker.ts", import.meta.url), { type: "module" })
            workerRef.current = worker

            worker.onmessage = (event) => {
                const outputMsg = event.data as ZipMessage
                if (outputMsg.type === "error") {
                    console.log("Failed")
                    return
                }

                const outputData = outputMsg.outputData as Blob;


                const url = URL.createObjectURL(outputData)
                const a = document.createElement("a")
                a.href = url
                a.download = "compressed_files.zip"
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                setShowDone(true)
            }

            return () => {
                if (workerRef.current) {
                    workerRef.current.terminate()
                }
            }
        }, 
        []
    )

    /* Function to compress files */
    async function compressFiles() {


        if (inputFiles.length <= 0) {
            window.alert("Error: No Selected Files")
            return
        }

        const filePaths = new Map<File, string>()
        
        // helper function to read entries from a directory reader
        function readEntriesWithPromise(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
            return new Promise((resolve, reject) => {
                reader.readEntries((entries) => {
                    if (entries.length === 0) {
                        resolve([]) // Resolve with an empty array if no entries
                    } else {
                        resolve(entries) // Resolve with the entries
                    }
                }, (error) => {
                    reject(error) // Reject the promise on error
                })
            })
        }

        // recursive helper funtion to build the fire path tree
        async function buildPathMap(entries: FileSystemEntry[], currentPath: string) {

            const promises = new Array<Promise<void>>();

            for (const entry of entries) {
                if (entry.isDirectory) {
                    const dir = entry as FileSystemDirectoryEntry
                    const newPath = `${currentPath}/${dir.name}`
                    const subEntries = await readEntriesWithPromise(dir.createReader())
                    await buildPathMap(subEntries, newPath)
                } else if (entry.isFile) {
                    const fileEntry = entry as FileSystemFileEntry
                    promises.push(
                        new Promise((resolve, reject) => {
                            fileEntry.file((file) => {
                                filePaths.set(file, `${currentPath}/${entry.name}`)
                                resolve()
                            })
                        })
                    )
                }
            }

            return Promise.all(promises)
        }

        // build the path tree map
        await buildPathMap(inputFiles, "")

        workerRef.current?.postMessage(
            {
                type: "input", 
                inputData: filePaths
            } as ZipMessage
        )

    }

    return (
        <>
            <div className="flex flex-col gap-4">

                { /* Drag and drop area */ }
                <div className="flex border-2 border-dashed border-gray-300 p-4 rounded-lg 
                items-center justify-center h-64 text-3xl flex-col gap-3" onDrop={handleFileDrop} onDragOver={handleDragOver}>
                    Drag and Drop OR
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg border-black text-xl border w-full md:w-[50%]"
                    onClick={handlePickFiles}>
                        Pick a File
                    </motion.button>
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg border-black text-xl border w-full md:w-[50%]">
                        Pick a Folder
                    </motion.button>
                </div>
                <div>
                    <h2 className="text-2xl">Selected Files</h2>
                    { /* File list */ }
                    <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                    overflow-y-auto max-h-24 md:max-h-64">
                        {
                            inputFiles.map((file, index) => {
                                return (
                                    <FileCard key={index} file={file.name} onDelete={
                                        () => {
                                            setInputFiles(inputFiles.filter((_, i) => i !== index));
                                        }
                                    }/>
                                )
                            })
                        }
                    </div>
                </div>

                { /* Compression button */ }
                <div className="flex flex-col sm:flex-row gap-2">
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-black text-white"
                    onClick={compressFiles}>
                        Start Compression
                    </motion.button>
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 border border-black rounded-lg bg-gray-0 text-black" 
                    onClick={resetFiles}>
                        Reset
                    </motion.button>
                </div>
            </div>
        </>
    )
}