"use client"

import React, { useState, useRef, useEffect } from "react"
import FileCard from "@/app/components/file-card"
import { motion } from "framer-motion"
import { ZipMessage } from "./zip-types"
import {
    FileTreeDirectory,
    FileTreeFile,
    fileTreeInsertItem,
    fileTreeRemoveItem,
} from "../../types/file-tree"

export default function Zip() {
    const inputTreeRef = useRef<FileTreeDirectory>({
        name: "root",
        type: "dir",
        children: [],
    })
    const [inputTreeRefresh, setInputTreeRefresh] = useState<number>(0)
    const workerRef = useRef<Worker | null>(null)
    const [isWorking, setIsWorking] = useState<boolean>(false)
    const [progress, setProgress] = useState<number>(0)

    /* File Drop Functionality */
    async function fileEntryToFiles(
        entries: FileSystemEntry[],
        currentPath: string = ""
    ) {
        const result = new Map<string, File>()
        const promises = new Array<Promise<void>>()

        for (const entry of entries) {
            if (entry.isFile) {
                const fileEntry = entry as FileSystemFileEntry
                promises.push(
                    new Promise((resolve, reject) => {
                        fileEntry.file((file) => {
                            result.set(`${currentPath}/${entry.name}`, file)
                            resolve()
                        }, reject)
                    })
                )
            } else if (entry.isDirectory) {
                const directoryEntry = entry as FileSystemDirectoryEntry
                promises.push(
                    new Promise((resolve, reject) => {
                        directoryEntry
                            .createReader()
                            .readEntries(async (data) => {
                                const subEntries = await fileEntryToFiles(
                                    data,
                                    `${currentPath}/${directoryEntry.name}`
                                )
                                for (const [path, file] of subEntries)
                                    result.set(path, file)
                                resolve()
                            }, reject)
                    })
                )
            }
        }
        await Promise.all(promises)
        return result
    }

    async function handleFileDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault()
        const fileItems = Array.from(event.dataTransfer.items)
        const fileEntries = fileItems
            .filter((item) => item.kind === "file")
            .map((item) => item.webkitGetAsEntry())
        if (fileEntries) {
            const files = await fileEntryToFiles(
                fileEntries as FileSystemEntry[]
            )
            for (const [path, file] of files) {
                fileTreeInsertItem(inputTreeRef.current, path.substring(1), {
                    type: "file",
                    name: file.name,
                    data: file,
                } as FileTreeFile)
            }
        }
    }

    function fileTreeHasItem(path: string): boolean {
        const pathList = path.split("/")
        let currentNode: FileTreeDirectory = inputTreeRef.current

        while (pathList.length > 1) {
            const targetFolder = pathList[0]
            const candidates = currentNode.children.filter((item) => {
                return item.name === targetFolder && item.type === "dir"
            })
            if (candidates.length > 0) {
                currentNode = candidates[0] as FileTreeDirectory
            } else {
                return false
            }
        }

        const candidates = currentNode.children.filter((item) => {
            return item.name === pathList[0]
        })
        return candidates.length > 0
    }

    function handlePickFiles() {
        const input = document.createElement("input")
        document.body.appendChild(input)
        input.type = "file"
        input.multiple = true
        input.style = "display: none;"
        input.onchange = function (event) {
            const element = event.target as HTMLInputElement

            if (element.files) {
                const inputFiles = element.files as FileList
                for (const file of inputFiles) {
                    const fileItem: FileTreeFile = {
                        type: "file",
                        name: fileTreeHasItem(file.name)
                            ? `${file.name}-${Date.now().toString(16)}`
                            : file.name,
                        data: file,
                    }
                    fileTreeInsertItem(inputTreeRef.current, "", fileItem)
                }
            }
            input.remove()
            setInputTreeRefresh(Math.random())
        }
        input.click()
    }

    function handlePickDirectories() {
        const input = document.createElement("input")
        document.body.appendChild(input)
        input.type = "file"
        input.multiple = true
        input.webkitdirectory = true
        input.style = "display: none;"
        input.onchange = function (event) {
            const element = event.target as HTMLInputElement

            if (element.files) {
                const inputFiles = element.files as FileList
                for (const file of inputFiles) {
                    const fileItem: FileTreeFile = {
                        type: "file",
                        name: file.name,
                        data: file,
                    }
                    fileTreeInsertItem(
                        inputTreeRef.current,
                        file.webkitRelativePath,
                        fileItem
                    )
                }
            }
            input.remove()
            setInputTreeRefresh(Math.random())
        }
        input.click()
    }

    function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault()
        event.dataTransfer.dropEffect = "copy" // Show copy cursor
    }

    function resetFiles() {
        inputTreeRef.current.children = []
        setInputTreeRefresh(Math.random())
    }

    /* Mount Worker */
    useEffect(() => {
        const worker = new Worker(new URL("./zip.worker.ts", import.meta.url), {
            type: "module",
        })
        workerRef.current = worker

        worker.onmessage = (event) => {
            const outputMsg = event.data as ZipMessage

            if (outputMsg.type === "update") {
                setProgress(outputMsg.outputData as number)
                return
            }

            if (outputMsg.type === "error") {
                console.log("Failed")
                return
            }

            const outputData = outputMsg.outputData as Blob

            const url = URL.createObjectURL(outputData)
            const a = document.createElement("a")
            a.href = url
            a.download = "compressed_files.zip"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            setIsWorking(false)
            setProgress(0)
            resetFiles()
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate()
            }
        }
    }, [])

    /* Function to compress files */
    async function compressFiles() {
        function buildFileMap(
            root: FileTreeDirectory,
            map: Map<string, Blob> = new Map(),
            path: string = ""
        ) {
            for (const child of root.children) {
                if (child.type === "dir") {
                    const subMap = buildFileMap(
                        child as FileTreeDirectory,
                        map,
                        path.concat(`${child.name}/`)
                    )
                    subMap.forEach((value, key) => {
                        map.set(key, value)
                    })
                } else if (child.type === "file") {
                    const file = child as FileTreeFile
                    map.set(`${path}${child.name}`, file.data)
                }
            }

            return map
        }

        if (inputTreeRef.current.children.length <= 0) {
            window.alert("Error: No Selected Files")
            return
        }

        workerRef.current?.postMessage({
            type: "input",
            inputData: buildFileMap(inputTreeRef.current),
        } as ZipMessage)

        setIsWorking(true)
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Drag and drop area */}
                <div
                    className="flex border-2 border-dashed border-gray-300 p-4 rounded-lg 
                items-center justify-center h-64 text-3xl flex-col gap-3"
                    onDrop={async (e) => {
                        await handleFileDrop(e)
                    }}
                    onDragOver={handleDragOver}
                >
                    Drag and Drop OR
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg border-black text-xl border w-full md:w-[50%]"
                        onClick={handlePickFiles}
                    >
                        Pick File(s)
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg border-black text-xl border w-full md:w-[50%]"
                        onClick={handlePickDirectories}
                    >
                        Pick a Folder
                    </motion.button>
                </div>
                <div>
                    <h2 className="text-2xl">Selected Files</h2>
                    {/* File list */}
                    <div
                        className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                    overflow-y-auto max-h-24 md:max-h-64"
                    >
                        {inputTreeRef.current.children.map((item, index) => {
                            return (
                                <FileCard
                                    key={index}
                                    file={item.name}
                                    onDelete={() => {
                                        fileTreeRemoveItem(
                                            inputTreeRef.current,
                                            item.name
                                        )
                                        setInputTreeRefresh(Math.random())
                                    }}
                                />
                            )
                        })}
                    </div>
                </div>

                {/* Compression button */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg bg-black text-white 
                        md:w-40"
                        onClick={compressFiles}
                        disabled={isWorking}
                    >
                        {isWorking
                            ? `${Number.parseInt(progress.toString())}%`
                            : "Start Compression"}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 border border-black rounded-lg bg-gray-0 text-black"
                        onClick={resetFiles}
                    >
                        Reset
                    </motion.button>
                </div>
            </div>
        </>
    )
}
