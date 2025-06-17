
export default function FileCard({ file, onDelete }: { file: string, onDelete: () => void }) {
    return (
        <div className="flex flex-row border rounded p-1 justify-between">
            <p>{ file }</p>
            <button onClick={onDelete} className="text-red-500 hover:text-red-700">
                Delete
            </button>
        </div>
    )
}