export default function AuthTitle({ title, description}) {
    return (
        <div className="flex flex-col items-center">
            <h1 className="text-[2rem] font-bold text-text-title">{title}</h1>
            <p className="text-text-body text-center">{description}</p>
        </div>
    )
}