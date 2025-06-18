
export interface FileTreeItem {
    type: "file" | "dir"
    name: string
}

export interface FileTreeFile extends FileTreeItem{
    type: "file"
    data: Blob
}

export interface FileTreeDirectory extends FileTreeItem {
    type: "dir"
    children: FileTreeItem[]
}