
import JSZip from "jszip"
import React, { useState } from "react";
import FileCard from "@/app/components/file-card";


export default function Zip() {

    const [showDone, setShowDone] = useState(false);
    const [inputFiles, setInputFiles] = useState<File[]>([]);

    function handleFileDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        console.log("Files dropped:", files);
        setInputFiles(inputFiles.concat(files));
    }

    function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy"; // Show copy cursor
    };

    function resetFiles() {
        setInputFiles([]);
        setShowDone(false);
    }
    
    return (
        <>
            <div className="flex flex-col gap-4">
                { /* Drag and drop area */ }
                <div className="flex border-2 border-dashed border-gray-300 p-4 rounded-lg 
                items-center justify-center h-64 text-3xl" onDrop={handleFileDrop} onDragOver={handleDragOver}>
                    Drag and drop files here or click to upload
                </div>
                <div>
                    <h2 className="text-2xl">Selected Files</h2>
                    { /* File list */ }
                    <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                    overflow-y-auto max-h-24 md:max-h-64">
                        {
                            inputFiles.map((file, index) => {
                                return (
                                    <FileCard key={index} file={file} onDelete={
                                        () => {
                                            setInputFiles(inputFiles.filter((_, i) => i !== index));
                                        }
                                    }/>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button className="p-2 rounded-lg bg-black text-white">
                        Start Compression
                    </button>
                    <button className="p-2 border border-black rounded-lg bg-gray-0 text-black" 
                    onClick={resetFiles}>
                        Reset
                    </button>
                </div>
            </div>
        </>
    )
}