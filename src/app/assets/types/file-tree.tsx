export interface FileTreeItem {
    type: "file" | "dir"
    name: string
}

export interface FileTreeFile extends FileTreeItem {
    type: "file"
    data: Blob
}

export interface FileTreeDirectory extends FileTreeItem {
    type: "dir"
    children: FileTreeItem[]
}

export function fileTreeInsertItem(
    root: FileTreeDirectory,
    path: string,
    item: FileTreeItem
) {
    let pathList = path.split("/")
    let currentNode: FileTreeDirectory = root as FileTreeDirectory

    // navigate
    while (pathList.length > 1) {
        const targetFolder = pathList[0]
        const folderCandidates = currentNode.children.filter((item) => {
            return item.type === "dir" && item.name === targetFolder
        })

        if (folderCandidates.length > 0) {
            currentNode = folderCandidates[0] as FileTreeDirectory
        } else {
            currentNode.children.push({
                type: "dir",
                name: pathList[0],
                children: [],
            } as FileTreeDirectory)
            currentNode = currentNode.children[
                currentNode.children.length - 1
            ] as FileTreeDirectory
        }

        pathList = pathList.filter((_, index) => {
            return index !== 0
        })
    }

    currentNode.children.push(item)
    return root
}

export function fileTreeRemoveItem(root: FileTreeDirectory ,itemName: string) {

    let subItems = root.children
    subItems = subItems.filter((value) => {
        return value.name !== itemName
    })
    root.children = subItems
    return root
}
