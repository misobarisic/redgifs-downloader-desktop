export default function Input({label,value,placeholder,onInputHandler}) {
    return (
        <div>
            <label htmlFor="email" className="block text-lg font-medium text-gray-200">
                {label}
            </label>
            <div className="mt-1 px-2 text-gray-80">
                <input
                    value={value}
                    onInput={onInputHandler}
                    className="shadow-sm text-xl text-gray-800 px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder={placeholder}
                />
            </div>
        </div>
    )
}
